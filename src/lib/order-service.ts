import "server-only";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import {
  sendCustomerReceiptEmail,
  sendOwnerOrderNotification,
} from "@/src/lib/emails";
import { verifyPaystackTransaction } from "@/src/lib/paystack";
import type { SafeOrderConfirmation } from "@/src/lib/types";

export async function finalizeSuccessfulPayment(reference: string) {
  const supabase = createSupabaseAdminClient();
  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();

  if (paymentError || !payment) {
    throw new Error("Payment reference was not found.");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", payment.order_id)
    .single();

  if (orderError || !order) {
    throw new Error("Order was not found.");
  }

  if (
    order.payment_status === "paid" &&
    order.inventory_deducted === true
  ) {
    return safeOrder(order);
  }

  const verified = await verifyPaystackTransaction(reference);

  if (verified.status !== "success") {
    throw new Error("Paystack has not confirmed this payment.");
  }

  if (Number(verified.amount) !== Number(order.total_pesewas)) {
    throw new Error("Payment amount does not match the order total.");
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  if (itemsError) {
    throw new Error("Could not load order items for inventory deduction.");
  }

  if (!order.inventory_deducted) {
    for (const item of items ?? []) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("stock_quantity,reserved_quantity,sold_quantity")
        .eq("id", item.variant_id)
        .single();

      if (variantError || !variant) {
        throw new Error("Could not load product variant for inventory deduction.");
      }

      const quantity = Number(item.quantity);
      const { error: updateError } = await supabase
        .from("product_variants")
        .update({
          stock_quantity: Math.max(0, Number(variant.stock_quantity) - quantity),
          reserved_quantity: Math.max(
            0,
            Number(variant.reserved_quantity) - quantity,
          ),
          sold_quantity: Number(variant.sold_quantity ?? 0) + quantity,
        })
        .eq("id", item.variant_id);

      if (updateError) {
        throw new Error("Could not deduct inventory.");
      }
    }
  }

  const paidAt = verified.paid_at || new Date().toISOString();

  await supabase
    .from("payments")
    .update({
      status: "success",
      verified_at: paidAt,
      raw_response: verified,
    })
    .eq("id", payment.id);

  const { data: updatedOrder, error: updateOrderError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      order_status:
        order.order_status === "cancelled" ? "processing" : order.order_status,
      paid_at: paidAt,
      inventory_deducted: true,
      inventory_reserved: false,
    })
    .eq("id", order.id)
    .select("*")
    .single();

  if (updateOrderError || !updatedOrder) {
    throw new Error("Could not mark order as paid.");
  }

  await Promise.allSettled([
    sendCustomerReceiptEmail(order.id),
    sendOwnerOrderNotification(order.id),
  ]);

  return safeOrder(updatedOrder);
}

function safeOrder(order: Record<string, unknown>): SafeOrderConfirmation {
  return {
    order_number: String(order.order_number),
    total_pesewas: Number(order.total_pesewas),
    customer_email: String(order.customer_email),
    order_status: String(order.order_status) as SafeOrderConfirmation["order_status"],
    payment_status: String(
      order.payment_status,
    ) as SafeOrderConfirmation["payment_status"],
  };
}
