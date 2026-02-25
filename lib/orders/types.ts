export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'fulfilled' | 'partial' | 'returned';

export interface AdminOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus; // ← new: drives the tag in the grid
  total_cents: number;
  email: string;
  customer_first_name?: string;
  customer_last_name?: string;
  shipping_address: any;
  items: AdminOrderItem[];
  tracking_number?: string;
  tracking_url?: string;
  internal_notes?: string;
}

export interface AdminOrderItem {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  price_cents: number;
}