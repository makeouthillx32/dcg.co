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
    // ✅ Full-bleed like reference (ignores parent max-width/padding)
    <section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
      <Carousel
        className="w-screen"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0 basis-full">
              <Link href={slide.primary_button_href} className="relative block w-screen">
                {/* Desktop Hero (reference: 1280x480) */}
                <div className="hidden lg:block w-screen">
                  <div className="relative w-screen h-[480px] overflow-hidden">
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

                {/* Mobile Hero (reference: 375x490) */}
                <div className="block lg:hidden w-screen">
                  <div className="relative w-screen h-[490px] overflow-hidden">
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
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}