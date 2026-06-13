"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { MaterialIcon } from "@/src/components/material-icon";
import { useCart } from "@/src/components/use-cart";
import { formatPesewasToGHS } from "@/src/lib/money";
import type { DeliveryZone } from "@/src/lib/types";

type CheckoutFlowProps = {
  deliveryZones: DeliveryZone[];
};

export function CheckoutFlow({ deliveryZones }: CheckoutFlowProps) {
  const cart = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState(
    deliveryZones[0]?.id ?? "",
  );
  const selectedZone = deliveryZones.find((zone) => zone.id === selectedZoneId);
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.unit_price_pesewas * item.quantity,
        0,
      ),
    [cart],
  );
  const deliveryFee = selectedZone?.fee_pesewas ?? 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: `${formData.get("first_name") ?? ""} ${
            formData.get("last_name") ?? ""
          }`.trim(),
          customer_email: formData.get("customer_email"),
          customer_phone: formData.get("customer_phone"),
          delivery_zone_id: formData.get("delivery_zone_id"),
          delivery_city: selectedZone?.city ?? "Accra",
          delivery_address: formData.get("delivery_address"),
          notes: formData.get("notes"),
          items: cart.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
        }),
      });

      const payload = (await response.json()) as {
        authorization_url?: string;
        error?: string;
      };

      if (!response.ok || !payload.authorization_url) {
        throw new Error(payload.error || "Unable to initialize payment.");
      }

      window.location.assign(payload.authorization_url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to initialize payment.",
      );
      setIsProcessing(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      <header className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-5 py-6 md:px-16">
        <Link className="flex items-center gap-2 font-label text-sm text-on-surface-variant transition hover:text-primary" href="/">
          <MaterialIcon>arrow_back</MaterialIcon>
          Return to Cart
        </Link>
        <Link className="font-display text-4xl font-black text-primary-fixed" href="/">
          CTC
        </Link>
        <span className="w-24" />
      </header>

      <div className="absolute left-0 top-1/4 size-96 rounded-full bg-secondary-container/20 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 size-[500px] rounded-full bg-primary-container/20 blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-5 pb-16 pt-32 md:flex-row md:px-16">
        <section className="flex-1">
          <div className="mb-12">
            <h1 className="font-display text-4xl font-bold text-on-surface md:text-5xl">
              Secure Checkout
            </h1>
            <p className="mt-2 font-label text-sm text-on-surface-variant">
              Currently delivering within Accra.
            </p>
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <CheckoutCard icon="person" title="Customer Details">
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="First Name" name="first_name" placeholder="Kwame" />
                <Field label="Last Name" name="last_name" placeholder="Mensah" />
                <Field className="md:col-span-2" label="Email Address" name="customer_email" placeholder="k.mensah@example.com" type="email" />
                <Field className="md:col-span-2" label="Phone Number" name="customer_phone" placeholder="+233 55 000 0000" type="tel" />
              </div>
            </CheckoutCard>
            <CheckoutCard icon="location_on" title="Delivery Address">
              <div className="space-y-6">
                <label className="block space-y-2">
                  <span className="font-label text-sm text-on-surface-variant">
                    Accra Zone
                  </span>
                  <select
                    className="w-full rounded border border-outline-variant bg-white/5 px-4 py-3 font-label text-sm text-on-surface outline-none focus:border-primary"
                    name="delivery_zone_id"
                    onChange={(event) => setSelectedZoneId(event.target.value)}
                    required
                    value={selectedZoneId}
                  >
                    <option value="">Select your zone...</option>
                    {deliveryZones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="font-label text-sm text-on-surface-variant">
                    Street Address / Landmark
                  </span>
                  <textarea
                    className="h-24 w-full resize-none rounded border border-outline-variant bg-white/5 px-4 py-3 font-label text-sm text-on-surface outline-none focus:border-primary"
                    name="delivery_address"
                    placeholder="Near A&C Mall, Plot 42..."
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="font-label text-sm text-on-surface-variant">
                    Notes
                  </span>
                  <textarea
                    className="h-20 w-full resize-none rounded border border-outline-variant bg-white/5 px-4 py-3 font-label text-sm text-on-surface outline-none focus:border-primary"
                    name="notes"
                    placeholder="Delivery instructions..."
                  />
                </label>
              </div>
            </CheckoutCard>
            {errorMessage ? (
              <p className="rounded border border-error/30 bg-error-container/20 p-4 font-label text-sm text-error">
                {errorMessage}
              </p>
            ) : null}
            <button
              className="flex h-14 w-full items-center justify-center gap-2 rounded bg-hot-pink font-label text-sm font-bold uppercase tracking-widest text-black transition hover:brightness-110 disabled:opacity-70 md:hidden"
              disabled={isProcessing || cart.length === 0}
              type="submit"
            >
              <MaterialIcon>{isProcessing ? "progress_activity" : "lock"}</MaterialIcon>
              {isProcessing ? "Processing..." : "Pay with Paystack"}
            </button>
          </form>
        </section>

        <aside className="w-full shrink-0 md:w-[400px]">
          <div className="glass-panel sticky top-24 rounded-xl p-6 md:p-8">
            <h2 className="mb-8 border-b border-outline-variant/30 pb-4 font-display text-4xl font-bold text-primary">
              Summary
            </h2>
            <div className="mb-8 space-y-4">
              {cart.length === 0 ? (
                <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">
                  Your cart is empty.
                </p>
              ) : (
                cart.map((item) => (
                  <div className="flex items-center gap-4" key={item.variant_id}>
                    <div className="relative size-16 overflow-hidden rounded border border-outline-variant/20 bg-surface-container-high">
                      {item.image ? (
                        <Image alt={item.name} className="object-cover" fill sizes="64px" src={item.image} />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-label text-sm uppercase tracking-wide">
                        {item.name}
                      </h3>
                      <p className="font-label text-sm text-on-surface-variant">
                        Size: {item.selected_size} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-label text-sm">
                      {formatPesewasToGHS(item.unit_price_pesewas)}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="mb-8 space-y-4 border-y border-outline-variant/30 py-6 font-label text-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPesewasToGHS(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{formatPesewasToGHS(deliveryFee)}</span>
              </div>
            </div>
            <div className="mb-8 flex items-end justify-between">
              <span className="font-label text-sm uppercase tracking-widest text-primary">
                Total
              </span>
              <span className="font-display text-4xl font-bold">
                {formatPesewasToGHS(subtotal + deliveryFee)}
              </span>
            </div>
            <button
              className="hidden h-14 w-full items-center justify-center gap-2 rounded bg-hot-pink font-label text-sm font-bold uppercase tracking-widest text-black transition hover:brightness-110 disabled:opacity-70 md:flex"
              disabled={isProcessing || cart.length === 0}
              onClick={() => {
                const form = document.querySelector("form");
                form?.requestSubmit();
              }}
              type="button"
            >
              <MaterialIcon>{isProcessing ? "progress_activity" : "lock"}</MaterialIcon>
              {isProcessing ? "Processing..." : "Pay with Paystack"}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 opacity-50">
              <MaterialIcon className="text-sm">verified_user</MaterialIcon>
              <span className="font-label text-[10px]">Encrypted & Secure</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function CheckoutCard({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: string;
  title: string;
}) {
  return (
    <section className="glass-panel rounded-xl p-6 md:p-8">
      <h2 className="mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4 font-label text-sm uppercase tracking-widest text-secondary">
        <MaterialIcon>{icon}</MaterialIcon>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  className,
  label,
  name,
  placeholder,
  type = "text",
}: {
  className?: string;
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className={`block space-y-2 ${className ?? ""}`}>
      <span className="font-label text-sm text-on-surface-variant">{label}</span>
      <input
        className="w-full rounded border border-outline-variant bg-white/5 px-4 py-3 font-label text-sm text-on-surface outline-none transition focus:border-primary"
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
