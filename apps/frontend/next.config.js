/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['arcscan.io'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
