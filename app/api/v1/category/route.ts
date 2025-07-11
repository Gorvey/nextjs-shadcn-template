import type { NextRequest } from 'next/server'
import { createSuccessResponse, withMiddleware } from '@/lib/server/api-middleware'
import { NotionService } from '@/lib/server/services/notion.service'

async function handler(_req: NextRequest) {
  const notionService = new NotionService()
  const data = await notionService.getCategoryData()
  return createSuccessResponse(data)
}

export const GET = withMiddleware(handler, {
  requireAuth: false,
  errorHandling: true,
})
