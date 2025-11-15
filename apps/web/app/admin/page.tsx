import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Function to fetch stats from the API
async function getStats() {
  try {
    const response = await fetch(`/api/v1/stats`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        totalCategories: 0,
        totalAlbums: 0,
        totalPhotos: 0,
        sliderPhotos: 0,
      };
    }

    return response.json();
  } catch (error) {
    console.warn('Помилка отримання статистики:', error);
    return {
      totalCategories: 0,
      totalAlbums: 0,
      totalPhotos: 0,
      sliderPhotos: 0,
    };
  }
}

export default async function AdminPage() {
  const user = await currentUser().catch(() => null);
  let stats = {
    totalCategories: 0,
    totalAlbums: 0,
    totalPhotos: 0,
    sliderPhotos: 0,
  };
  try {
    stats = await getStats();
  } catch {}

  const statCards = [
    {
      title: 'Категорії',
      value: stats.totalCategories,
      link: '/admin/categories',
      color: 'bg-blue-500',
    },
    {
      title: 'Альбоми',
      value: stats.totalAlbums,
      link: '/admin/albums',
      color: 'bg-green-500',
    },
    {
      title: 'Фотографії',
      value: stats.totalPhotos,
      link: '/admin/photos',
      color: 'bg-purple-500',
    },
    {
      title: 'Слайдер',
      value: stats.sliderPhotos,
      link: '/admin/photos?slider=true',
      color: 'bg-pink-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Адміністративна панель</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
        Ласкаво просимо, {user?.firstName}!
        </h2>
        <p className="text-gray-600">
          Керуйте контентом вашого фотосайту через зручну адміністративну панель.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link href={card.link} key={card.title} className="block">
            <div
              className={`${card.color} text-white rounded-lg shadow-md p-6 transition-transform hover:scale-105`}
            >
              <div className="font-bold text-xl mb-2">{card.title}</div>
              <div className="text-4xl font-bold">{card.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Швидкі дії</h3>
          <div className="flex flex-col space-y-3">
            <Link href="/admin/categories/new" className="text-blue-600 hover:text-blue-800">
              Створити нову категорію
            </Link>
            <Link href="/admin/albums/new" className="text-blue-600 hover:text-blue-800">
              Створити новий альбом
            </Link>
            <Link href="/admin/photos/upload" className="text-blue-600 hover:text-blue-800">
              Завантажити фотографії
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Підказки</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Використовуйте drag-n-drop для зміни порядку елементів</li>
            <li>Створіть категорії перед додаванням альбомів</li>
            <li>Оберіть обкладинку для кожного альбому</li>
            <li>Позначте фотографії для слайдера на головній сторінці</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
