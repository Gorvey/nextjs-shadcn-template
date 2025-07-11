import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'
import {
  createSuccessResponse,
  validateRequestBody,
  withMiddleware,
} from '@/lib/server/api-middleware'
import { NotionService } from '@/lib/server/services/notion.service'

// 获取所有数据
async function handleGetAllData() {
  const notionService = new NotionService()
  const data = await notionService.getAllResources()
  return createSuccessResponse(data)
}

// // 获取数据库详情
// async function handleGetDatabaseDetails() {
//   const notionService = new NotionService()
//   const details = await notionService.getDatabaseDetails()
//   return createSuccessResponse(details)
// }

// 创建新页面
interface CreatePageRequest {
  properties: any
  icon?: any
  cover?: any
}

async function handleCreatePage(request: NextRequest) {
  const { properties, icon, cover } = await validateRequestBody<CreatePageRequest>(
    request,
    (body) => {
      if (!body.properties) {
        throw new Error('缺少页面属性')
      }
      return {
        properties: body.properties,
        icon: body.icon,
        cover: body.cover,
      }
    }
  )

  const notionService = new NotionService()
  const response = await notionService.createResourcePage(properties, icon, cover)
  revalidatePath('/')
  revalidatePath('/category')
  return createSuccessResponse(response)
}

// GET 处理器 - 支持查询参数区分不同操作
async function getHandler(request: NextRequest) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  switch (action) {
    // case 'details':
    //   return await handleGetDatabaseDetails()
    default:
      return await handleGetAllData()
  }
}

// POST 处理器 - 创建页面
async function postHandler(request: NextRequest) {
  return await handleCreatePage(request)
}

export const GET = withMiddleware(getHandler, {
  requireAuth: false,
  errorHandling: true,
})

export const POST = withMiddleware(postHandler, {
  requireAuth: true,
  errorHandling: true,
})
