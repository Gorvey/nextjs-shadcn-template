'use client'

import type { ClientSafeProvider } from 'next-auth/react'
import { getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInButton } from './signin-button'

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providers = await getProviders()
        setProviders(providers)
      } catch (error) {
        console.error('获取提供商失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">管理员登录</CardTitle>
          <CardDescription className="text-center">请使用 GitHub 账号登录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded" />
            ) : (
              providers &&
              Object.values(providers).map((provider) => (
                <SignInButton key={provider.name} provider={provider} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
