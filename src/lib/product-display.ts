import type { ProductVariant, StoreProduct } from "@/src/lib/types";

export function availableStock(variant: ProductVariant) {
  return Math.max(0, variant.stock_quantity - variant.reserved_quantity);
}

export function productImage(product: StoreProduct, fallback: string) {
  return product.featured_image_url || product.images[0]?.image_url || fallback;
}

export function firstAvailableVariant(product: StoreProduct) {
  return product.variants.find(
    (variant) => variant.is_active && availableStock(variant) > 0,
  );
}

export function productIsSoldOut(product: StoreProduct) {
  return !product.variants.some(
    (variant) => variant.is_active && availableStock(variant) > 0,
  );
}

export function productStockLabel(product: StoreProduct) {
  const available = product.variants
    .filter((variant) => variant.is_active)
    .reduce((sum, variant) => sum + availableStock(variant), 0);

  if (available <= 0) {
    return "Sold out";
  }

  if (available <= 5) {
    return `Only ${available} left`;
  }

  return "In stock";
}
