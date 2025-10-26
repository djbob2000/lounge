'use client';

import type { Category } from '@lounge/types';
import Link from 'next/link';
import CategoryListItem from '../../../components/admin/category-list-item';
import DraggableList from '../../../components/admin/draggable-list';

interface CategoryClientPageProps {
  initialCategories: Category[];
}

export default function CategoryClientPage({ initialCategories }: CategoryClientPageProps) {
  // Since this is a client component, you might want to fetch categories here
  // or handle state, but for now, we'll use the initialCategories prop.
  const categories = initialCategories;

  return (
    <>
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-700 mb-4 text-lg">Категорії відсутні</p>
          <Link
            href="/admin/categories/new"
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Створити першу категорію
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DraggableList
            items={categories}
            itemType="category"
            renderItem={(item) => <CategoryListItem item={item as Category} />}
          />
        </div>
      )}
    </>
  );
}
