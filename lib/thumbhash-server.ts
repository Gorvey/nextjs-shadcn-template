import { rgbaToThumbHash } from 'thumbhash'
import sharp from 'sharp'

/**
 * 服务端生成 thumbhash（使用 sharp）
 */
export async function generateThumbHashServer(buffer: Buffer): Promise<string> {
  try {
    // 使用 sharp 处理图片
    const maxSize = 100
    const { data, info } = await sharp(buffer)
      .resize(maxSize, maxSize, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // 生成 thumbhash
    const thumbHash = rgbaToThumbHash(info.width, info.height, data)

    // 转换为 base64 字符串
    const thumbHashBase64 = Buffer.from(thumbHash).toString('base64')

    return thumbHashBase64
  } catch (error) {
    console.error('服务端生成 thumbhash 失败:', error)
    throw error
  }
}

/**
 * 向URL添加thumbhash参数
 */
export function addThumbHashToUrl(url: string, thumbHash: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.set('thumbhash', thumbHash)
    return urlObj.toString()
  } catch {
    return url
  }
}
