import type { NextRequest } from 'next/server'
import { createSuccessResponse, withMiddleware } from '@/lib/server/api-middleware'
import { NotionService } from '@/lib/server/services/notion.service'

/**
 * @swagger
 * /api/v1/category:
 *   get:
 *     summary: 获取所有分类数据
 *     description: 从 Notion 中获取所有分类，并以层级结构返回。
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: 成功获取分类数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 */
async function handler(_req: NextRequest) {
  const notionService = new NotionService()
  const data = await notionService.getCategoryData()
  return createSuccessResponse(data)
}

export const GET = withMiddleware(handler, {
  requireAuth: false,
  errorHandling: true,
})
