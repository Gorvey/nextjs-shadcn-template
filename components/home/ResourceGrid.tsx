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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => (
        <ResourceItem key={item.id} item={item} />
      ))}
    </div>
  )
}
