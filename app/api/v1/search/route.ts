import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { transformNotionPage } from '@/utils/notion'
import { PageObjectResponse } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || query.trim() === '') {
      return NextResponse.json({ results: [] })
    }

    const searchResults = await Promise.allSettled([
      // 搜索资源数据库
      searchDatabase(process.env.NOTION_DATABASE_ID, query, 'resource'),
      // 搜索博客数据库
      searchDatabase(process.env.NOTION_BLOG_DATABASE_ID, query, 'blog'),
    ])

    const results = searchResults
      .map((result) => (result.status === 'fulfilled' ? result.value : []))
      .flat()

    return NextResponse.json({ results })
  } catch (error) {
    console.error('搜索错误:', error)
    return NextResponse.json({ error: '搜索失败' }, { status: 500 })
  }
}

async function searchDatabase(
  databaseId: string | undefined,
  query: string,
  type: 'resource' | 'blog'
): Promise<any[]> {
  if (!databaseId) {
    console.warn(`${type} 数据库 ID 未配置`)
    return []
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        or: [
          {
            property: 'Name',
            title: {
              contains: query,
            },
          },
          {
            property: 'desc',
            rich_text: {
              contains: query,
            },
          },
          // {
          //   property: '标签',
          //   multi_select: {
          //     contains: query,
          //   },
          // },
          // {
          //   property: '页面类型',
          //   multi_select: {
          //     contains: query,
          //   },
          // },
        ],
      },
      page_size: 10,
    })

    return response.results.map((page) => ({
      ...transformNotionPage(page as PageObjectResponse),
      type,
    }))
  } catch (error) {
    console.error(`搜索 ${type} 数据库时出错:`, error)
    return []
  }
}
