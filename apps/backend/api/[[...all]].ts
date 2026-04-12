import type { VercelRequest, VercelResponse } from '@vercel/node';
import { normalizeVercelToNestPath } from './vercel-path';

export default async function vercelHandler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const path = normalizeVercelToNestPath(req.query.all as string | string[]);
  const raw = req.url ?? '';
  const q = raw.includes('?') ? '?' + raw.split('?').slice(1).join('?') : '';
  (req as unknown as { url: string }).url = path + q;

  const { handler } = require('../dist/src/serverless.js');
  return handler(req, res);
}
