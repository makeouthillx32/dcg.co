// app/api/checkout/calculate-tax/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Parse request body
    const body = await request.json();
    const { subtotal_cents, shipping_cents, state } = body;

    if (!subtotal_cents || !state) {
      return NextResponse.json(
        { error: 'subtotal_cents and state are required' },
        { status: 400 }
      );
    }

    // Call database function to calculate tax
    const { data, error } = await supabase
      .rpc('calculate_order_tax', {
        p_subtotal_cents: subtotal_cents,
        p_shipping_cents: shipping_cents || 0,
        p_state: state,
      });

    if (error) {
      console.error('Calculate tax error:', error);
      return NextResponse.json(
        { error: 'Failed to calculate tax' },
        { status: 500 }
      );
    }

    // Get tax rate details for display
    const { data: taxRates } = await supabase
      .from('tax_rates')
      .select('rate, type, description')
      .eq('state', state)
      .eq('is_active', true);

    const totalRate = taxRates?.reduce((sum, rate) => sum + Number(rate.rate), 0) || 0;

    return NextResponse.json({
      tax_cents: data,
      tax_rate: totalRate,
      tax_breakdown: taxRates || [],
      state: state,
    });
  } catch (error: any) {
    console.error('Tax calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}