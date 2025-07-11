'use client'

import Image, { type ImageProps } from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { extractThumbHashFromUrl, thumbHashToDataURL } from '@/utils/thumbhash'

interface ThumbHashImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  src: string
  alt: string
  className?: string
  fill?: boolean
}

/**
 * 支持 ThumbHash 模糊占位图的 Image 组件
 */
export function ThumbHashImage({ src, alt, className, fill, ...props }: ThumbHashImageProps) {
  const [actualImageSrc, setActualImageSrc] = useState<string>('')
  const [blurDataURL, setBlurDataURL] = useState<string>('')

  const thumbHash = useMemo(() => extractThumbHashFromUrl(src), [src])

  useEffect(() => {
    if (thumbHash) {
      const dataUrl = thumbHashToDataURL(thumbHash)
      setBlurDataURL(dataUrl)

      try {
        const url = new URL(src)
        url.searchParams.delete('thumbhash')
        setActualImageSrc(url.toString())
      } catch {
        setActualImageSrc(src)
      }
    } else {
      setActualImageSrc(src)
      setBlurDataURL('')
    }
  }, [src, thumbHash])

  if (!actualImageSrc) {
    return null
  }

  return (
    <Image
      {...props}
      fill={fill}
      src={actualImageSrc}
      alt={alt}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      className={cn(className)}
    />
  )
}
