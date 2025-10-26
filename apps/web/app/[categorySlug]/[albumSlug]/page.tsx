import type { Album, Category, Photo } from '@lounge/types';
import { Suspense, use } from 'react';
import LoadingSkeleton from './loading-skeleton';
import PhotoGrid from './photo-grid';

interface PageProps {
  params: Promise<{
    categorySlug: string;
    albumSlug: string;
  }>;
}

interface AlbumData {
  category: Category;
  album: Album;
  photos: Photo[];
}

// Data fetching function that can be used with React 19 use() hook
async function fetchAlbumData(resolvedParams: {
  categorySlug: string;
  albumSlug: string;
}): Promise<AlbumData> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch category
  const categoryResponse = await fetch(
    `${apiBaseUrl}/categories/slug/${resolvedParams.categorySlug}`,
    { cache: 'no-store' },
  );

  if (!categoryResponse.ok) {
    throw new Error('Category not found');
  }

  const category = await categoryResponse.json();

  // Fetch album
  const albumResponse = await fetch(`${apiBaseUrl}/albums/slug/${resolvedParams.albumSlug}`, {
    cache: 'no-store',
  });

  if (!albumResponse.ok) {
    throw new Error('Album not found');
  }

  const album = await albumResponse.json();

  // Fetch photos
  const photosResponse = await fetch(`${apiBaseUrl}/photos?albumId=${album.id}`, {
    cache: 'no-store',
  });

  let photos: Photo[] = [];
  if (photosResponse.ok) {
    photos = await photosResponse.json();
  }

  return { category, album, photos };
}

// Server Component that uses React 19 use() hook for data fetching
function AlbumContent({ params }: PageProps) {
  // Use React 19 use() hook for async parameter resolution
  const resolvedParams = use(params);

  // Create promise for data fetching
  const albumPromise = fetchAlbumData(resolvedParams);

  // Use the use() hook to declaratively fetch data
  const data = use(albumPromise);

  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <a
            href={`/${data.category.slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4 mr-1"
              role="img"
              aria-label="Back arrow"
            >
              <title>Back arrow</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to {data.category.name}
          </a>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold text-foreground">{data.album.name}</h1>

        {data.album.description && (
          <p className="mt-2 text-muted-foreground max-w-3xl">{data.album.description}</p>
        )}

        <div className="mt-8">
          {data.photos.length === 0 ? (
            <p className="text-muted-foreground">В цьому альбомі поки немає фотографій.</p>
          ) : (
            <PhotoGrid photos={data.photos} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AlbumContent params={params} />
    </Suspense>
  );
}
