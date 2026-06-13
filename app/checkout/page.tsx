import { CheckoutFlow } from "@/src/components/checkout-flow";
import { getPublicStoreData } from "@/src/lib/store-data";

export default async function CheckoutPage() {
  const { deliveryZones } = await getPublicStoreData();

  return <CheckoutFlow deliveryZones={deliveryZones} />;
}
