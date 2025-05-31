import type { NotionPage } from '@/types/notion'
import { ResourceItem } from './ResourceItem'
import { Skeleton } from '@/components/ui/skeleton'

interface ResourceGridProps {
  data: NotionPage[]
  loading: boolean
}

export function ResourceGrid({ data, loading }: ResourceGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(420px,100%),1fr))] gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg relative flex w-full flex-col gap-2 text-sm sm:min-w-0"
          >
            {/* 图片封面骨架 */}
            <Skeleton className="relative aspect-video w-full rounded-lg" />

            {/* 头像和文本信息骨架 */}
            <div className="flex items-center gap-3 py-1">
              {/* 头像骨架 */}
              <Skeleton className="size-12 rounded-xs shrink-0" />

              {/* 文本信息骨架 */}
              <div className="flex flex-col gap-2 flex-1">
                {/* 标题骨架 */}
                <Skeleton className="h-5 w-3/4" />
                {/* 日期骨架 */}
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>

            {/* 描述文本骨架 */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(420px,100%),1fr))] gap-6">
      {data.map((item) => (
        <ResourceItem key={item.id} item={item} />
      ))}
    </div>
  )
}
