'use server'

import { revalidatePath } from 'next/cache'

export async function refreshHomeData() {
  try {
    // 重新验证首页路径，强制重新获取数据
    revalidatePath('/')
    revalidatePath('/category')
    return { success: true }
  } catch (error) {
    console.error('刷新数据失败:', error)
    return { success: false, error: '刷新数据失败' }
  }
}
