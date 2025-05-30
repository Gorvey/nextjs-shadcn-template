'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Alert, AlertDescription } from '@/components/ui/alert'
import type { NotionDatabase, NotionPage } from '@/types/notion'
import { getDatabaseDetailsFromCache } from '@/lib/indexdb'
import { cn } from '@/lib/utils'
import { ImageUpload } from '@/components/ui/image-upload'
import { ResourceItem } from '@/components/home/ResourceItem'

export default function UploadPage() {
  const [databaseDetails, setDatabaseDetails] = useState<NotionDatabase | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [iconUrl, setIconUrl] = useState<string>('')
  const [coverUrl, setCoverUrl] = useState<string>('')
  const [previewData, setPreviewData] = useState<NotionPage>({
    id: 'preview',
    created_time: new Date().toISOString(),
    last_edited_time: new Date().toISOString(),
    Name: '',
    Description: '',
    URL: '',
    Tags: [],
    icon: null,
    cover: null,
  })

  // 添加处理 Notion 属性格式的函数
  const formatNotionProperties = (data: Record<string, any>) => {
    const properties: Record<string, any> = {}

    Object.entries(data).forEach(([key, value]) => {
      if (!value) return // 跳过空值

      const propertyType = databaseDetails?.properties[key]?.type

      switch (propertyType) {
        case 'title':
          properties[key] = {
            title: [
              {
                type: 'text',
                text: {
                  content: value as string,
                },
              },
            ],
          }
          break
        case 'url':
          properties[key] = {
            url: value as string,
          }
          break
        case 'multi_select':
          const values: string[] = Array.isArray(value)
            ? value
            : typeof value === 'string'
              ? value.split(',').map((v) => v.trim())
              : []

          properties[key] = {
            multi_select: values.map((name) => ({ name })),
          }
          break
        case 'rich_text':
          properties[key] = {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: value as string,
                },
              },
            ],
          }
          break
      }
    })

    // 添加图标属性
    if (iconUrl) {
      properties.icon = {
        type: 'external',
        external: {
          url: iconUrl,
        },
      }
    }

    // 添加封面属性
    if (coverUrl) {
      properties.cover = {
        type: 'external',
        external: {
          url: coverUrl,
        },
      }
    }

    return properties
  }

  useEffect(() => {
    const fetchDatabaseDetails = async () => {
      try {
        const details = await getDatabaseDetailsFromCache()
        if (details) {
          setDatabaseDetails(details)
          // 初始化表单数据
          const initialFormData: Record<string, any> = {}
          const initialSelectedOptions: Record<string, string[]> = {}
          Object.keys(details.properties).forEach((key) => {
            initialFormData[key] = ''
            if (details.properties[key].type === 'multi_select') {
              initialSelectedOptions[key] = []
            }
          })
          setFormData(initialFormData)
          setSelectedOptions(initialSelectedOptions)
        }
      } catch (error) {
        console.error('获取数据库详情失败:', error)
        setError('获取数据库详情失败')
      } finally {
        setLoading(false)
      }
    }

    fetchDatabaseDetails()
  }, [])

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [key]: value,
      }
      console.log('handleInputChange更新后的formData:', newData)
      return newData
    })
  }

  const handleOptionToggle = (key: string, option: string) => {
    setSelectedOptions((prev) => {
      const currentOptions = prev[key] || []
      const newOptions = currentOptions.includes(option)
        ? currentOptions.filter((item) => item !== option)
        : [...currentOptions, option]

      // 更新表单数据
      setFormData((formPrev) => ({
        ...formPrev,
        [key]: newOptions.join(','),
      }))

      return {
        ...prev,
        [key]: newOptions,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    // 验证必填字段
    const urlKey = Object.keys(databaseDetails?.properties || {}).find(
      (key) => databaseDetails?.properties[key].name.toLowerCase() === 'url'
    )
    const nameKey = Object.keys(databaseDetails?.properties || {}).find(
      (key) => databaseDetails?.properties[key].name.toLowerCase() === 'name'
    )
    const descKey = Object.keys(databaseDetails?.properties || {}).find(
      (key) => databaseDetails?.properties[key].name.toLowerCase() === 'desc'
    )

    const missingFields = []
    if (!formData[urlKey || '']?.trim()) missingFields.push('URL')
    if (!formData[nameKey || '']?.trim()) missingFields.push('Name')
    if (!formData[descKey || '']?.trim()) missingFields.push('描述')

    if (missingFields.length > 0) {
      setError(`请填写以下必填字段：${missingFields.join('、')}`)
      setSubmitting(false)
      return
    }

    try {
      // 格式化 Notion 属性
      const notionProperties = formatNotionProperties(formData)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notionProperties),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || '提交失败')
      }

      setSuccess(true)
      // 重置表单
      const initialFormData: Record<string, any> = {}
      Object.keys(databaseDetails?.properties || {}).forEach((key) => {
        initialFormData[key] = ''
      })
      setFormData(initialFormData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFetchMeta = async (url: string) => {
    if (!url) return
    setFetchingMeta(true)
    try {
      const response = await fetch('/api/getMetaData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
      const { data } = await response.json()
      console.log('获取到的元数据:', data)

      // 更新表单数据
      if (data.title) {
        const nameKey = Object.keys(databaseDetails?.properties || {}).find(
          (key) => databaseDetails?.properties[key].name.toLowerCase() === 'name'
        )
        if (nameKey) {
          handleInputChange(nameKey, data.title)
        }
      }

      if (data.description) {
        const descKey = Object.keys(databaseDetails?.properties || {}).find(
          (key) => databaseDetails?.properties[key].name.toLowerCase() === 'desc'
        )
        if (descKey) {
          handleInputChange(descKey, data.description)
        }
      }
    } catch (error) {
      console.error('获取元数据失败:', error)
    } finally {
      setFetchingMeta(false)
    }
  }

  // 更新预览数据
  useEffect(() => {
    const nameKey = Object.keys(databaseDetails?.properties || {}).find(
      (key) => databaseDetails?.properties[key].name.toLowerCase() === 'name'
    )
    const descKey = Object.keys(databaseDetails?.properties || {}).find(
      (key) => databaseDetails?.properties[key].name.toLowerCase() === 'desc'
    )
    const urlKey = Object.keys(databaseDetails?.properties || {}).find(
      (key) => databaseDetails?.properties[key].name.toLowerCase() === 'url'
    )
    const tagsKey = Object.keys(databaseDetails?.properties || {}).find(
      (key) => databaseDetails?.properties[key].type === 'multi_select'
    )

    setPreviewData((prev) => ({
      ...prev,
      Name: formData[nameKey || ''] || '',
      Description: formData[descKey || ''] || '',
      URL: formData[urlKey || ''] || '',
      Tags: formData[tagsKey || '']
        ? formData[tagsKey || ''].split(',').map((tag: string) => tag.trim())
        : [],
      icon: iconUrl ? { type: 'external', external: { url: iconUrl } } : null,
      cover: coverUrl ? { type: 'external', external: { url: coverUrl } } : null,
    }))
  }, [formData, iconUrl, coverUrl, databaseDetails])

  if (loading) {
    return <div>加载中...</div>
  }

  if (!databaseDetails) {
    return <div>无法获取数据库详情</div>
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-20">
      <div className="text-lg font-medium mb-4">添加新资源</div>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-2">
          <AlertDescription>提交成功！</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <ImageUpload onImageUploaded={setIconUrl} />
            <ImageUpload onImageUploaded={setCoverUrl} className="mt-4" />
            {Object.entries(databaseDetails.properties)
              .filter(
                ([_, property]) =>
                  property.type === 'title' ||
                  property.type === 'rich_text' ||
                  property.type === 'url'
              )
              .sort(([keyA, propertyA], [keyB, propertyB]) => {
                const nameA = propertyA.name.toLowerCase()
                const nameB = propertyB.name.toLowerCase()

                // 定义排序优先级
                const getPriority = (name: string) => {
                  if (name.includes('url')) return 1
                  if (name.includes('name')) return 2
                  if (name.includes('desc')) return 3
                  return 999
                }

                return getPriority(nameA) - getPriority(nameB)
              })
              .map(([key, property]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key} className="text-sm">
                    {property.name}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type={property.type === 'url' ? 'url' : 'text'}
                      value={formData[key] || ''}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      required={true}
                      className="h-8"
                    />
                    {property.type === 'url' && property.name.toLowerCase() === 'url' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleFetchMeta(formData[key])}
                        disabled={fetchingMeta || !formData[key]}
                        className="h-8"
                      >
                        {fetchingMeta ? '获取中...' : '获取信息'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-3">
            {Object.entries(databaseDetails.properties).map(([key, property]) => {
              const propertyType = property.type

              if (propertyType === 'multi_select') {
                return (
                  <div key={key} className="space-y-1">
                    <Label className="text-sm">{property.name}</Label>
                    <div className="flex flex-wrap gap-1">
                      {property.multi_select.options.map((option) => (
                        <Button
                          key={option.id}
                          type="button"
                          variant={
                            selectedOptions[key]?.includes(option.name) ? 'default' : 'outline'
                          }
                          onClick={() => handleOptionToggle(key, option.name)}
                          className={cn(
                            'transition-colors h-7 px-2 text-sm',
                            selectedOptions[key]?.includes(option.name) &&
                              'bg-primary text-primary-foreground'
                          )}
                        >
                          {option.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      </form>
      <div className="mt-8">
        <div className="text-lg font-medium mb-4">预览</div>
        <div className="max-w-md mx-auto">
          <ResourceItem item={previewData} />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3">
        <div className="container mx-auto">
          <Button type="submit" className="w-full" disabled={submitting} onClick={handleSubmit}>
            {submitting ? '提交中...' : '提交'}
          </Button>
        </div>
      </div>
    </div>
  )
}
