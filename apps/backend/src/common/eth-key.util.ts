/** 32-byte secp256k1 key as hex: optional 0x + 64 hex chars (not Base64 / API secrets). */
export function isValidHexPrivateKey(pk: string): boolean {
  const s = pk.trim();
  const hex = s.startsWith('0x') ? s.slice(2) : s;
  return hex.length === 64 && /^[0-9a-fA-F]+$/.test(hex);
}
