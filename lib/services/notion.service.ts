import { Client } from '@notionhq/client'
import { validateEnvVar } from '@/lib/api-middleware'
import { getDatabase, getDatabaseDetails, getFormattedCategoryData } from '@/lib/notion'
import type { CategoryData } from '@/types/notion'

export class NotionService {
  private client: Client
  private databaseId: string
  private categoryDatabaseId: string

  constructor() {
    const token = validateEnvVar('NOTION_TOKEN', process.env.NOTION_TOKEN)
    this.databaseId = validateEnvVar('NOTION_DATABASE_ID', process.env.NOTION_DATABASE_ID)
    this.categoryDatabaseId = validateEnvVar(
      'NOTION_CATEGORY_DATABASE_ID',
      process.env.NOTION_CATEGORY_DATABASE_ID
    )
    this.client = new Client({ auth: token })
  }

  async getAllData() {
    return await getDatabase(this.databaseId)
  }

  /**
   * @description 获取分类数据并转换为组件需要的格式
   * @returns {Promise<CategoryData[]>}
   */
  async getCategoryData(): Promise<CategoryData[]> {
    try {
      return await getFormattedCategoryData(this.categoryDatabaseId)
    } catch (error) {
      console.error('获取分类数据失败:', error)
      return getMockCategoryData()
    }
  }

  async getDatabaseDetails() {
    return await getDatabaseDetails(this.databaseId)
  }

  async createPage(properties: any, icon?: any, cover?: any) {
    const response = await this.client.pages.create({
      parent: {
        database_id: this.databaseId,
      },
      properties,
      icon,
      cover,
    })
    return response
  }
}

/**
 * @description 获取模拟分类数据
 * @returns {CategoryData[]}
 */
export function getMockCategoryData(): CategoryData[] {
  return [
    {
      id: '1',
      name: '项目启动',
      desc: '项目初始化阶段的工具和最佳实践，包括脚手架选择、环境搭建、技术栈确定等关键步骤',
      sort: 1,
      subcategories: [
        { id: '1-1', name: '脚手架工具', desc: 'Create React App、Vite、Next.js等项目生成工具' },
        { id: '1-2', name: '开发环境', desc: 'VS Code配置、Node.js版本管理、环境变量配置' },
        { id: '1-3', name: '包管理器', desc: 'npm、yarn、pnpm的选择和配置' },
        { id: '1-4', name: '版本控制', desc: 'Git配置、分支策略、提交规范' },
        { id: '1-5', name: '项目规范', desc: 'ESLint、Prettier、EditorConfig配置' },
      ],
    },
    {
      id: '2',
      name: '设计阶段',
      desc: 'UI/UX设计相关的工具和资源，包括设计工具、原型制作、设计系统建立等设计流程',
      sort: 2,
      subcategories: [
        { id: '2-1', name: '设计工具', desc: 'Figma、Sketch、Adobe XD等界面设计工具' },
        { id: '2-2', name: '原型制作', desc: '交互原型、线框图、用户流程设计' },
        { id: '2-3', name: '设计系统', desc: '组件库设计、设计规范、Token系统' },
        { id: '2-4', name: '素材资源', desc: '图标库、插画、字体、配色方案' },
        { id: '2-5', name: '设计规范', desc: '响应式设计、无障碍设计、交互规范' },
      ],
    },
    {
      id: '3',
      name: '编码开发',
      desc: '前端开发的核心技术栈和工具，包括框架选择、组件开发、状态管理等开发基础',
      sort: 3,
      subcategories: [
        { id: '3-1', name: '核心框架', desc: 'React、Vue、Angular等前端框架' },
        { id: '3-2', name: 'UI组件库', desc: 'Ant Design、Material-UI、Chakra UI等' },
        { id: '3-3', name: '状态管理', desc: 'Redux、Zustand、Recoil等状态管理方案' },
        { id: '3-4', name: '路由导航', desc: 'React Router、Vue Router等路由解决方案' },
        { id: '3-5', name: '样式方案', desc: 'CSS-in-JS、Tailwind CSS、SCSS等样式方案' },
        { id: '3-6', name: '代码规范', desc: 'ESLint、Prettier、Husky等代码规范工具' },
        { id: '3-7', name: '组件封装', desc: '组件设计模式、通用组件库构建' },
      ],
    },
    {
      id: '4',
      name: '功能实现',
      desc: '具体业务功能的实现方案，涵盖常见的前端功能模块和第三方服务集成',
      sort: 4,
      subcategories: [
        { id: '4-1', name: '表单处理', desc: '表单验证、动态表单、复杂表单交互' },
        { id: '4-2', name: '数据处理', desc: '搜索、分页、排序、筛选等数据操作' },
        { id: '4-3', name: '权限管理', desc: '角色权限、路由守卫、按钮级权限控制' },
        { id: '4-4', name: '文件处理', desc: '文件上传、下载、预览、压缩等功能' },
        { id: '4-5', name: '数据可视化', desc: 'ECharts、D3.js、Chart.js等图表库' },
      ],
    },
    {
      id: '5',
      name: '调试测试',
      desc: '代码质量保障相关的工具和流程，包括调试技巧、测试框架、性能优化等',
      sort: 5,
      subcategories: [
        { id: '5-1', name: '调试工具', desc: 'Chrome DevTools、React DevTools等调试工具' },
        { id: '5-2', name: '单元测试', desc: 'Jest、Vitest、Testing Library等测试框架' },
        { id: '5-3', name: 'E2E测试', desc: 'Cypress、Playwright、Puppeteer等端到端测试' },
        { id: '5-4', name: '代码质量', desc: 'SonarQube、CodeClimate等代码质量检测' },
        { id: '5-5', name: '性能分析', desc: 'Lighthouse、Web Vitals、性能监控工具' },
        { id: '5-6', name: '错误追踪', desc: 'Sentry、Bugsnag等错误监控和追踪' },
      ],
    },
    {
      id: '6',
      name: '构建部署',
      desc: '项目构建和部署相关的工具链，包括打包工具、CI/CD流程、部署平台等',
      sort: 6,
      subcategories: [
        { id: '6-1', name: '构建工具', desc: 'Webpack、Vite、Rollup等模块打包工具' },
        { id: '6-2', name: 'CI/CD', desc: 'GitHub Actions、GitLab CI、Jenkins等持续集成' },
        { id: '6-3', name: '部署平台', desc: 'Vercel、Netlify、AWS、阿里云等部署平台' },
        { id: '6-4', name: '容器化', desc: 'Docker、Kubernetes容器化部署方案' },
        { id: '6-5', name: '静态资源', desc: 'CDN配置、图片优化、资源压缩' },
      ],
    },
    {
      id: '7',
      name: '运维监控',
      desc: '线上项目的监控和维护工具，包括性能监控、日志分析、用户行为分析等',
      sort: 7,
      subcategories: [
        { id: '7-1', name: '性能监控', desc: 'Web Vitals、Real User Monitoring、APM工具' },
        { id: '7-2', name: '日志管理', desc: 'ELK Stack、Fluentd等日志收集分析工具' },
        { id: '7-3', name: '用户分析', desc: 'Google Analytics、百度统计等用户行为分析' },
        { id: '7-4', name: '错误监控', desc: '实时错误报警、错误分析、问题定位' },
        { id: '7-5', name: '安全防护', desc: 'HTTPS配置、CSP策略、XSS防护等安全措施' },
      ],
    },
    {
      id: '8',
      name: 'AI集成',
      // desc: 'AI工具和功能在前端开发中的集成应用，包括AI开发助手、智能功能实现等',
      desc: '',
      sort: 8,
      subcategories: [
        { id: '8-1', name: 'AI开发工具', desc: 'GitHub Copilot、Cursor、Codeium等AI编程助手' },
        { id: '8-2', name: 'AI功能集成', desc: '聊天机器人、文本处理、图像处理等AI功能' },
        { id: '8-3', name: 'AI框架工具', desc: 'Vercel AI SDK、提示词工程等AI开发框架' },
      ],
    },
    {
      id: '9',
      name: '学习成长',
      // desc: '前端开发者的学习资源和成长路径，包括文档资料、社区资源、技能提升等',
      desc: '',
      sort: 9,
      subcategories: [
        { id: '9-1', name: '官方文档', desc: '各种技术栈的官方文档和最佳实践' },
        { id: '9-2', name: '学习资源', desc: '教程、视频课程、技术博客、开源项目' },
        { id: '9-3', name: '社区交流', desc: 'Stack Overflow、GitHub、技术论坛' },
        { id: '9-4', name: '技术趋势', desc: '前端技术发展趋势、新技术调研' },
        { id: '9-5', name: '职业发展', desc: '技能树、面试准备、职业规划' },
      ],
    },
  ]
}
