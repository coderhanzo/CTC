import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { formatPesewasToGHS } from "@/src/lib/money";

export async function getDashboardOverview(supabase: SupabaseClient) {
  const [ordersResult, recentOrdersResult, variantsResult, productsResult] =
    await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("product_variants").select("*,products(name)"),
    supabase.from("products").select("id,status"),
  ]);

  const orders = ordersResult.data ?? [];
  const recentOrders = recentOrdersResult.data ?? [];
  const variants = variantsResult.data ?? [];
  const products = productsResult.data ?? [];
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total_pesewas ?? 0),
    0,
  );
  const pendingDeliveries = orders.filter(
    (order) =>
      order.payment_status === "paid" &&
      !["delivered", "cancelled"].includes(String(order.order_status)),
  ).length;
  const lowStockVariants = variants.filter((variant) => {
    const available =
      Number(variant.stock_quantity ?? 0) -
      Number(variant.reserved_quantity ?? 0);

    return available <= Number(variant.low_stock_threshold ?? 5);
  });
  const totalReserved = variants.reduce(
    (sum, variant) => sum + Number(variant.reserved_quantity ?? 0),
    0,
  );
  const activeProducts = products.filter(
    (product) => product.status === "active",
  ).length;
  const chartBuckets = new Map<string, number>();

  for (const order of paidOrders) {
    const createdAt = order.created_at ? new Date(order.created_at) : null;

    if (!createdAt || Number.isNaN(createdAt.getTime())) {
      continue;
    }

    const key = createdAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    chartBuckets.set(
      key,
      (chartBuckets.get(key) ?? 0) + Number(order.total_pesewas ?? 0),
    );
  }

  const revenueChart = Array.from(chartBuckets.entries())
    .reverse()
    .slice(-7)
    .map(([label, value]) => ({
      label,
      value,
      amountLabel: formatPesewasToGHS(value),
    }));

  return {
    metrics: [
      ["Total Revenue", formatPesewasToGHS(totalRevenue), "Paid orders", "trending_up"],
      ["Total Orders", String(orders.length), "All captured orders", "local_mall"],
      ["Paid Orders", String(paidOrders.length), `${pendingDeliveries} pending deliveries`, "verified"],
      ["Pending Deliveries", String(pendingDeliveries), "Paid orders not closed", "local_shipping"],
      ["Low Stock Items", String(lowStockVariants.length), "Variants at threshold", "warning"],
    ],
    summary: {
      activeProducts,
      totalProducts: products.length,
      totalVariants: variants.length,
      totalReserved,
      lowStockCount: lowStockVariants.length,
      pendingDeliveries,
    },
    revenueChart,
    recentOrders,
    lowStockVariants,
  };
}
