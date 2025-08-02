'use client';

import { useState } from 'react';
import SelectCombobox, {
  SelectOption,
} from '../../components/ui/select-combobox';

const languageOptions: SelectOption[] = [
  { value: 'uk', label: 'Українська' },
  { value: 'en', label: 'English' },
  { value: 'ru', label: 'Русский' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
];

const statusOptions: SelectOption[] = [
  { value: 'active', label: 'Активний' },
  { value: 'inactive', label: 'Неактивний' },
  { value: 'draft', label: 'Чернетка' },
];

export default function TestSelectPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Тест универсального Select компонента
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Мова
          </label>
          <SelectCombobox
            options={languageOptions}
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            placeholder="Оберіть мову"
            searchPlaceholder="Пошук мов..."
            emptyMessage="Мови не знайдено"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Статус
          </label>
          <SelectCombobox
            options={statusOptions}
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Оберіть статус"
            searchPlaceholder="Пошук статусів..."
            emptyMessage="Статуси не знайдено"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            З помилкою
          </label>
          <SelectCombobox
            options={statusOptions}
            value=""
            onChange={() => {}}
            placeholder="Оберіть статус"
            error="Це поле обов'язкове"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Відключений
          </label>
          <SelectCombobox
            options={statusOptions}
            value=""
            onChange={() => {}}
            placeholder="Недоступний для вибору"
            disabled={true}
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-4xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Обрані значення:
        </h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Мова:</strong> {selectedLanguage || 'Не обрано'}
          </p>
          <p>
            <strong>Статус:</strong> {selectedStatus || 'Не обрано'}
          </p>
        </div>
      </div>
    </div>
  );
}
