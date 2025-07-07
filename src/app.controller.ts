import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'eSign Workflow NestJS API',
    };
  }

  @Get('api')
  getApiInfo() {
    return {
      message: 'eSign Workflow API',
      version: '1.0.0',
      endpoints: {
        documents: '/api/documents',
        workflows: '/api/workflows',
        health: '/health',
      },
    };
  }
}
