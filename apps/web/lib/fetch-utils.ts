import type { Album, Category, Photo } from '@lounge/types';

// API configuration
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/v1`;

// Generic fetch wrapper with error handling
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: 'no-store',
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/categories');
}

export async function fetchCategoryBySlug(slug: string): Promise<Category> {
  return apiFetch<Category>(`/categories/slug/${slug}`);
}

// Albums
export async function fetchAlbums(): Promise<Album[]> {
  return apiFetch<Album[]>('/albums');
}

export async function fetchAlbumBySlug(slug: string): Promise<Album> {
  return apiFetch<Album>(`/albums/slug/${slug}`);
}

// Photos
export async function fetchPhotos(): Promise<Photo[]> {
  return apiFetch<Photo[]>('/photos');
}

export async function fetchPhotosByAlbum(albumId: string): Promise<Photo[]> {
  return apiFetch<Photo[]>(`/photos/album/${albumId}`);
}

export async function fetchSliderPhotos(): Promise<Photo[]> {
  return apiFetch<Photo[]>('/photos/slider');
}

// Combined data fetching functions
export async function fetchAlbumData(resolvedParams: { categorySlug: string; albumSlug: string }) {
  // Fetch all data in parallel
  const [category, album] = await Promise.all([
    fetchCategoryBySlug(resolvedParams.categorySlug),
    fetchAlbumBySlug(resolvedParams.albumSlug),
  ]);

  // Fetch photos using album ID, not slug
  const photos = await fetchPhotosByAlbum(album.id);

  return {
    category,
    album,
    photos,
  };
}

// Types for enhanced error handling
export interface ApiError extends Error {
  status?: number;
  endpoint?: string;
}

export function createApiError(message: string, status?: number, endpoint?: string): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.endpoint = endpoint;
  return error;
}
