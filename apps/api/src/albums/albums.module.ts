import { Module } from '@nestjs/common';

import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { CategoriesModule } from '../categories/categories.module';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
  imports: [PrismaModule, CategoriesModule],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
