'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

type HeroSlide = {
  id: string;

  // computed by API (recommended)
  desktop_image_url?: string | null;
  mobile_image_url?: string | null;

  // legacy fallback (if you still pass it)
  image_url?: string;

  alt_text?: string | null;
  mobile_alt_text?: string | null;

  primary_button_href: string;
};

interface HeroCarouselProps {
  slides: HeroSlide[];
}

/**
 * Fixes your “3 images on desktop” problem:
 * - Desktop carousel ONLY includes slides that have a desktop image.
 * - Mobile carousel includes slides that have mobile OR desktop (fallback).
 *
 * This supports your current reality where you might have:
 * - 2 normal slides (desktop images present)
 * - 1 mobile-only slide (no desktop image)  ✅ should NOT appear on desktop
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  if (!slides?.length) return null;

  const getDesktopUrl = (s: HeroSlide) =>
    s.desktop_image_url ?? s.image_url ?? null;

  const getMobileUrl = (s: HeroSlide) =>
    s.mobile_image_url ?? s.desktop_image_url ?? s.image_url ?? null;

  // ✅ Desktop shows ONLY slides with desktop images
  const desktopSlides = slides.filter((s) => !!getDesktopUrl(s));

  // ✅ Mobile shows slides with mobile OR desktop fallback
  const mobileSlides = slides.filter((s) => !!getMobileUrl(s));

  return (
    <section id="homepage-hero-carousel" className="w-full">
      {/* =========================
          DESKTOP (lg and up)
          ========================= */}
      <div className="hidden lg:block">
        {desktopSlides.length ? (
          <Carousel className="w-full" opts={{ align: 'start', loop: true }}>
            <CarouselContent className="-ml-0">
              {desktopSlides.map((slide) => {
                const src = getDesktopUrl(slide)!;

                return (
                  <CarouselItem key={slide.id} className="pl-0 basis-full">
                    <Link
                      href={slide.primary_button_href}
                      className="relative block w-full bg-no-repeat min-h-[600px]"
                    >
                      <div className="relative w-full min-h-[600px]">
                        <Image
                          src={src}
                          alt={slide.alt_text || slide.mobile_alt_text || 'Hero Image'}
                          fill
                          priority
                          sizes="100vw"
                          className="h-full w-full"
                          style={{ objectFit: 'cover', objectPosition: 'center top' }}
                        />
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        ) : null}
      </div>

      {/* =========================
          MOBILE (below lg)
          ========================= */}
      <div className="block lg:hidden">
        {mobileSlides.length ? (
          <Carousel className="w-full" opts={{ align: 'start', loop: true }}>
            <CarouselContent className="-ml-0">
              {mobileSlides.map((slide) => {
                const src = getMobileUrl(slide)!;

                return (
                  <CarouselItem key={slide.id} className="pl-0 basis-full">
                    <Link
                      href={slide.primary_button_href}
                      className="relative block w-full bg-no-repeat min-h-[512px]"
                    >
                      <div className="relative w-full min-h-[512px]">
                        <Image
                          src={src}
                          alt={slide.mobile_alt_text || slide.alt_text || 'Hero Image'}
                          fill
                          priority
                          sizes="100vw"
                          className="h-full w-full"
                          style={{ objectFit: 'cover', objectPosition: 'center top' }}
                        />
                      </div>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        ) : null}
      </div>

      {/*
        NOTE:
        Text overlay intentionally NOT included (per your request).
      */}
    </section>
  );
}