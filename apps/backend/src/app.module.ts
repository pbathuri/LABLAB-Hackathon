import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Feature modules
import { AgentModule } from './modules/agent/agent.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { QuantumModule } from './modules/quantum/quantum.module';
import { VerificationModule } from './modules/verification/verification.module';
import { MicropaymentModule } from './modules/micropayment/micropayment.module';
import { PolicyModule } from './modules/policy/policy.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReliabilityModule } from './modules/reliability/reliability.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database - Use DATABASE_URL (Railway standard) or individual variables
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        // Use DATABASE_URL directly if provided (TypeORM handles parsing)
        if (databaseUrl) {
          // Normalize postgresql:// to postgres:// for TypeORM
          const normalizedUrl = databaseUrl.replace(/^postgresql:\/\//, 'postgres://');
          
          return {
            type: 'postgres',
            url: normalizedUrl, // TypeORM will parse this automatically
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('NODE_ENV') !== 'production',
            logging: configService.get('NODE_ENV') === 'development',
            retryAttempts: 5,
            retryDelay: 3000,
            autoLoadEntities: true,
            ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Fallback to individual variables
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME', 'captain_whiskers'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
          retryAttempts: 5,
          retryDelay: 3000,
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
  ],
})
export class AppModule {}
