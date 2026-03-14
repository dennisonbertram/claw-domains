import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow images from common avatar/profile domains used in text records
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.ipfs.io' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
  reactStrictMode: true,
}

export default nextConfig
