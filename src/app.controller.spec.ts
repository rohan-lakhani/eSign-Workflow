import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('eSign Workflow NestJS API');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('api', () => {
    it('should return API info', () => {
      const result = appController.getApiInfo();
      expect(result.message).toBe('eSign Workflow API');
      expect(result.version).toBe('1.0.0');
      expect(result.endpoints).toBeDefined();
      expect(result.endpoints.documents).toBe('/api/documents');
      expect(result.endpoints.workflows).toBe('/api/workflows');
      expect(result.endpoints.health).toBe('/health');
    });
  });
});
