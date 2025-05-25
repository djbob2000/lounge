import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  @Public()
  async getStats() {
    return this.statsService.getStats();
  }
}
