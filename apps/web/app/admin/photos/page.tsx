import Link from "next/link";
import { Photo } from "@lounge/types";
import DraggableList from "../../../components/admin/DraggableList";

// Function to fetch photos from the API
async function getPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/photos`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Помилка отримання фотографій");
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання фотографій:", error);
    return [];
  }
}

// Function to fetch photos by album from the API
async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/photos?albumId=${albumId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Помилка отримання фотографій за альбомом");
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання фотографій за альбомом:", error);
    return [];
  }
}

// Function to fetch slider photos from the API
async function getSliderPhotos(): Promise<Photo[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/photos?isSliderImage=true`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Помилка отримання слайдерних фотографій");
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання слайдерних фотографій:", error);
    return [];
  }
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: { albumId?: string; slider?: string };
}) {
  let photos: Photo[] = [];
  let title = "All photos";

  if (searchParams.slider === "true") {
    photos = await getSliderPhotos();
    title = "Slider photos";
  } else if (searchParams.albumId) {
    photos = await getPhotosByAlbum(searchParams.albumId);
    title = "Album photos";
  } else {
    photos = await getPhotos();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link
          href="/admin/photos/upload"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Upload photos
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">Фотографії відсутні</p>
          <Link
            href="/admin/photos/upload"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Завантажити першу фотографію
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DraggableList
            items={photos}
            itemType="photo"
            renderItem={(item, index) => {
              const photo = item as Photo;
              return (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-center">
                    <div className="w-20 h-20 mr-4 overflow-hidden rounded">
                      <img
                        src={photo.thumbnailUrl}
                        alt={`Фото ${photo.filename}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{photo.filename}</h3>
                      <p className="text-sm text-gray-500">
                        {photo.width}x{photo.height}
                      </p>
                      {photo.isSliderImage && (
                        <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full mt-1">
                          Слайдер
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/admin/photos/${photo.id}/edit`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-500 hover:text-red-700"
                      data-id={photo.id}
                    >
                      Delete
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
