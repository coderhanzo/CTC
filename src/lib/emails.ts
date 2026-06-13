import "server-only";

import { brandFullName, supportEmail, supportPhone } from "@/src/lib/brand";
import { getRequiredEnv } from "@/src/lib/env";
import { formatPesewasToGHS } from "@/src/lib/money";
import { createResendClient } from "@/src/lib/resend";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

type EmailType = "receipt" | "owner_notification";

async function getOrderWithItems(orderId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found for email.");
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error("Order items not found for email.");
  }

  return { order, items: items ?? [] };
}

async function hasEmailLog(orderId: string, emailType: EmailType) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("email_logs")
    .select("id")
    .eq("order_id", orderId)
    .eq("email_type", emailType)
    .eq("status", "sent")
    .maybeSingle();

  return Boolean(data);
}

async function logEmailAttempt(input: {
  orderId: string;
  emailType: EmailType;
  recipient: string;
  status: "sent" | "failed";
  errorMessage?: string;
}) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("email_logs").insert({
    order_id: input.orderId,
    email_type: input.emailType,
    recipient: input.recipient,
    status: input.status,
    error_message: input.errorMessage ?? null,
    sent_at: input.status === "sent" ? new Date().toISOString() : null,
  });
}

function itemLines(items: Record<string, unknown>[]) {
  return items
    .map((item) => {
      const name = String(
        item.product_name ?? item.product_name_snapshot ?? "Item",
      );
      const size = String(item.variant_size ?? item.size_snapshot ?? "");
      const colorValue = item.variant_color ?? item.color_snapshot;
      const color = colorValue ? ` / ${String(colorValue)}` : "";
      const quantity = Number(item.quantity ?? 0);
      const lineTotal = formatPesewasToGHS(
        Number(item.line_total_pesewas ?? item.total_price_pesewas ?? 0),
      );

      return `<li>${name} (${size}${color}) x ${quantity} - ${lineTotal}</li>`;
    })
    .join("");
}

export async function sendCustomerReceiptEmail(orderId: string) {
  if (await hasEmailLog(orderId, "receipt")) {
    return;
  }

  const { order, items } = await getOrderWithItems(orderId);
  const recipient = String(order.customer_email);

  try {
    await createResendClient().emails.send({
      from: getRequiredEnv("RESEND_FROM_EMAIL"),
      to: recipient,
      subject: `${brandFullName} receipt ${order.order_number}`,
      html: `
        <h1>${brandFullName} order confirmed</h1>
        <p>Your CTC drop is locked in.</p>
        <p><strong>Order:</strong> ${order.order_number}</p>
        <p><strong>Name:</strong> ${order.customer_name}</p>
        <p><strong>Delivery:</strong> ${order.delivery_address}</p>
        <ul>${itemLines(items as Record<string, unknown>[])}</ul>
        <p>Subtotal: ${formatPesewasToGHS(order.subtotal_pesewas)}</p>
        <p>Delivery: ${formatPesewasToGHS(order.delivery_fee_pesewas)}</p>
        <p><strong>Total paid: ${formatPesewasToGHS(order.total_pesewas)}</strong></p>
        <p>Payment reference: ${order.paystack_reference}</p>
        <p>Support: ${supportEmail} / ${supportPhone}</p>
      `,
    });
    await logEmailAttempt({
      orderId,
      emailType: "receipt",
      recipient,
      status: "sent",
    });
  } catch (error) {
    await logEmailAttempt({
      orderId,
      emailType: "receipt",
      recipient,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

export async function sendOwnerOrderNotification(orderId: string) {
  if (await hasEmailLog(orderId, "owner_notification")) {
    return;
  }

  const { order, items } = await getOrderWithItems(orderId);
  const recipient = getRequiredEnv("OWNER_EMAIL");

  try {
    await createResendClient().emails.send({
      from: getRequiredEnv("RESEND_FROM_EMAIL"),
      to: recipient,
      subject: `New paid CTC order ${order.order_number}`,
      html: `
        <h1>New paid order</h1>
        <p><strong>Order:</strong> ${order.order_number}</p>
        <p><strong>Customer:</strong> ${order.customer_name}</p>
        <p><strong>Phone:</strong> ${order.customer_phone}</p>
        <p><strong>Email:</strong> ${order.customer_email}</p>
        <p><strong>Delivery:</strong> ${order.delivery_address}</p>
        <ul>${itemLines(items as Record<string, unknown>[])}</ul>
        <p><strong>Total: ${formatPesewasToGHS(order.total_pesewas)}</strong></p>
        <p>Payment reference: ${order.paystack_reference}</p>
      `,
    });
    await logEmailAttempt({
      orderId,
      emailType: "owner_notification",
      recipient,
      status: "sent",
    });
  } catch (error) {
    await logEmailAttempt({
      orderId,
      emailType: "owner_notification",
      recipient,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
