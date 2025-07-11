'use client'

import { createContext, type ReactNode, useContext } from 'react'
import { initializeAppStore } from '@/stores/app.store'

interface AppStoreProviderProps {
  children: ReactNode
}

const AppStoreContext = createContext<ReturnType<typeof initializeAppStore> | null>(null)

export function AppStoreProvider({ children }: AppStoreProviderProps) {
  const store = initializeAppStore()

  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>
}

export function useAppContext<T>(selector: (state: any) => T) {
  const store = useContext(AppStoreContext)
  if (!store) {
    throw new Error('useAppContext must be used within an AppStoreProvider')
  }
  return store(selector)
}
