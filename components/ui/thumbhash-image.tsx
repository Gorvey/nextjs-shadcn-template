'use client'

import { useState, useEffect, useMemo } from 'react'
import Image, { ImageProps } from 'next/image'
import { extractThumbHashFromUrl, thumbHashToDataURL } from '@/lib/thumbhash'
import { cn } from '@/lib/utils'

interface ThumbHashImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  src: string
  alt: string
  className?: string
  fill?: boolean
}

export function ThumbHashImage({ src, alt, className, fill, ...props }: ThumbHashImageProps) {
  const [actualImageSrc, setActualImageSrc] = useState<string>('')
  const [blurDataURL, setBlurDataURL] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)

  // 使用 useMemo 缓存 thumbhash 提取结果
  const thumbHash = useMemo(() => extractThumbHashFromUrl(src), [src])

  useEffect(() => {
    setIsLoaded(false)

    if (thumbHash) {
      // 生成模糊占位图
      const dataUrl = thumbHashToDataURL(thumbHash)
      setBlurDataURL(dataUrl)

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
      setBlurDataURL('')
    }
  }, [src, thumbHash])

  // 如果还没有处理完URL，不渲染任何内容
  if (!actualImageSrc) {
    return null
  }

  return (
    <div className="relative w-full h-full">
      {blurDataURL && (
        <Image
          {...props}
          fill={fill}
          src={blurDataURL}
          alt={alt}
          className={cn(
            'absolute inset-0 transition-[opacity] duration-[200ms] ease-in will-change-opacity',
            isLoaded ? 'opacity-0' : 'opacity-100',
            className
          )}
        />
      )}
      <Image
        {...props}
        fill={fill}
        src={actualImageSrc}
        alt={alt}
        onLoadingComplete={() => setIsLoaded(true)}
        className={cn(
          'relative inset-0 transition-[opacity] duration-[200ms] ease-out will-change-opacity',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </div>
  )
}
