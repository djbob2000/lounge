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
import { useEffect, useEffectEvent, useState } from 'react';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex?: number;
  onClose: () => void;
}

export const PhotoViewer = ({ photos, initialIndex = 0, onClose }: PhotoViewerProps) => {
  const [currentIndex, _setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  // Optimized keyboard navigation with proper event handling
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  });

  // Optimized document event management
  useEffect(() => {
    const handleKeyDownEvent = (event: KeyboardEvent) => handleKeyDown(event);

    document.addEventListener('keydown', handleKeyDownEvent, { passive: false });
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDownEvent);
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Reset loading state when photo changes
  useEffect(() => {
    setIsLoading(true);
  }, []);

  const safePhotos = Array.isArray(photos) ? photos : [];

  if (safePhotos.length === 0) {
    return null;
  }

  const currentPhoto = safePhotos[currentIndex];

  if (!currentPhoto) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 z-10"
        aria-label="Close"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-8 h-8"
          role="img"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="relative w-full h-full flex justify-center items-center">
        <Carousel
          className="w-full h-full max-w-7xl max-h-full"
          opts={{
            loop: true,
            align: 'center',
          }}
          setApi={(api) => {
            if (api) {
              api.scrollTo(initialIndex);
            }
          }}
        >
          <CarouselContent className="h-full flex items-center">
            {safePhotos.map((photo, index) => (
              <CarouselItem
                key={photo.id || `photo-${index}`}
                className="h-full flex items-center justify-center"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {isLoading && (
                    <div className="absolute inset-0 flex justify-center items-center z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                  <Image
                    src={photo.originalUrl}
                    alt={photo.filename || `Photo ${index + 1}`}
                    fill
                    className="object-contain"
                    priority={index === currentIndex}
                    onLoad={() => setIsLoading(false)}
                    sizes="100vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {safePhotos.length > 1 && (
            <>
              <CarouselPrevious className="left-4 w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40" />
              <CarouselNext className="right-4 w-12 h-12 rounded-full bg-black/20 text-white hover:bg-black/40" />
            </>
          )}
        </Carousel>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white">
        <p className="text-sm">
          {currentPhoto.filename} | {currentIndex + 1} / {safePhotos.length}
        </p>
      </div>
    </div>
  );
};

export default PhotoViewer;
