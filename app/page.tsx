'use client'

import { useState, useEffect } from 'react'
import type { NotionPage } from '@/types/notion'
import { FilterSection } from '@/components/home/FilterSection'
import { ResourceGrid } from '@/components/home/ResourceGrid'

export default function Home() {
  const [data, setData] = useState<NotionPage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取新的页面数据
      const pagesResponse = await fetch('/api/getData')
      const pagesResult = await pagesResponse.json()

      if (!pagesResult.success) {
        throw new Error(pagesResult.error)
      }

      setData(pagesResult.data)
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
      <div className="mx-auto px-4 py-8">
        <ResourceGrid data={data} loading={loading} />
      </div>
    </div>
  )
}
