import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminForApi } from "@/src/lib/auth-api";
import { getOptionalEnv } from "@/src/lib/env";
import { ghsToPesewas } from "@/src/lib/money";

const schema = z.object({
  product_id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  base_price_ghs: z.string().min(1),
  status: z.enum(["active", "draft", "archived"]),
});

const defaultProductImageBucket = "Example storage";

export async function POST(request: Request) {
  try {
    const supabase = await requireAdminForApi();
    const formData = await request.formData();
    const parsed = schema.parse(Object.fromEntries(formData));
    const image = formData.get("image");
    let featuredImageUrl: string | undefined;

    if (image instanceof File && image.size > 0) {
      const bucket =
        getOptionalEnv("PRODUCT_IMAGE_BUCKET") ||
        getOptionalEnv("NEXT_PUBLIC_PRODUCT_IMAGE_BUCKET") ||
        defaultProductImageBucket;
      const path = `${parsed.slug}/${crypto.randomUUID()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, image, { upsert: false });

      if (uploadError) {
        if (uploadError.message.toLowerCase().includes("bucket not found")) {
          throw new Error(
            `Product image bucket "${bucket}" was not found. Create it in Supabase Storage or set PRODUCT_IMAGE_BUCKET to an existing bucket.`,
          );
        }

        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      featuredImageUrl = data.publicUrl;
    }

    const productPayload = {
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description ?? null,
      category: parsed.category ?? null,
      base_price_pesewas: ghsToPesewas(parsed.base_price_ghs),
      status: parsed.status,
      ...(featuredImageUrl ? { featured_image_url: featuredImageUrl } : {}),
    };

    const productId = parsed.product_id || undefined;
    const productResult = productId
      ? await supabase.from("products").update(productPayload).eq("id", productId).select("id").single()
      : await supabase.from("products").insert(productPayload).select("id").single();

    if (productResult.error || !productResult.data) {
      throw productResult.error ?? new Error("Could not save product.");
    }

    if (featuredImageUrl) {
      await supabase.from("product_images").insert({
        product_id: productResult.data.id,
        image_url: featuredImageUrl,
        alt_text: parsed.name,
        is_featured: true,
        sort_order: 0,
      });
    }

    return NextResponse.json({ ok: true, product_id: productResult.data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Product save failed." },
      { status: 400 },
    );
  }
}
