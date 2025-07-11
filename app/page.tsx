import { ClientWrapper } from '@/components/home/ClientWrapper'
import { FilterSection } from '@/components/home/FilterSection'
import { queryDatabase, queryDatabaseDetail } from '@/lib/server/notion'

export const revalidate = 3600

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
      queryDatabase(databaseId),
      queryDatabaseDetail(databaseId),
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
