'use client';

import type { Photo } from '@lounge/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@lounge/ui';
import Image from 'next/image';
import { useEffect, useEffectEvent, useState, useRef } from 'react';

interface HomeSliderProps {
  photos: Photo[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const HomeSlider = ({
  photos,
  autoPlay = true,
  autoPlayInterval = 5000
}: HomeSliderProps) => {
  const safePhotos = Array.isArray(photos) ? photos : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract non-reactive logic from useEffect into useEffectEvent
  const startAutoPlay = useEffectEvent(() => {
    if (!autoPlay || safePhotos.length <= 1) return;

    autoPlayTimeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === safePhotos.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);
  });

  const stopAutoPlay = useEffectEvent(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
  });

  const resetAutoPlay = useEffectEvent(() => {
    stopAutoPlay();
    if (autoPlay) {
      startAutoPlay();
    }
  });

  // Main effect for auto-play management
  useEffect(() => {
    resetAutoPlay();

    return () => {
      stopAutoPlay();
    };
  }, [autoPlay, autoPlayInterval, safePhotos.length]);

  // React to index changes for auto-play
  useEffect(() => {
    if (autoPlay && safePhotos.length > 1) {
      startAutoPlay();
    }
  }, [currentIndex, autoPlay, safePhotos.length]);

  const goToNext = useEffectEvent(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === safePhotos.length - 1 ? 0 : prevIndex + 1
    );
  });

  const goToPrevious = useEffectEvent(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? safePhotos.length - 1 : prevIndex - 1
    );
  });

  const goToSlide = useEffectEvent((index: number) => {
    if (index >= 0 && index < safePhotos.length) {
      setCurrentIndex(index);
    }
  });

  if (safePhotos.length === 0) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading photos...</p>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full h-[60vh] relative"
      opts={{
        loop: false, // We'll handle looping manually
        align: 'center',
      }}
      setApi={(api) => {
        // Handle manual navigation to sync with our index state
        if (api) {
          api.on('select', () => {
            const newIndex = api.selectedScrollSnap();
            setCurrentIndex(newIndex);
          });
        }
      }}
    >
      <CarouselContent>
        {safePhotos.map((photo, index) => (
          <CarouselItem
            key={photo.id || `photo-${index}`}
            className={`transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-[60vh]">
              <Image
                src={photo.originalUrl}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              
              {/* Slide indicator dots */}
              {safePhotos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {safePhotos.map((_, dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => goToSlide(dotIndex)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        dotIndex === currentIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${dotIndex + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {safePhotos.length > 1 && (
        <>
          <CarouselPrevious
            className="left-4"
            onClick={goToPrevious}
          />
          <CarouselNext
            className="right-4"
            onClick={goToNext}
          />
        </>
      )}
    </Carousel>
  );
};

export default HomeSlider;
