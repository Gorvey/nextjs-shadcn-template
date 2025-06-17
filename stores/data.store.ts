import { create } from 'zustand'
import type { NotionPage, NotionDatabase } from '@/types/notion'
import { refreshHomeData } from '@/lib/actions'

interface DataStore {
  data: NotionPage[]
  loading: boolean
  databaseDetails: NotionDatabase | null
  setData: (data: NotionPage[]) => void
  setLoading: (loading: boolean) => void
  setDatabaseDetails: (databaseDetails: NotionDatabase | null) => void
  refreshData: () => Promise<void>
}

export const useDataStore = create<DataStore>((set, get) => ({
  data: [],
  loading: false,
  databaseDetails: null,
  setData: (data: NotionPage[]) => set({ data }),
  setLoading: (loading: boolean) => set({ loading }),
  setDatabaseDetails: (databaseDetails: NotionDatabase | null) => set({ databaseDetails }),
  refreshData: async () => {
    set({ loading: true })
    try {
      const result = await refreshHomeData()
      if (result.success) {
        // 调用 API 重新获取数据
        const [dataResponse, detailsResponse] = await Promise.all([
          fetch('/api/v1/data?action=all'),
          fetch('/api/v1/data?action=details'),
        ])

        const dataResult = await dataResponse.json()
        const detailsResult = await detailsResponse.json()

        if (dataResult.success) {
          set({ data: dataResult.data })
        }

        if (detailsResult.success) {
          set({ databaseDetails: detailsResult.data })
        }

        set({ loading: false })
      } else {
        console.error('刷新失败:', result.error)
        set({ loading: false })
      }
    } catch (error) {
      console.error('刷新数据失败:', error)
      set({ loading: false })
    }
  },
}))
