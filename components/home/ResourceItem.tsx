import { Button } from '@/components/ui/button'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { FaNpm, FaGithub } from 'react-icons/fa'
import { FaExpand } from 'react-icons/fa'
import type { NotionPage } from '@/types/notion'
import Image from 'next/image'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'

interface ResourceItemProps {
  item: NotionPage
}

export function ResourceItem({ item }: ResourceItemProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const title = typeof item.Name === 'string' ? item.Name : ''
  const description = typeof item.desc === 'string' ? item.desc : ''
  const url = typeof item.URL === 'string' ? item.URL : ''
  // 处理 cover
  const getCoverUrl = () => {
    if (!item.cover) return '/placeholder.jpg'
    if (item.cover.type === 'external') return item.cover.external.url
    if (item.cover.type === 'file') return item.cover.file.url
    return '/placeholder.jpg'
  }

  // 处理 icon
  const getIconUrl = () => {
    if (!item.icon) return '/avatar-placeholder.jpg'
    if (item.icon.type === 'external') return item.icon.external.url
    if (item.icon.type === 'file') return item.icon.file.url
    if (item.icon.type === 'emoji') return '/avatar-placeholder.jpg'
    return '/avatar-placeholder.jpg'
  }

  const createdDate = new Date(item.created_time).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="has-[:focus-visible]:ring-offset-background relative flex w-full flex-col gap-2 text-sm sm:min-w-0">
      <div className="shadow-base bg-muted relative aspect-video w-full overflow-hidden rounded-lg text-sm has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 has-[:focus-visible]:ring-offset-1">
        <Image
          alt={description}
          src={getCoverUrl()}
          fill
          className="object-cover object-top"
          sizes="100vw"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[hsla(0,0%,100%,0.3)] to-[hsla(0,0%,40%,0.3)] opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100">
          <div className="z-10 hidden w-32 flex-col items-center justify-center gap-2 sm:flex">
            <Button variant="default" className="w-full" onClick={() => window.open(url, '_blank')}>
              查看详情
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.open(url, '_blank')}>
              <ExternalLinkIcon className="mr-1 h-3 w-3" />
              打开链接
            </Button>
          </div>
          <div className="absolute bottom-4 px-4 flex w-full justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-black/80 hover:bg-black dark:bg-black/80 dark:hover:bg-black"
              onClick={() => setIsPreviewOpen(true)}
            >
              <FaExpand className="h-5 w-5 text-white" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-[#CB3837]/80 hover:bg-[#CB3837] dark:bg-[#CB3837]/80 dark:hover:bg-[#CB3837]"
                onClick={() => window.open(`https://www.npmjs.com/package/${title}`, '_blank')}
              >
                <FaNpm className="h-5 w-5 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                onClick={() => window.open(`https://github.com/${title}`, '_blank')}
              >
                <FaGithub className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Lightbox
        open={isPreviewOpen}
        close={() => setIsPreviewOpen(false)}
        slides={[{ src: getCoverUrl() }]}
        plugins={[Zoom, Download, Fullscreen]}
        carousel={{
          finite: true,
          preload: 1,
          spacing: 0,
          padding: 0,
        }}
        controller={{ closeOnBackdropClick: true }}
        zoom={{
          scrollToZoom: true,
        }}
      />
      <a
        className="flex items-center gap-3 pr-1"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="bg-alpha-400 relative flex shrink-0 select-none items-center justify-center overflow-hidden after:absolute after:inset-0 after:border after:mix-blend-darken dark:after:mix-blend-lighten text-sm rounded-full size-9">
          <Image
            src={getIconUrl()}
            alt="Avatar"
            width={36}
            height={36}
            className="h-full w-full object-cover aspect-auto"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="line-clamp-1 font-medium leading-none text-foreground">{title}</div>
          <div className="flex flex-row items-center gap-1.5 text-gray-500">
            <span className="text-[13px] leading-none">{createdDate}</span>
          </div>
        </div>
      </a>
    </div>
  )
}
