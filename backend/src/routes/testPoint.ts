/**
 * 测试点路由
 * 功能：处理测试点和测试用例相关的API请求
 */
import express from 'express'
import * as testPointController from '../controllers/testPointController'

const router = express.Router()

/**
 * 测试点管理路由
 */
// 创建测试点
router.post('/test-points', testPointController.createTestPoint)
// 获取所有测试点
router.get('/test-points', testPointController.getTestPoints)
// 获取单个测试点
router.get('/test-points/:id', testPointController.getTestPointById)
// 更新测试点
router.put('/test-points/:id', testPointController.updateTestPoint)
// 删除测试点
router.delete('/test-points/:id', testPointController.deleteTestPoint)

/**
 * 测试用例管理路由
 */
// 获取测试用例
router.get('/test-cases', testPointController.getTestCases)
// 获取单个测试用例
router.get('/test-cases/:id', testPointController.getTestCaseById)
// 更新测试用例
router.put('/test-cases/:id', testPointController.updateTestCase)
// 删除测试用例
router.delete('/test-cases/:id', testPointController.deleteTestCase)

export default router