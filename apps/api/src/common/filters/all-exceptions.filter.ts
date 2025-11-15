import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : ((message as { message?: string }).message ?? (message as unknown as string)),
    };

    // Log error details
    this.logger.error(
      `HTTP ${request.method} ${request.url} ${status} - ${JSON.stringify({
        error: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : null,
        request: {
          headers: request.headers,
          body: request.body,
          query: request.query,
          params: request.params,
        },
      })}`,
    );

    response.status(status).json(errorResponse);
  }
}
