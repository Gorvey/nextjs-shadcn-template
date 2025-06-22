import * as React from 'react'
import { SearchResultItem } from './search-result-item'
import type { SearchResult } from '../types'

interface MobileSearchResultProps {
  item: SearchResult
  query: string
  onSelect: (item: SearchResult) => void
}

export function MobileSearchResult({ item, query, onSelect }: MobileSearchResultProps) {
  return <SearchResultItem item={item} query={query} onSelect={onSelect} />
}
