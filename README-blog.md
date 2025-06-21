# Notion 博客功能说明

## 功能概述

本项目已集成基于 Notion 数据库的博客功能，使用 `react-notion-x` 渲染 Notion 页面内容。

## 配置步骤

### 1. 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# Notion 配置
NOTION_TOKEN=your_notion_integration_token
NOTION_BLOG_DATABASE_ID=your_blog_database_id
```

### 2. 获取 Notion Integration Token

1. 访问 [Notion Developers](https://www.notion.so/my-integrations)
2. 创建新的 Integration
3. 复制 Internal Integration Token
4. 将 token 添加到环境变量 `NOTION_TOKEN`

### 3. 创建博客数据库

在 Notion 中创建一个数据库，包含以下属性：

#### 必需属性：

- **title** (标题类型) - 文章标题
- **slug** (文本类型) - URL 路径，用于访问文章详情

#### 可选属性：

- **description** (文本类型) - 文章描述/摘要
- **tags** (多选类型) - 文章标签
- **category** (选择类型) - 文章分类

### 4. 数据库权限设置

1. 在博客数据库页面，点击右上角的 "Share" 按钮
2. 添加你创建的 Integration，并给予 "Read" 权限
3. 复制数据库 ID（URL 中的最后一段）
4. 将数据库 ID 添加到环境变量 `NOTION_BLOG_DATABASE_ID`

## 使用方法

### 访问博客列表

访问 `/blog` 可以查看所有博客文章列表

### 访问文章详情

访问 `/blog/[slug]` 可以查看具体文章内容，其中 `slug` 是文章的 slug 属性值

### 创建新文章

1. 在 Notion 博客数据库中创建新页面
2. 填写必需的属性（title, slug）
3. 编写文章内容
4. 文章会自动在博客网站中显示

## 注意事项

- 确保每篇文章都有唯一的 slug 值
- slug 建议使用英文和连字符，避免特殊字符
- 文章内容支持 Notion 的所有块类型（文本、图片、代码块等）
- 图片和文件会使用 Notion 的 CDN 链接

## 故障排除

### 文章不显示

1. 检查 `NOTION_TOKEN` 是否正确
2. 检查 `NOTION_BLOG_DATABASE_ID` 是否正确
3. 确认 Integration 有数据库访问权限
4. 检查文章是否有 title 和 slug 属性

### 文章内容不显示

1. 检查页面是否对 Integration 开放了访问权限
2. 确认页面 ID 是否正确
