'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface HeroSlideProps {
  id: string;
  image_url: string;
  alt_text: string | null;
  pill_text: string | null;
  headline_line1: string;
  headline_line2: string | null;
  subtext: string | null;
  primary_button_label: string;
  primary_button_href: string;
  secondary_button_label: string | null;
  secondary_button_href: string | null;
  text_alignment: 'left' | 'center' | 'right';
  text_color: 'dark' | 'light';
  overlay_opacity: string;
  blurhash: string | null;
  width: number;
  height: number;
}

interface HeroCarouselProps {
  slides: HeroSlideProps[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  if (!slides?.length) return null;

  const getJustifyClass = (alignment: 'left' | 'center' | 'right') => {
    switch (alignment) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-center';
    }
  };

  const getTextAlignClass = (alignment: 'left' | 'center' | 'right') => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  const getTextColorStyle = (color: 'dark' | 'light') => {
    return { color: color === 'light' ? 'rgb(255, 251, 245)' : 'rgb(20, 10, 15)' };
  };

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
              <Link href={slide.primary_button_href} className="relative block w-full bg-no-repeat">
                {/* Desktop: fixed height like reference (480) */}
                <div className="hidden lg:block">
                  <div className="relative w-full h-[480px]">
                    <Image
                      src={slide.image_url}
                      alt={slide.alt_text || slide.headline_line1}
                      fill
                      priority
                      sizes="100vw"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: 'center top' }}
                    />
                  </div>
                </div>

                {/* Mobile: fixed height like reference (490) */}
                <div className="block lg:hidden">
                  <div className="relative w-full h-[490px]">
                    <Image
                      src={slide.image_url}
                      alt={slide.alt_text || slide.headline_line1}
                      fill
                      priority
                      sizes="100vw"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: 'center top' }}
                    />
                  </div>
                </div>

                {/* Overlay */}
                {parseFloat(slide.overlay_opacity) > 0 && (
                  <div
                    className="absolute inset-0 bg-black"
                    style={{ opacity: parseFloat(slide.overlay_opacity) }}
                  />
                )}

                {/* Content Overlay */}
                <div
                  className={cn(
                    'absolute top-0 left-0 z-10 flex h-full w-full items-center px-5 lg:px-20',
                    getJustifyClass(slide.text_alignment)
                  )}
                >
                  <div className={getTextAlignClass(slide.text_alignment)}>
                    {slide.pill_text && (
                      <div className="mb-4">
                        <span
                          className="inline-block px-4 py-2 text-xs font-semibold tracking-wide uppercase rounded-full"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            ...getTextColorStyle(slide.text_color),
                          }}
                        >
                          {slide.pill_text}
                        </span>
                      </div>
                    )}

                    <div className="relative">
                      <div className="rich-text-block mt-2" style={getTextColorStyle(slide.text_color)}>
                        {slide.headline_line1 && (
                          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-2">
                            {slide.headline_line1}
                          </h1>
                        )}
                        {slide.headline_line2 && (
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                            {slide.headline_line2}
                          </h2>
                        )}
                        {slide.subtext && (
                          <p className="text-base sm:text-lg mt-4 max-w-2xl mx-auto">
                            {slide.subtext}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={cn(
                        'mt-8 flex gap-3',
                        slide.text_alignment === 'center' && 'justify-center',
                        slide.text_alignment === 'right' && 'justify-end'
                      )}
                    >
                      <button
                        className="inline-flex items-center justify-center whitespace-nowrap font-semibold text-sm
                                   ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-0
                                   disabled:pointer-events-none disabled:cursor-not-allowed
                                   underline underline-offset-4
                                   h-[54px] w-[200px] px-4 py-3"
                        style={getTextColorStyle(slide.text_color)}
                      >
                        {slide.primary_button_label}
                      </button>

                      {slide.secondary_button_label && slide.secondary_button_href && (
                        <Link
                          href={slide.secondary_button_href}
                          className="inline-flex items-center justify-center whitespace-nowrap font-semibold text-sm
                                     ring-offset-white transition-colors
                                     border border-current
                                     h-[54px] w-[200px] px-4 py-3"
                          style={getTextColorStyle(slide.text_color)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {slide.secondary_button_label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* optional arrows */}
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}