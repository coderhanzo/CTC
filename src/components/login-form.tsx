"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block space-y-2">
        <span className="font-label text-xs uppercase tracking-wider text-[#85A3B2]">Email</span>
        <input
          className="dashboard-field h-12 w-full rounded-full px-4 font-label text-sm"
          autoComplete="email"
          name="email"
          required
          type="email"
        />
      </label>
      <label className="block space-y-2">
        <span className="font-label text-xs uppercase tracking-wider text-[#85A3B2]">
          Password
        </span>
        <input
          className="dashboard-field h-12 w-full rounded-full px-4 font-label text-sm"
          autoComplete="current-password"
          name="password"
          required
          type="password"
        />
      </label>
      {errorMessage ? (
        <p className="rounded-2xl border border-red-300/30 bg-red-400/10 p-3 font-label text-sm text-red-100">
          {errorMessage}
        </p>
      ) : null}
      <button
        className="btn-pink h-12 w-full rounded-full font-label text-xs font-bold uppercase tracking-[0.18em] text-[#142030] disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
