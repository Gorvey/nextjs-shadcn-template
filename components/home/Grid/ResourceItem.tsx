import type { NotionPage } from '@/types/notion'
import Image from 'next/image'
import { useState } from 'react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { ResourceItem as CardResourceItem } from '../Card/ResourceItem'

interface ResourceItemProps {
  item: NotionPage
}

export function ResourceItem({ item }: ResourceItemProps) {
  const title = typeof item.Name === 'string' ? item.Name : ''
  // const description = typeof item.desc === 'string' ? item.desc : ''
  // const url = typeof item.URL === 'string' ? item.URL : ''
  // 处理 cover
  // const getCoverUrl = () => {
  //   if (!item.cover) return '/placeholder.jpg'
  //   if (item.cover.type === 'external') return item.cover.external.url
  //   if (item.cover.type === 'file') return item.cover.file.url
  //   return '/placeholder.jpg'
  // }

  // 处理 icon
  const getIconUrl = () => {
    if (!item.icon) return '/avatar-placeholder.jpg'
    if (item.icon.type === 'external') return item.icon.external.url
    if (item.icon.type === 'file') return item.icon.file.url
    if (item.icon.type === 'emoji') return '/avatar-placeholder.jpg'
    return '/avatar-placeholder.jpg'
  }

  // 收集所有array属性的name值作为tags
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

    return tags
  }

  return (
    <HoverCard openDelay={500} closeDelay={300}>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer">
          <div className="flex items-center py-1">
            <div className="relative flex shrink-0 select-none items-center justify-center text-sm size-[88px]">
              <div className="absolute -z-1 opacity-50">
                <Image src={getIconUrl()} alt="Avatar" width={88} height={88} className="blur" />
              </div>
              <div className="relative z-1 rounded-[12px] overflow-hidden size-[88px]">
                <Image
                  src={getIconUrl()}
                  alt="Avatar"
                  width={88}
                  height={88}
                  className="h-full w-full object-cover p-0.5 rounded-[12px]"
                />
              </div>
            </div>
          </div>
          <div className="max-w-[120px] line-clamp-1 font-medium leading-none text-foreground">
            {title}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80 p-2 overflow-hidden"
        side="right"
        align="start"
        sideOffset={10}
      >
        <CardResourceItem item={item} />
      </HoverCardContent>
    </HoverCard>
  )
}
