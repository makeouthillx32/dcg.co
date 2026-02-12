// lib/landing/static-pages.server.ts
import { createServerClient } from "@/utils/supabase/server";

export type StaticPageRow = {
  id: string;
  slug: string; // can be "privacy-policy" OR "/privacy-policy"
  title: string;
  content: string;
  content_format: "html" | "markdown";
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  version: number;
};

function normalizeSlug(slug: unknown) {
  if (typeof slug !== "string") return null;

  const s = slug.trim();
  if (!s) return null;

  // "/privacy-policy" -> "privacy-policy"
  return s.replace(/^\/+/, "");
}

export async function getPublishedStaticPageBySlug(slug: unknown) {
  const normalized = normalizeSlug(slug);
  if (!normalized) return null;

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("static_pages")
    .select("*")
    .eq("is_published", true)
    // Support BOTH DB formats: "privacy-policy" and "/privacy-policy"
    .in("slug", [normalized, `/${normalized}`])
    .maybeSingle();

  if (error) throw new Error(error.message);

  return (data ?? null) as StaticPageRow | null;
}