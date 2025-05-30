import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
