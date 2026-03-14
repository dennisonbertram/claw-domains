import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow images from common avatar/profile domains used in text records
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.ipfs.io' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
    ],
  },
  // Required for ConnectKit: suppress hydration warnings from wallet injection
  reactStrictMode: true,
}

export default nextConfig
