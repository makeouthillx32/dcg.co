// components/home/Landing.tsx
"use client";

import { TopBanner } from "@/components/shop/_components/TopBanner";
import { useLandingData } from "@/components/shop/_components/useLandingData";
import { LandingProductCard } from "@/components/shop/_components/ProductCard";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  // ✅ FIX: hook now returns collections, not categories
  const { collections, featured, loading, error } = useLandingData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Banner (DB-driven component) */}
      <TopBanner />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs border border-[var(--border)]">
              Desert Cowgirl • Western-inspired everyday wear
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Wear the desert.
              <br />
              Keep it classic.
            </h1>

            <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-xl">
              Handpicked styles with a western edge—graphics, layers, denim, and
              accessories built for real life. Shop the latest drops, restocks,
              and favorites in one clean storefront.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#shop"
                className="inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold
                           bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm
                           hover:opacity-95 transition"
              >
                Shop Now
              </a>

              <a
                href="#new-releases"
                className="inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold
                           bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]
                           hover:bg-[var(--accent)] transition"
              >
                New Releases
              </a>
            </div>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Fast shipping</p>
                <p className="text-sm font-semibold">Packed with care</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Easy returns</p>
                <p className="text-sm font-semibold">Simple exchanges</p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Secure checkout</p>
                <p className="text-sm font-semibold">Shop confidently</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background:
                  "radial-gradient(800px circle at 30% 20%, var(--accent) 0%, transparent 60%)",
                opacity: 0.8,
              }}
            />

            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)] overflow-hidden">
              {/* Replace this image with a hero lifestyle/product image later */}
              <div className="aspect-[4/3] w-full bg-[var(--sidebar)] flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Hero image placeholder
                  </p>
                  <p className="text-xl font-bold">
                    Add a lifestyle photo + featured product grid
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Suggested: 1600×1200 JPG in /public/images/store/hero.jpg
                  </p>
                </div>
              </div>

              {/* Mini featured row */}
              <div className="grid grid-cols-3 gap-0 border-t border-[var(--border)]">
                <div className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Featured</p>
                  <p className="text-sm font-semibold">Graphics</p>
                </div>
                <div className="p-4 border-l border-r border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)]">Trending</p>
                  <p className="text-sm font-semibold">Denim</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Must-have</p>
                  <p className="text-sm font-semibold">Accessories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Shop Tiles (REAL collections marked is_home_section) */}
      <section id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-12">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Shop by Category</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              A storefront layout that feels like Shopify—clean, fast, and easy to browse.
            </p>
          </div>

          <Link
            href="/shop"
            className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition"
          >
            View all
          </Link>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--muted-foreground)]">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {(collections ?? []).map((c) => (
            <CategoryTile key={c.id} title={c.name} href={`/collections/${c.slug}`} />
          ))}

          {!loading && (collections ?? []).length === 0 ? (
            <div className="col-span-full text-sm text-[var(--muted-foreground)]">
              No homepage collections yet. Set <b>is_home_section</b> = true on some collections.
            </div>
          ) : null}
        </div>
      </section>

      {/* Featured Products (REAL products) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-12">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold">Featured Picks</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Live products from your catalog.
              </p>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition"
            >
              Best Sellers →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(featured ?? []).map((p) => (
              <LandingProductCard key={p.id} product={p} />
            ))}

            {!loading && (featured ?? []).length === 0 ? (
              <div className="col-span-full text-sm text-[var(--muted-foreground)]">
                No products found yet. Create products and set status to <b>active</b>.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* New Releases / Restocks / Cowkids */}
      <section
        id="new-releases"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PromoPanel
            title="New Releases"
            desc="Fresh drops and latest arrivals."
            href="#new-releases"
            badge="New"
          />
          <PromoPanel
            title="Restocks"
            desc="Back in stock—grab it before it’s gone."
            href="#restocks"
            badge="Restock"
          />
          <PromoPanel
            title="Cowkids"
            desc="Kid styles, minis, and western-inspired accessories."
            href="#cowkids"
            badge="Kids"
          />
        </div>
      </section>

      {/* Brand Story */}
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
            <p className="text-lg font-bold mt-1">
              Add a “Shop Occasions” carousel + email signup here
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Suggested: featured collection tiles (Galentine, Date Night, Denim Edit…)
            </p>
          </div>
        </div>
      </section>

      {/* Footer Spacing */}
      <div className="pb-10" />
    </div>
  );
}

/* ------------------------------ */
/* Small internal components      */
/* ------------------------------ */

function CategoryTile({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-4
                 hover:bg-[var(--accent)] transition shadow-[var(--shadow-xs)]"
    >
      <div className="text-xs text-[var(--muted-foreground)]">Shop</div>
      <div className="font-bold leading-snug mt-1">{title}</div>
      <div className="text-sm font-semibold text-[var(--primary)] mt-2 group-hover:opacity-90">
        Browse →
      </div>
    </Link>
  );
}

function PromoPanel({
  title,
  desc,
  href,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  badge: string;
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6
                 hover:bg-[var(--accent)] transition shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 rounded-full border border-[var(--border)] bg-[var(--background)]">
          {badge}
        </span>
        <span className="text-sm font-semibold text-[var(--primary)]">Open →</span>
      </div>
      <div className="mt-4 text-xl font-extrabold">{title}</div>
      <p className="text-sm text-[var(--muted-foreground)] mt-2">{desc}</p>
    </a>
  );
}
