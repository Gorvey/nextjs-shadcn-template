import { Skeleton } from '@/components/ui/skeleton'
import { useApp } from '@/lib/contexts/app-context'
import { ResourceItem } from './ResourceItem'

export function ResourceContainer() {
  // 从Context获取筛选后的资源
  const { state } = useApp()
  const { filteredResources, loading } = state

  // 显示加载状态
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 没有资源时的空状态
  if (!filteredResources || filteredResources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold mb-2">暂无资源</h3>
        <p className="text-muted-foreground">当前分类下没有找到资源</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredResources.map((resource) => (
        <ResourceItem key={resource.id} item={resource} />
      ))}
    </div>
  )
}
