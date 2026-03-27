/**
 * 后端服务器主文件
 * 功能：初始化Express应用，配置中间件，启动服务器
 */
import express from 'express'
import cors from 'cors'
import uploadRoute from './routes/upload'
import knowledgeRoute from './routes/knowledge'
import testPointRoute from './routes/testPoint'
import promptRoute from './routes/prompt'
import testManagementRoute from './routes/testManagement'
import { errorHandler, notFound } from './middleware/errorHandler'

// 创建Express应用实例
const app = express()
// 服务器端口
const PORT = 8000

// 配置CORS中间件，允许跨域请求
app.use(cors())
// 配置JSON解析中间件，处理JSON格式的请求体
app.use(express.json())
// 注册上传路由，前缀为/api
app.use('/api', uploadRoute)
// 注册知识库路由，前缀为/api/knowledge
app.use('/api/knowledge', knowledgeRoute)
// 注册测试点路由，前缀为/api
app.use('/api', testPointRoute)
// 注册提示词模板路由，前缀为/api/prompt
app.use('/api/prompt', promptRoute)
// 注册测试管理系统对接路由，前缀为/api/test-management
app.use('/api/test-management', testManagementRoute)

// 注册错误处理中间件
app.use(notFound) // 404错误处理
app.use(errorHandler) // 全局错误处理

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
