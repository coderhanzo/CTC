"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { MaterialIcon } from "@/src/components/material-icon";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

type AdminNavProps = {
  active: "overview" | "orders" | "products" | "inventory" | "settings";
};

const navItems = [
  ["dashboard", "Overview", "/dashboard", "overview"],
  ["package", "Orders", "/dashboard/orders", "orders"],
  ["shopping_bag", "Products", "/dashboard/products", "products"],
  ["inventory_2", "Inventory", "/dashboard/inventory", "inventory"],
  ["settings", "Settings", "/dashboard/settings", "settings"],
] as const;

export function AdminNav({ active }: AdminNavProps) {
  const router = useRouter();

  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside className="fixed left-4 top-4 z-50 hidden h-[calc(100vh-2rem)] w-20 flex-col items-center gap-5 rounded-[2rem] admin-rail py-5 md:flex">
        <div className="grid size-12 place-items-center rounded-2xl border border-ctc-pink/25 bg-ctc-pink/15 text-sm font-black tracking-tight text-ctc-cream shadow-[0_0_28px_rgba(255,92,141,0.22)]">
          CTC
        </div>
        <nav className="flex flex-1 flex-col items-center gap-3">
          {navItems.map(([icon, label, href, key]) => {
            const isActive = active === key;
            return (
              <Link
                aria-label={label}
                className={`group relative grid size-12 place-items-center rounded-2xl transition-all hover:-translate-y-0.5 ${
                  isActive
                    ? "nav-icon-active"
                    : "text-[#85A3B2] hover:bg-white/10 hover:text-ctc-cream"
                }`}
                href={href}
                key={label}
                title={label}
              >
                <MaterialIcon className="text-[22px]" fill={isActive}>{icon}</MaterialIcon>
                <span className="pointer-events-none absolute left-[4.2rem] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#142030]/95 px-3 py-1.5 font-label text-[11px] uppercase tracking-wider text-ctc-cream opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col items-center gap-3">
          <Link
            aria-label="New product"
            className="grid size-12 place-items-center rounded-2xl border border-ctc-pink/25 bg-ctc-pink/15 text-ctc-pink transition hover:bg-ctc-pink/25"
            href="/dashboard/products"
            title="New product"
          >
            <MaterialIcon>add</MaterialIcon>
          </Link>
          <button
            aria-label="Logout"
            className="grid size-12 place-items-center rounded-2xl text-[#85A3B2] transition hover:bg-white/10 hover:text-ctc-cream"
            onClick={logout}
            title="Logout"
            type="button"
          >
            <MaterialIcon>logout</MaterialIcon>
          </button>
        </div>
      </aside>
      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 gap-1 rounded-3xl border border-white/10 bg-[rgba(20,32,48,0.82)] p-2 shadow-2xl backdrop-blur-2xl md:hidden">
        {navItems.map(([icon, label, href, key]) => {
          const isActive = active === key;
          return (
          <Link
            className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 ${
              isActive ? "nav-icon-active" : "text-[#85A3B2]"
            }`}
            href={href}
            key={label}
          >
            <MaterialIcon className="text-xl" fill={isActive}>{icon}</MaterialIcon>
            <span className="max-w-full truncate font-label text-[9px] uppercase tracking-wider">
              {label}
            </span>
          </Link>
          );
        })}
      </nav>
    </>
  );
}
