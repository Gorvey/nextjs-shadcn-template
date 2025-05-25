import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterSectionProps {
  searchQuery: string
  setSearchQuery: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  loading: boolean
  onRefresh: () => void
  error: string | null
}

export function FilterSection({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  loading,
  onRefresh,
  error,
}: FilterSectionProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="搜索..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">最新</SelectItem>
            <SelectItem value="oldest">最早</SelectItem>
            <SelectItem value="name">名称</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onRefresh} disabled={loading}>
          {loading ? '加载中...' : '刷新数据'}
        </Button>
      </div>
      {error && <div className="text-destructive">{error}</div>}
    </div>
  )
}
