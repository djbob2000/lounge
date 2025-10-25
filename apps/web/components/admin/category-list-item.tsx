'use client';

import type { Category } from '@lounge/types';
import Link from 'next/link';
import CategoryDeleteButton from './CategoryDeleteButton';

interface CategoryListItemProps {
  item: Category;
  index: number;
}

export default function CategoryListItem({ item: category, index }: CategoryListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
            <p className="text-sm text-gray-600 mt-1">/{category.slug}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 font-medium">Показувати в меню:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  category.showInMenu ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category.showInMenu ? 'Так' : 'Ні'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Редагувати
              </Link>
              <CategoryDeleteButton categoryId={category.id} categoryName={category.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
