/**
 * 知识库路由
 * 功能：处理知识库相关的API请求
 */
import express from 'express'
import multer from 'multer'
import * as knowledgeController from '../controllers/knowledgeController'

// 配置multer中间件
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

const router = express.Router()

/**
 * 分类管理路由
 */
// 创建分类
router.post('/categories', knowledgeController.createCategory)
// 获取所有分类
router.get('/categories', knowledgeController.getCategories)
// 获取单个分类
router.get('/categories/:id', knowledgeController.getCategoryById)
// 更新分类
router.put('/categories/:id', knowledgeController.updateCategory)
// 删除分类
router.delete('/categories/:id', knowledgeController.deleteCategory)

/**
 * 知识条目管理路由
 */
// 创建知识条目
router.post('/items', knowledgeController.createKnowledgeItem)
// 获取所有知识条目
router.get('/items', knowledgeController.getKnowledgeItems)
// 获取单个知识条目
router.get('/items/:id', knowledgeController.getKnowledgeItemById)
// 更新知识条目
router.put('/items/:id', knowledgeController.updateKnowledgeItem)
// 删除知识条目
router.delete('/items/:id', knowledgeController.deleteKnowledgeItem)
// 获取知识条目版本
router.get('/items/:id/versions', knowledgeController.getKnowledgeVersions)

/**
 * 知识关联管理路由
 */
// 创建知识关联
router.post('/relations', knowledgeController.createKnowledgeRelation)
// 获取知识关联
router.get('/relations/:id', knowledgeController.getKnowledgeRelations)

/**
 * 知识库搜索路由
 */
// 搜索知识
router.get('/search', knowledgeController.searchKnowledge)

/**
 * 文档导入路由
 */
// 导入文档
router.post('/import', upload.single('file'), knowledgeController.importDocument)

export default router
