import { verifyToken } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class ClerkStrategy {
  constructor(private readonly configService: ConfigService) {}

  async validate(req: ExpressRequest): Promise<{ userId: string; sessionId: string }> {
    console.log(`ClerkStrategy: validate called for path: ${req.originalUrl}`);
    const authHeader = req.headers.authorization;
    console.log(`ClerkStrategy: Authorization header: ${authHeader}`);

    const token = authHeader?.split(' ').pop();
    console.log(
      `ClerkStrategy: Extracted token: ${token ? `Token present (length ${token.length})` : 'No token extracted'}`,
    );

    if (!token) {
      console.warn('ClerkStrategy: No token provided in Authorization header.');
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secretKey = this.configService.get('CLERK_SECRET_KEY');
      // console.log('ClerkStrategy: Using Clerk Secret Key (length):', secretKey ? secretKey.length : 'Not found'); // Be careful logging secrets, even length
      if (!secretKey) {
        console.error('ClerkStrategy: CLERK_SECRET_KEY is not configured.');
        throw new UnauthorizedException('Server configuration error: Missing secret key.');
      }
      const tokenPayload = await verifyToken(token, { secretKey });

      console.log('ClerkStrategy: Token verified successfully. Payload sub:', tokenPayload.sub);
      return {
        userId: tokenPayload.sub,
        sessionId: tokenPayload.sid,
        ...tokenPayload,
      };
    } catch (error: unknown) {
      // Explicitly type error if possible, or use 'any'/'unknown'
      console.error(
        'ClerkStrategy: Token verification error:',
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error.stack : '',
      );
      // Consider logging specific Clerk error codes if available: error.status, error.errors
      throw new UnauthorizedException(
        `Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
