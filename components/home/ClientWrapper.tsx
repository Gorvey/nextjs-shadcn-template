'use client'

import React, { useEffect } from 'react'
import { useDataStore } from '@/stores/data.store'
import { useViewStore } from '@/stores/view.store'
import { useShallow } from 'zustand/react/shallow'
import { ResourceContainer as CardResourceContainer } from '@/components/home/Card/ResourceContainer'
import { ResourceContainer as GridResourceContainer } from '@/components/home/Grid/ResourceContainer'
import type { NotionPage, NotionDatabase } from '@/types/notion'

interface ClientWrapperProps {
  children: React.ReactNode
  initialData: NotionPage[] | null
  databaseDetails: NotionDatabase | null
  error: string | null
}

export function ClientWrapper({
  children,
  initialData,
  databaseDetails,
  error,
}: ClientWrapperProps) {
  const viewType = useViewStore((state) => state.viewType)
  const { setData, setLoading, setDatabaseDetails } = useDataStore(
    useShallow((state) => ({
      setData: state.setData,
      setLoading: state.setLoading,
      setDatabaseDetails: state.setDatabaseDetails,
    }))
  )

  // 初始化状态
  useEffect(() => {
    setLoading(false)

    if (error) {
      console.error('SSR数据获取失败:', error)
      return
    }

    if (initialData) {
      setData(initialData)
    }

    if (databaseDetails) {
      setDatabaseDetails(databaseDetails)
    }
  }, [initialData, databaseDetails, error, setData, setDatabaseDetails, setLoading])

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">加载失败: {error}</p>
      </div>
    )
  }

  return (
    <>
      {children}
      {viewType === 'card' && <CardResourceContainer />}
      {viewType === 'grid' && <GridResourceContainer />}
    </>
  )
}
