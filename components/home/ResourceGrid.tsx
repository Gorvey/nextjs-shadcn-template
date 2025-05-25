import type { NotionPage } from '@/types/notion'
import { ResourceItem } from './ResourceItem'

interface ResourceGridProps {
  data: NotionPage[]
  loading: boolean
}

export function ResourceGrid({ data, loading }: ResourceGridProps) {
  if (!loading && data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">暂无数据，点击刷新按钮获取数据</div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => (
        <ResourceItem key={item.id} item={item} />
      ))}
    </div>
  )
}
