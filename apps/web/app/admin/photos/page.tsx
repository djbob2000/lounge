import type { Album, Photo } from '@lounge/types';
import Link from 'next/link';
import PhotoClientPage from './photo-client-page';

// Function to fetch photos from the API
async function getPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/photos`,
      {
        next: { revalidate: 900 },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

// Function to fetch albums from the API
async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/albums`,
      {
        next: { revalidate: 1800 },
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

// Function to fetch photos by album from the API
async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/photos/album/${albumId}`,
      {
        next: { revalidate: 900 },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch photos by album');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching photos by album:', error);
    return [];
  }
}

// Function to fetch slider photos from the API
async function getSliderPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/photos/slider`,
      {
        next: { revalidate: 900 },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch slider photos');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching slider photos:', error);
    return [];
  }
}

// Group photos by album
function groupPhotosByAlbum(photos: Photo[], albums: Album[]) {
  const albumMap = new Map(albums.map((album) => [album.id, album]));
  const grouped = new Map<string, { album: Album; photos: Photo[] }>();

  photos.forEach((photo) => {
    const album = albumMap.get(photo.albumId);
    if (album) {
      if (!grouped.has(album.id)) {
        grouped.set(album.id, { album, photos: [] });
      }
      grouped.get(album.id)?.photos.push(photo);
    }
  });

  // Sort photos within each album by display order
  grouped.forEach((group) => {
    group.photos.sort((a, b) => a.displayOrder - b.displayOrder);
  });

  return Array.from(grouped.values()).sort((a, b) => a.album.displayOrder - b.album.displayOrder);
}

async function fetchPhotosData(albumId?: string, isSlider?: boolean) {
  if (isSlider) {
    const photos = await getSliderPhotos();
    return {
      photos,
      allAlbums: [],
      currentAlbum: undefined,
      title: 'Slider Photos',
      showGrouped: false,
    };
  }

  if (albumId) {
    const allAlbums = await getAlbums();
    const currentAlbum = allAlbums.find((a) => a.id === albumId);
    if (!currentAlbum) {
      return {
        photos: [],
        allAlbums,
        currentAlbum: undefined,
        title: 'Album Not Found',
        showGrouped: false,
      };
    }
    const photos = await getPhotosByAlbum(albumId);
    return {
      photos,
      allAlbums,
      currentAlbum,
      title: `Photos in "${currentAlbum.name}"`,
      showGrouped: false,
    };
  }

  const [photos, allAlbums] = await Promise.all([getPhotos(), getAlbums()]);
  return { photos, allAlbums, currentAlbum: undefined, title: 'All Photos', showGrouped: true };
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ albumId?: string; slider?: string }>;
}) {
  const { albumId, slider } = await searchParams;
  const isSliderPage = slider === 'true';
  const { photos, allAlbums, currentAlbum, title, showGrouped } = await fetchPhotosData(
    albumId,
    isSliderPage,
  );
  const groupedPhotos = showGrouped ? groupPhotosByAlbum(photos, allAlbums) : null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-foreground">{title}</h1>
          <p className="text-foreground/70 mt-1">
            {showGrouped
              ? `${photos.length} фотографій у ${groupedPhotos?.length || 0} альбомах`
              : `${photos.length} фотографій`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/admin/photos?slider=true"
            className={`px-4 py-2 rounded-md transition-colors ${
              isSliderPage
                ? 'bg-accent text-accent-foreground border border-border'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground'
            }`}
          >
            Фото слайдера
          </Link>
          <Link
            href="/admin/photos"
            className={`px-4 py-2 rounded-md transition-colors ${
              !albumId && !isSliderPage
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground'
            }`}
          >
            Всі фотографії
          </Link>
          <Link
            href={
              albumId
                ? `/admin/photos/new?albumId=${albumId}`
                : isSliderPage
                  ? '/admin/photos/new?slider=true'
                  : '/admin/photos/new'
            }
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
          >
            Завантажити фото
          </Link>
        </div>
      </div>

      {showGrouped && groupedPhotos ? (
        // Grouped view by album
        <div className="space-y-8">
          {groupedPhotos.map(({ album, photos: albumPhotos }) => (
            <div key={album.id} className="bg-card rounded-lg shadow overflow-hidden border border-border">
              <div className="bg-secondary/50 px-6 py-4 border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{album.name}</h3>
                    <p className="text-sm text-foreground/70">{albumPhotos.length} фотографій</p>
                  </div>
                  <Link
                    href={`/admin/photos?albumId=${album.id}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Переглянути альбом →
                  </Link>
                </div>
              </div>
              <PhotoClientPage initialPhotos={albumPhotos} album={album} />
            </div>
          ))}
        </div>
      ) : (
        // Single list view (for specific album, slider, or if initial load is empty)
        <PhotoClientPage initialPhotos={photos} album={currentAlbum} isSliderPage={isSliderPage} />
      )}
    </div>
  );
}
