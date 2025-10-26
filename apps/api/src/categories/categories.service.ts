import { Category } from '@lounge/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoriesOrderDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Generate slug from name if not provided
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    // Check slug uniqueness
    await this.checkSlugUniqueness(slug);

    // Find the maximum display order to add the new category at the end
    const displayOrder = createCategoryDto.displayOrder ?? (await this.getNextDisplayOrder());

    // Create the category
    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        slug,
        displayOrder,
        showInMenu: createCategoryDto.showInMenu ?? false,
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
    console.log('Service searching for slug:', slug);
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });
    console.log('Prisma findBySlug result:', category);

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  /**
   * Update category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    // Check if category exists
    await this.findOne(id);

    // If slug is changed, check its uniqueness
    if (updateCategoryDto.slug) {
      await this.checkSlugUniqueness(updateCategoryDto.slug, id);
    } else if (updateCategoryDto.name) {
      // If only name is changed, do not automatically update slug
    }

    // Update the category
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
    return updatedCategory;
  }

  /**
   * Delete the category
   */
  async remove(id: string): Promise<Category> {
    // Check if category exists
    await this.findOne(id);

    // Check if category has any albums
    const albumCount = await this.prisma.album.count({
      where: { categoryId: id },
    });

    if (albumCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. It contains ${albumCount} album(s). Please delete or move the albums first.`,
      );
    }

    // Delete the category
    const deletedCategory = await this.prisma.category.delete({
      where: { id },
    });
    return deletedCategory;
  }

  /**
   * Update display order of categories
   */
  async updateOrder(updateCategoriesOrderDto: UpdateCategoriesOrderDto): Promise<Category[]> {
    try {
      // Validate that all categories exist before attempting to update
      for (const item of updateCategoriesOrderDto.categories) {
        const exists = await this.prisma.category.findUnique({
          where: { id: item.id },
          select: { id: true },
        });

        if (!exists) {
          throw new NotFoundException(`Category with ID ${item.id} not found`);
        }
      }

      const updateOperations = updateCategoriesOrderDto.categories.map((item) =>
        this.prisma.category.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        }),
      );

      await this.prisma.$transaction(updateOperations);
      return this.findAll();
    } catch (error) {
      console.error('Error during category order update transaction:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025' // Record to update not found
      ) {
        throw new NotFoundException('One or more categories to update were not found.');
      }

      // Re-throw other errors with more context
      throw new Error(`Failed to update category order: ${error.message}`);
    }
  }

  // Helper methods

  /**
   * Check slug uniqueness
   */
  private async checkSlugUniqueness(slug: string, excludeId?: string): Promise<void> {
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory && existingCategory.id !== excludeId) {
      throw new BadRequestException(`Category with slug "${slug}" already exists`);
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
