import { Module, Logger } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AgentModule } from './modules/agent/agent.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { QuantumModule } from './modules/quantum/quantum.module';
import { VerificationModule } from './modules/verification/verification.module';
import { PolicyModule } from './modules/policy/policy.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReliabilityModule } from './modules/reliability/reliability.module';
import { KrakenModule } from './modules/kraken/kraken.module';
import { PrismModule } from './modules/prism/prism.module';
import { ERC8004Module } from './modules/erc8004/erc8004.module';
import { RiskModule } from './modules/risk/risk.module';
import { AerodromeModule } from './modules/aerodrome/aerodrome.module';
import { HackathonModule } from './modules/hackathon/hackathon.module';

const logger = new Logger('AppModule');

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 40,
      },
    ]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(process.cwd(), '..', '.env'),
        join(process.cwd(), '..', '..', '.env'),
        '.env.local',
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        const usePostgres = configService.get('USE_POSTGRES') === 'true';
        const onVercel = process.env.VERCEL === '1';

        if (
          onVercel &&
          (!usePostgres || !databaseUrl || databaseUrl === 'demo')
        ) {
          logger.warn(
            'Vercel: no hosted Postgres — using in-memory SQLite (data lost on cold start). Set USE_POSTGRES=true + DATABASE_URL (Neon/Supabase) for persistence.',
          );
        }

        if (usePostgres && databaseUrl && databaseUrl !== 'demo') {
          logger.log('Using PostgreSQL database (USE_POSTGRES=true)');
          const normalizedUrl = databaseUrl.replace(/^postgresql:\/\//, 'postgres://');

          return {
            type: 'postgres',
            url: normalizedUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: configService.get('NODE_ENV') === 'development',
            retryAttempts: 3,
            retryDelay: 3000,
            autoLoadEntities: true,
            ssl: { rejectUnauthorized: false },
          };
        }

        logger.log('Using better-sqlite3 in-memory database (demo mode)');
        return {
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
    AgentModule,
    WalletModule,
    QuantumModule,
    VerificationModule,
    PolicyModule,
    ReliabilityModule,
    KrakenModule,
    PrismModule,
    ERC8004Module,
    RiskModule,
    AerodromeModule,
    HackathonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule { }
