// app/api/pos/charge/route.ts
//
// POST /api/pos/charge
// Creates an order + Stripe payment intent for a POS sale.
// Returns { ok, order: { id, order_number, total_cents }, payment_intent: { client_secret } }

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
  try {
    const supabase = await createServerClient();

    // Get the current user (for pos_staff_profile_id)
    const { data: { user } } = await supabase.auth.getUser();

    // Get profile id if user is logged in
    let staffProfileId: string | null = null;
    const staffEmail: string | null = user?.email ?? null;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      staffProfileId = profile?.id ?? null;
    }

    const body = await req.json();
    const {
      items = [],
      custom_items = [],
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

    // Build notes for custom items (can't be FK'd in order_items)
    const customNotes = custom_items.length
      ? `Custom: ${custom_items.map((i: any) => `${i.label || "Custom"} $${(i.amount_cents / 100).toFixed(2)}`).join(", ")}`
      : null;
    const internalNotes = ["[POS] In-person sale", customNotes].filter(Boolean).join(" | ");

    // Insert the order — only columns that actually exist and are required
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number:       generateOrderNumber(),
        status:             "pending",
        payment_status:     "pending",
        order_source:       "pos",
        source:             "pos",                    // NOT NULL column
        pos_staff_profile_id: staffProfileId,
        profile_id:         staffProfileId,
        auth_user_id:       user?.id ?? null,
        subtotal_cents:     total_cents,
        shipping_cents:     0,
        tax_cents:          0,
        discount_cents:     0,
        total_cents,
        currency:           "USD",
        customer_email:     customer_email ?? null,
        customer_first_name: customer_first_name ?? null,
        customer_last_name: customer_last_name ?? null,
        // Constraint: profile_id OR email must be non-null
        email:              customer_email ?? staffEmail,
        internal_notes:     internalNotes,
      })
      .select("id, order_number, total_cents")
      .single();

    if (orderErr || !order) {
      console.error("[pos/charge] order insert error:", orderErr);
      return jsonError(500, "ORDER_CREATE_FAILED", orderErr?.message ?? "Failed to create order");
    }

    // Insert real product order_items (product_id/variant_id are NOT NULL)
    if (items.length) {
      const orderItems = items.map((item: any) => ({
        order_id:      order.id,
        product_id:    item.product_id,
        variant_id:    item.variant_id,
        product_title: item.product_title,
        variant_title: item.variant_title ?? "",  // NOT NULL in schema
        sku:           item.sku ?? null,
        quantity:      item.quantity,
        price_cents:   item.price_cents,
        currency:      "USD",
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) {
        console.error("[pos/charge] order_items insert error:", itemsErr);
        await supabase.from("orders").delete().eq("id", order.id);
        return jsonError(500, "ORDER_ITEMS_FAILED", itemsErr.message);
      }
    }

    // Create Stripe payment intent
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount:   total_cents,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          order_id:     order.id,
          order_number: order.order_number,
          order_source: "pos",
          staff_user_id: user?.id ?? "unknown",
        },
        description: `POS — ${order.order_number}`,
      });
    } catch (stripeErr: any) {
      console.error("[pos/charge] stripe error:", stripeErr);
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
        id:          order.id,
        order_number: order.order_number,
        total_cents:  order.total_cents,
      },
      payment_intent: {
        id:            paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      },
    });

  } catch (err: any) {
    // Catch-all so we always return valid JSON, never a broken response
    console.error("[pos/charge] unhandled error:", err);
    return jsonError(500, "INTERNAL_ERROR", err?.message ?? "Internal server error");
  }
}