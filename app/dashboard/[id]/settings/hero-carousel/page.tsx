'use client';

import { HeroCarouselManager } from './_components/HeroCarouselManager';

export default function HeroCarouselSettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hero Carousel</h1>
        <p className="text-gray-600">
          Manage your homepage hero carousel slides.
        </p>
      </div>

      <div>
        <HeroCarouselManager />
      </div>
    </div>
  );
}
