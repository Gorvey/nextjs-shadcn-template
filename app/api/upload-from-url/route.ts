import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
  }
  try {
    const { url, sourceUrl } = await request.json()

    if (!url) {
      return NextResponse.json({ error: '请提供图片URL' }, { status: 400 })
    }

    if (!sourceUrl) {
      return NextResponse.json({ error: '请提供源URL' }, { status: 400 })
    }

    // 下载图片
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('下载图片失败')
    }

    const blob = await response.blob()
    const formData = new FormData()
    formData.append('file', blob, 'image.jpg')
    formData.append('url', sourceUrl)

    // 从当前请求URL中获取origin
    const requestUrl = new URL(request.url)
    const origin = requestUrl.origin

    // 调用现有的上传API
    const uploadResponse = await fetch(`${origin}/api/upload-image`, {
      method: 'POST',
      body: formData,
    })

    const data = await uploadResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('转存图片失败:', error)
    return NextResponse.json({ error: '转存图片失败' }, { status: 500 })
  }
}
