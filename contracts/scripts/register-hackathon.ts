/**
 * ONE-TIME REGISTRATION — Sepolia hackathon AgentRegistry + HackathonVault.
 *
 * Usage:
 *   cd contracts && npm run register:hackathon
 *
 * Env: AGENT_PRIVATE_KEY, SEPOLIA_RPC_URL (optional)
 */
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const AGENT_REGISTRY_ADDRESS =
  "0x97b07dDc405B0c28B17559aFFE63BdB3632d0ca3";
const HACKATHON_VAULT_ADDRESS =
  "0x0E7CD8ef9743FEcf94f9103033a044caBD45fC90";
const RISK_ROUTER_ADDRESS = "0xd6A6952545FF6E6E6681c2d15C59f9EB8F40FdBC";

const AGENT_REGISTRY_ABI = [
  "function register(address agentWallet, string name, string description, string[] capabilities, string agentURI) external returns (uint256 agentId)",
  "function isRegistered(uint256 agentId) external view returns (bool)",
  "event AgentRegistered(uint256 indexed agentId, address indexed operatorWallet, address indexed agentWallet, string name)",
];

const VAULT_ABI = [
  "function claimAllocation(uint256 agentId) external",
  "function hasClaimed(uint256 agentId) external view returns (bool)",
];

const RISK_ROUTER_ABI = [
  "function getIntentNonce(uint256 agentId) external view returns (uint256)",
];

async function main() {
  const rpc =
    process.env.SEPOLIA_RPC_URL?.trim() ||
    process.env.SEPOLIA_RPC?.trim() ||
    "https://ethereum-sepolia-rpc.publicnode.com";

  const pk = process.env.AGENT_PRIVATE_KEY?.trim();
  if (!pk || pk.length < 64) {
    throw new Error(
      "AGENT_PRIVATE_KEY not set or invalid. Generate: node -e \"const {ethers}=require('ethers');const w=ethers.Wallet.createRandom();console.log(w.privateKey,w.address)\"",
    );
  }

  const normalizedPk = pk.startsWith("0x") ? pk : `0x${pk}`;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(normalizedPk, provider);
  const agentRegistry = new ethers.Contract(
    AGENT_REGISTRY_ADDRESS,
    AGENT_REGISTRY_ABI,
    wallet,
  );
  const vault = new ethers.Contract(HACKATHON_VAULT_ADDRESS, VAULT_ABI, wallet);
  const riskRouter = new ethers.Contract(
    RISK_ROUTER_ADDRESS,
    RISK_ROUTER_ABI,
    provider,
  );

  console.log("═══════════════════════════════════════════════════════");
  console.log("  Captain Whiskers V2 — Hackathon Registration Script  ");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  Chain:   Sepolia (11155111)`);
  console.log(`  RPC:     ${rpc}`);
  console.log(`  Wallet:  ${wallet.address}`);
  console.log("");

  const balance = await provider.getBalance(wallet.address);
  console.log(`  ETH balance: ${ethers.formatEther(balance)} ETH`);
  if (balance < ethers.parseEther("0.005")) {
    console.warn("  Low balance! Need at least ~0.005 ETH on Sepolia.");
    console.warn(
      "  Faucets: https://sepoliafaucet.com | https://faucets.chain.link/sepolia",
    );
  }

  console.log("\n[Step 1] Registering on AgentRegistry…");
  let agentId: string | null = null;

  try {
    const tx = await agentRegistry.register(
      wallet.address,
      "Captain Whiskers V2",
      "Quantum-aware autonomous AI trading agent. ERC-8004 identity, Gemini-powered decisions, EIP-712 signed intents, Byzantine fault-tolerant verification. Risk-adjusted position sizing with multi-layer drawdown protection.",
      [
        "trading",
        "eip712-signing",
        "btc-analysis",
        "eth-analysis",
        "sol-analysis",
        "risk-management",
      ],
      "https://raw.githubusercontent.com/pbathuri/LABLAB-Hackathon/main/docs/agent-card.json",
    );
    console.log(`  TX sent: ${tx.hash}`);
    const receipt = await tx.wait();

    for (const log of receipt!.logs) {
      try {
        const parsed = agentRegistry.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (parsed?.name === "AgentRegistered") {
          agentId = parsed.args.agentId.toString();
          break;
        }
      } catch {
        /* skip */
      }
    }

    if (agentId) {
      console.log(`  ✅ REGISTERED! Agent ID: ${agentId}`);
    } else {
      console.warn(
        "  Could not parse agentId from receipt — check tx on Etherscan",
      );
    }
  } catch (err: unknown) {
    const msg = String((err as { message?: string })?.message || err);
    if (msg.includes("already registered") || msg.includes("AlreadyRegistered")) {
      console.log("  Already registered on-chain. Recovering agentId from logs…");
      agentId = await recoverAgentId(provider, agentRegistry, wallet.address);
      if (agentId) {
        console.log(`  ✅ Recovered Agent ID: ${agentId}`);
      } else {
        console.error("  Could not recover agentId. Check logs manually.");
        process.exit(1);
      }
    } else {
      console.error(`  Registration failed: ${msg}`);
      process.exit(1);
    }
  }

  if (!agentId) {
    console.error("No agentId — cannot continue.");
    process.exit(1);
  }

  console.log("\n[Step 2] Claiming vault allocation…");
  try {
    const claimed = await vault.hasClaimed(BigInt(agentId));
    if (claimed) {
      console.log("  Already claimed.");
    } else {
      const tx = await vault.claimAllocation(BigInt(agentId));
      console.log(`  TX sent: ${tx.hash}`);
      await tx.wait();
      console.log("  ✅ Vault allocation claimed!");
    }
  } catch (err: unknown) {
    const msg = String((err as { message?: string })?.message || err);
    if (msg.includes("already claimed")) {
      console.log("  Already claimed (on-chain).");
    } else {
      console.warn(`  Claim failed: ${msg} (non-fatal)`);
    }
  }

  console.log("\n[Step 3] Checking intent nonce…");
  try {
    const nonce = await riskRouter.getIntentNonce(BigInt(agentId));
    console.log(`  Current intent nonce: ${nonce}`);
  } catch (err) {
    console.warn(`  Could not read nonce: ${err}`);
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  ADD THESE TO YOUR .env FILE:                          ");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`HACKATHON_AGENT_ID=${agentId}`);
  console.log(`HACKATHON_AGENT_WALLET=${wallet.address}`);
  console.log(`SEPOLIA_RPC_URL=${rpc}`);
  console.log("");
  console.log("  Etherscan:");
  console.log(`  https://sepolia.etherscan.io/address/${wallet.address}`);
  console.log("═══════════════════════════════════════════════════════\n");
}

async function recoverAgentId(
  provider: ethers.JsonRpcProvider,
  agentRegistry: ethers.Contract,
  walletAddress: string,
): Promise<string | null> {
  try {
    const eventSig = ethers.id(
      "AgentRegistered(uint256,address,address,string)",
    );
    const currentBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, currentBlock - 50000);
    const logs = await provider.getLogs({
      address: AGENT_REGISTRY_ADDRESS,
      fromBlock,
      toBlock: "latest",
      topics: [eventSig],
    });
    for (const log of logs) {
      try {
        const parsed = agentRegistry.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        if (
          parsed?.name === "AgentRegistered" &&
          parsed.args.agentWallet.toLowerCase() === walletAddress.toLowerCase()
        ) {
          return parsed.args.agentId.toString();
        }
      } catch {
        /* skip */
      }
    }
  } catch (err) {
    console.warn(`Recovery scan failed: ${err}`);
  }
  return null;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
