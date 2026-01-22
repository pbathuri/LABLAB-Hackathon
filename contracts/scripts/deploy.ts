import { ethers } from "hardhat";

async function main() {
  console.log("🐱 Deploying Captain Whiskers contracts to Arc...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // USDC address on Arc testnet (or deploy mock)
  let usdcAddress = process.env.USDC_ADDRESS;
  
  if (!usdcAddress) {
    console.log("\n📝 Deploying Mock USDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUsdc = await MockUSDC.deploy();
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    console.log("Mock USDC deployed to:", usdcAddress);
  }

  // Generate verifier addresses (in production, these would be real node addresses)
  console.log("\n🔐 Generating verifier addresses...");
  const verifiers: string[] = [];
  for (let i = 0; i < 11; i++) {
    const wallet = ethers.Wallet.createRandom();
    verifiers.push(wallet.address);
    console.log(`  Verifier ${i + 1}: ${wallet.address}`);
  }

  // Deploy BFT Verification contract
  console.log("\n🛡️ Deploying BFT Verification contract...");
  const BFTVerification = await ethers.getContractFactory("BFTVerification");
  const bftVerification = await BFTVerification.deploy(verifiers);
  await bftVerification.waitForDeployment();
  const bftAddress = await bftVerification.getAddress();
  console.log("BFTVerification deployed to:", bftAddress);

  // Deploy Treasury contract
  console.log("\n💰 Deploying Captain Whiskers Treasury...");
  const Treasury = await ethers.getContractFactory("CaptainWhiskersTreasury");
  const treasury = await Treasury.deploy(usdcAddress, bftAddress);
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed to:", treasuryAddress);

  // Deploy X402 Escrow contract
  console.log("\n🔄 Deploying X402 Escrow...");
  const X402Escrow = await ethers.getContractFactory("X402Escrow");
  const escrow = await X402Escrow.deploy(usdcAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("X402Escrow deployed to:", escrowAddress);

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("🎉 Deployment Complete!");
  console.log("=".repeat(50));
  console.log("\nContract Addresses:");
  console.log(`  USDC:           ${usdcAddress}`);
  console.log(`  BFTVerification: ${bftAddress}`);
  console.log(`  Treasury:        ${treasuryAddress}`);
  console.log(`  X402Escrow:      ${escrowAddress}`);
  console.log("\nVerifier Addresses:");
  verifiers.forEach((v, i) => console.log(`  ${i + 1}. ${v}`));
  
  console.log("\n📋 Add these to your .env file:");
  console.log(`USDC_ADDRESS=${usdcAddress}`);
  console.log(`BFT_VERIFICATION_ADDRESS=${bftAddress}`);
  console.log(`TREASURY_ADDRESS=${treasuryAddress}`);
  console.log(`X402_ESCROW_ADDRESS=${escrowAddress}`);

  // Verify on ArcScan if API key available
  if (process.env.ARCSCAN_API_KEY) {
    console.log("\n🔍 Verifying contracts on ArcScan...");
    // Add verification logic here
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
