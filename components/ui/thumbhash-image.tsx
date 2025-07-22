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
  const [isCached, setIsCached] = useState(false)

  const { actualImageSrc, blurDataURL } = useMemo(() => {
    const thumbHash = extractThumbHashFromUrl(src)
    let blurDataURL = ''
    let actualImageSrc = src
    if (thumbHash) {
      blurDataURL = thumbHashToDataURL(thumbHash)
      try {
        const url = new URL(src)
        url.searchParams.delete('thumbhash')
        actualImageSrc = url.toString()
      } catch {
        actualImageSrc = src
      }
    }
    return { actualImageSrc, blurDataURL }
  }, [src])

  useEffect(() => {
    if (!actualImageSrc) return
    const img = new window.Image()
    img.src = actualImageSrc
    if (img.complete) {
      setIsCached(true)
    } else {
      img.onload = () => setIsCached(true)
      img.onerror = () => setIsCached(false)
    }
  }, [actualImageSrc])

  if (!actualImageSrc) return null

  return (
    <Image
      {...props}
      fill={fill}
      src={actualImageSrc}
      alt={alt}
      placeholder={!isCached && blurDataURL ? 'blur' : 'empty'}
      blurDataURL={!isCached ? blurDataURL : undefined}
      className={cn(className)}
    />
  )
}
