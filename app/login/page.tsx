import { LoginForm } from "@/src/components/login-form";

export default function LoginPage() {
  return (
    <main className="dashboard-ambient flex min-h-screen items-center justify-center px-5 py-10 text-ctc-cream">
      <section className="dashboard-shell relative z-10 w-full max-w-md rounded-[2rem] p-5 sm:p-8">
        <div className="mb-8 grid size-14 place-items-center rounded-2xl border border-ctc-pink/25 bg-ctc-pink/15 text-sm font-black text-ctc-cream shadow-[0_0_28px_rgba(255,92,141,0.22)]">
          CTC
        </div>
        <section className="dashboard-glass rounded-3xl p-5 sm:p-6">
          <p className="font-label text-xs uppercase tracking-[0.24em] text-ctc-pink">
            Owner access
          </p>
          <h1 className="mt-3 text-4xl font-black text-ctc-cream">
            CTC Admin
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#85A3B2]">
            Public signup is disabled. Sign in with an authorized admin account.
          </p>
          <div className="mt-8">
          <LoginForm />
          </div>
        </section>
      </section>
    </main>
  );
}
