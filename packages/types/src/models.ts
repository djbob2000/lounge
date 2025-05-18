/**
 * Моделі даних для вебсайту фотографа
 */

/**
 * Модель категорії фотоальбомів
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Модель фотоальбому
 */
export interface Album {
  id: string;
  name: string;
  slug: string;
  description?: string;
  categoryId: string;
  displayOrder: number;
  coverImageUrl?: string;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Модель фотографії
 */
export interface Photo {
  id: string;
  albumId: string;
  filename: string;
  originalUrl: string;
  thumbnailUrl: string;
  displayOrder: number;
  isSliderImage: boolean;
  width: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
}
