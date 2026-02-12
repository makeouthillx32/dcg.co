// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getPublishedStaticPageBySlug } from "@/lib/landing/static-pages.server";

function renderContent(page: { content: string; content_format: "html" | "markdown" }) {
  if (page.content_format === "html") {
    return <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content }} />;
  }

  // Minimal markdown fallback (no dependency).
  return (
    <div className="prose max-w-none">
      {page.content.split("\n").map((line, i) =>
        line.trim() ? (
          <p key={i} className="mb-3">
            {line}
          </p>
        ) : (
          <div key={i} className="h-3" />
        )
      )}
    </div>
  );
}

export default async function StaticPage({ params }: { params: { slug: string } }) {
  const page = await getPublishedStaticPageBySlug(params.slug);
  if (!page) return notFound();

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>

      {page.meta_description ? (
        <p className="mt-2 text-muted-foreground">{page.meta_description}</p>
      ) : null}

      <div className="mt-8">{renderContent(page)}</div>
    </section>
  );
}