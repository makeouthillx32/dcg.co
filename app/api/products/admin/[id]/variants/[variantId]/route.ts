import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

type Params = {
  params: { id: string; variantId: string };
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
 * PATCH /api/products/admin/[id]/variants/[variantId]
 *
 * Body supports partial updates:
 * {
 *   "title": "Large",
 *   "sku": "SKU-123",
 *   "price_cents": 1999,
 *   "compare_at_price_cents": 2499,
 *   "position": 2,
 *   "inventory_enabled": true,
 *   "stock_on_hand": 10,
 *   "low_stock_threshold": 2
 * }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const productId = params.id;
  const variantId = params.variantId;

  if (!productId) return jsonError(400, "INVALID_ID", "Missing product id");
  if (!variantId) return jsonError(400, "INVALID_VARIANT_ID", "Missing variant id");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const update: Record<string, any> = {};
  const input = body ?? {};

  if ("title" in input) {
    if (!input.title || typeof input.title !== "string") {
      return jsonError(400, "INVALID_TITLE", "title must be a non-empty string");
    }
    update.title = input.title;
  }

  if ("sku" in input) {
    if (input.sku !== null && typeof input.sku !== "string") {
      return jsonError(400, "INVALID_SKU", "sku must be a string or null");
    }
    update.sku = input.sku;
  }

  if ("price_cents" in input) {
    if (
      typeof input.price_cents !== "number" ||
      !Number.isFinite(input.price_cents) ||
      input.price_cents < 0
    ) {
      return jsonError(400, "INVALID_PRICE", "price_cents must be a number >= 0");
    }
    update.price_cents = input.price_cents;
  }

  if ("compare_at_price_cents" in input) {
    const v = input.compare_at_price_cents;
    if (
      v !== null &&
      (typeof v !== "number" || !Number.isFinite(v) || v < 0)
    ) {
      return jsonError(
        400,
        "INVALID_COMPARE_PRICE",
        "compare_at_price_cents must be a number >= 0 or null"
      );
    }
    update.compare_at_price_cents = v;
  }

  if ("position" in input) {
    const v = input.position;
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0) {
      return jsonError(400, "INVALID_POSITION", "position must be a number >= 0");
    }
    update.position = v;
  }

  if ("inventory_enabled" in input) {
    if (typeof input.inventory_enabled !== "boolean") {
      return jsonError(
        400,
        "INVALID_INVENTORY_ENABLED",
        "inventory_enabled must be a boolean"
      );
    }
    update.inventory_enabled = input.inventory_enabled;
  }

  if ("stock_on_hand" in input) {
    const v = Number(input.stock_on_hand);
    if (!Number.isFinite(v) || v < 0) {
      return jsonError(400, "INVALID_STOCK", "stock_on_hand must be a number >= 0");
    }
    update.stock_on_hand = v;
  }

  if ("low_stock_threshold" in input) {
    const v = Number(input.low_stock_threshold);
    if (!Number.isFinite(v) || v < 0) {
      return jsonError(
        400,
        "INVALID_LOW_STOCK",
        "low_stock_threshold must be a number >= 0"
      );
    }
    update.low_stock_threshold = v;
  }

  if (Object.keys(update).length === 0) {
    return jsonError(400, "NO_FIELDS", "No updatable fields were provided");
  }

  // Scoped update: variant must belong to product
  const { data, error } = await supabase
    .from("product_variants")
    .update(update)
    .eq("id", variantId)
    .eq("product_id", productId)
    .select()
    .single();

  if (error) {
    const status =
      error.code === "PGRST116" || /0 rows/i.test(error.message) ? 404 : 500;

    return jsonError(
      status,
      status === 404 ? "NOT_FOUND" : "VARIANT_UPDATE_FAILED",
      status === 404 ? "Variant not found for this product" : error.message
    );
  }

  return NextResponse.json({ ok: true, data });
}

/**
 * DELETE /api/products/admin/[id]/variants/[variantId]
 * Deletes variant row (scoped to product).
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const productId = params.id;
  const variantId = params.variantId;

  if (!productId) return jsonError(400, "INVALID_ID", "Missing product id");
  if (!variantId) return jsonError(400, "INVALID_VARIANT_ID", "Missing variant id");

  const { data, error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", productId)
    .select()
    .single();

  if (error) {
    const status =
      error.code === "PGRST116" || /0 rows/i.test(error.message) ? 404 : 500;

    return jsonError(
      status,
      status === 404 ? "NOT_FOUND" : "VARIANT_DELETE_FAILED",
      status === 404 ? "Variant not found for this product" : error.message
    );
  }

  return NextResponse.json({ ok: true, data });
}
