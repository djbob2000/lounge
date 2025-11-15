import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { Request } from 'express';

interface ApiVersionInfo {
  version: string;
  status: string;
  endpoints: string[];
  deprecated?: boolean;
}

@Controller('api')
export class ApiVersionController {
  @Get('version')
  @HttpCode(HttpStatus.OK)
  getVersion(): { currentVersion: string; supportedVersions: ApiVersionInfo[] } {
    return {
      currentVersion: 'v1',
      supportedVersions: [
        {
          version: 'v1',
          status: 'stable',
          endpoints: [
            'GET /api/v1/categories',
            'POST /api/v1/categories',
            'GET /api/v1/categories/:id',
            'PATCH /api/v1/categories/:id',
            'DELETE /api/v1/categories/:id',
            'GET /api/v1/albums',
            'POST /api/v1/albums',
            'GET /api/v1/albums/:id',
            'PATCH /api/v1/albums/:id',
            'DELETE /api/v1/albums/:id',
            'GET /api/v1/photos',
            'POST /api/v1/photos',
            'GET /api/v1/photos/:id',
            'PATCH /api/v1/photos/:id',
            'DELETE /api/v1/photos/:id',
            'POST /api/v1/photos/upload',
            'GET /api/v1/stats',
          ],
        },
      ],
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getApiInfo(@Req() req: Request): {
    message: string;
    version: string;
    documentation: string;
    contact: string;
    requestInfo: {
      method: string;
      url: string;
      headers: Record<string, string | undefined>;
    };
  } {
    return {
      message: 'Welcome to Lounge API',
      version: 'v1',
      documentation: `${req.protocol}://${req.get('host')}/api/docs`,
      contact: 'support@lounge.com',
      requestInfo: {
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.get('user-agent'),
          accept: req.get('accept'),
          'accept-encoding': req.get('accept-encoding'),
        },
      },
    };
  }
}
