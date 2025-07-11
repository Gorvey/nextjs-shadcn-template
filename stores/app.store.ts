import { create } from 'zustand'
import type { NotionCategoryPage, NotionCategoryViewPage, NotionPage } from '@/types/notion'
import {
  getCategoriesByParentId as getCategoriesByParentIdUtil,
  getResourcesByCategoryId as getResourcesByCategoryIdUtil,
  getTotalResourcesCount as getTotalResourcesCountUtil,
  transformCategoriesToViewData,
} from '@/utils/category'

// 应用状态接口
interface AppState {
  // 数据状态
  resources: NotionPage[]
  categories: NotionCategoryPage[]
  categoryViewData: NotionCategoryViewPage[] // 使用新的二级分类数据结构
  filteredResources: NotionPage[] // 筛选后的资源列表

  // UI状态
  viewType: 'card' | 'grid'
  currentCategorySlug: string
  expandedPrimaryCategory: string | null
  loading: boolean

  // Actions
  setResources: (resources: NotionPage[]) => void
  setCategories: (categories: NotionCategoryPage[]) => void
  setCategoryViewData: (viewData: NotionCategoryViewPage[]) => void
  setViewType: (viewType: 'card' | 'grid') => void
  setCurrentCategorySlug: (slug: string) => void
  setExpandedPrimaryCategory: (categoryId: string | null) => void
  setLoading: (loading: boolean) => void
  updateFilteredResources: () => void // 更新筛选后的资源列表

  // 工具方法
  getCategoriesByParentId: (parentId?: string) => NotionCategoryViewPage[]
  getResourcesByCategoryId: (categoryId: string) => NotionPage[]
  buildCategoryViewData: (
    categories: NotionCategoryPage[],
    resources: NotionPage[]
  ) => NotionCategoryViewPage[]
  getTotalResourcesCount: () => number
}

// 默认状态
const defaultAppState = {
  resources: [],
  categories: [],
  categoryViewData: [],
  filteredResources: [], // 筛选后的资源列表
  viewType: 'grid' as const, // 默认使用grid布局
  currentCategorySlug: 'all',
  expandedPrimaryCategory: null,
  loading: false,
}

// Store工厂函数
const createAppStore = (initialState = defaultAppState) =>
  create<AppState>((set, get) => ({
    ...initialState,

    // Actions
    setResources: (resources) => {
      const { categories } = get()
      const viewData = transformCategoriesToViewData(categories, resources)
      set({ resources, categoryViewData: viewData })
      // 更新筛选后的资源列表
      get().updateFilteredResources()
    },

    setCategories: (categories) => {
      const { resources } = get()
      const viewData = transformCategoriesToViewData(categories, resources)
      set({ categories, categoryViewData: viewData })
      // 更新筛选后的资源列表
      get().updateFilteredResources()
    },

    setCategoryViewData: (categoryViewData) => {
      set({ categoryViewData })
      // 更新筛选后的资源列表
      get().updateFilteredResources()
    },

    setViewType: (viewType) => set({ viewType }),

    setCurrentCategorySlug: (currentCategorySlug) => {
      set({ currentCategorySlug })
      // 更新筛选后的资源列表
      get().updateFilteredResources()
    },

    setExpandedPrimaryCategory: (expandedPrimaryCategory) => set({ expandedPrimaryCategory }),

    setLoading: (loading) => set({ loading }),

    /**
     * 根据当前选中的分类筛选资源列表
     */
    updateFilteredResources: () => {
      const { resources, categoryViewData, currentCategorySlug } = get()

      if (currentCategorySlug === 'all' || !currentCategorySlug) {
        // 显示所有资源
        set({ filteredResources: resources })
        return
      }

      // 查找选中的分类
      const selectedCategory = categoryViewData.find((cat) => cat.id === currentCategorySlug)

      if (selectedCategory) {
        // 如果是主分类，收集该分类及其子分类的所有资源
        const categoryResources = [
          ...selectedCategory.links,
          ...selectedCategory.children.flatMap((child) => child.links),
        ]

        // 去重
        const uniqueResources = categoryResources.filter(
          (resource, index, self) => index === self.findIndex((r) => r.id === resource.id)
        )

        set({ filteredResources: uniqueResources })
        return
      }

      // 查找是否是子分类
      for (const primaryCat of categoryViewData) {
        const secondaryCategory = primaryCat.children.find(
          (child) => child.id === currentCategorySlug
        )
        if (secondaryCategory) {
          set({ filteredResources: secondaryCategory.links })
          return
        }
      }

      // 如果都没找到，显示所有资源
      set({ filteredResources: resources })
    },

    // 工具方法
    getCategoriesByParentId: (parentId) => {
      const { categoryViewData } = get()
      return getCategoriesByParentIdUtil(categoryViewData, parentId)
    },

    getResourcesByCategoryId: (categoryId) => {
      const { categoryViewData } = get()
      return getResourcesByCategoryIdUtil(categoryViewData, categoryId)
    },

    buildCategoryViewData: (categories, resources) => {
      return transformCategoriesToViewData(categories, resources)
    },

    getTotalResourcesCount: () => {
      const { categoryViewData } = get()
      return getTotalResourcesCountUtil(categoryViewData)
    },
  }))

// 客户端单例实例
let appStoreInstance: ReturnType<typeof createAppStore> | undefined

// Store初始化函数
export const initializeAppStore = (preloadedState = defaultAppState) => {
  if (typeof window === 'undefined') {
    // 服务端每次请求创建新实例
    return createAppStore(preloadedState)
  }
  if (!appStoreInstance) {
    // 客户端创建单例
    appStoreInstance = createAppStore(preloadedState)
  }
  return appStoreInstance
}
