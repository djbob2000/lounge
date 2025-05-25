import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  CustomDecorator,
  UnauthorizedException,
  Logger,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';

/**
 * Metadata to indicate public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): CustomDecorator<string> =>
  SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Decorator to get current user from request
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<ExpressRequest>();
    return (request as any).auth;
  },
);

/**
 * Guard for checking authentication via Clerk
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ExpressRequest>();

    // Development mode fallback
    if (!process.env.CLERK_SECRET_KEY) {
      this.logger.warn(
        'CLERK_SECRET_KEY is missing. All routes are accessible without authentication in development mode!',
      );
      return true;
    }

    // Check if Clerk middleware set auth information
    if ((request as any).auth?.userId) {
      return true;
    }

    throw new UnauthorizedException(
      'Authentication required. Please provide valid credentials.',
    );
  }
}
