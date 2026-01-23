"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const agent_module_1 = require("./modules/agent/agent.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const quantum_module_1 = require("./modules/quantum/quantum.module");
const verification_module_1 = require("./modules/verification/verification.module");
const micropayment_module_1 = require("./modules/micropayment/micropayment.module");
const policy_module_1 = require("./modules/policy/policy.module");
const auth_module_1 = require("./modules/auth/auth.module");
const reliability_module_1 = require("./modules/reliability/reliability.module");
const circle_module_1 = require("./modules/circle/circle.module");
const logger = new common_1.Logger('AppModule');
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    if (databaseUrl && databaseUrl !== 'demo') {
                        logger.log('Using PostgreSQL database');
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
                    logger.log('Using SQLite in-memory database (demo mode)');
                    return {
                        type: 'sqlite',
                        database: ':memory:',
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        synchronize: true,
                        autoLoadEntities: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            agent_module_1.AgentModule,
            wallet_module_1.WalletModule,
            quantum_module_1.QuantumModule,
            verification_module_1.VerificationModule,
            micropayment_module_1.MicropaymentModule,
            policy_module_1.PolicyModule,
            reliability_module_1.ReliabilityModule,
            circle_module_1.CircleModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map