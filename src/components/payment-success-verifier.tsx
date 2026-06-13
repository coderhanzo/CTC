"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { MaterialIcon } from "@/src/components/material-icon";
import { clearStoredCart } from "@/src/components/use-cart";
import { formatPesewasToGHS } from "@/src/lib/money";
import type { SafeOrderConfirmation } from "@/src/lib/types";

export function PaymentSuccessVerifier({ reference }: { reference: string }) {
  const [order, setOrder] = useState<SafeOrderConfirmation | null>(null);
  const [error, setError] = useState<string | null>(
    reference ? null : "No payment reference was provided.",
  );
  const [isLoading, setIsLoading] = useState(Boolean(reference));

  const verify = useCallback(async () => {
    if (!reference) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/paystack/verify?reference=${encodeURIComponent(reference)}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Payment verification failed.");
      }

      setOrder(payload as SafeOrderConfirmation);
      clearStoredCart();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Payment verification failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [reference]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void verify();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [verify]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-on-surface">
      <section className="glass-panel relative flex w-full max-w-2xl flex-col items-center overflow-hidden rounded-xl p-8 text-center md:p-12">
        <div className="absolute left-1/2 top-0 h-1/2 w-full -translate-x-1/2 bg-hot-pink/20 blur-[80px]" />
        {isLoading ? (
          <>
            <MaterialIcon className="mb-6 text-6xl text-hot-pink">
              progress_activity
            </MaterialIcon>
            <h1 className="font-display text-4xl font-bold text-primary">
              Verifying payment.
            </h1>
            <p className="mt-4 text-on-surface-variant">
              Please wait while Paystack confirms your order.
            </p>
          </>
        ) : error ? (
          <>
            <MaterialIcon className="mb-6 text-6xl text-error">error</MaterialIcon>
            <h1 className="font-display text-4xl font-bold text-error">
              Verification failed.
            </h1>
            <p className="mt-4 max-w-md text-on-surface-variant">{error}</p>
            <button
              className="mt-8 rounded bg-hot-pink px-8 py-3 font-label text-sm font-bold uppercase tracking-widest text-black"
              onClick={verify}
              type="button"
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <div className="success-glow relative mb-8 grid size-32 place-items-center overflow-hidden rounded-full border-2 border-hot-pink bg-surface-container-high">
              <MaterialIcon className="relative z-10 text-6xl text-hot-pink" fill>
                check_circle
              </MaterialIcon>
            </div>
            <h1 className="font-display text-4xl font-bold text-primary md:text-5xl">
              Order confirmed.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-8 text-on-surface-variant">
              Your CTC drop is locked in. A receipt has been sent to your email.
            </p>
            <div className="my-8 rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-8 py-4">
              <span className="block font-label text-sm text-on-surface-variant">
                Order Number
              </span>
              <span className="font-label text-xl tracking-widest text-primary">
                {order?.order_number}
              </span>
              <span className="mt-3 block font-label text-sm text-on-surface-variant">
                Total paid
              </span>
              <span className="font-label text-lg text-secondary">
                {formatPesewasToGHS(order?.total_pesewas ?? 0)}
              </span>
            </div>
            <Link className="rounded bg-hot-pink px-8 py-3 font-label text-sm font-bold uppercase tracking-widest text-black" href="/">
              Continue Shopping
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
