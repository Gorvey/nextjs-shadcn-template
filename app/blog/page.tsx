import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { PaginationWithLinks } from '@/components/ui/pagination-with-links'
import { getAllBlogPosts } from '@/lib/server/notion'
import type { NotionPage } from '@/types/notion'

// 设置 ISR 缓存时间为 1 小时（3600 秒）
export const revalidate = 3600

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>
}) {
  let error: string | null = null
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const pageSize = Number(resolvedSearchParams.pageSize) || 10

  const { posts: allPosts, total }: { posts: NotionPage[]; total: number } =
    await getAllBlogPosts().catch((err) => {
      error = err instanceof Error ? err.message : '获取博客文章失败'
      console.error('Error fetching blog posts:', err)
      return { posts: [], total: 0 }
    })

  // 手动进行分页
  const paginatedPosts = allPosts.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-extrabold tracking-tight lg:text-5xl">博客文章</h1>

      {error && (
        <div className="mb-8 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {paginatedPosts.length === 0 && !error && (
        <div className="py-8 text-center text-gray-500">暂无博客文章</div>
      )}

      <div className="space-y-4">
        {paginatedPosts.map((post) => (
          <article key={post.id}>
            <Link
              href={`/blog/${post.id}`}
              className="group block rounded-lg border p-6 transition-all hover:border-primary/60 hover:shadow-md"
            >
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-primary dark:text-gray-50">
                {getPostTitle(post)}
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{getPostDescription(post)}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <time dateTime={post.created_time}>
                    {new Date(post.created_time).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>

                  <div className="flex gap-2">
                    {getPostTags(post)
                      .slice(0, 3)
                      .map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
      {total > pageSize && (
        <div className="mt-8">
          <PaginationWithLinks page={page} pageSize={pageSize} totalCount={total} />
        </div>
      )}
    </div>
  )
}

// 辅助函数：获取文章标题
function getPostTitle(post: NotionPage): string {
  const possibleTitleFields = ['title', 'Title', 'name', 'Name', '标题']
  for (const field of possibleTitleFields) {
    if (post[field] && typeof post[field] === 'string' && post[field].trim()) {
      return post[field] as string
    }
  }
  return '无标题'
}

// 辅助函数：获取文章描述
function getPostDescription(post: NotionPage): string {
  const possibleDescFields = [
    'description',
    'Description',
    'desc',
    'Desc',
    'summary',
    'Summary',
    '描述',
    '摘要',
  ]
  for (const field of possibleDescFields) {
    if (post[field] && typeof post[field] === 'string' && post[field].trim()) {
      return post[field] as string
    }
  }
  return '暂无描述'
}

// 辅助函数：获取文章标签
function getPostTags(post: NotionPage): string[] {
  const possibleTagFields = [
    'tags',
    'Tags',
    'category',
    'Category',
    'categories',
    'Categories',
    '标签',
    '分类',
  ]
  for (const field of possibleTagFields) {
    if (post[field] && Array.isArray(post[field])) {
      return (post[field] as any[]).map((tag) =>
        typeof tag === 'object' && tag.name ? tag.name : String(tag)
      )
    }
  }
  return []
}
