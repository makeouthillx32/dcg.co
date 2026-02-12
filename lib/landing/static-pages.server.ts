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

function normalizeSlug(slug: string) {
  // " /privacy-policy " -> "privacy-policy"
  return slug.replace(/^\/+/, "").trim();
}

export async function getPublishedStaticPageBySlug(slug: string) {
  const supabase = await createServerClient();
  const normalized = normalizeSlug(slug);

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