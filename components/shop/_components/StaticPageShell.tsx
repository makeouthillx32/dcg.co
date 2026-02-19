// components/shop/_components/StaticPageShell.tsx
import React from "react";

export type StaticPageData = {
  title: string;
  slug?: string;
  content: string;
  content_format: "html" | "markdown";
  meta_description?: string | null;
  updated_at?: string | null;
  version?: number | null;
};

function renderContent(page: Pick<StaticPageData, "content" | "content_format">) {
  if (page.content_format === "html") {
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

  // Simple markdown fallback (same style as your current page renderer)
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      {page.content.split("\n").map((line, i) => {
        if (line.trim().startsWith("#")) {
          const level = line.match(/^#+/)?.[0].length || 1;
          const text = line.replace(/^#+\s*/, "");
          const Tag = `h${Math.min(6, Math.max(1, level))}` as keyof JSX.IntrinsicElements;
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

export function StaticPageShell({
  page,
  compact = false,
  showFooter = true,
}: {
  page: StaticPageData;
  compact?: boolean; // nice when embedding into Landing
  showFooter?: boolean;
}) {
  return (
    <div className="bg-background text-foreground">
      <section className={compact ? "py-10 md:py-12" : "py-16 md:py-20"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-4xl">
            {/* Header */}
            <header className="mb-8 border-b border-[hsl(var(--border))] pb-6">
              <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
                {page.title}
              </h1>

              {page.meta_description ? (
                <p className="mt-3 text-base text-[hsl(var(--muted-foreground))]">
                  {page.meta_description}
                </p>
              ) : null}

              {(page.updated_at || page.version != null) && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
                  {page.updated_at ? (
                    <time dateTime={page.updated_at}>
                      Last updated:{" "}
                      {new Date(page.updated_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  ) : null}

                  {page.updated_at && page.version != null ? <span>•</span> : null}

                  {page.version != null ? <span>Version {page.version}</span> : null}
                </div>
              )}
            </header>

            {/* Content */}
            <article className="text-[hsl(var(--foreground))]">
              {renderContent({ content: page.content, content_format: page.content_format })}
            </article>

            {/* Footer */}
            {showFooter ? (
              <footer className="mt-12 border-t border-[hsl(var(--border))] pt-6">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  If you have questions about this page, please{" "}
                  <a href="/contact" className="text-[hsl(var(--primary))] hover:underline">
                    contact us
                  </a>
                  .
                </p>
              </footer>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
