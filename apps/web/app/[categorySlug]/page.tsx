import type { Album, Category } from '@lounge/types';
import Image from 'next/image';
import Link from 'next/link';

import { Suspense, use } from 'react';

interface CategoryPageParams {
  params: Promise<{
    categorySlug: string;
  }>;
}

// Data fetching functions using React 19 use() hook patterns
async function getCategoryData(
  categorySlug: string,
): Promise<{ category: Category; albums: Album[] }> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Fetch category
  const categoryResponse = await fetch(`${apiBaseUrl}/categories/slug/${categorySlug}`, {
    cache: 'no-store',
  });

  if (!categoryResponse.ok) {
    throw new Error('Category not found');
  }

  const category = await categoryResponse.json();

  // Fetch albums
  const albumsResponse = await fetch(`${apiBaseUrl}/albums/category/${category.id}`, {
    cache: 'no-store',
  });

  let albums: Album[] = [];
  if (albumsResponse.ok) {
    albums = await albumsResponse.json();
  }

  return { category, albums };
}

// Server Component using React 19 use() hook
function CategoryContent({ params }: CategoryPageParams) {
  // Use React 19 use() hook for async parameter resolution
  const resolvedParams = use(params);

  // Create promise for data fetching
  const categoryDataPromise = getCategoryData(resolvedParams.categorySlug);

  // Use the use() hook to declaratively fetch data
  const { category, albums } = use(categoryDataPromise);

  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">{category.name}</h1>

        {albums.length === 0 ? (
          <p className="text-muted-foreground">В цій категорії поки немає альбомів.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums
              .filter((album) => !album.isHidden)
              .map((album) => (
                <Link key={album.id} href={`/${category.slug}/${album.slug}`} className="group">
                  <div className="aspect-square relative overflow-hidden rounded-md border bg-muted transition-all hover:shadow-md">
                    {album.coverImageUrl ? (
                      <Image
                        src={album.coverImageUrl}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Без обкладинки
                      </div>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                    {album.name}
                  </h2>
                  {album.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton component
function CategoryLoadingSkeleton() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 bg-muted rounded w-64 mb-6 animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            'skeleton-1',
            'skeleton-2',
            'skeleton-3',
            'skeleton-4',
            'skeleton-5',
            'skeleton-6',
            'skeleton-7',
            'skeleton-8',
          ].map((key) => (
            <div key={key}>
              <div className="aspect-square bg-muted rounded-md animate-pulse mb-2" />
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage({ params }: CategoryPageParams) {
  return (
    <Suspense fallback={<CategoryLoadingSkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}
