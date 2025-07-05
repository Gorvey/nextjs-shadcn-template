import { ClientWrapper } from '@/components/home/ClientWrapper'
import { FilterSection } from '@/components/home/FilterSection'
import { getDatabase, getDatabaseDetails } from '@/lib/notion'

// 启用ISR：每60秒重新生成页面
export const revalidate = 60

export default async function Home() {
  let initialData = null
  let databaseDetails = null
  let error = null

  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    if (!databaseId) {
      throw new Error('未配置数据库 ID')
    }

    // 在服务端并行获取数据
    const [pagesData, dbDetails] = await Promise.all([
      getDatabase(databaseId),
      getDatabaseDetails(databaseId).catch((err) => {
        console.warn('获取数据库详情失败:', err)
        return null
      }),
    ])

    initialData = pagesData
    databaseDetails = dbDetails
  } catch (err) {
    console.error('获取数据失败:', err)
    error = err instanceof Error ? err.message : '获取数据失败'
  }

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/50 min-h-screen  text-foreground">
      <div className="mx-auto px-4 py-8 relative">
        <ClientWrapper initialData={initialData} databaseDetails={databaseDetails} error={error}>
          <FilterSection />
        </ClientWrapper>
      </div>
    </div>
  )
}
