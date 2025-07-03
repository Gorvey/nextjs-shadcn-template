import type { NotionPage } from '@/types/notion'
import type { PageObjectResponse } from '@notionhq/client'

export function transformNotionPage(page: PageObjectResponse): NotionPage {
  const properties = page.properties
  const result: Partial<NotionPage> = {
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    icon: page.icon,
    cover: page.cover,
  }

  for (const [key, value] of Object.entries(properties)) {
    if (value.type === 'multi_select') {
      result[key] = value.multi_select.map((item) => ({
        id: item.id,
        name: item.name,
      }))
    } else if (value.type === 'rich_text') {
      result[key] = value.rich_text.map((text) => text.plain_text).join('')
    } else if (value.type === 'title') {
      result[key] = value.title.map((text) => text.plain_text).join('')
    } else if (value.type === 'url') {
      result[key] = value.url || ''
    } else if (value.type === 'number') {
      result[key] = value.number
    } else if (value.type === 'relation') {
      result[key] = value.relation
    } else if (value.type === 'rollup') {
      // 根据 rollup 类型处理
    } else {
      result[key] = ''
    }
  }

  return result as NotionPage
}
