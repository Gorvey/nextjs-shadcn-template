'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useApp } from '@/lib/contexts/app-context'
import type { NotionCategoryViewPage } from '@/types/notion'
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
const DEBOUNCE_DELAY = 200
const WIDTH_CHANGE_THRESHOLD = 10 // 宽度变化阈值，避免微小变化

// 定义gap常量
const ROW_GAP_PX = 24 // gap-6 = 1.5rem = 24px

export function ResourceContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(DEFAULT_CONTAINER_WIDTH)
  const lastWidthRef = useRef(DEFAULT_CONTAINER_WIDTH)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 从Context获取数据和状态
  const { state } = useApp()
  const { categoryViewData, loading, currentCategorySlug } = state

  // 判断 currentCategorySlug 类型
  const isAll = currentCategorySlug === 'all'
  const primaryCategory = categoryViewData.find((cat) => cat.id === currentCategorySlug)
  let secondaryCategory: any = null
  let secondaryParent: any = null
  if (!isAll && !primaryCategory) {
    for (const cat of categoryViewData) {
      const found = cat.children.find((child) => child.id === currentCategorySlug)
      if (found) {
        secondaryCategory = found
        secondaryParent = cat
        break
      }
    }
  }

  // 优化的宽度更新函数
  const updateWidth = useCallback(() => {
    if (!containerRef.current) return

    // 只在容器可见时更新宽度
    const style = window.getComputedStyle(containerRef.current)
    if (style.opacity === '0' || style.pointerEvents === 'none' || style.display === 'none') {
      return
    }

    const newWidth = containerRef.current.offsetWidth || DEFAULT_CONTAINER_WIDTH

    // 只有当宽度变化超过阈值时才更新
    if (Math.abs(newWidth - lastWidthRef.current) > WIDTH_CHANGE_THRESHOLD) {
      lastWidthRef.current = newWidth
      setContainerWidth(newWidth)
    }
  }, [])

  // 防抖的宽度更新
  const debouncedUpdateWidth = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(updateWidth, DEBOUNCE_DELAY)
  }, [updateWidth])

  // 使用useLayoutEffect来减少重绘，只在mount时设置一次ResizeObserver
  useLayoutEffect(() => {
    const setupObserver = () => {
      if (!containerRef.current) return

      // 立即更新宽度
      updateWidth()

      // 清理之前的observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }

      // 设置新的ResizeObserver
      resizeObserverRef.current = new ResizeObserver(debouncedUpdateWidth)
      resizeObserverRef.current.observe(containerRef.current)
    }

    setupObserver()

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, []) // 空依赖数组，只在mount/unmount时执行

  // 渲染次要分组，宽度动态联动gap
  /**
   * 渲染次要分组，宽度动态联动gap
   * @param subcat 子分类对象
   * @param percentage 当前分组的百分比宽度
   * @param rowLength 当前行元素个数
   * @param gapPx 当前行的gap（像素）
   */
  const renderSecondaryGroup = useCallback(
    (subcat: NotionCategoryViewPage, percentage: number, rowLength: number, gapPx: number) => {
      // 计算每个元素分摊的gap
      const gapShare = rowLength > 1 ? (rowLength - 1) * gapPx * (percentage / 100) : 0
      const width = `calc(${percentage}% - ${gapShare}px)`
      return (
        <Card
          key={subcat.id}
          className="bg-card/80 border border-border/60"
          style={{
            width,
            minWidth: '180px',
            maxWidth: width,
          }}
        >
          <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-foreground truncate">
                {subcat.name}
              </CardTitle>
              <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
                {subcat.links.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
              {subcat.links.map((item) => (
                <ResourceItem key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )
    },
    []
  )

  // 渲染主要分组的直接资源
  const renderPrimaryCategoryResources = useCallback(
    (primaryCategory: NotionCategoryViewPage, percentage: number) => {
      if (primaryCategory.links.length === 0) return null

      return (
        <Card
          key={`${primaryCategory.id}-direct`}
          className="bg-card/80 border border-border/60"
          style={{
            width: `calc(${percentage}% - 1rem)`,
            minWidth: '280px',
            maxWidth: `calc(${percentage}% - 1rem)`,
          }}
        >
          <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
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

  // 重写renderPrimaryGroup，传递gap和itemCount
  const renderPrimaryGroup = useCallback(
    ({ primaryCategory, layout }: LayoutGroup) => (
      <div key={primaryCategory.id} className="mb-12">
        {/* 主分类标题 - 扁平现代风格 */}
        <div className="mb-8 p-4 bg-background/90 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-2 w-12 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {primaryCategory.name}
              </h2>
              <Badge variant="outline" className="bg-muted/80 border-primary/30 text-foreground/80">
                {primaryCategory.children.reduce((acc, sub) => acc + sub.links.length, 0) +
                  primaryCategory.links.length}{' '}
                项
              </Badge>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          {primaryCategory.desc && (
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {primaryCategory.desc}
            </p>
          )}
        </div>

        {/* 按行渲染布局 */}
        <div className="space-y-6">
          {layout.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex flex-wrap w-full"
              style={{ gap: `${ROW_GAP_PX}px` }}
            >
              {row.map((column) => {
                // 查找对应的子分类
                const subcat = primaryCategory.children.find(
                  (s) => s.name === column.subcategoryName
                )

                // 处理主分类直接资源的情况
                if (column.subcategoryName === `${primaryCategory.name} (直接资源)`) {
                  // 保持原有主分类直接资源宽度逻辑
                  return renderPrimaryCategoryResources(primaryCategory, column.percentage)
                }

                return subcat
                  ? renderSecondaryGroup(subcat, column.percentage, row.length, ROW_GAP_PX)
                  : null
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    [renderSecondaryGroup, renderPrimaryCategoryResources]
  )

  // 计算布局配置
  const layoutGroups = useMemo(() => {
    if (!categoryViewData.length) return []

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

  // 加载状态 - 使用 Skeleton 组件
  if (loading && layoutGroups.length === 0) {
    return (
      <div className="p-8 bg-background/50 min-h-screen">
        <div className="space-y-10">
          <div className="p-6 bg-background/90 rounded-2xl border border-border/60">
            <div className="flex items-center gap-4">
              <Skeleton className="h-2 w-12 rounded-full" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="flex-1 h-px" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-card/80 border border-border/60">
                <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
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

  // 子分类筛选：渲染主分类头部+该子分类内容
  if (secondaryCategory && secondaryParent) {
    return (
      <div className="min-h-screen">
        {/* 主分类头部 */}
        <div className="mb-8 p-4 bg-background/90 rounded-2xl border border-border/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-2 w-12 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                {secondaryParent.name}
              </h2>
              <Badge variant="outline" className="bg-muted/80 border-primary/30 text-foreground/80">
                {secondaryParent.children.reduce(
                  (acc: number, sub: { links: any[] }) => acc + sub.links.length,
                  0
                ) + secondaryParent.links.length}{' '}
                项
              </Badge>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>
          {secondaryParent.desc && (
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              {secondaryParent.desc}
            </p>
          )}
        </div>
        {/* 子分类内容 */}
        <div className="flex flex-wrap w-full gap-6">
          <Card
            key={secondaryCategory.id}
            className="bg-card/80 border border-border/60"
            style={{ minWidth: '280px', width: '100%' }}
          >
            <CardHeader className="pb-3 bg-muted/30 border-b border-border/60">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-foreground truncate">
                  {secondaryCategory.name}
                </CardTitle>
                <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
                  {secondaryCategory.links.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
                {secondaryCategory.links.map((item: any) => (
                  <ResourceItem key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 主分类筛选：只渲染该主分类分组
  if (primaryCategory) {
    const layout = layoutGroups.find((g) => g.primaryCategory.id === primaryCategory.id)
    return <div className="min-h-screen">{layout ? renderPrimaryGroup(layout) : null}</div>
  }

  // "all" 或无匹配，保持原有全部渲染
  return (
    <div ref={containerRef} className=" min-h-screen ">
      {/* 主要分组 */}
      <div>{layoutGroups.map(renderPrimaryGroup)}</div>
    </div>
  )
}
