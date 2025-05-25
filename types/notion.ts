import type { DatabaseObjectResponse } from '@notionhq/client'

interface Select {
  id: string
  name: string
}

export interface NotionPage {
  // 从notion 第一层获取
  id: string
  created_time: string
  last_edited_time: string
  icon?: DatabaseObjectResponse['icon']
  cover?: DatabaseObjectResponse['cover']
  [key: string]:
    | string
    | Select[]
    | DatabaseObjectResponse['icon']
    | DatabaseObjectResponse['cover']
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
  properties: DatabaseObjectResponse['properties']
}
