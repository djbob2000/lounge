import { clerkMiddleware } from '@clerk/express';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS with proper configuration
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
  app.enableCors({
    origin: webUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Conditionally apply Clerk middleware
  app.use((req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (req.path === '/photos/upload') {
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
