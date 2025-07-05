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
 * 优化版本：为 Next.js blurDataURL 生成小尺寸、高质量的占位图
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

    // 创建canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('无法创建canvas context')
      return ''
    }

    // 为 blurDataURL 使用较小但足够的尺寸 (Next.js 推荐 64x64 或更小)
    const maxBlurSize = 40
    const aspectRatio = w / h

    let canvasWidth
    let canvasHeight
    if (aspectRatio > 1) {
      canvasWidth = maxBlurSize
      canvasHeight = Math.round(maxBlurSize / aspectRatio)
    } else {
      canvasHeight = maxBlurSize
      canvasWidth = Math.round(maxBlurSize * aspectRatio)
    }

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // 启用高质量图像平滑
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // 创建原始尺寸的ImageData
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')

    if (!tempCtx) {
      console.error('无法创建临时canvas context')
      return ''
    }

    tempCanvas.width = w
    tempCanvas.height = h
    tempCtx.imageSmoothingEnabled = false

    // 创建ImageData并填充RGBA数据
    const imageData = tempCtx.createImageData(w, h)
    imageData.data.set(rgba)
    tempCtx.putImageData(imageData, 0, 0)

    // 将原始thumbhash平滑缩放到目标尺寸
    ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, canvasWidth, canvasHeight)

    // 返回高质量的小尺寸data URL（使用 JPEG 格式，质量稍低以减小大小）
    return canvas.toDataURL('image/jpeg', 0.8)
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
