// app/pages/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPublishedStaticPageBySlug } from '@/lib/landing/static-pages.server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
  params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedStaticPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }

  return {
    title: page.title,
    description: page.meta_description || undefined,
    keywords: page.meta_keywords || undefined,
    openGraph: page.og_image_url
      ? {
          images: [page.og_image_url],
        }
      : undefined,
  };
}

// Render content based on format
function renderContent(page: { content: string; content_format: 'html' | 'markdown' }) {
  if (page.content_format === 'html') {
    return (
      <div
        className="
          prose prose-slate max-w-none dark:prose-invert
          overflow-x-hidden
          prose-headings:text-[hsl(var(--foreground))]
          prose-p:text-[hsl(var(--foreground))]
          prose-a:text-[hsl(var(--primary))]
          prose-strong:text-[hsl(var(--foreground))]
          prose-ul:text-[hsl(var(--foreground))]
          prose-ol:text-[hsl(var(--foreground))]
          prose-li:text-[hsl(var(--foreground))]
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md
          [&_table]:w-full [&_table]:overflow-x-auto [&_table]:block [&_table]:whitespace-nowrap sm:[&_table]:whitespace-normal
          [&_pre]:overflow-x-auto [&_pre]:text-sm
          [&_iframe]:max-w-full [&_iframe]:w-full
          [&_video]:max-w-full [&_video]:w-full
          [&_div]:max-w-full
        "
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    );
  }

  // Basic markdown rendering
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert overflow-x-hidden">
      {page.content.split('\n').map((line, i) => {
        if (line.trim().startsWith('#')) {
          const level = line.match(/^#+/)?.[0].length || 1;
          const text = line.replace(/^#+\s*/, '');
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;
          return (
            <Tag key={i} className="text-[hsl(var(--foreground))]">
              {text}
            </Tag>
          );
        }

        return line.trim() ? (
          <p key={i} className="text-[hsl(var(--foreground))]">
            {line}
          </p>
        ) : (
          <br key={i} />
        );
      })}
    </div>
  );
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedStaticPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    // pt accounts for the sticky shop header:
    //   mobile  → single row ~5rem  → pt-20 (5rem)
    //   desktop → logo + nav rows ~13rem → md:pt-52
    <div className="min-h-screen bg-[hsl(var(--background))] pt-20 md:pt-52">
      {/* Page header */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl lg:text-4xl">
            {page.title}
          </h1>
          {page.meta_description && (
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
              {page.meta_description}
            </p>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="overflow-x-hidden">
          {renderContent(page)}
        </div>
      </div>
    </div>
  );
}