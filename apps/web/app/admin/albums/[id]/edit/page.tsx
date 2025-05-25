import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Album, Category } from "@lounge/types";
import AlbumForm from "../../../../../components/admin/AlbumForm";

// Function to fetch album by ID
async function getAlbum(id: string): Promise<Album | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання альбому:", error);
    return null;
  }
}

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
      throw new Error("Помилка отримання категорій");
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання категорій:", error);
    return [];
  }
}

export const metadata: Metadata = {
  title: "Редагувати альбом | Адмін панель",
  description: "Редагування альбому фотографій",
};

interface EditAlbumPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAlbumPage({ params }: EditAlbumPageProps) {
  const { id } = await params;
  const [album, categories] = await Promise.all([
    getAlbum(id),
    getCategories(),
  ]);

  if (!album) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Редагувати альбом</h1>
        <p className="text-gray-600 mt-2">Редагування альбому "{album.name}"</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AlbumForm album={album} categories={categories} />
      </div>
    </div>
  );
}
