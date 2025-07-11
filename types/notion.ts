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
  parent: NotionCategoryPage[]
  children: NotionCategoryPage[]
  links: NotionPage[]
}

export interface NotionFilter {
  id: string
  name: string
  options: Select[]
}
