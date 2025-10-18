import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';

@Module({
  imports: [PrismaModule, CategoriesModule],
  controllers: [AlbumsController],
  providers: [AlbumsService],
  exports: [AlbumsService],
})
export class AlbumsModule {}
