import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * Comma-separated FRONTEND_URL values, optional *.vercel.app when ALLOW_VERCEL_PREVIEW_ORIGINS=true.
 */
export function buildCorsConfig(): CorsOptions {
  const raw =
    process.env.FRONTEND_URL ||
    process.env.FRONTEND_URLS ||
    'http://localhost:3000';
  const allowed = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowPreviews = process.env.ALLOW_VERCEL_PREVIEW_ORIGINS === 'true';

  return {
    credentials: true,
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowed.includes(origin) || allowed.includes('*')) {
        return callback(null, true);
      }
      if (
        allowPreviews &&
        (origin.endsWith('.vercel.app') || origin.includes('localhost'))
      ) {
        return callback(null, true);
      }
      callback(null, false);
    },
  };
}
