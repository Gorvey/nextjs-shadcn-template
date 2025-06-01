import { ResourceItem } from './ResourceItem'
// import { Skeleton } from '@/components/ui/skeleton'
import { useDataStore } from '@/stores/data.store'
import { useViewStore } from '@/stores/view.store'
import { useShallow } from 'zustand/react/shallow'
import { NotionPage } from '@/types/notion'
import { useMemo } from 'react'

export function ResourceContainer() {
  const { data, databaseDetails } = useDataStore(
    useShallow((state) => ({
      data: state.data,
      databaseDetails: state.databaseDetails,
    }))
  )

  const { primaryLayout, secondaryLayout } = useViewStore(
    useShallow((state) => ({
      primaryLayout: state.primaryLayout,
      secondaryLayout: state.secondaryLayout,
    }))
  )

  interface TreeList {
    id: string
    name: string
    children: TreeList[] | NotionPage[]
  }

  // 构建三级树形结构
  const treeList: TreeList[] = useMemo(() => {
    if (!data.length || !databaseDetails || !primaryLayout || !secondaryLayout) {
      return []
    }

    // 通过id查找主要布局字段的属性配置
    const primaryProperty = Object.values(databaseDetails.properties).find(
      (prop) => prop.id === primaryLayout
    )
    if (!primaryProperty || primaryProperty.type !== 'multi_select') {
      return []
    }

    // 通过id查找次要布局字段的属性配置
    const secondaryProperty = Object.values(databaseDetails.properties).find(
      (prop) => prop.id === secondaryLayout
    )
    if (!secondaryProperty || secondaryProperty.type !== 'multi_select') {
      return []
    }

    // 获取主要布局的所有选项
    const primaryOptions = primaryProperty.multi_select.options || []

    // 获取次要布局的所有选项
    const secondaryOptions = secondaryProperty.multi_select.options || []

    // 构建三级树形结构
    return primaryOptions
      .map((primaryOption) => {
        // 构建现有的次要分类分组
        const secondaryGroups = secondaryOptions
          .map((secondaryOption) => ({
            id: secondaryOption.id,
            name: secondaryOption.name,
            children: data.filter((item) => {
              // 检查item是否包含当前的主要和次要选项
              const primaryValues = item[primaryProperty.name] as any[]
              const secondaryValues = item[secondaryProperty.name] as any[]

              const hasPrimary = primaryValues?.some((value) => value.id === primaryOption.id)
              const hasSecondary = secondaryValues?.some((value) => value.id === secondaryOption.id)

              return hasPrimary && hasSecondary
            }) as NotionPage[],
          }))
          .filter((secondaryGroup) => secondaryGroup.children.length > 0) // 只保留有数据的次要分组

        // 构建未分类分组（只有主要分类但没有任何次要分类的项目）
        const uncategorizedItems = data.filter((item) => {
          const primaryValues = item[primaryProperty.name] as any[]
          const secondaryValues = item[secondaryProperty.name] as any[]

          const hasPrimary = primaryValues?.some((value) => value.id === primaryOption.id)
          const hasAnySecondary = secondaryValues && secondaryValues.length > 0

          return hasPrimary && !hasAnySecondary
        }) as NotionPage[]

        // 如果有未分类的项目，添加未分类分组
        const allGroups = [...secondaryGroups]
        if (uncategorizedItems.length > 0) {
          allGroups.push({
            id: `uncategorized-${primaryOption.id}`,
            name: '未分类',
            children: uncategorizedItems,
          })
        }

        return {
          id: primaryOption.id,
          name: primaryOption.name,
          children: allGroups,
        }
      })
      .filter((primaryGroup) => primaryGroup.children.length > 0) // 只保留有数据的主要分组
  }, [data, databaseDetails, primaryLayout, secondaryLayout])

  // 单独处理没有命中任何一级分类的资源，不按二级分类分组
  const uncategorizedItems: NotionPage[] = useMemo(() => {
    if (!data.length || !databaseDetails || !primaryLayout || !secondaryLayout) {
      return []
    }

    const primaryProperty = Object.values(databaseDetails.properties).find(
      (prop) => prop.id === primaryLayout
    )

    if (!primaryProperty || primaryProperty.type !== 'multi_select') {
      return []
    }

    // 筛选出没有任何一级分类的资源
    return data.filter((item) => {
      const primaryValues = item[primaryProperty.name] as any[]
      return !primaryValues || primaryValues.length === 0
    }) as NotionPage[]
  }, [data, databaseDetails, primaryLayout, secondaryLayout])

  // 渲染三级树形结构
  const renderTreeList = (tree: TreeList[]) => {
    return tree.map((primaryGroup) => (
      <div key={primaryGroup.id} className="mb-8 flex ">
        <h2 className="mr-8 bg-slate-100 text-slate-700 text-2xl font-bold  w-[50px] px-2 py-4 rounded-md [writing-mode:vertical-rl] ">
          {primaryGroup.name}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4 flex-grow">
          {(primaryGroup.children as TreeList[]).map((secondaryGroup) => (
            <div key={secondaryGroup.id} className="border-2 border-gray-400 rounded-md p-4">
              <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
                {secondaryGroup.name} ({(secondaryGroup.children as NotionPage[]).length})
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4  ">
                {(secondaryGroup.children as NotionPage[]).map((item) => (
                  <ResourceItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))
  }

  if (!primaryLayout || !secondaryLayout) {
    return (
      <div className="text-center text-muted-foreground">请在页面顶部选择主要布局和次要布局</div>
    )
  }

  if (treeList.length === 0) {
    return <div className="text-center text-muted-foreground">暂无数据或所选布局无匹配数据</div>
  }

  return (
    <div>
      {/* 主要的树形结构 */}
      {renderTreeList(treeList)}

      {/* 没有命中一级分类的资源，直接显示 */}
      {uncategorizedItems.length > 0 && (
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-4 text-destructive">
            未分配一级分类 ({uncategorizedItems.length})
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(120px,100%),1fr))] gap-4">
            {uncategorizedItems.map((item) => (
              <ResourceItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
