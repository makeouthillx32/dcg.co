// components/shop/Landing.tsx
"use client";

import { TopBanner } from "@/components/shop/_components/TopBanner";
import { HeroCarousel } from "@/components/shop/_components/Herocarousel";
import { LandingSkeleton } from "@/components/shop/_components/LandingSkeleton";
import { useLandingData } from "@/components/shop/_components/useLandingData";
import { useHeroSlides } from "@/components/shop/_components/useHeroSlides";
import { LandingProductCard } from "@/components/shop/_components/ProductCard";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const { categories, featured, loading, error } = useLandingData();
  const { slides, loading: slidesLoading } = useHeroSlides();

  if (loading || slidesLoading) {
    return <LandingSkeleton />;
  }

  return (
    // ✅ Prevent full-bleed hero from causing horizontal scroll
    <div className="overflow-x-hidden">
      {/* Top Banner - Outside main container */}
      <TopBanner />

      {/* Hero Carousel - MUST stay outside constrained containers */}
      {slides.length > 0 && <HeroCarousel slides={slides} />}

      {/* Main Content Container */}
      <div className="bg-background text-foreground">
        {/* Shop by Category - 3 Column Grid */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Shop by Category
            </h2>

            {error ? (
              <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm text-[var(--muted-foreground)]">
                {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {(categories ?? []).map((c) => (
                <CategoryCard
                  key={c.id}
                  title={c.name}
                  href={`/${c.slug}`}
                  imageUrl={c.coverImageUrl}
                />
              ))}

              {!loading && (categories ?? []).length === 0 ? (
                <div className="col-span-full text-center text-sm text-[var(--muted-foreground)] py-12">
                  No categories yet. Create categories in Dashboard → Settings → Categories.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* Promo Grid - 2x2 Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PromoCard
              title="Enjoy $30 off"
              subtitle="your next order when you receive your first"
              highlight="in app purchase*"
              href="/promo"
              variant="dark"
            />

            <QRCodeCard
              title="PLAN TO SUBSCRIBE? DOWNLOAD OUR APP BEFORE IT'S OFFICIALLY LAUNCHED!"
              subtitle="Join our waitlist"
              qrText="SCAN TO DOWNLOAD"
            />
          </div>
        </section>

        {/* Shop Bestsellers - Product Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold">Shop Bestsellers</h3>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(featured ?? []).slice(0, 4).map((p) => (
              <LandingProductCard key={p.id} product={p} />
            ))}

            {!loading && (featured ?? []).length === 0 ? (
              <div className="col-span-full text-center text-sm text-[var(--muted-foreground)] py-12">
                No products found yet. Create products and set status to <b>active</b>.
              </div>
            ) : null}
          </div>
        </section>

        {/* Curated For You - Product Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold">Curated for you</h3>
            </div>
            <Link
              href="/shop"
              className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(featured ?? []).slice(4, 8).map((p) => (
              <LandingProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <div className="pb-10" />
      </div>
    </div>
  );
}

/* ------------------------------ */
/* Category Card Component        */
/* ------------------------------ */

function CategoryCard({
  title,
  href,
  imageUrl,
}: {
  title: string;
  href: string;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-lg aspect-square bg-[var(--sidebar)] w-full"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          alt={title}
          sizes="400px"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--muted)] opacity-50" />
      )}

      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-all duration-300" />

      <div className="absolute inset-0 flex items-center justify-center p-6">
        <h3 className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {title}
        </h3>
      </div>
    </Link>
  );
}

/* ------------------------------ */
/* Promo Card Component           */
/* ------------------------------ */

function PromoCard({
  title,
  subtitle,
  highlight,
  href,
  variant = "light",
}: {
  title: string;
  subtitle: string;
  highlight: string;
  href: string;
  variant?: "light" | "dark";
}) {
  return (
    <Link
      href={href}
      className={`
        group relative block overflow-hidden rounded-lg aspect-[4/3] p-8
        ${
          variant === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white"
            : "bg-gradient-to-br from-pink-50 to-purple-50"
        }
      `}
    >
      <div className="relative z-10 h-full flex flex-col justify-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-2">{title}</h3>
        <p className="text-lg mb-1">{subtitle}</p>
        <p className="text-lg font-semibold">{highlight}</p>

        <div className="mt-6">
          <span className="text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity">
            Find out →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------ */
/* QR Code Card Component         */
/* ------------------------------ */

function QRCodeCard({
  title,
  subtitle,
  qrText,
}: {
  title: string;
  subtitle: string;
  qrText: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] aspect-[4/3] p-8 flex flex-col items-center justify-center text-center">
      <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-4">
        {title}
      </p>

      <div className="w-40 h-40 bg-[var(--muted)] rounded-lg mb-4 flex items-center justify-center">
        <div className="w-32 h-32 bg-black rounded-md flex items-center justify-center">
          <span className="text-white text-xs">QR CODE</span>
        </div>
      </div>

      <p className="text-xs font-semibold mb-2">{qrText}</p>

      <button className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition">
        {subtitle}
      </button>
    </div>
  );
}