"use client";

import Image from "next/image";
import { useState } from "react";

import { MaterialIcon } from "@/src/components/material-icon";
import { formatPesewasToGHS } from "@/src/lib/money";
import {
  availableStock,
  firstAvailableVariant,
  productImage,
} from "@/src/lib/product-display";
import type { ProductVariant, StoreProduct } from "@/src/lib/types";

type QuickViewProps = {
  fallbackImage: string;
  onAdd: (
    product: StoreProduct,
    variant: ProductVariant,
    quantity: number,
  ) => void;
  onClose: () => void;
  product: StoreProduct;
};

export function QuickView({
  fallbackImage,
  onAdd,
  onClose,
  product,
}: QuickViewProps) {
  const defaultVariant = firstAvailableVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? product.variants[0]?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    defaultVariant ??
    product.variants[0];
  const stock = selectedVariant ? availableStock(selectedVariant) : 0;
  const isSoldOut = !selectedVariant || stock <= 0 || !selectedVariant.is_active;
  const stockMessage = isSoldOut
    ? "Sold out in this size"
    : stock <= 5
      ? `Only ${stock} left`
      : "In stock";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <section className="glass-card reveal relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] md:flex-row">
        <button
          aria-label="Close product quick view"
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-ctc-ink/60 text-ctc-cream transition hover:bg-ctc-pink hover:text-black"
          onClick={onClose}
          type="button"
        >
          <MaterialIcon className="text-2xl">close</MaterialIcon>
        </button>

        <div className="relative min-h-[340px] overflow-hidden bg-ctc-ink-deep p-8 md:w-1/2">
          <div className="mascot-halo absolute inset-x-10 bottom-10 top-20 -z-0 rounded-full opacity-60" />
          <Image
            alt={product.name}
            className="relative z-10 object-contain drop-shadow-2xl"
            fill
            sizes="(min-width: 768px) 45vw, 90vw"
            src={productImage(product, fallbackImage)}
          />
          <span className="drift-soft absolute left-6 top-6 z-20 rounded-full bg-ctc-pink px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-black glow-pink-soft">
            CTC Drop
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-between overflow-y-auto bg-ctc-card/40 p-8 md:p-10">
          <div>
            <p className="font-label text-xs uppercase tracking-[0.28em] text-ctc-pink">
              {product.category || "Apparel // Drop"}
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-ctc-cream md:text-5xl">
              {product.name}
            </h2>
            <p className="mt-3 font-label text-2xl text-ctc-pink">
              {formatPesewasToGHS(
                selectedVariant?.price_override_pesewas ??
                  product.base_price_pesewas,
              )}
            </p>
            <p className="mt-6 leading-7 text-ctc-cream/70">
              {product.description ||
                "Premium CTC streetwear engineered for the current drop."}
            </p>

            <div className="mt-8">
              <div className="mb-4 flex items-end justify-between">
                <span className="font-label text-xs uppercase tracking-wider text-ctc-cream">
                  Select Size
                </span>
                <span className="font-label text-xs text-ctc-cream/50 underline">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => {
                  const variantStock = availableStock(variant);
                  const unavailable = !variant.is_active || variantStock <= 0;
                  const selected = selectedVariantId === variant.id;

                  return (
                    <button
                      className={`grid min-h-12 min-w-12 place-items-center rounded-xl border px-3 font-label transition ${
                        selected
                          ? "border-ctc-pink bg-ctc-pink/15 text-ctc-cream glow-pink-soft"
                          : "border-ctc-cream/20 text-ctc-cream/70 hover:border-ctc-pink/60"
                      } ${unavailable ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                      disabled={unavailable}
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      type="button"
                    >
                      {variant.size}
                      {variant.color ? (
                        <span className="ml-1 text-[10px] opacity-70">
                          {variant.color}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <p
                className={`mt-4 flex items-center gap-2 font-label text-xs tracking-wider ${
                  isSoldOut || stock <= 5 ? "text-error" : "text-ctc-pink"
                }`}
              >
                <MaterialIcon className="text-sm" fill>
                  {isSoldOut ? "error" : "check_circle"}
                </MaterialIcon>
                {stockMessage}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="font-label text-sm text-ctc-cream/60">Qty</span>
                <button
                  className="grid size-9 place-items-center rounded-lg border border-ctc-cream/20 text-ctc-cream/70 disabled:opacity-40"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  <MaterialIcon className="text-sm">remove</MaterialIcon>
                </button>
                <span className="w-8 text-center font-label text-ctc-cream">
                  {quantity}
                </span>
                <button
                  className="grid size-9 place-items-center rounded-lg border border-ctc-cream/20 text-ctc-cream/70 disabled:opacity-40"
                  disabled={quantity >= stock}
                  onClick={() =>
                    setQuantity((value) => Math.min(stock, value + 1))
                  }
                  type="button"
                >
                  <MaterialIcon className="text-sm">add</MaterialIcon>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              className="btn-pink flex h-14 items-center justify-center gap-3 rounded-xl font-label text-sm font-bold uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSoldOut || !selectedVariant}
              onClick={() =>
                selectedVariant && onAdd(product, selectedVariant, quantity)
              }
              type="button"
            >
              <MaterialIcon className="text-lg" fill>
                shopping_cart
              </MaterialIcon>
              Add to Cart
            </button>
            <button
              className="h-14 rounded-xl border border-ctc-cream/20 font-label text-sm uppercase tracking-widest text-ctc-cream transition hover:border-ctc-pink/50 hover:bg-ctc-cream/5"
              type="button"
            >
              View Full Details
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
