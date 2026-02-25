export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface AdminOrder {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_cents: number;
  email: string;
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