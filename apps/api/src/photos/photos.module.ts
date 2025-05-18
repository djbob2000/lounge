import { Module } from '@nestjs/common';

import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { AlbumsModule } from '../albums/albums.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';


@Module({
  imports: [StorageModule, PrismaModule, AlbumsModule],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
