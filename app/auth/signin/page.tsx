import { getProviders } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignInButton } from './signin-button'

export default async function SignIn() {
  const providers = await getProviders()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">管理员登录</CardTitle>
          <CardDescription className="text-center">请使用 GitHub 账号登录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers &&
              Object.values(providers).map((provider) => (
                <SignInButton key={provider.name} provider={provider} />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
