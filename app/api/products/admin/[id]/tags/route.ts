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

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function readProductTagsArray(supabase: SupabaseClient, product_id: string) {
  const { data, error } = await supabase.from("products").select("id, tags").eq("id", product_id).single();
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

async function getTagById(supabase: SupabaseClient, tag_id: string) {
  const { data, error } = await supabase.from("tags").select("id, slug, name").eq("id", tag_id).single();
  if (error) return { ok: false as const, error };
  return { ok: true as const, data };
}

async function getTagBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase.from("tags").select("id, slug, name").eq("slug", slug).single();
  if (error) return { ok: false as const, error };
  return { ok: true as const, data };
}

async function upsertTagBySlug(supabase: SupabaseClient, slug: string, name: string) {
  // Assumes tags.slug is unique (typical). If not unique, you’ll want to add a unique index.
  const { data, error } = await supabase
    .from("tags")
    .upsert({ slug, name }, { onConflict: "slug" })
    .select("id, slug, name")
    .single();

  if (error) return { ok: false as const, error };
  return { ok: true as const, data };
}

/**
 * POST /api/products/admin/[id]/tags
 * UI sends: { slug, name }
 * Also supports legacy: { tag_id }
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

  // Accept either { slug, name } OR { tag_id }
  const tag_id = body?.tag_id;
  const slug = body?.slug;
  const name = body?.name;

  let tag: { id: string; slug: string; name: string } | null = null;

  if (typeof tag_id === "string" && isUuid(tag_id)) {
    const r = await getTagById(supabase, tag_id);
    if (!r.ok) {
      const status = r.error.code === "PGRST116" ? 404 : 500;
      return jsonError(status, status === 404 ? "TAG_NOT_FOUND" : "TAG_LOOKUP_FAILED", r.error.message, r.error);
    }
    tag = r.data as any;
  } else {
    if (!slug || typeof slug !== "string") {
      return jsonError(400, "INVALID_SLUG", "slug is required");
    }
    if (!name || typeof name !== "string") {
      return jsonError(400, "INVALID_NAME", "name is required");
    }

    const up = await upsertTagBySlug(supabase, slug, name);
    if (!up.ok) return jsonError(500, "TAG_UPSERT_FAILED", up.error.message, up.error);
    tag = up.data as any;
  }

  // Attach (idempotent because PK is (product_id, tag_id))
  const { data: joinRow, error: joinErr } = await supabase
    .from("product_tags")
    .upsert({ product_id, tag_id: tag!.id }, { onConflict: "product_id,tag_id" })
    .select("*")
    .single();

  if (joinErr) return jsonError(500, "ASSIGN_TAG_FAILED", joinErr.message, joinErr);

  // Keep products.tags (text[]) in sync as a slug cache (optional but you already have it)
  const arrRes = await readProductTagsArray(supabase, product_id);
  if (!arrRes.ok) return jsonError(500, "PRODUCT_TAGS_FETCH_FAILED", arrRes.error.message, arrRes.error);

  const next = Array.from(new Set([...(arrRes.tags ?? []), tag!.slug]));
  const saveRes = await writeProductTagsArray(supabase, product_id, next);
  if (!saveRes.ok) return jsonError(500, "PRODUCT_TAGS_UPDATE_FAILED", saveRes.error.message, saveRes.error);

  return NextResponse.json({
    ok: true,
    data: {
      tag,
      join: joinRow,
      product_tags: saveRes.data.tags,
    },
  });
}

/**
 * DELETE /api/products/admin/[id]/tags
 * UI sends: { tag: "<uuid-or-slug>" }
 * Also supports query: ?tag_id=uuid
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const supabase = await createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(gate.status, "UNAUTHORIZED", gate.message);

  const product_id = params.id;
  if (!product_id) return jsonError(400, "INVALID_ID", "Missing product id");

  // Support either body { tag } or query ?tag_id=
  const { searchParams } = new URL(req.url);
  const tagIdFromQuery = searchParams.get("tag_id");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    // allow empty body if query is provided
  }

  const tagValue = (body?.tag ?? tagIdFromQuery) as string | null;
  if (!tagValue || typeof tagValue !== "string") {
    return jsonError(400, "INVALID_TAG", "Provide { tag: <uuid-or-slug> } or ?tag_id=");
  }

  // Resolve to tag record
  let tag: { id: string; slug: string; name?: string } | null = null;

  if (isUuid(tagValue)) {
    const r = await getTagById(supabase, tagValue);
    if (!r.ok) {
      const status = r.error.code === "PGRST116" ? 404 : 500;
      return jsonError(status, status === 404 ? "TAG_NOT_FOUND" : "TAG_LOOKUP_FAILED", r.error.message, r.error);
    }
    tag = r.data as any;
  } else {
    const r = await getTagBySlug(supabase, tagValue);
    if (!r.ok) {
      const status = r.error.code === "PGRST116" ? 404 : 500;
      return jsonError(status, status === 404 ? "TAG_NOT_FOUND" : "TAG_LOOKUP_FAILED", r.error.message, r.error);
    }
    tag = r.data as any;
  }

  // Delete join row
  const { data: deleted, error: delErr } = await supabase
    .from("product_tags")
    .delete()
    .eq("product_id", product_id)
    .eq("tag_id", tag!.id)
    .select("*")
    .maybeSingle();

  if (delErr) return jsonError(500, "UNASSIGN_TAG_FAILED", delErr.message, delErr);
  if (!deleted) return jsonError(404, "NOT_FOUND", "Tag not assigned to this product");

  // Update products.tags cache
  const arrRes = await readProductTagsArray(supabase, product_id);
  if (!arrRes.ok) return jsonError(500, "PRODUCT_TAGS_FETCH_FAILED", arrRes.error.message, arrRes.error);

  const next = (arrRes.tags ?? []).filter((t) => t !== tag!.slug);
  const saveRes = await writeProductTagsArray(supabase, product_id, next);
  if (!saveRes.ok) return jsonError(500, "PRODUCT_TAGS_UPDATE_FAILED", saveRes.error.message, saveRes.error);

  return NextResponse.json({
    ok: true,
    data: {
      tag,
      deleted,
      product_tags: saveRes.data.tags,
    },
  });
}