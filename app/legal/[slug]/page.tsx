import { createServerClient } from "@/utils/supabase/server";

export default async function Page({ params }: { params: { slug?: string } }) {
  const supabase = await createServerClient();

  const slug = params?.slug;
  console.log("[legal page] params.slug =", slug);

  const { data: raw, error } = await supabase
    .from("static_pages")
    .select("id,slug,title,is_published,content_format,version")
    .ilike("slug", `%${slug}%`);

  console.log("[legal page] query error =", error);
  console.log("[legal page] raw rows =", raw);

  // keep your normal renderer below after you see logs
  return <pre>{JSON.stringify({ slug, error, raw }, null, 2)}</pre>;
}