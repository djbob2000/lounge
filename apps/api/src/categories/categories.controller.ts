import { Category } from '@lounge/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoriesOrderDto,
} from './dto';
import { AuthGuard, Public } from '../auth/auth.guard';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Create new category
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Get all categories
   */
  @Get()
  @Public()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  /**
   * Get category by ID
   */
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  /**
   * Get category by slug
   */
  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Update categories display order
   */
  @Patch('order/update')
  updateOrder(
    @Body() updateCategoriesOrderDto: UpdateCategoriesOrderDto,
  ): Promise<Category[]> {
    return this.categoriesService.updateOrder(updateCategoriesOrderDto);
  }

  /**
   * Update category
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Delete category
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.remove(id);
  }
}
