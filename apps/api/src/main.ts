import { NestFactory } from '@nestjs/core';
import { clerkMiddleware } from '@clerk/express';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Дозволяємо CORS для розробки
  app.enableCors();

  // Додаємо Clerk middleware для автентифікації
  app.use(
    clerkMiddleware({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    }),
  );

  logger.log('Clerk middleware активовано');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`API запущено на порту ${port}`);
}
bootstrap();
