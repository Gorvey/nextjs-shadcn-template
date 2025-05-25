import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { NotionPage } from '@/types/notion'

interface ResourceItemProps {
  item: NotionPage
}

export function ResourceItem({ item }: ResourceItemProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-1">
          {typeof item.Name === 'string' ? item.Name : '未命名'}
        </CardTitle>
        <CardDescription>{new Date(item.created_time).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {typeof item.Description === 'string' ? item.Description : '暂无描述'}
        </p>
      </CardContent>
    </Card>
  )
}
