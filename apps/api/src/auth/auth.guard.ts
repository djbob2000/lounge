import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request as ExpressRequest } from 'express';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

/**
 * Metadata to indicate public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Guard for checking authentication via Clerk
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ExpressRequest>();
    const token = this.extractTokenFromHeader(request);

    // Validate token and get user information
    return this.authService
      .validateToken(token)
      .then((user) => {
        // Add user to the request for further use
        request['user'] = user;
        return true;
      })
      .catch(() => false);
  }

  /**
   * Get token from Authorization header
   */
  private extractTokenFromHeader(request: ExpressRequest): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }
}
