'use client';

import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface HeroSlideProps {
  id: string;

  // Desktop (required)
  image_url: string;
  alt_text: string | null;

  // Mobile (optional)
  mobile_image_url?: string | null;

  primary_button_href: string;
}

interface HeroCarouselProps {
  slides: HeroSlideProps[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  if (!slides?.length) return null;

  return (
    <section id="homepage-hero-carousel" className="w-full">
      <Carousel className="w-full" opts={{ align: 'start', loop: true }}>
        <CarouselContent className="-ml-0">
          {slides.map((slide) => {
            const desktopSrc = slide.image_url;
            const mobileSrc = slide.mobile_image_url || slide.image_url;

            return (
              <CarouselItem key={slide.id} className="pl-0 basis-full">
                <div id="hero-banner-id">
                  <Link
                    href={slide.primary_button_href}
                    data-testid="hero-banner"
                    className="relative block w-full bg-no-repeat overflow-hidden min-h-[512px] lg:min-h-[600px]"
                    aria-label={slide.alt_text || 'Hero banner'}
                  >
                    {/* ONE element. Browser swaps sources; never renders both. */}
                    <picture>
                      <source media="(min-width: 1024px)" srcSet={desktopSrc} />
                      <source media="(max-width: 1023px)" srcSet={mobileSrc} />
                      <img
                        src={mobileSrc}
                        alt={slide.alt_text || 'Hero Image'}
                        className="absolute inset-0 h-full w-full object-cover object-top"
                        loading="eager"
                        decoding="async"
                      />
                    </picture>

                    {/* NOTE: No overlay on purpose. */}
                  </Link>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}