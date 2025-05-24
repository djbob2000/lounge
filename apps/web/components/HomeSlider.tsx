"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Photo } from "@lounge/types";

interface HomeSliderProps {
  photos: Photo[];
}

const HomeSlider = ({ photos }: HomeSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const safePhotos = Array.isArray(photos) ? photos : [];

  const goToNextSlide = useCallback(() => {
    if (safePhotos.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % safePhotos.length);
      setIsTransitioning(false);
    }, 500);
  }, [safePhotos.length]);

  useEffect(() => {
    if (safePhotos.length <= 1) return;

    const interval = setInterval(goToNextSlide, 5000);

    return () => clearInterval(interval);
  }, [goToNextSlide, safePhotos.length]);

  if (safePhotos.length === 0) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Loading photos...</p>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, safePhotos.length - 1);
  const currentPhoto = safePhotos[safeIndex];

  if (!currentPhoto) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center bg-muted">
        <p className="text-muted-foreground">Error loading photos</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[60vh] overflow-hidden">
      <div
        className={`w-full h-full transition-opacity duration-500 ${isTransitioning ? "opacity-30" : "opacity-100"}`}
      >
        <Image
          src={currentPhoto.originalUrl}
          alt={`Slide ${safeIndex + 1}`}
          fill
          className="object-cover"
          priority={safeIndex === 0}
        />
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {safePhotos.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 500);
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              index === safeIndex
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button
          onClick={() => {
            if (safePhotos.length <= 1) return;

            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentIndex(
                (prevIndex) =>
                  (prevIndex - 1 + safePhotos.length) % safePhotos.length
              );
              setIsTransitioning(false);
            }, 500);
          }}
          className="w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={goToNextSlide}
          className="w-10 h-10 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HomeSlider;
