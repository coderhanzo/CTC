import { NextResponse } from "next/server";
import { z } from "zod";

import { finalizeSuccessfulPayment } from "@/src/lib/order-service";

const querySchema = z.object({
  reference: z.string().min(5),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    reference: searchParams.get("reference"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  try {
    const order = await finalizeSuccessfulPayment(parsed.data.reference);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 400 },
    );
  }
}
