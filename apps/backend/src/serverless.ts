import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import serverless from 'serverless-http';
import { AppModule } from './app.module';
import { applyResolvedBaseSepoliaRpc } from './common/rpc.util';
import { buildCorsConfig } from './common/cors.util';

applyResolvedBaseSepoliaRpc();

let cached: ReturnType<typeof serverless> | undefined;

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log']
          : undefined,
    },
  );

  app.enableCors(buildCorsConfig());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return serverless(expressApp);
}

export async function handler(req: express.Request, res: express.Response) {
  if (!cached) {
    cached = await bootstrap();
  }
  return cached(req, res);
}
