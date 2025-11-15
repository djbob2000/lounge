import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    const userAgent = request.get('user-agent') || 'unknown';
    const ip = request.ip || request.connection.remoteAddress;

    this.logger.log(`Request: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        const statusCode = response.statusCode;

        this.logger.log(`Response: ${method} ${url} ${statusCode} - ${responseTime}ms`);
      }),
    );
  }
}
