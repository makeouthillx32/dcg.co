import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type Params = { params: { id: string } };

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

async function requireAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { ok: false, status: 401 as const, message: error.message };
  if (!data.user) return { ok: false, status: 401 as const, message: "Authentication required" };
  return { ok: true as const };
}

function normalizeImage(img: any) {
  const storage_path = img.storage_path ?? img.object_path ?? null;
  const alt = img.alt ?? img.alt_text ?? null;
  const position =
    typeof img.position === "number"
      ? img.position
      : typeof img.sort_order === "number"
        ? img.sort_order
        : 0;

  return {
    ...img,
    storage_path,
    alt,
    position,
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const id = params.id;
  if (!id) return jsonError(400, "INVALID_ID", "Missing product id");

  // ✅ Use (*) so we never request columns that don't exist
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_images (*),
      product_variants (*),
      product_categories (
        categories (*)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" || /0 rows/i.test(error.message) ? 404 : 500;
    return jsonError(
      status,
      status === 404 ? "NOT_FOUND" : "PRODUCT_FETCH_FAILED",
      status === 404 ? "Product not found" : error.message
    );
  }

  const categories =
    data?.product_categories?.map((pc: any) => pc.categories).filter(Boolean) ?? [];

  const images = (data?.product_images ?? [])
    .map(normalizeImage)
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

  const variants = (data?.product_variants ?? [])
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

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

export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const id = params.id;
  if (!id) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  // keep this permissive because your schema differs between environments
  const allowed = new Set([
    "slug",
    "title",
    "description",
    "price_cents",
    "compare_at_price_cents",
    "badge",
    "is_featured",
    "status",
    "search_text",
    "seo_title",
    "seo_description",
    "og_image_override_url",
  ]);

  const update: Record<string, any> = {};
  for (const [k, v] of Object.entries(body ?? {})) {
    if (allowed.has(k)) update[k] = v;
  }

  if (!Object.keys(update).length) {
    return jsonError(400, "NO_FIELDS", "No updatable fields were provided");
  }

  const { data, error } = await supabase.from("products").update(update).eq("id", id).select().single();

  if (error) return jsonError(500, "PRODUCT_UPDATE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const id = params.id;
  if (!id) return jsonError(400, "INVALID_ID", "Missing product id");

  const { data, error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id)
    .select()
    .single();

  if (error) return jsonError(500, "PRODUCT_ARCHIVE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}
