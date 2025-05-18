import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS and clsx classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Переводить текст у формат slug
 * @param text - текст для конвертації в slug
 * @returns slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Видалення не букв, цифр, підкреслень, пробілів та дефісів
    .replace(/[\s_-]+/g, "-") // Заміна пробілів, підкреслень та дефісів на одиночний дефіс
    .replace(/^-+|-+$/g, ""); // Видалення дефісів з початку та кінця рядка
}

/**
 * Форматує дату у локалізований рядок
 * @param date - дата для форматування
 * @returns форматована дата
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Обрізає текст, якщо він перевищує максимальну довжину
 * @param text - текст для обрізання
 * @param maxLength - максимальна довжина тексту
 * @returns обрізаний текст з трьома крапками в кінці або оригінальний текст
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Генерує випадковий ID
 * @param length - довжина ID
 * @returns випадковий ID
 */
export function generateId(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
