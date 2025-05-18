import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto, UpdateAlbumDto, UpdateAlbumsOrderDto } from './dto';
import { Album } from '@lounge/types';
import { AuthGuard, Public } from '../auth/auth.guard';

@Controller('albums')
@UseGuards(AuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  /**
   * Створення нового альбому
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAlbumDto: CreateAlbumDto): Promise<Album> {
    return this.albumsService.create(createAlbumDto);
  }

  /**
   * Отримання всіх альбомів
   */
  @Get()
  @Public()
  findAll(): Promise<Album[]> {
    return this.albumsService.findAll();
  }

  /**
   * Отримання альбомів за категорією
   */
  @Get('category/:categoryId')
  @Public()
  findByCategory(@Param('categoryId') categoryId: string): Promise<Album[]> {
    return this.albumsService.findByCategory(categoryId);
  }

  /**
   * Отримання альбому за ID
   */
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Album> {
    return this.albumsService.findOne(id);
  }

  /**
   * Отримання альбому за slug
   */
  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string): Promise<Album> {
    return this.albumsService.findBySlug(slug);
  }

  /**
   * Оновлення альбому
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAlbumDto: UpdateAlbumDto,
  ): Promise<Album> {
    return this.albumsService.update(id, updateAlbumDto);
  }

  /**
   * Встановлення обкладинки альбому
   */
  @Patch(':id/cover')
  setCoverImage(
    @Param('id') id: string,
    @Body('coverImageUrl') coverImageUrl: string,
  ): Promise<Album> {
    return this.albumsService.setCoverImage(id, coverImageUrl);
  }

  /**
   * Видалення альбому
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<Album> {
    return this.albumsService.remove(id);
  }

  /**
   * Оновлення порядку відображення альбомів
   */
  @Patch('order/update')
  updateOrder(
    @Body() updateAlbumsOrderDto: UpdateAlbumsOrderDto,
  ): Promise<Album[]> {
    return this.albumsService.updateOrder(updateAlbumsOrderDto);
  }
}
