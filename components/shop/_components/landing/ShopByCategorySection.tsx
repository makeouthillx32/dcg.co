"use client";

import { CategoryTile } from "./CategoryTile";
import type { LandingCategory } from "./useLandingData";

export function ShopByCategorySection({
  categories,
}: {
  categories: LandingCategory[];
}) {
  return (
    <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-12">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Shop by Category</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            A storefront layout that feels like Shopify—clean, fast, and easy to browse.
          </p>
        </div>
        <a
          href="#shop"
          className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition"
        >
          View all
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((c) => (
          <CategoryTile key={c.title} title={c.title} href={c.href} />
        ))}
      </div>
    </section>
  );
}
