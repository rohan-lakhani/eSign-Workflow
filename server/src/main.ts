import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const frontendUrl = configService.get<string>('frontendUrl', 'http://localhost:5173');

  // CORS configuration - Updated for Render deployment
  app.enableCors({
    origin: [
      frontendUrl, 
      'https://esign-workflow-cxcx.onrender.com',
      'https://esign-five.vercel.app',
      'http://localhost:5173', 
      'http://localhost:4173', // Vite preview
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await app.listen(port);
  
  console.log(`
  eSign Workflow NestJS Server Started
  Port: ${port}
`);

  return app;
}

bootstrap();
