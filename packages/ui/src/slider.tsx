"use client";

import React, { useState, useCallback, useEffect } from "react";
import useEmblaCarousel, { EmblaOptionsType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Props for ImageSlider component
 */
interface ImageSliderProps {
  /**
   * Array of slide items with src, alt and optionally id
   */
  slides: {
    id?: string;
    src: string;
    alt: string;
  }[];
  /**
   * Embla carousel options
   */
  options?: EmblaOptionsType;
  /**
   * Whether to autoplay slides
   */
  autoplay?: boolean;
  /**
   * Autoplay interval in milliseconds
   */
  autoplayInterval?: number;
  /**
   * Whether to show navigation dots
   */
  showDots?: boolean;
  /**
   * Whether to show navigation arrows
   */
  showArrows?: boolean;
  /**
   * Class name for the slider container
   */
  className?: string;
  /**
   * Class name for the slide
   */
  slideClassName?: string;
  /**
   * Callback when slide changes
   */
  onSlideChange?: (index: number) => void;
  /**
   * Callback when slide is clicked
   */
  onSlideClick?: (
    index: number,
    slide: { id?: string; src: string; alt: string }
  ) => void;
}

/**
 * Image slider component using Embla Carousel
 */
export function ImageSlider({
  slides,
  options = { loop: true },
  autoplay = true,
  autoplayInterval = 5000,
  showDots = true,
  showArrows = true,
  className = "",
  slideClassName = "",
  onSlideChange,
  onSlideClick,
}: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const handleSlideClick = useCallback(
    (index: number) => {
      if (onSlideClick) {
        onSlideClick(index, slides[index]);
      }
    },
    [onSlideClick, slides]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    if (onSlideChange) {
      onSlideChange(newIndex);
    }
  }, [emblaApi, onSlideChange]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [emblaApi, autoplay, autoplayInterval]);

  if (!slides.length) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`relative flex-none w-full ${slideClassName}`}
              onClick={() => handleSlideClick(index)}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 z-10 hover:bg-black/60 transition"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 z-10 hover:bg-black/60 transition"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition ${
                index === selectedIndex
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
