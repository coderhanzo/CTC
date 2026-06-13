import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-on-surface">
      <section className="glass-panel max-w-md rounded-xl p-8 text-center">
        <h1 className="font-display text-4xl font-bold text-error">
          Unauthorized.
        </h1>
        <p className="mt-4 text-on-surface-variant">
          This account is not registered as the CTC owner/admin.
        </p>
        <Link className="mt-8 inline-flex rounded bg-hot-pink px-8 py-3 font-label text-sm font-bold uppercase tracking-widest text-black" href="/login">
          Back to Login
        </Link>
      </section>
    </main>
  );
}
