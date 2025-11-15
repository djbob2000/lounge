import type { Category } from '@lounge/types';
import ClientHeader from './client-header';

function HeaderServer({ initialCategories = [] }: { initialCategories?: Category[] }) {
  const categories = initialCategories;

  return (
    <header className="py-4 px-6 bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
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
