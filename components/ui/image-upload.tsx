import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  className?: string
  label?: string
  previewUrl?: string
  activeTab?: string
  setActiveTab?: (tab: string) => void
  disabled?: boolean
  url?: string
}

export function ImageUpload({
  onImageUploaded,
  className,
  label = '图标',
  previewUrl,
  activeTab,
  setActiveTab,
  disabled = false,
  url,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (previewUrl) {
      setImageUrl(previewUrl)
      setActiveTab?.('url')
    }
  }, [previewUrl, setActiveTab])

  const handleFileUpload = async (file: File) => {
    if (!file || !url) return
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('url', url)

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      })

      const { data } = await response.json()
      if (data.url) {
        onImageUploaded(data.url)
        setImageUrl(data.url)
      }
    } catch (error) {
      console.error('上传图片失败:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    if (!url) return
    e.stopPropagation()

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

  const handleUrlSubmit = async () => {
    if (!imageUrl || !url) return
    setIsUploading(true)

    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl, sourceUrl: url }),
      })

      const { data } = await response.json()
      if (data.url) {
        onImageUploaded(data.url)
        setImageUrl(data.url)
      }
    } catch (error) {
      console.error('转存图片失败:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (!url) return
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
    <div className={cn('space-y-4', className)}>
      <Label className="text-sm">
        {label}
        {imageUrl}
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" disabled={disabled}>
                本地上传
              </TabsTrigger>
              <TabsTrigger value="url" disabled={disabled}>
                网络链接
              </TabsTrigger>
              <TabsTrigger value="paste" disabled={disabled}>
                粘贴图片
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-4">
              <div
                ref={dropZoneRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center',
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
                )}
                onClick={() => !disabled && fileInputRef.current?.click()}
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="hidden"
                  disabled={disabled}
                />
                <p className="text-sm text-muted-foreground">
                  {disabled ? '请先输入URL' : '点击或拖拽图片到此处上传'}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="输入图片URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrl || isUploading || disabled}
                >
                  {isUploading ? '转存中...' : '确认'}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="paste" className="space-y-4">
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center',
                  disabled && 'opacity-50'
                )}
                onPaste={handlePaste}
              >
                <p className="text-sm text-muted-foreground">
                  {disabled ? '请先输入URL' : '在此处粘贴图片（Ctrl+V）'}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="border rounded-lg p-4 flex items-center justify-center">
          {previewUrl || imageUrl ? (
            <img
              src={previewUrl || imageUrl}
              alt="预览"
              width={200}
              height={200}
              className="max-w-full max-h-[200px] object-contain"
            />
          ) : (
            <p className="text-sm text-muted-foreground">图片预览区域</p>
          )}
        </div>
      </div>
    </div>
  )
}
