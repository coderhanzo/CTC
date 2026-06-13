import {
  DashboardFrame,
  DashboardTopBar,
  EmptyState,
  GlassPanel,
  StatusPill,
} from "@/src/components/dashboard-ui";
import { OrderStatusEditor } from "@/src/components/order-status-editor";
import { requireAdmin } from "@/src/lib/auth";
import { formatPesewasToGHS } from "@/src/lib/money";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { supabase } = await requireAdmin();
  const { data: orders } = await supabase
    .from("orders")
    .select("*,order_items(*)")
    .order("created_at", { ascending: false });
  const orderRows = orders ?? [];

  return (
    <DashboardFrame active="orders">
      <DashboardTopBar
        eyebrow="Fulfillment"
        title="Orders"
        description="Review real customer orders, payment states, and delivery progress."
      />
      <GlassPanel className="p-4 sm:p-6">
        {orderRows.length === 0 ? (
          <EmptyState
            description="Paid and pending customer orders will appear after checkout."
            title="No orders yet"
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="dashboard-table w-full min-w-[1120px] text-left text-sm">
                <thead>
                  <tr className="font-label text-[11px] uppercase tracking-[0.18em] text-[#85A3B2]">
                    <th className="font-normal">Order</th>
                    <th className="font-normal">Customer</th>
                    <th className="font-normal">Contact</th>
                    <th className="font-normal">Items</th>
                    <th className="font-normal">Total</th>
                    <th className="font-normal">Payment</th>
                    <th className="font-normal">Delivery</th>
                    <th className="font-normal">Date</th>
                    <th className="font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((order) => (
                    <tr key={order.id}>
                      <td className="font-label text-ctc-pink">
                        {order.order_number}
                      </td>
                      <td>
                        <p className="font-bold text-ctc-cream">
                          {order.customer_name}
                        </p>
                        <p className="text-xs text-[#85A3B2]">
                          {order.customer_email ?? "No email"}
                        </p>
                      </td>
                      <td className="text-[#85A3B2]">
                        {order.customer_phone ?? "No phone"}
                      </td>
                      <td className="max-w-sm text-[#E9D8C8]">
                        {itemsSummary(order.order_items)}
                      </td>
                      <td className="font-bold">
                        {formatPesewasToGHS(order.total_pesewas)}
                      </td>
                      <td>
                        <StatusPill status={String(order.payment_status)} />
                      </td>
                      <td>
                        <StatusPill status={String(order.order_status)} />
                      </td>
                      <td className="text-[#85A3B2]">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <OrderStatusEditor
                          orderId={order.id}
                          status={order.order_status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {orderRows.map((order) => (
                <article
                  className="rounded-3xl border border-white/10 bg-[#142030]/45 p-4"
                  key={order.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-label text-xs text-ctc-pink">
                        {order.order_number}
                      </p>
                      <h2 className="mt-1 truncate text-lg font-black text-ctc-cream">
                        {order.customer_name}
                      </h2>
                      <p className="mt-1 truncate text-xs text-[#85A3B2]">
                        {order.customer_email ?? order.customer_phone ?? "No contact"}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-ctc-cream">
                      {formatPesewasToGHS(order.total_pesewas)}
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#E9D8C8]">
                    {itemsSummary(order.order_items)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill status={String(order.payment_status)} />
                    <StatusPill status={String(order.order_status)} />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                    <span className="font-label text-xs text-[#85A3B2]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                    <OrderStatusEditor
                      orderId={order.id}
                      status={order.order_status}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </GlassPanel>
    </DashboardFrame>
  );
}

function itemsSummary(items: unknown) {
  if (!Array.isArray(items) || items.length === 0) {
    return "No items recorded";
  }

  return items
    .map((item: Record<string, unknown>) =>
      `${String(item.product_name ?? item.product_name_snapshot ?? "Item")} ${String(item.variant_size ?? item.size_snapshot ?? "")} x${String(item.quantity ?? 0)}`,
    )
    .join(", ");
}
