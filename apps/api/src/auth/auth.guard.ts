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
import { ClerkStrategy } from './clerk.strategy';

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
    return (request as any).user;
  },
);

/**
 * Guard for checking authentication via Clerk
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly clerkStrategy: ClerkStrategy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ExpressRequest>();

    try {
      // Use ClerkStrategy to validate the token
      const user = await this.clerkStrategy.validate(request);

      // Attach user to request
      (request as any).user = user;

      this.logger.debug(`User authenticated: ${user.userId}`);
      return true;
    } catch (error) {
      this.logger.warn(`Authentication failed: ${error.message}`);
      throw new UnauthorizedException(
        'Authentication required. Please provide valid credentials.',
      );
    }
  }
}
