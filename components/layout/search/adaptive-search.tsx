'use client'

import { useEffect, useState } from 'react'
import { DesktopSearchCommand } from './desktop-search-command'
import { MobileSearchModal } from './mobile-search-modal'
import type { SearchCommandProps } from './types'
import { isMobile } from './utils/utils'

export function AdaptiveSearch({ open, onOpenChange }: SearchCommandProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobileDevice(isMobile())
    }

    // 初始检查
    checkDevice()

    // 监听窗口大小变化
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // 服务端渲染时先显示桌面版本，避免水合不匹配
  if (typeof window === 'undefined') {
    return <DesktopSearchCommand open={open} onOpenChange={onOpenChange} />
  }

  return isMobileDevice ? (
    <MobileSearchModal open={open} onOpenChange={onOpenChange} />
  ) : (
    <DesktopSearchCommand open={open} onOpenChange={onOpenChange} />
  )
}
