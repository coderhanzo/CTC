"use client";

import Image from "next/image";
import Link from "next/link";

import { MaterialIcon } from "@/src/components/material-icon";
import { formatPesewasToGHS } from "@/src/lib/money";
import type { CartItem } from "@/src/lib/types";

type CartDrawerProps = {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (variantId: string) => void;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  subtotal: number;
};

export function CartDrawer({
  cart,
  onClose,
  onRemove,
  onUpdateQuantity,
  subtotal,
}: CartDrawerProps) {
  return (
    <div id="cart" className="fixed inset-0 z-[80]">
      <button
        aria-label="Close cart overlay"
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
        onClick={onClose}
        type="button"
      />
      <aside className="glass-card absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-l-[2rem] shadow-[-20px_0_60px_rgba(0,0,0,0.6)]">
        <header className="flex items-center justify-between border-b border-ctc-cream/10 p-6">
          <div className="flex items-center gap-3">
            <MaterialIcon className="text-ctc-pink" fill>
              shopping_bag
            </MaterialIcon>
            <h3 className="font-display text-3xl font-bold text-ctc-cream">
              Your Cart{" "}
              <span className="text-lg font-normal text-ctc-cream/50">
                ({cart.length})
              </span>
            </h3>
          </div>
          <button
            aria-label="Close cart"
            className="grid size-10 place-items-center rounded-full text-ctc-cream/60 transition hover:bg-ctc-pink hover:text-black"
            onClick={onClose}
            type="button"
          >
            <MaterialIcon>close</MaterialIcon>
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-70">
              <p className="font-label text-sm uppercase tracking-widest text-ctc-cream">
                Your cart is empty.
              </p>
              <p className="mt-2 text-sm text-ctc-cream/50">
                The Codekeeper is waiting.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="flex gap-4" key={item.variant_id}>
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-ctc-ink-deep">
                  {item.image ? (
                    <Image
                      alt={item.name}
                      className="object-cover"
                      fill
                      sizes="96px"
                      src={item.image}
                    />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col py-1">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-label text-sm uppercase tracking-wider text-ctc-cream">
                      {item.name}
                    </h4>
                    <button
                      aria-label={`Remove ${item.name}`}
                      className="text-ctc-cream/50 transition hover:text-error"
                      onClick={() => onRemove(item.variant_id)}
                      type="button"
                    >
                      <MaterialIcon className="text-sm">delete</MaterialIcon>
                    </button>
                  </div>
                  <p className="mt-1 font-label text-xs text-ctc-cream/50">
                    Size: {item.selected_size}
                    {item.selected_color ? ` | ${item.selected_color}` : ""}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex h-8 items-center rounded-lg border border-ctc-cream/20">
                      <button
                        className="grid size-8 place-items-center text-ctc-cream/60 hover:text-ctc-pink"
                        onClick={() =>
                          onUpdateQuantity(item.variant_id, item.quantity - 1)
                        }
                        type="button"
                      >
                        <MaterialIcon className="text-sm">remove</MaterialIcon>
                      </button>
                      <span className="w-6 text-center font-label text-sm text-ctc-cream">
                        {item.quantity}
                      </span>
                      <button
                        className="grid size-8 place-items-center text-ctc-cream/60 hover:text-ctc-pink"
                        onClick={() =>
                          onUpdateQuantity(item.variant_id, item.quantity + 1)
                        }
                        type="button"
                      >
                        <MaterialIcon className="text-sm">add</MaterialIcon>
                      </button>
                    </div>
                    <p className="font-label text-ctc-pink">
                      {formatPesewasToGHS(item.unit_price_pesewas)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="border-t border-ctc-cream/10 bg-ctc-ink-deep/50 p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-ctc-cream/60">Subtotal</span>
            <span className="font-label text-lg text-ctc-pink">
              {formatPesewasToGHS(subtotal)}
            </span>
          </div>
          <p className="mb-6 text-xs text-ctc-cream/40">
            Checkout recalculates prices and stock from the server.
          </p>
          <Link
            aria-disabled={cart.length === 0}
            className={`btn-pink flex h-14 items-center justify-center gap-2 rounded-xl font-label text-sm font-bold uppercase tracking-widest ${
              cart.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
            href="/checkout"
          >
            Proceed to Checkout
            <MaterialIcon className="text-lg">arrow_forward</MaterialIcon>
          </Link>
        </footer>
      </aside>
    </div>
  );
}
