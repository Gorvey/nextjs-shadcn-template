import * as React from 'react'
import { Search, SearchX } from 'lucide-react'

interface EmptyStateProps {
  query: string
  type: 'initial' | 'no-results'
}

export function EmptyState({ query, type }: EmptyStateProps) {
  if (type === 'initial') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
        <div className="text-muted-foreground mb-2">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">开始搜索</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          输入关键词搜索博客文章和资源收藏，支持搜索标题、描述和标签
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[300px]">
      <div className="text-muted-foreground mb-2">
        <SearchX className="w-12 h-12 mx-auto mb-3 opacity-50" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">未找到相关结果</h3>
      <p className="text-xs text-muted-foreground max-w-sm">
        尝试使用不同的关键词，或者检查拼写是否正确
      </p>
      <div className="mt-3 text-xs text-muted-foreground">
        搜索词：<span className="font-mono bg-muted px-1.5 py-0.5 rounded">{query}</span>
      </div>
    </div>
  )
}
