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

async function getTagSlug(supabase: SupabaseClient, tag_id: string) {
  const { data, error } = await supabase
    .from("tags")
    .select("id, slug")
    .eq("id", tag_id)
    .single();

  if (error) return { ok: false as const, error };
  return { ok: true as const, slug: data.slug as string };
}

async function readProductTagsArray(supabase: SupabaseClient, product_id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("id, tags")
    .eq("id", product_id)
    .single();

  if (error) return { ok: false as const, error };

  const arr = Array.isArray((data as any)?.tags) ? ((data as any).tags as string[]) : [];
  return { ok: true as const, tags: arr };
}

async function writeProductTagsArray(supabase: SupabaseClient, product_id: string, tags: string[]) {
  const { data, error } = await supabase
    .from("products")
    .update({ tags })
    .eq("id", product_id)
    .select("id, tags")
    .single();

  if (error) return { ok: false as const, error };
  return { ok: true as const, data };
}

/**
 * POST /api/products/admin/[id]/tags
 * Body: { "tag_id": "uuid" }
 */
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const tag_id = body?.tag_id;
  if (!tag_id || typeof tag_id !== "string") {
    return jsonError(400, "INVALID_TAG_ID", "tag_id is required");
  }

  // 1) Lookup slug (also validates tag exists)
  const slugRes = await getTagSlug(supabase, tag_id);
  if (!slugRes.ok) {
    const status = slugRes.error.code === "PGRST116" ? 404 : 500;
    return jsonError(status, status === 404 ? "TAG_NOT_FOUND" : "TAG_LOOKUP_FAILED", slugRes.error.message, slugRes.error);
  }

  // 2) Assign via join table (idempotent)
  const { data: joinRow, error: joinErr } = await supabase
    .from("product_tags")
    .upsert({ product_id, tag_id }, { onConflict: "product_id,tag_id", ignoreDuplicates: false })
    .select("*")
    .single();

  if (joinErr) return jsonError(500, "ASSIGN_TAG_FAILED", joinErr.message, joinErr);

  // 3) Sync products.tags (text[]) with slug
  const arrRes = await readProductTagsArray(supabase, product_id);
  if (!arrRes.ok) return jsonError(500, "PRODUCT_TAGS_FETCH_FAILED", arrRes.error.message, arrRes.error);

  const next = Array.from(new Set([...arrRes.tags, slugRes.slug]));
  const saveRes = await writeProductTagsArray(supabase, product_id, next);
  if (!saveRes.ok) return jsonError(500, "PRODUCT_TAGS_UPDATE_FAILED", saveRes.error.message, saveRes.error);

  return NextResponse.json({ ok: true, data: joinRow, product_tags: saveRes.data.tags });
}

/**
 * DELETE /api/products/admin/[id]/tags?tag_id=uuid
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  const { searchParams } = new URL(req.url);
  const tag_id = searchParams.get("tag_id");
  if (!tag_id) return jsonError(400, "INVALID_TAG_ID", "tag_id query param is required");

  // 1) Lookup slug (so we can remove it from products.tags)
  const slugRes = await getTagSlug(supabase, tag_id);
  if (!slugRes.ok) {
    const status = slugRes.error.code === "PGRST116" ? 404 : 500;
    return jsonError(status, status === 404 ? "TAG_NOT_FOUND" : "TAG_LOOKUP_FAILED", slugRes.error.message, slugRes.error);
  }

  // 2) Delete join row (scoped)
  const { data: deleted, error: delErr } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", product_id)
    .eq("tag_id", tag_id)
    .select("*")
    .maybeSingle();

  if (delErr) return jsonError(500, "UNASSIGN_TAG_FAILED", delErr.message, delErr);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Tag not assigned to this product");

  // 3) Sync products.tags (remove slug)
  const arrRes = await readProductTagsArray(supabase, product_id);
  if (!arrRes.ok) return jsonError(500, "PRODUCT_TAGS_FETCH_FAILED", arrRes.error.message, arrRes.error);

  const next = arrRes.tags.filter((t) => t !== slugRes.slug);
  const saveRes = await writeProductTagsArray(supabase, product_id, next);
  if (!saveRes.ok) return jsonError(500, "PRODUCT_TAGS_UPDATE_FAILED", saveRes.error.message, saveRes.error);

  return NextResponse.json({ ok: true, data: deleted, product_tags: saveRes.data.tags });
}