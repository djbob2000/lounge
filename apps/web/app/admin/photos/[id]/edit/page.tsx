import type { Album, Photo } from '@lounge/types';
import { notFound } from 'next/navigation';
import PhotoForm from '../../../../../components/admin/photo-form';

// Function to fetch a specific photo
async function getPhoto(id: string): Promise<Photo | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/photos/${id}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch photo');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
}

// Function to fetch albums from the API
async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/albums`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch albums');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

interface EditPhotoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPhotoPage({ params }: EditPhotoPageProps) {
  const { id } = await params;
  const [photo, albums] = await Promise.all([getPhoto(id), getAlbums()]);

  if (!photo) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Photo</h1>
        <p className="text-gray-600 mt-2">Update photo details and settings</p>
      </div>

      <PhotoForm photo={photo} albums={albums} />
    </div>
  );
}
