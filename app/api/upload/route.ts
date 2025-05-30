import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
  }
  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    if (!databaseId) {
      return NextResponse.json({ success: false, error: '未配置数据库 ID' }, { status: 500 })
    }

    const body = await request.json()
    console.log('接收到的请求体:', JSON.stringify(body, null, 2))

    // 创建新页面
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: body.properties,
      icon: body.icon,
      cover: body.cover,
    })

    return NextResponse.json({ success: true, data: response })
  } catch (error: any) {
    console.error('创建页面失败:', error)
    console.error('错误详情:', error.body)
    return NextResponse.json(
      {
        success: false,
        error: '创建页面失败',
        details: error.body,
      },
      { status: 500 }
    )
  }
}
