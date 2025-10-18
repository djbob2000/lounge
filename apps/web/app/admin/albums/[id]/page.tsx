import type { Album, Photo } from '@lounge/types';
import AlbumActions from '../../../../components/admin/album-actions'; // Import AlbumActions

async function getAlbumDetails(albumId: string): Promise<Album | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/albums/${albumId}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) {
        console.log(`Album with ID ${albumId} not found (404).`);
        return null;
      }
      console.error(`Error fetching album ${albumId}: ${res.status} ${res.statusText}`);
      // Optionally, parse error body if API provides one: const errorBody = await res.text(); console.error(errorBody);
      throw new Error('Failed to fetch album details');
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching album details for ID ${albumId}:`, error);
    return null;
  }
}

async function getAllAlbums(): Promise<Album[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/albums`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`Error fetching albums: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch albums');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

async function getAlbumPhotos(albumId: string): Promise<Photo[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${apiUrl}/photos/album/${albumId}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`Error fetching photos for album ${albumId}: ${res.status} ${res.statusText}`);
      throw new Error('Failed to fetch album photos');
    }
    const data = await res.json();
    return Array.isArray(data) ? data : []; // Ensure it returns an array
  } catch (error) {
    console.error(`Error fetching album photos for ID ${albumId}:`, error);
    return [];
  }
}

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params: paramsPromise }: AlbumDetailPageProps) {
  const { id: albumId } = await paramsPromise;

  // Fetch in parallel
  const [album, photos, albums] = await Promise.all([
    getAlbumDetails(albumId),
    getAlbumPhotos(albumId),
    getAllAlbums(),
  ]);

  if (!album) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Album not found</h1>
        <p className="text-gray-600 mt-2">
          Album with ID <span className="font-mono">{albumId}</span> was not found. It might have
          been deleted or an incorrect ID was provided.
        </p>
        {/* Consider adding a link back to the albums list page */}
        {/* <Link href="/admin/albums" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Back to albums list
        </Link> */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">{album.name}</h1>
        {album.description && <p className="text-lg text-gray-600">{album.description}</p>}
        <p className="text-sm text-gray-500 mt-1">
          Album ID: <span className="font-mono">{album.id}</span>
        </p>
      </header>

      {/* AlbumActions will contain PhotoUploadForm, PhotoGrid, and photo deletion logic */}
      <AlbumActions initialPhotos={photos} albums={albums} />
    </div>
  );
}
