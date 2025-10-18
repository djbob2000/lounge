import type { Album } from '@lounge/types';

import PhotoUploadForm from '@/components/admin/photo-upload-form';

export default async function NewPhotoPage({
  searchParams,
}: {
  searchParams: { albumId?: string };
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums`,
    {
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }

  const albums: Album[] = await response.json();
  const albumId = searchParams.albumId;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Upload New Photo</h1>
        <p className="text-gray-600 mt-2">Upload a new photo to one of your albums</p>
      </div>

      <PhotoUploadForm albums={albums} albumId={albumId} />
    </div>
  );
}
