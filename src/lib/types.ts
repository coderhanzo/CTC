export type ProductStatus = "active" | "draft" | "archived";

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_featured: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  sold_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  price_override_pesewas: number | null;
};

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  base_price_pesewas: number;
  status: ProductStatus;
  featured_image_url: string | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type DeliveryZone = {
  id: string;
  name: string;
  city: string | null;
  fee_pesewas: number;
  is_active: boolean;
};

export type CartItem = {
  product_id: string;
  variant_id: string;
  name: string;
  image: string | null;
  selected_size: string;
  selected_color: string | null;
  quantity: number;
  unit_price_pesewas: number;
};

export type OrderStatus =
  | "pending"
  | "processing"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed";

export type SafeOrderConfirmation = {
  order_number: string;
  total_pesewas: number;
  customer_email: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
};
