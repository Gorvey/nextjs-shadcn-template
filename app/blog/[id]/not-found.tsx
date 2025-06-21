import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">文章不存在</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        抱歉，您访问的博客文章不存在或已被删除。
      </p>
      <div className="space-x-4">
        <Link
          href="/blog"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
        >
          返回博客列表
        </Link>
        <Link
          href="/"
          className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded hover:bg-gray-300 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
