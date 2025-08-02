'use client';

import SelectCombobox, { SelectOption } from '../ui/select-combobox';

export type Status = 'active' | 'inactive' | 'draft' | 'published' | 'archived';

interface StatusSelectProps {
  value: Status | string;
  onChange: (status: Status | string) => void;
  error?: string;
  placeholder?: string;
  statuses?: { value: Status | string; label: string }[];
}

const defaultStatuses: { value: Status; label: string }[] = [
  { value: 'active', label: 'Активний' },
  { value: 'inactive', label: 'Неактивний' },
  { value: 'draft', label: 'Чернетка' },
  { value: 'published', label: 'Опублікований' },
  { value: 'archived', label: 'Архівований' },
];

export default function StatusSelect({
  value,
  onChange,
  error,
  placeholder = 'Оберіть статус',
  statuses = defaultStatuses,
}: StatusSelectProps) {
  const options: SelectOption[] = statuses.map((status) => ({
    value: status.value,
    label: status.label,
  }));

  return (
    <SelectCombobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Пошук статусів..."
      emptyMessage="Статуси не знайдено"
      error={error}
    />
  );
}
