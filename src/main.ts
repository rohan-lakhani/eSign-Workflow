import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3001);
  const frontendUrl = configService.get<string>('frontendUrl', 'http://localhost:5173');

  // CORS configuration - Updated for Vercel deployment
  app.enableCors({
    origin: [
      frontendUrl, 
      'http://localhost:5173', 
      'http://localhost:3000',
      /^https:\/\/.*\.vercel\.app$/,  // Allow all Vercel preview URLs
      'https://your-frontend.vercel.app' // Replace with your actual frontend URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

// For Vercel deployment
if (process.env.VERCEL) {
  module.exports = bootstrap();
} else {
  bootstrap();
}
