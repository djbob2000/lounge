import { Photo } from '@lounge/types';
import { CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Cache } from 'cache-manager';
import { AuthGuard, Public } from '../auth/auth.guard';
import { UpdatePhotoDto, UpdatePhotosOrderDto, UploadPhotoDto } from './dto';
import { PhotosService } from './photos.service';

@Controller({ path: 'photos', version: '1' })
@UseGuards(AuthGuard)
export class PhotosController {
  constructor(
    private readonly photosService: PhotosService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadPhotoDto: UploadPhotoDto,
  ): Promise<Photo> {
    const result = await this.photosService.upload(
      file,
      uploadPhotoDto.albumId,
      uploadPhotoDto.displayOrder,
      uploadPhotoDto.isSliderImage,
    );
    // Clear photos cache after upload
    await this.cacheManager.del('photos-all');
    await this.cacheManager.del('photos-slider');
    await this.cacheManager.del('photos-album');
    return result;
  }

  @Get()
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('photos-all')
  @CacheTTL(900) // 15 minutes
  @Header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600')
  async findAll(): Promise<Photo[]> {
    return this.photosService.findAll();
  }

  @Get('slider')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('photos-slider')
  @CacheTTL(900) // 15 minutes
  @Header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600')
  async findSliderPhotos(): Promise<Photo[]> {
    return this.photosService.findSliderPhotos();
  }

  @Get('album/:albumId')
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('photos-album')
  @CacheTTL(900) // 15 minutes
  @Header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600')
  async findByAlbum(@Param('albumId', ParseUUIDPipe) albumId: string): Promise<Photo[]> {
    return this.photosService.findByAlbum(albumId);
  }

  @Get(':id')
  @Public()
  @Header('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=3600')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Photo> {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ): Promise<Photo> {
    const result = await this.photosService.update(id, updatePhotoDto);
    // Clear photos cache after update
    await this.cacheManager.del('photos-all');
    await this.cacheManager.del('photos-slider');
    await this.cacheManager.del('photos-album');
    return result;
  }

  @Patch(':id/slider')
  async toggleSliderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isSliderImage') isSliderImage: boolean,
  ): Promise<Photo> {
    const result = await this.photosService.toggleSliderStatus(id, isSliderImage === true);
    // Clear photos cache after slider status change
    await this.cacheManager.del('photos-all');
    await this.cacheManager.del('photos-slider');
    await this.cacheManager.del('photos-album');
    return result;
  }

  @Patch('order')
  async updateOrder(@Body() updatePhotosOrderDto: UpdatePhotosOrderDto): Promise<Photo[]> {
    const result = await this.photosService.updateOrder(updatePhotosOrderDto);
    // Clear photos cache after order update
    await this.cacheManager.del('photos-all');
    await this.cacheManager.del('photos-slider');
    await this.cacheManager.del('photos-album');
    return result;
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<Photo> {
    const result = await this.photosService.remove(id);
    // Clear photos cache after deletion
    await this.cacheManager.del('photos-all');
    await this.cacheManager.del('photos-slider');
    await this.cacheManager.del('photos-album');
    return result;
  }
}
