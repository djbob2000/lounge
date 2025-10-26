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
import { useEffect } from 'react';

interface HomeSliderProps {
  photos: Photo[];
}

const HomeSlider = ({ photos }: HomeSliderProps) => {
  const safePhotos = Array.isArray(photos) ? photos : [];

  useEffect(() => {
    if (safePhotos.length <= 1) return;

    // Auto-play functionality will be handled by the parent component
    // or we can implement it here if needed
  }, [safePhotos.length]);

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
        loop: safePhotos.length > 1,
        align: 'center',
      }}
    >
      <CarouselContent>
        {safePhotos.map((photo, index) => (
          <CarouselItem key={photo.id || `photo-${index}`}>
            <div className="relative w-full h-[60vh]">
              <Image
                src={photo.originalUrl}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {safePhotos.length > 1 && (
        <>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </>
      )}
    </Carousel>
  );
};

export default HomeSlider;
