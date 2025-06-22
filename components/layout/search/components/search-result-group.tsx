import * as React from 'react'
import { CommandGroup } from '@/components/ui/command'
import { SearchResult } from './search-result'
import { MobileSearchResult } from './mobile-search-result'
import { FileText, Link } from 'lucide-react'
import type { SearchResult as SearchResultType } from '../types'
import { isMobile } from '../utils/utils'

interface SearchResultGroupProps {
  title: string
  results: SearchResultType[]
  query: string
  onSelect: (item: SearchResultType) => void
  isMobileView?: boolean
}

export function SearchResultGroup({
  title,
  results,
  query,
  onSelect,
  isMobileView,
}: SearchResultGroupProps) {
  if (results.length === 0) return null

  // 如果明确指定为移动端视图，或者自动检测为移动设备
  const shouldUseMobileView = isMobileView || (typeof window !== 'undefined' && isMobile())

  // 确定组类型图标
  const groupIcon = title.includes('博客') ? (
    <FileText className="h-4 w-4 text-blue-500" />
  ) : (
    <Link className="h-4 w-4 text-green-500" />
  )

  if (shouldUseMobileView) {
    // 移动端视图
    return (
      <div className="space-y-4">
        {/* 分组标题 */}
        <div className="flex items-center gap-2 px-1">
          {groupIcon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {results.length}项
          </span>
        </div>

        {/* 结果列表 */}
        <div className="space-y-3">
          {results.map((item) => (
            <MobileSearchResult
              key={`${item.type}-${item.id}`}
              item={item}
              query={query}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    )
  }

  // 桌面端视图
  return (
    <CommandGroup
      heading={
        <div className="flex items-center gap-2 text-sm font-medium">
          {groupIcon}
          <span>{title}</span>
          <span className="text-xs text-muted-foreground">({results.length})</span>
        </div>
      }
    >
      {results.map((item) => (
        <SearchResult
          key={`${item.type}-${item.id}`}
          item={item}
          query={query}
          onSelect={onSelect}
        />
      ))}
    </CommandGroup>
  )
}
