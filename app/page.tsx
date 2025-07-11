import { Suspense } from 'react'
import { ClientWrapper } from '@/components/home/ClientWrapper'
import { FilterSection } from '@/components/home/FilterSection'
import { AppProvider } from '@/lib/contexts/app-context'
import { NotionService } from '@/lib/server/services/notion.service'

export const revalidate = false
/**
 * 服务端获取首页数据
 */
async function getHomeData() {
  const notionService = new NotionService()

  try {
    const [resources, categoriesData] = await Promise.all([
      notionService.getAllResources(),
      notionService.getCategoryData(),
    ])

    // 类型断言：分类数据在运行时兼容NotionCategoryPage类型
    const categories = categoriesData as any[]

    return {
      resources,
      categories,
    }
  } catch (error) {
    console.error('获取首页数据失败:', error)
    return {
      resources: [],
      categories: [],
    }
  }
}

export default async function Home() {
  const { resources, categories } = await getHomeData()

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/50 min-h-screen text-foreground">
      <div className="mx-auto px-4 py-8 relative">
        <AppProvider initialData={{ resources, categories }}>
          <Suspense
            fallback={
              <div className="text-center py-8">
                <p className="text-muted-foreground">加载中...</p>
              </div>
            }
          >
            <ClientWrapper>
              <FilterSection />
            </ClientWrapper>
          </Suspense>
        </AppProvider>
      </div>
    </div>
  )
}
