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
 * Skeptical behavior:
 * - Desktop ONLY renders slides that explicitly have desktop_image_url.
 *   (No fallback to image_url, because that is what causes mobile-only slides to leak into desktop.)
 * - Mobile renders mobile_image_url, else desktop_image_url, else image_url.
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  if (!slides?.length) return null;

  // IMPORTANT: Desktop does NOT fall back to image_url.
  const getDesktopUrl = (s: HeroSlide) => s.desktop_image_url ?? null;

  // Mobile can safely fall back.
  const getMobileUrl = (s: HeroSlide) =>
    s.mobile_image_url ?? s.desktop_image_url ?? s.image_url ?? null;

  // Desktop shows ONLY slides with explicit desktop image
  const desktopSlides = slides.filter((s) => !!getDesktopUrl(s));

  // Mobile shows slides with mobile OR desktop fallback OR legacy URL
  const mobileSlides = slides.filter((s) => !!getMobileUrl(s));

  return (
    <section id="homepage-hero-carousel" className="w-full">
      {/* DESKTOP (lg+) */}
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

      {/* MOBILE (< lg) */}
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