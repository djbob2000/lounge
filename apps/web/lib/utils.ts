import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS and clsx classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts text to slug format
 * @param text - text to convert to slug
 * @returns slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-letters, digits, underscores, spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove hyphens from beginning and end of string
}

/**
 * Formats date to localized string
 * @param date - date to format
 * @returns formatted date
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Truncates text if it exceeds maximum length
 * @param text - text to truncate
 * @param maxLength - maximum text length
 * @returns truncated text with three dots at the end or original text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generates random ID
 * @param length - ID length
 * @returns random ID
 */
export function generateId(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}
