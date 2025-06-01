import { create } from 'zustand'
import type { NotionPage, NotionDatabase } from '@/types/notion'

interface DataStore {
  data: NotionPage[]
  loading: boolean
  databaseDetails: NotionDatabase | null
  setData: (data: NotionPage[]) => void
  setLoading: (loading: boolean) => void
  setDatabaseDetails: (databaseDetails: NotionDatabase | null) => void
}

export const useDataStore = create<DataStore>((set) => ({
  data: [],
  loading: false,
  databaseDetails: null,
  setData: (data: NotionPage[]) => set({ data }),
  setLoading: (loading: boolean) => set({ loading }),
  setDatabaseDetails: (databaseDetails: NotionDatabase | null) => set({ databaseDetails }),
}))
