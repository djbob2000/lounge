import Link from "next/link";
import { Album, Category } from "@lounge/types";
import AlbumClientPage from "./AlbumClientPage";

// Function to fetch categories from the API
async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/categories`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Error fetching categories");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Function to fetch albums by category from the API
async function getAlbumsByCategory(categoryId: string): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums/category/${categoryId}`,
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

export default async function AlbumsPage() {
  const categories = await getCategories();

  // Fetch albums for all categories
  const categoriesWithAlbums = await Promise.all(
    categories.map(async (category) => ({
      ...category,
      albums: await getAlbumsByCategory(category.id),
    }))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Albums</h1>
        <Link
          href="/admin/albums/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Album
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">Create categories first</p>
          <Link
            href="/admin/categories/new"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Create Category
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {categoriesWithAlbums.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {category.name}
                  </h2>
                  <Link
                    href={`/admin/albums/new?categoryId=${category.id}`}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                  >
                    Add Album
                  </Link>
                </div>
              </div>
              <AlbumClientPage
                initialAlbums={category.albums}
                categorySlug={category.slug}
                categoryId={category.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
