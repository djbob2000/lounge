import { Photo } from '@lounge/types';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Photo as PrismaPhoto } from '@prisma/client';
import { AlbumsService } from '../albums/albums.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UpdatePhotoDto, UpdatePhotosOrderDto } from './dto';

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly albumsService: AlbumsService,
  ) {}

  /**
   * Upload photo
   */
  async upload(
    file: Express.Multer.File,
    albumId: string,
    displayOrder?: number,
    isSliderImage = false,
  ): Promise<Photo> {
    console.log('Starting photo upload for albumId:', albumId, 'file:', file.originalname);
    // Check if album exists
    try {
      await this.albumsService.findOne(albumId);
      console.log('Album check passed for ID:', albumId);
    } catch (error) {
      console.error('Album check failed:', error);
      throw error;
    }

    // Upload file to storage
    let uploadResult: { url: string; thumbnailUrl: string };
    try {
      console.log('Uploading file to storage...');
      uploadResult = await this.storageService.uploadFile(file);
      console.log('File uploaded to storage successfully:', uploadResult.filename);
    } catch (error) {
      console.error('Storage upload failed:', error);
      throw error;
    }

    // Determine display order if not provided
    const order =
      displayOrder !== undefined ? displayOrder : await this.getNextDisplayOrder(albumId);

    // Create photo record in database
    let photo: { id: string; title: string; url: string; thumbnailUrl: string };
    try {
      console.log('Creating photo record in database...');
      photo = await this.prisma.photo.create({
        data: {
          albumId,
          filename: uploadResult.filename,
          originalUrl: uploadResult.originalUrl,
          thumbnailUrl: uploadResult.thumbnailUrl,
          displayOrder: Number(order),
          isSliderImage,
          width: uploadResult.width,
          height: uploadResult.height,
        },
      });
      console.log('Photo record created successfully:', photo.id);
    } catch (error) {
      console.error('Database create failed:', error);
      // Optionally rollback storage upload if needed
      throw error;
    }

    console.log('Photo upload completed successfully');
    return this.mapPrismaPhotoToPhoto(photo);
  }

  /**
   * Get all photos
   */
  async findAll(): Promise<Photo[]> {
    const photos = await this.prisma.photo.findMany({
      orderBy: [{ displayOrder: 'asc' }],
    });

    return photos.map((photo) => this.mapPrismaPhotoToPhoto(photo));
  }

  /**
   * Get album photos
   */
  async findByAlbum(albumId: string): Promise<Photo[]> {
    // Check if album exists
    await this.albumsService.findOne(albumId);

    const photos = await this.prisma.photo.findMany({
      where: { albumId },
      orderBy: [{ displayOrder: 'asc' }],
    });

    return photos.map((photo) => this.mapPrismaPhotoToPhoto(photo));
  }

  /**
   * Get slider photos
   */
  async findSliderPhotos(): Promise<Photo[]> {
    const photos = await this.prisma.photo.findMany({
      where: { isSliderImage: true },
      orderBy: [{ displayOrder: 'asc' }],
    });

    return photos.map((photo) => this.mapPrismaPhotoToPhoto(photo));
  }

  /**
   * Get photo by ID
   */
  async findOne(id: string): Promise<Photo> {
    const photo = await this.prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }

    return this.mapPrismaPhotoToPhoto(photo);
  }

  /**
   * Update photo
   */
  async update(id: string, updatePhotoDto: UpdatePhotoDto): Promise<Photo> {
    // Check if photo exists
    await this.findOne(id);

    // Update photo
    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: {
        displayOrder: updatePhotoDto.displayOrder,
        isSliderImage: updatePhotoDto.isSliderImage,
        description: updatePhotoDto.description,
      },
    });

    return this.mapPrismaPhotoToPhoto(updatedPhoto);
  }

  /**
   * Delete photo
   */
  async remove(id: string): Promise<Photo> {
    // Get photo for subsequent file deletion
    const photo = await this.findOne(id);

    // Delete record from database
    const deletedPhoto = await this.prisma.photo.delete({
      where: { id },
    });

    // Get file ID from URL
    const fileId = this.extractFileIdFromUrl(photo.originalUrl || photo.thumbnailUrl);

    // Delete files from cloud storage
    await this.storageService.deleteFile(fileId);

    return this.mapPrismaPhotoToPhoto(deletedPhoto);
  }

  /**
   * Update photo order
   */
  async updateOrder(updatePhotosOrderDto: UpdatePhotosOrderDto): Promise<Photo[]> {
    const { photos } = updatePhotosOrderDto;

    // Check if all photos exist
    const existingPhotos = await this.prisma.photo.findMany({
      where: {
        id: {
          in: photos.map((photo) => photo.id),
        },
      },
    });

    if (existingPhotos.length !== photos.length) {
      throw new BadRequestException('Some photos were not found');
    }

    // Update display order
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
   * Add/remove photo to/from slider
   */
  async toggleSliderStatus(id: string, isSliderImage: boolean): Promise<Photo> {
    // Check if photo exists
    await this.findOne(id);

    // Update slider status
    const updatedPhoto = await this.prisma.photo.update({
      where: { id },
      data: { isSliderImage },
    });

    return this.mapPrismaPhotoToPhoto(updatedPhoto);
  }

  /**
   * Get the next display order number for a photo in an album
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
   * Convert Prisma model to domain model
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
   * Extract file ID from URL
   */
  private extractFileIdFromUrl(url: string): string {
    // URL format: https://endpoint/file/bucket/photos/[original|thumbnails]/[fileId][extension]
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    // Extract UUID from file name
    const fileId = filename.split('_')[0].split('.')[0];
    return fileId;
  }
}
