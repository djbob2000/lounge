import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AlbumsService } from '../albums/albums.service';
import { Photo } from '@lounge/types';
import { UpdatePhotoDto, UpdatePhotosOrderDto } from './dto';
import { Photo as PrismaPhoto } from '@prisma/client';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly albumsService: AlbumsService,
  ) {}

  /**
   * Завантаження фотографії
   */
  async upload(
    file: Express.Multer.File,
    albumId: string,
    displayOrder?: number,
    isSliderImage = false,
  ): Promise<Photo> {
    // Перевірка існування альбому
    await this.albumsService.findOne(albumId);

    // Завантаження файлу в сховище
    const uploadResult = await this.storageService.uploadFile(file);

    // Визначення порядку відображення, якщо не передано
    const order =
      displayOrder !== undefined
        ? displayOrder
        : await this.getNextDisplayOrder(albumId);

    // Створення запису про фотографію в базі даних
    const photo = await this.prisma.photo.create({
      data: {
        albumId,
        filename: uploadResult.filename,
        originalUrl: uploadResult.originalUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        displayOrder: order,
        isSliderImage,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });

    return this.mapPrismaPhotoToPhoto(photo);
  }

  /**
   * Отримання всіх фотографій
   */
  async findAll(): Promise<Photo[]> {
    const photos = await this.prisma.photo.findMany({
      orderBy: [{ displayOrder: 'asc' }],
    });

    return photos.map((photo) => this.mapPrismaPhotoToPhoto(photo));
  }

  /**
   * Отримання фотографій альбому
   */
  async findByAlbum(albumId: string): Promise<Photo[]> {
    // Перевірка існування альбому
    await this.albumsService.findOne(albumId);

    const photos = await this.prisma.photo.findMany({
      where: { albumId },
      orderBy: [{ displayOrder: 'asc' }],
    });

    return photos.map((photo) => this.mapPrismaPhotoToPhoto(photo));
  }

  /**
   * Отримання фотографій для слайдера
   */
  async findSliderPhotos(): Promise<Photo[]> {
    const photos = await this.prisma.photo.findMany({
      where: { isSliderImage: true },
      orderBy: [{ displayOrder: 'asc' }],
    });

    return photos.map((photo) => this.mapPrismaPhotoToPhoto(photo));
  }

  /**
   * Отримання фотографії за ID
   */
  async findOne(id: string): Promise<Photo> {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException(`Фотографію з ID ${id} не знайдено`);
    }

    return this.mapPrismaPhotoToPhoto(photo);
  }

  /**
   * Оновлення фотографії
   */
  async update(id: string, updatePhotoDto: UpdatePhotoDto): Promise<Photo> {
    // Перевірка існування фотографії
    await this.findOne(id);

    // Оновлення фотографії
    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: {
        displayOrder: updatePhotoDto.displayOrder,
        isSliderImage: updatePhotoDto.isSliderImage,
      },
    });

    return this.mapPrismaPhotoToPhoto(updatedPhoto);
  }

  /**
   * Видалення фотографії
   */
  async remove(id: string): Promise<Photo> {
    // Отримання фотографії для подальшого видалення файлів
    const photo = await this.findOne(id);

    // Видалення запису з бази даних
    const deletedPhoto = await this.prisma.photo.delete({
      where: { id },
    });

    // Отримання ідентифікатора файлу з URL
    const fileId = this.extractFileIdFromUrl(
      photo.originalUrl || photo.thumbnailUrl,
    );

    // Видалення файлів з хмарного сховища
    await this.storageService.deleteFile(fileId);

    return this.mapPrismaPhotoToPhoto(deletedPhoto);
  }

  /**
   * Оновлення порядку фотографій
   */
  async updateOrder(
    updatePhotosOrderDto: UpdatePhotosOrderDto,
  ): Promise<Photo[]> {
    const { photos } = updatePhotosOrderDto;

    // Перевірка існування всіх фотографій
    const existingPhotos = await this.prisma.photo.findMany({
      where: {
        id: {
          in: photos.map((photo) => photo.id),
        },
      },
    });

    if (existingPhotos.length !== photos.length) {
      throw new BadRequestException('Деякі фотографії не знайдено');
    }

    // Оновлення порядку відображення
    const updatePromises = photos.map((photo) =>
      this.prisma.photo.update({
        where: { id: photo.id },
        data: { displayOrder: photo.displayOrder },
      }),
    );

    const updatedPhotos = await Promise.all(updatePromises);
    return updatedPhotos.map((photo) => this.mapPrismaPhotoToPhoto(photo));
  }

  /**
   * Додавання/видалення фотографії до/з слайдера
   */
  async toggleSliderStatus(id: string, isSliderImage: boolean): Promise<Photo> {
    // Перевірка існування фотографії
    await this.findOne(id);

    // Оновлення статусу слайдера
    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: { isSliderImage },
    });

    return this.mapPrismaPhotoToPhoto(updatedPhoto);
  }

  /**
   * Отримання наступного порядкового номера для фотографії в альбомі
   */
  private async getNextDisplayOrder(albumId: string): Promise<number> {
    const maxOrderPhoto = await this.prisma.photo.findFirst({
      where: { albumId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    return maxOrderPhoto ? maxOrderPhoto.displayOrder + 1 : 0;
  }

  /**
   * Конвертація Prisma моделі в доменну модель
   */
  private mapPrismaPhotoToPhoto(prismaPhoto: PrismaPhoto): Photo {
    return {
      id: prismaPhoto.id,
      albumId: prismaPhoto.albumId,
      filename: prismaPhoto.filename,
      originalUrl: prismaPhoto.originalUrl,
      thumbnailUrl: prismaPhoto.thumbnailUrl,
      displayOrder: prismaPhoto.displayOrder,
      isSliderImage: prismaPhoto.isSliderImage,
      width: prismaPhoto.width,
      height: prismaPhoto.height,
      createdAt: prismaPhoto.createdAt,
      updatedAt: prismaPhoto.updatedAt,
    };
  }

  /**
   * Видобування ідентифікатора файлу з URL
   */
  private extractFileIdFromUrl(url: string): string {
    // URL має формат: https://endpoint/file/bucket/photos/[original|thumbnails]/[fileId][extension]
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    // Видобуваємо UUID з імені файлу
    const fileId = filename.split('_')[0].split('.')[0];
    return fileId;
  }
}
