// app/api/checkout/shipping-rates/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Parse request body
    const body = await request.json();
    const { subtotal_cents, state } = body;

    if (!subtotal_cents) {
      return NextResponse.json(
        { error: 'subtotal_cents is required' },
        { status: 400 }
      );
    }

    // Call database function to get available shipping rates
    const { data, error } = await supabase
      .rpc('get_shipping_rates', {
        p_subtotal_cents: subtotal_cents,
        p_state: state || null,
      });

    if (error) {
      console.error('Get shipping rates error:', error);
      return NextResponse.json(
        { error: 'Failed to get shipping rates' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shipping_rates: data || [],
    });
  } catch (error: any) {
    console.error('Shipping rates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}