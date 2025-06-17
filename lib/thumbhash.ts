import { rgbaToThumbHash, thumbHashToRGBA } from 'thumbhash'

/**
 * 从图片URL或File对象生成thumbhash（客户端）
 */
export async function generateThumbHash(imageSource: string | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      try {
        // 创建canvas来获取图片的RGBA数据
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法创建canvas context'))
          return
        }

        // 设置合适的缩放尺寸（保持thumbhash的效果，不需要太大）
        const maxSize = 100
        const scale = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)

        // 绘制图片到canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // 获取RGBA数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const rgba = imageData.data

        // 生成thumbhash
        const thumbHash = rgbaToThumbHash(canvas.width, canvas.height, rgba)

        // 转换为base64字符串
        const thumbHashBase64 = btoa(String.fromCharCode(...thumbHash))

        resolve(thumbHashBase64)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }

    // 设置跨域属性
    img.crossOrigin = 'anonymous'

    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else {
      // File对象
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(imageSource)
    }
  })
}

/**
 * 将thumbhash解码为base64图片数据URL
 */
export function thumbHashToDataURL(thumbHashBase64: string): string {
  try {
    // 将base64字符串解码为Uint8Array
    const binaryString = atob(thumbHashBase64)
    const thumbHashArray = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      thumbHashArray[i] = binaryString.charCodeAt(i)
    }

    // 使用thumbhash库解码为RGBA数据
    const thumbHashData = thumbHashToRGBA(thumbHashArray)
    const { w, h, rgba } = thumbHashData

    // 创建小尺寸canvas用于原始数据
    const smallCanvas = document.createElement('canvas')
    const smallCtx = smallCanvas.getContext('2d')

    if (!smallCtx) {
      console.error('无法创建canvas context')
      return ''
    }

    smallCanvas.width = w
    smallCanvas.height = h

    // 关闭抗锯齿以保持原始像素效果
    smallCtx.imageSmoothingEnabled = false

    // 创建ImageData并填充RGBA数据
    const imageData = smallCtx.createImageData(w, h)
    imageData.data.set(rgba)

    // 将ImageData绘制到小canvas
    smallCtx.putImageData(imageData, 0, 0)

    // 创建更大的canvas用于平滑放大
    const targetSize = Math.max(w, h) < 50 ? 200 : Math.max(w, h) * 4
    const scaleX = targetSize / w
    const scaleY = targetSize / h
    const scale = Math.min(scaleX, scaleY)

    const bigCanvas = document.createElement('canvas')
    const bigCtx = bigCanvas.getContext('2d')

    if (!bigCtx) {
      console.error('无法创建大canvas context')
      return smallCanvas.toDataURL('image/png')
    }

    bigCanvas.width = w * scale
    bigCanvas.height = h * scale

    // 启用高质量图像平滑
    bigCtx.imageSmoothingEnabled = true
    bigCtx.imageSmoothingQuality = 'high'

    // 将小图像平滑放大到大canvas
    bigCtx.drawImage(smallCanvas, 0, 0, w, h, 0, 0, bigCanvas.width, bigCanvas.height)

    // 返回高质量的data URL
    return bigCanvas.toDataURL('image/jpeg', 0.9)
  } catch (error) {
    console.error('thumbHashToDataURL 转换失败:', error)
    return ''
  }
}

/**
 * 从URL中提取thumbhash参数
 */
export function extractThumbHashFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('thumbhash')
  } catch {
    return null
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
