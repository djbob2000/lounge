'use client';

import type { Album, Photo } from '@lounge/types'; // Assuming Album might be needed for context like album name
import Link from 'next/link';
import DraggableList from '../../../components/admin/draggable-list';
import PhotoListItem from '../../../components/admin/photo-list-item'; // Assuming you have or will create this

interface PhotoClientPageProps {
  initialPhotos: Photo[];
  album?: Album; // Optional: Pass the album context if available and needed
  isSliderPage?: boolean; // To differentiate between album photos and slider photos
}

export default function PhotoClientPage({
  initialPhotos,
  album,
  isSliderPage = false,
}: PhotoClientPageProps) {
  const photos = initialPhotos;

  const getEmptyStateMessage = () => {
    if (isSliderPage) {
      return 'Слайдер порожній. Додайте фотографії до слайдера.';
    }
    if (album) {
      return `Альбом "${album.name}" порожній.`;
    }
    return 'Фотографії відсутні.';
  };

  const getAddLink = () => {
    if (isSliderPage) {
      // Link to a page or modal to add photos to slider (adjust as needed)
      return '/admin/photos/new?slider=true';
    }
    if (album) {
      return `/admin/photos/new?albumId=${album.id}`;
    }
    return '/admin/photos/new';
  };

  const getAddButtonText = () => {
    if (isSliderPage) {
      return 'Додати фото до слайдера';
    }
    return 'Завантажити фото';
  };

  return (
    <>
      {photos.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-6 text-center border border-border dark:bg-card">
          <p className="text-foreground dark:text-foreground mb-4">{getEmptyStateMessage()}</p>
          <Link href={getAddLink()} className="text-primary hover:text-primary/80 underline font-medium">
            {getAddButtonText()}
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden border border-border dark:bg-card">
          <DraggableList
            items={photos}
            itemType="photo"
            renderItem={(item) => <PhotoListItem item={item as Photo} />}
          />
        </div>
      )}
    </>
  );
}
