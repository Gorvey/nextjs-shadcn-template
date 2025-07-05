'use client'

import { ChevronRight, FileText, Folder, Zap } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SubCategory {
  id: string
  name: string
  desc: string
  count?: number
  items?: any[]
}

interface Category {
  id: string
  name: string
  desc: string
  sort: number
  icon?: React.ReactNode
  subcategories: SubCategory[]
}

interface CategoryNavigationProps {
  categories: Category[]
  onCategorySelect?: (categoryId: string, subcategoryId?: string) => void
  className?: string
}

/**
 * 分类导航组件
 * 展示2级分类结构，支持交互选择
 */
export function CategoryNavigation({
  categories,
  onCategorySelect,
  className,
}: CategoryNavigationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId)
    setSelectedSubcategory(null)
    onCategorySelect?.(categoryId)
  }

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId)
    onCategorySelect?.(categoryId, subcategoryId)
  }

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      项目启动: <Zap className="h-5 w-5" />,
      设计阶段: <FileText className="h-5 w-5" />,
      编码开发: <Folder className="h-5 w-5" />,
      功能实现: <Folder className="h-5 w-5" />,
      调试测试: <FileText className="h-5 w-5" />,
      构建部署: <Zap className="h-5 w-5" />,
      运维监控: <FileText className="h-5 w-5" />,
      AI集成: <Zap className="h-5 w-5" />,
      学习成长: <FileText className="h-5 w-5" />,
    }
    return iconMap[categoryName] || <Folder className="h-5 w-5" />
  }

  // 按sort排序
  const sortedCategories = [...categories].sort((a, b) => a.sort - b.sort)

  return (
    <div className={cn('space-y-6', className)}>
      {/* 标题区域 */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">前端开发分类</h2>
        <p className="text-muted-foreground">按项目生命周期划分的开发资源分类</p>
      </div>

      {/* 分类网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCategories.map((category) => {
          const isSelected = selectedCategory === category.id

          return (
            <Card
              key={category.id}
              className={cn(
                'cursor-pointer transition-all duration-300 hover:shadow-lg',
                isSelected && 'ring-2 ring-primary bg-primary/5'
              )}
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {category.icon || getCategoryIcon(category.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category.subcategories.length}
                        </Badge>
                        <ChevronRight
                          className={cn('h-4 w-4 transition-transform', isSelected && 'rotate-90')}
                        />
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{category.desc}</p>

                {/* 子分类展开区域 */}
                {isSelected && (
                  <div className="space-y-2 border-t pt-4">
                    <h4 className="text-sm font-medium text-foreground mb-3">子分类</h4>
                    <div className="space-y-2">
                      {category.subcategories.map((subcategory) => (
                        <Button
                          key={subcategory.id}
                          variant={selectedSubcategory === subcategory.id ? 'default' : 'ghost'}
                          className="w-full justify-start text-left h-auto p-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSubcategoryClick(category.id, subcategory.id)
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{subcategory.name}</span>
                              {subcategory.count && (
                                <Badge variant="outline" className="text-xs">
                                  {subcategory.count}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 text-left">
                              {subcategory.desc}
                            </p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 选择状态提示 */}
      {selectedCategory && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                当前选择:{' '}
                <span className="font-medium text-foreground">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
                {selectedSubcategory && (
                  <>
                    {' > '}
                    <span className="font-medium text-primary">
                      {
                        categories
                          .find((c) => c.id === selectedCategory)
                          ?.subcategories.find((s) => s.id === selectedSubcategory)?.name
                      }
                    </span>
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
