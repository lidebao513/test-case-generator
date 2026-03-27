/**
 * 测试点控制器
 * 功能：处理测试点和测试用例相关的请求
 */
import type { Request, Response } from 'express'
import * as db from '../utils/db'

/**
 * 测试点管理
 */

/**
 * 创建测试点
 * @param req 请求对象
 * @param res 响应对象
 */
export const createTestPoint = (req: Request, res: Response) => {
  try {
    const { requirement_id, title, description, validation_target, validation_content, expected_result, priority, type, status } = req.body
    if (!title || !validation_target || !validation_content || !expected_result) {
      return res.status(400).json({ error: '标题、验证对象、验证内容和预期结果不能为空' })
    }
    
    const testPoint = db.createTestPoint({ requirement_id, title, description, validation_target, validation_content, expected_result, priority, type, status })
    res.status(201).json(testPoint)
  } catch (error) {
    console.error('创建测试点失败:', error)
    res.status(500).json({ error: '创建测试点失败' })
  }
}

/**
 * 获取所有测试点
 * @param req 请求对象
 * @param res 响应对象
 */
export const getTestPoints = (req: Request, res: Response) => {
  try {
    const { requirement_id } = req.query
    let testPoints
    if (requirement_id) {
      testPoints = db.getTestPoints(requirement_id as string)
    } else {
      testPoints = db.getTestPoints()
    }
    res.json(testPoints)
  } catch (error) {
    console.error('获取测试点失败:', error)
    res.status(500).json({ error: '获取测试点失败' })
  }
}

/**
 * 获取单个测试点
 * @param req 请求对象
 * @param res 响应对象
 */
export const getTestPointById = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const testPoint = db.getTestPointById(id)
    if (!testPoint) {
      return res.status(404).json({ error: '测试点不存在' })
    }
    res.json(testPoint)
  } catch (error) {
    console.error('获取测试点失败:', error)
    res.status(500).json({ error: '获取测试点失败' })
  }
}

/**
 * 更新测试点
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateTestPoint = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const testPoint = db.updateTestPoint(id, updates)
    if (!testPoint) {
      return res.status(404).json({ error: '测试点不存在' })
    }
    res.json(testPoint)
  } catch (error) {
    console.error('更新测试点失败:', error)
    res.status(500).json({ error: '更新测试点失败' })
  }
}

/**
 * 删除测试点
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteTestPoint = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = db.deleteTestPoint(id)
    if (!success) {
      return res.status(404).json({ error: '测试点不存在' })
    }
    res.json({ message: '测试点删除成功' })
  } catch (error) {
    console.error('删除测试点失败:', error)
    res.status(500).json({ error: '删除测试点失败' })
  }
}

/**
 * 测试用例管理
 */

/**
 * 获取测试用例
 * @param req 请求对象
 * @param res 响应对象
 */
export const getTestCases = (req: Request, res: Response) => {
  try {
    const { test_point_id } = req.query
    let testCases
    if (test_point_id) {
      testCases = db.getTestCases(test_point_id as string)
    } else {
      testCases = db.getTestCases()
    }
    res.json(testCases)
  } catch (error) {
    console.error('获取测试用例失败:', error)
    res.status(500).json({ error: '获取测试用例失败' })
  }
}

/**
 * 获取单个测试用例
 * @param req 请求对象
 * @param res 响应对象
 */
export const getTestCaseById = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const testCase = db.getTestCaseById(id)
    if (!testCase) {
      return res.status(404).json({ error: '测试用例不存在' })
    }
    res.json(testCase)
  } catch (error) {
    console.error('获取测试用例失败:', error)
    res.status(500).json({ error: '获取测试用例失败' })
  }
}

/**
 * 更新测试用例
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateTestCase = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const testCase = db.updateTestCase(id, updates)
    if (!testCase) {
      return res.status(404).json({ error: '测试用例不存在' })
    }
    res.json(testCase)
  } catch (error) {
    console.error('更新测试用例失败:', error)
    res.status(500).json({ error: '更新测试用例失败' })
  }
}

/**
 * 删除测试用例
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteTestCase = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = db.deleteTestCase(id)
    if (!success) {
      return res.status(404).json({ error: '测试用例不存在' })
    }
    res.json({ message: '测试用例删除成功' })
  } catch (error) {
    console.error('删除测试用例失败:', error)
    res.status(500).json({ error: '删除测试用例失败' })
  }
}