import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number | null;
  position: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CategoryNode = CategoryRow & { children: CategoryNode[] };

function jsonError(status: number, code: string, message: string, details?: any) {
  return NextResponse.json(
    { ok: false, error: { code, message, details } },
    { status }
  );
}

function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const r of rows) byId.set(r.id, { ...r, children: [] });

  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parent_id && byId.has(r.parent_id)) {
      byId.get(r.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => {
      const ao = a.sort_order ?? a.position ?? 0;
      const bo = b.sort_order ?? b.position ?? 0;
      if (ao !== bo) return ao - bo;
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
    for (const n of nodes) sortNodes(n.children);
  };

  sortNodes(roots);
  return roots;
}

/**
 * GET /api/categories
 * Public NAV category tree/list
 *
 * Query params:
 * - q (optional) search name/slug
 * - limit (default 50)
 * - offset (default 0)
 * - include=tree (optional) nested result
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    const include = (searchParams.get("include") || "").toLowerCase();
    const wantTree = include.split(",").map((s) => s.trim()).includes("tree");

    let query = supabase
      .from("categories")
      .select(
        "id,name,slug,parent_id,sort_order,position,is_active,created_at,updated_at"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("position", { ascending: true })
      .order("name", { ascending: true });

    if (q) {
      query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
    }

    // if you request a tree, do NOT apply pagination (it breaks parent/child)
    if (!wantTree) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) return jsonError(500, "CATEGORY_LIST_FAILED", error.message, error);

    const rows = (data ?? []) as CategoryRow[];

    if (!wantTree) {
      return NextResponse.json({
        ok: true,
        data: rows,
        meta: { limit, offset },
      });
    }

    return NextResponse.json({
      ok: true,
      data: buildTree(rows),
    });
  } catch (e: any) {
    return jsonError(500, "CATEGORIES_ROUTE_CRASH", e?.message ?? "Unknown error", e);
  }
}
