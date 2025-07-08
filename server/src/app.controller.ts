import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'eSign Workflow API is running!';
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'esign-workflow-api',
      version: '1.0.0'
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
