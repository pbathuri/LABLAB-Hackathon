"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Captain Whiskers API')
        .setDescription('Trustless AI Agent & Quantum Treasury Management System API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('agent', 'AI Agent operations')
        .addTag('wallet', 'Wallet management')
        .addTag('quantum', 'Quantum treasury optimization')
        .addTag('verification', 'Byzantine consensus verification')
        .addTag('micropayments', 'x402 micropayment operations')
        .addTag('policy', 'Policy enforcement')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`🐱 Captain Whiskers API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map