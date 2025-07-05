import { CommandItem } from '@/components/ui/command'
import type { SearchResult as SearchResultType } from '../types'
import { getDescription, getDisplayName, getTags } from '../utils/utils'
import { SearchResultItem } from './search-result-item'

interface SearchResultProps {
  item: SearchResultType
  query: string
  onSelect: (item: SearchResultType) => void
}

export function SearchResult({ item, query, onSelect }: SearchResultProps) {
  const displayName = getDisplayName(item)
  const description = getDescription(item)
  const tags = getTags(item)

  return (
    <CommandItem
      key={`${item.type}-${item.id}`}
      value={`${displayName} ${description} ${tags.join(' ')}`}
      onSelect={() => onSelect(item)}
      className="cursor-pointer p-0"
    >
      <SearchResultItem item={item} query={query} onSelect={onSelect} className="w-full" />
    </CommandItem>
  )
}
