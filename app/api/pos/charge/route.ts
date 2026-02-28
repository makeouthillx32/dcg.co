// app/api/pos/charge/route.ts
//
// POST /api/pos/charge
// Admin-only. Creates an order + Stripe payment intent for a POS sale.
//
// Body:
//   items[]           - real product cart items { product_id, variant_id, product_title,
//                       variant_title, sku, quantity, price_cents }
//   custom_items[]    - keypad amounts { label, amount_cents } — stored in notes, not order_items
//   customer_email    - optional
//   customer_first_name - optional
//   customer_last_name  - optional

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

function generateOrderNumber(): string {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DCG-POS-${ymd}-${rand}`;
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const body = await req.json();
  const {
    items = [],           // real product items
    custom_items = [],    // keypad amounts
    customer_email,
    customer_first_name,
    customer_last_name,
  } = body;

  if (!items.length && !custom_items.length) {
    return jsonError(400, "EMPTY_CART", "Cart is empty");
  }

  // Calculate total
  const itemsTotal: number = items.reduce(
    (sum: number, i: any) => sum + i.price_cents * i.quantity,
    0
  );
  const customTotal: number = custom_items.reduce(
    (sum: number, i: any) => sum + i.amount_cents,
    0
  );
  const total_cents = itemsTotal + customTotal;

  if (total_cents <= 0) return jsonError(400, "INVALID_TOTAL", "Total must be > 0");

  // Build internal notes (custom items don't have FKs so we store them as notes)
  const customNotes = custom_items.length
    ? `Custom amounts: ${custom_items.map((i: any) => `${i.label || "Custom"} $${(i.amount_cents / 100).toFixed(2)}`).join(", ")}`
    : null;
  const internalNotes = ["[POS] In-person sale", customNotes].filter(Boolean).join(" | ");

  // Create the order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_number: generateOrderNumber(),
      status: "pending",
      payment_status: "pending",
      order_source: "pos",
      pos_staff_profile_id: profile.id,
      profile_id: profile.id,
      auth_user_id: user.id,
      subtotal_cents: total_cents,
      shipping_cents: 0,
      tax_cents: 0,
      discount_cents: 0,
      total_cents,
      currency: "USD",
      customer_email: customer_email ?? null,
      customer_first_name: customer_first_name ?? null,
      customer_last_name: customer_last_name ?? null,
      email: customer_email ?? null,
      internal_notes: internalNotes,
    })
    .select("id, order_number, total_cents")
    .single();

  if (orderErr || !order) {
    return jsonError(500, "ORDER_CREATE_FAILED", orderErr?.message ?? "Failed to create order");
  }

  // Insert order_items for real products only (product_id / variant_id are NOT NULL)
  if (items.length) {
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_title: item.product_title,
      variant_title: item.variant_title ?? null,
      sku: item.sku ?? null,
      quantity: item.quantity,
      price_cents: item.price_cents,
      currency: "USD",
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) {
      // Clean up and fail
      await supabase.from("orders").delete().eq("id", order.id);
      return jsonError(500, "ORDER_ITEMS_FAILED", itemsErr.message);
    }
  }

  // Create Stripe payment intent
  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: total_cents,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        order_source: "pos",
        staff_user_id: user.id,
      },
      description: `POS — ${order.order_number}`,
    });
  } catch (stripeErr: any) {
    await supabase.from("orders").delete().eq("id", order.id);
    return jsonError(500, "STRIPE_FAILED", stripeErr.message);
  }

  // Link payment intent to order
  await supabase
    .from("orders")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", order.id);

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      order_number: order.order_number,
      total_cents: order.total_cents,
    },
    payment_intent: {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
    },
  });
}