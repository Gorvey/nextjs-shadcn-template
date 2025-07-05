import type { PageObjectResponse } from '@notionhq/client'
import type { NotionPage } from '@/types/notion'

/**
 * 将 Notion 页面数据转换为简化的格式
 * @param page - Notion API 返回的页面对象
 * @returns 简化后的 NotionPage 对象
 */
export function transformNotionPage(page: PageObjectResponse): NotionPage {
  const properties = page.properties
  const result: NotionPage = {
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    icon: page.icon,
    cover: page.cover,
  }

  for (const [key, value] of Object.entries(properties)) {
    switch (value.type) {
      case 'multi_select':
        // 简化为只包含 id 和 name 的数组
        result[key] = value.multi_select.map((item) => ({
          id: item.id,
          name: item.name,
        }))
        break

      case 'select':
        // 单选字段，简化为只包含 id 和 name 的对象
        result[key] = value.select
          ? {
              id: value.select.id,
              name: value.select.name,
            }
          : null
        break

      case 'rich_text':
        // 简化为纯字符串
        result[key] = value.rich_text.map((text) => text.plain_text).join('')
        break

      case 'title':
        // 简化为纯字符串
        result[key] = value.title.map((text) => text.plain_text).join('')
        break

      case 'url':
        // 简化为字符串
        result[key] = value.url || ''
        break

      case 'number':
        // 保持数字类型
        result[key] = value.number || 0
        break

      case 'checkbox':
        // 简化为布尔值
        result[key] = value.checkbox
        break

      case 'date':
        // 简化为日期字符串
        result[key] = value.date?.start || ''
        break

      case 'email':
        // 简化为字符串
        result[key] = value.email || ''
        break

      case 'phone_number':
        // 简化为字符串
        result[key] = value.phone_number || ''
        break

      case 'relation':
        // 简化为只包含 id 的数组
        result[key] = value.relation.map((item) => ({
          id: item.id,
        }))
        break

      case 'rollup':
        // 根据 rollup 结果类型处理
        if (value.rollup.type === 'array') {
          result[key] = value.rollup.array || []
        } else if (value.rollup.type === 'number') {
          result[key] = value.rollup.number || 0
        } else if (value.rollup.type === 'date') {
          result[key] = value.rollup.date?.start || ''
        } else {
          result[key] = ''
        }
        break

      case 'people':
        // 简化为只包含 id 的数组
        result[key] = value.people.map((person) => ({
          id: person.id,
        }))
        break

      case 'files':
        // 简化为文件信息数组
        result[key] = value.files.map((file) => {
          if (file.type === 'external') {
            return {
              type: 'external' as const,
              url: file.external.url,
            }
          }
          if (file.type === 'file') {
            return {
              type: 'file' as const,
              url: (file as any).file?.url || '',
            }
          }
          return {
            type: 'file' as const,
            url: '',
          }
        })
        break

      case 'status':
        // 简化为状态对象
        result[key] = value.status
          ? {
              id: value.status.id,
              name: value.status.name,
            }
          : null
        break

      default:
        // 未知类型设为空字符串
        result[key] = ''
        break
    }
  }

  return result
}

/**
 * 类型守卫：检查是否为多选字段
 */
export function isMultiSelectField(value: any): value is Array<{ id: string; name: string }> {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' && typeof item.id === 'string' && typeof item.name === 'string'
    )
  )
}

/**
 * 类型守卫：检查是否为单选字段
 */
export function isSelectField(value: any): value is { id: string; name: string } | null {
  return (
    value === null ||
    (typeof value === 'object' && typeof value.id === 'string' && typeof value.name === 'string')
  )
}

/**
 * 类型守卫：检查是否为关联字段
 */
export function isRelationField(value: any): value is Array<{ id: string }> {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'object' && typeof item.id === 'string')
  )
}

/**
 * 安全获取多选字段值
 */
export function getMultiSelectValue(
  page: NotionPage,
  fieldName: string
): Array<{ id: string; name: string }> {
  const value = page[fieldName]
  return isMultiSelectField(value) ? value : []
}

/**
 * 安全获取单选字段值
 */
export function getSelectValue(
  page: NotionPage,
  fieldName: string
): { id: string; name: string } | null {
  const value = page[fieldName]
  return isSelectField(value) ? value : null
}

/**
 * 安全获取字符串字段值
 */
export function getStringValue(page: NotionPage, fieldName: string): string {
  const value = page[fieldName]
  return typeof value === 'string' ? value : ''
}

/**
 * 安全获取数字字段值
 */
export function getNumberValue(page: NotionPage, fieldName: string): number {
  const value = page[fieldName]
  return typeof value === 'number' ? value : 0
}

/**
 * 安全获取布尔字段值
 */
export function getBooleanValue(page: NotionPage, fieldName: string): boolean {
  const value = page[fieldName]
  return typeof value === 'boolean' ? value : false
}

/**
 * 安全获取关联字段值
 */
export function getRelationValue(page: NotionPage, fieldName: string): Array<{ id: string }> {
  const value = page[fieldName]
  return isRelationField(value) ? value : []
}
