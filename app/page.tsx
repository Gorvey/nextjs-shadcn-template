'use client'

import { useState, useEffect } from 'react'
import type { NotionPage, NotionDatabase } from '@/types/notion'
import {
  getDatabaseDetailsFromCache,
  getPagesFromCache,
  saveDatabaseDetails,
  savePages,
  isWithinCooldownPeriod,
} from '@/lib/indexdb'
import { FilterSection } from '@/components/home/FilterSection'
import { ResourceGrid } from '@/components/home/ResourceGrid'

export default function Home() {
  const [data, setData] = useState<NotionPage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 判断是否在冷却期
      const cooldown = await isWithinCooldownPeriod()
      if (cooldown) {
        // 冷却期内，直接用本地数据
        const cachedPages = await getPagesFromCache()
        if (cachedPages !== undefined) {
          setData(cachedPages)
          return
        }
      }

      // 获取数据库详情
      const detailsResponse = await fetch('/api/getDatabaseDetails')
      const detailsResult = await detailsResponse.json()

      if (!detailsResult.success) {
        throw new Error(detailsResult.error)
      }

      const details: NotionDatabase = detailsResult.data

      // 获取缓存中的数据库详情
      const cachedDetails = await getDatabaseDetailsFromCache()

      // 如果缓存为空或者数据库有更新，则重新获取数据
      if (
        cachedDetails === undefined ||
        cachedDetails.last_edited_time !== details.last_edited_time
      ) {
        // 保存新的数据库详情
        await saveDatabaseDetails(details)

        // 获取新的页面数据
        const pagesResponse = await fetch('/api/getData')
        const pagesResult = await pagesResponse.json()

        if (!pagesResult.success) {
          throw new Error(pagesResult.error)
        }

        // 保存新的页面数据（会自动更新冷却期时间）
        await savePages(pagesResult.data)
        setData(pagesResult.data)
      } else {
        // 使用缓存的数据
        const cachedPages = await getPagesFromCache()
        if (cachedPages !== undefined) {
          setData(cachedPages)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 首次加载时获取数据
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">资源库</h1>
          <p className="text-muted-foreground">从Notion数据库中获取并展示的资源集合。</p>
        </div>

        <FilterSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortBy={sortBy}
          setSortBy={setSortBy}
          loading={loading}
          onRefresh={fetchData}
          error={error}
        />
        <ResourceGrid data={data} loading={loading} searchQuery={searchQuery} sortBy={sortBy} />
      </div>
    </div>
  )
}
