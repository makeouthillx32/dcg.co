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
  // - storage_path (old UI)
  // - object_path (your current DB)
  const object_path = (body?.object_path ?? body?.storage_path) as string | undefined;
  const bucket_name = (body?.bucket_name ?? "product-images") as string;
  const alt_text = (body?.alt_text ?? body?.alt ?? null) as string | null;

  if (!object_path || typeof object_path !== "string") {
    return jsonError(400, "INVALID_INPUT", "object_path (or storage_path) is required");
  }

  // Position: append by default
  let position = typeof body?.position === "number" ? body.position : null;

  if (position === null) {
    const { data: existing, error: existingErr } = await supabase
      .from("product_images")
      .select("position, sort_order")
      .eq("product_id", productId)
      .order("position", { ascending: false })
      .limit(1);

    if (existingErr) return jsonError(500, "IMAGE_POSITION_LOOKUP_FAILED", existingErr.message, existingErr);

    const last = existing?.[0];
    const lastPos =
      typeof last?.position === "number"
        ? last.position
        : typeof last?.sort_order === "number"
          ? last.sort_order
          : -1;

    position = lastPos + 1;
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      bucket_name,
      object_path,
      alt_text,
      position,
      sort_order: position, // keep both consistent if you use both
      is_primary: position === 0,
      is_public: true,
    })
    .select()
    .single();

  if (error) return jsonError(500, "IMAGE_CREATE_FAILED", error.message, error);

  return NextResponse.json({ ok: true, data });
}
