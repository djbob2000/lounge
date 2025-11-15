'use client';

import type { Category } from '@lounge/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface ClientHeaderProps {
  categories: Category[];
}

export default function ClientHeader({ categories }: ClientHeaderProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mobileMenuId = useId();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="md:hidden p-2 rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={toggleMenu}
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
        aria-controls={mobileMenuId}
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
      <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
        {categories
          .filter((category) => category.showInMenu)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((category) => {
            const isActive = pathname === `/${category.slug}`;
            return (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className={`text-base hover:text-primary transition-colors ${
                  isActive ? 'font-semibold text-primary' : 'font-normal text-foreground/90 hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {category.name}
              </Link>
            );
          })}
        <ThemeSwitcher />
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav
          id={mobileMenuId}
          className="md:hidden absolute top-16 left-0 right-0 bg-background border-b py-4 px-6 z-50"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col space-y-4">
            {categories
              .filter((category) => category.showInMenu)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((category) => {
                const isActive = pathname === `/${category.slug}`;
                return (
                  <Link
                    key={category.id}
                    href={`/${category.slug}`}
                    className={`text-base hover:text-primary transition-colors ${
                      isActive ? 'font-semibold text-primary' : 'font-normal text-foreground/90 hover:text-foreground'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {category.name}
                  </Link>
                );
              })}
            <div className="pt-2 border-t">
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
