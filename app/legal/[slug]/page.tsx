// app/legal/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPublishedStaticPageBySlug } from "@/lib/landing/static-pages.server";

export default async function Page({ params }: { params: { slug?: string } }) {
  const page = await getPublishedStaticPageBySlug(params?.slug);
  if (!page) return notFound();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
      {page.meta_description ? (
        <p className="mt-3 text-muted-foreground">{page.meta_description}</p>
      ) : null}
      <div className="mt-8 prose max-w-none">
        {page.content_format === "html" ? (
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        ) : (
          page.content.split("\n").map((line, i) => <p key={i}>{line}</p>)
        )}
      </div>
    </section>
  );
}