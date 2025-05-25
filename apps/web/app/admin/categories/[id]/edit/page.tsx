import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Category } from "@lounge/types";
import CategoryForm from "../../../../../components/admin/CategoryForm";

// Function to fetch category by ID
async function getCategory(id: string): Promise<Category | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/categories/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Помилка отримання категорії:", error);
    return null;
  }
}

export const metadata: Metadata = {
  title: "Редагувати категорію | Адмін панель",
  description: "Редагування категорії фотоальбомів",
};

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Редагувати категорію</h1>
        <p className="text-gray-600 mt-2">
          Редагування категорії "{category.name}"
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}
