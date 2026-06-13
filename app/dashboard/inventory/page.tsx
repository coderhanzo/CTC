import {
  DashboardFrame,
  DashboardTopBar,
} from "@/src/components/dashboard-ui";
import { InventoryEditor } from "@/src/components/inventory-editor";
import { requireAdmin } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { supabase } = await requireAdmin();
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*,products(name)")
    .order("product_id", { ascending: true });

  return (
    <DashboardFrame active="inventory">
      <DashboardTopBar
        eyebrow="Stock control"
        title="Inventory"
        description="Update variant quantities, thresholds, and active state with clear low-stock visibility."
      />
      <InventoryEditor variants={variants ?? []} />
    </DashboardFrame>
  );
}
