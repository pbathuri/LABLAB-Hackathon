/**
 * Post baseline reputation to ERC-8004 Reputation Registry (matches backend erc8004.service).
 * Requires ERC8004_AGENT_ID or reads from DB — here uses env ERC8004_AGENT_ID.
 * Usage: cd contracts && npm run post:reputation
 */
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const REPUTATION_ABI = [
  'function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external',
];

async function main() {
  const rpc = process.env.BASE_SEPOLIA_RPC?.trim() || 'https://sepolia.base.org';
  const pk = process.env.AGENT_PRIVATE_KEY?.trim();
  const rep = process.env.ERC8004_REPUTATION_REGISTRY?.trim();
  const agentIdRaw = process.env.ERC8004_AGENT_ID?.trim();

  if (!pk || !rep) {
    throw new Error('Set AGENT_PRIVATE_KEY and ERC8004_REPUTATION_REGISTRY in .env');
  }
  if (!agentIdRaw) {
    throw new Error(
      'Set ERC8004_AGENT_ID (uint) in .env after identity registration, or pass as argv[2]',
    );
  }

  const agentId = BigInt(process.argv[2] || agentIdRaw);
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const c = new ethers.Contract(rep, REPUTATION_ABI, wallet);

  console.log('Agent ID:', agentId.toString());
  console.log('Wallet:', wallet.address);

  const tx1 = await c.giveFeedback(
    agentId,
    0,
    1,
    'tradingYield',
    'initialization',
    '',
    '',
    ethers.ZeroHash,
  );
  console.log('PnL feedback tx:', tx1.hash);
  await tx1.wait();

  const tx2 = await c.giveFeedback(
    agentId,
    0,
    0,
    'successRate',
    'initialization',
    '',
    '',
    ethers.ZeroHash,
  );
  console.log('Win-rate feedback tx:', tx2.hash);
  await tx2.wait();
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
