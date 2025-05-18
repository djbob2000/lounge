import * as clerk from '@clerk/clerk-sdk-node';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly configService: ConfigService) {
    // Initialize Clerk SDK
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');

    if (!secretKey) {
      this.logger.error('Clerk API key is not set');
      return;
    }

    clerk.setClerkApiKey(secretKey);
  }

  /**
   * Validate token and get user information
   */
  async validateToken(token: string): Promise<any> {
    try {
      if (!token || token === 'undefined' || token === 'null') {
        throw new UnauthorizedException('Token not provided');
      }

      // Check Clerk session token
      const sessionClaims = await clerk.verifyToken(token, {
        jwtKey: this.configService.get<string>('CLERK_JWT_KEY'),
      });

      if (!sessionClaims || !sessionClaims.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get user information
      const user = await clerk.users.getUser(sessionClaims.sub);

      // Check if the user has administrator rights
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
