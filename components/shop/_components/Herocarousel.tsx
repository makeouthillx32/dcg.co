'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

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
    <section className="w-full">
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0 basis-full">
              <Link
                href={slide.primary_button_href}
                className="relative block w-full"
              >
                {/* Desktop Hero */}
                <div className="hidden lg:block">
                  <div className="relative w-full h-[480px]">
                    <Image
                      src={slide.image_url}
                      alt={slide.alt_text || 'Hero Image'}
                      fill
                      priority
                      sizes="100vw"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: 'center top' }}
                    />
                  </div>
                </div>

                {/* Mobile Hero */}
                <div className="block lg:hidden">
                  <div className="relative w-full h-[490px]">
                    <Image
                      src={slide.image_url}
                      alt={slide.alt_text || 'Hero Image'}
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
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}