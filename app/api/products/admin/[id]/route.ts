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

async function requireAuth(supabase: ReturnType<typeof createServerClient>) {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

/**
 * NOTE: Role check placeholder.
 * Wire this to your existing role system (profile/role_label or set-role route).
 */
async function requireAdmin(
  supabase: ReturnType<typeof createServerClient>
): Promise<{ ok: boolean; reason?: string }> {
  // TODO: implement based on your roles system
  // Example patterns you might use:
  // - read from profiles table by user.id -> role_label
  // - read from JWT claims if you set them
  // For now: authenticated == allowed (replace ASAP)
  const { user } = await requireAuth(supabase);
  if (!user) return { ok: false, reason: "UNAUTHORIZED" };
  return { ok: true };
}

/**
 * GET /api/products/admin/[id]
 * Admin product detail (any status), includes variants/images/categories
 */
export async function GET(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const id = params.id;
  if (!id) return jsonError(400, "INVALID_ID", "Missing product id");

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      slug,
      title,
      description,
      price_cents,
      compare_at_price_cents,
      currency,
      badge,
      is_featured,
      status,
      search_text,
      seo_title,
      seo_description,
      og_image_override_url,
      created_at,
      updated_at,

      product_images (
        id,
        storage_path,
        alt,
        position,
        created_at
      ),

      product_variants (
        id,
        product_id,
        title,
        sku,
        price_cents,
        compare_at_price_cents,
        position,
        inventory_enabled,
        stock_on_hand,
        low_stock_threshold,
        created_at
      ),

      product_categories (
        categories (
          id,
          slug,
          name,
          parent_id
        )
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    const status =
      error.code === "PGRST116" || /0 rows/i.test(error.message) ? 404 : 500;
    return jsonError(
      status,
      status === 404 ? "NOT_FOUND" : "PRODUCT_FETCH_FAILED",
      status === 404 ? "Product not found" : error.message
    );
  }

  const categories =
    data?.product_categories?.map((pc: any) => pc.categories).filter(Boolean) ??
    [];

  const images = (data?.product_images ?? []).slice().sort((a: any, b: any) => {
    const pa = typeof a.position === "number" ? a.position : 0;
    const pb = typeof b.position === "number" ? b.position : 0;
    return pa - pb;
  });

  const variants = (data?.product_variants ?? [])
    .slice()
    .sort((a: any, b: any) => {
      const pa = typeof a.position === "number" ? a.position : 0;
      const pb = typeof b.position === "number" ? b.position : 0;
      return pa - pb;
    });

  return NextResponse.json({
    ok: true,
    data: {
      ...data,
      product_images: images,
      product_variants: variants,
      categories,
    },
  });
}

/**
 * PATCH /api/products/admin/[id]
 * Admin update product
 *
 * Accepts partial updates, e.g.:
 * {
 *   "title": "...",
 *   "slug": "...",
 *   "description": "...",
 *   "price_cents": 1234,
 *   "compare_at_price_cents": 1500,
 *   "currency": "USD",
 *   "badge": "New",
 *   "is_featured": true,
 *   "status": "active" | "draft" | "archived",
 *   "seo_title": "...",
 *   "seo_description": "...",
 *   "og_image_override_url": "..."
 * }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const id = params.id;
  if (!id) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  // Whitelist fields we allow updates for
  const allowed: Record<string, true> = {
    slug: true,
    title: true,
    description: true,
    price_cents: true,
    compare_at_price_cents: true,
    currency: true,
    badge: true,
    is_featured: true,
    status: true,
    seo_title: true,
    seo_description: true,
    og_image_override_url: true,
    search_text: true, // optional (can be auto-generated later)
  };

  const update: Record<string, any> = {};
  for (const [k, v] of Object.entries(body ?? {})) {
    if (allowed[k]) update[k] = v;
  }

  if (Object.keys(update).length === 0) {
    return jsonError(400, "NO_FIELDS", "No updatable fields were provided");
  }

  // Basic sanity checks
  if ("price_cents" in update && typeof update.price_cents !== "number") {
    return jsonError(400, "INVALID_PRICE", "price_cents must be a number");
  }
  if (
    "compare_at_price_cents" in update &&
    update.compare_at_price_cents !== null &&
    typeof update.compare_at_price_cents !== "number"
  ) {
    return jsonError(
      400,
      "INVALID_COMPARE_PRICE",
      "compare_at_price_cents must be a number or null"
    );
  }
  if (
    "status" in update &&
    !["active", "draft", "archived"].includes(String(update.status))
  ) {
    return jsonError(400, "INVALID_STATUS", "status must be active|draft|archived");
  }

  const { data, error } = await supabase
    .from("products")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return jsonError(500, "PRODUCT_UPDATE_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, data });
}

/**
 * DELETE /api/products/admin/[id]
 * Soft-delete (archive) product
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const id = params.id;
  if (!id) return jsonError(400, "INVALID_ID", "Missing product id");

  const { data, error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return jsonError(500, "PRODUCT_ARCHIVE_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, data });
}
