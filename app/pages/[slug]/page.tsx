// app/pages/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPublishedStaticPageBySlug, getAllPublishedStaticPages } from '@/lib/landing/static-pages.server';

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

// Generate static params for all published pages
export async function generateStaticParams() {
  const pages = await getAllPublishedStaticPages();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

// Render content based on format
function renderContent(page: { content: string; content_format: 'html' | 'markdown' }) {
  if (page.content_format === 'html') {
    return (
      <div
        className="prose prose-slate max-w-none dark:prose-invert
          prose-headings:text-[hsl(var(--foreground))]
          prose-p:text-[hsl(var(--foreground))]
          prose-a:text-[hsl(var(--primary))]
          prose-strong:text-[hsl(var(--foreground))]
          prose-ul:text-[hsl(var(--foreground))]
          prose-ol:text-[hsl(var(--foreground))]"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    );
  }

  // Basic markdown rendering (you can add a proper markdown parser later)
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
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
          <p key={i} className="mb-3 text-[hsl(var(--foreground))]">
            {line}
          </p>
        ) : (
          <div key={i} className="h-3" />
        );
      })}
    </div>
  );
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedStaticPageBySlug(slug);

  if (!page) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Container */}
      <section className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-8 lg:px-12">
        {/* Header */}
        <header className="mb-8 border-b border-[hsl(var(--border))] pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
            {page.title}
          </h1>
          {page.meta_description && (
            <p className="mt-3 text-base text-[hsl(var(--muted-foreground))]">
              {page.meta_description}
            </p>
          )}
          
          {/* Metadata */}
          <div className="mt-4 flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <time dateTime={page.updated_at}>
              Last updated: {new Date(page.updated_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </time>
            <span>•</span>
            <span>Version {page.version}</span>
          </div>
        </header>

        {/* Content */}
        <article className="text-[hsl(var(--foreground))]">
          {renderContent(page)}
        </article>

        {/* Footer */}
        <footer className="mt-12 border-t border-[hsl(var(--border))] pt-6">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            If you have questions about this page, please{' '}
            <a
              href="/contact"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              contact us
            </a>
            .
          </p>
        </footer>
      </section>
    </div>
  );
}