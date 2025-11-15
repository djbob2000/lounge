import { Category } from '@lounge/types';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import slugify from 'slugify';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoriesOrderDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.log(`Creating category with name: ${createCategoryDto.name}`);

    // Generate slug from name if not provided
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);

    // Check slug uniqueness
    await this.checkSlugUniqueness(slug);

    // Find the maximum display order to add the new category at the end
    const displayOrder = createCategoryDto.displayOrder ?? (await this.getNextDisplayOrder());

    try {
      // Create the category
      const category = await this.prisma.category.create({
        data: {
          name: createCategoryDto.name,
          slug,
          displayOrder,
          showInMenu: createCategoryDto.showInMenu ?? false,
        },
      });

      this.logger.log(`Category created successfully with ID: ${category.id}`);
      return category;
    } catch (error) {
      this.logger.error(`Failed to create category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all categories, sorted by display order
   */
  async findAll(): Promise<Category[]> {
    this.logger.log('Fetching all categories');
    const categories = await this.prisma.category.findMany({
      orderBy: {
        displayOrder: 'asc',
      },
    });
    this.logger.log(`Found ${categories.length} categories`);
    return categories;
  }

  /**
   * Get category by ID
   */
  async findOne(id: string): Promise<Category> {
    this.logger.log(`Fetching category with ID: ${id}`);
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      this.logger.warn(`Category with ID ${id} not found`);
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    this.logger.log(`Found category: ${category.name}`);
    return category;
  }

  /**
   * Get category by slug
   */
  async findBySlug(slug: string): Promise<Category> {
    this.logger.log(`Fetching category with slug: ${slug}`);
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      this.logger.warn(`Category with slug ${slug} not found`);
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    this.logger.log(`Found category: ${category.name}`);
    return category;
  }

  /**
   * Update category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    this.logger.log(`Updating category ${id} with data:`, updateCategoryDto);

    // Check if category exists
    await this.findOne(id);

    // If slug is changed, check its uniqueness
    if (updateCategoryDto.slug) {
      await this.checkSlugUniqueness(updateCategoryDto.slug, id);
    } else if (updateCategoryDto.name) {
      // If only name is changed, do not automatically update slug
    }

    try {
      // Update the category
      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });

      this.logger.log(`Category ${id} updated successfully`);
      return updatedCategory;
    } catch (error) {
      this.logger.error(`Failed to update category ${id}: ${error.message}`, error.stack);
      throw error;
    }
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
