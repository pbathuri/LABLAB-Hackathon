/** Prefer explicit URL; else BASE_SEPOLIA_RPC_URL alias; else Alchemy trial key; else public Base Sepolia RPC. */
export function resolveBaseSepoliaRpc(): string {
  const explicit = process.env.BASE_SEPOLIA_RPC?.trim();
  if (explicit) return explicit;
  const urlAlias = process.env.BASE_SEPOLIA_RPC_URL?.trim();
  if (urlAlias) return urlAlias;
  const alchemy = process.env.ALCHEMY_API_KEY?.trim();
  if (alchemy) return `https://base-sepolia.g.alchemy.com/v2/${alchemy}`;
  return 'https://sepolia.base.org';
}

/** Ensures services reading `process.env.BASE_SEPOLIA_RPC` see the resolved URL. */
export function applyResolvedBaseSepoliaRpc(): void {
  process.env.BASE_SEPOLIA_RPC = resolveBaseSepoliaRpc();
}
