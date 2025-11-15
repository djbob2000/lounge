import './globals.css';
import { ukUA } from '@clerk/localizations';
import { ClerkProvider } from '@clerk/nextjs';
import type { Category } from '@lounge/types';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '../components/layout/ThemeProvider';
import ClientLayout from '../components/layout/ClientLayout';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Lounge',
  description: 'Photo gallery application',
};

async function getCategories(): Promise<Category[]> {
  const apiUrl = `/api/v1/categories`;

  try {
    const response = await fetch(apiUrl, {
      // Cache categories for 1 hour since they rarely change
      next: {
        revalidate: 3600, // 1 hour in seconds
        tags: ['categories'],
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('Error fetching categories:', error);
    // Return empty array instead of throwing to prevent layout crash
    return [];
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <ClerkProvider localization={ukUA as typeof ukUA}>
      <html lang="uk" suppressHydrationWarning>
        <body suppressHydrationWarning={true}>
          <ThemeProvider>
            <ClientLayout className={`${inter.className} min-h-screen flex flex-col`}>
              <Header initialCategories={categories} />
              <main className="flex-1">{children}</main>
              <Footer />
            </ClientLayout>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
