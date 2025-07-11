import type { NextRequest } from 'next/server'
import { createSuccessResponse, withMiddleware } from '@/lib/server/api-middleware'
import { NotionService } from '@/lib/server/services/notion.service'

async function handleGetCategories() {
  const notionService = new NotionService()
  const categories = await notionService.getCategoryData()
  return createSuccessResponse(categories)
}

async function getHandler(_request: NextRequest) {
  return await handleGetCategories()
}

export const GET = withMiddleware(getHandler, {
  requireAuth: false,
  errorHandling: true,
})
