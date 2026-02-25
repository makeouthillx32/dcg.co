export type OrderStatus = 'pending' | 'processing' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled' | 'returned' | 'cancelled';

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

export interface AdminOrderItem {
  id: string;
  sku: string;
  title: string;
  variant_title?: string;
  quantity: number;
  price_cents: number;
  weight_grams?: number | null;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  subtotal_cents?: number;
  shipping_cents?: number;
  tax_cents?: number;
  discount_cents?: number;
  total_cents: number;
  email: string;
  customer_first_name?: string;
  customer_last_name?: string;
  shipping_address: ShippingAddress | null;
  shipping_method_name?: string;
  items: AdminOrderItem[];
  tracking_number?: string;
  tracking_url?: string;
  internal_notes?: string;
  // Identity — mutually exclusive
  is_member: boolean;  // auth_user_id is set
  is_guest: boolean;   // guest_key set, no auth
  is_legacy: boolean;  // pre-identity system, both null
  points_earned: number;
}