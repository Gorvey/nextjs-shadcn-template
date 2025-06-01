import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth/next'
// import cloudinary from 'cloudinary'
import { authOptions } from '@/lib/auth'

const s3Client = new S3Client({
  region: process.env.CLOUDFLARE_R2_REGION!,
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ success: false, error: '未授权访问' }, { status: 401 })
  }
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const sourceUrl = formData.get('url') as string

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 })
    }

    if (!sourceUrl) {
      return NextResponse.json({ error: '没有URL' }, { status: 400 })
    }

    // 从 URL 中提取 origin
    let origin: string
    try {
      const urlObj = new URL(sourceUrl)
      origin = urlObj.hostname
    } catch (error) {
      return NextResponse.json({ error: '无效的URL' }, { status: 400 })
    }

    // 将 origin 转换为前缀（使用连字符替换点号）
    const prefix = origin.replace(/\./g, '-')
    const fileExtension = file.name.split('.').pop()
    const fileName = `${prefix}/${nanoid()}.${fileExtension}`
    const buffer = await file.arrayBuffer()

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    })

    await s3Client.send(command)

    const imageUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error('上传图片失败:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
