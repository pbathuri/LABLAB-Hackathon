import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { applyResolvedBaseSepoliaRpc } from './common/rpc.util';
import { buildCorsConfig } from './common/cors.util';

applyResolvedBaseSepoliaRpc();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(buildCorsConfig());

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
    .addTag('policy', 'Policy enforcement')
    .addTag('kraken', 'Kraken CLI paper & market')
    .addTag('prism', 'PRISM market intelligence')
    .addTag('identity', 'ERC-8004 agent identity')
    .addTag('risk', 'On-chain RiskRouter')
    .build();

  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  await app.listen(port);
  console.log(`Captain Whiskers API running on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger docs at http://localhost:${port}/api`);
  }
}

bootstrap();
