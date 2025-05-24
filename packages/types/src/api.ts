/**
 * API request and response interfaces
 */

import { Album, Category, Photo } from "./models";

/**
 * Category requests
 */
export interface CreateCategoryRequest {
  name: string;
  slug?: string; // If not specified, generated on the server
  displayOrder?: number; // If not specified, set on the server
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
 * Album requests
 */
export interface CreateAlbumRequest {
  name: string;
  slug?: string; // If not specified, generated on the server
  description?: string;
  categoryId: string;
  displayOrder?: number; // If not specified, set on the server
  isHidden?: boolean; // Default is false
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
 * Photo requests
 */
export interface UploadPhotoRequest {
  albumId: string;
  displayOrder?: number; // If not specified, set on the server
  isSliderImage?: boolean; // Default is false
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
 * API responses
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
