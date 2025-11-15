'use client';

import type { Category } from '@lounge/types';
import { useRouter } from 'next/navigation';
import { FormActions, FormCheckbox, FormError, FormField } from '@/lib/forms/form-components';
import { useFormHandler } from '@/lib/forms/form-handler';

interface CategoryFormData extends Record<string, unknown> {
  name: string;
  slug: string;
  showInMenu: boolean;
}

interface CategoryFormProps {
  category?: Category;
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();

  const { formData, errors, isLoading, id, handleSubmit, handleInputChange } =
    useFormHandler<CategoryFormData>({
      initialData: {
        name: category?.name || '',
        slug: category?.slug || '',
        showInMenu: category?.showInMenu || false,
      },
      apiEndpoint: '/categories',
      successRedirect: '/admin/categories',
      itemId: category?.id,
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && <FormError error={errors.general} />}

      <FormField
        id={`${id}-name`}
        name="name"
        label="Назва категорії"
        value={formData.name}
        onChange={handleInputChange}
        error={errors.name}
        placeholder="Введіть назву категорії"
        required
      />

      <FormField
        id={`${id}-slug`}
        name="slug"
        label="Slug (URL)"
        value={formData.slug}
        onChange={handleInputChange}
        error={errors.slug}
        placeholder="Залиште порожнім для автоматичної генерації"
        description="Якщо залишити порожнім, буде згенеровано автоматично з назви"
      />

      <FormCheckbox
        id={`${id}-showInMenu`}
        name="showInMenu"
        label="Показувати в меню"
        checked={formData.showInMenu}
        onChange={handleInputChange}
        error={errors.showInMenu}
        description="Якщо увімкнено, категорія буде відображатися в навігаційному меню"
      />

      <FormActions
        isLoading={isLoading}
        onCancel={() => router.back()}
        submitText={category ? 'Оновити' : 'Створити'}
        loadingText="Збереження..."
      />
    </form>
  );
}
