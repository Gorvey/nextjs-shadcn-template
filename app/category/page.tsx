import { CategoryPageClient } from '@/components/category/CategoryPageClient'
import { AppProvider } from '@/lib/contexts/app-context'
import { NotionService } from '@/lib/server/services/notion.service'
export const revalidate = false

/**
 * 服务端获取分类页面数据
 */
async function getCategoryPageData() {
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
    console.error('获取分类页面数据失败:', error)
    return {
      resources: [],
      categories: [],
    }
  }
}

/**
 * 前端开发分类页面
 * 使用SSR预获取数据，使用新的Context系统管理状态
 */
export default async function CategoryPage() {
  const { resources, categories } = await getCategoryPageData()

  return (
    <AppProvider initialData={{ resources, categories }}>
      <CategoryPageClient />
    </AppProvider>
  )
}
