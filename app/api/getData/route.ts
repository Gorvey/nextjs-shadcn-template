import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/notion'

export async function GET() {
  const databaseId = process.env.NOTION_DATABASE_ID!
  try {
    const data = await getDatabase(databaseId)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
