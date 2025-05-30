import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'

const s3Client = new S3Client({
  region: process.env.CLOUDFLARE_R2_REGION!,
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 })
    }

    const fileExtension = file.name.split('.').pop()
    const fileName = `${nanoid()}.${fileExtension}`
    const buffer = await file.arrayBuffer()

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: fileName,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    })

    await s3Client.send(command)

    const url = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('上传图片失败:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}
