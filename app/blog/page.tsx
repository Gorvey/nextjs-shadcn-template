import { getBlogPosts } from '@/lib/notion'
import Link from 'next/link'
import type { NotionPage } from '@/types/notion'

// 设置 ISR 缓存时间为 1 小时（3600 秒）
export const revalidate = 3600

export default async function BlogListPage() {
  let posts: NotionPage[] = []
  let error: string | null = null

  try {
    posts = await getBlogPosts()
  } catch (err) {
    error = err instanceof Error ? err.message : '获取博客文章失败'
    console.error('Error fetching blog posts:', err)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">博客文章</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}

      {posts.length === 0 && !error && (
        <div className="text-gray-500 text-center py-8">暂无博客文章</div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {post.cover && (
              <div className="aspect-video bg-gray-200">
                {/* 封面图片处理 */}
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-gray-500">封面图片</span>
                </div>
              </div>
            )}

            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">{getPostTitle(post)}</h2>

              <p className="text-gray-600 mb-4 line-clamp-3">{getPostDescription(post)}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <time dateTime={post.created_time}>
                  {new Date(post.created_time).toLocaleDateString('zh-CN')}
                </time>

                {getPostTags(post).length > 0 && (
                  <div className="flex gap-1">
                    {getPostTags(post)
                      .slice(0, 2)
                      .map((tag, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <Link
                href={`/blog/${post.id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                阅读更多
              </Link>
            </div>
          </article>
        ))}
      </div>
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
