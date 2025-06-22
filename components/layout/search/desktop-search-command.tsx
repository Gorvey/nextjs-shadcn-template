'use client'

import * as React from 'react'
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from '@/components/ui/command'
import { DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { LoadingState } from './components/loading-state'
import { EmptyState } from './components/empty-state'
import { SearchResultGroup } from './components/search-result-group'
import { useSearch } from './states/use-search'
import { getUrl } from './utils/utils'
import type { SearchResult, SearchCommandProps } from './types'

export function DesktopSearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { query, results, loading, setQuery, reset, handleCompositionStart, handleCompositionEnd } =
    useSearch()

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

  // 重置状态
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      reset()
    }
  }

  // 分组结果
  const blogResults = results.filter((item) => item.type === 'blog')
  const resourceResults = results.filter((item) => item.type === 'resource')

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <VisuallyHidden>
        <DialogTitle>搜索</DialogTitle>
      </VisuallyHidden>
      <div className="border-b px-3">
        <CommandInput
          placeholder="搜索博客和资源..."
          value={query}
          onValueChange={setQuery}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          className="text-base"
        />
      </div>

      <div className="flex flex-col max-h-[500px]">
        {/* 搜索状态指示器 */}
        {query && (
          <div className="flex items-center justify-between px-4 py-2 text-sm border-b bg-muted/30">
            <span className="text-muted-foreground">
              {loading ? '正在搜索...' : `找到 ${results.length} 个结果`}
            </span>
            {!loading && results.length > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                  博客 {blogResults.length}
                </span>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                  资源 {resourceResults.length}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <CommandList className="max-h-none">
            {loading && <LoadingState />}

            {!loading && !query && <EmptyState query={query} type="initial" />}

            {!loading && query && results.length === 0 && (
              <EmptyState query={query} type="no-results" />
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {/* 博客文章组 */}
                {blogResults.length > 0 && (
                  <SearchResultGroup
                    title="博客文章"
                    results={blogResults}
                    query={query}
                    onSelect={handleSelect}
                  />
                )}

                {/* 资源收藏组 */}
                {resourceResults.length > 0 && (
                  <SearchResultGroup
                    title="资源收藏"
                    results={resourceResults}
                    query={query}
                    onSelect={handleSelect}
                  />
                )}
              </div>
            )}
          </CommandList>
        </div>
      </div>
    </CommandDialog>
  )
}
