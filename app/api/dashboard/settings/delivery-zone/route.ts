import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminForApi } from "@/src/lib/auth-api";

const schema = z.object({
  zone_id: z.string().uuid(),
  fee_pesewas: z.number().int().min(0),
  is_active: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const supabase = await requireAdminForApi();
    const parsed = schema.parse(await request.json());
    const { error } = await supabase
      .from("delivery_zones")
      .update({
        fee_pesewas: parsed.fee_pesewas,
        is_active: parsed.is_active,
      })
      .eq("id", parsed.zone_id);

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
