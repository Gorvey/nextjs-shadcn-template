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
