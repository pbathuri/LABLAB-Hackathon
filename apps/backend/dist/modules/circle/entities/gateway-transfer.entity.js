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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayTransfer = exports.GatewayTransferStatus = void 0;
const typeorm_1 = require("typeorm");
var GatewayTransferStatus;
(function (GatewayTransferStatus) {
    GatewayTransferStatus["PENDING"] = "pending";
    GatewayTransferStatus["COMPLETED"] = "completed";
    GatewayTransferStatus["FAILED"] = "failed";
})(GatewayTransferStatus || (exports.GatewayTransferStatus = GatewayTransferStatus = {}));
let GatewayTransfer = class GatewayTransfer {
};
exports.GatewayTransfer = GatewayTransfer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "sourceChain", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "destinationChain", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 36, scale: 18 }),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "fromWalletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "fromAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "toAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: GatewayTransferStatus.PENDING }),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GatewayTransfer.prototype, "txHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], GatewayTransfer.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], GatewayTransfer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], GatewayTransfer.prototype, "updatedAt", void 0);
exports.GatewayTransfer = GatewayTransfer = __decorate([
    (0, typeorm_1.Entity)('gateway_transfers')
], GatewayTransfer);
//# sourceMappingURL=gateway-transfer.entity.js.map