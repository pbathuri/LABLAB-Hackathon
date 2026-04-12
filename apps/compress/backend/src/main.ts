import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Captain Whiskers API')
    .setDescription(
      'Trustless AI Agent & Quantum Treasury Management System API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('agent', 'AI Agent operations')
    .addTag('wallet', 'Wallet management')
    .addTag('quantum', 'Quantum treasury optimization')
    .addTag('verification', 'Byzantine consensus verification')
    .addTag('micropayments', 'x402 micropayment operations')
    .addTag('policy', 'Policy enforcement')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🐱 Captain Whiskers API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}

bootstrap();
