import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewType = 'card' | 'grid'

interface ViewStore {
  viewType: ViewType
  primaryLayout: string | null
  secondaryLayout: string | null
  setViewType: (viewType: ViewType) => void
  setPrimaryLayout: (primaryLayout: string | null) => void
  setSecondaryLayout: (secondaryLayout: string | null) => void
}

export const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      viewType: 'card',
      primaryLayout: null,
      secondaryLayout: null,
      setViewType: (viewType: ViewType) => set({ viewType }),
      setPrimaryLayout: (primaryLayout: string | null) => set({ primaryLayout }),
      setSecondaryLayout: (secondaryLayout: string | null) => set({ secondaryLayout }),
    }),
    {
      name: 'view-storage', // localStorage 中的键名
      partialize: (state) => ({
        viewType: state.viewType,
        primaryLayout: state.primaryLayout,
        secondaryLayout: state.secondaryLayout,
      }), // 只持久化这三个状态
    }
  )
)
