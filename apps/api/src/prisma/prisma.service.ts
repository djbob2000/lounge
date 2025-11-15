import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL'),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      console.log('Prisma connected to PostgreSQL successfully');
    } catch (error) {
      console.error('Prisma connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    console.log('Prisma disconnected');
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    // Delete in order to satisfy FK constraints: photos -> albums -> categories
    await this.photo.deleteMany({});
    await this.album.deleteMany({});
    await this.category.deleteMany({});
  }
}
