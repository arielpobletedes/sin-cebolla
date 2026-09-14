import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { type HealthCheckResponse } from '@sin-cebolla/types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health') // /api/health
  health(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }
}
