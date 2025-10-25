import type { Metadata } from 'next';
import CategoryForm from '../../../../components/admin/category-form';

export const metadata: Metadata = {
  title: 'Додати категорію | Адмін панель',
  description: 'Створення нової категорії фотоальбомів',
};

export default function NewCategoryPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Додати категорію</h1>
        <p className="text-gray-600 mt-2">Створіть нову категорію для організації фотоальбомів</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
