// app/api/checkout/create-payment-intent/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const sessionId = request.headers.get('x-session-id');
    const { data: { user } } = await supabase.auth.getUser();

    // Parse request body
    const body = await request.json();
    const {
      cart_id,
      email,
      shipping_address,
      billing_address,
      phone,
      customer_notes,
      promo_code,
      shipping_rate_id,
    } = body;

    // Validate required fields
    if (!cart_id || !email || !shipping_address || !billing_address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const forwardedFor = request.headers.get('x-forwarded-for');
    const customerIp = forwardedFor ? forwardedFor.split(',')[0] : null;
    const userAgent = request.headers.get('user-agent') || null;

    // Create order and calculate totals using database function
    const { data: orderResult, error: orderError } = await supabase
      .rpc('create_payment_intent_order', {
        p_cart_id: cart_id,
        p_email: email,
        p_shipping_address: shipping_address,
        p_billing_address: billing_address,
        p_phone: phone || null,
        p_customer_notes: customer_notes || null,
        p_promo_code: promo_code || null,
        p_shipping_rate_id: shipping_rate_id || null,
        p_customer_ip: customerIp,
        p_user_agent: userAgent,
      });

    if (orderError || !orderResult || orderResult.length === 0) {
      console.error('Failed to create order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError?.message },
        { status: 500 }
      );
    }

    const order = orderResult[0];
    const { order_id, order_number, total_cents } = order;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_cents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order_id,
        order_number: order_number,
        customer_email: email,
      },
      description: `Order ${order_number}`,
      receipt_email: email,
      // Include shipping details for Stripe Dashboard
      shipping: {
        name: `${shipping_address.firstName} ${shipping_address.lastName}`,
        address: {
          line1: shipping_address.address1,
          line2: shipping_address.address2 || null,
          city: shipping_address.city,
          state: shipping_address.state,
          postal_code: shipping_address.zip,
          country: shipping_address.country || 'US',
        },
      },
    });

    // Update order with Stripe Payment Intent details
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_client_secret: paymentIntent.client_secret,
        payment_method_types: paymentIntent.payment_method_types,
        checkout_step: 'payment',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('Failed to update order with Payment Intent:', updateError);
    }

    // Get full order details with items
    const { data: fullOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          variant_id,
          title,
          variant_title,
          sku,
          quantity,
          price_cents
        )
      `)
      .eq('id', order_id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch full order:', fetchError);
    }

    return NextResponse.json({
      success: true,
      order: fullOrder,
      payment_intent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      },
    });
  } catch (error: any) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}