'use client';

import SelectCombobox, { type SelectOption } from '../ui/select-combobox';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface PrioritySelectProps {
  value: Priority | string;
  onChange: (priority: Priority | string) => void;
  error?: string;
  placeholder?: string;
  priorities?: { value: Priority | string; label: string; color?: string }[];
}

const defaultPriorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Низький', color: 'text-green-600' },
  { value: 'medium', label: 'Середній', color: 'text-yellow-600' },
  { value: 'high', label: 'Високий', color: 'text-orange-600' },
  { value: 'urgent', label: 'Терміновий', color: 'text-red-600' },
];

export default function PrioritySelect({
  value,
  onChange,
  error,
  placeholder = 'Оберіть пріоритет',
  priorities = defaultPriorities,
}: PrioritySelectProps) {
  const options: SelectOption[] = priorities.map((priority) => ({
    value: priority.value,
    label: priority.label,
  }));

  return (
    <SelectCombobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Пошук пріоритетів..."
      emptyMessage="Пріоритети не знайдено"
      error={error}
    />
  );
}
