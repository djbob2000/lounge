"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@lounge/types";
import { useAuth } from "@clerk/nextjs";

interface CategoryFormProps {
  category?: Category;
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    showInMenu: category?.showInMenu || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const token = await getToken();
      console.log("Получен токен:", token);
      console.log("Длина токена:", token?.length);

      const url = category
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/categories/${category.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/categories`;

      console.log("URL запроса:", url);
      console.log("Authorization header:", `Bearer ${token}`);

      const method = category ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        if (errorData.message && Array.isArray(errorData.message)) {
          const fieldErrors: Record<string, string> = {};
          errorData.message.forEach((msg: string) => {
            if (msg.includes("назва") || msg.includes("name")) {
              fieldErrors.name = msg;
            } else if (msg.includes("slug")) {
              fieldErrors.slug = msg;
            } else if (msg.includes("showInMenu")) {
              fieldErrors.showInMenu = msg;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({
            general: errorData.message || "Помилка збереження категорії",
          });
        }
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Error saving category:", error);
      setErrors({ general: "Помилка збереження категорії" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Назва категорії *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Введіть назву категорії"
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Slug (URL)
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.slug ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Залиште порожнім для автоматичної генерації"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Якщо залишити порожнім, буде згенеровано автоматично з назви
        </p>
      </div>

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showInMenu"
            name="showInMenu"
            checked={formData.showInMenu}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="showInMenu"
            className="ml-2 block text-sm text-gray-700"
          >
            Показувати в меню
          </label>
        </div>
        {errors.showInMenu && (
          <p className="mt-1 text-sm text-red-600">{errors.showInMenu}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Якщо увімкнено, категорія буде відображатися в навігаційному меню
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Скасувати
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Збереження..." : category ? "Оновити" : "Створити"}
        </button>
      </div>
    </form>
  );
}
