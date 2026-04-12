/**
 * Standalone ERC-8004 identity registration (same flow as POST /api/identity/register).
 * Usage:
 *   cd contracts && npm run register:erc8004 -- 'https://example.com/agent-card.json'
 * Loads env from ../../.env (repo root) and contracts/.env if present.
 */
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const IDENTITY_ABI = [
  'function register(string agentURI) external returns (uint256)',
];

async function main() {
  const agentURI = process.argv[2] ?? process.env.AGENT_CARD_URI;
  if (!agentURI?.trim()) {
    console.error('Usage: npm run register:erc8004 -- <agentURI>');
    process.exit(1);
  }

  const rpc =
    process.env.BASE_SEPOLIA_RPC?.trim() || 'https://sepolia.base.org';
  const pk = process.env.AGENT_PRIVATE_KEY?.trim();
  const registry = process.env.ERC8004_IDENTITY_REGISTRY?.trim();

  if (!pk || !registry) {
    throw new Error(
      'Set AGENT_PRIVATE_KEY and ERC8004_IDENTITY_REGISTRY in .env (repo root).',
    );
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const c = new ethers.Contract(registry, IDENTITY_ABI, wallet);

  console.log('Wallet:', wallet.address);
  console.log('Registry:', registry);
  console.log('URI:', agentURI);

  const tx = await c.register(agentURI);
  console.log('Submitted:', tx.hash);
  const receipt = await tx.wait();
  if (!receipt) throw new Error('No receipt');

  const transferTopic = ethers.id(
    'Transfer(address,address,uint256)',
  );
  const iface = new ethers.Interface([
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  ]);
  for (const log of receipt.logs) {
    if (log.topics[0] !== transferTopic) continue;
    try {
      const parsed = iface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      if (parsed?.name === 'Transfer') {
        console.log('Agent ID (token):', parsed.args.tokenId.toString());
        break;
      }
    } catch {
      /* next */
    }
  }
  console.log('Done. Tx:', receipt.hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
