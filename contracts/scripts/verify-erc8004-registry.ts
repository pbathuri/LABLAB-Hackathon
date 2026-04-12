/**
 * Read-only: check which ERC-8004 Identity Registry candidates have bytecode on Base Sepolia.
 * Usage: cd contracts && npm run verify:erc8004-registry
 */
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../.env') });

const RPC = process.env.BASE_SEPOLIA_RPC?.trim() || 'https://sepolia.base.org';

const CANDIDATES: { label: string; address: string }[] = [
  {
    label: '.env vanity (confirm on-chain — may be Ethereum Sepolia, not Base)',
    address:
      process.env.ERC8004_IDENTITY_REGISTRY?.trim() ||
      '0x8004A818BFB912233c491871b3d84c89A494BD9e',
  },
  {
    label: 'Alternate Base Sepolia candidate (verify via ERC-8004 / hackathon docs)',
    address: '0x7177a6867296406881E20d6647232314736Dd09A',
  },
];

const TEST_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
];

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  console.log('RPC:', RPC);
  for (const c of CANDIDATES) {
    console.log(`\n--- ${c.label} ---`);
    console.log('Address:', c.address);
    try {
      const code = await provider.getCode(c.address);
      if (code === '0x') {
        console.log('No contract at this address.');
        continue;
      }
      console.log('Bytecode present, length:', code.length);
      const contract = new ethers.Contract(c.address, TEST_ABI, provider);
      try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        const supply = await contract.totalSupply();
        console.log(`name: ${name}, symbol: ${symbol}, totalSupply: ${supply}`);
      } catch (e) {
        console.log(
          'Could not read ERC-721-style metadata:',
          e instanceof Error ? e.message : e,
        );
      }
    } catch (e) {
      console.log('Error:', e instanceof Error ? e.message : e);
    }
  }
  console.log(
    '\nUse the address with deployed bytecode for ERC8004_IDENTITY_REGISTRY in root .env.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
