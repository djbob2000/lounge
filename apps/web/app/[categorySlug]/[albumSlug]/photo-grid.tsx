'use client';

import type { Photo } from '@lounge/types';
import Image from 'next/image';
import { useState } from 'react';
import PhotoViewer from '../../../components/PhotoViewer';

interface PhotoGridProps {
  photos: Photo[];
}

export default function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="aspect-square relative overflow-hidden rounded-md border bg-muted cursor-pointer"
            onClick={() => setSelectedPhotoIndex(index)}
            aria-label={`View photo ${index + 1}`}
          >
            <Image
              src={photo.thumbnailUrl}
              alt={photo.filename}
              fill
              loading="lazy"
              className="object-cover hover:scale-105 transition-transform"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {selectedPhotoIndex !== null && (
        <PhotoViewer
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
        />
      )}
    </>
  );
}
