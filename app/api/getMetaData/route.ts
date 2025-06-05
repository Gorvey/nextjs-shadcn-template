import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 提取图标URL并处理相对路径
function getIconUrl(iconHref: string, baseUrl: string): string {
  if (!iconHref) return ''

  // 如果已经是完整URL，直接返回
  if (iconHref.startsWith('http://') || iconHref.startsWith('https://')) {
    return iconHref
  }

  try {
    const url = new URL(baseUrl)

    // 如果是绝对路径（以/开头）
    if (iconHref.startsWith('/')) {
      return `${url.protocol}//${url.host}${iconHref}`
    }

    // 如果是相对路径
    return `${url.protocol}//${url.host}/${iconHref.replace(/^\.\//, '')}`
  } catch (error) {
    console.error('处理图标URL失败:', error)
    return iconHref
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
  }

  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: '请提供有效的 URL' }, { status: 400 })
    }

    // 获取网页内容
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    // 获取最佳图标（优先高分辨率）
    function getBestIcon($: cheerio.CheerioAPI, baseUrl: string): string {
      const iconSelectors = [
        // 优先获取Apple Touch图标（通常分辨率较高）
        'link[rel="apple-touch-icon"][sizes]',
        'link[rel="apple-touch-icon-precomposed"][sizes]',
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        // 然后是标准图标，按分辨率排序
        'link[rel="icon"][sizes]',
        'link[rel="shortcut icon"][sizes]',
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        // 最后是favicon
        'link[href*="favicon"]',
      ]

      // 收集所有图标，包含尺寸信息
      const icons: Array<{ href: string; size: number; priority: number }> = []

      iconSelectors.forEach((selector, priority) => {
        $(selector).each((_, element) => {
          const href = $(element).attr('href')
          if (!href) return

          const sizesAttr = $(element).attr('sizes')
          let size = 0

          if (sizesAttr && sizesAttr !== 'any') {
            // 解析尺寸，如 "192x192" 或 "32x32 16x16"
            const sizeMatch = sizesAttr.match(/(\d+)x(\d+)/)
            if (sizeMatch) {
              size = parseInt(sizeMatch[1]) * parseInt(sizeMatch[2])
            }
          }

          icons.push({
            href: getIconUrl(href, baseUrl),
            size,
            priority,
          })
        })
      })

      if (icons.length === 0) {
        // 如果没有找到图标，尝试获取默认favicon
        const defaultFavicon = getIconUrl('/favicon.ico', baseUrl)
        return defaultFavicon
      }

      // 按优先级和尺寸排序（优先级越小越好，尺寸越大越好）
      icons.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        return b.size - a.size
      })

      return icons[0].href
    }

    // 提取元数据
    const metadata = {
      icon: getBestIcon($, url),
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
