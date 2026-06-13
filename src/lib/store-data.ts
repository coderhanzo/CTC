import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getOptionalEnv } from "@/src/lib/env";
import type {
  DeliveryZone,
  ProductImage,
  ProductVariant,
  StoreProduct,
} from "@/src/lib/types";

const emptyStoreData = {
  products: [] as StoreProduct[],
  deliveryZones: [] as DeliveryZone[],
};

function createPublicStoreClient() {
  const supabaseUrl = getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  const publishableKey = getOptionalEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !publishableKey) {
    return null;
  }

  return createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function logStoreDataError(
  label: string,
  error: {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null,
) {
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

function normalizeImage(row: Record<string, unknown>): ProductImage {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    image_url: String(row.image_url ?? row.url ?? row.public_url ?? ""),
    alt_text: row.alt_text ? String(row.alt_text) : null,
    sort_order: Number(row.sort_order ?? row.position ?? 0),
    is_featured: Boolean(row.is_featured ?? row.featured ?? false),
  };
}

function normalizeVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    size: String(row.size ?? ""),
    color: row.color ? String(row.color) : null,
    stock_quantity: Number(row.stock_quantity ?? 0),
    reserved_quantity: Number(row.reserved_quantity ?? 0),
    sold_quantity: Number(row.sold_quantity ?? 0),
    low_stock_threshold: Number(row.low_stock_threshold ?? 5),
    is_active: Boolean(row.is_active ?? true),
    price_override_pesewas:
      row.price_override_pesewas === null ||
      row.price_override_pesewas === undefined
        ? null
        : Number(row.price_override_pesewas),
  };
}

export async function getPublicStoreData() {
  const supabase = createPublicStoreClient();

  if (!supabase) {
    return emptyStoreData;
  }

  const [
    productsResult,
    imagesResult,
    variantsResult,
    deliveryZonesResult,
  ] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id,name,slug,description,category,base_price_pesewas,status,featured_image_url",
      )
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("product_images")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_variants")
      .select("*")
      .eq("is_active", true)
      .order("size", { ascending: true }),
    supabase
      .from("delivery_zones")
      .select("id,name,fee_pesewas,is_active")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  if (productsResult.error) {
    logStoreDataError("Failed to load products", productsResult.error);
    return emptyStoreData;
  }

  if (imagesResult.error) {
    logStoreDataError("Failed to load product images", imagesResult.error);
  }

  if (variantsResult.error) {
    logStoreDataError("Failed to load product variants", variantsResult.error);
  }

  if (deliveryZonesResult.error) {
    logStoreDataError("Failed to load delivery zones", deliveryZonesResult.error);
  }

  const images = (imagesResult.data ?? []).map((row) =>
    normalizeImage(row as Record<string, unknown>),
  );
  const variants = (variantsResult.data ?? []).map((row) =>
    normalizeVariant(row as Record<string, unknown>),
  );

  const products = (productsResult.data ?? []).map((product) => {
    const productImages = images.filter((image) => image.product_id === product.id);
    const featuredImage =
      product.featured_image_url ||
      productImages.find((image) => image.is_featured)?.image_url ||
      productImages[0]?.image_url ||
      null;

    return {
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      base_price_pesewas: product.base_price_pesewas,
      status: product.status,
      featured_image_url: featuredImage,
      images: productImages,
      variants: variants.filter((variant) => variant.product_id === product.id),
    } satisfies StoreProduct;
  });

  return {
    products,
    deliveryZones: (deliveryZonesResult.data ?? []).map((zone) => ({
      id: String(zone.id),
      name: String(zone.name),
      city: null,
      fee_pesewas: Number(zone.fee_pesewas ?? 0),
      is_active: Boolean(zone.is_active),
    })) satisfies DeliveryZone[],
  };
}
