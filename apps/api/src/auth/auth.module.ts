import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkStrategy } from './clerk.strategy';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [ClerkStrategy, AuthGuard],
  exports: [ClerkStrategy, AuthGuard],
})
export class AuthModule {}
