import { Suspense } from 'react'
import { ClientWrapper } from '@/components/home/ClientWrapper'
import { FilterSection } from '@/components/home/FilterSection'
import { AppStoreProvider } from '@/components/providers/app-store-provider'

export default function Home() {
  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/50 min-h-screen text-foreground">
      <div className="mx-auto px-4 py-8 relative">
        <AppStoreProvider>
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
        </AppStoreProvider>
      </div>
    </div>
  )
}
