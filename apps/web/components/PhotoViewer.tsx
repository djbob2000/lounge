'use client';

import type { Photo } from '@lounge/types';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface PhotoViewerProps {
  photos: Photo[];
  initialIndex?: number;
  onClose: () => void;
}

export const PhotoViewer = ({ photos, initialIndex = 0, onClose }: PhotoViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevious = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : photos.length - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prevIndex) => (prevIndex < photos.length - 1 ? prevIndex + 1 : 0));
  }, [photos.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    },
    [handleNext, handlePrevious, onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [handleKeyDown]);

  const currentPhoto = photos[currentIndex];

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

      <button
        type="button"
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2"
        aria-label="Previous photo"
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative w-full h-full flex justify-center items-center">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
        <Image
          src={currentPhoto.originalUrl}
          alt={currentPhoto.filename || `Photo ${currentIndex + 1}`}
          fill
          className="object-contain"
          priority
          onLoad={() => setIsLoading(false)}
        />
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2"
        aria-label="Next photo"
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white">
        <p className="text-sm">
          {currentPhoto.filename} | {currentIndex + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
};

export default PhotoViewer;
