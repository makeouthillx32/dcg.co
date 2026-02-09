"use client";

import { LandingShell } from "./_components/landing/LandingShell";
import { TopBanner } from "./_components/landing/TopBanner";
import { HeroSection } from "./_components/landing/HeroSection";
import { ShopByCategorySection } from "./_components/landing/ShopByCategorySection";
import { FeaturedPicksSection } from "./_components/landing/FeaturedPicksSection";
import { PromoRowSection } from "./_components/landing/PromoRowSection";
import { BrandStorySection } from "./_components/landing/BrandStorySection";
import { useLandingData } from "./_components/landing/useLandingData";

export default function HomePage() {
  const { categories, featuredPlaceholders, loading, error } = useLandingData();

  return (
    <LandingShell>
      <TopBanner />
      <HeroSection />

      {/* If/when you flip to live mode, you’ll see status here */}
      {(loading || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-6">
          {loading && (
            <div className="text-sm text-[var(--muted-foreground)]">Loading landing data…</div>
          )}
          {error && (
            <div className="text-sm text-red-500">Landing data error: {error}</div>
          )}
        </div>
      )}

      <ShopByCategorySection categories={categories} />
      <FeaturedPicksSection featured={featuredPlaceholders} />
      <PromoRowSection />
      <BrandStorySection />

      <div className="pb-10" />
    </LandingShell>
  );
}
