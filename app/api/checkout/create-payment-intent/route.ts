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

    console.log('Creating payment intent for:', { cart_id, email });

    // Validation
    if (!cart_id || !email || !shipping_address || !shipping_rate_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        price_cents,
        product_id,
        variant_id,
        products (
          id,
          title,
          images
        ),
        product_variants (
          id,
          title,
          sku
        )
      `)
      .eq('cart_id', cart_id);

    if (cartError || !cartItems || cartItems.length === 0) {
      console.error('Cart error:', cartError);
      return NextResponse.json(
        { error: 'Cart not found or empty' },
        { status: 400 }
      );
    }

    console.log('Cart items:', cartItems);

    // Calculate subtotal
    const subtotal_cents = cartItems.reduce(
      (sum, item) => sum + (item.price_cents * item.quantity),
      0
    );

    // Get shipping rate
    const { data: shippingRate, error: shippingError } = await supabase
      .from('shipping_rates')
      .select('*')
      .eq('id', shipping_rate_id)
      .single();

    if (shippingError || !shippingRate) {
      console.error('Shipping rate error:', shippingError);
      return NextResponse.json(
        { error: 'Invalid shipping rate' },
        { status: 400 }
      );
    }

    const shipping_cents = shippingRate.price_cents || 0;

    // Calculate tax
    const { data: taxData } = await supabase
      .from('tax_rates')
      .select('rate')
      .eq('state', shipping_address.state)
      .eq('is_active', true);

    const taxRate = taxData?.reduce((sum, t) => sum + Number(t.rate), 0) || 0;
    const tax_cents = Math.round((subtotal_cents + shipping_cents) * taxRate);

    // Handle promo code
    let discount_cents = 0;
    let promo_code_id = null;

    if (promo_code) {
      const { data: promoData } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promoData) {
        promo_code_id = promoData.id;
        
        if (promoData.discount_type === 'percentage') {
          discount_cents = Math.round(subtotal_cents * (promoData.discount_value / 100));
        } else if (promoData.discount_type === 'fixed_amount') {
          discount_cents = promoData.discount_value * 100;
        } else if (promoData.discount_type === 'free_shipping') {
          discount_cents = shipping_cents;
        }

        // Apply max discount cap
        if (promoData.max_discount_cents && discount_cents > promoData.max_discount_cents) {
          discount_cents = promoData.max_discount_cents;
        }
      }
    }

    // Calculate total
    const total_cents = Math.max(0, subtotal_cents + shipping_cents + tax_cents - discount_cents);

    console.log('Order totals:', { subtotal_cents, shipping_cents, tax_cents, discount_cents, total_cents });

    // Generate order number
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const order_number = `DCG-${timestamp}-${random}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number,
        user_id: null, // Guest checkout
        email,
        status: 'pending',
        payment_status: 'pending',
        subtotal_cents,
        shipping_cents,
        tax_cents,
        discount_cents,
        total_cents,
        shipping_address,
        billing_address: billing_address || shipping_address,
        phone,
        customer_notes,
        promo_code_id,
        shipping_rate_id,
        checkout_step: 'payment',
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError?.message },
        { status: 500 }
      );
    }

    console.log('Order created:', order.id);

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price_cents: item.price_cents,
      title: item.products?.title || 'Product',
      variant_title: item.product_variants?.title || null,
      sku: item.product_variants?.sku || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // Don't fail - order is created, items can be fixed later
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total_cents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
      },
      description: `Order ${order.order_number}`,
      shipping: {
        name: `${shipping_address.firstName} ${shipping_address.lastName}`,
        address: {
          line1: shipping_address.address1,
          line2: shipping_address.address2 || undefined,
          city: shipping_address.city,
          state: shipping_address.state,
          postal_code: shipping_address.zip,
          country: 'US',
        },
      },
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Update order with payment intent
    await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        stripe_client_secret: paymentIntent.client_secret,
      })
      .eq('id', order.id);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_cents: order.total_cents,
      },
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
        error: 'Failed to create payment intent',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}