/**
 * Update ERC-8004 IdentityRegistry token URI for an existing agent.
 * Usage:
 *   cd contracts && npm run set:agent-uri -- 'https://raw.githubusercontent.com/.../agent-card.json'
 * Or pass agent id: npm run set:agent-uri -- <agentId> '<uri>'
 * Env: AGENT_PRIVATE_KEY, ERC8004_IDENTITY_REGISTRY, ERC8004_AGENT_ID (if one-arg URI form)
 */
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const ABI = ['function setAgentURI(uint256 agentId, string newURI) external'];

async function main() {
  const a = process.argv[2];
  const b = process.argv[3];
  let agentIdStr: string;
  let newUri: string;
  if (b != null && b.length > 0) {
    agentIdStr = a;
    newUri = b;
  } else {
    agentIdStr = process.env.ERC8004_AGENT_ID?.trim() ?? '';
    newUri = a ?? '';
  }
  if (!agentIdStr || !newUri?.trim()) {
    console.error(
      'Usage: npm run set:agent-uri -- <agentId> <newURI>\n   or: npm run set:agent-uri -- <newURI>  (uses ERC8004_AGENT_ID from .env)',
    );
    process.exit(1);
  }

  const rpc =
    process.env.BASE_SEPOLIA_RPC?.trim() || 'https://sepolia.base.org';
  const pk = process.env.AGENT_PRIVATE_KEY?.trim();
  const registry = process.env.ERC8004_IDENTITY_REGISTRY?.trim();
  if (!pk || !registry) {
    throw new Error(
      'Set AGENT_PRIVATE_KEY and ERC8004_IDENTITY_REGISTRY in .env',
    );
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const c = new ethers.Contract(registry, ABI, wallet);
  const agentId = BigInt(agentIdStr);

  console.log('Wallet:', wallet.address);
  console.log('Agent ID:', agentId.toString());
  console.log('New URI:', newUri);

  const tx = await c.setAgentURI(agentId, newUri);
  console.log('Submitted:', tx.hash);
  const receipt = await tx.wait();
  console.log('Done. Block:', receipt?.blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
