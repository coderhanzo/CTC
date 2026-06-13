import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminForApi } from "@/src/lib/auth-api";

const schema = z.object({
  order_id: z.string().uuid(),
  order_status: z.enum(["pending", "processing", "delivered", "cancelled"]),
});

export async function POST(request: Request) {
  try {
    const supabase = await requireAdminForApi();
    const parsed = schema.parse(await request.json());
    const { error } = await supabase
      .from("orders")
      .update({ order_status: parsed.order_status })
      .eq("id", parsed.order_id);

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
