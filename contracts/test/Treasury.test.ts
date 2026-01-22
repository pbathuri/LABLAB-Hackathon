import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CaptainWhiskersTreasury, MockUSDC, BFTVerification } from "../typechain-types";

describe("CaptainWhiskersTreasury", function () {
  let treasury: CaptainWhiskersTreasury;
  let usdc: MockUSDC;
  let bftVerification: BFTVerification;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let recipient: SignerWithAddress;
  let verifiers: SignerWithAddress[];

  const INITIAL_BALANCE = ethers.parseUnits("10000", 6); // 10,000 USDC

  beforeEach(async function () {
    [owner, user, recipient, ...verifiers] = await ethers.getSigners();
    
    // Ensure we have 11 verifiers
    while (verifiers.length < 11) {
      const wallet = ethers.Wallet.createRandom().connect(ethers.provider);
      verifiers.push(wallet as unknown as SignerWithAddress);
    }
    verifiers = verifiers.slice(0, 11);

    // Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    // Deploy BFTVerification
    const BFTVerification = await ethers.getContractFactory("BFTVerification");
    bftVerification = await BFTVerification.deploy(
      verifiers.map((v) => v.address)
    );

    // Deploy Treasury
    const Treasury = await ethers.getContractFactory("CaptainWhiskersTreasury");
    treasury = await Treasury.deploy(
      await usdc.getAddress(),
      await bftVerification.getAddress()
    );

    // Mint USDC to user
    await usdc.faucet(user.address, INITIAL_BALANCE);
    
    // Approve treasury
    await usdc.connect(user).approve(await treasury.getAddress(), INITIAL_BALANCE);
  });

  describe("Deposits", function () {
    it("Should allow deposits", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);
      
      await treasury.connect(user).deposit(depositAmount);
      
      expect(await treasury.getBalance(user.address)).to.equal(depositAmount);
    });

    it("Should emit Deposit event", async function () {
      const depositAmount = ethers.parseUnits("1000", 6);
      
      await expect(treasury.connect(user).deposit(depositAmount))
        .to.emit(treasury, "Deposit")
        .withArgs(user.address, depositAmount);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await treasury.connect(user).deposit(ethers.parseUnits("1000", 6));
    });

    it("Should allow withdrawals", async function () {
      const withdrawAmount = ethers.parseUnits("500", 6);
      const balanceBefore = await usdc.balanceOf(user.address);
      
      await treasury.connect(user).withdraw(withdrawAmount);
      
      expect(await treasury.getBalance(user.address)).to.equal(
        ethers.parseUnits("500", 6)
      );
      expect(await usdc.balanceOf(user.address)).to.equal(
        balanceBefore + withdrawAmount
      );
    });

    it("Should revert for insufficient balance", async function () {
      const withdrawAmount = ethers.parseUnits("2000", 6);
      
      await expect(
        treasury.connect(user).withdraw(withdrawAmount)
      ).to.be.revertedWithCustomError(treasury, "InsufficientBalance");
    });
  });

  describe("Policy Configuration", function () {
    it("Should allow users to set policy", async function () {
      const maxTx = ethers.parseUnits("100", 6);
      const dailyCap = ethers.parseUnits("1000", 6);
      const cooldown = 60;
      
      await treasury.connect(user).setPolicy(maxTx, dailyCap, cooldown);
      
      const policy = await treasury.getPolicy(user.address);
      expect(policy.maxTransactionAmount).to.equal(maxTx);
      expect(policy.dailySpendingCap).to.equal(dailyCap);
      expect(policy.cooldownPeriod).to.equal(cooldown);
      expect(policy.isActive).to.be.true;
    });

    it("Should emit PolicyUpdated event", async function () {
      const maxTx = ethers.parseUnits("100", 6);
      const dailyCap = ethers.parseUnits("1000", 6);
      const cooldown = 60;
      
      await expect(treasury.connect(user).setPolicy(maxTx, dailyCap, cooldown))
        .to.emit(treasury, "PolicyUpdated");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause", async function () {
      await treasury.connect(owner).pause();
      
      await expect(
        treasury.connect(user).deposit(ethers.parseUnits("100", 6))
      ).to.be.revertedWithCustomError(treasury, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await treasury.connect(owner).pause();
      await treasury.connect(owner).unpause();
      
      await expect(
        treasury.connect(user).deposit(ethers.parseUnits("100", 6))
      ).to.not.be.reverted;
    });

    it("Should allow owner to update verification contract", async function () {
      const newAddress = ethers.Wallet.createRandom().address;
      
      await treasury.connect(owner).setVerificationContract(newAddress);
      
      expect(await treasury.verificationContract()).to.equal(newAddress);
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(
        treasury.connect(user).pause()
      ).to.be.revertedWithCustomError(treasury, "OwnableUnauthorizedAccount");
    });
  });
});

describe("BFTVerification", function () {
  let bftVerification: BFTVerification;
  let owner: SignerWithAddress;
  let verifiers: SignerWithAddress[];

  beforeEach(async function () {
    [owner, ...verifiers] = await ethers.getSigners();
    verifiers = verifiers.slice(0, 11);

    const BFTVerification = await ethers.getContractFactory("BFTVerification");
    bftVerification = await BFTVerification.deploy(
      verifiers.map((v) => v.address)
    );
  });

  describe("Initialization", function () {
    it("Should have correct constants", async function () {
      expect(await bftVerification.TOTAL_VERIFIERS()).to.equal(11);
      expect(await bftVerification.REQUIRED_SIGNATURES()).to.equal(7);
    });

    it("Should register all verifiers", async function () {
      for (let i = 0; i < 11; i++) {
        expect(await bftVerification.isVerifier(verifiers[i].address)).to.be.true;
      }
    });
  });

  describe("Verification", function () {
    it("Should verify with 7+ valid signatures", async function () {
      const verificationId = ethers.id("test-verification-1");
      const requestHash = ethers.id("test-request-hash");
      
      // Sign with 7 verifiers
      const signatures: string[] = [];
      for (let i = 0; i < 7; i++) {
        const sig = await verifiers[i].signMessage(ethers.getBytes(requestHash));
        signatures.push(sig);
      }
      
      const concatenatedSigs = ethers.concat(signatures);
      
      await expect(
        bftVerification.verifyConsensus(verificationId, requestHash, concatenatedSigs)
      ).to.emit(bftVerification, "ConsensusVerified");
      
      const [valid, count] = await bftVerification.checkVerification(verificationId);
      expect(valid).to.be.true;
      expect(count).to.equal(7);
    });

    it("Should fail with less than 7 signatures", async function () {
      const verificationId = ethers.id("test-verification-2");
      const requestHash = ethers.id("test-request-hash-2");
      
      // Sign with only 5 verifiers
      const signatures: string[] = [];
      for (let i = 0; i < 5; i++) {
        const sig = await verifiers[i].signMessage(ethers.getBytes(requestHash));
        signatures.push(sig);
      }
      
      const concatenatedSigs = ethers.concat(signatures);
      
      await expect(
        bftVerification.verifyConsensus(verificationId, requestHash, concatenatedSigs)
      ).to.be.revertedWithCustomError(bftVerification, "InvalidSignatureCount");
    });

    it("Should reject duplicate verification IDs", async function () {
      const verificationId = ethers.id("test-verification-3");
      const requestHash = ethers.id("test-request-hash-3");
      
      const signatures: string[] = [];
      for (let i = 0; i < 7; i++) {
        const sig = await verifiers[i].signMessage(ethers.getBytes(requestHash));
        signatures.push(sig);
      }
      
      const concatenatedSigs = ethers.concat(signatures);
      
      await bftVerification.verifyConsensus(verificationId, requestHash, concatenatedSigs);
      
      await expect(
        bftVerification.verifyConsensus(verificationId, requestHash, concatenatedSigs)
      ).to.be.revertedWithCustomError(bftVerification, "NonceAlreadyUsed");
    });
  });

  describe("Admin", function () {
    it("Should allow owner to replace verifier", async function () {
      const newVerifier = ethers.Wallet.createRandom().address;
      
      await bftVerification.connect(owner).replaceVerifier(0, newVerifier);
      
      expect(await bftVerification.isVerifier(newVerifier)).to.be.true;
      expect(await bftVerification.isVerifier(verifiers[0].address)).to.be.false;
    });
  });
});
