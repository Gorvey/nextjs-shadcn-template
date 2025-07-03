'use client'

import { useState, useEffect } from 'react'
import { CategoryGrid, CategoryTags, ThreeColumnCategoryGrid } from '@/components/CategoryGrid'
import { CategoryNavigation } from '@/components/CategoryNavigation'
import { getCategoryData, getMockCategoryData, CategoryData } from '@/lib/services/category.service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CategoryItem {
  id: string
  name: string
  desc: string
  count?: number
  subcategoryCount?: number
}

/**
 * 分类组件演示页面
 * 展示所有分类组件的不同布局和样式
 */
export default function CategoryDemoPage() {
  const [fullCategories, setFullCategories] = useState<CategoryData[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoryData()
        setFullCategories(data)

        // 转换为简化格式
        const simplifiedData: CategoryItem[] = data.map((category) => ({
          id: category.id,
          name: category.name,
          desc: category.desc,
          subcategoryCount: category.subcategories.length,
        }))
        setCategories(simplifiedData)
      } catch (error) {
        console.error('Failed to load categories:', error)
        const mockData = getMockCategoryData()
        setFullCategories(mockData)

        const simplifiedMockData: CategoryItem[] = mockData.map((category) => ({
          id: category.id,
          name: category.name,
          desc: category.desc,
          subcategoryCount: category.subcategories.length,
        }))
        setCategories(simplifiedMockData)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleCategoryClick = (categoryId: string, subcategoryId?: string) => {
    console.log('Category clicked:', { categoryId, subcategoryId })
  }

  const handleSimpleCategoryClick = (categoryId: string) => {
    console.log('Simple category clicked:', categoryId)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">加载演示数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">分类组件演示</h1>
        <p className="text-xl text-muted-foreground">展示所有可用的分类布局和组件样式</p>
      </div>

      <Tabs defaultValue="three-column" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="three-column">三列布局</TabsTrigger>
          <TabsTrigger value="lifecycle">生命周期</TabsTrigger>
          <TabsTrigger value="default">标准布局</TabsTrigger>
          <TabsTrigger value="compact">紧凑布局</TabsTrigger>
          <TabsTrigger value="tags">标签云</TabsTrigger>
          <TabsTrigger value="navigation">导航组件</TabsTrigger>
        </TabsList>

        <TabsContent value="three-column" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">三列布局 (推荐)</h2>
              <p className="text-muted-foreground">
                AI一列，学习一列，生命周期一列 - 1:1:2宽度比例，直接展示二级分类
              </p>
            </div>
            <div className="border-t border-border"></div>
          </div>

          <ThreeColumnCategoryGrid
            categories={fullCategories}
            onCategoryClick={handleCategoryClick}
          />
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">生命周期布局</h2>
              <p className="text-muted-foreground">
                按前端开发流程顺序展示，主流程右侧排列，AI和学习辅助能力左侧单独展示
              </p>
            </div>
            <div className="border-t border-border"></div>
          </div>

          <CategoryGrid
            categories={categories}
            onCategoryClick={handleSimpleCategoryClick}
            layout="lifecycle"
          />
        </TabsContent>

        <TabsContent value="default" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">标准布局</h2>
              <p className="text-muted-foreground">经典的卡片网格布局，展示完整的分类信息和描述</p>
            </div>
            <div className="border-t border-border"></div>
          </div>

          <CategoryGrid
            categories={categories}
            onCategoryClick={handleSimpleCategoryClick}
            layout="default"
          />
        </TabsContent>

        <TabsContent value="compact" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">紧凑布局</h2>
              <p className="text-muted-foreground">
                节省空间的简洁布局，适合在侧边栏或小屏幕设备上使用
              </p>
            </div>
            <div className="border-t border-border"></div>
          </div>

          <CategoryGrid
            categories={categories}
            onCategoryClick={handleSimpleCategoryClick}
            layout="compact"
          />
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">标签云</h2>
              <p className="text-muted-foreground">标签形式的分类展示，适合作为筛选器或快速导航</p>
            </div>
            <div className="border-t border-border"></div>
          </div>

          <CategoryTags categories={categories} onCategoryClick={handleSimpleCategoryClick} />
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">导航组件</h2>
              <p className="text-muted-foreground">可展开收起的树形导航，展示完整的分类层级结构</p>
            </div>
            <div className="border-t border-border"></div>
          </div>

          <CategoryNavigation categories={fullCategories} onCategorySelect={handleCategoryClick} />
        </TabsContent>
      </Tabs>

      <div className="mt-16 text-center space-y-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">布局选择建议</h2>
          <div className="text-sm text-muted-foreground space-y-2 text-left">
            <p>
              <strong>三列布局</strong>：推荐用于主页面，能够清晰展示开发流程和直接访问具体工具
            </p>
            <p>
              <strong>生命周期布局</strong>：适合展示开发流程，突出时间顺序和阶段性
            </p>
            <p>
              <strong>标准布局</strong>：通用的展示方式，适合大多数场景
            </p>
            <p>
              <strong>紧凑布局</strong>：节省空间，适合移动端或侧边栏
            </p>
            <p>
              <strong>标签云</strong>：快速浏览和筛选，适合作为辅助导航
            </p>
            <p>
              <strong>导航组件</strong>：层级清晰，适合复杂的分类体系
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
