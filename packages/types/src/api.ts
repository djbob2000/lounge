/**
 * Інтерфейси API запитів та відповідей
 */

import { Album, Category, Photo } from "./models";

/**
 * Запити для категорій
 */
export interface CreateCategoryRequest {
  name: string;
  slug?: string; // Якщо не вказано, генерується на сервері
  displayOrder?: number; // Якщо не вказано, встановлюється на сервері
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  displayOrder?: number;
}

export interface UpdateCategoriesOrderRequest {
  categories: Array<{
    id: string;
    displayOrder: number;
  }>;
}

/**
 * Запити для альбомів
 */
export interface CreateAlbumRequest {
  name: string;
  slug?: string; // Якщо не вказано, генерується на сервері
  description?: string;
  categoryId: string;
  displayOrder?: number; // Якщо не вказано, встановлюється на сервері
  isHidden?: boolean; // За замовчуванням false
}

export interface UpdateAlbumRequest {
  name?: string;
  slug?: string;
  description?: string;
  categoryId?: string;
  displayOrder?: number;
  coverImageUrl?: string;
  isHidden?: boolean;
}

export interface UpdateAlbumsOrderRequest {
  albums: Array<{
    id: string;
    displayOrder: number;
  }>;
}

/**
 * Запити для фотографій
 */
export interface UploadPhotoRequest {
  albumId: string;
  displayOrder?: number; // Якщо не вказано, встановлюється на сервері
  isSliderImage?: boolean; // За замовчуванням false
}

export interface UpdatePhotoRequest {
  displayOrder?: number;
  isSliderImage?: boolean;
}

export interface UpdatePhotosOrderRequest {
  photos: Array<{
    id: string;
    displayOrder: number;
  }>;
}

/**
 * Відповіді API
 */
export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type CategoriesResponse = ApiResponse<Category[]>;
export type CategoryResponse = ApiResponse<Category>;
export type PaginatedCategoriesResponse = ApiResponse<
  PaginatedResponse<Category>
>;

export type AlbumsResponse = ApiResponse<Album[]>;
export type AlbumResponse = ApiResponse<Album>;
export type PaginatedAlbumsResponse = ApiResponse<PaginatedResponse<Album>>;

export type PhotosResponse = ApiResponse<Photo[]>;
export type PhotoResponse = ApiResponse<Photo>;
export type PaginatedPhotosResponse = ApiResponse<PaginatedResponse<Photo>>;
