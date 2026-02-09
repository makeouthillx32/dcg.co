import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type Params = {
  params: { id: string };
};

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

// TODO: Replace with your real role gating (admin/catalog manager)
async function requireAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { ok: false };
  if (!data.user) return { ok: false };
  return { ok: true };
}

/**
 * POST /api/products/admin/[id]/images
 * Adds a product image row.
 *
 * Body:
 * {
 *   "bucket_name": "product-images",               // required
 *   "object_path": "products/<productId>/x.jpg",   // required
 *   "alt_text": "Alt text",                        // optional
 *   "sort_order": 0,                               // optional (defaults to append)
 *   "is_primary": false,                           // optional
 *   "is_public": true                              // optional
 * }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await createServerClient(); // ✅ must await

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

  const bucket_name = body?.bucket_name;
  const object_path = body?.object_path;

  const alt_text = body?.alt_text ?? null;

  const sortOrderRaw = body?.sort_order;
  const is_primary = typeof body?.is_primary === "boolean" ? body.is_primary : false;
  const is_public = typeof body?.is_public === "boolean" ? body.is_public : true;

  if (!bucket_name || typeof bucket_name !== "string") {
    return jsonError(400, "INVALID_INPUT", "bucket_name is required");
  }
  if (!object_path || typeof object_path !== "string") {
    return jsonError(400, "INVALID_INPUT", "object_path is required");
  }
  if (alt_text !== null && typeof alt_text !== "string") {
    return jsonError(400, "INVALID_INPUT", "alt_text must be a string or null");
  }

  // If sort_order not provided, append to end by finding max sort_order
  let sort_order: number;

  if (typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw) && sortOrderRaw >= 0) {
    sort_order = sortOrderRaw;
  } else {
    const { data: existing, error: existingErr } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (existingErr) {
      return jsonError(500, "IMAGE_SORT_LOOKUP_FAILED", existingErr.message, existingErr);
    }

    const maxSort =
      existing && existing.length > 0 && typeof existing[0].sort_order === "number"
        ? existing[0].sort_order
        : -1;

    sort_order = maxSort + 1;
  }

  // Optional: if setting as primary, unset any existing primary images for this product
  if (is_primary) {
    const { error: unsetErr } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId)
      .eq("is_primary", true);

    if (unsetErr) {
      return jsonError(500, "IMAGE_PRIMARY_UNSET_FAILED", unsetErr.message, unsetErr);
    }
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      bucket_name,
      object_path,
      alt_text,
      sort_order,
      is_primary,
      is_public,
    })
    .select(
      `
      id,
      product_id,
      bucket_name,
      object_path,
      alt_text,
      sort_order,
      position,
      is_primary,
      is_public,
      blurhash,
      width,
      height,
      mime_type,
      size_bytes,
      created_at
    `
    )
    .single();

  if (error) return jsonError(500, "IMAGE_CREATE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}
