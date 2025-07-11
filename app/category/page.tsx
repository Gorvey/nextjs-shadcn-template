import { CategoryPageClient } from '@/components/category/CategoryPageClient'

/**
 * 前端开发分类页面
 * 使用ISR，重新验证时间为36000秒
 * 使用SWR数据获取，transformCategoriesToViewData转换分类数据
 */
export default function CategoryPage() {
  return <CategoryPageClient />
}

// ISR配置 - 36000秒重新验证
export const revalidate = 36000
