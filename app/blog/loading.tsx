import { Skeleton } from '@/components/ui/skeleton'

/**
 * Renders a skeleton loading state for the blog page.
 * @returns {JSX.Element} The rendered skeleton loading state.
 */
export default function BlogLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="space-y-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
