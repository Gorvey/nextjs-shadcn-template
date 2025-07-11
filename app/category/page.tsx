'use client'

import { useEffect, useState } from 'react'
import { ThreeColumnCategoryGrid } from '@/components/CategoryGrid'
import type { NotionCategoryPage } from '@/types/notion'

/**
 * 前端开发分类页面
 * 使用三列布局展示分类：AI一列，学习一列，生命周期一列
 */
export default function CategoryPage() {
  const [categories, setCategories] = useState<NotionCategoryPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/v1/category')
        const result = await response.json()
        if (result.success) {
          setCategories(result.data)
        } else {
          throw new Error(result.message || 'Failed to load categories from API')
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  /**
   * 处理分类点击事件
   */
  const handleCategoryClick = (categoryId: string, subcategoryId?: string) => {
    console.log('Category clicked:', { categoryId, subcategoryId })
    // 这里可以添加导航逻辑，比如跳转到详情页面
  }

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
        categories={categories}
        onCategoryClick={handleCategoryClick}
        className="mb-16"
      />
    </div>
  )
}
