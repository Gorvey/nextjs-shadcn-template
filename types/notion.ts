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

export interface NotionFilter {
  id: string
  name: string
  options: Select[]
}

export interface NotionDatabase {
  id: string
  last_edited_time: string
  properties: PageObjectResponse['properties']
}

export interface SubCategoryData {
  id: string
  name: string
  desc: string
  count?: number
  icon?: PageObjectResponse['icon']
}

export interface CategoryData {
  id: string
  name: string
  desc: string
  sort: number
  icon?: PageObjectResponse['icon']
  subcategories: SubCategoryData[]
}
