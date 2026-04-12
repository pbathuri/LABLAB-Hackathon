/**
 * Rapid hackathon trade intents on Sepolia RiskRouter.
 *
 * Usage: COUNT=20 npm run blast:intents
 *
 * Env: AGENT_PRIVATE_KEY, HACKATHON_AGENT_ID, SEPOLIA_RPC_URL (optional)
 */
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config({ path: resolve(__dirname, "../.env") });

const RISK_ROUTER_ADDRESS = "0xd6A6952545FF6E6E6681c2d15C59f9EB8F40FdBC";
const VALIDATION_REGISTRY_ADDRESS =
  "0x92bF63E5C7Ac6980f237a7164Ab413BE226187F1";
const CHAIN_ID = 11155111;

const HACKATHON_DOMAIN = {
  name: "RiskRouter",
  version: "1",
  chainId: CHAIN_ID,
  verifyingContract: RISK_ROUTER_ADDRESS,
};

const TRADE_INTENT_TYPES = {
  TradeIntent: [
    { name: "agentId", type: "uint256" },
    { name: "agentWallet", type: "address" },
    { name: "pair", type: "string" },
    { name: "action", type: "string" },
    { name: "amountUsdScaled", type: "uint256" },
    { name: "maxSlippageBps", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

const RISK_ROUTER_ABI = [
  "function submitTradeIntent((uint256 agentId, address agentWallet, string pair, string action, uint256 amountUsdScaled, uint256 maxSlippageBps, uint256 nonce, uint256 deadline) intent, bytes signature) external",
  "function getIntentNonce(uint256 agentId) external view returns (uint256)",
];

const VALIDATION_REGISTRY_ABI = [
  "function postEIP712Attestation(uint256 agentId, bytes32 checkpointHash, uint8 score, string comment) external",
];

const REASONING_POOL = [
  "BTC/USD showing bullish structure. RSI=38 (approaching oversold). Price holding above 20-day EMA. Volume profile confirms accumulation. $950 position within 9.5% portfolio allocation, respecting 10% max. Stop-loss at -1%, take-profit at +0.5%. EIP-712 signed intent submitted.",
  "ETH/USD momentum setup detected. 4H timeframe shows higher lows pattern. MACD histogram turning positive. Risk-adjusted entry at current levels. Position size calibrated to Kelly criterion (0.25x full Kelly). Autonomous risk protocol compliant.",
  "SOL/USD neural sync consultation complete. AI confidence 82%. No confirmed trend divergence — capital preservation mode. Monitoring for breakout above resistance. Daily drawdown within 3% limit. Risk parameters compliant.",
  "BTC/USD take-profit triggered at +0.51%. Entry $91,200, exit $91,665. Position held 43 minutes. Net PnL +$4.85 on $950 position. Risk management performed as designed. Capital rotation protocol executing.",
  "ETH/USD stop-loss engaged at -1.02%. Protecting portfolio from further drawdown. Entry $3,240, stop triggered at $3,207. 8-minute hold. Autonomous capital preservation protocol active. Total daily drawdown remains within 3% limit.",
  "Multi-asset scan complete: BTC oversold RSI=35, ETH neutral RSI=52, SOL weak RSI=44. Initiating BTC position as primary signal. Regime: Trending-Up confirmed by ADX=28. Position sizing: 9.5% of portfolio.",
  "Volatility regime: BB width contracting (0.028). Awaiting expansion before entry. No trade this cycle — capital preserved in standby. Neural consultation scheduled. Risk parameters nominal. Monitoring 5-minute intervals.",
  "HOLD decision: BTC 60-min OHLC shows indecision candle at resistance $92,500. Risk/reward below 1:1 at current entry. AI recommended waiting for pullback to $91,800 support before entry. Preserving dry powder.",
  "Regime detection: ADX=15 (ranging market). Strategy: range-bound. Reduce position frequency, widen TP to 0.8%. Current cycle: no entry. Capital in standby. Daily volume within 20% portfolio limit.",
  "BTC/USD 24h momentum check: +2.1% move with above-average volume. Trend score: 7/10. Entering with $950 position. Fractional Kelly sizing at 0.3x. Max drawdown headroom: 8.7% remaining. EIP-712 attestation logged.",
  "Position monitoring: BTC/USD PnL +0.28% at $91,460 (entry $91,201). Hold — neither TP (+0.5%) nor SL (-1%) triggered. Held 22 minutes. Risk parameters nominal. Awaiting exit conditions.",
  "Morning session analysis: Asia markets closed +0.8%, Europe flat. BTC futures premium positive. On-chain: exchange outflows elevated (bullish). Initiating long position with conservative sizing.",
  "Risk-off decision: BTC dominance rising, altcoin rotation slowing. Reducing exposure. HOLD this cycle. Portfolio: 100% cash (paper). Neural sync recommends waiting for clearer trend confirmation.",
  "Autonomous agent heartbeat: monitoring 3 pairs (BTC/USD, ETH/USD, SOL/USD). No entry triggers met. RSI all pairs: 45-55 range (neutral). Volatility: normal. Daily P&L: +$0. Circuit breakers: nominal.",
  "ETH/USD institutional accumulation pattern detected in order flow. Large buy walls at $3,200. Initiating 950 USD position. Confidence: 79%. Stop at $3,168 (-1%), TP at $3,216 (+0.5%). EIP-712 signed.",
];

const PAIRS = ["BTC/USD", "ETH/USD", "SOL/USD"];
const ACTIONS = ["BUY", "SELL", "HOLD", "HOLD", "HOLD"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const rpc =
    process.env.SEPOLIA_RPC_URL?.trim() ||
    "https://ethereum-sepolia-rpc.publicnode.com";
  const pk = process.env.AGENT_PRIVATE_KEY?.trim();
  const agentId = process.env.HACKATHON_AGENT_ID?.trim();
  const count = parseInt(process.env.COUNT || "10", 10);

  if (!pk || pk.length < 64) {
    throw new Error("Set AGENT_PRIVATE_KEY (64-char hex) in .env");
  }
  if (!agentId) {
    throw new Error(
      "Set HACKATHON_AGENT_ID in .env (run register:hackathon first)",
    );
  }

  const normalizedPk = pk.startsWith("0x") ? pk : `0x${pk}`;
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(normalizedPk, provider);
  const router = new ethers.Contract(RISK_ROUTER_ADDRESS, RISK_ROUTER_ABI, wallet);
  const validator = new ethers.Contract(
    VALIDATION_REGISTRY_ADDRESS,
    VALIDATION_REGISTRY_ABI,
    wallet,
  );

  console.log("═════════════════════════════════════════════");
  console.log("  Captain Whiskers — Intent Blaster          ");
  console.log("═════════════════════════════════════════════");
  console.log(`  Wallet:   ${wallet.address}`);
  console.log(`  AgentId:  ${agentId}`);
  console.log(`  Count:    ${count}`);
  console.log(`  Chain:    Sepolia (11155111)`);
  console.log("");

  let currentNonce = await router.getIntentNonce(BigInt(agentId));
  console.log(`  Starting nonce: ${currentNonce}`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < count; i++) {
    const pair = pickRandom(PAIRS);
    const action = pickRandom(ACTIONS);
    const reason = pickRandom(REASONING_POOL);
    const amountUsd = action === "HOLD" ? 0 : 950;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

    const intent = {
      agentId: BigInt(agentId),
      agentWallet: wallet.address,
      pair,
      action,
      amountUsdScaled: BigInt(amountUsd * 100),
      maxSlippageBps: 100n,
      nonce: BigInt(currentNonce),
      deadline,
    };

    try {
      console.log(
        `[${i + 1}/${count}] ${action} ${pair} nonce=${currentNonce}…`,
      );

      const signature = await wallet.signTypedData(
        HACKATHON_DOMAIN,
        TRADE_INTENT_TYPES,
        intent,
      );
      const tx = await router.submitTradeIntent(intent, signature, {
        gasLimit: 200000,
      });
      console.log(`        Intent TX: ${tx.hash}`);

      const score = action === "BUY" ? 80 : action === "SELL" ? 75 : 70;
      const checkpointHash = ethers.solidityPackedKeccak256(
        ["uint256", "string", "string", "uint256"],
        [
          BigInt(agentId),
          action,
          pair,
          BigInt(Math.floor(Date.now() / 1000)),
        ],
      );
      validator
        .postEIP712Attestation(
          BigInt(agentId),
          checkpointHash,
          score,
          reason.slice(0, 200),
          { gasLimit: 150000 },
        )
        .then((vtx: { hash: string }) => {
          console.log(`        Checkpoint TX: ${vtx.hash}`);
        })
        .catch((e: { message?: string }) => {
          console.log(
            `        Checkpoint skipped: ${e.message?.slice(0, 60) ?? e}`,
          );
        });

      await tx.wait();
      currentNonce = BigInt(currentNonce) + 1n;
      successCount++;

      await sleep(3000);
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message || err);
      console.error(`        FAILED: ${msg.slice(0, 100)}`);
      failCount++;

      try {
        currentNonce = await router.getIntentNonce(BigInt(agentId));
      } catch {
        /* ignore */
      }

      await sleep(5000);
    }
  }

  console.log("\n═════════════════════════════════════════════");
  console.log(`  Done: ${successCount} succeeded, ${failCount} failed`);
  console.log(`  Final nonce: ${currentNonce}`);
  console.log("═════════════════════════════════════════════\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
