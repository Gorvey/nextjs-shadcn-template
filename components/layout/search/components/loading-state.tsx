import { Loader2 } from 'lucide-react'

export function LoadingState() {
  return (
    <div className="flex items-center justify-center p-8 h-full min-h-[300px]">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="ml-2 text-sm text-muted-foreground">搜索中...</span>
    </div>
  )
}
