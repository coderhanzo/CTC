import Image from "next/image";
import Link from "next/link";

import {
  DashboardFrame,
  DashboardTopBar,
  EmptyState,
  GlassPanel,
  MiniBarChart,
  SectionHeader,
  StatCard,
  StatusPill,
} from "@/src/components/dashboard-ui";
import { MaterialIcon } from "@/src/components/material-icon";
import { requireAdmin } from "@/src/lib/auth";
import { mascotCloseupUrl } from "@/src/lib/brand";
import { getDashboardOverview } from "@/src/lib/dashboard-data";
import { formatPesewasToGHS } from "@/src/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const { metrics, summary, revenueChart, recentOrders, lowStockVariants } =
    await getDashboardOverview(supabase);

  return (
    <DashboardFrame active="overview">
      <DashboardTopBar
        eyebrow="Owner portal"
        title="Welcome back to CrackTheCode."
        description="Live order, payment, product, and inventory signals from Supabase."
        actions={
          <Link
            className="btn-pink inline-flex h-12 items-center justify-center rounded-full px-5 font-label text-xs font-bold uppercase tracking-[0.16em] text-[#142030]"
            href="/dashboard/products"
          >
            <MaterialIcon className="mr-2 text-base">add</MaterialIcon>
            New Drop
          </Link>
        }
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value, detail, icon], index) => (
          <StatCard
            detail={detail}
            icon={icon}
            key={label}
            label={label}
            tone={index === 4 ? "warning" : index === 0 ? "pink" : "blue"}
            value={value}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <GlassPanel className="p-4 sm:p-6">
            <SectionHeader
              actionHref="/dashboard/orders"
              actionLabel="Open orders"
              icon="monitoring"
              title="Revenue Pulse"
            />
            <MiniBarChart points={revenueChart} />
          </GlassPanel>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <GlassPanel className="p-4 sm:p-6">
              <SectionHeader
                actionHref="/dashboard/orders"
                actionLabel="View all"
                icon="receipt_long"
                title="Recent Orders"
              />
              {recentOrders.length === 0 ? (
                <EmptyState
                  description="Orders will appear here as customers check out."
                  title="No orders yet"
                />
              ) : (
                <>
                  <div className="hidden overflow-x-auto md:block">
                    <table className="dashboard-table w-full text-left text-sm">
                      <thead>
                        <tr className="font-label text-[11px] uppercase tracking-[0.18em] text-[#85A3B2]">
                          <th className="font-normal">Order</th>
                          <th className="font-normal">Customer</th>
                          <th className="font-normal">Amount</th>
                          <th className="font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td className="font-label text-ctc-pink">
                              {order.order_number}
                            </td>
                            <td>
                              <p className="font-medium text-ctc-cream">
                                {order.customer_name}
                              </p>
                              <p className="text-xs text-[#85A3B2]">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                            </td>
                            <td>{formatPesewasToGHS(order.total_pesewas)}</td>
                            <td>
                              <div className="flex flex-wrap gap-2">
                                <StatusPill status={String(order.payment_status)} />
                                <StatusPill status={String(order.order_status)} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-3 md:hidden">
                    {recentOrders.map((order) => (
                      <article
                        className="rounded-3xl border border-white/10 bg-[#142030]/45 p-4"
                        key={order.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-label text-xs text-ctc-pink">
                              {order.order_number}
                            </p>
                            <p className="mt-1 font-bold text-ctc-cream">
                              {order.customer_name}
                            </p>
                          </div>
                          <p className="text-sm font-bold">
                            {formatPesewasToGHS(order.total_pesewas)}
                          </p>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <StatusPill status={String(order.payment_status)} />
                          <StatusPill status={String(order.order_status)} />
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </GlassPanel>

            <GlassPanel className="relative overflow-hidden p-4 sm:p-6">
              <MaterialIcon className="absolute -right-4 -top-4 text-[110px] text-ctc-pink/10" fill>
                warning
              </MaterialIcon>
              <SectionHeader icon="priority_high" title="Low Stock Alerts" />
              <div className="space-y-3">
                {lowStockVariants.length === 0 ? (
                  <EmptyState
                    description="Every tracked variant is above its threshold."
                    title="Stock looks healthy"
                  />
                ) : (
                  lowStockVariants.slice(0, 6).map((variant) => {
                    const available =
                      Number(variant.stock_quantity ?? 0) -
                      Number(variant.reserved_quantity ?? 0);
                    const product = variant.products as { name?: string } | null;

                    return (
                      <Link
                        className="flex items-center justify-between gap-4 rounded-2xl border border-ctc-pink/20 bg-ctc-pink/10 p-3 transition hover:border-ctc-pink/40"
                        href="/dashboard/inventory"
                        key={variant.id}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ctc-cream">
                            {product?.name ?? "Product"}
                          </p>
                          <p className="font-label text-xs text-[#85A3B2]">
                            {String(variant.size ?? "-")} / {String(variant.color ?? "-")}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-ctc-pink/15 px-3 py-1 font-label text-xs text-ctc-pink">
                          {available} left
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </GlassPanel>
          </section>
        </div>

        <aside className="dashboard-right-panel rounded-3xl p-5">
          <div className="flex items-center gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-3xl border border-ctc-pink/25 bg-[#142030]/50">
              <Image
                alt="CTC mascot"
                className="object-cover object-top"
                fill
                sizes="64px"
                src={mascotCloseupUrl}
              />
            </div>
            <div className="min-w-0">
              <p className="font-label text-xs uppercase tracking-[0.2em] text-[#85A3B2]">
                Admin profile
              </p>
              <h2 className="truncate text-xl font-black text-ctc-cream">
                CTC Studio
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <SummaryTile label="Products" value={`${summary.activeProducts}/${summary.totalProducts}`} />
            <SummaryTile label="Variants" value={String(summary.totalVariants)} />
            <SummaryTile label="Reserved" value={String(summary.totalReserved)} />
            <SummaryTile label="Low Stock" value={String(summary.lowStockCount)} />
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#142030]/35 p-4">
            <p className="font-label text-xs uppercase tracking-[0.22em] text-ctc-pink">
              Operations
            </p>
            <div className="mt-4 space-y-3">
              <QuickLink href="/dashboard/orders" icon="local_shipping" label={`${summary.pendingDeliveries} pending deliveries`} />
              <QuickLink href="/dashboard/inventory" icon="inventory_2" label="Review variant stock" />
              <QuickLink href="/dashboard/settings" icon="tune" label="Delivery and integrations" />
            </div>
          </div>
        </aside>
      </section>
    </DashboardFrame>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="font-label text-[10px] uppercase tracking-[0.18em] text-[#85A3B2]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black text-ctc-cream">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-ctc-cream transition hover:border-ctc-pink/30"
      href={href}
    >
      <MaterialIcon className="text-lg text-ctc-pink">{icon}</MaterialIcon>
      {label}
    </Link>
  );
}
