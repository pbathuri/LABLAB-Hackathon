import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationService } from '../src/modules/verification/verification.service';
import { VerificationLog } from '../src/modules/verification/entities/verification-log.entity';
import { VerifierNode } from '../src/modules/verification/entities/verifier-node.entity';

describe('VerificationService', () => {
  let service: VerificationService;
  let verificationLogRepository: Repository<VerificationLog>;
  let verifierNodeRepository: Repository<VerifierNode>;

  const mockVerificationLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockVerifierNodeRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getRepositoryToken(VerificationLog),
          useValue: mockVerificationLogRepository,
        },
        {
          provide: getRepositoryToken(VerifierNode),
          useValue: mockVerifierNodeRepository,
        },
      ],
    }).compile();

    service = module.get<VerificationService>(VerificationService);
    verificationLogRepository = module.get<Repository<VerificationLog>>(
      getRepositoryToken(VerificationLog),
    );
    verifierNodeRepository = module.get<Repository<VerifierNode>>(
      getRepositoryToken(VerifierNode),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyTransaction', () => {
    it('should reach consensus with 7+ signatures', async () => {
      mockVerificationLogRepository.create.mockReturnValue({});
      mockVerificationLogRepository.save.mockResolvedValue({});

      const request = {
        type: 'TRANSFER',
        userId: 'user-123',
        amount: 100,
        recipient: '0xabc...',
        parameters: {},
      };

      const result = await service.verifyTransaction(request);

      expect(result).toBeDefined();
      expect(result.verificationId).toBeDefined();
      expect(result.requestHash).toBeDefined();
      expect(result.requiredSignatures).toBe(7);
      
      // Should have attempted to collect signatures
      expect(mockVerificationLogRepository.save).toHaveBeenCalled();
    });

    it('should generate unique verification IDs', async () => {
      mockVerificationLogRepository.create.mockReturnValue({});
      mockVerificationLogRepository.save.mockResolvedValue({});

      const request = {
        type: 'TRANSFER',
        userId: 'user-123',
        amount: 100,
        parameters: {},
      };

      const result1 = await service.verifyTransaction(request);
      const result2 = await service.verifyTransaction(request);

      expect(result1.verificationId).not.toBe(result2.verificationId);
    });
  });

  describe('getVerifierStatus', () => {
    it('should return correct BFT parameters', async () => {
      const status = await service.getVerifierStatus();

      expect(status.totalNodes).toBe(11);
      expect(status.faultTolerance).toBe(3);
      expect(status.requiredSignatures).toBe(7);
      expect(status.nodes).toHaveLength(11);
    });

    it('should return valid node addresses', async () => {
      const status = await service.getVerifierStatus();

      for (const node of status.nodes) {
        expect(node.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(node.reliability).toBeGreaterThanOrEqual(0.9);
        expect(node.reliability).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('aggregateSignatures', () => {
    it('should concatenate signatures in address order', () => {
      const signatures = [
        {
          verifierId: 'v1',
          address: '0xBBB...',
          signature: 'sig2',
          latencyMs: 50,
          timestamp: new Date(),
        },
        {
          verifierId: 'v2',
          address: '0xAAA...',
          signature: 'sig1',
          latencyMs: 40,
          timestamp: new Date(),
        },
      ];

      const aggregated = service.aggregateSignatures(signatures);

      expect(aggregated).toBe('sig1sig2');
    });
  });

  describe('checkVerification', () => {
    it('should return invalid for non-existent verification', async () => {
      mockVerificationLogRepository.findOne.mockResolvedValue(null);

      const result = await service.checkVerification('non-existent-id');

      expect(result.valid).toBe(false);
      expect(result.verificationLog).toBeUndefined();
    });

    it('should return valid for successful verification', async () => {
      const mockLog = {
        verificationId: 'vrf_123',
        consensusReached: true,
        signatureCount: 8,
      };
      mockVerificationLogRepository.findOne.mockResolvedValue(mockLog);

      const result = await service.checkVerification('vrf_123');

      expect(result.valid).toBe(true);
      expect(result.verificationLog).toEqual(mockLog);
    });
  });
});
