import type { NotionPage } from '@/types/notion'
import { ResourceItem } from './ResourceItem'
import { Skeleton } from '@/components/ui/skeleton'

interface ResourceGridProps {
  data: NotionPage[]
  loading: boolean
  searchQuery: string
  sortBy: string
}

export function ResourceGrid({ data, loading, searchQuery, sortBy }: ResourceGridProps) {
  // 根据搜索条件过滤数据
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true

    const name = typeof item.Name === 'string' ? item.Name.toLowerCase() : ''
    const description = typeof item.Description === 'string' ? item.Description.toLowerCase() : ''
    const query = searchQuery.toLowerCase()

    return name.includes(query) || description.includes(query)
  })

  // 根据排序条件排序数据
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_time).getTime() - new Date(a.created_time).getTime()
    } else if (sortBy === 'oldest') {
      return new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
    } else if (sortBy === 'name') {
      const nameA = typeof a.Name === 'string' ? a.Name.toLowerCase() : ''
      const nameB = typeof b.Name === 'string' ? b.Name.toLowerCase() : ''
      return nameA.localeCompare(nameB)
    }
    return 0
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-[125px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (!loading && sortedData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {searchQuery ? '没有找到匹配的资源' : '暂无数据，点击刷新按钮获取数据'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedData.map((item) => (
        <ResourceItem key={item.id} item={item} />
      ))}
    </div>
  )
}
