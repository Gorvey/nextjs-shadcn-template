import { useState, useEffect, useRef } from 'react'
import type { SearchResult, SearchState } from '../types'

export function useSearch() {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    loading: false,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  // 防抖搜索
  useEffect(() => {
    if (!state.query.trim()) {
      setState((prev) => ({ ...prev, results: [] }))
      return
    }

    const timeoutId = setTimeout(async () => {
      // 取消上一次的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // 创建新的 AbortController
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setState((prev) => ({ ...prev, loading: true }))

      try {
        const response = await fetch('/api/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: state.query.trim() }),
          signal: abortController.signal,
        })

        if (response.ok) {
          const data = await response.json()
          console.log('搜索结果:', data)
          setState((prev) => ({ ...prev, results: data.results || [] }))
        } else {
          console.error('搜索失败', response.status)
          setState((prev) => ({ ...prev, results: [] }))
        }
      } catch (error) {
        // 检查是否是被取消的请求
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('请求被取消')
          return
        }
        console.error('搜索错误:', error)
        setState((prev) => ({ ...prev, results: [] }))
      } finally {
        // 只有当前请求没有被取消时才设置 loading 为 false
        if (!abortController.signal.aborted) {
          setState((prev) => ({ ...prev, loading: false }))
        }
      }
    }, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [state.query])

  // 清理函数：组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const setQuery = (query: string) => {
    setState((prev) => ({ ...prev, query }))
  }

  const reset = () => {
    setState({ query: '', results: [], loading: false })
  }

  return {
    ...state,
    setQuery,
    reset,
  }
}
