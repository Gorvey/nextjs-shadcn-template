import type { PageObjectResponse } from '@notionhq/client'

interface Select {
  id: string
  name: string
}

interface FileInfo {
  type: 'file' | 'external'
  url: string
}

export interface NotionPage {
  // 从notion 第一层获取
  id: string
  created_time: string
  last_edited_time: string
  icon?: PageObjectResponse['icon']
  cover?: PageObjectResponse['cover']
  [key: string]:
    | string
    | number
    | boolean
    | Select[]
    | Select
    | { id: string }[]
    | FileInfo[]
    | PageObjectResponse['icon']
    | PageObjectResponse['cover']
    | any[]
    | null
    | undefined
}

export interface NotionCategoryPage {
  id: string
  name: string
  desc: string
  sort: number
  icon?: NotionPage['icon']
  parent: { id: string }[]
  children: { id: string }[]
  links: { id: string }[]
}

export interface NotionCategoryViewPage {
  id: string
  name: string
  desc: string
  sort: number
  icon?: NotionPage['icon']
  parent: { id: string }[] // 保持不变
  children: NotionCategoryViewPage[] // id替换为完整item
  links: NotionPage[] // 只存在第二级，id替换为完整item
}

export interface NotionFilter {
  id: string
  name: string
  options: Select[]
}
