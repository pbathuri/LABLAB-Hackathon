import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  console.log("MockUSDC:", await usdc.getAddress());

  const MockWETH = await ethers.getContractFactory("MockWETH");
  const weth = await MockWETH.deploy();
  await weth.waitForDeployment();
  console.log("MockWETH:", await weth.getAddress());

  const RiskRouter = await ethers.getContractFactory("RiskRouter");
  const router = await RiskRouter.deploy();
  await router.waitForDeployment();
  console.log("RiskRouter:", await router.getAddress());

  const CapitalVault = await ethers.getContractFactory("CapitalVault");
  const vault = await CapitalVault.deploy(await usdc.getAddress());
  await vault.waitForDeployment();
  console.log("CapitalVault:", await vault.getAddress());

  const agentAddress = process.env.AGENT_PRIVATE_KEY
    ? new ethers.Wallet(process.env.AGENT_PRIVATE_KEY).address
    : deployer.address;

  await (await usdc.mint(agentAddress, ethers.parseUnits("10000", 6))).wait();

  await (await router.setAllowedToken(await usdc.getAddress(), true)).wait();
  await (await router.setAllowedToken(await weth.getAddress(), true)).wait();

  const riskParams = {
    maxPositionSizeBps: 500n,
    maxDailyVolumeBps: 2000n,
    maxSlippageBps: 100n,
    maxDrawdownBps: 1000n,
    cooldownSeconds: 30n,
    active: true,
  };

  await (await router.setRiskParams(agentAddress, riskParams)).wait();

  const AGENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AGENT_ROLE"));
  await (await router.grantRole(AGENT_ROLE, agentAddress)).wait();

  const now = BigInt(Math.floor(Date.now() / 1000));
  await (
    await vault.registerAgent(agentAddress, now, now + 7n * 24n * 3600n)
  ).wait();

  console.log("\n--- DEPLOYMENT COMPLETE ---");
  console.log("Set in root .env:");
  console.log(`MOCK_USDC_ADDRESS=${await usdc.getAddress()}`);
  console.log(`MOCK_WETH_ADDRESS=${await weth.getAddress()}`);
  console.log(`RISK_ROUTER_ADDRESS=${await router.getAddress()}`);
  console.log(`CAPITAL_VAULT_ADDRESS=${await vault.getAddress()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
