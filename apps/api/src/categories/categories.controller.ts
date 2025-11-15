import { Category } from '@lounge/types';
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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoriesOrderDto, UpdateCategoryDto } from './dto';

@Controller({ path: 'categories', version: '1' })
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Create new category
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    const result = await this.categoriesService.create(createCategoryDto);
    // Clear categories cache after creation
    await this.cacheManager.del('categories');
    await this.cacheManager.del('category-slug');
    return result;
  }

  /**
   * Get all categories
   */
  @Get()
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('categories')
  @CacheTTL(3600) // 1 hour
  @Header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600')
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  /**
   * Get category by ID
   */
  @Get(':id')
  @Public()
  @Header('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  /**
   * Get category by slug
   */
  @Get('slug/:slug')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('category-slug')
  @CacheTTL(3600) // 1 hour
  @Header('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600')
  findBySlug(@Param('slug') slug: string): Promise<Category> {
    console.log('Controller received slug:', slug);
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Update categories display order
   */
  @Patch('order/update')
  async updateOrder(
    @Body() updateCategoriesOrderDto: UpdateCategoriesOrderDto,
  ): Promise<Category[]> {
    const result = await this.categoriesService.updateOrder(updateCategoriesOrderDto);
    // Clear categories cache after order update
    await this.cacheManager.del('categories');
    await this.cacheManager.del('category-slug');
    return result;
  }

  /**
   * Update category
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const result = await this.categoriesService.update(id, updateCategoryDto);
    // Clear categories cache after update
    await this.cacheManager.del('categories');
    await this.cacheManager.del('category-slug');
    return result;
  }

  /**
   * Delete category
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<Category> {
    const result = await this.categoriesService.remove(id);
    // Clear categories cache after deletion
    await this.cacheManager.del('categories');
    await this.cacheManager.del('category-slug');
    return result;
  }
}
