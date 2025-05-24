/**
 * Data models for the photographer's website
 */

/**
 * Photo album category model
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
 * Photo album model
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
 * Photo model
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
