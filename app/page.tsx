import {
  brandFullName,
  brandName,
  deliveryNote,
  mascotCloseupUrl,
  mascotHeroUrl,
  mascotTransparentUrl,
} from "@/src/lib/brand";
import { Storefront } from "@/src/components/storefront";
import { getPublicStoreData } from "@/src/lib/store-data";

export default async function Home() {
  const { products } = await getPublicStoreData();

  return (
    <Storefront
      brandFullName={brandFullName}
      brandName={brandName}
      deliveryNote={deliveryNote}
      mascotCloseupUrl={mascotCloseupUrl}
      mascotHeroUrl={mascotHeroUrl}
      mascotTransparentUrl={mascotTransparentUrl}
      products={products}
    />
  );
}
