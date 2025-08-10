import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ClientLayout from '../components/layout/ClientLayout';
import { Category } from '@lounge/types';
import { ClerkProvider } from '@clerk/nextjs';
import { ukUA } from '@clerk/localizations';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Lounge',
  description: 'Photo gallery application',
};

async function getCategories(): Promise<Category[]> {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/categories`;

  try {
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch categories: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array instead of throwing to prevent layout crash
    return [];
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <ClerkProvider localization={ukUA as any}>
      <html lang="uk">
        <body suppressHydrationWarning={true}>
          <ClientLayout
            className={`${inter.className} min-h-screen flex flex-col`}
          >
            <Header initialCategories={categories} />
            <main className="flex-1">{children}</main>
            <Footer />
          </ClientLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
