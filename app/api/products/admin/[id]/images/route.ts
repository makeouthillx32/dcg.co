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

export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const productId = params.id;
  if (!productId) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  // Accept either:
  // - object_path (current DB)
  // - storage_path (legacy UI payload name)
  const object_path = (body?.object_path ?? body?.storage_path) as string | undefined;
  const bucket_name = (body?.bucket_name ?? "product-images") as string;
  const alt_text = (body?.alt_text ?? body?.alt ?? null) as string | null;

  if (!object_path || typeof object_path !== "string") {
    return jsonError(400, "INVALID_INPUT", "object_path (or storage_path) is required");
  }
  if (alt_text !== null && typeof alt_text !== "string") {
    return jsonError(400, "INVALID_ALT", "alt_text/alt must be a string or null");
  }
  if (typeof bucket_name !== "string" || !bucket_name.trim()) {
    return jsonError(400, "INVALID_BUCKET", "bucket_name must be a non-empty string");
  }

  // Position: append by default
  let position: number | null = typeof body?.position === "number" ? body.position : null;
  if (position !== null && (!Number.isFinite(position) || position < 0)) {
    return jsonError(400, "INVALID_POSITION", "position must be a number >= 0");
  }

  if (position === null) {
    // Since your data keeps position == sort_order, max(position) is enough and cheap
    const { data: maxRow, error: maxErr } = await supabase
      .from("product_images")
      .select("position")
      .eq("product_id", productId)
      .order("position", { ascending: false })
      .limit(1);

    if (maxErr) return jsonError(500, "IMAGE_POSITION_LOOKUP_FAILED", maxErr.message, maxErr);

    const lastPos = typeof maxRow?.[0]?.position === "number" ? maxRow[0].position : -1;
    position = lastPos + 1; // will become 3 for your current product
  }

  // If position==0 we’re creating a new primary image.
  // Keep DB clean: unset any existing primaries for this product first.
  if (position === 0) {
    const { error: clearErr } = await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId)
      .eq("is_primary", true);

    if (clearErr) return jsonError(500, "PRIMARY_CLEAR_FAILED", clearErr.message, clearErr);
  }

  const insertRow = {
    product_id: productId,
    bucket_name,
    object_path,
    alt_text,
    position,
    sort_order: position,      // keep synced (matches your schema behavior)
    is_primary: position === 0,
    is_public: true,
  };

  const { data, error } = await supabase
    .from("product_images")
    .insert(insertRow)
    .select("*")
    .single();

  if (error) return jsonError(500, "IMAGE_CREATE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}