import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: '请提供有效的 URL' }, { status: 400 })
    }

    // 获取网页内容
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    // 提取元数据
    const metadata = {
      icon:
        $('link[rel="apple-touch-icon"]').attr('href') ||
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        '',
      title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
      description:
        $('meta[name="description"]').attr('content') ||
        $('meta[property="og:description"]').attr('content') ||
        '',
    }

    return NextResponse.json({ success: true, data: metadata })
  } catch (error) {
    console.error('获取元数据失败:', error)
    return NextResponse.json({ error: '获取元数据失败' }, { status: 500 })
  }
}
