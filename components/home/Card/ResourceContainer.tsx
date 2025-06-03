import { ResourceItem } from './ResourceItem'
import { Skeleton } from '@/components/ui/skeleton'
import { useDataStore } from '@/stores/data.store'

export function ResourceContainer() {
  const data = useDataStore((state) => state.data)
  const loading = useDataStore((state) => state.loading)

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(420px,100%),1fr))] gap-8">
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
              <div className="flex flex-col gap-1 flex-1 pt-1">
                {/* 标题骨架 */}
                <Skeleton className="h-5 w-3/4" />
                {/* URL骨架 */}
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>

            {/* 描述文本骨架 */}
            <div className="space-y-2 mb-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* 标签区域骨架 */}
            <div className="flex gap-2 flex-wrap p-1 pb-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-14 rounded-md" />
              <Skeleton className="h-6 w-18 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(420px,100%),1fr))] gap-8">
      {data.map((item) => (
        <ResourceItem key={item.id} item={item} />
      ))}
    </div>
  )
}
