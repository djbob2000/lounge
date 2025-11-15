'use client';

import type { Album } from '@lounge/types';
import Link from 'next/link';
import AlbumListItem from '../../../components/admin/album-list-item'; // Assuming you have or will create this
import DraggableList from '../../../components/admin/draggable-list';

interface AlbumClientPageProps {
  initialAlbums: Album[];
  categoryId?: string; // Add categoryId prop
}

export default function AlbumClientPage({ initialAlbums, categoryId }: AlbumClientPageProps) {
  const albums = initialAlbums;

  return (
    <>
      {albums.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-6 text-center border border-border dark:bg-card">
          <p className="text-foreground dark:text-foreground mb-4">Альбоми не знайдено</p>
          <Link
            href={categoryId ? `/admin/albums/new?categoryId=${categoryId}` : '/admin/albums/new'}
            className="text-primary hover:text-primary/80 underline font-medium"
          >
            Додати альбом
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-lg shadow overflow-hidden border border-border dark:bg-card">
          <DraggableList
            items={albums}
            itemType="album"
            renderItem={(item) => <AlbumListItem item={item as Album} />}
          />
        </div>
      )}
    </>
  );
}
