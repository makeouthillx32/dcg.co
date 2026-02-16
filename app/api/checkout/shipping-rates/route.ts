// app/api/checkout/shipping-rates/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();
    const { subtotal_cents, state } = body;

    if (!subtotal_cents) {
      return NextResponse.json(
        { error: 'subtotal_cents is required' },
        { status: 400 }
      );
    }

    console.log('Loading shipping rates for:', { subtotal_cents, state });

    // Query shipping rates directly from table
    const { data: rates, error } = await supabase
      .from('shipping_rates')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) {
      console.error('Shipping rates query error:', error);
      return NextResponse.json(
        { error: 'Failed to load shipping rates', details: error.message },
        { status: 500 }
      );
    }

    console.log('Raw shipping rates from DB:', rates);

    // Filter and format rates
    const filteredRates = (rates || [])
      .filter(rate => {
        // Check minimum order requirement
        if (rate.min_subtotal_cents && subtotal_cents < rate.min_subtotal_cents) {
          return false;
        }
        // Check maximum order requirement
        if (rate.max_subtotal_cents && subtotal_cents > rate.max_subtotal_cents) {
          return false;
        }
        return true;
      })
      .map(rate => ({
        id: rate.id,
        name: rate.name,
        description: rate.description || `${rate.min_delivery_days}-${rate.max_delivery_days} business days`,
        carrier: rate.carrier || rate.provider_hint || 'USPS',
        price_cents: rate.price_cents || rate.amount_cents || 0,
        min_delivery_days: rate.min_delivery_days || 5,
        max_delivery_days: rate.max_delivery_days || 7,
      }));

    console.log('Filtered & formatted rates:', filteredRates);

    return NextResponse.json({
      shipping_rates: filteredRates,
    });
  } catch (error: any) {
    console.error('Shipping rates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}