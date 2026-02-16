// components/shop/Landing.tsx
"use client";

import { TopBanner } from "@/components/shop/_components/TopBanner";
import { HeroCarousel } from "@/components/shop/_components/HeroCarousel";
import { LandingSkeleton } from "@/components/shop/_components/LandingSkeleton";
import { ShopByCategory } from "@/components/shop/_components/ShopByCategory";
import { useLandingData } from "@/components/shop/_components/useLandingData";
import { useHeroSlides } from "@/components/shop/_components/useHeroSlides";
import { LandingProductCard } from "@/components/shop/_components/ProductCard";
import Link from "next/link";

export default function HomePage() {
  const { categories, featured, loading, error } = useLandingData();
  const { slides, loading: slidesLoading } = useHeroSlides();

  // Show skeleton while loading
  if (loading || slidesLoading) {
    return <LandingSkeleton />;
  }

  return (
    <>
      {/* Top Banner - Outside main container */}
      <TopBanner />

      {/* Hero Carousel - Full Width - Aspect Ratio 96:35 */}
      {slides.length > 0 && <HeroCarousel slides={slides} />}

      {/* Main Content Container */}
      <div className="bg-background text-foreground">

      {/* Shop by Category Section */}
      <ShopByCategory categories={categories} loading={loading} error={error} />

      {/* Promo Grid - 2x2 Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Large Promo Card */}
          <PromoCard
            title="Enjoy $30 off"
            subtitle="your next order when you receive your first"
            highlight="in app purchase*"
            href="/promo"
            variant="dark"
          />
          
          {/* QR Code Card */}
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

      {/* Footer Spacing */}
      <div className="pb-10" />
      </div>
      {/* End Main Content Container */}
    </>
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
  variant = "light"
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
        ${variant === "dark" 
          ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white" 
          : "bg-gradient-to-br from-pink-50 to-purple-50"
        }
      `}
    >
      <div className="relative z-10 h-full flex flex-col justify-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-2">
          {title}
        </h3>
        <p className="text-lg mb-1">
          {subtitle}
        </p>
        <p className="text-lg font-semibold">
          {highlight}
        </p>
        
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
  qrText
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
      
      {/* QR Code Placeholder */}
      <div className="w-40 h-40 bg-[var(--muted)] rounded-lg mb-4 flex items-center justify-center">
        <div className="w-32 h-32 bg-black rounded-md flex items-center justify-center">
          <span className="text-white text-xs">QR CODE</span>
        </div>
      </div>
      
      <p className="text-xs font-semibold mb-2">
        {qrText}
      </p>
      
      <button className="text-sm font-semibold text-[var(--primary)] hover:opacity-80 transition">
        {subtitle}
      </button>
    </div>
  );
}