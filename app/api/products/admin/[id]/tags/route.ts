import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

type Params = { params: { id: string } };

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false };
  return { ok: true };
}

/**
 * POST /api/products/admin/[id]/tags
 * Body: { "tag_id": "uuid" }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "INVALID_JSON", "Body must be valid JSON"); }

  const tag_id = body?.tag_id;
  if (!tag_id || typeof tag_id !== "string") {
    return jsonError(400, "INVALID_TAG_ID", "tag_id is required");
  }

  const { data, error } = await supabase
    .from("product_tags")
    .insert({ product_id, tag_id })
    .select()
    .single();

  if (error) return jsonError(500, "ASSIGN_TAG_FAILED", error.message);
  return NextResponse.json({ ok: true, data });
}

/**
 * DELETE /api/products/admin/[id]/tags?tag_id=uuid
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  const { searchParams } = new URL(req.url);
  const tag_id = searchParams.get("tag_id");
  if (!tag_id) return jsonError(400, "INVALID_TAG_ID", "tag_id query param is required");

  const { data, error } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", product_id)
    .eq("tag_id", tag_id)
    .select()
    .single();

  if (error) return jsonError(500, "UNASSIGN_TAG_FAILED", error.message);
  return NextResponse.json({ ok: true, data });
}
