import Link from "next/link";
import { Category } from "@lounge/types";
import DraggableList from "../../../components/admin/DraggableList";

// Функція для отримання категорій з API
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

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Категорії</h1>
        <Link
          href="/admin/categories/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Додати категорію
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 mb-4">Категорії відсутні</p>
          <Link
            href="/admin/categories/new"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Створити першу категорію
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DraggableList
            items={categories}
            itemType="category"
            renderItem={(item, index) => {
              const category = item as Category;
              return (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-gray-500">/{category.slug}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/admin/categories/${category.id}/edit`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Редагувати
                    </Link>
                    <button
                      className="text-red-500 hover:text-red-700"
                      data-id={category.id}
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
