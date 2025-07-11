'use client'

import { useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect } from 'react'
import useSWR from 'swr'
import { ResourceContainer as CardResourceContainer } from '@/components/home/Card/ResourceContainer'
import { ResourceContainer as GridResourceContainer } from '@/components/home/Grid/ResourceContainer'
import { useAppContext } from '@/components/providers/app-store-provider'
import { API_ENDPOINTS, fetcher } from '@/lib/swr/config'
import type { NotionCategoryPage, NotionPage } from '@/types/notion'

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  const searchParams = useSearchParams()

  // 简单的数据获取
  const { data: resources = [], isLoading: resourcesLoading } = useSWR<NotionPage[]>(
    API_ENDPOINTS.RESOURCES,
    fetcher
  )
  const { data: categories = [], isLoading: categoriesLoading } = useSWR<NotionCategoryPage[]>(
    API_ENDPOINTS.CATEGORIES,
    fetcher
  )

  // 获取AppStore方法
  const setResources = useAppContext((state) => state.setResources)
  const setCategories = useAppContext((state) => state.setCategories)
  const viewType = useAppContext((state) => state.viewType)
  const setViewType = useAppContext((state) => state.setViewType)
  const setCurrentCategorySlug = useAppContext((state) => state.setCurrentCategorySlug)
  const setExpandedPrimaryCategory = useAppContext((state) => state.setExpandedPrimaryCategory)
  const categoryViewData = useAppContext((state) => state.categoryViewData)

  // 当数据加载完成后，更新store
  useEffect(() => {
    if (resources.length > 0) {
      setResources(resources)
    }
  }, [resources, setResources])

  useEffect(() => {
    if (categories.length > 0) {
      setCategories(categories)
    }
  }, [categories, setCategories])

  // 监听URL参数并设置状态
  useEffect(() => {
    const primary = searchParams.get('primary')
    const secondary = searchParams.get('secondary')

    if (primary && secondary && categoryViewData.length > 0) {
      // 设置视图模式为card
      setViewType('card')

      // 设置当前分类为二级分类
      setCurrentCategorySlug(secondary)

      // 设置展开的主分类，确保用户能看到正确的分类结构
      setExpandedPrimaryCategory(primary)
    }
  }, [
    searchParams,
    categoryViewData,
    setViewType,
    setCurrentCategorySlug,
    setExpandedPrimaryCategory,
  ])

  // 显示加载状态
  if (resourcesLoading || categoriesLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

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
