import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoriesOrderDto,
} from './dto';
import { Category } from '@lounge/types';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Створення нової категорії
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Створення slug з назви, якщо не було надано
    const slug =
      createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    // Перевірка унікальності slug
    await this.checkSlugUniqueness(slug);

    // Знаходимо максимальний порядок відображення, щоб додати нову категорію в кінець
    const displayOrder =
      createCategoryDto.displayOrder ?? (await this.getNextDisplayOrder());

    // Створюємо категорію
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        displayOrder,
      },
    });
  }

  /**
   * Отримання всіх категорій, відсортованих за порядком відображення
   */
  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  /**
   * Отримання категорії за ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Категорію з ID ${id} не знайдено`);
    }

    return category;
  }

  /**
   * Отримання категорії за slug
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException(`Категорію зі slug ${slug} не знайдено`);
    }

    return category;
  }

  /**
   * Оновлення категорії
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Перевіряємо чи існує категорія
    await this.findOne(id);

    // Якщо змінюється slug, перевіряємо його унікальність
    if (updateCategoryDto.slug) {
      await this.checkSlugUniqueness(updateCategoryDto.slug, id);
    } else if (updateCategoryDto.name) {
      // Якщо змінюється тільки назва, не оновлюємо slug автоматично
    }

    // Оновлюємо категорію
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  /**
   * Видалення категорії
   */
  async remove(id: string): Promise<Category> {
    // Перевіряємо чи існує категорія
    await this.findOne(id);

    // Видаляємо категорію (зауважте, що альбоми будуть видалені каскадно через onDelete: Cascade у відношенні)
    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Оновлення порядку відображення категорій
   */
  async updateOrder(
    updateCategoriesOrderDto: UpdateCategoriesOrderDto,
  ): Promise<Category[]> {
    // Масив операцій оновлення
    const updateOperations = updateCategoriesOrderDto.categories.map((item) => {
      return this.prisma.category.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      });
    });

    // Виконуємо всі операції оновлення в транзакції
    await this.prisma.$transaction(updateOperations);

    // Повертаємо оновлений список категорій
    return this.findAll();
  }

  // Допоміжні методи

  /**
   * Перевірка унікальності slug
   */
  private async checkSlugUniqueness(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory && existingCategory.id !== excludeId) {
      throw new BadRequestException(`Категорія зі slug "${slug}" вже існує`);
    }
  }

  /**
   * Генерація slug з назви
   */
  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
    });
  }

  /**
   * Отримання наступного порядкового номера для відображення
   */
  private async getNextDisplayOrder(): Promise<number> {
    const maxOrderCategory = await this.prisma.category.findFirst({
      orderBy: {
        displayOrder: 'desc',
      },
    });

    return maxOrderCategory ? maxOrderCategory.displayOrder + 1 : 0;
  }
}
