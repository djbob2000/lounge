'use client';

import type { Photo } from '@lounge/types';
import Image from 'next/image';
import { useState } from 'react';

interface PhotoGridProps {
  photos: Photo[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export default function PhotoGrid({ photos, onSelectionChange }: PhotoGridProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  const handleSelectPhoto = (photoId: string) => {
    const newSelectedIds = selectedPhotoIds.includes(photoId)
      ? selectedPhotoIds.filter((id) => id !== photoId)
      : [...selectedPhotoIds, photoId];
    setSelectedPhotoIds(newSelectedIds);
    onSelectionChange(newSelectedIds);
  };

  const handleSelectAll = () => {
    let newSelectedIds: string[];
    if (selectedPhotoIds.length === photos.length) {
      newSelectedIds = [];
    } else {
      newSelectedIds = photos.map((p) => p.id);
    }
    setSelectedPhotoIds(newSelectedIds);
    onSelectionChange(newSelectedIds);
  };

  if (!photos || photos.length === 0) {
    return <p className="text-center text-gray-600 py-8">No photos in this album yet.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md text-foreground">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={selectedPhotoIds.length === photos.length && photos.length > 0}
            onChange={handleSelectAll}
            disabled={photos.length === 0}
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedPhotoIds.length === photos.length ? 'Deselect All' : 'Select All'}(
            {selectedPhotoIds.length} / {photos.length})
          </span>
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className={`relative border rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
              selectedPhotoIds.includes(photo.id)
                ? 'ring-2 ring-blue-500 border-transparent'
                : 'border-gray-200'
            }`}
            onClick={() => handleSelectPhoto(photo.id)}
          >
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 bg-white border-gray-400 rounded focus:ring-blue-500"
                checked={selectedPhotoIds.includes(photo.id)}
                onChange={(e) => {
                  e.stopPropagation(); // Prevent click on div from re-triggering selection
                  handleSelectPhoto(photo.id);
                }}
                onClick={(e) => e.stopPropagation()} // Also stop propagation for clicks directly on checkbox
              />
            </div>
            <Image
              src={photo.thumbnailUrl || photo.originalUrl || '/placeholder-image.svg'}
              alt={`Photo ${photo.id} (${photo.filename})`}
              width={300} // Adjust as per your design needs
              height={200} // Adjust as per your design needs
              className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-200 ease-in-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-image.svg';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1.5 text-xs truncate">
              {photo.filename || photo.id}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
