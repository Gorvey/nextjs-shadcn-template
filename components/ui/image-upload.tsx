import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  className?: string
}

export function ImageUpload({ onImageUploaded, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  console.log('isUploading', isUploading)
  const [imageUrl, setImageUrl] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (data.url) {
        onImageUploaded(data.url)
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('上传图片失败:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          await handleFileUpload(file)
        }
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  const handleUrlSubmit = () => {
    if (imageUrl) {
      onImageUploaded(imageUrl)
      setIsDialogOpen(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      await handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className={cn('space-y-2', className)} onPaste={handlePaste}>
      <Label className="text-sm">图标</Label>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            设置图标
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>上传图标</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">本地上传</TabsTrigger>
              <TabsTrigger value="url">网络链接</TabsTrigger>
              <TabsTrigger value="paste">粘贴图片</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">点击或拖拽图片到此处上传</p>
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="输入图片URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl}
                >
                  确认
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="paste" className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center"
                onPaste={handlePaste}
              >
                <p className="text-sm text-muted-foreground">在此处粘贴图片（Ctrl+V）</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
