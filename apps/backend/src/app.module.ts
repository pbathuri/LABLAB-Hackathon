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
        
        // Parse DATABASE_URL if provided (Railway format: postgresql://user:pass@host:port/dbname)
        if (databaseUrl) {
          const url = new URL(databaseUrl);
          return {
            type: 'postgres',
            host: url.hostname,
            port: parseInt(url.port) || 5432,
            username: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading slash
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('NODE_ENV') !== 'production',
            logging: configService.get('NODE_ENV') === 'development',
            retryAttempts: 3,
            retryDelay: 3000,
            autoLoadEntities: true,
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
          retryAttempts: 3,
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
