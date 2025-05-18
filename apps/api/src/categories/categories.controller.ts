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
import { Category } from '@lounge/types';
import { AuthGuard, Public } from '../auth/auth.guard';

@Controller('categories')
@UseGuards(AuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Створення нової категорії
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Отримання всіх категорій
   */
  @Get()
  @Public()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  /**
   * Отримання категорії за ID
   */
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  /**
   * Отримання категорії за slug
   */
  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoriesService.findBySlug(slug);
  }

  /**
   * Оновлення категорії
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Видалення категорії
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.remove(id);
  }

  /**
   * Оновлення порядку відображення категорій
   */
  @Patch('order/update')
  updateOrder(
    @Body() updateCategoriesOrderDto: UpdateCategoriesOrderDto,
  ): Promise<Category[]> {
    return this.categoriesService.updateOrder(updateCategoriesOrderDto);
  }
}
