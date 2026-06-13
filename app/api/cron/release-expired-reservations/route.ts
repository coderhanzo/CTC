import { NextResponse } from "next/server";

import { getOptionalEnv } from "@/src/lib/env";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export async function POST(request: Request) {
  const cronSecret = getOptionalEnv("CRON_SECRET");

  if (cronSecret) {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (token !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const supabase = createSupabaseAdminClient();
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id")
    .eq("payment_status", "pending")
    .eq("inventory_reserved", true)
    .lt("reservation_expires_at", new Date().toISOString());

  if (ordersError) {
    return NextResponse.json(
      { error: "Could not load expired reservations." },
      { status: 500 },
    );
  }

  for (const order of orders ?? []) {
    const { data: items } = await supabase
      .from("order_items")
      .select("variant_id,quantity")
      .eq("order_id", order.id);

    for (const item of items ?? []) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("reserved_quantity")
        .eq("id", item.variant_id)
        .single();

      if (variant) {
        await supabase
          .from("product_variants")
          .update({
            reserved_quantity: Math.max(
              0,
              Number(variant.reserved_quantity) - Number(item.quantity),
            ),
          })
          .eq("id", item.variant_id);
      }
    }

    await supabase
      .from("orders")
      .update({
        inventory_reserved: false,
        order_status: "cancelled",
        payment_status: "failed",
      })
      .eq("id", order.id);
  }

  return NextResponse.json({ released: orders?.length ?? 0 });
}
