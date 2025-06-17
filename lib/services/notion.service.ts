import { Client } from '@notionhq/client'
import { getDatabase, getDatabaseDetails } from '@/lib/notion'
import { validateEnvVar } from '@/lib/api-middleware'

export class NotionService {
  private client: Client
  private databaseId: string

  constructor() {
    const token = validateEnvVar('NOTION_TOKEN', process.env.NOTION_TOKEN)
    this.databaseId = validateEnvVar('NOTION_DATABASE_ID', process.env.NOTION_DATABASE_ID)
    this.client = new Client({ auth: token })
  }

  async getAllData() {
    return await getDatabase(this.databaseId)
  }

  async getDatabaseDetails() {
    return await getDatabaseDetails(this.databaseId)
  }

  async createPage(properties: any, icon?: any, cover?: any) {
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
}
