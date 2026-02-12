// app/legal/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPublishedStaticPageBySlug, getAllPublishedStaticPages } from '@/lib/landing/static-pages.server';

type Props = {
  params: Promise<{ slug: string }>;
};

// Legal pages are typically: privacy-policy, terms-and-conditions
const LEGAL_SLUGS = ['privacy-policy', 'terms-and-conditions'];

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedStaticPageBySlug(slug);

  if (!page) {
    return {
      title: 'Legal Document Not Found',
    };
  }

  return {
    title: `${page.title} | Desert Cowgirl`,
    description: page.meta_description || `${page.title} for Desert Cowgirl boutique`,
    keywords: page.meta_keywords || undefined,
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate static params for legal pages only
export async function generateStaticParams() {
  const pages = await getAllPublishedStaticPages();
  
  // Filter to only legal pages
  const legalPages = pages.filter((page) => LEGAL_SLUGS.includes(page.slug));
  
  return legalPages.map((page) => ({
    slug: page.slug,
  }));
}

// Render content based on format
function renderContent(page: { content: string; content_format: 'html' | 'markdown' }) {
  if (page.content_format === 'html') {
    return (
      <div
        className="prose prose-slate max-w-none dark:prose-invert
          prose-headings:font-semibold prose-headings:text-[hsl(var(--foreground))]
          prose-p:text-[hsl(var(--foreground))]
          prose-a:text-[hsl(var(--primary))] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[hsl(var(--foreground))] prose-strong:font-semibold
          prose-ul:text-[hsl(var(--foreground))]
          prose-ol:text-[hsl(var(--foreground))]
          prose-li:text-[hsl(var(--foreground))]
          prose-h2:mt-8 prose-h2:mb-4
          prose-h3:mt-6 prose-h3:mb-3"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    );
  }

  // Basic markdown rendering
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      {page.content.split('\n').map((line, i) => {
        if (line.trim().startsWith('#')) {
          const level = line.match(/^#+/)?.[0].length || 1;
          const text = line.replace(/^#+\s*/, '');
          const Tag = `h${level}` as keyof JSX.IntrinsicElements;
          return (
            <Tag key={i} className="font-semibold text-[hsl(var(--foreground))]">
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

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedStaticPageBySlug(slug);

  if (!page) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Container */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-8 lg:px-16">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-4">
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-[hsl(var(--muted-foreground))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </a>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-5xl">
            {page.title}
          </h1>
          
          {page.meta_description && (
            <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))]">
              {page.meta_description}
            </p>
          )}
          
          {/* Effective Date */}
          <div className="mt-6 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              Effective Date: {new Date(page.updated_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </header>

        {/* Content */}
        <article className="border-t border-[hsl(var(--border))] pt-8">
          {renderContent(page)}
        </article>

        {/* Footer */}
        <footer className="mt-16 border-t border-[hsl(var(--border))] pt-8">
          <div className="rounded-lg bg-[hsl(var(--muted))]/30 p-6">
            <h3 className="font-semibold text-[hsl(var(--foreground))]">
              Questions?
            </h3>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              If you have any questions about our {page.title.toLowerCase()}, please{' '}
              <a
                href="mailto:hello@desertcowgirl.com"
                className="text-[hsl(var(--primary))] hover:underline"
              >
                contact us
              </a>
              .
            </p>
          </div>
          
          {/* Other Legal Pages */}
          <div className="mt-6">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
              Other Legal Documents:
            </p>
            <div className="mt-2 flex flex-wrap gap-4">
              {slug !== 'privacy-policy' && (
                <a
                  href="/legal/privacy-policy"
                  className="text-sm text-[hsl(var(--primary))] hover:underline"
                >
                  Privacy Policy
                </a>
              )}
              {slug !== 'terms-and-conditions' && (
                <a
                  href="/legal/terms-and-conditions"
                  className="text-sm text-[hsl(var(--primary))] hover:underline"
                >
                  Terms & Conditions
                </a>
              )}
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}