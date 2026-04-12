const path = require('path')
const fs = require('fs')

/** Load repo-root .env so `npm run dev` from apps/frontend still sees NEXT_PUBLIC_* and shared keys. */
function loadRootEnv() {
  const envPath = path.join(__dirname, '../../.env')
  if (!fs.existsSync(envPath)) return
  const text = fs.readFileSync(envPath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadRootEnv()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // ESLint 9 flat config incompatible with Next 14 default lint step in some setups
    ignoreDuringBuilds: true,
  },

  images: {
    domains: ['arcscan.io', 'testnet.arcscan.io', 'arc.dev'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.arcscan.io',
      },
    ],
    unoptimized: true, // For SVG support
  },

  // Environment variables exposed to the browser (also set in process.env via loadRootEnv)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_QUANTUM_API_URL:
      process.env.NEXT_PUBLIC_QUANTUM_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_ARC_RPC_URL: process.env.NEXT_PUBLIC_ARC_RPC_URL || 'https://testnet-rpc.arc.dev',
    NEXT_PUBLIC_ARC_CHAIN_ID: process.env.NEXT_PUBLIC_ARC_CHAIN_ID || '5042002',
    NEXT_PUBLIC_ARCSCAN_URL: process.env.NEXT_PUBLIC_ARCSCAN_URL || 'https://testnet.arcscan.io',
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      '',
    NEXT_PUBLIC_USDC_CONTRACT: process.env.NEXT_PUBLIC_USDC_CONTRACT || '',
    NEXT_PUBLIC_USDC_DECIMALS: process.env.NEXT_PUBLIC_USDC_DECIMALS || '6',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
  },

  // Optimizations for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    // Fallbacks for browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      // Dev: slow first compile or stale chunk graph can trigger ChunkLoadError (layout.js timeout).
      if (dev) {
        config.output = {
          ...config.output,
          chunkLoadTimeout: 120000,
        };
      }
    }

    return config;
  },
}

module.exports = nextConfig
