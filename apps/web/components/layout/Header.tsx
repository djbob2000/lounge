import type { Category } from '@lounge/types';
import { use } from 'react';
import ClientHeader from './client-header';

// Server Component - fetch categories with React 19 use() hook
async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

// Server Component that fetches data using React 19 use() hook
function HeaderServer({ initialCategories = [] }: { initialCategories?: Category[] }) {
  const categories =
    initialCategories && initialCategories.length > 0 ? initialCategories : use(fetchCategories());

  return (
    <header className="py-4 px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="text-2xl font-semibold">
          Lounge
        </a>

        <ClientHeader categories={categories} />
      </div>
    </header>
  );
}

export const Header = ({ initialCategories = [] }: { initialCategories?: Category[] }) => {
  return <HeaderServer initialCategories={initialCategories} />;
};

export default Header;
