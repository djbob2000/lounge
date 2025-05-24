import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Category, Album } from "@lounge/types";

interface CategoryPageParams {
  params: {
    categorySlug: string;
  };
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/categories/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
}

async function getCategoryAlbums(categoryId: string): Promise<Album[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums?categoryId=${categoryId}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageParams) {
  const category = await getCategory(params.categorySlug);

  if (!category) {
    notFound();
  }

  const albums = await getCategoryAlbums(category.id);

  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6">
          {category.name}
        </h1>

        {albums.length === 0 ? (
          <p className="text-muted-foreground">
            There are no albums in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {albums
              .filter((album) => !album.isHidden)
              .map((album) => (
                <Link
                  key={album.id}
                  href={`/${category.slug}/${album.slug}`}
                  className="group"
                >
                  <div className="aspect-square relative overflow-hidden rounded-md border bg-muted transition-all hover:shadow-md">
                    {album.coverImageUrl ? (
                      <Image
                        src={album.coverImageUrl}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No cover
                      </div>
                    )}
                  </div>
                  <h2 className="mt-2 text-lg font-medium group-hover:text-primary transition-colors">
                    {album.name}
                  </h2>
                  {album.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {album.description}
                    </p>
                  )}
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
