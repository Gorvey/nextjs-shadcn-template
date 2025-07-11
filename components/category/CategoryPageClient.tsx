'use client'

import { ThreeColumnCategoryGrid } from '@/components/CategoryGrid'
import { useApp } from '@/lib/contexts/app-context'

/**
 * 分类页面客户端组件
 * 使用新的Context系统获取数据和状态
 */
export function CategoryPageClient() {
  // 从Context获取数据
  const { state } = useApp()
  const { categoryViewData, loading } = state

  /**
   * 处理分类点击事件
   */
  const handleCategoryClick = (categoryId: string, subcategoryId?: string) => {
    console.log('Category clicked:', { categoryId, subcategoryId })
    // 这里可以添加导航逻辑，比如跳转到详情页面
  }

  // 显示加载状态
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="mt-2 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  // 无数据状态
  if (!categoryViewData.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">暂无分类数据</h3>
          <p className="text-muted-foreground">系统中暂时没有分类数据</p>
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
