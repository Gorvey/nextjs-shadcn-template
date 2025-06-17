/**
 * ResourceContainer 组件
 *
 * 重构后的资源容器组件，具有以下特性：
 * 1. 三级结构：主分类 -> 次分类 -> 资源项
 * 2. 智能布局：基于 gridCategoryLayout 算法计算最优宽度百分比
 * 3. 响应式设计：监听容器宽度变化并重新计算布局
 * 4. 性能优化：使用防抖、useCallback、useMemo 等优化渲染
 * 5. 现代扁平设计：大量使用shadcn组件，简洁现代的视觉风格
 *
 * 设计理念：
 * - 扁平化设计：减少不必要的阴影和边框
 * - 简洁现代：使用shadcn组件系统提供一致的视觉体验
 * - 色彩和谐：基于系统色彩变量，支持深色模式
 * - 间距优化：使用Tailwind的间距系统保持一致性
 */

import { ResourceItem } from './ResourceItem'
import { useDataStore } from '@/stores/data.store'
import { useViewStore } from '@/stores/view.store'
import { useShallow } from 'zustand/react/shallow'
import { NotionPage } from '@/types/notion'
import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import getGridCategoryLayout, {
  type GridCategoryLayout,
  type SubcategoryDetails,
} from './gridCategoryLayout'

// shadcn 组件导入
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// 数据结构定义
interface PrimaryGroup {
  id: string
  name: string
  subcategories: SecondaryGroup[]
}

interface SecondaryGroup {
  id: string
  name: string
  items: NotionPage[]
  itemsCount: number
  itemsFeaturedCount: number
}

interface LayoutGroup {
  primaryGroup: PrimaryGroup
  layout: GridCategoryLayout
}

// 默认配置
const DEFAULT_CONTAINER_WIDTH = 1200
const DEFAULT_ITEM_WIDTH = 120
const DEBOUNCE_DELAY = 150

export function ResourceContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(DEFAULT_CONTAINER_WIDTH)
  const [isLoading, setIsLoading] = useState(false)

  // 兜底逻辑：如果加载状态持续太久，强制结束
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.log('加载超时，强制结束加载状态')
        setIsLoading(false)
      }, 5000) // 5秒超时

      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  const { data, databaseDetails } = useDataStore(
    useShallow((state) => ({
      data: state.data,
      databaseDetails: state.databaseDetails,
    }))
  )

  const { primaryLayout, secondaryLayout } = useViewStore(
    useShallow((state) => ({
      primaryLayout: state.primaryLayout,
      secondaryLayout: state.secondaryLayout,
    }))
  )

  // 调试数据状态（仅在开发环境输出）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('数据状态更新:', {
        dataCount: data.length,
        hasDatabaseDetails: !!databaseDetails,
        primaryLayout,
        secondaryLayout,
        isLoading,
      })
    }
  }, [data, databaseDetails, primaryLayout, secondaryLayout, isLoading])

  // 使用 ref 存储当前宽度，避免依赖问题
  const currentWidthRef = useRef(DEFAULT_CONTAINER_WIDTH)

  // 监听容器宽度变化
  useEffect(() => {
    let resizeObserver: ResizeObserver
    let debounceTimer: NodeJS.Timeout

    const updateWidth = (skipLoading = false) => {
      try {
        if (containerRef.current) {
          const newWidth = containerRef.current.offsetWidth || DEFAULT_CONTAINER_WIDTH
          // 只有在宽度真正改变时才更新
          if (newWidth !== currentWidthRef.current) {
            console.log('更新容器宽度:', newWidth)
            currentWidthRef.current = newWidth
            setContainerWidth(newWidth)
          }
        } else {
          console.log('containerRef.current 为空，使用默认宽度')
          currentWidthRef.current = DEFAULT_CONTAINER_WIDTH
          setContainerWidth(DEFAULT_CONTAINER_WIDTH)
        }
        if (!skipLoading) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('更新宽度时出错:', error)
        currentWidthRef.current = DEFAULT_CONTAINER_WIDTH
        setContainerWidth(DEFAULT_CONTAINER_WIDTH)
        if (!skipLoading) {
          setIsLoading(false)
        }
      }
    }

    const debouncedUpdateWidth = () => {
      setIsLoading(true)
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        updateWidth()
      }, DEBOUNCE_DELAY)
    }

    if (containerRef.current) {
      console.log('开始观察容器变化')
      resizeObserver = new ResizeObserver(debouncedUpdateWidth)
      resizeObserver.observe(containerRef.current)

      // 初始化宽度，不触发 loading
      updateWidth(true)
    } else {
      console.log('containerRef.current 为空，无法观察')
      currentWidthRef.current = DEFAULT_CONTAINER_WIDTH
      setContainerWidth(DEFAULT_CONTAINER_WIDTH)
    }

    return () => {
      console.log('清理容器宽度监听器')
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      clearTimeout(debounceTimer)
    }
  }, []) // 移除依赖，避免频繁重建

  // 获取属性配置
  const properties = useMemo(() => {
    if (!databaseDetails || !primaryLayout || !secondaryLayout) {
      return null
    }

    const primaryProperty = Object.values(databaseDetails.properties).find(
      (prop) => prop.id === primaryLayout
    )
    const secondaryProperty = Object.values(databaseDetails.properties).find(
      (prop) => prop.id === secondaryLayout
    )

    if (
      !primaryProperty ||
      primaryProperty.type !== 'multi_select' ||
      !secondaryProperty ||
      secondaryProperty.type !== 'multi_select'
    ) {
      return null
    }

    return { primaryProperty, secondaryProperty }
  }, [databaseDetails, primaryLayout, secondaryLayout])

  // 构建数据结构
  const { primaryGroups, uncategorizedItems } = useMemo(() => {
    if (!data.length || !properties) {
      return { primaryGroups: [], uncategorizedItems: [] }
    }

    const { primaryProperty, secondaryProperty } = properties
    const primaryOptions = primaryProperty.multi_select.options || []
    const secondaryOptions = secondaryProperty.multi_select.options || []

    // 构建主要分组
    const groups: PrimaryGroup[] = primaryOptions
      .map((primaryOption) => {
        const subcategories: SecondaryGroup[] = []

        // 添加次要分类分组
        secondaryOptions.forEach((secondaryOption) => {
          const items = data.filter((item) => {
            const primaryValues = item[primaryProperty.name] as any[]
            const secondaryValues = item[secondaryProperty.name] as any[]

            const hasPrimary = primaryValues?.some((value) => value.id === primaryOption.id)
            const hasSecondary = secondaryValues?.some((value) => value.id === secondaryOption.id)

            return hasPrimary && hasSecondary
          }) as NotionPage[]

          if (items.length > 0) {
            subcategories.push({
              id: secondaryOption.id,
              name: secondaryOption.name,
              items,
              itemsCount: items.length,
              itemsFeaturedCount: 0, // 可以根据需要实现 featured 逻辑
            })
          }
        })

        // 添加未分类项目（只有主分类，没有次分类）
        const uncategorizedInPrimary = data.filter((item) => {
          const primaryValues = item[primaryProperty.name] as any[]
          const secondaryValues = item[secondaryProperty.name] as any[]

          const hasPrimary = primaryValues?.some((value) => value.id === primaryOption.id)
          const hasSecondary = secondaryValues && secondaryValues.length > 0

          return hasPrimary && !hasSecondary
        }) as NotionPage[]

        if (uncategorizedInPrimary.length > 0) {
          subcategories.push({
            id: `uncategorized-${primaryOption.id}`,
            name: '未分类',
            items: uncategorizedInPrimary,
            itemsCount: uncategorizedInPrimary.length,
            itemsFeaturedCount: 0,
          })
        }

        return {
          id: primaryOption.id,
          name: primaryOption.name,
          subcategories,
        }
      })
      .filter((group) => group.subcategories.length > 0)

    // 处理完全未分类的项目
    const uncategorized = data.filter((item) => {
      const primaryValues = item[primaryProperty.name] as any[]
      return !primaryValues || primaryValues.length === 0
    }) as NotionPage[]

    return { primaryGroups: groups, uncategorizedItems: uncategorized }
  }, [data, properties])

  // 缓存之前的布局结果
  const previousLayoutRef = useRef<LayoutGroup[]>([])

  // 计算布局
  const layoutGroups: LayoutGroup[] = useMemo(() => {
    // 如果没有主分组数据，直接返回空数组
    if (primaryGroups.length === 0) {
      console.log('没有主分组数据')
      return []
    }

    // 如果正在加载且有之前的布局数据，保持之前的布局以避免闪烁
    if (isLoading && previousLayoutRef.current.length > 0) {
      console.log('加载中，保持现有布局')
      return previousLayoutRef.current
    }

    console.log('开始计算布局，主分组数量:', primaryGroups.length, '容器宽度:', containerWidth)

    try {
      const newLayout = primaryGroups.map((primaryGroup) => {
        const subcategoryDetails: SubcategoryDetails[] = primaryGroup.subcategories.map(
          (subcat) => ({
            name: subcat.name,
            itemsCount: subcat.itemsCount,
            itemsFeaturedCount: subcat.itemsFeaturedCount,
          })
        )

        console.log(`计算 ${primaryGroup.name} 的布局，次分类数量:`, subcategoryDetails.length)

        const layout = getGridCategoryLayout({
          categoryName: primaryGroup.name,
          subcategories: subcategoryDetails,
          isOverriden: false,
          containerWidth,
          itemWidth: DEFAULT_ITEM_WIDTH,
        })

        console.log(`${primaryGroup.name} 布局计算完成，行数:`, layout.length)

        return { primaryGroup, layout }
      })

      // 缓存新的布局结果
      previousLayoutRef.current = newLayout
      return newLayout
    } catch (error) {
      console.error('计算布局时出错:', error)
      return previousLayoutRef.current.length > 0 ? previousLayoutRef.current : []
    }
  }, [primaryGroups, containerWidth, isLoading])

  // 渲染次要分组 - 使用 shadcn Card 组件
  const renderSecondaryGroup = useCallback(
    (subcat: SecondaryGroup, percentage: number) => (
      <Card
        key={subcat.id}
        className="bg-level-2 border border-subtle transition-all duration-300"
        style={{
          width: `calc(${percentage}% - 1rem)`,
          minWidth: '280px',
          maxWidth: `calc(${percentage}% - 1rem)`,
        }}
      >
        <CardHeader className="pb-3 bg-level-3/50 border-b border-subtle">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground truncate">
              {subcat.name}
            </CardTitle>
            <Badge variant="secondary" className="ml-2 shrink-0 bg-primary/10 text-primary">
              {subcat.items.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
            {subcat.items.map((item) => (
              <ResourceItem key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    []
  )

  // 渲染主要分组 - 使用现代扁平设计
  const renderPrimaryGroup = useCallback(
    ({ primaryGroup, layout }: LayoutGroup) => (
      <div key={primaryGroup.id} className="mb-12">
        {/* 主分类标题 - 扁平现代风格 */}
        <div className="mb-8 p-6 bg-level-1 rounded-2xl border border-subtle shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="h-2 w-12 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {primaryGroup.name}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            <Badge variant="outline" className="bg-level-3 border-emphasis text-foreground/80">
              {primaryGroup.subcategories.reduce((acc, sub) => acc + sub.items.length, 0)} 项
            </Badge>
          </div>
        </div>

        {/* 按行渲染布局 */}
        <div className="space-y-6">
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap w-full gap-6">
              {row.map((column) => {
                const subcat = primaryGroup.subcategories.find(
                  (s) => s.name === column.subcategoryName
                )
                return subcat ? renderSecondaryGroup(subcat, column.percentage) : null
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    [renderSecondaryGroup]
  )

  // 渲染完全未分类的项目 - 使用 Card 组件
  const renderUncategorizedItems = useCallback(() => {
    if (uncategorizedItems.length === 0) return null

    return (
      <div className="mt-16 pt-8 border-t-2 border-destructive/20">
        <div className="mb-8 p-6 bg-level-1 rounded-2xl border border-destructive/20 shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="h-2 w-12 bg-gradient-to-r from-destructive to-destructive/60 rounded-full" />
            <h2 className="text-2xl font-bold text-foreground tracking-tight">未分配一级分类</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-destructive/30 to-transparent" />
            <Badge variant="destructive" className="shadow-subtle">
              {uncategorizedItems.length} 项
            </Badge>
          </div>
        </div>

        <Card className="bg-level-2 border border-destructive/20 shadow-medium">
          <CardContent className="p-8">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {uncategorizedItems.map((item) => (
                <ResourceItem key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }, [uncategorizedItems])

  // 加载状态 - 使用 Skeleton 组件
  const renderLoadingState = () => (
    <div className="space-y-10">
      {/* 标题骨架 */}
      <div className="p-6 bg-level-1 rounded-2xl border border-subtle">
        <div className="flex items-center gap-4">
          <Skeleton className="h-2 w-12 rounded-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="flex-1 h-px" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* 卡片骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-level-2 border border-subtle">
            <CardHeader className="pb-3 bg-level-3/50 border-b border-subtle">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, itemIndex) => (
                  <div key={itemIndex} className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  // 加载状态 - 只在初始加载且没有数据时显示
  if (isLoading && layoutGroups.length === 0 && primaryGroups.length === 0) {
    return <div className="p-8 bg-level-0 min-h-screen">{renderLoadingState()}</div>
  }

  // 条件渲染
  if (!primaryLayout || !secondaryLayout) {
    return (
      <div className="flex items-center justify-center py-20 bg-level-0 min-h-screen">
        <Card className="bg-level-2 border border-emphasis shadow-medium max-w-md">
          <CardContent className="p-10 text-center">
            <div className="text-6xl mb-6 opacity-60">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">配置布局选项</h3>
            <p className="text-muted-foreground leading-relaxed">
              请在页面顶部选择主要布局和次要布局以开始浏览资源
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (layoutGroups.length === 0 && uncategorizedItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 bg-level-0 min-h-screen">
        <Card className="bg-level-2 border border-emphasis shadow-medium max-w-md">
          <CardContent className="p-10 text-center">
            <div className="text-6xl mb-6 opacity-60">📋</div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">暂无数据</h3>
            <p className="text-muted-foreground leading-relaxed">
              当前所选布局暂无匹配数据，请尝试其他布局选项
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="p-8 min-h-screen bg-level-0">
      {/* 主要分组 */}
      <div
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-70' : 'opacity-100'}`}
      >
        {layoutGroups.map(renderPrimaryGroup)}
      </div>

      {/* 未分类项目 */}
      {renderUncategorizedItems()}
    </div>
  )
}
