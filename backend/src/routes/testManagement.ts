/**
 * 测试管理系统对接路由
 * 功能：处理与JIRA、TestRail等测试管理系统的对接接口
 */
import express from 'express'
import { testManagementSyncService, jiraService, testRailService } from '../services/testManagementSystem'

const router = express.Router()

// JIRA相关接口
router.post('/jira/issues', async (req, res) => {
  try {
    const { summary, description, _issueType } = req.body
    const issue = await testManagementSyncService.syncTestCaseToJira({
      title: summary,
      description: description,
      type: '功能测试',
      priority: 'P1',
      preconditions: '',
      testData: '',
      steps: ['打开系统', '执行操作', '验证结果'],
      expectedResult: '功能执行成功，结果符合预期',
      postconditions: '',
      test_point_id: ''
    })
    res.status(201).json(issue)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.get('/jira/issues/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params
    const issue = await jiraService.getIssue(issueKey)
    res.status(200).json(issue)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.put('/jira/issues/:issueKey', async (req, res) => {
  try {
    const { issueKey } = req.params
    const updates = req.body
    const issue = await jiraService.updateIssue(issueKey, updates)
    res.status(200).json(issue)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// TestRail相关接口
router.post('/testrail/cases', async (req, res) => {
  try {
    const { projectId, title, steps, expectedResult } = req.body
    const testCase = await testRailService.createTestCase(projectId, title, steps, expectedResult)
    res.status(201).json(testCase)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.get('/testrail/cases/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params
    const testCase = await testRailService.getTestCase(parseInt(caseId))
    res.status(200).json(testCase)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.put('/testrail/cases/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params
    const updates = req.body
    const testCase = await testRailService.updateTestCase(parseInt(caseId), updates)
    res.status(200).json(testCase)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// 同步接口
router.post('/sync/jira-to-testcase', async (req, res) => {
  try {
    const { issueKey } = req.body
    const testCase = await testManagementSyncService.syncIssueFromJira(issueKey)
    res.status(201).json(testCase)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.post('/sync/testrail-to-testcase', async (req, res) => {
  try {
    const { caseId } = req.body
    const testCase = await testManagementSyncService.syncTestCaseFromTestRail(caseId)
    res.status(201).json(testCase)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.post('/sync/testcase-to-jira', async (req, res) => {
  try {
    const testCase = req.body
    const issue = await testManagementSyncService.syncTestCaseToJira(testCase)
    res.status(201).json(issue)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

router.post('/sync/testcase-to-testrail', async (req, res) => {
  try {
    const { testCase, projectId } = req.body
    const testRailCase = await testManagementSyncService.syncTestCaseToTestRail(testCase, projectId)
    res.status(201).json(testRailCase)
  } catch (error) {
    res.status(500).json({ error: (error as Error).message })
  }
})

// 配置检查接口
router.get('/config/jira', (req, res) => {
  res.status(200).json({ configured: jiraService.isConfigured() })
})

router.get('/config/testrail', (req, res) => {
  res.status(200).json({ configured: testRailService.isConfigured() })
})

export default router