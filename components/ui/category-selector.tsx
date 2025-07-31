'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { NotionCategoryViewPage } from '@/types/notion'

interface CategorySelectorProps {
  value: string[]
  onValueChange: (value: string[]) => void
  categoryViewData: NotionCategoryViewPage[]
  placeholder?: string
  className?: string
}

/**
 * 分类选择器组件，支持多选
 */
export function CategorySelector({
  value = [],
  onValueChange,
  categoryViewData,
  placeholder = '选择分类',
  className,
}: CategorySelectorProps) {
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] = useState<string | null>(null)

  // 获取显示名称
  const getDisplayName = (categoryId: string) => {
    // 查找是否是二级分类
    for (const primaryCat of categoryViewData) {
      const secondaryCategory = primaryCat.children.find((child: any) => child.id === categoryId)
      if (secondaryCategory) {
        return `${primaryCat.name} > ${secondaryCategory.name}`
      }
    }

    return '未知分类'
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

  // /**
  //  * 获取指定一级分类下所有子分类的资源总数
  //  */
  // const getPrimaryCategoryResourceCount = (primaryCategoryId: string) => {
  //   const primaryCategory = categoryViewData.find(
  //     (cat: any) => cat.id === primaryCategoryId
  //   );
  //   if (!primaryCategory) return 0;
  //   return getCategoryResourceCount(primaryCategory);
  // };

  // 处理分类选择
  const handleCategorySelect = (categoryId: string) => {
    const newValue = value.includes(categoryId)
      ? value.filter((id) => id !== categoryId)
      : [...value, categoryId]
    onValueChange(newValue)
  }

  // 处理主分类点击
  const handlePrimaryCategoryClick = (categoryId: string) => {
    setSelectedPrimaryCategory(categoryId)
  }

  // 获取显示文本
  const getDisplayText = () => {
    if (value.length === 0) return placeholder
    return value.map(getDisplayName).join('，')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn('w-full justify-between', className)}
        >
          {getDisplayText()}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[480px] p-0">
        <div className="flex h-[450px]">
          {/* 左列：一级分类 */}
          <div className="w-1/2 border-r border-border">
            <div className="px-3 py-2 border-b border-border bg-muted/50">
              <span className="text-sm font-medium text-muted-foreground">主分类</span>
            </div>
            <div className="overflow-y-auto max-h-[410px]">
              {/* 一级分类列表 */}
              {categoryViewData.map((category: any) => (
                <button
                  key={category.id}
                  className={cn(
                    'w-full flex items-center px-3 py-2 cursor-pointer hover:bg-accent text-sm text-left',
                    selectedPrimaryCategory === category.id && 'bg-accent text-accent-foreground'
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
              {selectedPrimaryCategory ? (
                // 显示选中主分类的子分类
                categoryViewData
                  .find((cat: any) => cat.id === selectedPrimaryCategory)
                  ?.children.map((child: any) => (
                    <button
                      key={child.id}
                      className={cn(
                        'w-full flex items-center px-3 py-2 cursor-pointer hover:bg-accent text-sm text-left',
                        value.includes(child.id) && 'bg-accent text-accent-foreground'
                      )}
                      onClick={() => handleCategorySelect(child.id)}
                    >
                      <span className="flex-1">{child.name}</span>
                      {child.links && child.links.length > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted rounded px-1">
                          {child.links.length}
                        </span>
                      )}
                    </button>
                  )) || []
              ) : (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  点击左侧主分类查看子分类
                </div>
              )}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
