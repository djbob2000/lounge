import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.guard';

@Controller('stats')
export class StatsController {
  @Get()
  @Public()
  getStats() {
    // TODO: Implement real statistics from database
    return {
      totalCategories: 0,
      totalAlbums: 0,
      totalPhotos: 0,
      sliderPhotos: 0,
    };
  }
}
