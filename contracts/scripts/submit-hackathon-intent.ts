/**
 * Validate (and optionally record) a trade intent against HACKATHON_RISK_ROUTER.
 * Assumes the sandbox router matches RiskRouter.sol ABI (validateIntent / recordTradeExecution).
 *
 * Usage:
 *   cd contracts && npx ts-node --transpile-only scripts/submit-hackathon-intent.ts
 *   RECORD=1 npx ts-node --transpile-only scripts/submit-hackathon-intent.ts
 *
 * Env: BASE_SEPOLIA_RPC, AGENT_PRIVATE_KEY, HACKATHON_RISK_ROUTER,
 *      MOCK_USDC_ADDRESS, MOCK_WETH_ADDRESS, optional AMOUNT_USDC (default 1000000 = 1 USDC 6dp)
 */
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const RISK_ROUTER_ABI = [
  'function validateIntent((address agent,address tokenIn,address tokenOut,uint256 amountIn,uint256 minAmountOut,uint256 deadline,bytes32 strategyHash,uint256 portfolioNav) intent) view returns (bool,string)',
  'function recordTradeExecution(address agent,uint256 amountIn,uint256 amountOut,bytes32 intentHash,uint256 portfolioNavAfter)',
];

async function main() {
  const rpc =
    process.env.BASE_SEPOLIA_RPC?.trim() || 'https://sepolia.base.org';
  const pk = process.env.AGENT_PRIVATE_KEY?.trim();
  const routerAddr = process.env.HACKATHON_RISK_ROUTER?.trim();
  const usdc = process.env.MOCK_USDC_ADDRESS?.trim();
  const weth = process.env.MOCK_WETH_ADDRESS?.trim();
  if (!pk || !routerAddr || !usdc || !weth) {
    throw new Error(
      'Set AGENT_PRIVATE_KEY, HACKATHON_RISK_ROUTER, MOCK_USDC_ADDRESS, MOCK_WETH_ADDRESS',
    );
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const read = new ethers.Contract(routerAddr, RISK_ROUTER_ABI, provider);
  const write = new ethers.Contract(routerAddr, RISK_ROUTER_ABI, wallet);

  const amountIn = BigInt(process.env.AMOUNT_USDC ?? '1000000');
  const portfolioNav = BigInt(process.env.PORTFOLIO_NAV_MICRO ?? '10000000000');
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);
  const intent = {
    agent: wallet.address,
    tokenIn: usdc,
    tokenOut: weth,
    amountIn,
    minAmountOut: 1n,
    deadline,
    strategyHash: ethers.ZeroHash,
    portfolioNav,
  };

  const [valid, reason] = await read.validateIntent(intent);
  console.log('validateIntent:', valid, String(reason));
  if (!valid) {
    process.exit(1);
  }

  const intentHash = ethers.solidityPackedKeccak256(
    [
      'address',
      'address',
      'address',
      'uint256',
      'uint256',
      'uint256',
      'bytes32',
      'uint256',
    ],
    [
      intent.agent,
      intent.tokenIn,
      intent.tokenOut,
      intent.amountIn,
      intent.minAmountOut,
      intent.deadline,
      intent.strategyHash,
      intent.portfolioNav,
    ],
  );

  if (process.env.RECORD === '1' || process.env.RECORD === 'true') {
    const tx = await write.recordTradeExecution(
      wallet.address,
      amountIn,
      amountIn,
      intentHash,
      portfolioNav,
    );
    console.log('recordTradeExecution tx:', tx.hash);
    await tx.wait();
    console.log('Mined.');
  } else {
    console.log('Set RECORD=1 to send recordTradeExecution (requires AGENT_ROLE on router).');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
