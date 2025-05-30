import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 在开发环境中禁用图片优化
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/upload',
        headers: [
          {
            key: 'x-middleware-auth',
            value: 'true',
          },
        ],
      },
    ]
  },
}

export default nextConfig
