import { Button } from '@/components/ui/button'
import { ExternalLinkIcon, CopyIcon, CheckIcon } from '@radix-ui/react-icons'
import { FaNpm, FaGithub } from 'react-icons/fa'
import { FaExpand } from 'react-icons/fa'
import { SiNotion } from 'react-icons/si'
import type { NotionPage } from '@/types/notion'
import { ThumbHashImage } from '@/components/ui/thumbhash-image'
import Image from 'next/image'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface ResourceItemProps {
  item: NotionPage
}

export function ResourceItem({ item }: ResourceItemProps) {
  const { data: session } = useSession()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const title = typeof item.Name === 'string' ? item.Name : ''
  const description = typeof item.desc === 'string' ? item.desc : ''
  const url = typeof item.URL === 'string' ? item.URL : ''
  const Github = typeof item.Github === 'string' ? item.Github : ''
  const npm = typeof item.Github === 'string' ? item.npm : ''
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

  // 收集所有array属性的name值作为tags，并去重
  const getTags = () => {
    const tags: string[] = []
    const arrayFields = ['页面类型', '标签', '付费情况', '服务模式', '访问限制', '运行环境', '分组']

    arrayFields.forEach((field) => {
      const fieldValue = (item as any)[field]
      if (Array.isArray(fieldValue)) {
        fieldValue.forEach((subItem) => {
          if (subItem && typeof subItem === 'object' && subItem.name) {
            tags.push(subItem.name)
          }
        })
      }
    })

    // 使用Set进行去重，然后转回数组
    return [...new Set(tags)]
  }

  const tags = getTags()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // 访问Notion原页面
  const openNotionPage = () => {
    // 将带连字符的ID转换为Notion URL格式（去掉连字符）
    const pageId = item.id.replace(/-/g, '')
    const notionUrl = `https://www.notion.so/${pageId}`
    const notionClientUrl = `notion://www.notion.so/${pageId}`

    // 检测是否支持自定义协议
    let hasOpenedClient = false

    // 创建一个不可见的iframe来尝试打开客户端
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = notionClientUrl
    document.body.appendChild(iframe)

    // 设置一个短暂的延迟来检测是否成功打开了客户端
    const timeout = setTimeout(() => {
      if (!hasOpenedClient) {
        // 如果客户端没有打开，则打开网页版
        window.open(notionUrl, '_blank')
      }
      document.body.removeChild(iframe)
    }, 500)

    // 监听窗口焦点变化来检测是否打开了客户端
    const handleFocus = () => {
      hasOpenedClient = true
      clearTimeout(timeout)
      document.body.removeChild(iframe)
      window.removeEventListener('blur', handleFocus)
    }

    window.addEventListener('blur', handleFocus)

    // 作为备用方案，也直接尝试打开网页版
    setTimeout(() => {
      if (!hasOpenedClient) {
        window.open(notionUrl, '_blank')
      }
    }, 1500)
  }

  return (
    <div className=" rounded-lg  has-[:focus-visible]:ring-offset-background relative flex w-full flex-col gap-2 text-sm sm:min-w-0">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg text-sm has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 has-[:focus-visible]:ring-offset-1">
        <ThumbHashImage
          fill
          sizes="100vw"
          alt={description}
          src={getCoverUrl()}
          className="object-cover object-top"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[hsla(0,0%,100%,0.3)] to-[hsla(0,0%,40%,0.3)] opacity-0 transition-opacity focus-within:opacity-100 hover:opacity-100">
          <div className="z-10 hidden w-32 flex-col items-center justify-center gap-2 sm:flex">
            {/* <Button variant="default" className="w-full" onClick={() => window.open(url, '_blank')}>
              查看详情
            </Button> */}
            <Button variant="outline" className="w-full" onClick={() => window.open(url, '_blank')}>
              <ExternalLinkIcon className="mr-1 h-3 w-3" />
              打开链接
            </Button>
          </div>
          <div className="absolute bottom-2 px-2 flex w-full justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/80 hover:bg-black dark:bg-black/80 dark:hover:bg-black"
                onClick={() => setIsPreviewOpen(true)}
              >
                <FaExpand className="h-5 w-5 text-white" />
              </Button>
              {session && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/80 hover:bg-black dark:bg-black/80 dark:hover:bg-black"
                  onClick={openNotionPage}
                  title="在Notion中打开"
                >
                  <SiNotion className="h-5 w-5 text-white" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {npm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-[#CB3837]/80 hover:bg-[#CB3837] dark:bg-[#CB3837]/80 dark:hover:bg-[#CB3837]"
                  onClick={() => window.open(`npm}`, '_blank')}
                >
                  <FaNpm className="h-5 w-5 text-white" />
                </Button>
              )}
              {Github && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                  onClick={() => window.open(`https://github.com/${title}`, '_blank')}
                >
                  <FaGithub className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Lightbox
        open={isPreviewOpen}
        close={() => setIsPreviewOpen(false)}
        slides={[{ src: getCoverUrl() }]}
        plugins={[Zoom, Download]}
        carousel={{
          finite: false,
          preload: 1,
          spacing: 0,
          padding: 32,
        }}
        controller={{ closeOnBackdropClick: false }}
        zoom={{
          scrollToZoom: true,
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
      <div className="flex items-center gap-3 py-1">
        <div className="relative flex shrink-0 select-none items-center justify-center text-sm size-12">
          <div className="absolute -z-1 opacity-50">
            <ThumbHashImage
              src={getIconUrl()}
              alt="Avatar"
              width={48}
              height={48}
              className="blur"
            />
          </div>
          <div className="relative z-1 rounded-[12px] overflow-hidden size-12">
            <ThumbHashImage
              src={getIconUrl()}
              alt="Avatar"
              width={48}
              height={48}
              className="h-full w-full object-cover p-0.5 rounded-[12px]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-0.5 pt-[4px] min-w-0 flex-1">
          <div className="text-lg line-clamp-1 font-medium leading-none text-foreground">
            {title}
          </div>
          <div className="flex flex-row items-center gap-1.5 text-gray-500 group/url min-w-0">
            <div className="text-[12px] leading-none  truncate min-w-0 overflow-hidden">{url}</div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover/url:opacity-100 transition-opacity duration-200 shrink-0"
              onClick={copyToClipboard}
              title={copySuccess ? '已复制!' : '复制链接'}
            >
              {copySuccess ? (
                <CheckIcon className="h-3 w-3 text-green-500" />
              ) : (
                <CopyIcon className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div>
        <div className="line-clamp-3 list-none mb-3 text-sm text-gray-400 group-hover:dark:text-gray-200 group-hover:text-gray-600 transition-all duration-700">
          {description}
        </div>
        {tags.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex w-max space-x-2 p-1 pb-2">
              {tags.map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  variant="secondary"
                  className="shrink-0 text-xs px-2 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
