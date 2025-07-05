'use client'

import { ArrowLeft, Search, X } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from './components/empty-state'
import { LoadingState } from './components/loading-state'
import { SearchResultGroup } from './components/search-result-group'
import { useSearch } from './states/use-search'
import type { SearchCommandProps, SearchResult } from './types'
import { getUrl } from './utils/utils'

export function MobileSearchModal({ open, onOpenChange }: SearchCommandProps) {
  const { query, results, loading, setQuery, reset, handleCompositionStart, handleCompositionEnd } =
    useSearch()

  // 防止背景页面滚动
  useEffect(() => {
    if (open) {
      // 保存当前的overflow样式
      const originalStyle = window.getComputedStyle(document.body).overflow
      // 阻止背景滚动
      document.body.style.overflow = 'hidden'

      return () => {
        // 恢复原始样式
        document.body.style.overflow = originalStyle
      }
    }
  }, [open])

  // 处理项目选择
  const handleSelect = (item: SearchResult) => {
    const url = getUrl(item)
    if (url !== '#') {
      if (item.type === 'blog') {
        // 博客文章在同一窗口打开
        window.location.href = url
      } else {
        // 资源链接在新窗口打开
        window.open(url, '_blank')
      }
    }
    onOpenChange(false)
    reset()
  }

  // 关闭模态框
  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  // 分组结果
  const blogResults = results.filter((item) => item.type === 'blog')
  const resourceResults = results.filter((item) => item.type === 'resource')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background md:hidden flex flex-col">
      {/* 优化的头部区域 */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">返回</span>
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索博客和资源..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              className="pl-10 pr-10 h-11 border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary text-base bg-muted/50"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">清空</span>
              </Button>
            )}
          </div>
        </div>

        {/* 搜索状态指示器 */}
        {query && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {loading ? '正在搜索...' : `找到 ${results.length} 个结果`}
              </span>
              {!loading && results.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  博客 {blogResults.length} • 资源 {resourceResults.length}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 内容区域 - 确保可以正确滚动 */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {loading && <LoadingState />}

        {!loading && !query && <EmptyState query={query} type="initial" />}

        {!loading && query && results.length === 0 && (
          <EmptyState query={query} type="no-results" />
        )}

        {!loading && results.length > 0 && (
          <div className="p-4 space-y-8">
            {/* 博客文章组 */}
            {blogResults.length > 0 && (
              <SearchResultGroup
                title="博客文章"
                results={blogResults}
                query={query}
                onSelect={handleSelect}
                isMobileView={true}
              />
            )}

            {/* 资源收藏组 */}
            {resourceResults.length > 0 && (
              <SearchResultGroup
                title="资源收藏"
                results={resourceResults}
                query={query}
                onSelect={handleSelect}
                isMobileView={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
