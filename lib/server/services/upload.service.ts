import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import { validateEnvVar } from '@/lib/server/api-middleware'
import { addThumbHashToUrl, generateThumbHashServer } from '@/utils/thumbhash-server'

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

  /**
   * 使用 sharp 处理图片：转换为 webp 格式并进行高质量压缩
   * @param buffer 原始图片缓冲区
   * @returns 处理后的 webp 图片缓冲区
   */
  private async processImage(buffer: Buffer): Promise<Buffer> {
    try {
      // 获取原始图片信息
      const metadata = await sharp(buffer).metadata()

      // 使用 sharp 转换为 webp 格式，保持原尺寸，高质量压缩
      const processedBuffer = await sharp(buffer)
        .webp({
          quality: 85, // 高质量压缩，保留细节
          effort: 6, // 最高压缩效率
          smartSubsample: true, // 智能色度子采样
          nearLossless: false, // 不使用近无损模式以获得更好的压缩比
        })
        .toBuffer()

      console.log(
        `图片处理完成: ${metadata.width}x${metadata.height} ${metadata.format} -> webp, 原始大小: ${buffer.length} bytes, 压缩后: ${processedBuffer.length} bytes`
      )

      return processedBuffer
    } catch (error) {
      console.error('图片处理失败，使用原始图片:', error)
      return buffer
    }
  }

  async uploadFile(file: File, sourceUrl: string): Promise<UploadResult> {
    // 从 URL 中提取 origin
    let origin: string
    try {
      const urlObj = new URL(sourceUrl)
      origin = urlObj.hostname
    } catch (_error) {
      throw new Error('无效的URL格式')
    }

    // 将 origin 转换为前缀（使用连字符替换点号）
    const prefix = origin.replace(/\./g, '-')
    const fileName = `${prefix}/${nanoid()}.webp` // 统一使用 webp 扩展名
    const buffer = await file.arrayBuffer()
    const originalBuffer = Buffer.from(buffer)

    // 使用 sharp 处理图片
    const processedBuffer = await this.processImage(originalBuffer)

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
      Body: processedBuffer,
      ContentType: 'image/webp', // 设置正确的 Content-Type
    })

    await this.s3Client.send(command)

    const imageUrl = `${publicUrl}/${fileName}`

    // 生成 thumbhash 并拼接到 URL
    try {
      const thumbHash = await generateThumbHashServer(processedBuffer)
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

  async downloadAndUpload(inputImageUrl: string, sourceUrl: string): Promise<UploadResult> {
    // 下载图片
    const response = await fetch(inputImageUrl)
    if (!response.ok) {
      throw new Error('下载图片失败')
    }

    const blob = await response.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())

    // 直接处理下载的图片缓冲区，而不是创建 File 对象
    // 从 URL 中提取 origin
    let origin: string
    try {
      const urlObj = new URL(sourceUrl)
      origin = urlObj.hostname
    } catch (_error) {
      throw new Error('无效的URL格式')
    }

    // 将 origin 转换为前缀（使用连字符替换点号）
    const prefix = origin.replace(/\./g, '-')
    const fileName = `${prefix}/${nanoid()}.webp` // 统一使用 webp 扩展名

    // 使用 sharp 处理图片
    const processedBuffer = await this.processImage(buffer)

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
      Body: processedBuffer,
      ContentType: 'image/webp', // 设置正确的 Content-Type
    })

    await this.s3Client.send(command)

    const imageUrl = `${publicUrl}/${fileName}`

    // 生成 thumbhash 并拼接到 URL
    try {
      const thumbHash = await generateThumbHashServer(processedBuffer)
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
}
