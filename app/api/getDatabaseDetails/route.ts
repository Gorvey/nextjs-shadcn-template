import { NextResponse } from 'next/server'
import { getDatabaseDetails } from '@/lib/notion'

export async function GET() {
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
