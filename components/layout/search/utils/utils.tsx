import type { SearchResult } from '../types'

// 获取显示名称
export const getDisplayName = (item: SearchResult): string => {
  return item.name || item.Name || item.title || item.Title || '未命名'
}

// 获取描述
export const getDescription = (item: SearchResult): string => {
  return item.desc || item.Desc || item.description || item.Description || ''
}

// 获取链接
export const getUrl = (item: SearchResult): string => {
  if (item.type === 'blog') {
    return `/blog/${item.id}`
  }
  return item.url || item.URL || item.link || item.Link || '#'
}

// 获取图标 URL
export const getIconUrl = (item: SearchResult): string => {
  if (!item.icon) return '/avatar-placeholder.jpg'
  if (item.icon.type === 'external') return item.icon.external?.url || '/avatar-placeholder.jpg'
  if (item.icon.type === 'file') return item.icon.file?.url || '/avatar-placeholder.jpg'
  if (item.icon.type === 'emoji') return '/avatar-placeholder.jpg'
  return '/avatar-placeholder.jpg'
}

// 获取标签
export const getTags = (item: SearchResult): string[] => {
  const tags: string[] = []
  const arrayFields = ['页面类型', '标签', '付费情况', '服务模式', '访问限制', '运行环境', '分组']

  arrayFields.forEach((field) => {
    const fieldValue = (item as any)[field]
    if (Array.isArray(fieldValue)) {
      fieldValue.forEach((subItem) => {
        if (subItem && typeof subItem === 'object' && subItem.name) {
          tags.push(subItem.name)
        }
      })
    }
  })

  // 使用Set进行去重，然后转回数组
  return [...new Set(tags)]
}

// 高亮文本函数
export const highlightText = (text: string, searchQuery: string) => {
  if (!searchQuery.trim() || !text) return text

  // 分割查询为多个关键词
  const keywords = searchQuery.trim().split(/\s+/).filter(Boolean)

  // 创建正则表达式，匹配所有关键词（不区分大小写）
  const regex = new RegExp(
    `(${keywords.map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  )

  const parts = text.split(regex)

  return parts.map((part, index) => {
    // 检查当前部分是否匹配任何关键词
    const isMatch = keywords.some((keyword) => part.toLowerCase() === keyword.toLowerCase())

    if (isMatch) {
      return (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      )
    }
    return part
  })
}

// 检测是否为移动设备
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}
