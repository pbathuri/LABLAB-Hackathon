/**
 * Upload docs/agent-card.json (or inline object) to Pinata IPFS.
 * Requires PINATA_JWT in .env (Bearer token from Pinata dashboard).
 * Usage: cd contracts && npm run upload:agent-card
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const jwt = process.env.PINATA_JWT?.trim();
  if (!jwt) {
    throw new Error('Set PINATA_JWT in .env (Pinata → API Keys → JWT)');
  }

  const cardPath = path.resolve(__dirname, '../../docs/agent-card.json');
  const raw = fs.readFileSync(cardPath, 'utf8');
  const pinataContent = JSON.parse(raw) as Record<string, unknown>;

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent,
      pinataMetadata: { name: 'captain-whiskers-v2-agent-card' },
    }),
  });

  const body = (await res.json()) as { IpfsHash?: string; error?: unknown };
  if (!res.ok) {
    throw new Error(`Pinata error: ${res.status} ${JSON.stringify(body)}`);
  }
  const cid = body.IpfsHash;
  if (!cid) throw new Error('No IpfsHash in response');
  console.log('CID:', cid);
  console.log('ipfs://' + cid);
  console.log('Gateway:', `https://gateway.pinata.cloud/ipfs/${cid}`);
  console.log('\nUse the gateway or ipfs URL as agentURI when registering.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
