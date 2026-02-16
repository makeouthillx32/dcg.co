'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

interface HeroSlideProps {
  id: string;
  image_url: string;
  alt_text: string | null;
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
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0 basis-full">
              <div id="hero-banner-id">
                <Link
                  href={slide.primary_button_href}
                  className="relative block w-full bg-no-repeat min-h-[512px] lg:min-h-[600px]"
                >
                  {/* Desktop */}
                  <div className="hidden lg:block">
                    <div className="relative w-full min-h-[600px]">
                      <Image
                        src={slide.image_url}
                        alt={slide.alt_text || 'Hero Image'}
                        fill
                        priority
                        sizes="100vw"
                        className="h-full w-full"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="block lg:hidden">
                    <div className="relative w-full min-h-[512px]">
                      <Image
                        src={slide.image_url}
                        alt={slide.alt_text || 'Hero Image'}
                        fill
                        priority
                        sizes="100vw"
                        className="h-full w-full"
                        style={{ objectFit: 'cover', objectPosition: 'center top' }}
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
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}