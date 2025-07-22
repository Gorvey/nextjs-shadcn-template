import { Card } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { ThumbHashImage } from '@/components/ui/thumbhash-image'
import type { NotionPage } from '@/types/notion'
import { ResourceItem as CardResourceItem } from '../Card/ResourceItem'

interface ResourceItemProps {
  item: NotionPage
}

export function ResourceItem({ item }: ResourceItemProps) {
  const title = typeof item.Name === 'string' ? item.Name : ''

  // 处理 icon
  const getIconUrl = () => {
    if (!item.icon) return '/avatar-placeholder.jpg'
    if (item.icon.type === 'external') return item.icon.external.url
    if (item.icon.type === 'file') return item.icon.file.url
    if (item.icon.type === 'emoji') return '/avatar-placeholder.jpg'
    return '/avatar-placeholder.jpg'
  }

  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Card
          className="group cursor-pointer bg-level-3/80 border border-subtle transition-all duration-300 p-0 pt-4 rounded-xl"
          onClick={() => {
            window.open(item.URL as string, '_blank')
          }}
        >
          <div className="relative flex items-center justify-center mb-3">
            <div className="relative flex shrink-0 select-none items-center justify-center text-sm w-[48px] h-[48px]">
              <div className="absolute -z-1 opacity-50 w-[48px] h-[48px]">
                <ThumbHashImage
                  src={getIconUrl()}
                  alt="Avatar"
                  width={48}
                  height={48}
                  className="blur"
                />
              </div>
              <div className="relative z-1 rounded-[12px] overflow-hidden w-[48px] h-[48px]">
                <ThumbHashImage
                  src={getIconUrl()}
                  alt="Avatar"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover p-0.5 rounded-[12px]"
                />
              </div>
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center px-1">
            <h4 className="text-xs font-medium text-foreground/85 line-clamp-2 leading-tight transition-colors duration-300 min-h-[2.5rem] flex items-center justify-center">
              {title}
            </h4>
          </div>
        </Card>
      </HoverCardTrigger>

      <HoverCardContent
        className="w-80 p-0 border border-emphasis shadow-strong bg-level-2/95 backdrop-blur-md"
        side="right"
        align="start"
        sideOffset={10}
      >
        <div className="p-4 bg-level-3/30 border-b border-subtle">
          <CardResourceItem item={item} />
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
