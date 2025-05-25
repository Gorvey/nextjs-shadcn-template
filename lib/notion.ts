import { Client } from '@notionhq/client'
import type { NotionPage, NotionDatabase } from '@/types/notion'
import type { PageObjectResponse, DatabaseObjectResponse } from '@notionhq/client'
import { transformNotionPage } from '@/utils/notion'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

export async function getDatabase(databaseId: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = []
  let cursor: string | undefined = undefined

  while (true) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
    })
    pages.push(...response.results.map((page) => transformNotionPage(page as PageObjectResponse)))
    if (!response.has_more) break
    cursor = response.next_cursor || undefined
  }

  return pages
}

export async function getDatabaseDetails(databaseId: string): Promise<NotionDatabase> {
  const response = (await notion.databases.retrieve({
    database_id: databaseId,
  })) as DatabaseObjectResponse

  return {
    id: response.id,
    last_edited_time: response.last_edited_time,
    properties: response.properties,
  }
}
