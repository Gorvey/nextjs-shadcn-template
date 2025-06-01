'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import type { ClientSafeProvider } from 'next-auth/react'

interface SignInButtonProps {
  provider: ClientSafeProvider
}

export function SignInButton({ provider }: SignInButtonProps) {
  const handleSignIn = () => {
    // 从URL查询参数中获取回调地址，如果没有则默认跳转到首页
    const searchParams = new URLSearchParams(window.location.search)
    const callbackUrl = searchParams.get('callbackUrl') || '/'

    console.log('登录按钮调试:', {
      location: window.location.href,
      searchParams: searchParams.toString(),
      callbackUrl,
      providerId: provider.id,
    })

    signIn(provider.id, { callbackUrl })
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleSignIn}>
      <Github className="mr-2 h-4 w-4" />
      使用 {provider.name} 登录
    </Button>
  )
}
