'use client'

import type { DatabaseObjectResponse } from '@notionhq/client'
import {
  BookOpen,
  Brain,
  ChevronRight,
  Code,
  FileText,
  Folder,
  Monitor,
  Settings,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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

interface SubCategoryData {
  id: string
  name: string
  desc: string
  icon?: NotionIcon
  count?: number
}

interface FullCategoryData {
  id: string
  name: string
  desc: string
  sort: number
  icon?: NotionIcon
  subcategories: SubCategoryData[]
}

interface CategoryGridProps {
  categories: CategoryItem[]
  onCategoryClick?: (categoryId: string) => void
  className?: string
  layout?: 'default' | 'compact' | 'lifecycle' | 'tags'
}

interface LifecycleCategoryGridProps {
  categories: FullCategoryData[]
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
  } else {
    const iconMap: Record<string, React.ReactNode> = {
      项目启动: <Zap className="text-orange-500 dark:text-orange-300" />,
      设计阶段: <FileText className="text-purple-500 dark:text-purple-300" />,
      编码开发: <Code className="text-blue-500 dark:text-blue-300" />,
      功能实现: <Settings className="text-green-500 dark:text-green-300" />,
      调试测试: <Monitor className="text-red-500 dark:text-red-300" />,
      构建部署: <Folder className="text-indigo-500 dark:text-indigo-300" />,
      运维监控: <Monitor className="text-cyan-500 dark:text-cyan-300" />,
      AI集成: <Brain className="text-pink-500 dark:text-pink-300" />,
      学习成长: <BookOpen className="text-yellow-500 dark:text-yellow-300" />,
    }
    content = iconMap[categoryName] || <Folder className="text-gray-500 dark:text-gray-400" />
  }

  return (
    <div className={cn('inline-flex items-center justify-center align-middle', containerSizeClass)}>
      {content}
    </div>
  )
}

/**
 * 获取分类颜色的辅助函数
 */
const getCategoryColor = (sort?: number) => {
  const colorMap: Record<number, string> = {
    [-1]: 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-100/80 dark:bg-yellow-400/10 dark:border-yellow-400/20 dark:hover:bg-yellow-400/20',
    0: 'border-pink-200 bg-pink-50/50 hover:bg-pink-100/80 dark:bg-pink-400/10 dark:border-pink-400/20 dark:hover:bg-pink-400/20',
    1: 'border-orange-200 bg-orange-50/50 hover:bg-orange-100/80 dark:bg-orange-400/10 dark:border-orange-400/20 dark:hover:bg-orange-400/20',
    2: 'border-purple-200 bg-purple-50/50 hover:bg-purple-100/80 dark:bg-purple-400/10 dark:border-purple-400/20 dark:hover:bg-purple-400/20',
    3: 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/80 dark:bg-blue-400/10 dark:border-blue-400/20 dark:hover:bg-blue-400/20',
    4: 'border-green-200 bg-green-50/50 hover:bg-green-100/80 dark:bg-green-400/10 dark:border-green-400/20 dark:hover:bg-green-400/20',
    5: 'border-red-200 bg-red-50/50 hover:bg-red-100/80 dark:bg-red-400/10 dark:border-red-400/20 dark:hover:bg-red-400/20',
    6: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/80 dark:bg-indigo-400/10 dark:border-indigo-400/20 dark:hover:bg-indigo-400/20',
    7: 'border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/80 dark:bg-cyan-400/10 dark:border-cyan-400/20 dark:hover:bg-cyan-400/20',
    8: 'border-teal-200 bg-teal-50/50 hover:bg-teal-100/80 dark:bg-teal-400/10 dark:border-teal-400/20 dark:hover:bg-teal-400/20',
  }
  if (sort !== undefined && colorMap[sort]) {
    return colorMap[sort]
  }
  return 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/80 dark:bg-gray-400/10 dark:border-gray-400/20 dark:hover:bg-gray-400/20'
}

/**
 * 三列生命周期布局组件
 */
function ThreeColumnLifecycleLayout({
  categories,
  onCategoryClick,
  className,
}: LifecycleCategoryGridProps) {
  // 定义生命周期顺序
  const lifecycleOrder = [
    '项目启动',
    '设计阶段',
    '编码开发',
    '功能实现',
    '调试测试',
    '构建部署',
    '运维监控',
  ]

  // 分离不同类型的分类
  const aiCategory = categories.find((cat) => cat.name === 'AI集成')
  const learningCategory = categories.find((cat) => cat.name === '学习成长')
  const lifecycleCategories = lifecycleOrder
    .map((name) => categories.find((cat) => cat.name === name))
    .filter(Boolean) as FullCategoryData[]

  // 默认选择"项目启动"或第一个生命周期阶段
  const defaultLifecycleCategory =
    lifecycleCategories.find((cat) => cat.name === '项目启动') || lifecycleCategories[0]
  const [selectedLifecycleId, setSelectedLifecycleId] = useState<string | null>(
    defaultLifecycleCategory?.id || null
  )

  const selectedCategory = lifecycleCategories.find((cat) => cat.id === selectedLifecycleId)

  // 渲染学习成长和 AI 集成模块
  const renderHorizontalCategorySection = (category: FullCategoryData) => (
    <div key={category.id} className="w-full">
      <div className="text-center mb-6">
        <div
          className={cn(
            'inline-flex items-center gap-3 px-4 py-2 rounded-lg',
            getCategoryColor(category.sort),
            'border-2'
          )}
        >
          {getCategoryIcon(category.name, 'large', category.icon)}
          <h2 className="text-lg font-semibold">{category.name}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{category.desc}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {category.subcategories.map((subcategory) => (
          <Card
            key={subcategory.id}
            className={cn(
              'cursor-pointer transition-all duration-200',
              getCategoryColor(category.sort)
            )}
            onClick={() => onCategoryClick?.(category.id, subcategory.id)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="p-1.5 rounded-lg bg-background/80 shadow-sm mb-2">
                {getCategoryIcon(subcategory.name, 'small', subcategory.icon, category.icon)}
              </div>
              <h4 className="text-sm font-medium truncate w-full">{subcategory.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                {subcategory.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

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
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2',
                'border-gray-200 bg-gray-50/50 dark:bg-gray-400/10 dark:border-gray-400/20'
              )}
            >
              <h2 className="text-lg font-semibold">开发生命周期</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2">按照前端开发流程顺序排列的核心阶段</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧：一级分类列表 */}
            <div className="w-full lg:w-1/3 xl:w-1/4 space-y-2">
              {lifecycleCategories.map((category, index) => (
                <button
                  key={category.id}
                  tabIndex={0}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer select-none transition-all duration-200',
                    getCategoryColor(category.sort),
                    selectedLifecycleId === category.id ? 'ring-2 ring-primary shadow-md' : '',
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
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="p-1.5 rounded bg-background/80 shadow-sm">
                    {getCategoryIcon(category.name, 'small', category.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{category.name}</h3>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-70" />
                </button>
              ))}
            </div>

            {/* 右侧：二级分类网格 */}
            <div className="flex-1">
              {selectedCategory ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {selectedCategory.subcategories.map((subcategory) => (
                    <Card
                      key={subcategory.id}
                      className={cn(
                        'cursor-pointer transition-all duration-200',
                        getCategoryColor(selectedCategory.sort)
                      )}
                      onClick={() => onCategoryClick?.(selectedCategory.id, subcategory.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded bg-background/80 shadow-sm">
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
                              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
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
 * 生命周期布局组件 - 按开发流程顺序排列（原版本，保持兼容）
 */
function LifecycleLayout({ categories, onCategoryClick, className }: CategoryGridProps) {
  // 定义生命周期顺序
  const lifecycleOrder = [
    '项目启动',
    '设计阶段',
    '编码开发',
    '功能实现',
    '调试测试',
    '构建部署',
    '运维监控',
  ]

  // 分离生命周期分类和辅助分类
  const lifecycleCategories = lifecycleOrder
    .map((name) => categories.find((cat) => cat.name === name))
    .filter(Boolean) as CategoryItem[]

  const auxiliaryCategories = categories.filter(
    (cat) => cat.name === 'AI集成' || cat.name === '学习成长'
  )

  const renderCategoryCard = (category: CategoryItem, isAuxiliary = false) => (
    <Card
      key={category.id}
      className={cn(
        'group cursor-pointer overflow-hidden transition-all duration-300',
        getCategoryColor(category.sort),
        isAuxiliary ? 'lg:col-span-1' : 'lg:col-span-2'
      )}
      onClick={() => onCategoryClick?.(category.id)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background/80 shadow-md">
              {getCategoryIcon(category.name, 'large', category.icon)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {category.subcategoryCount && (
              <Badge variant="secondary" className="text-xs">
                {category.subcategoryCount}
              </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {category.count && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">{category.count} 项资源</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className={cn('flex gap-6', className)}>
      {/* 辅助功能区域 - 左侧 */}
      <div className="w-80 hidden lg:block">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">辅助能力</h2>
          <p className="text-sm text-muted-foreground">贯穿整个开发过程的辅助工具和能力</p>
        </div>

        <div className="space-y-4">
          {auxiliaryCategories.map((category) => renderCategoryCard(category, true))}
        </div>
      </div>

      {/* 主要生命周期区域 - 右侧 */}
      <div className="flex-1">
        <div className="mb-4">
          <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg', 'border-2')}>
            <h2 className="text-lg font-semibold">开发生命周期</h2>
          </div>
          <p className="text-sm text-muted-foreground">按照前端开发流程顺序排列的核心阶段</p>
        </div>

        {/* 使用流式布局，自动换行 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lifecycleCategories.map((category, index) => (
            <div key={category.id} className="relative">
              {renderCategoryCard(category)}
              {/* 步骤编号 */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold z-10">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 移动端：辅助功能在顶部 */}
      <div className="lg:hidden mb-8 order-first">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">辅助能力</h2>
          <p className="text-sm text-muted-foreground">贯穿整个开发过程的辅助工具和能力</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {auxiliaryCategories.map((category) => renderCategoryCard(category, true))}
        </div>
      </div>
    </div>
  )
}

/**
 * 分类网格组件
 */
export function CategoryGrid({
  categories,
  onCategoryClick,
  className,
  layout = 'default',
}: CategoryGridProps) {
  // 生命周期布局
  if (layout === 'lifecycle') {
    return (
      <LifecycleLayout
        categories={categories}
        onCategoryClick={onCategoryClick}
        className={className}
      />
    )
  }

  // 标签云布局
  if (layout === 'tags') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5"
            onClick={() => onCategoryClick?.(category.id)}
          >
            <span className="mr-1">{getCategoryIcon(category.name, 'small', category.icon)}</span>
            {category.name}
            {category.subcategoryCount && (
              <span className="ml-1 text-xs opacity-70">({category.subcategoryCount})</span>
            )}
          </Badge>
        ))}
      </div>
    )
  }

  // 紧凑布局
  if (layout === 'compact') {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3', className)}>
        {categories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              'group cursor-pointer transition-all duration-200',
              getCategoryColor(category.sort)
            )}
            onClick={() => onCategoryClick?.(category.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-background/80 shadow">
                  {getCategoryIcon(category.name, 'small', category.icon)}
                </div>
                <h4 className="text-sm font-medium truncate flex-1">{category.name}</h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 默认标准布局
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {categories.map((category) => (
        <Card
          key={category.id}
          className={cn(
            'group cursor-pointer overflow-hidden transition-all duration-300',
            getCategoryColor(category.sort)
          )}
          onClick={() => onCategoryClick?.(category.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-background/80 shadow-lg">
                {getCategoryIcon(category.name, 'large', category.icon)}
              </div>
              <div>
                <h3 className="font-semibold text-xl tracking-tight">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              {category.subcategoryCount && (
                <Badge variant="secondary" className="text-xs">
                  {category.subcategoryCount}
                </Badge>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            {category.count && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{category.count} 项资源</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
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
          {category.count && <span className="ml-2 text-muted-foreground">({category.count})</span>}
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
