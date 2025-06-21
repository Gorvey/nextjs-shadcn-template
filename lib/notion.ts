import { Client } from '@notionhq/client'
import type { NotionPage, NotionDatabase } from '@/types/notion'
import type { PageObjectResponse, DatabaseObjectResponse } from '@notionhq/client'
import { transformNotionPage } from '@/utils/notion'
import { NotionAPI } from 'notion-client'
const notionAPI = new NotionAPI()
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

// 博客相关功能
export async function getBlogPosts(): Promise<NotionPage[]> {
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID
  if (!databaseId) {
    throw new Error('NOTION_BLOG_DATABASE_ID is not configured')
  }

  const pages: NotionPage[] = []
  let cursor: string | undefined = undefined

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      sorts: [
        {
          property: 'created_time',
          direction: 'descending',
        },
      ],
    })
    pages.push(...response.results.map((page) => transformNotionPage(page as PageObjectResponse)))
    if (!response.has_more) break
    cursor = response.next_cursor || undefined
  }
  console.log(pages)
  return pages
}

export async function getNotionPageContent(pageId: string) {
  if (!pageId) {
    console.error('Page ID is required')
    return null
  }

  // 清理 pageId，移除可能的分隔符
  const cleanPageId = pageId.replace(/[-\s]/g, '')

  // 验证 pageId 格式
  if (cleanPageId.length !== 32) {
    console.error('Invalid page ID format:', pageId)
    return null
  }

  try {
    console.log('Fetching page content for ID:', cleanPageId)
    const recordMap = await notionAPI.getPage(cleanPageId)

    if (!recordMap || !recordMap.block) {
      console.error('Invalid record map returned for page:', cleanPageId)
      return null
    }

    console.log('Successfully fetched page content')
    return recordMap
  } catch (error) {
    console.error('Error fetching page content:', error)

    // 如果是网络错误，尝试重试一次
    if (
      error instanceof Error &&
      (error.message.includes('network') || error.message.includes('timeout'))
    ) {
      console.log('Retrying page fetch due to network error...')
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待1秒
        const recordMap = await notionAPI.getPage(cleanPageId)
        if (recordMap && recordMap.block) {
          console.log('Retry successful')
          return recordMap
        }
      } catch (retryError) {
        console.error('Retry failed:', retryError)
      }
    }

    return null
  }
}
