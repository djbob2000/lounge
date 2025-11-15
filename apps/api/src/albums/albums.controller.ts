import { Album } from '@lounge/types';
import { CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthGuard, Public } from '../auth/auth.guard';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto, UpdateAlbumDto, UpdateAlbumsOrderDto } from './dto';

@Controller({ path: 'albums', version: '1' })
@UseGuards(AuthGuard)
export class AlbumsController {
  constructor(
    private readonly albumsService: AlbumsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Create new album
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAlbumDto: CreateAlbumDto): Promise<Album> {
    const result = await this.albumsService.create(createAlbumDto);
    // Clear albums cache after creation
    await this.cacheManager.del('albums-all');
    await this.cacheManager.del('albums-category');
    return result;
  }

  /**
   * Get all albums
   */
  @Get()
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('albums-all')
  @CacheTTL(1800) // 30 minutes
  @Header('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
  findAll(): Promise<Album[]> {
    return this.albumsService.findAll();
  }

  /**
   * Get albums by category
   */
  @Get('category/:categoryId')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('albums-category')
  @CacheTTL(1800) // 30 minutes
  @Header('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
  findByCategory(@Param('categoryId') categoryId: string): Promise<Album[]> {
    return this.albumsService.findByCategory(categoryId);
  }

  /**
   * Get album by ID
   */
  @Get(':id')
  @Public()
  @Header('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
  findOne(@Param('id') id: string): Promise<Album> {
    return this.albumsService.findOne(id);
  }

  /**
   * Get album by slug
   */
  @Get('slug/:slug')
  @Public()
  @Header('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
  findBySlug(@Param('slug') slug: string): Promise<Album> {
    return this.albumsService.findBySlug(slug);
  }

  /**
   * Update album
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const result = await this.albumsService.update(id, updateAlbumDto);
    // Clear albums cache after update
    await this.cacheManager.del('albums-all');
    await this.cacheManager.del('albums-category');
    return result;
  }

  /**
   * Set album cover image
   */
  @Patch(':id/cover')
  async setCoverImage(
    @Param('id') id: string,
    @Body('coverImageUrl') coverImageUrl: string,
  ): Promise<Album> {
    const result = await this.albumsService.setCoverImage(id, coverImageUrl);
    // Clear albums cache after cover image update
    await this.cacheManager.del('albums-all');
    await this.cacheManager.del('albums-category');
    return result;
  }

  /**
   * Delete album
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<Album> {
    const result = await this.albumsService.remove(id);
    // Clear albums cache after deletion
    await this.cacheManager.del('albums-all');
    await this.cacheManager.del('albums-category');
    return result;
  }

  /**
   * Update albums order
   */
  @Patch('order/update')
  async updateOrder(@Body() updateAlbumsOrderDto: UpdateAlbumsOrderDto): Promise<Album[]> {
    const result = await this.albumsService.updateOrder(updateAlbumsOrderDto);
    // Clear albums cache after order update
    await this.cacheManager.del('albums-all');
    await this.cacheManager.del('albums-category');
    return result;
  }
}
