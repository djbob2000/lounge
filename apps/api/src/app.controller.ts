import { Message } from '@lounge/types';
import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/message')
  getMessage(): Message {
    return { text: 'Hello from Nest.js!' };
  }
}
