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

// TODO: Replace with your real role gating (admin/catalog manager)
async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false };
  return { ok: true };
}

/**
 * POST /api/products/admin/[id]/images
 * Adds a product image row.
 *
 * Body:
 * {
 *   "storage_path": "products/<productId>/image.png",   // required
 *   "alt": "Alt text",                                 // optional
 *   "position": 0                                      // optional (defaults to last)
 * }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required");
  }

  const productId = params.id;
  if (!productId) {
    return jsonError(400, "INVALID_ID", "Missing product id");
  }

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const storage_path = body?.storage_path;
  const alt = body?.alt ?? null;
  const positionRaw = body?.position;

  if (!storage_path || typeof storage_path !== "string") {
    return jsonError(400, "INVALID_INPUT", "storage_path is required");
  }

  // If position not provided, append to end by finding current max position
  let position: number | null = null;

  if (typeof positionRaw === "number") {
    position = positionRaw;
  } else {
    const { data: existing, error: existingErr } = await supabase
      .from("product_images")
      .select("position")
      .eq("product_id", productId)
      .order("position", { ascending: false })
      .limit(1);

    if (existingErr) {
      return jsonError(500, "IMAGE_POSITION_LOOKUP_FAILED", existingErr.message);
    }

    const maxPos =
      existing && existing.length > 0 && typeof existing[0].position === "number"
        ? existing[0].position
        : -1;

    position = maxPos + 1;
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      storage_path,
      alt,
      position,
    })
    .select()
    .single();

  if (error) {
    return jsonError(500, "IMAGE_CREATE_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, data });
}
