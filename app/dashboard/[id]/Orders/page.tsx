// app/dashboard/[id]/Orders/page.tsx
import React, { Suspense } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/dashboard';
import { OrdersManager } from '@/components/orders';
import { OrdersSkeleton } from '@/components/orders/skeleton';
import { createClient } from '@/utils/supabase/server';
import { AdminOrder } from '@/lib/orders/types';

async function fetchOrders(): Promise<AdminOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      status,
      payment_status,
      total_cents,
      email,
      customer_first_name,
      customer_last_name,
      shipping_address,
      tracking_number,
      tracking_url,
      internal_notes,
      fulfillments (
        status
      ),
      order_items (
        id,
        sku,
        title,
        quantity,
        price_cents
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Orders] Supabase fetch error:', error.message);
    return [];
  }

  return (data ?? []).map((o: any) => ({
    id: o.id,
    order_number: o.order_number,
    created_at: o.created_at,
    status: o.status,
    payment_status: o.payment_status,
    fulfillment_status: o.fulfillments?.[0]?.status ?? 'unfulfilled',
    total_cents: o.total_cents,
    email: o.email,
    customer_first_name: o.customer_first_name,
    customer_last_name: o.customer_last_name,
    shipping_address: o.shipping_address,
    tracking_number: o.tracking_number,
    tracking_url: o.tracking_url,
    internal_notes: o.internal_notes,
    items: (o.order_items ?? []).map((item: any) => ({
      id: item.id,
      sku: item.sku ?? '',
      title: item.title ?? '',
      quantity: item.quantity,
      price_cents: item.price_cents,
    })),
  }));
}

export default async function OrdersPage() {
  const orders = await fetchOrders();

  return (
    <>
      <Breadcrumb pageName="Orders" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<OrdersSkeleton />}>
          <OrdersManager initialOrders={orders} />
        </Suspense>
      </div>
    </>
  );
}