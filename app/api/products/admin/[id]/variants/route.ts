import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

type Params = {
  params: { id: string };
};

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json(
    { ok: false, error: { code, message, details } },
    { status }
  );
}

// TODO: Replace with your real role gating (admin/catalog manager)
async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false };
  return { ok: true };
}

/**
 * POST /api/products/admin/[id]/variants
 *
 * Body:
 * {
 *   "title": "Default",                 // required
 *   "sku": "SKU-123",                   // optional
 *   "price_cents": 1999,                // optional (falls back to product price if omitted)
 *   "compare_at_price_cents": 2499,     // optional
 *   "position": 0,                      // optional (defaults to last)
 *
 *   "inventory_enabled": true,          // optional
 *   "stock_on_hand": 10,                // optional
 *   "low_stock_threshold": 2            // optional
 * }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const productId = params.id;
  if (!productId) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const title = body?.title;
  if (!title || typeof title !== "string") {
    return jsonError(400, "INVALID_INPUT", "title is required");
  }

  const sku = body?.sku ?? null;

  const positionRaw = body?.position;
  let position: number | null = null;

  // If position not provided, append
  if (typeof positionRaw === "number") {
    if (!Number.isFinite(positionRaw) || positionRaw < 0) {
      return jsonError(400, "INVALID_POSITION", "position must be a number >= 0");
    }
    position = positionRaw;
  } else {
    const { data: existing, error: existingErr } = await supabase
      .from("product_variants")
      .select("position")
      .eq("product_id", productId)
      .order("position", { ascending: false })
      .limit(1);

    if (existingErr) {
      return jsonError(
        500,
        "VARIANT_POSITION_LOOKUP_FAILED",
        existingErr.message
      );
    }

    const maxPos =
      existing && existing.length > 0 && typeof existing[0].position === "number"
        ? existing[0].position
        : -1;

    position = maxPos + 1;
  }

  // If price not provided, default to product price
  let price_cents = body?.price_cents;
  if (price_cents == null) {
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("price_cents")
      .eq("id", productId)
      .single();

    if (productErr) {
      return jsonError(500, "PRODUCT_PRICE_LOOKUP_FAILED", productErr.message);
    }

    price_cents = product.price_cents;
  }

  if (typeof price_cents !== "number" || !Number.isFinite(price_cents) || price_cents < 0) {
    return jsonError(400, "INVALID_PRICE", "price_cents must be a number >= 0");
  }

  const compare_at_price_cents = body?.compare_at_price_cents ?? null;
  if (
    compare_at_price_cents !== null &&
    (typeof compare_at_price_cents !== "number" ||
      !Number.isFinite(compare_at_price_cents) ||
      compare_at_price_cents < 0)
  ) {
    return jsonError(
      400,
      "INVALID_COMPARE_PRICE",
      "compare_at_price_cents must be a number >= 0 or null"
    );
  }

  // Inventory fields (optional)
  const inventory_enabled =
    typeof body?.inventory_enabled === "boolean" ? body.inventory_enabled : false;

  const stock_on_hand =
    body?.stock_on_hand == null ? 0 : Number(body.stock_on_hand);

  if (!Number.isFinite(stock_on_hand) || stock_on_hand < 0) {
    return jsonError(400, "INVALID_STOCK", "stock_on_hand must be a number >= 0");
  }

  const low_stock_threshold =
    body?.low_stock_threshold == null ? 0 : Number(body.low_stock_threshold);

  if (!Number.isFinite(low_stock_threshold) || low_stock_threshold < 0) {
    return jsonError(
      400,
      "INVALID_LOW_STOCK",
      "low_stock_threshold must be a number >= 0"
    );
  }

  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      title,
      sku,
      price_cents,
      compare_at_price_cents,
      position,
      inventory_enabled,
      stock_on_hand,
      low_stock_threshold,
    })
    .select()
    .single();

  if (error) {
    return jsonError(500, "VARIANT_CREATE_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, data });
}
