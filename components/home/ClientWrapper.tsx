'use client'

import type React from 'react'
import { ResourceContainer as CardResourceContainer } from '@/components/home/Card/ResourceContainer'
import { ResourceContainer as GridResourceContainer } from '@/components/home/Grid/ResourceContainer'
import { useApp } from '@/lib/contexts/app-context'

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  // 从Context获取状态
  const { state } = useApp()
  const { viewType } = state

  return (
    <>
      {children}
      <div
        className={
          viewType === 'card'
            ? 'block'
            : 'absolute left-0 top-0 w-full pointer-events-none opacity-0 h-0'
        }
        style={{ zIndex: -1 }}
      >
        <CardResourceContainer />
      </div>
      <div
        className={
          viewType === 'grid'
            ? 'block'
            : 'absolute left-0 top-0 w-full pointer-events-none opacity-0 h-0'
        }
        style={{ zIndex: -1 }}
      >
        <GridResourceContainer />
      </div>
    </>
  )
}
