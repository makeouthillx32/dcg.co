'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface HeroSlideProps {
  id: string;

  // Desktop image
  image_url: string;
  alt_text: string | null;

  // ✅ Mobile image (optional)
  mobile_image_url?: string | null;
  mobile_alt_text?: string | null;

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

            const desktopAlt = slide.alt_text || 'Hero Image';
            const mobileAlt = slide.mobile_alt_text || slide.alt_text || 'Hero Image';

            return (
              <CarouselItem key={slide.id} className="pl-0 basis-full">
                <div id="hero-banner-id">
                  <Link
                    href={slide.primary_button_href}
                    className="relative block w-full bg-no-repeat min-h-[512px] lg:min-h-[600px]"
                  >
                    {/* Desktop (lg+) */}
                    <div className="hidden lg:block">
                      <div className="relative w-full min-h-[600px]">
                        <Image
                          src={desktopSrc}
                          alt={desktopAlt}
                          fill
                          priority
                          sizes="100vw"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: 'center top' }}
                        />
                      </div>
                    </div>

                    {/* Mobile (<lg) */}
                    <div className="block lg:hidden">
                      <div className="relative w-full min-h-[512px]">
                        <Image
                          src={mobileSrc}
                          alt={mobileAlt}
                          fill
                          priority
                          sizes="100vw"
                          className="h-full w-full object-cover"
                          style={{ objectPosition: 'center top' }}
                        />
                      </div>
                    </div>

                    {/* NOTE:
                      Text overlay removed temporarily to refine hero sizing.
                      Will reintroduce once layout and cropping are finalized.
                    */}
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