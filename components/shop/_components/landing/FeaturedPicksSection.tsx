"use client";

import { ProductCardPlaceholder } from "./ProductCardPlaceholder";
import type { LandingProductCard } from "./useLandingData";

export function FeaturedPicksSection({
  featured,
}: {
  featured: LandingProductCard[];
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-12">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold">Featured Picks</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Next step: connect this to your DB and render real products.
            </p>
          </div>
          <a
            href="#best-sellers"
            className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition"
          >
            Best Sellers →
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCardPlaceholder key={p.label} label={p.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
