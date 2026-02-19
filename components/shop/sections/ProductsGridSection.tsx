// components/shop/sections/ProductsGridSection.tsx
"use client";

import type { SectionComponentProps } from "./SectionRegistry";
import { LandingProductCard } from "@/components/shop/_components/ProductCard";
import { useLandingData } from "@/components/shop/_components/useLandingData";
import Link from "next/link";

export default function ProductsGridSection({ section }: SectionComponentProps) {
  const { featured, loading } = useLandingData();

  const title = section.config?.title ?? "Products";
  const limit = Number(section.config?.limit ?? 8);
  const viewAllHref = section.config?.viewAllHref ?? "/shop";
  const startIndex = Number(section.config?.startIndex ?? 0);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </section>
    );
  }

  // Slice the featured products based on startIndex and limit
  const products = (featured ?? []).slice(startIndex, startIndex + limit);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-3xl sm:text-4xl font-bold">{title}</h3>
        </div>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <LandingProductCard key={p.id} product={p} />
        ))}

        {products.length === 0 ? (
          <div className="col-span-full text-center text-sm text-[var(--muted-foreground)] py-12">
            No products found yet. Create products and set status to <b>active</b>.
          </div>
        ) : null}
      </div>
    </section>
  );
}