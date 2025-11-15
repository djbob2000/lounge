import { verifyToken } from '@clerk/backend';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request as ExpressRequest } from 'express';

@Injectable()
export class ClerkStrategy {
  constructor(private readonly configService: ConfigService) {}

  async validate(req: ExpressRequest): Promise<{ userId: string; sessionId: string }> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ').pop();

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const secretKey = this.configService.get('CLERK_SECRET_KEY');
      if (!secretKey) {
        throw new UnauthorizedException('Server configuration error: Missing secret key.');
      }
      const tokenPayload = await verifyToken(token, { secretKey });

      return {
        userId: tokenPayload.sub,
        sessionId: tokenPayload.sid,
        ...tokenPayload,
      };
    } catch (error: unknown) {
      throw new UnauthorizedException(
        `Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
