import type { NextRequest } from 'next/server'
import { createSuccessResponse, validateRequestBody, withMiddleware } from '@/lib/api-middleware'
import { MetadataService } from '@/lib/services/metadata.service'

interface GetMetadataRequest {
  url: string
}

async function postHandler(request: NextRequest) {
  const { url } = await validateRequestBody<GetMetadataRequest>(request, (body) => {
    if (!body.url) {
      throw new Error('请提供有效的 URL')
    }
    return { url: body.url }
  })

  const metadataService = new MetadataService()
  const metadata = await metadataService.getPageMetadata(url)
  return createSuccessResponse(metadata)
}

export const POST = withMiddleware(postHandler, {
  requireAuth: true,
  errorHandling: true,
})
