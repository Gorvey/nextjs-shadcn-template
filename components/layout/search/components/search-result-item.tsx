import { FileText, Link } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ThumbHashImage } from '@/components/ui/thumbhash-image'
import type { SearchResult as SearchResultType } from '../types'
import { getDescription, getDisplayName, getIconUrl, getTags, highlightText } from '../utils/utils'

interface SearchResultItemProps {
  item: SearchResultType
  query: string
  onSelect: (item: SearchResultType) => void
  className?: string
}

export function SearchResultItem({ item, query, onSelect, className = '' }: SearchResultItemProps) {
  const displayName = getDisplayName(item)
  const description = getDescription(item)
  const tags = getTags(item)
  const iconUrl = getIconUrl(item)

  return (
    <button
      onClick={() => onSelect(item)}
      className={`w-full text-left cursor-pointer p-3 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors ${className}`}
    >
      <div className="flex items-start gap-3 w-full min-w-0">
        <div className="relative flex shrink-0 select-none items-center justify-center size-10">
          <div className="absolute -z-1 opacity-50">
            <ThumbHashImage
              src={iconUrl}
              alt="Icon"
              width={40}
              height={40}
              className="blur rounded-lg"
            />
          </div>
          <div className="relative z-1 rounded-lg overflow-hidden size-10">
            <ThumbHashImage
              src={iconUrl}
              alt="Icon"
              width={40}
              height={40}
              className="h-full w-full object-cover p-0.5 rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1 gap-1">
          <div className="flex items-center gap-2 min-w-0">
            {item.type === 'blog' ? (
              <FileText className="h-4 w-4 flex-shrink-0 text-blue-500" />
            ) : (
              <Link className="h-4 w-4 flex-shrink-0 text-green-500" />
            )}
            <span className="font-medium truncate">{highlightText(displayName, query)}</span>
          </div>
          {description && (
            <span className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {highlightText(description, query)}
            </span>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={`${tag}-${index}`}
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  {highlightText(tag, query)}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
