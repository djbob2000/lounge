"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@lounge/types";
import { slugify } from "../../lib/utils";

interface CategoryFormProps {
  category?: Category;
  isEditing?: boolean;
}

export default function CategoryForm({
  category,
  isEditing = false,
}: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!category?.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      setError("Назва категорії обов'язкова");
      return;
    }

    if (!slug) {
      setError("Slug обов'язковий");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/categories${isEditing ? `/${category?.id}` : ""}`;

      const response = await fetch(apiUrl, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error?.message || "Помилка при збереженні категорії"
        );
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (err) {
      console.error("Помилка при збереженні категорії:", err);
      setError(
        err instanceof Error ? err.message : "Помилка при збереженні категорії"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? "Редагування категорії" : "Створення нової категорії"}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Назва
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введіть назву категорії"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Slug
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSlug"
                checked={autoSlug}
                onChange={() => setAutoSlug(!autoSlug)}
                className="mr-2"
                disabled={isSubmitting}
              />
              <label htmlFor="autoSlug" className="text-sm text-gray-600">
                Автоматично
              </label>
            </div>
          </div>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введіть slug категорії"
            disabled={autoSlug || isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">URL адреса буде: /{slug}</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Скасувати
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Оновлення..."
                : "Створення..."
              : isEditing
                ? "Оновити категорію"
                : "Створити категорію"}
          </button>
        </div>
      </form>
    </div>
  );
}
