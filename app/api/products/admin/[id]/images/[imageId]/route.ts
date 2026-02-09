import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

type Params = {
  params: { id: string; imageId: string };
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
 * PATCH /api/products/admin/[id]/images/[imageId]
 * Update product image fields.
 *
 * Body supports partial:
 * {
 *   "alt": "New alt",
 *   "position": 2
 * }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required");
  }

  const productId = params.id;
  const imageId = params.imageId;

  if (!productId) return jsonError(400, "INVALID_ID", "Missing product id");
  if (!imageId) return jsonError(400, "INVALID_IMAGE_ID", "Missing image id");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const update: Record<string, any> = {};

  if ("alt" in (body ?? {})) {
    const alt = body.alt;
    if (alt !== null && typeof alt !== "string") {
      return jsonError(400, "INVALID_ALT", "alt must be a string or null");
    }
    update.alt = alt;
  }

  if ("position" in (body ?? {})) {
    const pos = body.position;
    if (typeof pos !== "number" || !Number.isFinite(pos) || pos < 0) {
      return jsonError(400, "INVALID_POSITION", "position must be a number >= 0");
    }
    update.position = pos;
  }

  if (Object.keys(update).length === 0) {
    return jsonError(400, "NO_FIELDS", "No updatable fields were provided");
  }

  // Ensure the image belongs to the product (scoped update)
  const { data, error } = await supabase
    .from("product_images")
    .update(update)
    .eq("id", imageId)
    .eq("product_id", productId)
    .select()
    .single();

  if (error) {
    const status =
      error.code === "PGRST116" || /0 rows/i.test(error.message) ? 404 : 500;

    return jsonError(
      status,
      status === 404 ? "NOT_FOUND" : "IMAGE_UPDATE_FAILED",
      status === 404 ? "Image not found for this product" : error.message
    );
  }

  return NextResponse.json({ ok: true, data });
}

/**
 * DELETE /api/products/admin/[id]/images/[imageId]
 * Removes the image row (does NOT delete the underlying storage object).
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) {
    return jsonError(401, "UNAUTHORIZED", "Authentication required");
  }

  const productId = params.id;
  const imageId = params.imageId;

  if (!productId) return jsonError(400, "INVALID_ID", "Missing product id");
  if (!imageId) return jsonError(400, "INVALID_IMAGE_ID", "Missing image id");

  const { data, error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId)
    .select()
    .single();

  if (error) {
    const status =
      error.code === "PGRST116" || /0 rows/i.test(error.message) ? 404 : 500;

    return jsonError(
      status,
      status === 404 ? "NOT_FOUND" : "IMAGE_DELETE_FAILED",
      status === 404 ? "Image not found for this product" : error.message
    );
  }

  return NextResponse.json({ ok: true, data });
}
