import GithubProvider from 'next-auth/providers/github'
import { JWT } from 'next-auth/jwt'
import type { Account, Profile, Session, User } from 'next-auth'
import type { AuthOptions } from 'next-auth'

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log('重定向调试:', { url, baseUrl })

      // 如果 url 是相对路径，直接返回
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`
        console.log('相对路径重定向到:', redirectUrl)
        return redirectUrl
      }

      // 如果 url 是同域名的绝对路径，直接返回
      try {
        if (new URL(url).origin === baseUrl) {
          console.log('同域名重定向到:', url)
          return url
        }
      } catch (error) {
        console.log('URL解析错误:', error)
      }

      // 否则跳转到首页
      console.log('默认重定向到首页:', baseUrl)
      return baseUrl
    },
    async jwt({
      token,
      account,
      profile,
    }: {
      token: JWT
      account: Account | null
      profile?: Profile
    }) {
      if (account && profile) {
        token.email = profile.email
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.email = token.email as string
      }
      return session
    },
    async signIn({ user }: { user: User }) {
      const adminEmail = process.env.ADMIN_EMAIL
      if (user.email === adminEmail) {
        return true
      }
      return false
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
