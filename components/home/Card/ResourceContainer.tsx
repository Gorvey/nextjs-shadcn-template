import { useEffect } from 'react'
import useSWR from 'swr'
import { useAppContext } from '@/components/providers/app-store-provider'
import { Skeleton } from '@/components/ui/skeleton'
import { API_ENDPOINTS, fetcher } from '@/lib/swr/config'
import type { NotionCategoryPage, NotionPage } from '@/types/notion'
import { ResourceItem } from './ResourceItem'

export function ResourceContainer() {
  // 简单的数据获取
  const { data: resources = [], isLoading: resourcesLoading } = useSWR<NotionPage[]>(
    API_ENDPOINTS.RESOURCES,
    fetcher
  )
  const { data: categories = [], isLoading: categoriesLoading } = useSWR<NotionCategoryPage[]>(
    API_ENDPOINTS.CATEGORIES,
    fetcher
  )

  // 从store获取筛选后的资源和相关方法
  const filteredResources = useAppContext((state) => state.filteredResources)
  const setResources = useAppContext((state) => state.setResources)
  const setCategories = useAppContext((state) => state.setCategories)
  const isLoading = resourcesLoading || categoriesLoading

  // 当数据加载完成时，更新store
  useEffect(() => {
    if (resources.length > 0) {
      setResources(resources)
    }
  }, [resources, setResources])

  useEffect(() => {
    if (categories.length > 0) {
      setCategories(categories)
    }
  }, [categories, setCategories])

  if (isLoading && filteredResources.length === 0) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(420px,100%),1fr))] gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg relative flex w-full flex-col gap-2 text-sm sm:min-w-0"
          >
            <Skeleton className="relative aspect-video w-full rounded-lg" />
            <div className="flex items-center gap-3 py-1">
              <Skeleton className="size-12 rounded-xs shrink-0" />
              <div className="flex flex-col gap-1 flex-1 pt-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <div className="space-y-2 mb-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
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
      {filteredResources.map((item: NotionPage) => (
        <ResourceItem key={item.id} item={item} />
      ))}
    </div>
  )
}
