import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Analytics } from '@vercel/analytics/next'
// import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// })

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// })

export const metadata: Metadata = {
  title: 'Notion资源站',
  description: 'Notion资源站',
  robots: {
    index: false,
    follow: false,
    nocache: true, // 可选，表示不缓存
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased `}>
        <Providers>
          <Navbar
            logo={{
              url: '/',
              src: 'https://www.notion.so/images/logo-ios.png',
              alt: 'Notion资源站',
              title: 'Notion资源站',
            }}
            menu={[
              { title: '首页', url: '/' },
              { title: '博客', url: '/blog' },
            ]}
            auth={{
              login: { title: '登录', url: '/auth/signin' },
              signup: { title: '注册', url: '/auth/signup' },
            }}
          />
          {children}
          {/* <Footer /> */}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
