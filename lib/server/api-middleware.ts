import { type NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth'

// 统一的 API 响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// 创建标准化的成功响应
export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    { status }
  )
}

// 创建标准化的错误响应
export function createErrorResponse(error: string, status = 500, code?: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    } as ApiResponse,
    { status }
  )
}

// 认证中间件
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions)

      if (!session) {
        return createErrorResponse('未授权访问', 401, 'UNAUTHORIZED')
      }

      return await handler(request, ...args)
    } catch (error) {
      console.error('认证中间件错误:', error)
      return createErrorResponse('认证失败', 500, 'AUTH_ERROR')
    }
  }
}

// 错误处理中间件
export function withErrorHandling<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      console.error('API 错误:', error)
      const errorMessage = error instanceof Error ? error.message : '服务器内部错误'
      return createErrorResponse(errorMessage, 500, 'INTERNAL_ERROR')
    }
  }
}

// 组合中间件
export function withMiddleware<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean
    errorHandling?: boolean
  } = {}
) {
  const { requireAuth = false, errorHandling = true } = options

  let wrappedHandler: (request: NextRequest, ...args: T) => Promise<NextResponse> = handler

  if (errorHandling) {
    wrappedHandler = withErrorHandling(wrappedHandler)
  }

  if (requireAuth) {
    wrappedHandler = withAuth(wrappedHandler)
  }

  return wrappedHandler
}

// 验证请求体
export async function validateRequestBody<T>(
  request: NextRequest,
  validator: (body: any) => T
): Promise<T> {
  try {
    const body = await request.json()
    return validator(body)
  } catch (_error) {
    throw new Error('请求体格式无效')
  }
}

// 验证环境变量
export function validateEnvVar(name: string, value?: string): string {
  if (!value) {
    throw new Error(`缺少必需的环境变量: ${name}`)
  }
  return value
}
