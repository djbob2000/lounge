import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { AuthGuard, Public } from '../auth/auth.guard';
import { Photo } from '@lounge/types';
import { UploadPhotoDto, UpdatePhotoDto, UpdatePhotosOrderDto } from './dto';

@Controller('photos')
@UseGuards(AuthGuard)
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadPhotoDto: UploadPhotoDto,
  ): Promise<Photo> {
    return this.photosService.upload(
      file,
      uploadPhotoDto.albumId,
      uploadPhotoDto.displayOrder,
      uploadPhotoDto.isSliderImage,
    );
  }

  @Get()
  @Public()
  async findAll(): Promise<Photo[]> {
    return this.photosService.findAll();
  }

  @Get('slider')
  @Public()
  async findSliderPhotos(): Promise<Photo[]> {
    return this.photosService.findSliderPhotos();
  }

  @Get('album/:albumId')
  @Public()
  async findByAlbum(
    @Param('albumId', ParseUUIDPipe) albumId: string,
  ): Promise<Photo[]> {
    return this.photosService.findByAlbum(albumId);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Photo> {
    return this.photosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePhotoDto: UpdatePhotoDto,
  ): Promise<Photo> {
    return this.photosService.update(id, updatePhotoDto);
  }

  @Patch(':id/slider')
  async toggleSliderStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('isSliderImage') isSliderImage: boolean,
  ): Promise<Photo> {
    return this.photosService.toggleSliderStatus(id, isSliderImage === true);
  }

  @Patch('order')
  async updateOrder(
    @Body() updatePhotosOrderDto: UpdatePhotosOrderDto,
  ): Promise<Photo[]> {
    return this.photosService.updateOrder(updatePhotosOrderDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<Photo> {
    return this.photosService.remove(id);
  }
}
