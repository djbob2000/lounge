import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlbumDto, UpdateAlbumDto, UpdateAlbumsOrderDto } from './dto';
import { Album } from '@lounge/types';
import { CategoriesService } from '../categories/categories.service';
import slugify from 'slugify';

@Injectable()
export class AlbumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  /**
   * Створення нового альбому
   */
  async create(createAlbumDto: CreateAlbumDto): Promise<Album> {
    const { categoryId, slug, displayOrder, ...rest } = createAlbumDto;

    // Перевірка існування категорії
    await this.categoriesService.findOne(categoryId);

    // Генерація slug, якщо не передано
    const albumSlug = slug || this.generateSlug(createAlbumDto.name);

    // Перевірка унікальності slug
    await this.validateSlugUniqueness(albumSlug, categoryId);

    // Визначення порядку відображення, якщо не передано
    const order =
      displayOrder !== undefined
        ? displayOrder
        : await this.getNextDisplayOrder(categoryId);

    // Створення альбому
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
   * Отримання всіх альбомів
   */
  async findAll(): Promise<Album[]> {
    const albums = await this.prisma.album.findMany({
      orderBy: [{ displayOrder: 'asc' }],
    });

    return albums.map(this.mapPrismaAlbumToAlbum);
  }

  /**
   * Отримання альбомів за категорією
   */
  async findByCategory(categoryId: string): Promise<Album[]> {
    // Перевірка існування категорії
    await this.categoriesService.findOne(categoryId);

    const albums = await this.prisma.album.findMany({
      where: { categoryId },
      orderBy: [{ displayOrder: 'asc' }],
    });

    return albums.map(this.mapPrismaAlbumToAlbum);
  }

  /**
   * Отримання альбому за ID
   */
  async findOne(id: string): Promise<Album> {
    const album = await this.prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      throw new NotFoundException(`Альбом з ID ${id} не знайдено`);
    }

    return this.mapPrismaAlbumToAlbum(album);
  }

  /**
   * Отримання альбому за slug
   */
  async findBySlug(slug: string): Promise<Album> {
    const album = await this.prisma.album.findUnique({
      where: { slug },
    });

    if (!album) {
      throw new NotFoundException(`Альбом зі slug ${slug} не знайдено`);
    }

    return this.mapPrismaAlbumToAlbum(album);
  }

  /**
   * Оновлення альбому
   */
  async update(id: string, updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    const { slug, categoryId, ...rest } = updateAlbumDto;

    // Отримання існуючого альбому
    const existingAlbum = await this.findOne(id);

    // Перевірка існування нової категорії, якщо вона змінюється
    if (categoryId && categoryId !== existingAlbum.categoryId) {
      await this.categoriesService.findOne(categoryId);
    }

    // Перевірка унікальності slug, якщо він змінюється
    if (slug && slug !== existingAlbum.slug) {
      await this.validateSlugUniqueness(
        slug,
        categoryId || existingAlbum.categoryId,
        id,
      );
    }

    // Оновлення альбому
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
   * Видалення альбому
   */
  async remove(id: string): Promise<Album> {
    await this.findOne(id);

    const deletedAlbum = await this.prisma.album.delete({
      where: { id },
    });

    return this.mapPrismaAlbumToAlbum(deletedAlbum);
  }

  /**
   * Оновлення порядку відображення альбомів
   */
  async updateOrder(
    updateAlbumsOrderDto: UpdateAlbumsOrderDto,
  ): Promise<Album[]> {
    const { albums } = updateAlbumsOrderDto;

    // Перевірка існування всіх альбомів
    const existingAlbums = await this.prisma.album.findMany({
      where: {
        id: {
          in: albums.map((album) => album.id),
        },
      },
    });

    if (existingAlbums.length !== albums.length) {
      throw new BadRequestException('Деякі альбоми не знайдено');
    }

    // Оновлення порядку відображення
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
   * Налаштування обкладинки альбому
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
   * Генерація slug з назви
   */
  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
    });
  }

  /**
   * Перевірка унікальності slug
   */
  private async validateSlugUniqueness(
    slug: string,
    categoryId: string,
    excludeId?: string,
  ): Promise<void> {
    // Перевірка унікальності slug в системі
    const existingBySlug = await this.prisma.album.findUnique({
      where: { slug },
    });

    if (existingBySlug && (!excludeId || existingBySlug.id !== excludeId)) {
      throw new BadRequestException(`Альбом зі slug "${slug}" вже існує`);
    }
  }

  /**
   * Визначення наступного порядку відображення для альбому в категорії
   */
  private async getNextDisplayOrder(categoryId: string): Promise<number> {
    const lastAlbum = await this.prisma.album.findFirst({
      where: { categoryId },
      orderBy: { displayOrder: 'desc' },
    });

    return lastAlbum ? lastAlbum.displayOrder + 1 : 0;
  }

  /**
   * Перетворення об'єкта альбому з Prisma на об'єкт альбому для API
   */
  private mapPrismaAlbumToAlbum(prismaAlbum: any): Album {
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
