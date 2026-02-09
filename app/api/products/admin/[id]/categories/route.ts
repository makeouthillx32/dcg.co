import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

type Params = { params: { id: string } };

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

// TODO: Replace with your real role gating (admin/catalog manager)
async function requireAdmin(supabase: ReturnType<typeof createServerClient>) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false };
  return { ok: true };
}

/**
 * POST /api/products/admin/[id]/categories
 * Body: { "category_id": "uuid" }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "INVALID_JSON", "Body must be valid JSON"); }

  const category_id = body?.category_id;
  if (!category_id || typeof category_id !== "string") {
    return jsonError(400, "INVALID_CATEGORY_ID", "category_id is required");
  }

  const { data, error } = await supabase
    .from("product_categories")
    .insert({ product_id, category_id })
    .select()
    .single();

  if (error) return jsonError(500, "ASSIGN_CATEGORY_FAILED", error.message);
  return NextResponse.json({ ok: true, data });
}

/**
 * DELETE /api/products/admin/[id]/categories?category_id=uuid
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  const { searchParams } = new URL(req.url);
  const category_id = searchParams.get("category_id");
  if (!category_id) return jsonError(400, "INVALID_CATEGORY_ID", "category_id query param is required");

  const { data, error } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", product_id)
    .eq("category_id", category_id)
    .select()
    .single();

  if (error) return jsonError(500, "UNASSIGN_CATEGORY_FAILED", error.message);
  return NextResponse.json({ ok: true, data });
}
