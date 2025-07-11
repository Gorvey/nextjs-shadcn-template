'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { ThreeColumnCategoryGrid } from '@/components/CategoryGrid'
import { AppStoreProvider, useAppContext } from '@/components/providers/app-store-provider'
import { API_ENDPOINTS, fetcher } from '@/lib/swr/config'
import type { NotionCategoryPage, NotionPage } from '@/types/notion'
import { transformCategoriesToViewData } from '@/utils/category'

/**
 * 内部客户端组件，处理数据获取和状态管理
 */
function CategoryClientWrapper() {
  // 数据获取
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

  // 使用工具函数转换分类数据为视图数据
  const categoryViewData = transformCategoriesToViewData(categories, resources)

  /**
   * 处理分类点击事件
   */
  const handleCategoryClick = (categoryId: string, subcategoryId?: string) => {
    console.log('Category clicked:', { categoryId, subcategoryId })
    // 这里可以添加导航逻辑，比如跳转到详情页面
  }

  // 显示加载状态
  if (resourcesLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="mt-2 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">前端开发分类</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          完整的前端开发生命周期指南，包含工具、框架、最佳实践和学习资源
        </p>
      </div>

      {/* 三列分类布局 */}
      <ThreeColumnCategoryGrid
        categories={categoryViewData}
        onCategoryClick={handleCategoryClick}
        className="mb-16"
      />
    </div>
  )
}

/**
 * 分类页面客户端组件
 * 提供AppStore上下文并渲染客户端逻辑
 */
export function CategoryPageClient() {
  return (
    <AppStoreProvider>
      <CategoryClientWrapper />
    </AppStoreProvider>
  )
}
