import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

type Params = { params: { id: string } };

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

async function requireAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error) return { ok: false, status: 401 as const, message: error.message };
  if (!data.user) return { ok: false, status: 401 as const, message: "Authentication required" };
  // TODO: real role gating
  return { ok: true as const };
}

/**
 * POST /api/products/admin/[id]/images
 * Body:
 * {
 *   "bucket_name": "product-images",
 *   "object_path": "products/<productId>/<file>.jpg",
 *   "alt_text": "Alt text" | null,
 *   "position": 0 | null,
 *   "is_primary": true|false
 * }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await createClient("regular");

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const productId = params.id;
  if (!productId) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const bucket_name = body?.bucket_name ?? "product-images";
  const object_path = body?.object_path;
  const alt_text = body?.alt_text ?? null;
  const is_primary = Boolean(body?.is_primary ?? false);

  if (!object_path || typeof object_path !== "string") {
    return jsonError(400, "INVALID_INPUT", "object_path is required");
  }
  if (typeof bucket_name !== "string" || !bucket_name.trim()) {
    return jsonError(400, "INVALID_BUCKET", "bucket_name must be a string");
  }
  if (alt_text !== null && typeof alt_text !== "string") {
    return jsonError(400, "INVALID_ALT_TEXT", "alt_text must be a string or null");
  }

  // position: if not provided, append to end
  let position: number | null = null;
  if (typeof body?.position === "number") {
    position = body.position;
  } else {
    const { data: existing, error: existingErr } = await supabase
      .from("product_images")
      .select("position")
      .eq("product_id", productId)
      .order("position", { ascending: false })
      .limit(1);

    if (existingErr) return jsonError(500, "IMAGE_POSITION_LOOKUP_FAILED", existingErr.message);

    const maxPos =
      existing && existing.length > 0 && typeof existing[0].position === "number"
        ? existing[0].position
        : -1;

    position = maxPos + 1;
  }

  // if is_primary true, unset others first
  if (is_primary) {
    const { error: unsetErr } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    if (unsetErr) return jsonError(500, "IMAGE_PRIMARY_UNSET_FAILED", unsetErr.message);
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      bucket_name,
      object_path,
      alt_text,
      position,
      is_primary,
    })
    .select()
    .single();

  if (error) return jsonError(500, "IMAGE_CREATE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}
