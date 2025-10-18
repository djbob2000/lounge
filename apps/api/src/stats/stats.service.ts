import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalCategories, totalAlbums, totalPhotos, sliderPhotos] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.album.count(),
      this.prisma.photo.count(),
      this.prisma.photo.count({
        where: {
          isSliderImage: true,
        },
      }),
    ]);

    return {
      totalCategories,
      totalAlbums,
      totalPhotos,
      sliderPhotos,
    };
  }
}
