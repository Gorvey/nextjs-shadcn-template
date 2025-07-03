'use client'

import { useState, useEffect } from 'react'
import { ThreeColumnCategoryGrid } from '@/components/CategoryGrid'
import { getCategoryData, getMockCategoryData, CategoryData } from '@/lib/services/category.service'

/**
 * 前端开发分类页面
 * 使用三列布局展示分类：AI一列，学习一列，生命周期一列
 */
export default function CategoryPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoryData()
        setCategories(data)
      } catch (error) {
        console.error('Failed to load categories:', error)
        // 使用模拟数据作为后备
        setCategories(getMockCategoryData())
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

      {/* 页面说明 */}
      <div className="mt-16 text-center space-y-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">布局说明</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            左侧两列展示贯穿整个开发过程的辅助能力：AI集成工具和学习成长资源，
            每个分类直接展示其子分类，便于快速访问具体工具。
            右侧展示按时间顺序排列的7个核心开发阶段， 从项目启动到运维监控的完整开发生命周期。
          </p>
        </div>
      </div>
    </div>
  )
}
