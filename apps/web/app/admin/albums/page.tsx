import type { Album, Category } from '@lounge/types';
import Link from 'next/link';
import AlbumClientPage from './album-client-page';

// Function to fetch categories from the API
async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/categories`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error('Error fetching categories');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Function to fetch albums by category from the API
async function getAlbumsByCategory(categoryId: string): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/albums/category/${categoryId}`,
      {
        next: { revalidate: 1800 },
      },
    );

    if (!response.ok) {
      throw new Error('Error fetching albums');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

export async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/albums`,
      {
        next: { revalidate: 1800 },
      },
    );

    if (!response.ok) {
      throw new Error('Error fetching albums');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}
export default async function AlbumsPage() {
  const categories = await getCategories();

  // Fetch albums for all categories
  const categoriesWithAlbums = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      albums: await getAlbumsByCategory(category.id),
    })),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Альбоми</h1>
        <Link
          href="/admin/albums/new"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md transition-colors"
        >
          Додати альбом
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-card rounded-lg shadow p-6 text-center border border-border">
          <p className="text-foreground/70 mb-4">Спочатку створіть категорії</p>
          <Link
            href="/admin/categories/new"
            className="text-primary hover:text-primary/80 underline"
          >
            Створити категорію
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesWithAlbums.map((category) => (
            <div key={category.id} className="bg-card rounded-lg shadow overflow-hidden border border-border">
              <div className="bg-secondary/50 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-foreground">{category.name}</h2>
                  <Link
                    href={`/admin/albums/new?categoryId=${category.id}`}
                    className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded transition-colors"
                  >
                    Додати альбом
                  </Link>
                </div>
              </div>
              <AlbumClientPage initialAlbums={category.albums} categoryId={category.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
