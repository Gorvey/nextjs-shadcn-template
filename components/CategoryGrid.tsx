'use client'

import type { DatabaseObjectResponse } from '@notionhq/client'
import { ChevronRight, Workflow } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { NotionCategoryViewPage } from '@/types/notion'

type NotionIcon = DatabaseObjectResponse['icon']

interface CategoryItem {
  id: string
  name: string
  desc: string
  icon?: NotionIcon
  sort?: number
  count?: number
  subcategoryCount?: number
}

interface CategoryGridProps {
  categories: CategoryItem[]
  onCategoryClick?: (categoryId: string) => void
  className?: string
  layout?: 'default' | 'compact' | 'lifecycle' | 'tags'
}

interface LifecycleCategoryGridProps {
  categories: NotionCategoryViewPage[]
  onCategoryClick?: (categoryId: string, subcategoryId?: string) => void
  className?: string
}

/**
 * 获取分类图标的辅助函数
 */
const getCategoryIcon = (
  categoryName: string,
  size: 'small' | 'medium' | 'large' = 'medium',
  icon?: NotionIcon,
  parentIcon?: NotionIcon
) => {
  const finalIcon = icon || parentIcon
  const containerSizeClass = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
  }[size]

  const imageSize = {
    small: 12,
    medium: 16,
    large: 20,
  }[size]

  const emojiSizeClass = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }[size]

  let content: React.ReactNode

  if (finalIcon) {
    if (finalIcon.type === 'emoji' && 'emoji' in finalIcon) {
      content = <span className={emojiSizeClass}>{finalIcon.emoji}</span>
    } else if (finalIcon.type === 'external' && 'external' in finalIcon) {
      content = (
        <Image
          src={finalIcon.external.url}
          alt={categoryName}
          width={imageSize}
          height={imageSize}
          className="rounded-sm"
        />
      )
    } else if (finalIcon.type === 'file' && 'file' in finalIcon) {
      content = (
        <Image
          src={finalIcon.file.url}
          alt={categoryName}
          width={imageSize}
          height={imageSize}
          className="rounded-sm"
        />
      )
    }
  }

  return (
    <div className={cn('inline-flex items-center justify-center align-middle', containerSizeClass)}>
      {content}
    </div>
  )
}

/**
 * 获取分类索引背景色的辅助函数
 */
const getCategoryIndexColor = (sort?: number) => {
  const colorMap: Record<number, string> = {
    [-1]: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-yellow-400/30',
    0: 'bg-gradient-to-br from-pink-500 to-pink-600 text-white border-pink-400/30',
    1: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-400/30',
    2: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white border-purple-400/30',
    3: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400/30',
    4: 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400/30',
    5: 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400/30',
    6: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-400/30',
    7: 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-cyan-400/30',
    8: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white border-teal-400/30',
  }
  if (sort !== undefined && colorMap[sort]) {
    return colorMap[sort]
  }
  return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white border-gray-400/30'
}

/**
 * 获取分类颜色的辅助函数
 */
const getCategoryColor = (sort?: number) => {
  const colorMap: Record<number, string> = {
    [-1]: 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-100/80 dark:bg-yellow-900/40 dark:border-yellow-600/40 dark:hover:bg-yellow-800/50',
    0: 'border-pink-200 bg-pink-50/50 hover:bg-pink-100/80 dark:bg-pink-900/40 dark:border-pink-600/40 dark:hover:bg-pink-800/50',
    1: 'border-orange-200 bg-orange-50/50 hover:bg-orange-100/80 dark:bg-orange-900/40 dark:border-orange-600/40 dark:hover:bg-orange-800/50',
    2: 'border-purple-200 bg-purple-50/50 hover:bg-purple-100/80 dark:bg-purple-900/40 dark:border-purple-600/40 dark:hover:bg-purple-800/50',
    3: 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/80 dark:bg-blue-900/40 dark:border-blue-600/40 dark:hover:bg-blue-800/50',
    4: 'border-green-200 bg-green-50/50 hover:bg-green-100/80 dark:bg-green-900/40 dark:border-green-600/40 dark:hover:bg-green-800/50',
    5: 'border-red-200 bg-red-50/50 hover:bg-red-100/80 dark:bg-red-900/40 dark:border-red-600/40 dark:hover:bg-red-800/50',
    6: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/80 dark:bg-indigo-900/40 dark:border-indigo-600/40 dark:hover:bg-indigo-800/50',
    7: 'border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/80 dark:bg-cyan-900/40 dark:border-cyan-600/40 dark:hover:bg-cyan-800/50',
    8: 'border-teal-200 bg-teal-50/50 hover:bg-teal-100/80 dark:bg-teal-900/40 dark:border-teal-600/40 dark:hover:bg-teal-800/50',
  }
  if (sort !== undefined && colorMap[sort]) {
    return colorMap[sort]
  }
  return 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/80 dark:bg-gray-800/60 dark:border-gray-600/50 dark:hover:bg-gray-700/70'
}

/**
 * 三列生命周期布局组件
 */
function ThreeColumnLifecycleLayout({ categories, className }: LifecycleCategoryGridProps) {
  const router = useRouter()
  // 分离不同类型的分类
  const aiCategory = categories.find((cat) => cat.name === 'AI集成')
  const learningCategory = categories.find((cat) => cat.name === '学习成长')
  const lifecycleCategories = categories.filter(
    (cat) => cat.name !== 'AI集成' && cat.name !== '学习成长'
  )

  // 默认选择"项目启动"或第一个生命周期阶段
  const defaultLifecycleCategory =
    lifecycleCategories.find((cat) => cat.name === '项目启动') || lifecycleCategories[0]
  const [selectedLifecycleId, setSelectedLifecycleId] = useState<string | null>(
    defaultLifecycleCategory?.id || null
  )

  const selectedCategory = lifecycleCategories.find((cat) => cat.id === selectedLifecycleId)

  // 渲染学习成长和 AI 集成模块
  const renderHorizontalCategorySection = (category: NotionCategoryViewPage) => (
    <div key={category.id} className="w-full">
      <div className="text-center mb-6">
        <div
          className={cn(
            'inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 shadow-sm',
            'border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-800/60 dark:to-purple-800/60 dark:border-indigo-500/60',
            getCategoryColor(category.sort)
          )}
        >
          {getCategoryIcon(category.name, 'medium', category.icon)}
          <h3 className="text-lg font-semibold">{category.name}</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
        {renderSubcategories(category.children, category.id, category.icon, category.sort)}
      </div>
    </div>
  )

  // 渲染子分类列表
  const renderSubcategories = (
    children: NotionCategoryViewPage[],
    parentId: string,
    parentIcon?: NotionIcon,
    parentSort?: number
  ) =>
    children.map((subcategory) => (
      <Card
        key={subcategory.id}
        className={cn(
          'cursor-pointer transition-all duration-200 h-full',
          getCategoryColor(parentSort)
        )}
        onClick={() => {
          // 跳转到导航页面并传递参数
          const params = new URLSearchParams({
            primary: parentId,
            secondary: subcategory.id,
          })
          router.push(`/?${params.toString()}`)
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-1">
              {getCategoryIcon(subcategory.name, 'small', subcategory.icon, parentIcon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium truncate">{subcategory.name}</h4>
                <div className="flex items-center gap-1">
                  {subcategory.links.length > 0 && (
                    <span className="text-xs font-semibold bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 rounded-full px-2 py-1 min-w-[1.25rem] text-center">
                      {subcategory.links.length}
                    </span>
                  )}
                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {subcategory.desc}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    ))

  return (
    <div className={cn('w-full space-y-12', className)}>
      {/* 第一行：学习成长 */}
      {learningCategory && renderHorizontalCategorySection(learningCategory)}

      {/* 第二行：AI集成 */}
      {aiCategory && renderHorizontalCategorySection(aiCategory)}

      {/* 第三行：开发生命周期 */}
      {lifecycleCategories.length > 0 && (
        <div className="w-full">
          <div className="text-center mb-6">
            <div
              className={cn(
                'inline-flex items-center gap-3 px-6 py-4 rounded-xl border-2 shadow-sm',
                'border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-800/60 dark:to-purple-800/60 dark:border-indigo-500/60'
              )}
            >
              <Workflow className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                开发生命周期
              </h2>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧：一级分类列表 */}
            <div className="w-full lg:w-1/3 xl:w-1/4 space-y-2">
              {lifecycleCategories.map((category, index) => {
                const totalCount = category.children.reduce((sum, sub) => sum + sub.links.length, 0)
                return (
                  <button
                    key={category.id}
                    tabIndex={0}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg border-2 cursor-pointer select-none transition-all duration-200',
                      getCategoryColor(category.sort),
                      selectedLifecycleId === category.id
                        ? 'ring-2 ring-blue-300 shadow-md dark:ring-primary'
                        : '',
                      'mb-1'
                    )}
                    onClick={() => setSelectedLifecycleId(category.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedLifecycleId(category.id)
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm border',
                        getCategoryIndexColor(category.sort)
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="p-1">
                      {getCategoryIcon(category.name, 'small', category.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate text-left">{category.name}</h3>
                    </div>
                    {totalCount > 0 && (
                      <span className="text-xs font-semibold bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 rounded-full px-2 py-1 min-w-[1.5rem] text-center">
                        {totalCount}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-70" />
                  </button>
                )
              })}
            </div>

            {/* 右侧：二级分类网格 */}
            <div className="flex-1">
              {selectedCategory ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {selectedCategory.children.map((subcategory) => (
                    <Card
                      key={subcategory.id}
                      className={cn(
                        'cursor-pointer transition-all duration-200',
                        getCategoryColor(selectedCategory.sort)
                      )}
                      onClick={() => {
                        // 跳转到导航页面并传递参数
                        const params = new URLSearchParams({
                          primary: selectedCategory.id,
                          secondary: subcategory.id,
                        })
                        router.push(`/?${params.toString()}`)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1">
                            {getCategoryIcon(
                              subcategory.name,
                              'small',
                              subcategory.icon,
                              selectedCategory.icon
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium truncate">{subcategory.name}</h4>
                              <div className="flex items-center gap-1">
                                {subcategory.links.length > 0 && (
                                  <span className="text-xs font-semibold bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 rounded-full px-2 py-1 min-w-[1.25rem] text-center">
                                    {subcategory.links.length}
                                  </span>
                                )}
                                <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {subcategory.desc}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full rounded-lg border-2 border-dashed text-muted-foreground p-8">
                  请从左侧选择一个开发阶段以查看其子分类。
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 简单的分类标签云组件（保持向后兼容）
 */
export function CategoryTags({ categories, onCategoryClick, className }: CategoryGridProps) {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {categories.map((category) => (
        <Badge
          key={category.id}
          variant="outline"
          className={cn(
            'cursor-pointer transition-colors duration-200 px-4 py-2 text-sm',
            'border-border hover:bg-accent hover:text-accent-foreground',
            'dark:hover:bg-accent dark:hover:text-accent-foreground'
          )}
          onClick={() => onCategoryClick?.(category.id)}
        >
          {getCategoryIcon(category.name, 'small', category.icon)}
          <span className="ml-2">{category.name}</span>
          {category.count && (
            <span className="ml-2 text-xs font-semibold bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 rounded-full px-2 py-1 min-w-[1.25rem] text-center">
              {category.count}
            </span>
          )}
        </Badge>
      ))}
    </div>
  )
}

/**
 * 三列生命周期分类组件
 */
export function ThreeColumnCategoryGrid({
  categories,
  onCategoryClick,
  className,
}: LifecycleCategoryGridProps) {
  return (
    <ThreeColumnLifecycleLayout
      categories={categories}
      onCategoryClick={onCategoryClick}
      className={className}
    />
  )
}
