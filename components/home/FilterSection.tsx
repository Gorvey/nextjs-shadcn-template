'use client'

import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/contexts/app-context'
import { cn } from '@/lib/utils'

export function FilterSection() {
  // 使用新的Context系统
  const { state, setViewType, setCurrentCategorySlug, setExpandedPrimaryCategory } = useApp()
  const { viewType, currentCategorySlug, categoryViewData, expandedPrimaryCategory } = state

  // 获取显示名称
  const getDisplayName = (categoryId: string) => {
    if (categoryId === 'all') return '全部分类'

    // 先查找是否是一级分类
    const primaryCategory = categoryViewData.find((cat: any) => cat.id === categoryId)
    if (primaryCategory) {
      return primaryCategory.name
    }

    // 再查找是否是二级分类
    for (const primaryCat of categoryViewData) {
      const secondaryCategory = primaryCat.children.find((child: any) => child.id === categoryId)
      if (secondaryCategory) {
        return `${primaryCat.name} > ${secondaryCategory.name}`
      }
    }

    return '未知分类'
  }

  // 获取当前展开的一级分类的子分类
  const getSecondaryCategories = (primaryCategoryId: string) => {
    if (primaryCategoryId === 'all') return []

    const primaryCategory = categoryViewData.find((cat: any) => cat.id === primaryCategoryId)
    return primaryCategory ? primaryCategory.children : []
  }

  // 获取分类下的资源总数
  const getCategoryResourceCount = (category: any) => {
    // 主分类本身的资源数量
    const primaryResourceCount = category.links ? category.links.length : 0

    // 所有子分类的资源数量
    const childrenResourceCount = category.children.reduce((total: number, child: any) => {
      return total + (child.links ? child.links.length : 0)
    }, 0)

    return primaryResourceCount + childrenResourceCount
  }

  /**
   * 获取所有分类的资源总数
   */
  const getAllCategoriesResourceCount = () => {
    return categoryViewData.reduce((total: number, category: any) => {
      return total + getCategoryResourceCount(category)
    }, 0)
  }

  /**
   * 获取指定一级分类下所有子分类的资源总数
   */
  const getAllSecondariesResourceCount = (primaryCategoryId: string) => {
    const primaryCategory = categoryViewData.find((cat: any) => cat.id === primaryCategoryId)
    if (!primaryCategory) return 0

    return getCategoryResourceCount(primaryCategory)
  }

  /**
   * 获取所有的子分类列表
   */
  const getAllSecondaryCategories = () => {
    const allSecondaries: any[] = []
    categoryViewData.forEach((category: any) => {
      if (category.children && category.children.length > 0) {
        allSecondaries.push(...category.children)
      }
    })
    return allSecondaries
  }

  // 处理主分类点击
  const handlePrimaryCategoryClick = (categoryId: string) => {
    if (categoryId === 'all') {
      // 全部分类直接选择
      setCurrentCategorySlug('all')
      setExpandedPrimaryCategory('all')
    } else {
      const category = categoryViewData.find((cat: any) => cat.id === categoryId)
      if (category && category.children.length > 0) {
        // 有子分类的情况，直接选择主分类（相当于选择全部二级分类）
        setCurrentCategorySlug(categoryId)
        setExpandedPrimaryCategory(categoryId) // 同时展开显示子分类
      } else {
        // 没有子分类，直接选择
        setCurrentCategorySlug(categoryId)
        setExpandedPrimaryCategory(null)
      }
    }
  }

  return (
    <div className="flex items-center justify-start mb-8">
      {/* 右侧：视图切换和功能按钮 */}
      <div className="flex items-center gap-4 mr-4">
        {/* 视图类型切换 */}
        <div className="flex items-center">
          <div className="mr-2 text-foreground">页面类型:</div>
          <Tabs onValueChange={(value) => setViewType(value as 'card' | 'grid')} value={viewType}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="card">Card</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {/* 左侧：只在Card模式显示分类筛选器 */}
      <div className="flex items-center gap-4">
        {
          <div className="flex items-center gap-4">
            <div className="text-foreground">分类筛选:</div>

            {/* 树形分类选择器 */}
            <Select value={currentCategorySlug} onValueChange={setCurrentCategorySlug}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择分类">
                  {getDisplayName(currentCategorySlug)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[480px] p-0">
                <div className="flex h-[450px]">
                  {/* 左列：一级分类 */}
                  <div className="w-1/2 border-r border-border">
                    <div className="px-3 py-2 border-b border-border bg-muted/50">
                      <span className="text-sm font-medium text-muted-foreground">主分类</span>
                    </div>
                    <div className="overflow-y-auto max-h-[410px]">
                      {/* 全部分类选项 */}
                      <button
                        className={cn(
                          'w-full flex items-center px-3 py-2 cursor-pointer hover:bg-accent text-sm text-left',
                          currentCategorySlug === 'all' && 'bg-accent text-accent-foreground'
                        )}
                        onClick={() => {
                          setCurrentCategorySlug('all')
                          setExpandedPrimaryCategory('all')
                        }}
                      >
                        <span className="flex-1">全部分类</span>
                        {getAllCategoriesResourceCount() > 0 && (
                          <span className="text-xs text-muted-foreground bg-muted rounded px-1">
                            {getAllCategoriesResourceCount()}
                          </span>
                        )}
                      </button>

                      {/* 一级分类列表 */}
                      {categoryViewData.map((category: any) => (
                        <button
                          key={category.id}
                          className={cn(
                            'w-full flex items-center px-3 py-2 cursor-pointer hover:bg-accent text-sm text-left',
                            currentCategorySlug === category.id &&
                              'bg-accent text-accent-foreground',
                            expandedPrimaryCategory === category.id && 'bg-muted'
                          )}
                          onClick={() => handlePrimaryCategoryClick(category.id)}
                        >
                          <span className="flex-1">{category.name}</span>
                          {getCategoryResourceCount(category) > 0 && (
                            <span className="text-xs text-muted-foreground bg-muted rounded px-1">
                              {getCategoryResourceCount(category)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 右列：二级分类 */}
                  <div className="w-1/2">
                    <div className="px-3 py-2 border-b border-border bg-muted/50">
                      <span className="text-sm font-medium text-muted-foreground">子分类</span>
                    </div>
                    <div className="overflow-y-auto max-h-[410px]">
                      {expandedPrimaryCategory === 'all' ? (
                        <div className="px-3 py-8 text-center">
                          <div className="text-sm text-muted-foreground mb-4">已选择全部分类</div>
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div>{categoryViewData.length} 个主分类</div>
                            <div>{getAllSecondaryCategories().length} 个子分类</div>
                            <div className="text-primary font-medium">
                              共 {getAllCategoriesResourceCount()} 个资源
                            </div>
                          </div>
                        </div>
                      ) : expandedPrimaryCategory ? (
                        <>
                          {/* 全部子分类选项 */}
                          <button
                            className={cn(
                              'w-full flex items-center px-3 py-2 cursor-pointer hover:bg-accent text-sm text-left',
                              currentCategorySlug === expandedPrimaryCategory &&
                                'bg-accent text-accent-foreground'
                            )}
                            onClick={() => setCurrentCategorySlug(expandedPrimaryCategory)}
                          >
                            <span className="flex-1">
                              {getSecondaryCategories(expandedPrimaryCategory).length > 0
                                ? '全部子分类'
                                : '该分类'}
                            </span>
                            {getAllSecondariesResourceCount(expandedPrimaryCategory) > 0 && (
                              <span className="text-xs text-muted-foreground bg-muted rounded px-1">
                                {getAllSecondariesResourceCount(expandedPrimaryCategory)}
                              </span>
                            )}
                          </button>

                          {/* 二级分类列表 */}
                          {getSecondaryCategories(expandedPrimaryCategory).map((child: any) => (
                            <button
                              key={child.id}
                              className={cn(
                                'w-full flex items-center px-3 py-2 cursor-pointer hover:bg-accent text-sm text-left',
                                currentCategorySlug === child.id &&
                                  'bg-accent text-accent-foreground'
                              )}
                              onClick={() => setCurrentCategorySlug(child.id)}
                            >
                              <span className="flex-1">{child.name}</span>
                              {child.links && child.links.length > 0 && (
                                <span className="text-xs text-muted-foreground bg-muted rounded px-1">
                                  {child.links.length}
                                </span>
                              )}
                            </button>
                          ))}
                        </>
                      ) : (
                        <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                          点击左侧主分类查看子分类
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SelectContent>
            </Select>
          </div>
        }
      </div>
    </div>
  )
}
