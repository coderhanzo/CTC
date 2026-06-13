import Link from "next/link";
import type { ReactNode } from "react";

import { AdminNav } from "@/src/components/admin-nav";
import { MaterialIcon } from "@/src/components/material-icon";

type DashboardSection =
  | "overview"
  | "orders"
  | "products"
  | "inventory"
  | "settings";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function DashboardFrame({
  active,
  children,
}: {
  active: DashboardSection;
  children: ReactNode;
}) {
  return (
    <main className="dashboard-ambient min-h-screen pb-24 text-ctc-cream md:pl-28 md:pb-0">
      <AdminNav active={active} />
      <div className="relative z-10 mx-auto w-full max-w-[1540px] px-4 py-5 sm:px-6 md:px-8 md:py-8 xl:px-10">
        <div className="dashboard-shell min-h-[calc(100vh-64px)] rounded-[28px] p-4 sm:p-5 md:p-6">
          {children}
        </div>
      </div>
    </main>
  );
}

export function DashboardTopBar({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="font-label text-xs uppercase tracking-[0.28em] text-ctc-pink">
          {eyebrow}
        </p>
        <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-normal text-ctc-cream sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#85A3B2] sm:text-base">
          {description}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar />
        {actions}
      </div>
    </header>
  );
}

export function SearchBar({ placeholder = "Search management data" }) {
  return (
    <label className="glass-control flex h-12 min-w-0 items-center gap-3 rounded-full px-4 sm:min-w-72">
      <MaterialIcon className="text-lg text-[#85A3B2]">search</MaterialIcon>
      <input
        aria-label="Search"
        className="min-w-0 flex-1 bg-transparent text-sm text-ctc-cream outline-none placeholder:text-[#85A3B2]"
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}

export function GlassPanel({
  children,
  className,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
}) {
  const Component = as;

  return (
    <Component className={cx("dashboard-glass rounded-3xl", className)}>
      {children}
    </Component>
  );
}

export function SectionHeader({
  title,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: string;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-ctc-pink/20 bg-ctc-pink/10 text-ctc-pink shadow-[0_0_24px_rgba(255,92,141,0.18)]">
            <MaterialIcon className="text-xl">{icon}</MaterialIcon>
          </span>
        ) : null}
        <h2 className="truncate text-xl font-bold text-ctc-cream">{title}</h2>
      </div>
      {actionHref && actionLabel ? (
        <Link
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 font-label text-xs uppercase tracking-wider text-[#85A3B2] transition hover:border-ctc-pink/40 hover:text-ctc-cream"
          href={actionHref}
        >
          {actionLabel}
          <MaterialIcon className="text-base">arrow_forward</MaterialIcon>
        </Link>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "pink",
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  tone?: "pink" | "cream" | "blue" | "warning";
}) {
  const toneClasses = {
    pink: "text-ctc-pink bg-ctc-pink/10 border-ctc-pink/25",
    cream: "text-ctc-cream bg-ctc-cream/10 border-ctc-cream/15",
    blue: "text-[#85A3B2] bg-[#85A3B2]/10 border-[#85A3B2]/20",
    warning: "text-ctc-pink bg-ctc-pink/15 border-ctc-pink/30",
  };

  return (
    <GlassPanel as="article" className="stat-card p-4 sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <p className="font-label text-[11px] uppercase tracking-[0.22em] text-[#85A3B2]">
          {label}
        </p>
        <span
          className={cx(
            "grid size-10 shrink-0 place-items-center rounded-2xl border",
            toneClasses[tone],
          )}
        >
          <MaterialIcon className="text-xl">{icon}</MaterialIcon>
        </span>
      </div>
      <p className="text-3xl font-black tracking-normal text-ctc-cream md:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm text-[#85A3B2]">{detail}</p>
    </GlassPanel>
  );
}

export function StatusPill({
  status,
  tone,
}: {
  status: string;
  tone?: "success" | "warning" | "danger" | "neutral";
}) {
  const normalized = status.toLowerCase();
  const resolvedTone =
    tone ??
    (["paid", "delivered", "active", "configured"].includes(normalized)
      ? "success"
      : ["pending", "processing", "draft"].includes(normalized)
        ? "warning"
        : ["failed", "cancelled", "missing", "archived"].includes(normalized)
          ? "danger"
          : "neutral");
  const toneClasses = {
    success: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    warning: "border-ctc-pink/30 bg-ctc-pink/10 text-ctc-pink",
    danger: "border-red-300/30 bg-red-400/10 text-red-100",
    neutral: "border-white/10 bg-white/5 text-[#85A3B2]",
  };

  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-1 font-label text-[11px] uppercase tracking-wider",
        toneClasses[resolvedTone],
      )}
    >
      {status}
    </span>
  );
}

export function PrimaryButton({
  children,
  className,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      className={cx(
        "btn-pink inline-flex h-11 items-center justify-center rounded-full px-5 font-label text-xs font-bold uppercase tracking-[0.16em] text-[#142030]",
        className,
      )}
      type={type}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
      <p className="text-lg font-bold text-ctc-cream">{title}</p>
      <p className="mt-2 text-sm text-[#85A3B2]">{description}</p>
    </div>
  );
}

export function MiniBarChart({
  points,
}: {
  points: Array<{ label: string; value: number; amountLabel: string }>;
}) {
  const max = Math.max(...points.map((point) => point.value), 0);

  return (
    <div className="flex h-64 items-end gap-3 rounded-3xl border border-white/10 bg-[#142030]/35 p-4">
      {points.length === 0 ? (
        <div className="grid h-full w-full place-items-center text-center text-sm text-[#85A3B2]">
          No paid order revenue to chart yet.
        </div>
      ) : (
        points.map((point) => {
          const height = max > 0 ? Math.max((point.value / max) * 100, 8) : 8;

          return (
            <div
              className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-3"
              key={point.label}
              title={`${point.label}: ${point.amountLabel}`}
            >
              <div className="relative flex h-full w-full max-w-14 items-end overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-ctc-pink via-[#ff8caf] to-ctc-cream shadow-[0_0_24px_rgba(255,92,141,0.35)] transition group-hover:brightness-110"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="truncate font-label text-[10px] uppercase tracking-wider text-[#85A3B2]">
                {point.label}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
