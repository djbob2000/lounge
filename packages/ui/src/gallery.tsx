"use client";

import React, { useState } from "react";

import { X } from "lucide-react";
import { ImageSlider } from "./slider";

/**
 * Props for an image in the gallery
 */
interface GalleryImage {
  /**
   * Unique identifier for the image
   */
  id?: string;
  /**
   * URL of the image
   */
  src: string;
  /**
   * URL of the thumbnail image (if different from src)
   */
  thumbnailSrc?: string;
  /**
   * Alt text for the image
   */
  alt: string;
  /**
   * Width of the image
   */
  width?: number;
  /**
   * Height of the image
   */
  height?: number;
}

/**
 * Props for the PhotoGallery component
 */
interface PhotoGalleryProps {
  /**
   * Array of images to display in the gallery
   */
  images: GalleryImage[];
  /**
   * Class name for the gallery container
   */
  className?: string;
  /**
   * Number of columns in the gallery grid (for medium and up screens)
   */
  columns?: 2 | 3 | 4;
  /**
   * Gap between gallery items in pixels
   */
  gap?: number;
  /**
   * Whether to show a fullscreen viewer when clicking an image
   */
  enableFullscreen?: boolean;
}

/**
 * A responsive photo gallery component with optional fullscreen viewer
 */
export function PhotoGallery({
  images,
  className = "",
  columns = 3,
  gap = 4,
  enableFullscreen = true,
}: PhotoGalleryProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const isFullscreenOpen = fullscreenIndex !== null;

  // Open fullscreen viewer
  const openFullscreen = (index: number) => {
    if (enableFullscreen) {
      setFullscreenIndex(index);
      // Prevent body scroll when fullscreen is open
      document.body.style.overflow = "hidden";
    }
  };

  // Close fullscreen viewer
  const closeFullscreen = () => {
    setFullscreenIndex(null);
    // Restore body scroll when fullscreen is closed
    document.body.style.overflow = "";
  };

  if (!images.length) {
    return null;
  }

  return (
    <>
      <div
        className={`grid grid-cols-1 md:grid-cols-${columns} gap-${gap} ${className}`}
      >
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className="aspect-square overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
            onClick={() => openFullscreen(index)}
          >
            <img
              src={image.thumbnailSrc || image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              width={image.width}
              height={image.height}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Fullscreen Viewer */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white bg-black/20 p-2 rounded-full z-10 hover:bg-black/40 transition"
            aria-label="Close fullscreen viewer"
          >
            <X size={24} />
          </button>

          <ImageSlider
            slides={images.map((img) => ({
              id: img.id,
              src: img.src,
              alt: img.alt,
            }))}
            options={{ loop: true, startIndex: fullscreenIndex }}
            className="w-full h-full"
            slideClassName="px-4 flex items-center justify-center"
          />
        </div>
      )}
    </>
  );
}
