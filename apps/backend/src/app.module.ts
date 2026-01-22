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

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'captain_whiskers'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
      }),
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
