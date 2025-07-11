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
      <div className={viewType === 'card' ? 'block' : 'hidden'}>
        <CardResourceContainer />
      </div>
      <div className={viewType === 'grid' ? 'block' : 'hidden'}>
        <GridResourceContainer />
      </div>
    </>
  )
}
