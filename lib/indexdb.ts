import { type DBSchema, openDB } from 'idb'
import type { NotionDatabase, NotionPage } from '@/types/notion'

interface NotionDB extends DBSchema {
  database: {
    key: string
    value: NotionDatabase
  }
  pages: {
    key: string
    value: NotionPage[]
  }
  lastUpdate: {
    key: string
    value: number
  }
}

const dbName = 'notion-cache'
const version = 1

export async function initDB() {
  return openDB<NotionDB>(dbName, version, {
    upgrade(db) {
      db.createObjectStore('database')
      db.createObjectStore('pages')
      db.createObjectStore('lastUpdate')
    },
  })
}

export async function getDatabaseDetailsFromCache(): Promise<NotionDatabase | undefined> {
  const db = await initDB()
  return db.get('database', 'details')
}

export async function getPagesFromCache(): Promise<NotionPage[] | undefined> {
  const db = await initDB()
  return db.get('pages', 'all')
}

export async function saveDatabaseDetails(details: NotionDatabase) {
  const db = await initDB()
  await db.put('database', details, 'details')
}

export async function savePages(pages: NotionPage[]) {
  const db = await initDB()
  await db.put('pages', pages, 'all')
  // 保存最后更新时间
  await db.put('lastUpdate', Date.now(), 'timestamp')
}

export async function getLastUpdateTime(): Promise<number | undefined> {
  const db = await initDB()
  return db.get('lastUpdate', 'timestamp')
}

export async function isWithinCooldownPeriod(): Promise<boolean> {
  const lastUpdate = await getLastUpdateTime()
  if (lastUpdate === undefined) return false

  const oneHour = 60 * 60 * 1000 // 1小时的毫秒数
  return Date.now() - lastUpdate < oneHour
}
