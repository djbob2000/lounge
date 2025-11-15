import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { Controller, Get, Header, UseInterceptors } from '@nestjs/common';
import { Public } from '../auth/auth.guard';
import { StatsService } from './stats.service';

@Controller({ path: 'stats', version: '1' })
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('stats')
  @CacheTTL(300)
  @Header('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800')
  async getStats() {
    return this.statsService.getStats();
  }
}
