import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

async function requireAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { ok: false, status: 401 as const, message: error.message };
  if (!data.user) return { ok: false, status: 401 as const, message: "Authentication required" };

  // TODO: real role gating (admin/catalog manager)
  return { ok: true as const, user: data.user };
}

/**
 * GET /api/products/admin
 * Admin list (any status). Empty list returns ok:true, data:[]
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 200);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);
  const status = (searchParams.get("status") ?? "all").toLowerCase(); // all|active|draft|archived
  const q = (searchParams.get("q") ?? "").trim();

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
        id,
        bucket_name,
        object_path,
        alt_text,
        position,
        sort_order,
        is_primary,
        is_public,
        blurhash,
        width,
        height,
        mime_type,
        size_bytes,
        created_at
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("search_text", `%${q}%`);

  const { data, error } = await query;

  if (error) return jsonError(500, "PRODUCT_ADMIN_LIST_FAILED", error.message, error);

  // Optional: sort images in each product to make UI stable
  const normalized = (data ?? []).map((p: any) => {
    const imgs = (p.product_images ?? []).slice().sort((a: any, b: any) => {
      // prefer sort_order, then position, then created_at
      const sa = typeof a.sort_order === "number" ? a.sort_order : 0;
      const sb = typeof b.sort_order === "number" ? b.sort_order : 0;
      if (sa !== sb) return sa - sb;

      const pa = typeof a.position === "number" ? a.position : 0;
      const pb = typeof b.position === "number" ? b.position : 0;
      if (pa !== pb) return pa - pb;

      const ca = a.created_at ? Date.parse(a.created_at) : 0;
      const cb = b.created_at ? Date.parse(b.created_at) : 0;
      return ca - cb;
    });

    return { ...p, product_images: imgs };
  });

  return NextResponse.json({
    ok: true,
    data: normalized,
    meta: { limit, offset, status, q },
  });
}

/**
 * POST /api/products/admin
 * Create product (draft)
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const {
    slug,
    title,
    description = null,
    price_cents,
    compare_at_price_cents = null,
    currency = "USD",
    badge = null,
    is_featured = false,
    search_text = null,
  } = body ?? {};

  if (!slug || !title || typeof price_cents !== "number") {
    return jsonError(400, "INVALID_INPUT", "slug, title, and price_cents are required");
  }

  if (price_cents < 0) {
    return jsonError(400, "INVALID_PRICE", "price_cents must be >= 0");
  }
  if (compare_at_price_cents !== null && typeof compare_at_price_cents !== "number") {
    return jsonError(400, "INVALID_COMPARE_PRICE", "compare_at_price_cents must be a number or null");
  }
  if (typeof currency !== "string" || currency.length < 3) {
    return jsonError(400, "INVALID_CURRENCY", "currency must be a 3-letter code like USD");
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
      search_text,
      status: "draft",
    })
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
      created_at
    `
    )
    .single();

  if (error) return jsonError(500, "PRODUCT_CREATE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}
