import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import type { NotionPage } from '@/types/notion'

interface ResourceItemProps {
  item: NotionPage
}

export function ResourceItem({ item }: ResourceItemProps) {
  const title = typeof item.Name === 'string' ? item.Name : '未命名'
  const description = typeof item.desc === 'string' ? item.desc : '暂无描述'
  const url = typeof item.URL === 'string' ? item.URL : ''
  const tags = Array.isArray(item.Tags) ? item.Tags : []
  const createdDate = new Date(item.created_time).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-1">
          <span className="text-xs">{createdDate}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      {url && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => window.open(url, '_blank')}
          >
            <ExternalLinkIcon className="mr-1 h-3 w-3" />
            访问链接
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
