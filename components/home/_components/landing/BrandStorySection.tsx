"use client";

export function BrandStorySection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h3 className="text-2xl font-extrabold">Desert Cowgirl</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
            A modern western vibe—classic silhouettes, warm tones, and statement graphics.
            Built to browse like a Shopify store, but powered by your own stack.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold
                         bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-95 transition"
            >
              About the Brand
            </a>
            <a
              href="#gift-card"
              className="inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold
                         bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]
                         hover:bg-[var(--accent)] transition"
            >
              Gift Card
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--sidebar)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">Section placeholder</p>
          <p className="text-lg font-bold mt-1">Add a “Shop Occasions” carousel + email signup here</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Suggested: featured collection tiles (Galentine, Date Night, Denim Edit…)
          </p>
        </div>
      </div>
    </section>
  );
}
