import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthGuard } from './auth.guard';
import { ClerkStrategy } from './clerk.strategy';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ClerkStrategy, AuthGuard],
  exports: [ClerkStrategy, AuthGuard],
})
export class AuthModule {}
