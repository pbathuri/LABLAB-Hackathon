import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyService } from '../src/modules/policy/policy.service';
import { PolicyConfig } from '../src/modules/policy/entities/policy-config.entity';

describe('PolicyService', () => {
  let service: PolicyService;
  let repository: Repository<PolicyConfig>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const defaultPolicy: Partial<PolicyConfig> = {
    userId: 'user-123',
    maxTransactionAmount: '50',
    dailySpendingCap: '500',
    currentDailySpend: '0',
    cooldownPeriodSeconds: 60,
    maxPriceDeviationPercent: '5',
    allowedAddresses: [],
    riskTolerance: '0.5',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyService,
        {
          provide: getRepositoryToken(PolicyConfig),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PolicyService>(PolicyService);
    repository = module.get<Repository<PolicyConfig>>(
      getRepositoryToken(PolicyConfig),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateDecision', () => {
    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue({ ...defaultPolicy });
      mockRepository.create.mockReturnValue({ ...defaultPolicy });
      mockRepository.save.mockResolvedValue({ ...defaultPolicy });
    });

    it('should pass validation for amount within limit', async () => {
      const decision = {
        type: 'TRANSFER',
        parameters: { amount: 25 },
      };

      const result = await service.validateDecision('user-123', decision);

      expect(result.valid).toBe(true);
      expect(result.checks.find((c) => c.name === 'per_transaction_limit')?.passed).toBe(true);
    });

    it('should fail validation for amount exceeding limit', async () => {
      const decision = {
        type: 'TRANSFER',
        parameters: { amount: 100 },
      };

      const result = await service.validateDecision('user-123', decision);

      expect(result.valid).toBe(false);
      expect(result.checks.find((c) => c.name === 'per_transaction_limit')?.passed).toBe(false);
    });

    it('should fail validation when daily cap would be exceeded', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...defaultPolicy,
        currentDailySpend: '480',
      });

      const decision = {
        type: 'TRANSFER',
        parameters: { amount: 30 },
      };

      const result = await service.validateDecision('user-123', decision);

      expect(result.valid).toBe(false);
      expect(result.checks.find((c) => c.name === 'daily_spending_cap')?.passed).toBe(false);
    });

    it('should fail validation during cooldown period', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...defaultPolicy,
        lastTradeTimestamp: new Date(),
      });

      const decision = {
        type: 'TRANSFER',
        parameters: { amount: 25 },
      };

      const result = await service.validateDecision('user-123', decision);

      expect(result.valid).toBe(false);
      expect(result.checks.find((c) => c.name === 'cooldown_period')?.passed).toBe(false);
    });

    it('should pass cooldown check when enough time has passed', async () => {
      const pastTime = new Date(Date.now() - 120000); // 2 minutes ago
      mockRepository.findOne.mockResolvedValue({
        ...defaultPolicy,
        lastTradeTimestamp: pastTime,
      });

      const decision = {
        type: 'TRANSFER',
        parameters: { amount: 25 },
      };

      const result = await service.validateDecision('user-123', decision);

      expect(result.checks.find((c) => c.name === 'cooldown_period')?.passed).toBe(true);
    });

    it('should fail allowlist check for unauthorized address', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...defaultPolicy,
        allowedAddresses: ['0xabc123'],
      });

      const decision = {
        type: 'TRANSFER',
        parameters: {
          amount: 25,
          targetAddress: '0xdef456',
        },
      };

      const result = await service.validateDecision('user-123', decision);

      expect(result.valid).toBe(false);
      expect(result.checks.find((c) => c.name === 'allowlist')?.passed).toBe(false);
    });

    it('should pass allowlist check for authorized address', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...defaultPolicy,
        allowedAddresses: ['0xabc123'],
      });

      const decision = {
        type: 'TRANSFER',
        parameters: {
          amount: 25,
          targetAddress: '0xabc123',
        },
      };

      const result = await service.validateDecision('user-123', decision);

      expect(result.checks.find((c) => c.name === 'allowlist')?.passed).toBe(true);
    });
  });

  describe('recordTransaction', () => {
    it('should update daily spend', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...defaultPolicy,
        currentDailySpend: '100',
      });
      mockRepository.save.mockResolvedValue({});

      await service.recordTransaction('user-123', 50);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentDailySpend: '150',
        }),
      );
    });
  });
});
