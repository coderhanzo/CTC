import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequiredEnv, isMissingRequiredEnvError } from "@/src/lib/env";
import { initializePaystackTransaction } from "@/src/lib/paystack";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;
type SupabaseQueryError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

const checkoutSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.email(),
  customer_phone: z.string().min(7),
  delivery_zone_id: z.string().uuid(),
  delivery_city: z.string().min(2),
  delivery_address: z.string().min(5),
  notes: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        variant_id: z.string().uuid(),
        quantity: z.number().int().positive().max(50),
      }),
    )
    .min(1),
});

function orderNumber() {
  return `CTC-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function paystackReference() {
  return `ctc_${Date.now()}_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

function logSupabaseQueryError(label: string, error: SupabaseQueryError | null) {
  if (!error) {
    return;
  }

  console.error(label, {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });
}

async function rollback(input: {
  supabase: SupabaseAdminClient;
  orderId?: string;
  paymentId?: string;
  reserved: { variantId: string; quantity: number }[];
}) {
  await Promise.all(
    input.reserved.map(async (reservation) => {
      const { data: variant } = await input.supabase
        .from("product_variants")
        .select("reserved_quantity")
        .eq("id", reservation.variantId)
        .single();

      if (!variant) {
        return;
      }

      await input.supabase
        .from("product_variants")
        .update({
          reserved_quantity: Math.max(
            0,
            Number(variant.reserved_quantity) - reservation.quantity,
          ),
        })
        .eq("id", reservation.variantId);
    }),
  );

  if (input.paymentId) {
    await input.supabase.from("payments").delete().eq("id", input.paymentId);
  }

  if (input.orderId) {
    await input.supabase
      .from("order_items")
      .delete()
      .eq("order_id", input.orderId);
    await input.supabase.from("orders").delete().eq("id", input.orderId);
  }
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const checkout = parsed.data;
  const reserved: { variantId: string; quantity: number }[] = [];
  let createdOrderId: string | undefined;
  let createdPaymentId: string | undefined;
  let supabase: SupabaseAdminClient | undefined;

  try {
    supabase = createSupabaseAdminClient();

    const productIds = [...new Set(checkout.items.map((item) => item.product_id))];
    const variantIds = [...new Set(checkout.items.map((item) => item.variant_id))];

    const [productsResult, variantsResult, deliveryZoneResult] =
      await Promise.all([
        supabase
          .from("products")
          .select("id,name,base_price_pesewas,status,featured_image_url")
          .in("id", productIds),
        supabase.from("product_variants").select("*").in("id", variantIds),
        supabase
          .from("delivery_zones")
          .select("id,name,fee_pesewas,is_active")
          .eq("id", checkout.delivery_zone_id)
          .single(),
      ]);

    if (productsResult.error || variantsResult.error || deliveryZoneResult.error) {
      logSupabaseQueryError("Checkout product validation failed.", productsResult.error);
      logSupabaseQueryError("Checkout variant validation failed.", variantsResult.error);
      logSupabaseQueryError(
        "Checkout delivery zone validation failed.",
        deliveryZoneResult.error,
      );

      throw new Error("Could not validate checkout data.");
    }

    const products = productsResult.data ?? [];
    const variants = variantsResult.data ?? [];
    const deliveryZone = deliveryZoneResult.data;

    if (!deliveryZone?.is_active) {
      throw new Error("Selected delivery zone is not available.");
    }

    const orderItems = checkout.items.map((requestedItem) => {
      const product = products.find(
        (candidate) => candidate.id === requestedItem.product_id,
      );
      const variant = variants.find(
        (candidate) => candidate.id === requestedItem.variant_id,
      );

      if (!product || product.status !== "active") {
        throw new Error("One or more products are no longer available.");
      }

      if (
        !variant ||
        variant.product_id !== product.id ||
        variant.is_active !== true
      ) {
        throw new Error("One or more selected sizes are unavailable.");
      }

      const available =
        Number(variant.stock_quantity) - Number(variant.reserved_quantity);

      if (requestedItem.quantity > available) {
        throw new Error(
          `${product.name} ${variant.size} has only ${Math.max(0, available)} left.`,
        );
      }

      const unitPrice =
        variant.price_override_pesewas ?? product.base_price_pesewas;

      return {
        product,
        variant,
        quantity: requestedItem.quantity,
        unitPrice,
        lineTotal: unitPrice * requestedItem.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryFee = Number(deliveryZone.fee_pesewas ?? 0);
    const total = subtotal + deliveryFee;
    const generatedOrderNumber = orderNumber();
    const reference = paystackReference();
    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: generatedOrderNumber,
        customer_name: checkout.customer_name,
        customer_email: checkout.customer_email,
        customer_phone: checkout.customer_phone,
        delivery_zone_id: checkout.delivery_zone_id,
        delivery_city: checkout.delivery_city,
        delivery_address: checkout.delivery_address,
        subtotal_pesewas: subtotal,
        delivery_fee_pesewas: deliveryFee,
        total_pesewas: total,
        payment_status: "pending",
        order_status: "pending",
        inventory_reserved: true,
        inventory_deducted: false,
        reservation_expires_at: reservationExpiresAt,
        paystack_reference: reference,
      })
      .select("id,order_number")
      .single();

    if (orderError || !order) {
      logSupabaseQueryError("Checkout order creation failed.", orderError);

      throw new Error("Could not create order.");
    }

    createdOrderId = order.id;

    const { error: orderItemsError } = await supabase.from("order_items").insert(
      orderItems.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant.id,
        product_name_snapshot: item.product.name,
        size_snapshot: item.variant.size,
        color_snapshot: item.variant.color ?? null,
        quantity: item.quantity,
        unit_price_pesewas: item.unitPrice,
        total_price_pesewas: item.lineTotal,
      })),
    );

    if (orderItemsError) {
      logSupabaseQueryError("Checkout order item creation failed.", orderItemsError);

      throw new Error("Could not create order items.");
    }

    for (const item of orderItems) {
      const newReservedQuantity =
        Number(item.variant.reserved_quantity) + item.quantity;
      const { error: reserveError } = await supabase
        .from("product_variants")
        .update({ reserved_quantity: newReservedQuantity })
        .eq("id", item.variant.id)
        .eq("reserved_quantity", item.variant.reserved_quantity);

      if (reserveError) {
        throw new Error("Could not reserve inventory.");
      }

      reserved.push({ variantId: item.variant.id, quantity: item.quantity });
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        provider: "paystack",
        reference,
        amount_pesewas: total,
        status: "pending",
      })
      .select("id")
      .single();

    if (paymentError || !payment) {
      logSupabaseQueryError("Checkout payment creation failed.", paymentError);

      throw new Error("Could not create payment.");
    }

    createdPaymentId = payment.id;

    // Paystack appends `reference` and `trxref` to this URL on redirect, so we
    // intentionally do NOT add `reference` ourselves — doing so produces a
    // duplicate query key that resolves to an array on the success page.
    const callbackUrl = `${getRequiredEnv(
      "NEXT_PUBLIC_SITE_URL",
    )}/payment/success`;
    const paystack = await initializePaystackTransaction({
      email: checkout.customer_email,
      amount: total,
      reference,
      callback_url: callbackUrl,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        customer_name: checkout.customer_name,
        customer_email: checkout.customer_email,
        customer_phone: checkout.customer_phone,
        delivery_address: checkout.delivery_address,
        item_summary: orderItems
          .map((item) => `${item.product.name} ${item.variant.size} x${item.quantity}`)
          .join(", "),
      },
    });

    return NextResponse.json({
      authorization_url: paystack.authorization_url,
      access_code: paystack.access_code,
      reference,
      order_number: order.order_number,
    });
  } catch (error) {
    if (supabase) {
      try {
        await rollback({
          supabase,
          orderId: createdOrderId,
          paymentId: createdPaymentId,
          reserved,
        });
      } catch (rollbackError) {
        console.error("Checkout rollback failed.", rollbackError);
      }
    }

    if (isMissingRequiredEnvError(error)) {
      console.error(error.message);

      return NextResponse.json(
        { error: "Checkout is not configured. Please contact support." },
        { status: 500 },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Checkout could not be completed.";

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 400 },
    );
  }
}
