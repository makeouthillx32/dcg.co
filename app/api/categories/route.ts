import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

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
 * GET /api/categories
 * Public category list (flat).
 *
 * Query:
 *  - q=search
 *  - include=tree (returns nested tree structure)
 */
export async function GET(req: NextRequest) {
  const supabase = createServerClient();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const include = searchParams.get("include");
  const includeTree = include === "tree";

  let query = supabase
    .from("categories")
    .select("id, slug, name, parent_id, created_at")
    .order("name", { ascending: true });

  if (q) {
    // Search on name (and slug as a fallback)
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return jsonError(500, "CATEGORY_LIST_FAILED", error.message);
  }

  if (!includeTree) {
    return NextResponse.json({ ok: true, data });
  }

  // Build simple tree from flat list
  const nodes = (data ?? []).map((c: any) => ({ ...c, children: [] as any[] }));
  const byId = new Map<string, any>(nodes.map((n: any) => [n.id, n]));

  const roots: any[] = [];
  for (const n of nodes) {
    if (n.parent_id && byId.has(n.parent_id)) {
      byId.get(n.parent_id).children.push(n);
    } else {
      roots.push(n);
    }
  }

  return NextResponse.json({
    ok: true,
    data: roots,
    meta: { format: "tree" },
  });
}

/**
 * POST /api/categories
 * Admin create category.
 *
 * Body:
 * { "name": "Hats", "slug": "hats", "parent_id": "uuid|null" }
 */
export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const name = body?.name;
  const slug = body?.slug;
  const parent_id = body?.parent_id ?? null;

  if (!name || typeof name !== "string") {
    return jsonError(400, "INVALID_NAME", "name is required");
  }
  if (!slug || typeof slug !== "string") {
    return jsonError(400, "INVALID_SLUG", "slug is required");
  }
  if (parent_id !== null && typeof parent_id !== "string") {
    return jsonError(400, "INVALID_PARENT_ID", "parent_id must be a uuid string or null");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, parent_id })
    .select()
    .single();

  if (error) {
    return jsonError(500, "CATEGORY_CREATE_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, data });
}

/**
 * PATCH /api/categories
 * Admin update category.
 *
 * Body:
 * { "id": "uuid", "name"?: "...", "slug"?: "...", "parent_id"?: "uuid|null" }
 */
export async function PATCH(req: NextRequest) {
  const supabase = createServerClient();

  const gate = await requireAdmin(supabase);
  if (!gate.ok) return jsonError(401, "UNAUTHORIZED", "Authentication required");

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON");
  }

  const id = body?.id;
  if (!id || typeof id !== "string") {
    return jsonError(400, "INVALID_ID", "id is required");
  }

  const update: Record<string, any> = {};
  if ("name" in body) {
    if (!body.name || typeof body.name !== "string") {
      return jsonError(400, "INVALID_NAME", "name must be a non-empty string");
    }
    update.name = body.name;
  }
  if ("slug" in body) {
    if (!body.slug || typeof body.slug !== "string") {
      return jsonError(400, "INVALID_SLUG", "slug must be a non-empty string");
    }
    update.slug = body.slug;
  }
  if ("parent_id" in body) {
    const p = body.parent_id;
    if (p !== null && typeof p !== "string") {
      return jsonError(400, "INVALID_PARENT_ID", "parent_id must be a uuid string or null");
    }
    update.parent_id = p;
  }

  if (Object.keys(update).length === 0) {
    return jsonError(400, "NO_FIELDS", "No updatable fields were provided");
  }

  const { data, error } = await supabase
    .from("categories")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return jsonError(500, "CATEGORY_UPDATE_FAILED", error.message);
  }

  return NextResponse.json({ ok: true, data });
}
