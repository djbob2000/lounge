import { createClerkClient, type User } from '@clerk/backend';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Interface for the user object we'll return
export interface AuthenticatedUser {
  userId: string;
  email: string | undefined;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  privateMetadata: Record<string, unknown>;
  // Add other relevant fields from Clerk User object if needed
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private backendClerkClient: ReturnType<typeof createClerkClient>;

  constructor(configService: ConfigService) {
    const secretKey = configService.get<string>('CLERK_SECRET_KEY');
    if (!secretKey) {
      const errorMsg =
        'CLERK_SECRET_KEY is not set. Cannot initialize Clerk backend client.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    this.backendClerkClient = createClerkClient({ secretKey });
  }

  /**
   * Get full user information by userId.
   * Assumes userId is already validated (e.g., from req.auth.userId via clerkMiddleware).
   */
  async getUserByUserId(userId: string): Promise<AuthenticatedUser> {
    try {
      if (!userId) {
        throw new Error('User ID not provided to getUserByUserId');
      }
      const user: User = await this.backendClerkClient.users.getUser(userId);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return {
        userId: user.id,
        email: user.emailAddresses.find(
          (e) => e.id === user.primaryEmailAddressId,
        )?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        privateMetadata: user.privateMetadata as Record<string, unknown>, // Cast if necessary, ensure type safety
      };
    } catch (error) {
      this.logger.error(
        `Error fetching user ${userId}: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Consider throwing a more generic error or re-throwing based on specific needs
      throw new Error(`Failed to fetch user data for user ID ${userId}`);
    }
  }
}
