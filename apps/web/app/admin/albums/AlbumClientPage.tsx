'use client';

import Link from 'next/link';
import { Album } from '@lounge/types';
import DraggableList from '../../../components/admin/DraggableList';
import AlbumListItem from '../../../components/admin/AlbumListItem'; // Assuming you have or will create this

interface AlbumClientPageProps {
  initialAlbums: Album[];
  categorySlug?: string; // Optional, if needed for links or other logic
  categoryId?: string; // Add categoryId prop
}

export default function AlbumClientPage({
  initialAlbums,
  categorySlug,
  categoryId,
}: AlbumClientPageProps) {
  const albums = initialAlbums;

  return (
    <>
      {albums.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">No albums found</p>
          <Link
            href={
              categoryId
                ? `/admin/albums/new?categoryId=${categoryId}`
                : '/admin/albums/new'
            }
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Add photos
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DraggableList
            items={albums}
            itemType="album"
            renderItem={(item, index) => (
              <AlbumListItem item={item as Album} index={index} />
            )}
          />
        </div>
      )}
    </>
  );
}
