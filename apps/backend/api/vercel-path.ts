/**
 * Vercel `api/[[...all]]` receives paths *without* the leading `/api` segment.
 * Nest controllers use `@Controller('api/kraken')` etc., so we restore the prefix.
 */
export function normalizeVercelToNestPath(
  all: string | string[] | undefined,
): string {
  const raw = Array.isArray(all) ? all.join('/') : all != null ? String(all) : '';
  const parts = raw.split('/').filter(Boolean);
  let path = parts.length > 0 ? '/' + parts.join('/') : '/';

  const top = parts[0] ?? '';
  const second = parts[1] ?? '';

  const apiTopped = [
    'kraken',
    'hackathon',
    'risk',
    'identity',
    'prism',
  ];
  const agentPublic =
    top === 'agent' &&
    ['instruct', 'performance', 'cycles'].includes(second);

  const needsApiPrefix =
    apiTopped.includes(top) || agentPublic;

  if (needsApiPrefix) {
    path = '/api' + path;
  }

  return path;
}
