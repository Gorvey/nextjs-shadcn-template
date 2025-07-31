import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { BackToTop } from '@/components/layout/back-to-top'
import { Footer } from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'cooool.fun - 发现最cooool的前端资源',
  description: 'cooool.fun, 一个分享资源的网站.前端博客站点,发现最cooool的前端资源',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={'antialiased '}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar
              logo={{
                url: '/',
                title: '.fun',
              }}
              menu={[
                { title: '导航', url: '/' },
                { title: '分类', url: '/category' },
                // { title: '博客', url: '/blog' },
                // { title: '关于本站', url: '/about' },
              ]}
            />
            <main className="flex-grow">{children}</main>
            <Footer
              logo={{
                url: '/',
                title: '.fun',
              }}
              menu={[
                { title: '导航', url: '/' },
                { title: '分类', url: '/category' },
                // { title: "博客", url: "/blog" },
                // { title: "关于本站", url: "/about" },
              ]}
              tagline="Gorvey的资源集合"
              creator="Gorvey"
              copyright="© 2025 cooool.fun. All rights reserved."
            />
          </div>
        </Providers>
        <BackToTop />
        <Analytics />
      </body>
    </html>
  )
}
