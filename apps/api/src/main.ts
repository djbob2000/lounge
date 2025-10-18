import { clerkMiddleware } from '@clerk/express';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS for development
  app.enableCors();

  // Conditionally apply Clerk middleware
  app.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (req.path === '/api/photos/upload') {
      // Adjust path if your app is not at the root
      return next();
    }
    return clerkMiddleware({
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    })(req, res, next);
  });

  logger.log('Clerk middleware activated');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`API started on port ${port}`);
}
bootstrap();
