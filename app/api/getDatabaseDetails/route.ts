import { NextRequest, NextResponse } from 'next/server'
import { getDatabaseDetails } from '@/lib/notion'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Client } from '@notionhq/client'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
  }

  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    if (!databaseId) {
      return NextResponse.json({ success: false, error: '未配置数据库 ID' }, { status: 500 })
    }

    const data = await getDatabaseDetails(databaseId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('获取数据库详情失败:', error)
    return NextResponse.json({ success: false, error: '获取数据库详情失败' }, { status: 500 })
  }
}
