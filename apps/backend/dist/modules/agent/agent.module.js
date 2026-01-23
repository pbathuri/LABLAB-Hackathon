"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_service_1 = require("./agent.service");
const agent_controller_1 = require("./agent.controller");
const gemini_service_1 = require("./services/gemini.service");
const agent_decision_entity_1 = require("./entities/agent-decision.entity");
const verification_module_1 = require("../verification/verification.module");
const quantum_module_1 = require("../quantum/quantum.module");
const policy_module_1 = require("../policy/policy.module");
let AgentModule = class AgentModule {
};
exports.AgentModule = AgentModule;
exports.AgentModule = AgentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([agent_decision_entity_1.AgentDecision]),
            verification_module_1.VerificationModule,
            quantum_module_1.QuantumModule,
            policy_module_1.PolicyModule,
        ],
        controllers: [agent_controller_1.AgentController],
        providers: [agent_service_1.AgentService, gemini_service_1.GeminiService],
        exports: [agent_service_1.AgentService, gemini_service_1.GeminiService],
    })
], AgentModule);
//# sourceMappingURL=agent.module.js.map