// app/api/checkout/validate-promo/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;

    // Parse request body
    const body = await request.json();
    const { code, subtotal_cents } = body;

    if (!code || !subtotal_cents) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call database function to validate promo code
    const { data, error } = await supabase
      .rpc('apply_promo_code', {
        p_code: code.toUpperCase(),
        p_subtotal_cents: subtotal_cents,
        p_user_id: userId,
      });

    if (error) {
      console.error('Promo validation error:', error);
      return NextResponse.json(
        { error: 'Failed to validate promo code' },
        { status: 500 }
      );
    }

    const result = data[0];

    if (!result.is_valid) {
      return NextResponse.json(
        { 
          valid: false, 
          error: result.error_message 
        },
        { status: 200 }
      );
    }

    // Get promo code details for display
    const { data: promoCode } = await supabase
      .from('promo_codes')
      .select('code, description, discount_type, discount_value')
      .eq('code', code.toUpperCase())
      .single();

    return NextResponse.json({
      valid: true,
      discount_cents: result.discount_cents,
      promo_code: promoCode,
      message: `Promo code "${code}" applied successfully!`,
    });
  } catch (error: any) {
    console.error('Validate promo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}