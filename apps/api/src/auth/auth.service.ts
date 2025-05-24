import Clerk from '@clerk/clerk-sdk-node';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Define an interface for the authenticated user object
interface AuthUser {
  userId: string;
  email: string | undefined;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  role: unknown; // Clerk's privateMetadata can be anything, so use unknown
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private clerkClient;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!secretKey) {
      this.logger.error(
        'Clerk secret key is not set. Ensure CLERK_SECRET_KEY env var is available or SDK is initialized correctly.',
      );
      // Potentially throw, or rely on Clerk to throw if not configured
    }
    // Attempt to get instance. Clerk SDK should pick up CLERK_SECRET_KEY from environment.
    // If Clerk itself is the instance or namespace with static methods, adjust accordingly.
    this.clerkClient = Clerk.getInstance(); // Assuming getInstance is on the main export
  }

  /**
   * Validate token and get user information
   */
  async validateToken(token: string): Promise<AuthUser> {
    try {
      if (!token || token === 'undefined' || token === 'null') {
        throw new UnauthorizedException('Token not provided');
      }

      const jwtKey = this.configService.get<string>('CLERK_JWT_KEY');
      if (!jwtKey) {
        this.logger.error('CLERK_JWT_KEY is not configured.');
        throw new UnauthorizedException('Server configuration error.');
      }

      // Check Clerk session token
      const sessionClaims = await this.clerkClient.verifyToken(token, {
        jwtKey: jwtKey,
      });

      if (!sessionClaims || !sessionClaims.sub) {
        throw new UnauthorizedException('Invalid token');
      }

      // Get user information
      const user = await this.clerkClient.users.getUser(sessionClaims.sub);

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
