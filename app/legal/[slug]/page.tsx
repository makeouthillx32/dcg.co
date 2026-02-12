// lib/landing/static-pages.server.ts
import { createServerClient } from "@/utils/supabase/server";

export type StaticPageRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  content_format: "html" | "markdown";
  meta_description: string | null;
  is_published: boolean;
  published_at: string | null;
  version: number;
};

function normalizeSlug(slug: string) {
  return slug.replace(/^\/+/, "").trim();
}

export async function getPublishedStaticPageBySlug(slug: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("static_pages")
    .select("*")
    .eq("slug", normalizeSlug(slug))
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as StaticPageRow | null;
}