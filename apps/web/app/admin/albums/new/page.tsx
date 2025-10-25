import type { Category } from '@lounge/types';
import type { Metadata } from 'next';
import AlbumForm from '../../../../components/admin/album-form';

// Function to fetch categories from the API
async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Помилка отримання категорій');
    }

    return response.json();
  } catch (error) {
    console.error('Помилка отримання категорій:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Додати альбом | Адмін панель',
  description: 'Створення нового альбому фотографій',
};

interface NewAlbumPageProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export default async function NewAlbumPage({ searchParams }: NewAlbumPageProps) {
  const categories = await getCategories();
  const { categoryId } = await searchParams;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Додати альбом</h1>
        <p className="text-gray-600 mt-2">Створіть новий альбом для організації фотографій</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AlbumForm categories={categories} categoryId={categoryId} />
      </div>
    </div>
  );
}
