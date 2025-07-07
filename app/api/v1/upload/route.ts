import type { NextRequest } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
  validateRequestBody,
  withMiddleware,
} from '@/lib/server/api-middleware'
import { UploadService } from '@/lib/server/services/upload.service'

// 处理文件上传
async function handleFileUpload(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const sourceUrl = formData.get('url') as string

  if (!file) {
    return createErrorResponse('没有文件', 400, 'MISSING_FILE')
  }

  if (!sourceUrl) {
    return createErrorResponse('没有URL', 400, 'MISSING_URL')
  }

  const uploadService = new UploadService()
  const result = await uploadService.uploadFile(file, sourceUrl)
  return createSuccessResponse({
    url: result.url,
    fileName: result.fileName,
    type: 'file_upload',
  })
}

// 处理从 URL 上传
interface UploadFromUrlRequest {
  url: string
  sourceUrl: string
}

async function handleUrlUpload(request: NextRequest) {
  const { url, sourceUrl } = await validateRequestBody<UploadFromUrlRequest>(request, (body) => {
    if (!body.url) {
      throw new Error('请提供图片URL')
    }
    if (!body.sourceUrl) {
      throw new Error('请提供源URL')
    }
    return {
      url: body.url,
      sourceUrl: body.sourceUrl,
    }
  })

  const uploadService = new UploadService()
  const result = await uploadService.downloadAndUpload(url, sourceUrl)
  return createSuccessResponse({
    url: result.url,
    fileName: result.fileName,
    type: 'url_upload',
  })
}

// POST 处理器 - 根据 Content-Type 决定处理方式
async function postHandler(request: NextRequest) {
  const contentType = request.headers.get('content-type')

  if (contentType?.includes('multipart/form-data')) {
    // 文件上传
    return await handleFileUpload(request)
  }
  if (contentType?.includes('application/json')) {
    // 从 URL 上传
    return await handleUrlUpload(request)
  }
  return createErrorResponse('不支持的内容类型', 400, 'UNSUPPORTED_CONTENT_TYPE')
}

export const POST = withMiddleware(postHandler, {
  requireAuth: true,
  errorHandling: true,
})
