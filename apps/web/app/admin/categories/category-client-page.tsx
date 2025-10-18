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
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">Категорії відсутні</p>
          <Link
            href="/admin/categories/new"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Створити першу категорію
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DraggableList
            items={categories}
            itemType="category"
            renderItem={(item, index) => <CategoryListItem item={item as Category} index={index} />}
          />
        </div>
      )}
    </>
  );
}
