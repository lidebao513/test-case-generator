/**
 * 提示词模板路由
 * 功能：处理提示词模板的CRUD操作
 */
import express from 'express'
import * as promptController from '../controllers/promptController'

const router = express.Router()

// 提示词模板管理
router.post('/templates', promptController.createPromptTemplate)
router.get('/templates', promptController.getPromptTemplates)
router.get('/templates/:id', promptController.getPromptTemplateById)
router.put('/templates/:id', promptController.updatePromptTemplate)
router.delete('/templates/:id', promptController.deletePromptTemplate)

// 提示词模板版本管理
router.post('/templates/:id/versions', promptController.createPromptTemplateVersion)
router.get('/templates/:id/versions', promptController.getPromptTemplateVersions)

// 大模型调用日志管理
router.get('/logs', promptController.getModelCallLogs)
router.get('/logs/:id', promptController.getModelCallLogById)

// 测试资产生成任务管理
router.post('/tasks', promptController.createTestAssetGenerationTask)
router.get('/tasks', promptController.getTestAssetGenerationTasks)
router.get('/tasks/:id', promptController.getTestAssetGenerationTaskById)
router.put('/tasks/:id', promptController.updateTestAssetGenerationTask)

export default router