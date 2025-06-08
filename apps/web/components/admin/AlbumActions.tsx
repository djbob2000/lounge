"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PhotoUploadForm from './PhotoUploadForm';
import PhotoGrid from "./PhotoGrid"; // Ensure this path is correct
import { Photo } from "@lounge/types";

interface AlbumActionsProps {
  albumId: string;
  initialPhotos: Photo[];
}

export default function AlbumActions({ albumId, initialPhotos }: AlbumActionsProps) {
  const router = useRouter();
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

  const handleDeleteSelectedPhotos = async () => {
    if (selectedPhotoIds.length === 0) {
      setDeleteMessage("Будь ласка, виберіть фотографії для видалення.");
      return;
    }
    if (!confirm(`Ви впевнені, що хочете видалити ${selectedPhotoIds.length} фотографію(й)? Цю дію неможливо буде скасувати.`)) {
      return;
    }

    setIsDeleting(true);
    setDeleteMessage(`Видалення ${selectedPhotoIds.length} фото...`);
    let successfulDeletes = 0;
    const failedDeletes: string[] = [];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'; // Ensure /api if needed

    for (const photoId of selectedPhotoIds) {
      try {
        const response = await fetch(`${apiUrl}/photos/${photoId}`, { method: 'DELETE' });
        if (response.ok) {
          successfulDeletes++;
        } else {
          const errorData = await response.json().catch(() => ({ message: "Не вдалося отримати деталі помилки" }));
          console.error(`Failed to delete photo ${photoId}: ${errorData.message}`);
          failedDeletes.push(photoId);
        }
      } catch (error: any) {
        console.error(`Network error deleting photo ${photoId}:`, error);
        failedDeletes.push(photoId);
      }
    }

    setIsDeleting(false);
    let message = `Видалення завершено. Успішно видалено: ${successfulDeletes}/${selectedPhotoIds.length}.`;
    if (failedDeletes.length > 0) {
      message += ` Не вдалося видалити: ${failedDeletes.length} фото.`;
    }
    setDeleteMessage(message);

    // Optimistic UI update: filter out deleted photos from currentPhotos
    // setCurrentPhotos(currentPhotos.filter(p => !selectedPhotoIds.includes(p.id) || failedDeletes.includes(p.id)));

    setSelectedPhotoIds([]);

    if (successfulDeletes > 0) {
      // Refresh after a short delay to allow user to read the message
      setTimeout(() => router.refresh(), failedDeletes.length > 0 ? 3000 : 1500);
    }
  };

  return (
    <div className="space-y-8 my-6">
      <PhotoUploadForm albumId={albumId} onUploadComplete={handleUploadComplete} />

      <div>
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Фотографії в Альбомі</h3>
        {initialPhotos.length === 0 ? (
            <p className="text-gray-600">Фотографій в цьому альбомі ще немає. Завантажте перші!</p>
        ) : (
          <>
            <PhotoGrid photos={initialPhotos} onSelectionChange={handlePhotoSelectionChange} />
            {selectedPhotoIds.length > 0 && (
              <div className="mt-6 p-4 border-t border-gray-200">
                 <h4 className="text-md font-semibold mb-2 text-gray-700">Керування вибраними фото:</h4>
                <button
                  onClick={handleDeleteSelectedPhotos}
                  disabled={isDeleting || selectedPhotoIds.length === 0}
                  className="px-5 py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
                >
                  {isDeleting ? `Видалення... (${selectedPhotoIds.length})` : `Видалити вибрані (${selectedPhotoIds.length})`}
                </button>
                {deleteMessage && <p className="mt-2.5 text-sm text-gray-600">{deleteMessage}</p>}
              </div>
            )}
          </>
        )}
         {initialPhotos.length > 0 && selectedPhotoIds.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">Клікніть на фотографії, щоб вибрати їх для масового видалення.</p>
        )}
      </div>
    </div>
  );
}
