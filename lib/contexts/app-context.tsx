'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import type { NotionCategoryPage, NotionCategoryViewPage, NotionPage } from '@/types/notion'
import { transformCategoriesToViewData } from '@/utils/category'

/**
 * 应用状态接口
 */
interface AppState {
  // 数据状态
  resources: NotionPage[]
  categories: NotionCategoryPage[]
  categoryViewData: NotionCategoryViewPage[]
  filteredResources: NotionPage[]

  // UI状态
  viewType: 'card' | 'grid'
  currentCategorySlug: string
  expandedPrimaryCategory: string | null
  loading: boolean
}

/**
 * Action类型定义
 */
type AppAction =
  | { type: 'SET_RESOURCES'; payload: NotionPage[] }
  | { type: 'SET_CATEGORIES'; payload: NotionCategoryPage[] }
  | { type: 'SET_VIEW_TYPE'; payload: 'card' | 'grid' }
  | { type: 'SET_CURRENT_CATEGORY_SLUG'; payload: string }
  | { type: 'SET_EXPANDED_PRIMARY_CATEGORY'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_FILTERED_RESOURCES' }

/**
 * 初始状态
 */
const initialState: AppState = {
  resources: [],
  categories: [],
  categoryViewData: [],
  filteredResources: [],
  viewType: 'grid', // 这里会在Provider中被覆盖
  currentCategorySlug: 'all',
  expandedPrimaryCategory: null,
  loading: false,
}

/**
 * 用户偏好设置接口
 */
interface UserPreferences {
  viewType: 'card' | 'grid'
  currentCategorySlug: string
  expandedPrimaryCategory: string | null
}

/**
 * 默认用户偏好设置
 */
const defaultPreferences: UserPreferences = {
  viewType: 'grid',
  currentCategorySlug: 'all',
  expandedPrimaryCategory: null,
}

/**
 * 从localStorage获取保存的用户偏好设置
 */
function getStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return defaultPreferences
  try {
    const stored = localStorage.getItem('app-preferences')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        viewType: parsed.viewType === 'card' ? 'card' : 'grid',
        currentCategorySlug: parsed.currentCategorySlug || 'all',
        expandedPrimaryCategory: parsed.expandedPrimaryCategory || null,
      }
    }
  } catch {
    // 解析失败，返回默认值
  }
  return defaultPreferences
}

/**
 * 保存用户偏好设置到localStorage
 */
function savePreferences(preferences: Partial<UserPreferences>) {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredPreferences()
    const updated = { ...current, ...preferences }
    localStorage.setItem('app-preferences', JSON.stringify(updated))
  } catch {
    // 忽略错误
  }
}

/**
 * 状态reducer
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_RESOURCES': {
      const resources = action.payload
      const categoryViewData = transformCategoriesToViewData(state.categories, resources)
      return {
        ...state,
        resources,
        categoryViewData,
        filteredResources: updateFilteredResourcesHelper(
          resources,
          categoryViewData,
          state.currentCategorySlug
        ),
      }
    }

    case 'SET_CATEGORIES': {
      const categories = action.payload
      const categoryViewData = transformCategoriesToViewData(categories, state.resources)
      return {
        ...state,
        categories,
        categoryViewData,
        filteredResources: updateFilteredResourcesHelper(
          state.resources,
          categoryViewData,
          state.currentCategorySlug
        ),
      }
    }

    case 'SET_VIEW_TYPE':
      return {
        ...state,
        viewType: action.payload,
      }

    case 'SET_CURRENT_CATEGORY_SLUG': {
      const currentCategorySlug = action.payload
      return {
        ...state,
        currentCategorySlug,
        filteredResources: updateFilteredResourcesHelper(
          state.resources,
          state.categoryViewData,
          currentCategorySlug
        ),
      }
    }

    case 'SET_EXPANDED_PRIMARY_CATEGORY':
      return {
        ...state,
        expandedPrimaryCategory: action.payload,
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }

    case 'UPDATE_FILTERED_RESOURCES':
      return {
        ...state,
        filteredResources: updateFilteredResourcesHelper(
          state.resources,
          state.categoryViewData,
          state.currentCategorySlug
        ),
      }

    default:
      return state
  }
}

/**
 * 根据当前选中的分类筛选资源列表的辅助函数
 */
function updateFilteredResourcesHelper(
  resources: NotionPage[],
  categoryViewData: NotionCategoryViewPage[],
  currentCategorySlug: string
): NotionPage[] {
  if (currentCategorySlug === 'all' || !currentCategorySlug) {
    return resources
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
    return categoryResources.filter(
      (resource, index, self) => index === self.findIndex((r) => r.id === resource.id)
    )
  }

  // 查找是否是子分类
  for (const primaryCat of categoryViewData) {
    const secondaryCategory = primaryCat.children.find((child) => child.id === currentCategorySlug)
    if (secondaryCategory) {
      return secondaryCategory.links
    }
  }

  // 如果都没找到，显示所有资源
  return resources
}

/**
 * Context上下文接口
 */
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>

  // 便捷方法
  setResources: (resources: NotionPage[]) => void
  setCategories: (categories: NotionCategoryPage[]) => void
  setViewType: (viewType: 'card' | 'grid') => void
  setCurrentCategorySlug: (slug: string) => void
  setExpandedPrimaryCategory: (categoryId: string | null) => void
  setLoading: (loading: boolean) => void
  updateFilteredResources: () => void

  // 工具方法
  getCategoriesByParentId: (parentId?: string) => NotionCategoryViewPage[]
  getResourcesByCategoryId: (categoryId: string) => NotionPage[]
  getTotalResourcesCount: () => number
}

/**
 * 创建Context
 */
const AppContext = createContext<AppContextType | null>(null)

/**
 * Provider组件Props
 */
interface AppProviderProps {
  children: ReactNode
  initialData?: {
    resources: NotionPage[]
    categories: NotionCategoryPage[]
  }
}

/**
 * Provider组件
 */
export function AppProvider({ children, initialData }: AppProviderProps) {
  // 如果有初始数据，合并到初始状态
  const stateWithInitialData = initialData
    ? {
        ...initialState,
        resources: initialData.resources,
        categories: initialData.categories,
        categoryViewData: transformCategoriesToViewData(
          initialData.categories,
          initialData.resources
        ),
        filteredResources: initialData.resources,
      }
    : initialState

  const [state, dispatch] = useReducer(appReducer, stateWithInitialData)

  // 在客户端初始化时从localStorage读取用户偏好设置
  useEffect(() => {
    const storedPreferences = getStoredPreferences()

    // // 应用保存的偏好设置
    // if (storedPreferences.viewType !== state.viewType) {
    //   dispatch({ type: 'SET_VIEW_TYPE', payload: storedPreferences.viewType })
    // }

    if (storedPreferences.currentCategorySlug !== state.currentCategorySlug) {
      dispatch({
        type: 'SET_CURRENT_CATEGORY_SLUG',
        payload: storedPreferences.currentCategorySlug,
      })
    }

    if (storedPreferences.expandedPrimaryCategory !== state.expandedPrimaryCategory) {
      dispatch({
        type: 'SET_EXPANDED_PRIMARY_CATEGORY',
        payload: storedPreferences.expandedPrimaryCategory,
      })
    }
  }, []) // 只在组件挂载时执行一次

  // 便捷方法 - 使用 useCallback 确保引用稳定
  const setResources = useCallback((resources: NotionPage[]) => {
    dispatch({ type: 'SET_RESOURCES', payload: resources })
  }, [])

  const setCategories = useCallback((categories: NotionCategoryPage[]) => {
    dispatch({ type: 'SET_CATEGORIES', payload: categories })
  }, [])

  const setViewType = useCallback((viewType: 'card' | 'grid') => {
    dispatch({ type: 'SET_VIEW_TYPE', payload: viewType })
    savePreferences({ viewType }) // 保存viewType偏好
  }, [])

  const setCurrentCategorySlug = useCallback((slug: string) => {
    dispatch({ type: 'SET_CURRENT_CATEGORY_SLUG', payload: slug })
    savePreferences({ currentCategorySlug: slug }) // 保存分类选择偏好
  }, [])

  const setExpandedPrimaryCategory = useCallback((categoryId: string | null) => {
    dispatch({ type: 'SET_EXPANDED_PRIMARY_CATEGORY', payload: categoryId })
    savePreferences({ expandedPrimaryCategory: categoryId }) // 保存展开状态偏好
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const updateFilteredResources = useCallback(() => {
    dispatch({ type: 'UPDATE_FILTERED_RESOURCES' })
  }, [])

  // 工具方法 - 使用 useCallback 确保引用稳定
  const getCategoriesByParentId = useCallback(
    (parentId?: string): NotionCategoryViewPage[] => {
      if (!parentId) {
        return state.categoryViewData
      }
      return state.categoryViewData.filter((cat) => cat.parent.some((p) => p.id === parentId))
    },
    [state.categoryViewData]
  )

  const getResourcesByCategoryId = useCallback(
    (categoryId: string): NotionPage[] => {
      const category = state.categoryViewData.find((cat) => cat.id === categoryId)
      if (category) {
        return [...category.links, ...category.children.flatMap((child) => child.links)]
      }

      // 查找子分类
      for (const primaryCat of state.categoryViewData) {
        const secondaryCategory = primaryCat.children.find((child) => child.id === categoryId)
        if (secondaryCategory) {
          return secondaryCategory.links
        }
      }

      return []
    },
    [state.categoryViewData]
  )

  const getTotalResourcesCount = useCallback((): number => {
    return state.resources.length
  }, [state.resources.length])

  // 使用 useMemo 优化 contextValue，避免不必要的重新创建
  const contextValue: AppContextType = useMemo(
    () => ({
      state,
      dispatch,
      setResources,
      setCategories,
      setViewType,
      setCurrentCategorySlug,
      setExpandedPrimaryCategory,
      setLoading,
      updateFilteredResources,
      getCategoriesByParentId,
      getResourcesByCategoryId,
      getTotalResourcesCount,
    }),
    [
      state,
      dispatch,
      setResources,
      setCategories,
      setViewType,
      setCurrentCategorySlug,
      setExpandedPrimaryCategory,
      setLoading,
      updateFilteredResources,
      getCategoriesByParentId,
      getResourcesByCategoryId,
      getTotalResourcesCount,
    ]
  )

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

/**
 * Hook to access app context
 */
export function useApp(): AppContextType {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

/**
 * Hook with selector for optimized re-renders
 */
export function useAppSelector<T>(selector: (state: AppState) => T): T {
  const { state } = useApp()
  return selector(state)
}
