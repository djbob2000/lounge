"use client";

import Link from "next/link";
import { Category } from "@lounge/types";
import CategoryDeleteButton from "./CategoryDeleteButton";

interface CategoryListItemProps {
  item: Category;
  index: number;
}

export default function CategoryListItem({
  item: category,
  index,
}: CategoryListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{category.name}</h3>
            <p className="text-sm text-gray-500">/{category.slug}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Показувати в меню:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  category.showInMenu
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {category.showInMenu ? "Так" : "Ні"}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="text-blue-500 hover:text-blue-700"
              >
                Редагувати
              </Link>
              <CategoryDeleteButton
                categoryId={category.id}
                categoryName={category.name}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
