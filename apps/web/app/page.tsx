import type { Photo } from '@lounge/types';
import HomeSlider from '../components/HomeSlider';

async function getSliderPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/photos/slider`,
      {
        cache: 'no-store',
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
  const sliderPhotos = await getSliderPhotos();

  return (
    <div className="min-h-screen flex flex-col">
      <HomeSlider photos={sliderPhotos} />

      <div className="py-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">Squares</h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Вітаємо у світі професійної фотографії. Перегляньте наші альбоми та насолоджуйтесь
          якісними знімками.
        </p>
      </div>
    </div>
  );
}
