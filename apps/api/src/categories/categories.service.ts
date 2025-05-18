import { Category } from '@lounge/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import slugify from 'slugify';

import {
  CreateCategoryDto,
  UpdateCategoryDto,
  UpdateCategoriesOrderDto,
} from './dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Generate slug from name if not provided
    const slug =
      createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    // Check slug uniqueness
    await this.checkSlugUniqueness(slug);

    // Find the maximum display order to add the new category at the end
    const displayOrder =
      createCategoryDto.displayOrder ?? (await this.getNextDisplayOrder());

    // Create the category
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        displayOrder,
      },
    });
  }

  /**
   * Get all categories, sorted by display order
   */
  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  /**
   * Get category by ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Get category by slug
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  /**
   * Update category
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // Check if category exists
    await this.findOne(id);

    // If slug is changed, check its uniqueness
    if (updateCategoryDto.slug) {
      await this.checkSlugUniqueness(updateCategoryDto.slug, id);
    } else if (updateCategoryDto.name) {
      // If only name is changed, do not automatically update slug
    }

    // Update the category
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  /**
   * Delete the category
   */
  async remove(id: string): Promise<Category> {
    // Check if category exists
    await this.findOne(id);

    // Delete the category (note that albums will be deleted cascadingly via onDelete: Cascade relationship)
    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Update display order of categories
   */
  async updateOrder(
    updateCategoriesOrderDto: UpdateCategoriesOrderDto,
  ): Promise<Category[]> {
    // Array of update operations
    const updateOperations = updateCategoriesOrderDto.categories.map((item) => {
      return this.prisma.category.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      });
    });

    // Execute all update operations in a transaction
    await this.prisma.$transaction(updateOperations);

    // Return the updated list of categories
    return this.findAll();
  }

  // Helper methods

  /**
   * Check slug uniqueness
   */
  private async checkSlugUniqueness(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory && existingCategory.id !== excludeId) {
      throw new BadRequestException(
        `Category with slug "${slug}" already exists`,
      );
    }
  }

  /**
   * Generate slug from name
   */
  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
    });
  }

  /**
   * Get the next display order number
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
