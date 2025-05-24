import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async cleanDatabase(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

    await Promise.all(
      modelNames.map((modelName) => {
        const prismaModelName =
          modelName.charAt(0).toLowerCase() + modelName.slice(1);
        return (this as any)[prismaModelName].deleteMany({});
      }),
    );
  }
}
