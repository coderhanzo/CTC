import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminForApi } from "@/src/lib/auth-api";

const schema = z.object({
  variant_id: z.string().uuid(),
  stock_quantity: z.number().int().min(0).max(50),
  low_stock_threshold: z.number().int().min(0).max(50),
  is_active: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const supabase = await requireAdminForApi();
    const parsed = schema.parse(await request.json());
    const { error } = await supabase
      .from("product_variants")
      .update({
        stock_quantity: parsed.stock_quantity,
        low_stock_threshold: parsed.low_stock_threshold,
        is_active: parsed.is_active,
      })
      .eq("id", parsed.variant_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}
