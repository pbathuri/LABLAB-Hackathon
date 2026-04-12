import { expect } from "chai";
import { ethers } from "hardhat";

describe("RiskRouter", function () {
  it("validates intent with bps limits", async function () {
    const [deployer, agent] = await ethers.getSigners();
    const RiskRouter = await ethers.getContractFactory("RiskRouter");
    const router = await RiskRouter.deploy();
    await router.waitForDeployment();

    const tokenIn = ethers.Wallet.createRandom().address;
    const tokenOut = ethers.Wallet.createRandom().address;
    await router.setAllowedToken(tokenIn, true);
    await router.setAllowedToken(tokenOut, true);

    await router.setRiskParams(agent.address, {
      maxPositionSizeBps: 500n,
      maxDailyVolumeBps: 2000n,
      maxSlippageBps: 100n,
      maxDrawdownBps: 1000n,
      cooldownSeconds: 0n,
      active: true,
    });

    const nav = ethers.parseUnits("10000", 6);
    const intent = {
      agent: agent.address,
      tokenIn,
      tokenOut,
      amountIn: ethers.parseUnits("400", 6),
      minAmountOut: 1n,
      deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
      strategyHash: ethers.ZeroHash,
      portfolioNav: nav,
    };

    const [ok] = await router.validateIntent(intent);
    expect(ok).to.equal(true);
  });

  it("auto-halts agent when post-trade NAV drawdown exceeds maxDrawdownBps", async function () {
    const [deployer, agent] = await ethers.getSigners();
    const RiskRouter = await ethers.getContractFactory("RiskRouter");
    const router = await RiskRouter.deploy();
    await router.waitForDeployment();

    const tokenIn = ethers.Wallet.createRandom().address;
    const tokenOut = ethers.Wallet.createRandom().address;
    await router.setAllowedToken(tokenIn, true);
    await router.setAllowedToken(tokenOut, true);

    const maxDd = 1000n;
    await router.setRiskParams(agent.address, {
      maxPositionSizeBps: 5000n,
      maxDailyVolumeBps: 10000n,
      maxSlippageBps: 100n,
      maxDrawdownBps: maxDd,
      cooldownSeconds: 0n,
      active: true,
    });

    const AGENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AGENT_ROLE"));
    await router.grantRole(AGENT_ROLE, agent.address);

    const navHigh = ethers.parseUnits("10000", 6);
    await router
      .connect(agent)
      .recordTradeExecution(agent.address, 1n, 1n, ethers.ZeroHash, navHigh);

    const navLow = ethers.parseUnits("8800", 6);
    await router
      .connect(agent)
      .recordTradeExecution(agent.address, 1n, 1n, ethers.id("h2"), navLow);

    const st = await router.getAgentState(agent.address);
    expect(st.halted).to.equal(true);
  });
});
