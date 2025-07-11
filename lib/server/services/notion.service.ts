import { Client } from '@notionhq/client'
import { NotionAPI } from 'notion-client'
import { validateEnvVar } from '@/lib/server/api-middleware'
import { queryDatabase, queryDatabaseDetail } from '@/lib/server/notion'
import type { NotionPage } from '@/types/notion'

export class NotionService {
  private client: Client
  private databaseId: string
  private categoryDatabaseId: string
  private clientContentAPI: NotionAPI

  constructor() {
    const token = validateEnvVar('NOTION_TOKEN', process.env.NOTION_TOKEN)
    this.databaseId = validateEnvVar('NOTION_DATABASE_ID', process.env.NOTION_DATABASE_ID)
    this.categoryDatabaseId = validateEnvVar(
      'NOTION_CATEGORY_DATABASE_ID',
      process.env.NOTION_CATEGORY_DATABASE_ID
    )
    this.client = new Client({ auth: token })
    this.clientContentAPI = new NotionAPI()
  }

  async getAllResources() {
    if (!this.databaseId) {
      throw new Error('数据库ID未配置，请检查env NOTION_DATABASE_ID')
    }
    return await queryDatabase(this.databaseId)
  }
  async getResourceDatabaseDetail() {
    if (!this.databaseId) {
      throw new Error('数据库ID未配置，请检查env NOTION_DATABASE_ID')
    }
    return await queryDatabaseDetail(this.databaseId)
  }

  /**
   * @description 获取分类列表数据
   * @returns {Promise<NotionPage[]>}
   */
  async getCategoryData(): Promise<NotionPage[]> {
    try {
      return (await queryDatabase(this.categoryDatabaseId)) as NotionPage[]
    } catch (error) {
      console.error('获取分类数据失败:', error)
      return []
    }
  }

  async createResourcePage(properties: any, icon?: any, cover?: any) {
    const response = await this.client.pages.create({
      parent: {
        database_id: this.databaseId,
      },
      properties,
      icon,
      cover,
    })
    return response
  }
  /**
   * @description 获取Notion页面内容，使用第三方库notion-client发起
   * @param pageId
   * @returns NotionPage
   */
  async getNotionPageContent(pageId: string) {
    if (!pageId) {
      throw new Error('页面ID未配置')
    }

    const cleanPageId = pageId.replace(/[-\s]/g, '')
    if (cleanPageId.length !== 32) {
      return null
    }

    try {
      const recordMap = await this.clientContentAPI.getPage(cleanPageId)

      if (!recordMap || !recordMap.block) {
        return null
      }

      return recordMap
    } catch (error) {
      console.error('Error fetching page content:', error)

      return null
    }
  }
}
