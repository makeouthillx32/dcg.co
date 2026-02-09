import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

/**
 * GET /api/products
 * Public product listing (active products only)
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = Number(searchParams.get("limit") ?? 20);
  const offset = Number(searchParams.get("offset") ?? 0);

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
      created_at,
      product_images (
        storage_path,
        alt,
        position
      )
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (q) {
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
    data,
    meta: {
      limit,
      offset,
    },
  });
}

/**
 * POST /api/products
 * Create a new product (admin only)
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  // 🔒 Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "AUTH_ERROR",
          message: authError.message,
        },
      },
      { status: 401 }
    );
  }

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      },
      { status: 401 }
    );
  }

  // TODO: role check (admin / catalog manager)

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
        error: {
          code: "INVALID_INPUT",
          message: "slug, title, and price_cents are required",
        },
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
      status: "draft", // always start as draft
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "PRODUCT_CREATE_FAILED",
          message: error.message,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    data,
  });
}
