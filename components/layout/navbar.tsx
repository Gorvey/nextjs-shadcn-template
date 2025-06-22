'use client'

import { Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface MenuItem {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: MenuItem[]
}

interface NavbarProps {
  logo?: {
    url: string
    title: string
  }
  menu?: MenuItem[]
}

const Navbar = ({
  logo = {
    url: '/',
    title: 'Next.js',
  },
  menu = [],
}: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // 根据当前路径找到匹配的菜单项
  const getActiveTab = () => {
    const activeItem = menu.find((item) => {
      // 精确匹配
      if (item.url === pathname) return true
      // 如果是根路径，只有完全匹配才激活
      if (item.url === '/') return pathname === '/'
      // 路径前缀匹配（排除根路径）
      return pathname.startsWith(item.url + '/') || pathname.startsWith(item.url)
    })
    return activeItem?.title || menu[0]?.title
  }

  return (
    <nav
      className="w-full h-12 sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0"
      title=""
    >
      <div className="mx-auto px-4 h-full flex items-center justify-between">
        {/* 左侧 Logo */}
        <div className="flex items-center opacity-100">
          <a className="inline-block" aria-label={`${logo.title} - 返回首页`} href={logo.url}>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Next.js Logo" className="h-10 w-auto" />
              <h2 className="text-sm sm:text-md md:text-lg font-bold tracking-wide hover:text-primary transition-all duration-400 animate-in fade-in zoom-in-90 hover:scale-105">
                {logo.title}
              </h2>
            </div>
          </a>
        </div>

        {/* 中间导航菜单 - 桌面端 */}
        <div className="hidden lg:flex items-center justify-start overflow-hidden opacity-100">
          <Tabs value={getActiveTab()} className="w-auto">
            <TabsList className="border-none p-1 h-auto gap-6">
              {menu.map((item, index) => (
                <TabsTrigger key={item.title} value={item.title} asChild>
                  <a href={item.url}>{item.title}</a>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* 右侧按钮组 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 搜索按钮 */}
            <div>
              <Button variant="outline" size="icon" aria-label="搜索" title="搜索（Ctrl + K）">
                <Search className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
              </Button>
            </div>

            {/* 主题切换按钮 */}
            <div>
              <ThemeToggle />
            </div>

            {/* 移动端菜单按钮 */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="打开菜单" title="打开菜单">
                    <Menu className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className="flex items-center gap-2">
                        <img src="/logo.png" alt="Next.js Logo" className="h-6 w-auto" />
                        <span>{logo.title}</span>
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 p-4">
                    <div className="flex w-full flex-col gap-4">
                      {menu.map((item) => (
                        <a
                          key={item.title}
                          href={item.url}
                          className="text-base font-semibold py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.title}
                        </a>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
