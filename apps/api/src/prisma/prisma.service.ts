import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
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

    const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

    await Promise.all(
      modelNames.map((modelName) => {
        const prismaModelName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
        return (this as any)[prismaModelName].deleteMany({});
      }),
    );
  }
}
