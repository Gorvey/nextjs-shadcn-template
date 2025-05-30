'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'

interface SignInButtonProps {
  provider: {
    id: string
    name: string
  }
}

export function SignInButton({ provider }: SignInButtonProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  return (
    <Button
      key={provider.name}
      onClick={() => signIn(provider.id, { callbackUrl })}
      className="w-full"
      variant="default"
    >
      使用 {provider.name} 登录
    </Button>
  )
}
