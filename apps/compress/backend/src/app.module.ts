import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// App controller and service
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Feature modules
import { AgentModule } from './modules/agent/agent.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { QuantumModule } from './modules/quantum/quantum.module';
import { VerificationModule } from './modules/verification/verification.module';
import { MicropaymentModule } from './modules/micropayment/micropayment.module';
import { PolicyModule } from './modules/policy/policy.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReliabilityModule } from './modules/reliability/reliability.module';
import { CircleModule } from './modules/circle/circle.module';

const logger = new Logger('AppModule');

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Default to SQLite demo mode for hackathon reliability
    // Set USE_POSTGRES=true with valid DATABASE_URL to use PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        const usePostgres = configService.get('USE_POSTGRES') === 'true';
        
        // Only use PostgreSQL if explicitly enabled AND DATABASE_URL is set
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
        
        // Default: Use better-sqlite3 in-memory for maximum reliability
        logger.log('Using better-sqlite3 in-memory database (demo mode - highly reliable)');
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

    // Feature modules
    AuthModule,
    AgentModule,
    WalletModule,
    QuantumModule,
    VerificationModule,
    MicropaymentModule,
    PolicyModule,
    ReliabilityModule,
    CircleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
