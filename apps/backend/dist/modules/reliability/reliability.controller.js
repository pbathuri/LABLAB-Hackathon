"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReliabilityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const reliability_service_1 = require("./reliability.service");
class RegisterProviderDto {
}
let ReliabilityController = class ReliabilityController {
    constructor(reliabilityService) {
        this.reliabilityService = reliabilityService;
    }
    async registerProvider(dto) {
        return this.reliabilityService.registerProvider(dto.name, dto.endpoint, dto.description, dto.costPerCall);
    }
    async getProviders() {
        return this.reliabilityService.getProvidersByReliability(false);
    }
    async getBestProvider() {
        return this.reliabilityService.selectBestProvider();
    }
    async getStats() {
        return this.reliabilityService.getProviderStats();
    }
};
exports.ReliabilityController = ReliabilityController;
__decorate([
    (0, common_1.Post)('provider'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new API provider' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Provider registered' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterProviderDto]),
    __metadata("design:returntype", Promise)
], ReliabilityController.prototype, "registerProvider", null);
__decorate([
    (0, common_1.Get)('providers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all providers sorted by reliability' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Providers returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReliabilityController.prototype, "getProviders", null);
__decorate([
    (0, common_1.Get)('best'),
    (0, swagger_1.ApiOperation)({ summary: 'Get the best available provider' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Best provider returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReliabilityController.prototype, "getBestProvider", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider reliability statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Stats returned' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReliabilityController.prototype, "getStats", null);
exports.ReliabilityController = ReliabilityController = __decorate([
    (0, swagger_1.ApiTags)('reliability'),
    (0, common_1.Controller)('reliability'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [reliability_service_1.ReliabilityService])
], ReliabilityController);
//# sourceMappingURL=reliability.controller.js.map