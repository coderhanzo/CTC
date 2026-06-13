import Link from "next/link";

import { supportEmail, supportPhone } from "@/src/lib/brand";

export default function PaymentFailedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-on-surface">
      <section className="glass-panel w-full max-w-xl rounded-xl p-8 text-center md:p-12">
        <h1 className="font-display text-4xl font-bold text-error">
          Payment was not completed.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-on-surface-variant">
          Your order has not been confirmed yet.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link className="rounded bg-hot-pink px-8 py-3 font-label text-sm font-bold uppercase tracking-widest text-black" href="/checkout">
            Retry Payment
          </Link>
          <a className="rounded border border-hot-pink/30 px-8 py-3 font-label text-sm uppercase tracking-widest text-hot-pink" href={`mailto:${supportEmail}`}>
            Contact Support
          </a>
        </div>
        <p className="mt-6 font-label text-xs text-on-surface-variant">
          {supportEmail} / {supportPhone}
        </p>
      </section>
    </main>
  );
}
