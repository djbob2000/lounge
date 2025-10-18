'use client';

import type { Album, Category } from '@lounge/types';
import { useState } from 'react';
import SelectCombobox, { type SelectOption } from '../ui/select-combobox';
import AlbumSelect from './album-select';
import CategorySelect from './category-select';
import PrioritySelect from './priority-select';
import StatusSelect from './status-select';

interface SelectExamplesProps {
  categories: Category[];
  albums: Album[];
}

export default function SelectExamples({ categories, albums }: SelectExamplesProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Example of custom language options
  const languageOptions: SelectOption[] = [
    { value: 'uk', label: 'Українська' },
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'it', label: 'Italiano' },
    { value: 'pl', label: 'Polski' },
  ];

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900">Select Components Usage Examples</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <CategorySelect
            categories={categories}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Select category"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Album</label>
          <AlbumSelect
            albums={albums}
            value={selectedAlbum}
            onChange={setSelectedAlbum}
            placeholder="Select album"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <StatusSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            placeholder="Select status"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
          <PrioritySelect
            value={selectedPriority}
            onChange={setSelectedPriority}
            placeholder="Select priority"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language (Custom Select)
          </label>
          <SelectCombobox
            options={languageOptions}
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            placeholder="Select language"
            searchPlaceholder="Search languages..."
            emptyMessage="No languages found"
          />
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected values:</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Category:</strong> {selectedCategory || 'Not selected'}
          </p>
          <p>
            <strong>Album:</strong> {selectedAlbum || 'Not selected'}
          </p>
          <p>
            <strong>Status:</strong> {selectedStatus || 'Not selected'}
          </p>
          <p>
            <strong>Priority:</strong> {selectedPriority || 'Not selected'}
          </p>
          <p>
            <strong>Language:</strong> {selectedLanguage || 'Not selected'}
          </p>
        </div>
      </div>
    </div>
  );
}
