/**
 * ResourceContainer 组件
 *
 * 重构后的资源容器组件，具有以下特性：
 * 1. 三级结构：主分类(NotionCategoryViewPage) -> 次分类(children) -> 资源项(links)
 * 2. 智能布局：基于 gridCategoryLayout 算法计算最优宽度百分比
 * 3. 响应式设计：监听容器宽度变化并重新计算布局
 * 4. 性能优化：使用防抖、useCallback、useMemo 等优化渲染
 * 5. 现代扁平设计：大量使用shadcn组件，简洁现代的视觉风格
 *
 * 设计理念：
 * - 使用新的层级分类数据结构(NotionCategoryViewPage)
 * - 第一级：主分组，第二级：卡片分组，第三级：资源项
 * - 扁平化设计：减少不必要的阴影和边框
 * - 简洁现代：使用shadcn组件系统提供一致的视觉体验
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { API_ENDPOINTS, fetcher } from '@/lib/swr/config'
import type { NotionCategoryPage, NotionCategoryViewPage, NotionPage } from '@/types/notion'
import { transformCategoriesToViewData } from '@/utils/category'
import getGridCategoryLayout, {
  type GridCategoryLayout,
  type SubcategoryDetails,
} from './gridCategoryLayout'
import { ResourceItem } from './ResourceItem'

// 布局数据结构
interface LayoutGroup {
  primaryCategory: NotionCategoryViewPage
  layout: GridCategoryLayout
}

// 默认配置
const DEFAULT_CONTAINER_WIDTH = 1200
const DEFAULT_ITEM_WIDTH = 120
const DEBOUNCE_DELAY = 150

export function ResourceContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(DEFAULT_CONTAINER_WIDTH)

  // 简单的数据获取
  const { data: resources = [], isLoading: resourcesLoading } = useSWR<NotionPage[]>(
    API_ENDPOINTS.RESOURCES,
    fetcher
  )
  const { data: categories = [], isLoading: categoriesLoading } = useSWR<NotionCategoryPage[]>(
    API_ENDPOINTS.CATEGORIES,
    fetcher
  )

  const isDataLoading = resourcesLoading || categoriesLoading

  // 转换分类数据
  const categoryViewData = useMemo(() => {
    if (categories.length && resources.length) {
      return transformCategoriesToViewData(categories, resources)
    }
    return []
  }, [categories, resources])

  // 监听容器宽度变化
  useEffect(() => {
    let resizeObserver: ResizeObserver
    let debounceTimer: NodeJS.Timeout

    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth || DEFAULT_CONTAINER_WIDTH
        setContainerWidth(newWidth)
      }
    }

    const debouncedUpdateWidth = () => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(updateWidth, DEBOUNCE_DELAY)
    }

    const setupObserver = () => {
      if (containerRef.current) {
        // 立即更新宽度
        updateWidth()

        // 设置ResizeObserver
        resizeObserver = new ResizeObserver(debouncedUpdateWidth)
        resizeObserver.observe(containerRef.current)
      }
    }

    // 如果containerRef已经存在，立即设置
    if (containerRef.current) {
      setupObserver()
    } else {
      // 否则在下一个tick中尝试设置
      const timer = setTimeout(setupObserver, 0)
      return () => clearTimeout(timer)
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect()
      clearTimeout(debounceTimer)
    }
  }, [])

  // 计算布局
  const layoutGroups: LayoutGroup[] = useMemo(() => {
    if (categoryViewData.length === 0) return []

    return categoryViewData.map((primaryCategory) => {
      // 只包含有links的子分类
      const subcategoryDetails: SubcategoryDetails[] = primaryCategory.children
        .filter((subcat) => subcat.links.length > 0) // 过滤掉没有links的子分类
        .map((subcat) => ({
          name: subcat.name,
          itemsCount: subcat.links.length,
          itemsFeaturedCount: 0,
        }))

      // 如果主分类本身有资源，也添加到布局中
      if (primaryCategory.links.length > 0) {
        subcategoryDetails.unshift({
          name: `${primaryCategory.name} (直接资源)`,
          itemsCount: primaryCategory.links.length,
          itemsFeaturedCount: 0,
        })
      }

      const layout = getGridCategoryLayout({
        categoryName: primaryCategory.name,
        subcategories: subcategoryDetails,
        isOverriden: false,
        containerWidth,
        itemWidth: DEFAULT_ITEM_WIDTH,
      })

      return { primaryCategory, layout }
    })
  }, [categoryViewData, containerWidth])

  // 渲染次要分组 - 使用 shadcn Card 组件
  const renderSecondaryGroup = useCallback(
    (subcat: NotionCategoryViewPage, percentage: number) => (
      <Card
        key={subcat.id}
        className="bg-level-2 border border-subtle"
        style={{
          width: `calc(${percentage}% - 12px)`,
          minWidth: '280px',
          maxWidth: `calc(${percentage}% - 12px)`,
        }}
      >
        <CardHeader className="pb-3 bg-level-3/50 border-b border-subtle">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-foreground truncate">
              {subcat.name}
            </CardTitle>
            <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
              {subcat.links.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
            {subcat.links.map((item) => (
              <ResourceItem key={item.id} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    []
  )

  // 渲染主要分组的直接资源
  const renderPrimaryCategoryResources = useCallback(
    (primaryCategory: NotionCategoryViewPage, percentage: number) => {
      if (primaryCategory.links.length === 0) return null

      return (
        <Card
          key={`${primaryCategory.id}-direct`}
          className="bg-level-2 border border-subtle"
          style={{
            width: `calc(${percentage}% - 1rem)`,
            minWidth: '280px',
            maxWidth: `calc(${percentage}% - 1rem)`,
          }}
        >
          <CardHeader className="pb-3 bg-level-3/50 border-b border-subtle">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-foreground truncate">
                {primaryCategory.name} (直接资源)
              </CardTitle>
              <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
                {primaryCategory.links.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
              {primaryCategory.links.map((item) => (
                <ResourceItem key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )
    },
    []
  )

  // 渲染主要分组 - 使用现代扁平设计
  const renderPrimaryGroup = useCallback(
    ({ primaryCategory, layout }: LayoutGroup) => (
      <div key={primaryCategory.id} className="mb-12">
        {/* 主分类标题 - 扁平现代风格 */}
        <div className="mb-8 p-6 bg-level-1 rounded-2xl border border-subtle shadow-subtle">
          <div className="flex items-center gap-4">
            <div className="h-2 w-12 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {primaryCategory.name}
              </h2>
              <Badge variant="outline" className="bg-level-3 border-emphasis text-foreground/80">
                {primaryCategory.children.reduce((acc, sub) => acc + sub.links.length, 0) +
                  primaryCategory.links.length}{' '}
                项
              </Badge>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          {primaryCategory.desc && (
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              {primaryCategory.desc}
            </p>
          )}
        </div>

        {/* 按行渲染布局 */}
        <div className="space-y-6">
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap w-full gap-6">
              {row.map((column) => {
                // 查找对应的子分类
                const subcat = primaryCategory.children.find(
                  (s) => s.name === column.subcategoryName
                )

                // 处理主分类直接资源的情况
                if (column.subcategoryName === `${primaryCategory.name} (直接资源)`) {
                  return renderPrimaryCategoryResources(primaryCategory, column.percentage)
                }

                return subcat ? renderSecondaryGroup(subcat, column.percentage) : null
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    [renderSecondaryGroup, renderPrimaryCategoryResources]
  )

  // 加载状态 - 使用 Skeleton 组件
  if (isDataLoading && layoutGroups.length === 0) {
    return (
      <div className="p-8 bg-level-0 min-h-screen">
        <div className="space-y-10">
          <div className="p-6 bg-level-1 rounded-2xl border border-subtle">
            <div className="flex items-center gap-4">
              <Skeleton className="h-2 w-12 rounded-full" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="flex-1 h-px" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
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
      </div>
    )
  }

  // 无数据状态
  if (layoutGroups.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 bg-level-0 min-h-screen">
        <Card className="bg-level-2 border border-emphasis shadow-medium max-w-md">
          <CardContent className="p-10 text-center">
            <div className="text-6xl mb-6 opacity-60">📋</div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">暂无分类数据</h3>
            <p className="text-muted-foreground leading-relaxed">
              系统正在从Notion获取分类数据，请稍候...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="p-8 min-h-screen bg-level-0">
      {/* 主要分组 */}
      <div>{layoutGroups.map(renderPrimaryGroup)}</div>
    </div>
  )
}
