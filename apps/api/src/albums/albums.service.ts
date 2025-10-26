import { Album } from '@lounge/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Album as PrismaAlbum } from '@prisma/client';
import slugify from 'slugify';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto, UpdateAlbumDto, UpdateAlbumsOrderDto } from './dto';

@Injectable()
export class AlbumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Create a new album
   */
  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const { categoryId, slug, displayOrder, ...rest } = createAlbumDto;

    // Check if category exists
    await this.categoriesService.findOne(categoryId);

    // Generate slug if not provided
    const albumSlug = slug || this.generateSlug(createAlbumDto.name);

    // Check slug uniqueness
    await this.validateSlugUniqueness(albumSlug, categoryId);

    // Determine display order if not provided
    const order =
      displayOrder !== undefined ? displayOrder : await this.getNextDisplayOrder(categoryId);

    // Create the album
    const album = await this.prisma.album.create({
      data: {
        ...rest,
        slug: albumSlug,
        categoryId,
        displayOrder: order,
      },
    });

    return this.mapPrismaAlbumToAlbum(album);
  }

  /**
   * Get all albums
   */
  async findAll(): Promise<Album[]> {
    const albums = await this.prisma.album.findMany({
      orderBy: [{ displayOrder: 'asc' }],
    });

    return albums.map(this.mapPrismaAlbumToAlbum);
  }

  /**
   * Get albums by category
   */
  async findByCategory(categoryId: string): Promise<Album[]> {
    // Check if category exists
    await this.categoriesService.findOne(categoryId);

    const albums = await this.prisma.album.findMany({
      where: { categoryId },
      orderBy: [{ displayOrder: 'asc' }],
    });

    return albums.map(this.mapPrismaAlbumToAlbum);
  }

  /**
   * Get album by ID
   */
  async findOne(id: string): Promise<Album> {
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`Album with ID ${id} not found`);
    }

    return this.mapPrismaAlbumToAlbum(album);
  }

  /**
   * Get album by slug
   */
  async findBySlug(slug: string): Promise<Album> {
    const album = await this.prisma.album.findUnique({
      where: { slug },
    });

    if (!album) {
      throw new NotFoundException(`Album with slug ${slug} not found`);
    }

    return this.mapPrismaAlbumToAlbum(album);
  }

  /**
   * Update album
   */
  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const { slug, categoryId, ...rest } = updateAlbumDto;

    // Get existing album
    const existingAlbum = await this.findOne(id);

    // Check if new category exists if it is being changed
    if (categoryId && categoryId !== existingAlbum.categoryId) {
      await this.categoriesService.findOne(categoryId);
    }

    // Check slug uniqueness if it is being changed
    if (slug && slug !== existingAlbum.slug) {
      await this.validateSlugUniqueness(slug, categoryId || existingAlbum.categoryId, id);
    }

    // Update the album
    const updatedAlbum = await this.prisma.album.update({
      where: { id },
      data: {
        ...rest,
        slug: slug || undefined,
        categoryId: categoryId || undefined,
      },
    });

    return this.mapPrismaAlbumToAlbum(updatedAlbum);
  }

  /**
   * Delete album
   */
  async remove(id: string): Promise<Album> {
    await this.findOne(id);

    const deletedAlbum = await this.prisma.album.delete({
      where: { id },
    });

    return this.mapPrismaAlbumToAlbum(deletedAlbum);
  }

  /**
   * Update display order of albums
   */
  async updateOrder(updateAlbumsOrderDto: UpdateAlbumsOrderDto): Promise<Album[]> {
    const { albums } = updateAlbumsOrderDto;

    // Check if all albums exist
    const existingAlbums = await this.prisma.album.findMany({
      where: {
        id: {
          in: albums.map((album) => album.id),
        },
      },
    });

    if (existingAlbums.length !== albums.length) {
      throw new BadRequestException('Some albums were not found');
    }

    // Update display order
    const updatePromises = albums.map((album) =>
      this.prisma.album.update({
        where: { id: album.id },
        data: { displayOrder: album.displayOrder },
      }),
    );

    const updatedAlbums = await Promise.all(updatePromises);
    return updatedAlbums.map(this.mapPrismaAlbumToAlbum);
  }

  /**
   * Set album cover image
   */
  async setCoverImage(id: string, coverImageUrl: string): Promise<Album> {
    await this.findOne(id);

    const updatedAlbum = await this.prisma.album.update({
      where: { id },
      data: { coverImageUrl },
    });

    return this.mapPrismaAlbumToAlbum(updatedAlbum);
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
   * Check slug uniqueness
   */
  private async validateSlugUniqueness(
    slug: string,
    _categoryId: string,
    excludeId?: string,
  ): Promise<void> {
    // Check slug uniqueness in the system
    const existingBySlug = await this.prisma.album.findUnique({
      where: { slug },
    });

    if (existingBySlug && (!excludeId || existingBySlug.id !== excludeId)) {
      throw new BadRequestException(`Album with slug "${slug}" already exists`);
    }
  }

  /**
   * Determine display order if not provided
   */
  private async getNextDisplayOrder(categoryId: string): Promise<number> {
    const lastAlbum = await this.prisma.album.findFirst({
      where: { categoryId },
      orderBy: { displayOrder: 'desc' },
    });

    return lastAlbum ? lastAlbum.displayOrder + 1 : 0;
  }

  /**
   * Convert Prisma album object to API album object
   */
  private mapPrismaAlbumToAlbum(prismaAlbum: PrismaAlbum): Album {
    return {
      id: prismaAlbum.id,
      name: prismaAlbum.name,
      slug: prismaAlbum.slug,
      description: prismaAlbum.description || undefined,
      categoryId: prismaAlbum.categoryId,
      displayOrder: prismaAlbum.displayOrder,
      coverImageUrl: prismaAlbum.coverImageUrl || undefined,
      isHidden: prismaAlbum.isHidden,
      createdAt: prismaAlbum.createdAt,
      updatedAt: prismaAlbum.updatedAt,
    };
  }
}
