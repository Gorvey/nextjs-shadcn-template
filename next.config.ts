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

  // 页面扩展名配置
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
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
