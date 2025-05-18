import Link from "next/link";
import { Album } from "@lounge/types";
import DraggableList from "../../../components/admin/DraggableList";

// Функція для отримання альбомів з API
async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Помилка отримання альбомів");
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання альбомів:", error);
    return [];
  }
}

// Функція для отримання альбомів за категорією
async function getAlbumsByCategory(categoryId: string): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums?categoryId=${categoryId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Помилка отримання альбомів за категорією");
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання альбомів за категорією:", error);
    return [];
  }
}

export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: { categoryId?: string };
}) {
  const albums = searchParams.categoryId
    ? await getAlbumsByCategory(searchParams.categoryId)
    : await getAlbums();

  const title = searchParams.categoryId
    ? "Альбоми для категорії"
    : "Всі альбоми";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link
          href="/admin/albums/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Додати альбом
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">Альбоми відсутні</p>
          <Link
            href="/admin/albums/new"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Створити перший альбом
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DraggableList
            items={albums}
            itemType="album"
            renderItem={(item, index) => {
              const album = item as Album;
              return (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-center">
                    {album.coverImageUrl && (
                      <div className="w-16 h-16 mr-4 rounded overflow-hidden">
                        <img
                          src={album.coverImageUrl}
                          alt={`Обкладинка ${album.name}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{album.name}</h3>
                      <p className="text-sm text-gray-500">/{album.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/admin/photos?albumId=${album.id}`}
                      className="text-green-500 hover:text-green-700"
                    >
                      Фотографії
                    </Link>
                    <Link
                      href={`/admin/albums/${album.id}/edit`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Редагувати
                    </Link>
                    <button
                      className="text-red-500 hover:text-red-700"
                      data-id={album.id}
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
