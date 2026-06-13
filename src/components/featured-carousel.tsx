"use client";

import Image from "next/image";
import { useRef } from "react";

import { MaterialIcon } from "@/src/components/material-icon";
import { formatPesewasToGHS } from "@/src/lib/money";
import {
  firstAvailableVariant,
  productImage,
  productIsSoldOut,
  productStockLabel,
} from "@/src/lib/product-display";
import type { ProductVariant, StoreProduct } from "@/src/lib/types";

type FeaturedCarouselProps = {
  products: StoreProduct[];
  fallbackImage: string;
  onQuickView: (product: StoreProduct) => void;
  onQuickAdd: (product: StoreProduct, variant: ProductVariant) => void;
};

export function FeaturedCarousel({
  products,
  fallbackImage,
  onQuickAdd,
  onQuickView,
}: FeaturedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-label text-xs uppercase tracking-[0.3em] text-ctc-pink">
            Codekeeper Picks
          </p>
          <h2 className="mt-2 font-display text-4xl font-bold text-ctc-cream md:text-5xl">
            Featured Drop
          </h2>
        </div>
        <div className="hidden gap-3 md:flex">
          <button
            aria-label="Previous products"
            className="hover-glow grid size-12 place-items-center rounded-full border border-ctc-cream/15 bg-ctc-ink/40 text-ctc-cream transition hover:border-ctc-pink hover:text-ctc-pink"
            onClick={() => scrollByCards(-1)}
            type="button"
          >
            <MaterialIcon>chevron_left</MaterialIcon>
          </button>
          <button
            aria-label="Next products"
            className="hover-glow grid size-12 place-items-center rounded-full border border-ctc-cream/15 bg-ctc-ink/40 text-ctc-cream transition hover:border-ctc-pink hover:text-ctc-pink"
            onClick={() => scrollByCards(1)}
            type="button"
          >
            <MaterialIcon>chevron_right</MaterialIcon>
          </button>
        </div>
      </div>

      <div
        className="carousel-track -mx-1 flex gap-6 overflow-x-auto px-1 pb-4"
        ref={trackRef}
      >
        {products.map((product) => {
          const soldOut = productIsSoldOut(product);
          const sizes = product.variants
            .filter((variant) => variant.is_active)
            .map((variant) => variant.size);
          const addable = firstAvailableVariant(product);

          return (
            <article
              className="carousel-item group relative w-[78%] shrink-0 sm:w-[46%] lg:w-[31%]"
              data-card
              key={product.id}
            >
              <div className="hover-glow overflow-hidden rounded-[1.75rem] border border-ctc-cream/10 bg-ctc-card/50">
                <button
                  aria-label={`Quick view ${product.name}`}
                  className="relative block aspect-[4/5] w-full overflow-hidden bg-ctc-ink-deep"
                  onClick={() => onQuickView(product)}
                  type="button"
                >
                  <Image
                    alt={product.name}
                    className="object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 46vw, 78vw"
                    src={productImage(product, fallbackImage)}
                  />
                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider ${
                      soldOut
                        ? "bg-ctc-ink/80 text-ctc-cream/70"
                        : "bg-ctc-pink text-black glow-pink-soft"
                    }`}
                  >
                    {productStockLabel(product)}
                  </span>
                  <span className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-center gap-2 rounded-full bg-ctc-ink/70 py-2 font-label text-[11px] uppercase tracking-widest text-ctc-cream opacity-0 backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <MaterialIcon className="text-sm">
                      visibility
                    </MaterialIcon>
                    Quick View
                  </span>
                </button>

                <div className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-label text-sm uppercase tracking-wider text-ctc-cream">
                      {product.name}
                    </h3>
                    <p className="shrink-0 font-label text-sm text-ctc-pink">
                      {formatPesewasToGHS(product.base_price_pesewas)}
                    </p>
                  </div>

                  {sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {sizes.slice(0, 5).map((size) => (
                        <span
                          className="rounded-md border border-ctc-cream/15 px-2 py-0.5 font-label text-[10px] uppercase text-ctc-cream/60"
                          key={size}
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-1 flex items-center gap-2">
                    <button
                      className="flex-1 rounded-xl border border-ctc-cream/15 py-2.5 font-label text-[11px] uppercase tracking-widest text-ctc-cream transition hover:border-ctc-pink/60 hover:text-ctc-pink"
                      onClick={() => onQuickView(product)}
                      type="button"
                    >
                      Details
                    </button>
                    <button
                      aria-label={`Add ${product.name} to cart`}
                      className="btn-pink grid size-11 shrink-0 place-items-center rounded-xl disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={soldOut || !addable}
                      onClick={() => addable && onQuickAdd(product, addable)}
                      type="button"
                    >
                      <MaterialIcon className="text-lg">add</MaterialIcon>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-3 md:hidden">
        <button
          aria-label="Previous products"
          className="grid size-11 place-items-center rounded-full border border-ctc-cream/15 bg-ctc-ink/40 text-ctc-cream"
          onClick={() => scrollByCards(-1)}
          type="button"
        >
          <MaterialIcon>chevron_left</MaterialIcon>
        </button>
        <button
          aria-label="Next products"
          className="grid size-11 place-items-center rounded-full border border-ctc-cream/15 bg-ctc-ink/40 text-ctc-cream"
          onClick={() => scrollByCards(1)}
          type="button"
        >
          <MaterialIcon>chevron_right</MaterialIcon>
        </button>
      </div>
    </div>
  );
}
