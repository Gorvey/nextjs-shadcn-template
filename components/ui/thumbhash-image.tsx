'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { extractThumbHashFromUrl, thumbHashToDataURL } from '@/lib/thumbhash'
import { cn } from '@/lib/utils'

interface ThumbHashImageProps extends ImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
}

export function ThumbHashImage({ src, alt, className, fill, ...props }: ThumbHashImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [thumbHashDataUrl, setThumbHashDataUrl] = useState<string>('')
  const [actualImageSrc, setActualImageSrc] = useState<string>('')

  useEffect(() => {
    // 提取thumbhash
    const thumbHash = extractThumbHashFromUrl(src)

    if (thumbHash) {
      // 生成thumbhash占位图
      const dataUrl = thumbHashToDataURL(thumbHash)
      setThumbHashDataUrl(dataUrl)

      // 获取真实图片URL（去掉thumbhash参数）
      try {
        const url = new URL(src)
        url.searchParams.delete('thumbhash')
        setActualImageSrc(url.toString())
      } catch {
        setActualImageSrc(src)
      }
    } else {
      // 没有thumbhash，直接使用原始图片
      setActualImageSrc(src)
    }
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  // 如果使用 fill，父容器需要 relative 定位
  if (fill) {
    return (
      <>
        {/* ThumbHash占位图 */}
        {thumbHashDataUrl && !isLoaded && (
          <Image
            fill
            src={thumbHashDataUrl}
            alt=""
            className={cn('absolute inset-0 z-10 transition-opacity duration-300', className)}
            style={{
              filter: 'blur(1px)',
              imageRendering: 'pixelated',
            }}
            unoptimized
            {...props}
          />
        )}

        {/* 真实图片 */}
        {actualImageSrc && (
          <Image
            fill
            src={actualImageSrc}
            alt={alt}
            onLoad={handleLoad}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : thumbHashDataUrl ? 'opacity-0' : 'opacity-100',
              className
            )}
            {...props}
          />
        )}
      </>
    )
  }

  // 常规模式
  return (
    <div className="relative">
      {/* ThumbHash占位图 */}
      {thumbHashDataUrl && !isLoaded && (
        <Image
          {...props}
          src={thumbHashDataUrl}
          alt=""
          className={cn(
            'absolute inset-0 z-10 object-cover transition-opacity duration-300',
            className
          )}
          style={{
            filter: 'blur(1px)',
            imageRendering: 'pixelated',
          }}
          unoptimized
        />
      )}

      {/* 真实图片 */}
      {actualImageSrc && (
        <Image
          {...props}
          src={actualImageSrc}
          alt={alt}
          onLoad={handleLoad}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : thumbHashDataUrl ? 'opacity-0' : 'opacity-100',
            className
          )}
        />
      )}
    </div>
  )
}
