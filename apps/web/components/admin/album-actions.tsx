'use client';

import { useAuth } from '@clerk/nextjs'; // Import useAuth
import type { Album, Photo } from '@lounge/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PhotoGrid from './photo-grid'; // Ensure this path is correct
import PhotoUploadForm from './photo-upload-form';

interface AlbumActionsProps {
  initialPhotos: Photo[];
  albums: Album[];
}

export default function AlbumActions({ initialPhotos, albums }: AlbumActionsProps) {
  const router = useRouter();
  const { getToken } = useAuth(); // Get getToken function
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  // To manage the photos list if we want to update UI immediately after delete without full refresh
  // const [currentPhotos, setCurrentPhotos] = useState<Photo[]>(initialPhotos);

  const handleUploadComplete = () => {
    setDeleteMessage(''); // Clear any previous delete messages
    setSelectedPhotoIds([]); // Clear selection
    // Add a small delay to allow backend processing and DB updates to reflect
    setTimeout(() => {
      router.refresh();
    }, 300); // Adjusted delay
  };

  const handlePhotoSelectionChange = (newSelectedIds: string[]) => {
    setSelectedPhotoIds(newSelectedIds);
    setDeleteMessage(''); // Clear delete message when selection changes
  };

  const validateSelection = () => {
    if (selectedPhotoIds.length === 0) {
      setDeleteMessage('Please select photos to delete.');
      return false;
    }
    if (
      !confirm(
        `Are you sure you want to delete ${selectedPhotoIds.length} photo(s)? This action cannot be undone.`,
      )
    ) {
      return false;
    }
    return true;
  };

  const getAuthToken = async () => {
    const token = await getToken();
    if (!token) {
      setDeleteMessage('Authentication token not found. Please try logging in again.');
      console.error('AlbumActions: Halting delete due to missing token.');
      return null;
    }
    return token;
  };

  const deletePhoto = async (photoId: string, token: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${apiUrl}/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to get error details' }));
      console.error(`Failed to delete photo ${photoId}: ${errorData.message}`);
      return { success: false, photoId };
    }
  };

  const deletePhotos = async (token: string) => {
    const results = await Promise.all(
      selectedPhotoIds.map((photoId) =>
        deletePhoto(photoId, token).catch(() => ({ success: false, photoId })),
      ),
    );

    const successfulDeletes = results.filter((r) => r.success).length;
    const failedDeletes = results
      .filter((r) => !r.success)
      .map((r) => r.photoId)
      .filter((id): id is string => id !== undefined);

    return { successfulDeletes, failedDeletes };
  };

  const processResults = (successfulDeletes: number, failedDeletes: string[]) => {
    let message = `Deletion complete. Successfully deleted: ${successfulDeletes}/${selectedPhotoIds.length}.`;
    if (failedDeletes.length > 0) {
      message += ` Failed to delete: ${failedDeletes.length} photo(s).`;
    }
    setDeleteMessage(message);

    setSelectedPhotoIds([]);

    if (successfulDeletes > 0) {
      setTimeout(() => router.refresh(), failedDeletes.length > 0 ? 3000 : 1500);
    }
  };

  const handleDeleteSelectedPhotos = async () => {
    if (!validateSelection()) return;

    setIsDeleting(true);
    setDeleteMessage(`Deleting ${selectedPhotoIds.length} photo(s)...`);

    const token = await getAuthToken();
    if (!token) {
      setIsDeleting(false);
      return;
    }

    try {
      const { successfulDeletes, failedDeletes } = await deletePhotos(token);
      processResults(successfulDeletes, failedDeletes);
    } catch (error) {
      console.error('Error during photo deletion:', error);
      setDeleteMessage('An error occurred during deletion. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 my-6">
      <PhotoUploadForm onUploadComplete={handleUploadComplete} albums={albums} />

      <div>
        <h3 className="text-xl font-semibold mb-3 text-foreground">Photos in Album</h3>
        {initialPhotos.length === 0 ? (
          <p className="text-gray-600">No photos in this album yet. Upload the first ones!</p>
        ) : (
          <>
            <PhotoGrid photos={initialPhotos} onSelectionChange={handlePhotoSelectionChange} />
            {selectedPhotoIds.length > 0 && (
              <div className="mt-6 p-4 border-t border-gray-200">
                <h4 className="text-md font-semibold mb-2 text-gray-700">
                  Manage selected photos:
                </h4>
                <button
                  type="button"
                  onClick={handleDeleteSelectedPhotos}
                  disabled={isDeleting || selectedPhotoIds.length === 0}
                  className="px-5 py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
                >
                  {isDeleting
                    ? `Deleting... (${selectedPhotoIds.length})`
                    : `Delete Selected (${selectedPhotoIds.length})`}
                </button>
                {deleteMessage && <p className="mt-2.5 text-sm text-gray-600">{deleteMessage}</p>}
              </div>
            )}
          </>
        )}
        {initialPhotos.length > 0 && selectedPhotoIds.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            Click on photos to select them for bulk deletion.
          </p>
        )}
      </div>
    </div>
  );
}
