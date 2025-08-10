"use client";

import { Photo } from "@lounge/types";
import Image from "next/image";
import { useState, useEffect } from "react";

interface PhotoGridProps {
  photos: Photo[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export default function PhotoGrid({ photos, onSelectionChange }: PhotoGridProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensure component is mounted before rendering client-only UI
  }, []);

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

  // This useEffect can be used if we need to react to external changes to selectedPhotoIds,
  // but for internal changes, calling onSelectionChange directly in handlers is more immediate.
  useEffect(() => {
    // If the parent component might change the selection, this effect helps keep them in sync.
    // For now, selection is driven from within PhotoGrid.
    // To avoid potential infinite loops if not careful with parent state,
    // it's often better to have a single source of truth.
    // If `selectedPhotoIds` were a prop, this would be different.
  }, [selectedPhotoIds, onSelectionChange]); // Dependency array is important

  if (!isMounted) {
    // Render a simple loader or null to avoid hydration issues with state-dependent UI (checkboxes)
    // For a better UX, a skeleton loader matching the grid item layout could be used.
    return (
      <div className="text-center p-4">
        <p>Loading photos...</p>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return <p className="text-center text-gray-600 py-8">No photos in this album yet.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-md">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            checked={selectedPhotoIds.length === photos.length && photos.length > 0}
            onChange={handleSelectAll}
            disabled={photos.length === 0}
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedPhotoIds.length === photos.length ? "Deselect All" : "Select All"}
            ({selectedPhotoIds.length} / {photos.length})
          </span>
        </label>
        {/* Placeholder for future bulk actions e.g. delete selected */}
        {/* The delete button was here as a placeholder, it will be managed by AlbumActions now */}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`relative border rounded-lg overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
              selectedPhotoIds.includes(photo.id) ? "ring-2 ring-blue-500 border-transparent" : "border-gray-200"
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
              src={photo.thumbnailUrl || photo.originalUrl || "/placeholder-image.svg"}
              alt={`Photo ${photo.id} (${photo.filename})`}
              width={300} // Adjust as per your design needs
              height={200} // Adjust as per your design needs
              className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-200 ease-in-out group-hover:scale-105"
              onError={(e) => { e.currentTarget.src = "/placeholder-image.svg"; }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1.5 text-xs truncate">
              {photo.filename || photo.id}
            </div>
          </div>
        ))}
      </div>
      {/* For debugging selection (optional): */}
      {/* <pre className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-x-auto">
        Selected Photo IDs: {JSON.stringify(selectedPhotoIds, null, 2)}
      </pre> */}
    </div>
  );
}
