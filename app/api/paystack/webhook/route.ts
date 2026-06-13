import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { getRequiredEnv } from "@/src/lib/env";
import { finalizeSuccessfulPayment } from "@/src/lib/order-service";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expectedSignature = crypto
    .createHmac("sha512", getRequiredEnv("PAYSTACK_SECRET_KEY"))
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    event?: string;
    data?: { reference?: string; id?: number | string };
  };
  const supabase = createSupabaseAdminClient();
  const reference =
    payload.data?.reference ??
    crypto.createHash("sha256").update(rawBody).digest("hex");

  const { data: existingEvents } = await supabase
    .from("webhook_events")
    .select("id,processed")
    .eq("provider", "paystack")
    .eq("event_type", payload.event)
    .eq("reference", reference)
    .limit(1);
  const existingEvent = existingEvents?.[0];

  if (existingEvent?.processed) {
    return NextResponse.json({ ok: true });
  }

  const { data: webhookEvent } = existingEvent
    ? { data: existingEvent }
    : await supabase
        .from("webhook_events")
        .insert({
          provider: "paystack",
          event_type: payload.event,
          reference,
          payload,
        })
        .select("id")
        .single();

  if (payload.event === "charge.success" && payload.data?.reference) {
    try {
      await finalizeSuccessfulPayment(payload.data.reference);
      if (webhookEvent?.id) {
        await supabase
          .from("webhook_events")
          .update({ processed: true })
          .eq("id", webhookEvent.id);
      }
    } catch (error) {
      console.error(
        "Paystack webhook processing failed.",
        error instanceof Error ? error.message : error,
      );
      return NextResponse.json({ ok: true });
    }
  }

  return NextResponse.json({ ok: true });
}
