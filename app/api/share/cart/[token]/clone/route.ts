// app/api/share/cart/[token]/clone/route.ts
// POST — copies all items from a shared cart into the viewer's active cart.
// Works for both guests (session_id) and authenticated members (user_id).

import { createServerClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function jsonOk(data: any) {
  return NextResponse.json({ ok: true, data });
}

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

// Resolve the caller's identity from auth session or x-session-id header
async function getIdentity(
  req: NextRequest,
  supabase: Awaited<ReturnType<typeof createServerClient>>
) {
  const sessionId = req.headers.get("x-session-id");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const userId = !error ? (user?.id ?? null) : null;
  if (!userId && !sessionId) return null;
  return { userId, sessionId: sessionId ?? null };
}

// Find the caller's active cart, or create one if it doesn't exist
async function getOrCreateActiveCartId(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  identity: { userId: string | null; sessionId: string | null }
): Promise<string | null> {
  const q = supabase
    .from("carts")
    .select("id")
    .eq("status", "active")
    .single();

  const query = identity.userId
    ? q.eq("user_id", identity.userId)
    : q.eq("session_id", identity.sessionId);

  const { data: existing } = await query;
  if (existing?.id) return existing.id;

  // Create a fresh cart for this visitor
  const { data: created, error } = await supabase
    .from("carts")
    .insert({
      user_id: identity.userId,
      session_id: identity.sessionId,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !created?.id) return null;
  return created.id;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const supabase = await createServerClient();

    // ── 1. Identify the viewer ──────────────────────────────────────────────
    const identity = await getIdentity(request, supabase);
    if (!identity) {
      return jsonError(400, "NO_IDENTITY", "No user or session identified");
    }

    // ── 2. Load the shared cart ─────────────────────────────────────────────
    const { data: sharedCart, error: cartError } = await supabase
      .from("carts")
      .select(`
        id,
        share_enabled,
        share_expires_at,
        cart_items (
          id,
          variant_id,
          quantity,
          price_cents
        )
      `)
      .eq("share_token", token)
      .eq("share_enabled", true)
      .single();

    if (cartError || !sharedCart) {
      return jsonError(404, "NOT_FOUND", "Shared cart not found");
    }

    if (
      sharedCart.share_expires_at &&
      new Date(sharedCart.share_expires_at) < new Date()
    ) {
      return jsonError(410, "EXPIRED", "This share link has expired");
    }

    const sharedItems: any[] = sharedCart.cart_items ?? [];
    if (sharedItems.length === 0) {
      return jsonOk({ cloned: 0, message: "Nothing to add — the wishlist is empty." });
    }

    // ── 3. Get or create the viewer's cart ──────────────────────────────────
    const viewerCartId = await getOrCreateActiveCartId(supabase, identity);
    if (!viewerCartId) {
      return jsonError(500, "CART_CREATE_FAILED", "Could not create your cart");
    }

    // ── 4. Fetch current items in viewer's cart to handle merging ───────────
    const { data: existingItems } = await supabase
      .from("cart_items")
      .select("id, variant_id, quantity")
      .eq("cart_id", viewerCartId);

    const existingByVariant = new Map<string, { id: string; quantity: number }>();
    for (const item of existingItems ?? []) {
      existingByVariant.set(item.variant_id, { id: item.id, quantity: item.quantity });
    }

    // ── 5. Validate variants are still active + have stock ──────────────────
    const variantIds = sharedItems.map((i) => i.variant_id).filter(Boolean);

    const { data: variants } = await supabase
      .from("product_variants")
      .select(`
        id,
        is_active,
        price_cents,
        inventory:product_inventory (
          track_inventory,
          quantity
        )
      `)
      .in("id", variantIds)
      .eq("is_active", true);

    const validVariants = new Map<string, any>();
    for (const v of variants ?? []) {
      validVariants.set(v.id, v);
    }

    // ── 6. Build upsert rows ─────────────────────────────────────────────────
    const toInsert: any[] = [];
    const toUpdate: Array<{ id: string; quantity: number }> = [];
    let skipped = 0;

    for (const item of sharedItems) {
      const variant = validVariants.get(item.variant_id);
      if (!variant) {
        skipped++;
        continue; // variant gone or inactive
      }

      // Stock check
      const inv = Array.isArray(variant.inventory)
        ? variant.inventory[0]
        : variant.inventory;
      if (inv?.track_inventory && (inv.quantity ?? 0) < 1) {
        skipped++;
        continue; // out of stock
      }

      const existing = existingByVariant.get(item.variant_id);

      if (existing) {
        // Merge quantities, cap at 99
        const newQty = Math.min(99, existing.quantity + item.quantity);
        toUpdate.push({ id: existing.id, quantity: newQty });
      } else {
        toInsert.push({
          cart_id: viewerCartId,
          variant_id: item.variant_id,
          quantity: Math.min(99, item.quantity),
          // Snapshot the live price, not the shared-cart price
          price_cents: variant.price_cents ?? item.price_cents,
        });
      }
    }

    // ── 7. Execute DB writes ─────────────────────────────────────────────────
    const errors: string[] = [];

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert(toInsert);
      if (insertError) {
        console.error("Clone insert error:", insertError);
        errors.push("Some items could not be added.");
      }
    }

    for (const update of toUpdate) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: update.quantity })
        .eq("id", update.id);
      if (updateError) {
        console.error("Clone update error:", updateError);
        errors.push("Some quantities could not be updated.");
      }
    }

    // ── 8. Track the clone in shared_cart_views ──────────────────────────────
    const viewerSessionId =
      request.headers.get("x-session-id") ?? `anon_${Date.now()}`;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null;

    supabase
      .rpc("track_shared_cart_view", {
        p_share_token: token,
        p_viewer_session_id: viewerSessionId,
        p_ip_address: ipAddress,
        p_user_agent: request.headers.get("user-agent") ?? "",
        p_referrer: request.headers.get("referer") ?? "",
        p_cloned: true,
      })
      .then(() => {})
      .catch(() => {});
    // (fire-and-forget — if it fails, don't block the response)

    const cloned = toInsert.length + toUpdate.length;

    return jsonOk({
      cloned,
      skipped,
      warnings: errors.length > 0 ? errors : undefined,
      message:
        cloned > 0
          ? `${cloned} item${cloned !== 1 ? "s" : ""} added to your cart!`
          : "No new items were added.",
    });
  } catch (err) {
    console.error("Clone shared cart error:", err);
    return jsonError(500, "INTERNAL", "Internal server error", err);
  }
}