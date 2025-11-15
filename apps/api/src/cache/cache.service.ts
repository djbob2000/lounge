import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string): Promise<void> {
    // For memory cache, we need to implement pattern matching
    const keys = await this.getCacheKeys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));

    for (const key of matchingKeys) {
      await this.cacheManager.del(key);
    }
  }

  /**
   * Get all cache keys (simplified implementation)
   */
  private async getCacheKeys(): Promise<string[]> {
    // For memory cache, we need to track keys manually or use store methods
    return [];
  }

  /**
   * Clear categories cache
   */
  async clearCategoriesCache(): Promise<void> {
    await this.cacheManager.del('categories');
    await this.cacheManager.del('category-slug');
  }

  /**
   * clear albums cache for a specific category
   */
  async clearAlbumsCache(_categoryId: string): Promise<void> {
    // Clear albums cache for this category
    // In production, you'd want more granular cache keys
  }

  /**
   * Clear photos cache for a specific album
   */
  async clearPhotosCache(_albumId: string): Promise<void> {
    await this.cacheManager.del('photos-all');
    await this.cacheManager.del('photos-slider');
    await this.cacheManager.del('photos-album');
  }

  /**
   * Clear all cache
   */
  async clearAllCache(): Promise<void> {
    // For memory cache, we need to manually clear specific keys
    const keys = [
      'categories',
      'category-slug',
      'albums-all',
      'albums-category',
      'photos-all',
      'photos-slider',
      'photos-album',
    ];
    for (const key of keys) {
      await this.cacheManager.del(key);
    }
  }
}
