'use client'

import { RefreshCw } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDataStore } from '@/stores/data.store'
import { useViewStore, type ViewType } from '@/stores/view.store'

export function FilterSection() {
  const viewType = useViewStore((state) => state.viewType)
  const setViewType = useViewStore((state) => state.setViewType)
  const databaseDetails = useDataStore((state) => state.databaseDetails)
  const refreshData = useDataStore((state) => state.refreshData)
  const loading = useDataStore((state) => state.loading)
  const primaryLayout = useViewStore((state) => state.primaryLayout)
  const setPrimaryLayout = useViewStore((state) => state.setPrimaryLayout)
  const secondaryLayout = useViewStore((state) => state.secondaryLayout)
  const setSecondaryLayout = useViewStore((state) => state.setSecondaryLayout)

  const options = useMemo(() => {
    return databaseDetails?.properties
      ? Object.values(databaseDetails.properties).filter(
          (property: any) => property.type === 'multi_select'
        )
      : []
  }, [databaseDetails?.properties])

  // 设置默认值
  useEffect(() => {
    if (options.length > 0 && !primaryLayout && !secondaryLayout) {
      setPrimaryLayout(options[0]?.id || null)
      setSecondaryLayout(options[1]?.id || null)
    }
  }, [options, primaryLayout, secondaryLayout, setPrimaryLayout, setSecondaryLayout])

  // 处理主要布局选择变化
  const handlePrimaryLayoutChange = (value: string) => {
    if (value === secondaryLayout) {
      // 如果选择的值与次要布局相同，则互换
      setSecondaryLayout(primaryLayout)
    }
    setPrimaryLayout(value)
  }

  // 处理次要布局选择变化
  const handleSecondaryLayoutChange = (value: string) => {
    if (value === primaryLayout) {
      // 如果选择的值与主要布局相同，则互换
      setPrimaryLayout(secondaryLayout)
    }
    setSecondaryLayout(value)
  }

  return (
    <div className="flex items-center justify-between mb-8">
      {viewType === 'grid' ? (
        <div className="flex items-center">
          <div className="mr-2 text-foreground">Primary Layout:</div>
          <Select value={primaryLayout || undefined} onValueChange={handlePrimaryLayoutChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择主要布局" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mr-2 ml-4 text-foreground">Secondary Layout:</div>
          <Select value={secondaryLayout || undefined} onValueChange={handleSecondaryLayoutChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择次要布局" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div />
      )}
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <div className="mr-2 text-foreground">页面类型:</div>
          <Tabs onValueChange={(value) => setViewType(value as ViewType)} value={viewType}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="card">Card</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={refreshData}
          disabled={loading}
          className="flex items-center gap-2 "
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}
