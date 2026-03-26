/**
 * 后端服务器主文件
 * 功能：初始化Express应用，配置中间件，启动服务器
 */
import express from 'express'
import cors from 'cors'
import uploadRoute from './routes/upload'

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

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
