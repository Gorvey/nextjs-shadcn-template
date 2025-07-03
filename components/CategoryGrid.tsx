'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ChevronRight,
  Folder,
  FileText,
  Zap,
  Code,
  Settings,
  Monitor,
  Brain,
  BookOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface CategoryItem {
  id: string
  name: string
  desc: string
  count?: number
  subcategoryCount?: number
}

interface SubCategoryData {
  id: string
  name: string
  desc: string
  count?: number
}

interface FullCategoryData {
  id: string
  name: string
  desc: string
  sort: number
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
const getCategoryIcon = (categoryName: string, size: 'small' | 'medium' | 'large' = 'medium') => {
  const sizeClass = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
  }[size]

  const iconMap: Record<string, React.ReactNode> = {
    项目启动: <Zap className={cn('text-orange-500', sizeClass)} />,
    设计阶段: <FileText className={cn('text-purple-500', sizeClass)} />,
    编码开发: <Code className={cn('text-blue-500', sizeClass)} />,
    功能实现: <Settings className={cn('text-green-500', sizeClass)} />,
    调试测试: <Monitor className={cn('text-red-500', sizeClass)} />,
    构建部署: <Folder className={cn('text-indigo-500', sizeClass)} />,
    运维监控: <Monitor className={cn('text-cyan-500', sizeClass)} />,
    AI集成: <Brain className={cn('text-pink-500', sizeClass)} />,
    学习成长: <BookOpen className={cn('text-yellow-500', sizeClass)} />,
  }
  return iconMap[categoryName] || <Folder className={cn('text-gray-500', sizeClass)} />
}

/**
 * 获取分类颜色的辅助函数
 */
const getCategoryColor = (categoryName: string) => {
  const colorMap: Record<string, string> = {
    项目启动: 'border-orange-200 hover:border-orange-300 bg-orange-50/50',
    设计阶段: 'border-purple-200 hover:border-purple-300 bg-purple-50/50',
    编码开发: 'border-blue-200 hover:border-blue-300 bg-blue-50/50',
    功能实现: 'border-green-200 hover:border-green-300 bg-green-50/50',
    调试测试: 'border-red-200 hover:border-red-300 bg-red-50/50',
    构建部署: 'border-indigo-200 hover:border-indigo-300 bg-indigo-50/50',
    运维监控: 'border-cyan-200 hover:border-cyan-300 bg-cyan-50/50',
    AI集成: 'border-pink-200 hover:border-pink-300 bg-pink-50/50',
    学习成长: 'border-yellow-200 hover:border-yellow-300 bg-yellow-50/50',
  }
  return colorMap[categoryName] || 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
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

  // 手风琴展开状态
  const [openLifecycleId, setOpenLifecycleId] = useState<string | null>(null)

  // 渲染生命周期主分类（手风琴）
  const renderLifecycleAccordion = () => (
    <div className="space-y-3">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">开发生命周期</h2>
      </div>
      {lifecycleCategories.map((category, index) => {
        const isOpen = openLifecycleId === category.id
        return (
          <div key={category.id}>
            {/* 主分类卡片 */}
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer select-none transition-all duration-200',
                getCategoryColor(category.name),
                isOpen && 'ring-2 ring-primary',
                'hover:shadow-md mb-1'
              )}
              onClick={() => setOpenLifecycleId(isOpen ? null : category.id)}
            >
              {/* 步骤编号 */}
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="p-1.5 rounded bg-white/80 shadow-sm">
                {getCategoryIcon(category.name, 'small')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium truncate">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.subcategories.length}
                    </Badge>
                    <ChevronRight
                      className={cn(
                        'h-3 w-3 text-muted-foreground transition-transform',
                        isOpen && 'rotate-90'
                      )}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {category.desc}
                </p>
              </div>
            </div>
            {/* 子分类区域 */}
            {isOpen && (
              <div className="space-y-2 pl-10 pr-2 py-2">
                {category.subcategories.map((subcategory) => (
                  <Card
                    key={subcategory.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
                      getCategoryColor(category.name)
                    )}
                    onClick={() => onCategoryClick?.(category.id, subcategory.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded bg-white/80 shadow-sm">
                          {getCategoryIcon(category.name, 'small')}
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
            )}
          </div>
        )
      })}
    </div>
  )

  // 渲染分类卡片（AI/学习）
  const renderCategoryWithSubs = (category: FullCategoryData, columnType: 'ai' | 'learning') => (
    <div key={category.id} className="space-y-4">
      {/* 主分类头部 */}
      <div className="text-center">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg',
            getCategoryColor(category.name),
            'border-2'
          )}
        >
          {getCategoryIcon(category.name, 'large')}
          <h2 className="text-lg font-semibold">{category.name}</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{category.desc}</p>
      </div>
      {/* 子分类列表 */}
      <div className="space-y-3">
        {category.subcategories.map((subcategory) => (
          <Card
            key={subcategory.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
              getCategoryColor(category.name)
            )}
            onClick={() => onCategoryClick?.(category.id, subcategory.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded bg-white/80 shadow-sm">
                  {getCategoryIcon(category.name, 'small')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium truncate">{subcategory.name}</h3>
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
    </div>
  )

  return (
    <div className={cn('w-full', className)}>
      {/* 桌面端：3列布局 */}
      <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
        {/* AI集成列 - 1份 */}
        <div className="col-span-1">{aiCategory && renderCategoryWithSubs(aiCategory, 'ai')}</div>
        {/* 学习成长列 - 1份 */}
        <div className="col-span-1">
          {learningCategory && renderCategoryWithSubs(learningCategory, 'learning')}
        </div>
        {/* 生命周期列 - 2份（手风琴） */}
        <div className="col-span-2">{renderLifecycleAccordion()}</div>
      </div>
      {/* 移动端：垂直布局 */}
      <div className="lg:hidden space-y-8">
        {/* AI集成 */}
        {aiCategory && renderCategoryWithSubs(aiCategory, 'ai')}
        {/* 学习成长 */}
        {learningCategory && renderCategoryWithSubs(learningCategory, 'learning')}
        {/* 生命周期（手风琴） */}
        {renderLifecycleAccordion()}
      </div>
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
        'cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
        getCategoryColor(category.name),
        isAuxiliary && 'border-2'
      )}
      onClick={() => onCategoryClick?.(category.id)}
    >
      <CardContent className={cn('p-4', isAuxiliary && 'p-5')}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white/80 shadow-sm">
            {getCategoryIcon(category.name, isAuxiliary ? 'large' : 'medium')}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3
                className={cn(
                  'font-semibold text-foreground truncate',
                  isAuxiliary ? 'text-base' : 'text-sm'
                )}
              >
                {category.name}
              </h3>
              <div className="flex items-center gap-2">
                {category.subcategoryCount && (
                  <Badge variant="secondary" className="text-xs">
                    {category.subcategoryCount}
                  </Badge>
                )}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            <p
              className={cn(
                'text-muted-foreground line-clamp-2 leading-relaxed',
                isAuxiliary ? 'text-sm' : 'text-xs'
              )}
            >
              {category.desc}
            </p>

            {category.count && (
              <div className="mt-2 pt-2 border-t border-border/50">
                <span className="text-xs text-muted-foreground">{category.count} 项资源</span>
              </div>
            )}
          </div>
        </div>
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
          <h2 className="text-lg font-semibold text-foreground mb-2"></h2>
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
            <span className="mr-1">{getCategoryIcon(category.name, 'small')}</span>
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
      <div
        className={cn(
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3',
          className
        )}
      >
        {categories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              getCategoryColor(category.name)
            )}
            onClick={() => onCategoryClick?.(category.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(category.name, 'medium')}
                <span className="text-sm font-medium truncate">{category.name}</span>
              </div>
              <div className="flex items-center justify-between">
                {category.subcategoryCount && (
                  <Badge variant="secondary" className="text-xs">
                    {category.subcategoryCount}
                  </Badge>
                )}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 默认标准布局
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {categories.map((category) => (
        <Card
          key={category.id}
          className={cn(
            'cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02]',
            getCategoryColor(category.name)
          )}
          onClick={() => onCategoryClick?.(category.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/80 shadow-sm">
                {getCategoryIcon(category.name, 'large')}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{category.name}</h3>
                  <div className="flex items-center gap-2">
                    {category.subcategoryCount && (
                      <Badge variant="secondary" className="text-xs">
                        {category.subcategoryCount}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {category.desc}
                </p>

                {category.count && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">{category.count} 项资源</span>
                  </div>
                )}
              </div>
            </div>
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
    <CategoryGrid
      categories={categories}
      onCategoryClick={onCategoryClick}
      className={className}
      layout="tags"
    />
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
