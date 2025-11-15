import type { Album, Category } from '@lounge/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense, use } from 'react';

import AlbumForm from '../../../../../components/admin/album-form';

// Function to fetch album by ID
async function getAlbum(id: string): Promise<Album | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1/albums/${id}`,
      {
        next: { revalidate: 1800 },
      },
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Помилка отримання альбому:', error);
    return null;
  }
}

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
      throw new Error('Помилка отримання категорій');
    }

    return response.json();
  } catch (error) {
    console.error('Помилка отримання категорій:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Редагувати альбом | Адмін панель',
  description: 'Редагування альбому фотографій',
};

interface EditAlbumPageProps {
  params: Promise<{
    id: string;
  }>;
}

function EditAlbumContentWithFetch({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dataPromise = Promise.all([getAlbum(resolvedParams.id), getCategories()]).then(
    ([album, categories]) => ({ album, categories }),
  );
  const { album, categories } = use(dataPromise);
  if (!album) {
    return <div className="min-h-[200px]" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Редагувати альбом</h1>
        <p className="text-gray-600 mt-2">Редагування альбому &quot;{album.name}&quot;</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AlbumForm album={album} categories={categories} categoryId={album.categoryId} />
      </div>
    </div>
  );
}

export default function EditAlbumPage({ params }: EditAlbumPageProps) {
  return (
    <Suspense fallback={<div className="min-h-[200px]" />}>
      <EditAlbumContentWithFetch params={params} />
    </Suspense>
  );
}
