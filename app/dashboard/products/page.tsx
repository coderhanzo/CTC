import {
  DashboardFrame,
  DashboardTopBar,
} from "@/src/components/dashboard-ui";
import { ProductManager } from "@/src/components/product-manager";
import { requireAdmin } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { supabase } = await requireAdmin();
  const [productsResult, variantsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("product_variants").select("*"),
  ]);
  const products = (productsResult.data ?? []).map((product) => ({
    ...product,
    product_variants: (variantsResult.data ?? []).filter(
      (variant) => variant.product_id === product.id,
    ),
  }));

  return (
    <DashboardFrame active="products">
      <DashboardTopBar
        eyebrow="Catalog"
        title="Products"
        description="Add products, edit details, and upload featured images for the CTC store."
      />
      <ProductManager products={products} />
    </DashboardFrame>
  );
}
