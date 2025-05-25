"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Album, Category } from "@lounge/types";
import { useAuth } from "@clerk/nextjs";

interface AlbumFormProps {
  album?: Album;
  categories: Category[];
  defaultCategoryId?: string;
}

export default function AlbumForm({
  album,
  categories,
  defaultCategoryId,
}: AlbumFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: album?.name || "",
    slug: album?.slug || "",
    description: album?.description || "",
    categoryId: album?.categoryId || defaultCategoryId || "",
    isHidden: album?.isHidden || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate required fields
    if (!formData.name.trim()) {
      setErrors({ name: "Назва альбому обов'язкова" });
      setIsLoading(false);
      return;
    }

    if (!formData.categoryId) {
      setErrors({ categoryId: "Категорія обов'язкова" });
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();

      const url = album
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums/${album.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/albums`;

      const method = album ? "PATCH" : "POST";

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
        if (errorData.message && Array.isArray(errorData.message)) {
          const fieldErrors: Record<string, string> = {};
          errorData.message.forEach((msg: string) => {
            if (msg.includes("назва") || msg.includes("name")) {
              fieldErrors.name = msg;
            } else if (msg.includes("slug")) {
              fieldErrors.slug = msg;
            } else if (msg.includes("categoryId")) {
              fieldErrors.categoryId = msg;
            } else if (msg.includes("description")) {
              fieldErrors.description = msg;
            }
          });
          setErrors(fieldErrors);
        } else {
          setErrors({
            general: errorData.message || "Помилка збереження альбому",
          });
        }
        return;
      }

      router.push("/admin/albums");
      router.refresh();
    } catch (error) {
      console.error("Error saving album:", error);
      setErrors({ general: "Помилка збереження альбому" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

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
          Назва альбому *
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
          placeholder="Введіть назву альбому"
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Категорія *
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.categoryId ? "border-red-300" : "border-gray-300"
          }`}
          required
        >
          <option value="">Оберіть категорію</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
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
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Опис
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Введіть опис альбому (необов'язково)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isHidden"
            name="isHidden"
            checked={formData.isHidden}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isHidden"
            className="ml-2 block text-sm text-gray-700"
          >
            Приховати альбом
          </label>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Якщо увімкнено, альбом не буде відображатися на сайті
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
          {isLoading ? "Збереження..." : album ? "Оновити" : "Створити"}
        </button>
      </div>
    </form>
  );
}
