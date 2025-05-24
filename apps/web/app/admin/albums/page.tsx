import Link from "next/link";
import { Album } from "@lounge/types";
import DraggableList from "../../../components/admin/DraggableList";

// Function to fetch albums from the API
async function getAlbums(): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching albums");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
}

// Function to fetch albums by category from the API
async function getAlbumsByCategory(categoryId: string): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums?categoryId=${categoryId}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching albums by category");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching albums by category:", error);
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

  const title = searchParams.categoryId ? "Albums for category" : "All albums";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link
          href="/admin/albums/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add album
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">Albums are absent</p>
          <Link
            href="/admin/albums/new"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Create the first album
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
                          alt={`Cover ${album.name}`}
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
                      Photos
                    </Link>
                    <Link
                      href={`/admin/albums/${album.id}/edit`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-red-500 hover:text-red-700"
                      data-id={album.id}
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
