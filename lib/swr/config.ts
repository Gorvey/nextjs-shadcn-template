// 简单的SWR配置
export const API_ENDPOINTS = {
  RESOURCES: '/api/v1/data?action=all',
  CATEGORIES: '/api/v1/category',
} as const

export async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('请求失败')
  const data = await res.json()
  if (!data.success) throw new Error(data.error || '数据获取失败')
  return data.data
}
