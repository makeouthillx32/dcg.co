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
 * POST /api/products/admin/[id]/collections
 * Body: { "collection_id": "uuid" }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any;
  try { body = await req.json(); } catch { return jsonError(400, "INVALID_JSON", "Body must be valid JSON"); }

  const collection_id = body?.collection_id;
  if (!collection_id || typeof collection_id !== "string") {
    return jsonError(400, "INVALID_COLLECTION_ID", "collection_id is required");
  }

  const { data, error } = await supabase
    .from("product_collections")
    .insert({ product_id, collection_id })
    .select()
    .single();

  if (error) return jsonError(500, "ASSIGN_COLLECTION_FAILED", error.message);
  return NextResponse.json({ ok: true, data });
}

/**
 * DELETE /api/products/admin/[id]/collections?collection_id=uuid
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = createServerClient();
  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  const { searchParams } = new URL(req.url);
  const collection_id = searchParams.get("collection_id");
  if (!collection_id) {
    return jsonError(400, "INVALID_COLLECTION_ID", "collection_id query param is required");
  }

  const { data, error } = await supabase
    .from("product_collections")
    .delete()
    .eq("product_id", product_id)
    .eq("collection_id", collection_id)
    .select()
    .single();

  if (error) return jsonError(500, "UNASSIGN_COLLECTION_FAILED", error.message);
  return NextResponse.json({ ok: true, data });
}
