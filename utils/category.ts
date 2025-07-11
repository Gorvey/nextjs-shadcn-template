import type { NotionCategoryPage, NotionCategoryViewPage, NotionPage } from '@/types/notion'

/**
 * 将 NotionCategoryPage[] 和资源列表转换为二级分类视图数据
 * @param categories 原始分类数据
 * @param resources 全部资源列表
 * @returns 转换后的二级分类视图数据
 */
export function transformCategoriesToViewData(
  categories: NotionCategoryPage[],
  resources: NotionPage[]
): NotionCategoryViewPage[] {
  // 创建资源查找映射表，提高查找效率
  const resourceMap = new Map<string, NotionPage>()
  resources.forEach((resource) => {
    resourceMap.set(resource.id, resource)
  })

  // 创建分类查找映射表
  const categoryMap = new Map<string, NotionCategoryPage>()
  categories.forEach((category) => {
    categoryMap.set(category.id, category)
  })

  // 递归转换函数
  function transformCategory(
    category: NotionCategoryPage,
    isSecondLevel = false
  ): NotionCategoryViewPage {
    // 处理 children - 将 id 替换为完整的 item
    const children: NotionCategoryViewPage[] = category.children
      .map((child) => categoryMap.get(child.id))
      .filter(Boolean)
      .map((childCategory) => transformCategory(childCategory!, true))

    // 处理 links - 只在第二级中处理，将 id 替换为完整的 NotionPage
    const links: NotionPage[] = isSecondLevel
      ? (category.links.map((link) => resourceMap.get(link.id)).filter(Boolean) as NotionPage[])
      : []

    return {
      id: category.id,
      name: category.name,
      desc: category.desc,
      sort: category.sort,
      icon: category.icon,
      parent: category.parent, // 保持不变
      children,
      links,
    }
  }

  // 找到所有顶级分类（没有 parent 的分类）
  const topLevelCategories = categories.filter(
    (category) => !category.parent || category.parent.length === 0
  )

  // 转换顶级分类
  return topLevelCategories
    .map((category) => transformCategory(category))
    .sort((a, b) => a.sort - b.sort) // 按 sort 字段排序
}

/**
 * 从二级分类数据中获取指定父分类的子分类
 * @param categoryViewData 二级分类视图数据
 * @param parentId 父分类ID，如果为空则返回顶级分类
 * @returns 子分类列表
 */
export function getCategoriesByParentId(
  categoryViewData: NotionCategoryViewPage[],
  parentId?: string
): NotionCategoryViewPage[] {
  if (!parentId) {
    // 返回顶级分类
    return categoryViewData
  }

  // 查找指定父分类
  function findCategory(categories: NotionCategoryViewPage[]): NotionCategoryViewPage | null {
    for (const category of categories) {
      if (category.id === parentId) {
        return category
      }
      // 递归查找子分类
      const found = findCategory(category.children)
      if (found) return found
    }
    return null
  }

  const parentCategory = findCategory(categoryViewData)
  return parentCategory ? parentCategory.children : []
}

/**
 * 从二级分类数据中获取指定分类下的资源
 * @param categoryViewData 二级分类视图数据
 * @param categoryId 分类ID
 * @returns 资源列表
 */
export function getResourcesByCategoryId(
  categoryViewData: NotionCategoryViewPage[],
  categoryId: string
): NotionPage[] {
  function findCategory(categories: NotionCategoryViewPage[]): NotionCategoryViewPage | null {
    for (const category of categories) {
      if (category.id === categoryId) {
        return category
      }
      // 递归查找子分类
      const found = findCategory(category.children)
      if (found) return found
    }
    return null
  }

  const category = findCategory(categoryViewData)
  return category ? category.links : []
}

/**
 * 获取所有分类下的资源总数
 * @param categoryViewData 二级分类视图数据
 * @returns 资源总数
 */
export function getTotalResourcesCount(categoryViewData: NotionCategoryViewPage[]): number {
  let total = 0

  function countResources(categories: NotionCategoryViewPage[]) {
    categories.forEach((category) => {
      total += category.links.length
      countResources(category.children)
    })
  }

  countResources(categoryViewData)
  return total
}
