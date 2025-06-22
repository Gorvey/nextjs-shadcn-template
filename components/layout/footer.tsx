import Link from 'next/link'

interface MenuItem {
  title: string
  url: string
}

interface FooterProps {
  logo?: {
    url: string
    title: string
  }
  tagline?: string
  menu?: MenuItem[]
  creator?: string
  copyright?: string
}

const Footer = ({
  logo = {
    url: '/',
    title: 'Next.js',
  },
  tagline = '发现最cooool的前端资源',
  menu = [],
  creator = 'Gorvey',
  copyright = '© 2025 cooool.fun. All rights reserved.',
}: FooterProps) => {
  return (
    <section className="pt-8 pb-8 border-t bg-background/95">
      <div className="container mx-auto px-4">
        <footer>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Logo 和标语 */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <Link href={logo.url} className="flex items-center gap-2">
                  <img src="/logo.png" alt="logo" className="h-14 w-auto" />
                  <h3 className="text-lg font-bold">{logo.title}</h3>
                </Link>
              </div>
              <p className="mt-4 text-muted-foreground max-w-md">{tagline}</p>
            </div>

            {/* 导航链接 */}
            <div className="col-span-1 md:col-span-2">
              <h4 className="mb-4 font-bold">导航</h4>
              <div className="grid grid-cols-2 gap-4">
                {menu.map((item, index) => (
                  <Link
                    key={index}
                    href={item.url}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 版权信息 */}
          <div className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>Designed & Powerd by {creator}</p>
            <p className="mt-2">{copyright}</p>
          </div>
        </footer>
      </div>
    </section>
  )
}

export { Footer }
