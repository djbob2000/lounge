import { Album } from '@lounge/types';
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
import { AuthGuard, Public } from '../auth/auth.guard';
import { AlbumsService } from './albums.service';
import { CreateAlbumDto, UpdateAlbumDto, UpdateAlbumsOrderDto } from './dto';

@Controller('albums')
@UseGuards(AuthGuard)
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  /**
   * Create new album
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAlbumDto: CreateAlbumDto): Promise<Album> {
    return this.albumsService.create(createAlbumDto);
  }

  /**
   * Get all albums
   */
  @Get()
  @Public()
  findAll(): Promise<Album[]> {
    return this.albumsService.findAll();
  }

  /**
   * Get albums by category
   */
  @Get('category/:categoryId')
  @Public()
  findByCategory(@Param('categoryId') categoryId: string): Promise<Album[]> {
    return this.albumsService.findByCategory(categoryId);
  }

  /**
   * Get album by ID
   */
  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Promise<Album> {
    return this.albumsService.findOne(id);
  }

  /**
   * Get album by slug
   */
  @Get('slug/:slug')
  @Public()
  findBySlug(@Param('slug') slug: string): Promise<Album> {
    return this.albumsService.findBySlug(slug);
  }

  /**
   * Update album
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto): Promise<Album> {
    return this.albumsService.update(id, updateAlbumDto);
  }

  /**
   * Set album cover image
   */
  @Patch(':id/cover')
  setCoverImage(
    @Param('id') id: string,
    @Body('coverImageUrl') coverImageUrl: string,
  ): Promise<Album> {
    return this.albumsService.setCoverImage(id, coverImageUrl);
  }

  /**
   * Delete album
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<Album> {
    return this.albumsService.remove(id);
  }

  /**
   * Update albums order
   */
  @Patch('order/update')
  updateOrder(@Body() updateAlbumsOrderDto: UpdateAlbumsOrderDto): Promise<Album[]> {
    return this.albumsService.updateOrder(updateAlbumsOrderDto);
  }
}
