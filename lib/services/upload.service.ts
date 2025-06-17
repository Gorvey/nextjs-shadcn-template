import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import { generateThumbHashServer, addThumbHashToUrl } from '@/lib/thumbhash-server'
import { validateEnvVar } from '@/lib/api-middleware'

export interface UploadResult {
  url: string
  fileName: string
}

export class UploadService {
  private s3Client: S3Client

  constructor() {
    const region = validateEnvVar('CLOUDFLARE_R2_REGION', process.env.CLOUDFLARE_R2_REGION)
    const accountId = validateEnvVar('CLOUDFLARE_ACCOUNT_ID', process.env.CLOUDFLARE_ACCOUNT_ID)
    const accessKeyId = validateEnvVar(
      'CLOUDFLARE_R2_ACCESS_KEY_ID',
      process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    )
    const secretAccessKey = validateEnvVar(
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
      process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
    )

    this.s3Client = new S3Client({
      region,
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  async uploadFile(file: File, sourceUrl: string): Promise<UploadResult> {
    // 从 URL 中提取 origin
    let origin: string
    try {
      const urlObj = new URL(sourceUrl)
      origin = urlObj.hostname
    } catch (error) {
      throw new Error('无效的URL格式')
    }

    // 将 origin 转换为前缀（使用连字符替换点号）
    const prefix = origin.replace(/\./g, '-')
    const fileExtension = file.name.split('.').pop()
    const fileName = `${prefix}/${nanoid()}.${fileExtension}`
    const buffer = await file.arrayBuffer()
    const bufferData = Buffer.from(buffer)

    const bucketName = validateEnvVar(
      'CLOUDFLARE_R2_BUCKET_NAME',
      process.env.CLOUDFLARE_R2_BUCKET_NAME
    )
    const publicUrl = validateEnvVar(
      'CLOUDFLARE_R2_PUBLIC_URL',
      process.env.CLOUDFLARE_R2_PUBLIC_URL
    )

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: bufferData,
      ContentType: file.type,
    })

    await this.s3Client.send(command)

    const imageUrl = `${publicUrl}/${fileName}`

    // 生成 thumbhash 并拼接到 URL
    try {
      const thumbHash = await generateThumbHashServer(bufferData)
      const imageUrlWithThumbHash = addThumbHashToUrl(imageUrl, thumbHash)
      return {
        url: imageUrlWithThumbHash,
        fileName,
      }
    } catch (thumbHashError) {
      console.error('生成 thumbhash 失败，返回原始 URL:', thumbHashError)
      return {
        url: imageUrl,
        fileName,
      }
    }
  }

  async downloadAndUpload(imageUrl: string, sourceUrl: string): Promise<UploadResult> {
    // 下载图片
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('下载图片失败')
    }

    const blob = await response.blob()
    const file = new File([blob], 'image.jpg', { type: blob.type })

    return await this.uploadFile(file, sourceUrl)
  }
}
