export interface SearchResult {
  id: string
  name?: string
  Name?: string
  title?: string
  Title?: string
  desc?: string
  Desc?: string
  description?: string
  Description?: string
  url?: string
  URL?: string
  link?: string
  Link?: string
  type: 'resource' | 'blog'
  icon?: {
    type: 'external' | 'file' | 'emoji'
    external?: { url: string }
    file?: { url: string }
    emoji?: string
  }
  cover?: {
    type: 'external' | 'file'
    external?: { url: string }
    file?: { url: string }
  }
}

export interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface SearchState {
  query: string
  results: SearchResult[]
  loading: boolean
}
