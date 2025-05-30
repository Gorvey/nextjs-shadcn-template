import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: '请提供图片URL' }, { status: 400 })
    }

    // 下载图片
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('下载图片失败')
    }

    const blob = await response.blob()
    const formData = new FormData()
    formData.append('file', blob, 'image.jpg')

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
