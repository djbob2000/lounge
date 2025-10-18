'use client';

import { useState } from 'react';
import CategorySelect from '../../components/admin/category-select';

// Mock data for demonstration
const mockCategories = [
  {
    id: '1',
    name: 'Portraits',
    slug: 'portraits',
    displayOrder: 1,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Weddings',
    slug: 'weddings',
    displayOrder: 2,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Nature',
    slug: 'nature',
    displayOrder: 3,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Architecture',
    slug: 'architecture',
    displayOrder: 4,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Travel',
    slug: 'travel',
    displayOrder: 5,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Family',
    slug: 'family',
    displayOrder: 6,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    name: 'Fashion',
    slug: 'fashion',
    displayOrder: 7,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    name: 'Sport',
    slug: 'sport',
    displayOrder: 8,
    showInMenu: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function DemoPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategoryWithError, setSelectedCategoryWithError] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CategorySelect Component Demo</h1>

        <div className="space-y-8">
          {/* Regular select */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Regular CategorySelect</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select category
              </label>
              <CategorySelect
                categories={mockCategories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Select category"
              />
              {selectedCategory && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {mockCategories.find((c) => c.id === selectedCategory)?.name}
                </p>
              )}
            </div>
          </div>

          {/* Select with error */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">CategorySelect with error</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category with error *
              </label>
              <CategorySelect
                categories={mockCategories}
                value={selectedCategoryWithError}
                onChange={setSelectedCategoryWithError}
                error="Category is required"
                placeholder="Select category"
              />
            </div>
          </div>

          {/* Comparison with standard select */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Comparison with standard select</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Standard HTML select (old)
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select category</option>
                  {mockCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New CategorySelect (Shadcn)
                </label>
                <CategorySelect
                  categories={mockCategories}
                  value=""
                  onChange={() => {}}
                  placeholder="Select category"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
