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
        storage_path,
        alt,
        position
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.ilike("search_text", `%${q}%`);

  const { data, error } = await query;

  if (error) return jsonError(500, "PRODUCT_ADMIN_LIST_FAILED", error.message, error);

  return NextResponse.json({
    ok: true,
    data: data ?? [],
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
    .select()
    .single();

  if (error) return jsonError(500, "PRODUCT_CREATE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}
