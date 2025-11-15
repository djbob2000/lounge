import type { Photo } from '@lounge/types';
import { Suspense } from 'react';
import HomeSlider from '../components/HomeSlider';

async function getSliderPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/photos/slider`,
      {
        // Cache slider photos for 15 minutes - they can change more frequently
        next: {
          revalidate: 900, // 15 minutes
          tags: ['slider-photos'],
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch slider photos');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching slider photos:', error);
    return [];
  }
}

export default async function Home() {
  // НЕ await! Просто створюємо Promise
  const photosPromise = getSliderPhotos();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Використовуємо Suspense для streaming */}
      <Suspense
        fallback={
          <div className="w-full h-[60vh] flex items-center justify-center bg-secondary/50">
            <p className="text-foreground/60">Завантаження слайдера...</p>
          </div>
        }
      >
        <HomeSlider photosPromise={photosPromise} />
      </Suspense>

      <div className="py-16 px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">Lounge Photo</h1>
        <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
          Вітаємо у світі професійної фотографії. Перегляньте наші альбоми та насолоджуйтесь
          якісними знімками.
        </p>
      </div>
    </div>
  );
}
