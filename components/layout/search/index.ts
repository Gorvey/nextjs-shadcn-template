// 主要搜索组件
export { AdaptiveSearch } from './adaptive-search'
export { DesktopSearchCommand } from './desktop-search-command'
export { MobileSearchModal } from './mobile-search-modal'
export type { SearchResult, SearchCommandProps, SearchState } from './types'
// 向后兼容的默认导出
export { AdaptiveSearch as SearchCommand } from './adaptive-search'
