import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

/**
 * GET /api/products
 * Public product listing (active products only)
 *
 * Query:
 * - q
 * - limit
 * - offset
 * - featured=1 (optional)
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  const featured = searchParams.get("featured");

  let query = supabase
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
      created_at,
      product_images (
        bucket_name,
        object_path,
        alt_text,
        sort_order,
        position,
        is_primary,
        is_public,
        width,
        height,
        blurhash,
        mime_type,
        size_bytes
      )
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (featured === "1" || featured === "true") {
    query = query.eq("is_featured", true);
  }

  if (q) {
    // if you have search_text, this is fine. if not, switch to title/description.
    query = query.ilike("search_text", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "PRODUCT_LIST_FAILED",
          message: error.message,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: data ?? [],
    meta: { limit, offset },
  });
}

/**
 * POST /api/products
 * Create a new product (admin only)
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json(
      { ok: false, error: { code: "AUTH_ERROR", message: authError.message } },
      { status: 401 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const body = await req.json();

  const {
    slug,
    title,
    description = null,
    price_cents,
    compare_at_price_cents = null,
    currency = "USD",
    badge = null,
    is_featured = false,
  } = body;

  if (!slug || !title || typeof price_cents !== "number") {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_INPUT", message: "slug, title, and price_cents are required" },
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      slug,
      title,
      description,
      price_cents,
      compare_at_price_cents,
      currency,
      badge,
      is_featured,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "PRODUCT_CREATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data });
}
