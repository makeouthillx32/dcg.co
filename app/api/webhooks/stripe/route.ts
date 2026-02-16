// app/api/webhooks/stripe/route.ts
import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Create Supabase client (service role for webhook operations)
    const supabase = await createServerClient();

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(supabase, paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(supabase, paymentIntent);
        break;
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleRequiresAction(supabase, paymentIntent);
        break;
      }

      case 'charge.succeeded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeSucceeded(supabase, charge);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(supabase, charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', details: error.message },
      { status: 500 }
    );
  }
}

// Handle successful payment
async function handlePaymentSucceeded(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent
) {
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error('No order_id in payment intent metadata');
    return;
  }

  // Get payment method details
  let paymentMethodDetails: any = {};
  if (paymentIntent.payment_method) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string
      );
      
      if (paymentMethod.card) {
        paymentMethodDetails = {
          payment_method_id: paymentMethod.id,
          payment_method_brand: paymentMethod.card.brand,
          payment_method_last4: paymentMethod.card.last4,
          payment_method_exp_month: paymentMethod.card.exp_month,
          payment_method_exp_year: paymentMethod.card.exp_year,
        };
      }
    } catch (err) {
      console.error('Failed to retrieve payment method:', err);
    }
  }

  // Update order
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'processing',
      payment_succeeded_at: new Date().toISOString(),
      checkout_step: 'complete',
      ...paymentMethodDetails,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order on payment success:', error);
  } else {
    console.log(`Order ${orderId} marked as paid`);
    // TODO: Send confirmation email here
    // TODO: Trigger inventory reduction
  }
}

// Handle failed payment
async function handlePaymentFailed(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent
) {
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error('No order_id in payment intent metadata');
    return;
  }

  const lastError = paymentIntent.last_payment_error;

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_failed_at: new Date().toISOString(),
      payment_error_code: lastError?.code || null,
      payment_error_message: lastError?.message || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order on payment failure:', error);
  } else {
    console.log(`Order ${orderId} payment failed: ${lastError?.message}`);
    // TODO: Send payment failure email
  }
}

// Handle requires action (3D Secure, etc.)
async function handleRequiresAction(
  supabase: any,
  paymentIntent: Stripe.PaymentIntent
) {
  const orderId = paymentIntent.metadata.order_id;

  if (!orderId) {
    console.error('No order_id in payment intent metadata');
    return;
  }

  const { error } = await supabase
    .from('orders')
    .update({
      requires_action: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order requires_action:', error);
  }
}

// Handle successful charge (for fraud/risk data)
async function handleChargeSucceeded(
  supabase: any,
  charge: Stripe.Charge
) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) return;

  // Get order by payment intent
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!order) return;

  // Update with charge and risk data
  const { error } = await supabase
    .from('orders')
    .update({
      stripe_charge_id: charge.id,
      stripe_risk_score: charge.outcome?.risk_score || null,
      stripe_risk_level: charge.outcome?.risk_level || null,
      billing_details: charge.billing_details || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (error) {
    console.error('Failed to update order with charge details:', error);
  }
}

// Handle refunded charge
async function handleChargeRefunded(
  supabase: any,
  charge: Stripe.Charge
) {
  const paymentIntentId = charge.payment_intent as string;

  if (!paymentIntentId) return;

  // Get order by payment intent
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!order) return;

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'refunded',
      status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id);

  if (error) {
    console.error('Failed to update order on refund:', error);
  } else {
    console.log(`Order ${order.id} refunded`);
    // TODO: Send refund confirmation email
    // TODO: Restore inventory
  }
}