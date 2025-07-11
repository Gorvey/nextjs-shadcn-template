import type { DatabaseObjectResponse, PageObjectResponse } from '@notionhq/client'
import { Client } from '@notionhq/client'
import type { NotionPage } from '@/types/notion'
import { transformNotionPage } from '@/utils/notion'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

/**
 * @description 查询数据库
 * @param databaseId
 * @returns NotionPage[] 数据库页面
 */
export async function queryDatabase(
  databaseId: string,
  filter?: any,
  sorts?: any
): Promise<NotionPage[]> {
  const pages: NotionPage[] = []
  let cursor: string | undefined

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 50,
      filter,
      sorts,
    })
    pages.push(...response.results.map((page) => transformNotionPage(page as PageObjectResponse)))
    if (!response.has_more) break
    cursor = response.next_cursor || undefined
  }

  return pages
}

/**
 * @description 查询数据库详情
 * @param databaseId
 * @returns DatabaseObjectResponse 数据库详情
 */
export async function queryDatabaseDetail(databaseId: string): Promise<DatabaseObjectResponse> {
  const response = (await notion.databases.retrieve({
    database_id: databaseId,
  })) as DatabaseObjectResponse

  return response
}

// 博客相关功能
export async function getBlogPosts({
  pageSize = 9,
  start_cursor,
}: {
  pageSize?: number
  start_cursor?: string
}): Promise<{
  posts: NotionPage[]
  has_more: boolean
  next_cursor: string | null
}> {
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID
  if (!databaseId) {
    throw new Error('NOTION_BLOG_DATABASE_ID is not configured')
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    start_cursor: start_cursor,
    page_size: pageSize,
    sorts: [
      {
        property: 'created_time',
        direction: 'descending',
      },
    ],
  })

  const posts = response.results.map((page) => transformNotionPage(page as PageObjectResponse))

  return {
    posts: posts,
    has_more: response.has_more,
    next_cursor: response.next_cursor,
  }
}

/**
 * 获取所有博客文章
 * @returns 返回所有博客文章的列表和总数
 */
export async function getAllBlogPosts(): Promise<{
  posts: NotionPage[]
  total: number
}> {
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID
  if (!databaseId) {
    throw new Error('NOTION_BLOG_DATABASE_ID is not configured')
  }

  const posts: NotionPage[] = []
  let cursor: string | undefined

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100, // 使用最大页面大小以减少请求次数
      sorts: [
        {
          property: 'created_time',
          direction: 'descending',
        },
      ],
    })

    const fetchedPosts = response.results.map((page) =>
      transformNotionPage(page as PageObjectResponse)
    )
    posts.push(...fetchedPosts)

    if (!response.has_more) {
      break
    }
    cursor = response.next_cursor || undefined
  }

  return {
    posts: posts,
    total: posts.length,
  }
}
