# API 架构重构文档

## 重构概述

本次重构采用了现代化的 API 设计模式，实现了以下改进：

### 1. 统一的中间件系统

- **认证中间件**: 统一处理用户认证，避免重复代码
- **错误处理中间件**: 标准化错误响应格式
- **响应格式中间件**: 统一 API 响应结构

### 2. 服务层抽象

- **NotionService**: 封装所有 Notion 相关操作
- **UploadService**: 处理文件上传逻辑
- **MetadataService**: 网页元数据获取服务

### 3. 功能分组和版本控制

- 使用 `/api/v1/` 前缀进行版本控制
- 按功能分组：`data`、`upload`、`meta`

## 新的 API 结构

### 数据相关 API: `/api/v1/data`

#### GET `/api/v1/data?action=all` (默认)

- **功能**: 获取所有数据
- **认证**: 不需要
- **参数**: 无
- **响应**:

```json
{
  "success": true,
  "data": [...] // Notion 数据库数据
}
```

#### GET `/api/v1/data?action=details`

- **功能**: 获取数据库详情
- **认证**: 不需要
- **参数**: 无
- **响应**:

```json
{
  "success": true,
  "data": {...} // 数据库元信息
}
```

#### POST `/api/v1/data`

- **功能**: 创建新页面
- **认证**: 需要
- **请求体**:

```json
{
  "properties": {...}, // 页面属性
  "icon": {...},       // 可选：页面图标
  "cover": {...}       // 可选：页面封面
}
```

### 上传相关 API: `/api/v1/upload`

#### POST `/api/v1/upload` (文件上传)

- **功能**: 上传文件
- **认证**: 需要
- **Content-Type**: `multipart/form-data`
- **参数**:
  - `file`: 文件
  - `url`: 源 URL
- **响应**:

```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "fileName": "...",
    "type": "file_upload"
  }
}
```

#### POST `/api/v1/upload` (从 URL 上传)

- **功能**: 从 URL 下载并上传文件
- **认证**: 需要
- **Content-Type**: `application/json`
- **请求体**:

```json
{
  "url": "https://...", // 图片 URL
  "sourceUrl": "https://..." // 源页面 URL
}
```

### 元数据相关 API: `/api/v1/meta`

#### POST `/api/v1/meta`

- **功能**: 获取网页元数据
- **认证**: 需要
- **请求体**:

```json
{
  "url": "https://..."
}
```

- **响应**:

```json
{
  "success": true,
  "data": {
    "icon": "https://...",
    "title": "页面标题",
    "description": "页面描述"
  }
}
```

## 认证和权限

### 需要认证的接口

- `POST /api/v1/data` - 创建页面
- `POST /api/v1/upload` - 所有上传操作
- `POST /api/v1/meta` - 获取元数据

### 不需要认证的接口

- `GET /api/v1/data` - 读取数据
- `/api/auth/*` - 认证相关

## 错误响应格式

所有 API 错误响应均遵循统一格式：

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE" // 可选的错误代码
}
```

常见错误代码：

- `UNAUTHORIZED`: 未授权访问
- `MISSING_FILE`: 缺少文件
- `MISSING_URL`: 缺少 URL
- `UNSUPPORTED_CONTENT_TYPE`: 不支持的内容类型
- `INTERNAL_ERROR`: 服务器内部错误

## 迁移指南

### 从旧 API 迁移到新 API

1. **获取数据**:

   - 旧: `GET /api/getData`
   - 新: `GET /api/v1/data?action=all`

2. **获取数据库详情**:

   - 旧: `GET /api/getDatabaseDetails`
   - 新: `GET /api/v1/data?action=details`

3. **创建页面**:

   - 旧: `POST /api/upload`
   - 新: `POST /api/v1/data`

4. **上传文件**:

   - 旧: `POST /api/upload-image`
   - 新: `POST /api/v1/upload` (multipart/form-data)

5. **从 URL 上传**:

   - 旧: `POST /api/upload-from-url`
   - 新: `POST /api/v1/upload` (application/json)

6. **获取元数据**:
   - 旧: `POST /api/getMetaData`
   - 新: `POST /api/v1/meta`

## 开发建议

### 1. 使用服务层

当需要添加新功能时，优先考虑在服务层实现：

```typescript
// 在 lib/services/ 中创建或扩展服务
export class YourService {
  async yourMethod() {
    // 业务逻辑
  }
}
```

### 2. 使用中间件

所有新的 API 路由都应该使用中间件：

```typescript
export const POST = withMiddleware(handler, {
  requireAuth: true,
  errorHandling: true,
})
```

### 3. 标准化响应

使用提供的响应工具：

```typescript
import { createSuccessResponse, createErrorResponse } from '@/lib/api-middleware'

// 成功响应
return createSuccessResponse(data)

// 错误响应
return createErrorResponse('错误信息', 400, 'ERROR_CODE')
```

## 向后兼容性

目前旧的 API 端点仍然保留，但建议尽快迁移到新的 API 结构。旧 API 将在未来版本中被标记为废弃。
