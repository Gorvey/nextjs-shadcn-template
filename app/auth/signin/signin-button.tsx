'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import type { ClientSafeProvider } from 'next-auth/react'

interface SignInButtonProps {
  provider: ClientSafeProvider
}

export function SignInButton({ provider }: SignInButtonProps) {
  return (
    <Button variant="outline" className="w-full" onClick={() => signIn(provider.id)}>
      <Github className="mr-2 h-4 w-4" />
      使用 {provider.name} 登录
    </Button>
  )
}
