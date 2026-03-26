/**
 * 文件上传路由
 * 功能：处理文件上传请求，配置文件过滤和存储
 */
import express from 'express'
import multer from 'multer'
import { uploadFile } from '../controllers/testCaseController'

const router = express.Router()

/**
 * 配置multer中间件
 * - dest: 文件存储目录
 * - fileFilter: 文件类型过滤
 */
const upload = multer({
  dest: 'uploads/', // 临时文件存储目录
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedExt = ['.docx', '.pdf', '.txt']
    const ext = file.originalname.split('.').pop()?.toLowerCase()
    if (ext && allowedExt.includes(`.${ext}`)) {
      cb(null, true) // 允许上传
    } else {
      cb(new Error('只支持 .docx, .pdf, .txt 文件')) // 拒绝上传
    }
  }
})

/**
 * POST /upload 路由
 * 功能：接收文件上传并处理
 * - upload.single('file'): 处理单个文件上传，字段名为'file'
 * - uploadFile: 处理上传后的逻辑
 */
router.post('/upload', upload.single('file'), uploadFile)

export default router
