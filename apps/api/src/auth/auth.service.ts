import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as clerk from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService) {
    // Ініціалізація Clerk SDK
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!secretKey) {
      this.logger.error('Clerk API key is not set');
      return;
    }

    clerk.setClerkApiKey(secretKey);
  }

  /**
   * Перевірка валідності токена та отримання інформації про користувача
   */
  async validateToken(token: string): Promise<any> {
    try {
      if (!token || token === 'undefined' || token === 'null') {
        throw new UnauthorizedException('Token not provided');
      }

      // Перевірка сесійного токена Clerk
      const sessionClaims = await clerk.verifyToken(token);

      if (!sessionClaims || !sessionClaims.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Отримання інформації про користувача
      const user = await clerk.users.getUser(sessionClaims.sub);

      // Перевірка, чи має користувач права адміністратора
      const isAdmin = user.privateMetadata.role === 'admin';

      if (!isAdmin) {
        throw new UnauthorizedException('User is not an admin');
      }

      return {
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.privateMetadata.role,
      };
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
