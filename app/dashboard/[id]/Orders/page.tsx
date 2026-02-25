// app/dashboard/[id]/Orders/page.tsx
import { Suspense } from 'react';
import Breadcrumb from "@/components/Breadcrumbs/dashboard";
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
      subtotal_cents,
      shipping_cents,
      tax_cents,
      discount_cents,
      total_cents,
      email,
      customer_first_name,
      customer_last_name,
      shipping_address,
      shipping_method_name,
      tracking_number,
      tracking_url,
      internal_notes,
      guest_key,
      auth_user_id,
      profile_id,
      fulfillments (
        id,
        status
      ),
      order_items (
        id,
        sku,
        product_title,
        variant_title,
        quantity,
        price_cents,
        product_variants (
          weight_grams
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Orders page] fetch error:', error.message);
    return [];
  }

  return (data ?? []).map((o: any): AdminOrder => {
    // auth_user_id set → member (logged-in purchase)
    // guest_key set, no auth_user_id → guest
    // both null → legacy order (pre-identity system)
    const isMember = !!o.auth_user_id;
    const isGuest  = !isMember && !!o.guest_key;
    const isLegacy = !isMember && !isGuest;

    return {
      id: o.id,
      order_number: o.order_number,
      created_at: o.created_at,
      status: o.status,
      payment_status: o.payment_status,
      fulfillment_status: o.fulfillments?.[0]?.status ?? 'unfulfilled',
      subtotal_cents: o.subtotal_cents ?? 0,
      shipping_cents: o.shipping_cents ?? 0,
      tax_cents: o.tax_cents ?? 0,
      discount_cents: o.discount_cents ?? 0,
      total_cents: o.total_cents,
      email: o.email,
      customer_first_name: o.customer_first_name,
      customer_last_name: o.customer_last_name,
      shipping_address: o.shipping_address,
      shipping_method_name: o.shipping_method_name,
      tracking_number: o.tracking_number,
      tracking_url: o.tracking_url,
      internal_notes: o.internal_notes,
      is_member: isMember,
      is_guest: isGuest,
      is_legacy: isLegacy,
      points_earned: isMember
        ? Math.floor((o.subtotal_cents ?? o.total_cents) / 100)
        : 0,
      items: (o.order_items ?? []).map((item: any) => ({
        id: item.id,
        sku: item.sku ?? '',
        title: item.product_title ?? '',
        variant_title: item.variant_title ?? '',
        quantity: item.quantity,
        price_cents: item.price_cents,
        weight_grams: item.product_variants?.weight_grams ?? null,
      })),
    };
  });
}

// Server component — no 'use client'
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