import Link from 'next/link'
import { notFound } from 'next/navigation'
import NotionPage from '@/components/NotionPage'
import { getAllBlogPosts, getNotionPageContent } from '@/lib/server/notion'

// 设置 ISR 缓存时间为 1 小时（3600 秒）
export const revalidate = 3600

interface BlogPostPageProps {
  params: Promise<{ id: string }>
}

// 重新启用静态路径生成，结合 ISR 使用
export async function generateStaticParams() {
  try {
    const { posts } = await getAllBlogPosts()
    return posts.map((post) => ({
      id: post.id,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// 添加元数据生成
export async function generateMetadata({ params }: BlogPostPageProps) {
  try {
    const { id } = await params
    // 这里可以根据需要添加更多元数据
    return {
      title: `博客文章 - ${id}`,
      description: '博客文章详情',
    }
  } catch (_error) {
    return {
      title: '博客文章',
      description: '博客文章详情',
    }
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  let id: string

  try {
    const resolvedParams = await params
    id = resolvedParams.id
  } catch (error) {
    console.error('Error resolving params:', error)
    notFound()
  }

  let recordMap
  let error: string | null = null

  try {
    // 直接根据 id 获取页面完整内容
    recordMap = await getNotionPageContent(id)

    if (!recordMap) {
      console.error('No record map returned for ID:', id)
      notFound()
    }
  } catch (err) {
    error = err instanceof Error ? err.message : '获取文章内容失败'
    console.error('Error fetching blog post:', err)
  }

  if (error || !recordMap) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error || '文章不存在'}
        </div>
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← 返回博客列表
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 导航 */}
      <div className="mb-8">
        <Link href="/blog" className="text-blue-600 hover:underline">
          ← 返回博客列表
        </Link>
      </div>

      {/* Notion 内容渲染 */}
      <NotionPage recordMap={recordMap} rootPageId={id} />
    </div>
  )
}
