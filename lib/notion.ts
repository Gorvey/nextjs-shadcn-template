import { Client } from '@notionhq/client'
import type { NotionPage, NotionDatabase } from '@/types/notion'
import type { PageObjectResponse, DatabaseObjectResponse } from '@notionhq/client'
import { transformNotionPage } from '@/utils/notion'
import { NotionAPI } from 'notion-client'
import { CategoryData } from '@/types/notion'
const notionAPI = new NotionAPI()
const notion = new Client({ auth: process.env.NOTION_TOKEN })

interface NotionCategoryPage {
  id: string
  name: string
  desc: string
  sort: number
  icon?: NotionPage['icon']
  '上级 项目': Array<{ id: string }> | null
  '子级 项目': Array<{ id: string }> | null
}

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

  // // 过滤掉没有 Name、desc、url 任意一个的记录
  // const filteredPages = pages.filter((page) => {
  //   // 查找 Name、desc、url 字段
  //   const nameValue = findPropertyValue(page, ['name', 'Name', 'title', 'Title'])
  //   const descValue = findPropertyValue(page, ['desc', 'Desc', 'description', 'Description'])
  //   const urlValue = findPropertyValue(page, ['url', 'URL', 'link', 'Link'])

  //   // 检查是否所有必需字段都有值（非空且非空字符串）
  //   const hasName = nameValue && nameValue.toString().trim() !== ''
  //   const hasDesc = descValue && descValue.toString().trim() !== ''
  //   const hasUrl = urlValue && urlValue.toString().trim() !== ''

  //   // 只有当所有字段都有值时才保留这条记录
  //   return hasName && hasDesc && hasUrl
  // })

  return pages
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

/**
 * @description 获取并格式化分类数据
 * @param databaseId
 * @returns
 */
export async function getFormattedCategoryData(databaseId: string): Promise<CategoryData[]> {
  const allPages = await getDatabase(databaseId)
  console.log('category all page', allPages)
  // 转换数据格式
  const pages: NotionCategoryPage[] = allPages.map((page: NotionPage) => ({
    id: page.id,
    name: (page.name as string) || '未命名',
    desc: (page.desc as string) || '',
    sort: (page.sort as number) || 0,
    icon: page.icon,
    '上级 项目': (page['上级 项目'] as { id: string }[]) || null,
    '子级 项目': (page['子级 项目'] as { id: string }[]) || null,
  }))

  // 筛选出一级分类（没有上级项目的）
  const topLevelCategories = pages.filter(
    (page) => !page['上级 项目'] || page['上级 项目'].length === 0
  )

  // 构建完整的分类结构
  const categories: CategoryData[] = topLevelCategories
    .map((topCategory) => {
      // 查找子分类
      const subcategories = pages
        .filter(
          (page) =>
            page['上级 项目'] && page['上级 项目'].some((parent) => parent.id === topCategory.id)
        )
        .map((subPage) => ({
          id: subPage.id,
          name: subPage.name,
          desc: subPage.desc,
          icon: subPage.icon,
        }))

      return {
        id: topCategory.id,
        name: topCategory.name,
        desc: topCategory.desc,
        sort: topCategory.sort,
        icon: topCategory.icon,
        subcategories,
      }
    })
    .sort((a, b) => a.sort - b.sort)

  return categories
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
export async function getAllBlogPosts(): Promise<{ posts: NotionPage[]; total: number }> {
  const databaseId = process.env.NOTION_BLOG_DATABASE_ID
  if (!databaseId) {
    throw new Error('NOTION_BLOG_DATABASE_ID is not configured')
  }

  const posts: NotionPage[] = []
  let cursor: string | undefined = undefined

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
