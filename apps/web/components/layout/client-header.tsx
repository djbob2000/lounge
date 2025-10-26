'use client';

import type { Category } from '@lounge/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface ClientHeaderProps {
  categories: Category[];
}

export default function ClientHeader({ categories }: ClientHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden p-2"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex space-x-6">
        {categories
          .filter((category) => category.showInMenu)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className={`text-base ${pathname === `/${category.slug}` ? 'font-semibold' : 'font-normal'} hover:text-primary transition-colors`}
            >
              {category.name}
            </Link>
          ))}
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b py-4 px-6">
          <nav className="flex flex-col space-y-4">
            {categories
              .filter((category) => category.showInMenu)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className={`text-base ${pathname === `/${category.slug}` ? 'font-semibold' : 'font-normal'} hover:text-primary transition-colors`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
          </nav>
        </div>
      )}
    </>
  );
}
