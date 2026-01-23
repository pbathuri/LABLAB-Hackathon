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
exports.CircleWallet = exports.CircleWalletType = void 0;
const typeorm_1 = require("typeorm");
var CircleWalletType;
(function (CircleWalletType) {
    CircleWalletType["DEV_CONTROLLED"] = "dev_controlled";
    CircleWalletType["USER_CONTROLLED"] = "user_controlled";
})(CircleWalletType || (exports.CircleWalletType = CircleWalletType = {}));
let CircleWallet = class CircleWallet {
};
exports.CircleWallet = CircleWallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CircleWallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CircleWallet.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CircleWallet.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CircleWallet.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CircleWalletType,
        default: CircleWalletType.DEV_CONTROLLED,
    }),
    __metadata("design:type", String)
], CircleWallet.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], CircleWallet.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CircleWallet.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CircleWallet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CircleWallet.prototype, "updatedAt", void 0);
exports.CircleWallet = CircleWallet = __decorate([
    (0, typeorm_1.Entity)('circle_wallets')
], CircleWallet);
//# sourceMappingURL=circle-wallet.entity.js.map