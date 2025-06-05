import { Client } from '@notionhq/client'
import type { NotionPage, NotionDatabase } from '@/types/notion'
import type { PageObjectResponse, DatabaseObjectResponse } from '@notionhq/client'
import { transformNotionPage } from '@/utils/notion'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

export async function getDatabase(databaseId: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = []
  let cursor: string | undefined = undefined

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    })
    pages.push(...response.results.map((page) => transformNotionPage(page as PageObjectResponse)))
    if (!response.has_more) break
    cursor = response.next_cursor || undefined
  }

  // 过滤掉没有 Name、desc、url 任意一个的记录
  const filteredPages = pages.filter((page) => {
    // 查找 Name、desc、url 字段
    const nameValue = findPropertyValue(page, ['name', 'Name', 'title', 'Title'])
    const descValue = findPropertyValue(page, ['desc', 'Desc', 'description', 'Description'])
    const urlValue = findPropertyValue(page, ['url', 'URL', 'link', 'Link'])

    // 检查是否所有必需字段都有值（非空且非空字符串）
    const hasName = nameValue && nameValue.toString().trim() !== ''
    const hasDesc = descValue && descValue.toString().trim() !== ''
    const hasUrl = urlValue && urlValue.toString().trim() !== ''

    // 只有当所有字段都有值时才保留这条记录
    return hasName && hasDesc && hasUrl
  })

  return filteredPages
}

// 辅助函数：根据可能的属性名查找属性值
function findPropertyValue(page: NotionPage, possibleNames: string[]): any {
  for (const name of possibleNames) {
    // 检查直接匹配
    if (page[name] !== undefined && page[name] !== null) {
      return page[name]
    }
    // 检查不区分大小写的匹配
    const matchedKey = Object.keys(page).find((key) => key.toLowerCase() === name.toLowerCase())
    if (matchedKey && page[matchedKey] !== undefined && page[matchedKey] !== null) {
      return page[matchedKey]
    }
  }
  return null
}

export async function getDatabaseDetails(databaseId: string): Promise<NotionDatabase> {
  const response = (await notion.databases.retrieve({
    database_id: databaseId,
  })) as DatabaseObjectResponse

  return {
    id: response.id,
    last_edited_time: response.last_edited_time,
    properties: response.properties,
  }
}
