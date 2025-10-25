import type { Category } from '@lounge/types';
import Link from 'next/link';
import CategoryClientPage from './category-client-page';

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

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Категорії</h1>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md transition-colors font-medium shadow-sm"
        >
          Додати категорію
        </Link>
      </div>
      <CategoryClientPage initialCategories={categories} />
    </div>
  );
}
