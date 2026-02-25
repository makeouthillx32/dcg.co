// app/api/orders/admin/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Verify caller is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
    console.error('[API /orders/admin]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = (data ?? []).map((o: any) => ({
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

  return NextResponse.json({ orders });
}