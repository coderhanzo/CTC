"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CartDrawer } from "@/src/components/cart-drawer";
import { FeaturedCarousel } from "@/src/components/featured-carousel";
import { MaterialIcon } from "@/src/components/material-icon";
import { QuickView } from "@/src/components/quick-view";
import { setStoredCart, useCart } from "@/src/components/use-cart";
import { formatPesewasToGHS } from "@/src/lib/money";
import {
  firstAvailableVariant,
  productImage,
  productIsSoldOut,
} from "@/src/lib/product-display";
import type { CartItem, ProductVariant, StoreProduct } from "@/src/lib/types";

type StorefrontProps = {
  brandFullName: string;
  brandName: string;
  deliveryNote: string;
  mascotCloseupUrl: string;
  mascotHeroUrl: string;
  mascotTransparentUrl: string | null;
  products: StoreProduct[];
};

const NAV_LINKS = [
  ["Drop", "#featured"],
  ["Shop", "#shop"],
  ["Mascot", "#codekeeper"],
  ["Delivery", "#delivery"],
  ["Contact", "#contact"],
] as const;

const NAV_ICONS: Record<(typeof NAV_LINKS)[number][0], string> = {
  Drop: "bolt",
  Shop: "shopping_bag",
  Mascot: "face",
  Delivery: "local_shipping",
  Contact: "alternate_email",
};

const HERO_CHIPS = [
  ["bolt", "Limited Drop"],
  ["local_shipping", "Accra Delivery"],
  ["mail", "Receipt by Email"],
  ["inventory_2", "Size-Based Stock"],
] as const;

const FEATURES = [
  ["bolt", "Limited Drops", "Numbered releases, never restocked."],
  ["inventory_2", "Variant Stock", "Live size-level availability."],
  ["local_shipping", "Accra Delivery", "Fast hand-off across the city."],
  ["mail", "Email Receipt", "Instant confirmation in your inbox."],
] as const;

const TRAITS = ["Mischievous", "Bold", "Unfiltered"] as const;

export function Storefront({
  brandFullName,
  brandName,
  deliveryNote,
  mascotCloseupUrl,
  mascotHeroUrl,
  mascotTransparentUrl,
  products,
}: StorefrontProps) {
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(
    null,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cart = useCart();

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.unit_price_pesewas * item.quantity,
        0,
      ),
    [cart],
  );
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const recommended = useMemo(() => products.slice(0, 3), [products]);

  function addToCart(
    product: StoreProduct,
    variant: ProductVariant,
    quantity: number,
  ) {
    const item: CartItem = {
      product_id: product.id,
      variant_id: variant.id,
      name: product.name,
      image: productImage(product, mascotHeroUrl),
      selected_size: variant.size,
      selected_color: variant.color,
      quantity,
      unit_price_pesewas:
        variant.price_override_pesewas ?? product.base_price_pesewas,
    };

    setStoredCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem.variant_id === item.variant_id,
      );

      if (!existingItem) {
        return [...currentCart, item];
      }

      return currentCart.map((cartItem) =>
        cartItem.variant_id === item.variant_id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem,
      );
    });
    setSelectedProduct(null);
    setIsCartOpen(true);
  }

  // Direct add for carousel / shop "+" buttons. Falls back to quick view when a
  // size choice is required so variant + inventory checks are never bypassed.
  function quickAdd(product: StoreProduct, variant: ProductVariant) {
    addToCart(product, variant, 1);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ctc-ink text-ctc-cream">
      <div className="pointer-events-none absolute left-[-10%] top-[-5%] -z-0 size-[520px] rounded-full bg-ctc-plum/30 blur-[140px]" />
      <div className="pointer-events-none absolute right-[-8%] top-[30%] -z-0 size-[480px] rounded-full bg-ctc-pink/15 blur-[160px]" />

      {/* ===== Pill navigation ===== */}
      <header className="sticky top-0 z-50 px-3 pt-4 md:px-6">
        <nav className="pill-nav mx-auto flex max-w-[1280px] items-center justify-between rounded-full px-4 py-3 md:px-6">
          <button
            aria-label="Toggle menu"
            className="grid size-10 place-items-center rounded-full text-ctc-cream/80 transition hover:text-ctc-pink md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            <MaterialIcon>{isMenuOpen ? "close" : "menu"}</MaterialIcon>
          </button>

          <Link
            className="font-display text-2xl font-black tracking-tight text-ctc-cream md:text-3xl"
            href="/"
          >
            {brandName}
            <span className="ml-1 text-ctc-pink">.</span>
          </Link>

          <div className="hidden items-center gap-7 font-label text-xs uppercase tracking-[0.18em] md:flex">
            {NAV_LINKS.map(([label, href]) => (
              <a
                className="text-ctc-cream/70 transition hover:text-ctc-pink"
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label="Open cart"
              className="relative grid size-10 place-items-center rounded-full text-ctc-cream/80 transition hover:bg-ctc-cream/5 hover:text-ctc-pink"
              onClick={() => setIsCartOpen(true)}
              type="button"
            >
              <MaterialIcon>shopping_cart</MaterialIcon>
              {cartCount > 0 ? (
                <span className="absolute right-0 top-0 grid size-5 place-items-center rounded-full bg-ctc-pink text-[10px] font-bold text-black">
                  {cartCount}
                </span>
              ) : null}
            </button>
            <a
              className="btn-pink hidden h-10 items-center rounded-full px-5 font-label text-xs font-bold uppercase tracking-widest sm:inline-flex"
              href="#shop"
            >
              Shop Now
            </a>
          </div>
        </nav>

        {isMenuOpen ? (
          <div className="storefront-menu-drawer mx-auto mt-3 max-w-[1280px] overflow-hidden rounded-[2rem] p-4 md:hidden">
            <div className="mb-4 flex items-center justify-between gap-4 rounded-[1.5rem] border border-ctc-cream/10 bg-ctc-ink/35 p-4">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.24em] text-ctc-pink">
                  Menu
                </p>
                <p className="mt-1 font-display text-2xl font-black text-ctc-cream">
                  {brandName}
                  <span className="text-ctc-pink">.</span>
                </p>
              </div>
              <span className="grid size-11 place-items-center rounded-2xl border border-ctc-pink/25 bg-ctc-pink/15 text-ctc-pink glow-pink-soft">
                <MaterialIcon>apps</MaterialIcon>
              </span>
            </div>
            <div className="grid gap-2 font-label text-sm uppercase tracking-wider">
              {NAV_LINKS.map(([label, href]) => (
                <a
                  className="group flex items-center justify-between rounded-2xl border border-ctc-cream/10 bg-ctc-ink/30 px-4 py-3.5 text-ctc-cream/80 transition hover:border-ctc-pink/40 hover:bg-ctc-pink/10 hover:text-ctc-cream"
                  href={href}
                  key={label}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-ctc-cream/8 text-ctc-pink transition group-hover:bg-ctc-pink group-hover:text-ctc-ink">
                      <MaterialIcon className="text-lg">{NAV_ICONS[label]}</MaterialIcon>
                    </span>
                    {label}
                  </span>
                  <MaterialIcon className="text-lg text-ctc-cream/35 transition group-hover:text-ctc-pink">
                    arrow_forward
                  </MaterialIcon>
                </a>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3 rounded-[1.5rem] border border-ctc-pink/20 bg-ctc-pink/10 p-3">
              <div className="min-w-0 px-2">
                <p className="font-label text-[10px] uppercase tracking-[0.2em] text-ctc-pink">
                  Live drop
                </p>
                <p className="mt-1 truncate text-sm text-ctc-cream/70">
                  Limited CTC pieces available now.
                </p>
              </div>
              <a
                className="btn-pink inline-flex h-11 items-center rounded-full px-4 font-label text-[11px] font-bold uppercase tracking-wider"
                href="#shop"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </a>
            </div>
          </div>
        ) : null}
      </header>

      <div className="relative z-10 mx-auto max-w-[1280px] px-3 pb-24 md:px-6">
        {/* ===== Hero ===== */}
        <section className="reveal mt-4 grid items-stretch gap-4 md:mt-6 md:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card flex flex-col justify-center gap-6 rounded-[2.5rem] p-8 md:p-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ctc-pink/30 bg-ctc-pink/10 px-4 py-1.5 font-label text-[11px] uppercase tracking-[0.22em] text-ctc-pink">
              <span className="size-1.5 rounded-full bg-ctc-pink glow-pink" />
              Drop 01 // Live in Accra
            </span>
            <h1 className="font-display text-5xl font-black leading-[0.95] text-ctc-cream text-glow sm:text-6xl lg:text-7xl">
              Decode
              <br />
              Your <span className="text-ctc-pink">Style.</span>
            </h1>
            <p className="max-w-md text-base leading-7 text-ctc-cream/70 md:text-lg">
              Crack the code. Wear the statement. CTC drops bold streetwear for
              the ones who move different.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                className="btn-pink inline-flex h-13 items-center rounded-full px-7 py-3.5 font-label text-sm font-bold uppercase tracking-widest"
                href="#featured"
              >
                Shop the Drop
              </a>
              <a
                className="inline-flex h-13 items-center rounded-full border border-ctc-cream/25 px-7 py-3.5 font-label text-sm uppercase tracking-widest text-ctc-cream transition hover:border-ctc-pink/60 hover:text-ctc-pink"
                href="#codekeeper"
              >
                Meet the Codekeeper
              </a>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {HERO_CHIPS.map(([icon, label]) => (
                <span
                  className="glass-soft inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-label text-[11px] uppercase tracking-wider text-ctc-cream/75"
                  key={label}
                >
                  <MaterialIcon className="text-sm text-ctc-pink">
                    {icon}
                  </MaterialIcon>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Mascot visual */}
          <div className="glass-card relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[2.5rem] p-6 md:min-h-[520px]">
            <div className="mascot-halo absolute inset-8 rounded-full" />
            {mascotTransparentUrl ? (
              <div className="float-soft relative z-10 h-[300px] w-full max-w-[420px] md:h-[440px]">
                <Image
                  alt={`${brandFullName} mascot`}
                  className="object-contain drop-shadow-[0_0_42px_rgba(255,92,141,0.3)]"
                  fill
                  priority
                  sizes="(min-width: 768px) 42vw, 90vw"
                  src={mascotTransparentUrl}
                />
              </div>
            ) : (
              <div className="float-soft relative z-10 size-[280px] overflow-hidden rounded-[2.5rem] border border-ctc-cream/15 shadow-[0_0_50px_-8px_rgba(255,92,141,0.4)] md:size-[400px]">
                <Image
                  alt={`${brandFullName} mascot`}
                  className="object-cover"
                  fill
                  priority
                  sizes="(min-width: 768px) 42vw, 90vw"
                  src={mascotHeroUrl}
                />
              </div>
            )}
            <span className="drift-soft absolute right-6 top-8 z-20 rounded-2xl bg-ctc-cream px-3 py-2 font-label text-[11px] font-bold uppercase tracking-wide text-ctc-ink shadow-lg [--drift-rot:6deg]">
              Limited 01
            </span>
            <span className="drift-soft absolute bottom-10 left-6 z-20 rounded-2xl bg-ctc-pink px-3 py-2 font-label text-[11px] font-bold uppercase tracking-wide text-black glow-pink-soft [--drift-rot:-5deg]">
              New Drop
            </span>
          </div>
        </section>

        {/* ===== Ticker ===== */}
        <div className="mt-4 overflow-hidden rounded-full border border-ctc-cream/10 bg-ctc-ink-deep/60 py-3">
          <div className="ticker-track font-label text-sm uppercase tracking-widest text-ctc-pink">
            LIMITED DROP 01 // CTC MERCH AVAILABLE NOW // ACCRA DELIVERY //
            DECODE YOUR STYLE // LIMITED DROP 01 // CTC MERCH AVAILABLE NOW //
            ACCRA DELIVERY // DECODE YOUR STYLE //
          </div>
        </div>

        {/* ===== Feature row ===== */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, title, copy]) => (
            <div
              className="glass-soft hover-glow rounded-3xl p-6 transition hover:border-ctc-pink/40"
              key={title}
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-ctc-pink/15 text-ctc-pink">
                <MaterialIcon>{icon}</MaterialIcon>
              </span>
              <h3 className="mt-4 font-label text-sm uppercase tracking-wider text-ctc-cream">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-ctc-cream/60">{copy}</p>
            </div>
          ))}
        </section>

        {/* ===== Featured carousel ===== */}
        <section
          className="glass-card relative mt-4 overflow-hidden rounded-[2.5rem] p-6 md:p-10"
          id="featured"
        >
          <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-ctc-pink/60 to-transparent" />
          {products.length === 0 ? (
            <p className="py-10 text-center font-label text-sm uppercase tracking-widest text-ctc-cream/60">
              No active products are available right now.
            </p>
          ) : (
            <FeaturedCarousel
              fallbackImage={mascotHeroUrl}
              onQuickAdd={quickAdd}
              onQuickView={setSelectedProduct}
              products={products}
            />
          )}
        </section>

        {/* ===== Recommended / shop preview ===== */}
        {recommended.length > 0 ? (
          <section className="mt-4" id="shop">
            <div className="mb-6 flex items-end justify-between gap-4 px-2">
              <div>
                <p className="font-label text-xs uppercase tracking-[0.3em] text-ctc-pink">
                  Recommended
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ctc-cream md:text-4xl">
                  Wear the statement
                </h2>
              </div>
              <button
                className="hidden font-label text-xs uppercase tracking-widest text-ctc-pink transition hover:text-ctc-cream sm:block"
                onClick={() => setIsCartOpen(true)}
                type="button"
              >
                View Bag
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {recommended.map((product) => {
                const soldOut = productIsSoldOut(product);
                const addable = firstAvailableVariant(product);

                return (
                  <article
                    className="hover-glow group flex gap-4 rounded-[1.75rem] bg-ctc-cream p-4 text-ctc-ink transition"
                    key={product.id}
                  >
                    <button
                      aria-label={`Quick view ${product.name}`}
                      className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-ctc-ink-deep"
                      onClick={() => setSelectedProduct(product)}
                      type="button"
                    >
                      <Image
                        alt={product.name}
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fill
                        sizes="96px"
                        src={productImage(product, mascotHeroUrl)}
                      />
                    </button>
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-label text-sm font-bold uppercase tracking-wide">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-ctc-ink/60">
                        {product.description ||
                          "Everyday statement piece from the CTC drop."}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="font-label text-sm font-bold text-ctc-plum">
                          {formatPesewasToGHS(product.base_price_pesewas)}
                        </span>
                        <button
                          aria-label={`Add ${product.name} to cart`}
                          className="btn-pink grid size-9 place-items-center rounded-full disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={soldOut || !addable}
                          onClick={() => addable && quickAdd(product, addable)}
                          type="button"
                        >
                          <MaterialIcon className="text-lg">add</MaterialIcon>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {/* ===== Codekeeper story ===== */}
        <section
          className="glass-card relative mt-4 grid items-center gap-8 overflow-hidden rounded-[2.5rem] p-8 md:grid-cols-2 md:p-12"
          id="codekeeper"
        >
          <div className="pointer-events-none absolute right-[-10%] top-[-20%] size-[420px] rounded-full bg-ctc-plum/40 blur-[120px]" />
          <div className="relative z-10">
            <p className="font-label text-xs uppercase tracking-[0.3em] text-ctc-pink">
              The Face of CTC
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold text-ctc-cream md:text-5xl">
              Meet the Codekeeper
            </h2>
            <p className="mt-5 max-w-md leading-7 text-ctc-cream/70">
              The face of CTC. Mischievous, bold, and impossible to ignore.
              Built for those who create their own rules.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {TRAITS.map((trait) => (
                <span
                  className="glass-soft inline-flex items-center gap-2 rounded-full px-4 py-2 font-label text-[11px] uppercase tracking-wider text-ctc-cream"
                  key={trait}
                >
                  <MaterialIcon className="text-sm text-ctc-pink">
                    bolt
                  </MaterialIcon>
                  {trait}
                </span>
              ))}
            </div>
          </div>
          <div className="relative z-10 mx-auto aspect-square w-full max-w-[360px]">
            <div className="mascot-halo absolute inset-4 rounded-full" />
            <div className="relative size-full overflow-hidden rounded-[2.5rem] border border-ctc-cream/15 shadow-[0_0_60px_-10px_rgba(115,37,83,0.7)]">
              <Image
                alt={`${brandFullName} Codekeeper mascot`}
                className="object-cover"
                fill
                sizes="(min-width: 768px) 360px, 90vw"
                src={mascotTransparentUrl ?? mascotCloseupUrl}
              />
            </div>
          </div>
        </section>

        {/* ===== Delivery / newsletter ===== */}
        <section
          className="glass-card mt-4 grid gap-8 rounded-[2.5rem] p-8 md:grid-cols-2 md:p-12"
          id="delivery"
        >
          <div>
            <p className="font-label text-xs uppercase tracking-[0.3em] text-ctc-pink">
              Delivery
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ctc-cream md:text-4xl">
              Join the next drop
            </h2>
            <p className="mt-4 max-w-sm leading-7 text-ctc-cream/70">{deliveryNote}</p>
            <div className="mt-6 flex flex-col gap-3 font-label text-sm text-ctc-cream/70">
              <span className="inline-flex items-center gap-3">
                <MaterialIcon className="text-ctc-pink">place</MaterialIcon>
                Accra, Ghana
              </span>
              <span className="inline-flex items-center gap-3">
                <MaterialIcon className="text-ctc-pink">schedule</MaterialIcon>
                Drops announced via email
              </span>
            </div>
          </div>
          <form
            className="flex flex-col justify-center gap-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <label
              className="font-label text-xs uppercase tracking-wider text-ctc-cream/60"
              htmlFor="newsletter-email"
            >
              Get early access to the next drop
            </label>
            <div className="glass-soft flex flex-col gap-2 rounded-3xl p-2 sm:flex-row sm:items-center sm:rounded-full sm:p-1.5">
              <input
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-ctc-cream outline-none placeholder:text-ctc-cream/40"
                id="newsletter-email"
                placeholder="your@email.com"
                type="email"
              />
              <button
                className="btn-pink h-11 shrink-0 rounded-full px-6 font-label text-xs font-bold uppercase tracking-widest"
                type="submit"
              >
                Join the Next Drop
              </button>
            </div>
            <p className="font-label text-[11px] text-ctc-cream/40">
              No spam. Drop alerts and restocks only.
            </p>
          </form>
        </section>

        {/* ===== Footer ===== */}
        <footer
          className="mt-4 grid gap-8 rounded-[2.5rem] border border-ctc-cream/10 bg-ctc-ink-deep/60 p-8 md:grid-cols-3 md:items-center md:p-12"
          id="contact"
        >
          <div>
            <p className="font-display text-4xl font-black text-ctc-cream">
              {brandName}
              <span className="text-ctc-pink">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-ctc-cream/60">
              Crack the code. Decode your style.
            </p>
            <p className="mt-2 text-xs text-ctc-cream/40">
              © 2026 {brandFullName}.
            </p>
          </div>
          <div className="flex flex-col gap-3 font-label text-sm text-ctc-cream/70 md:items-center">
            <a className="transition hover:text-ctc-pink" href="#shop">
              Shop
            </a>
            <a className="transition hover:text-ctc-pink" href="#delivery">
              Delivery
            </a>
            <Link className="transition hover:text-ctc-pink" href="/checkout">
              Secure Checkout
            </Link>
            <Link className="transition hover:text-ctc-pink" href="/dashboard">
              Admin Dashboard
            </Link>
          </div>
          <div className="flex gap-3 md:justify-end">
            {["photo_camera", "alternate_email", "chat"].map((icon) => (
              <span
                className="grid size-11 place-items-center rounded-full border border-ctc-cream/15 text-ctc-cream/70 transition hover:border-ctc-pink hover:text-ctc-pink"
                key={icon}
              >
                <MaterialIcon>{icon}</MaterialIcon>
              </span>
            ))}
          </div>
        </footer>
      </div>

      {/* ===== Mobile bottom nav ===== */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-ctc-cream/10 bg-ctc-ink-deep/90 px-4 py-3 backdrop-blur-xl md:hidden">
        {[
          ["home", "Home", "/"],
          ["search", "Shop", "#shop"],
          ["shopping_bag", "Cart", "#cart"],
          ["person", "Admin", "/dashboard"],
        ].map(([icon, label, href]) => (
          <Link
            className="flex flex-col items-center gap-1 text-ctc-cream/60 transition hover:text-ctc-pink"
            href={href}
            key={label}
            onClick={(event) => {
              if (label === "Cart") {
                event.preventDefault();
                setIsCartOpen(true);
              }
            }}
          >
            <MaterialIcon fill={label === "Home"}>{icon}</MaterialIcon>
            <span className="font-label text-[10px] uppercase tracking-wider">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {selectedProduct ? (
        <QuickView
          fallbackImage={mascotHeroUrl}
          onAdd={addToCart}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      ) : null}

      {isCartOpen ? (
        <CartDrawer
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onRemove={(variantId) =>
            setStoredCart((currentCart) =>
              currentCart.filter((item) => item.variant_id !== variantId),
            )
          }
          onUpdateQuantity={(variantId, quantity) =>
            setStoredCart((currentCart) =>
              currentCart.map((item) =>
                item.variant_id === variantId
                  ? { ...item, quantity: Math.max(1, quantity) }
                  : item,
              ),
            )
          }
          subtotal={subtotal}
        />
      ) : null}
    </main>
  );
}
