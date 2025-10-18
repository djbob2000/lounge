'use client';

import type { Category } from '@lounge/types';
import SelectCombobox, { type SelectOption } from '../ui/select-combobox';

interface CategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function CategorySelect({
  categories,
  value,
  onChange,
  error,
  placeholder = 'Оберіть категорію',
  disabled = false,
}: CategorySelectProps) {
  const options: SelectOption[] = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  return (
    <SelectCombobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Пошук категорій..."
      emptyMessage="Категорії не знайдено"
      error={error}
      disabled={disabled}
    />
  );
}
