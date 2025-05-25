import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AlbumsModule } from './albums/albums.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { PhotosModule } from './photos/photos.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { StatsController } from './stats/stats.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    StorageModule,
    AuthModule,
    CategoriesModule,
    AlbumsModule,
    PhotosModule,
  ],
  controllers: [AppController, StatsController],
  providers: [AppService],
})
export class AppModule {}
