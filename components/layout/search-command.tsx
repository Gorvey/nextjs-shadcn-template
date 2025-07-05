'use client'

export type { SearchCommandProps } from './search'
// 同时导出所有相关类型和组件供其他地方使用
export * from './search'
// 重新导出新的搜索组件以保持向后兼容
export { SearchCommand } from './search'
