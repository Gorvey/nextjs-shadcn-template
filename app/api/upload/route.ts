import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

export async function POST(request: Request) {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    if (!databaseId) {
      return NextResponse.json({ success: false, error: '未配置数据库 ID' }, { status: 500 })
    }

    const properties = await request.json()

    // 创建新页面
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties,
    })

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('创建页面失败:', error)
    return NextResponse.json({ success: false, error: '创建页面失败' }, { status: 500 })
  }
}
