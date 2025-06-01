'use client'

import { useMemo, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDataStore } from '@/stores/data.store'
import { useViewStore, type ViewType } from '@/stores/view.store'

export function FilterSection() {
  const viewType = useViewStore((state) => state.viewType)
  const setViewType = useViewStore((state) => state.setViewType)
  const databaseDetails = useDataStore((state) => state.databaseDetails)
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

  return (
    <div className="flex items-center justify-between mb-8">
      {viewType === 'grid' ? (
        <div className="flex items-center">
          <div className="mr-2 text-foreground">Primary Layout:</div>
          <Select value={primaryLayout || undefined} onValueChange={setPrimaryLayout}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择主要布局" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  disabled={option.id === secondaryLayout}
                >
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mr-2 ml-4 text-foreground">Secondary Layout:</div>
          <Select value={secondaryLayout || undefined} onValueChange={setSecondaryLayout}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择次要布局" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: any) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  disabled={option.id === primaryLayout}
                >
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div></div>
      )}
      <div className="flex items-center">
        <div className="mr-2 text-foreground">页面类型:</div>
        <Tabs onValueChange={(value) => setViewType(value as ViewType)} value={viewType}>
          <TabsList>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
