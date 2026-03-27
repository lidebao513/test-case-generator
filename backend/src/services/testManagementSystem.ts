/**
 * 测试管理系统对接服务
 * 功能：与JIRA、TestRail等测试管理系统进行对接，支持双向数据同步
 */
import axios from 'axios'
import dotenv from 'dotenv'
import * as db from '../utils/db'

// 加载环境变量
dotenv.config()

/**
 * JIRA对接服务
 */
export class JiraService {
  private baseURL: string
  private username: string
  private apiToken: string

  constructor() {
    this.baseURL = process.env.JIRA_BASE_URL || ''
    this.username = process.env.JIRA_USERNAME || ''
    this.apiToken = process.env.JIRA_API_TOKEN || ''
  }

  /**
   * 检查JIRA配置是否完整
   */
  public isConfigured(): boolean {
    return !!this.baseURL && !!this.username && !!this.apiToken
  }

  /**
   * 创建JIRA问题
   */
  public async createIssue(summary: string, description: string, issueType: string = 'Bug'): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('JIRA配置不完整')
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/rest/api/2/issue`,
        {
          fields: {
            project: {
              key: process.env.JIRA_PROJECT_KEY || 'TEST'
            },
            summary,
            description,
            issuetype: {
              name: issueType
            }
          }
        },
        {
          auth: {
            username: this.username,
            password: this.apiToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('创建JIRA问题失败:', error)
      throw error
    }
  }

  /**
   * 获取JIRA问题
   */
  public async getIssue(issueKey: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('JIRA配置不完整')
    }

    try {
      const response = await axios.get(`${this.baseURL}/rest/api/2/issue/${issueKey}`, {
        auth: {
          username: this.username,
          password: this.apiToken
        }
      })
      return response.data
    } catch (error) {
      console.error('获取JIRA问题失败:', error)
      throw error
    }
  }

  /**
   * 更新JIRA问题
   */
  public async updateIssue(issueKey: string, updates: any): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('JIRA配置不完整')
    }

    try {
      const response = await axios.put(
        `${this.baseURL}/rest/api/2/issue/${issueKey}`,
        { fields: updates },
        {
          auth: {
            username: this.username,
            password: this.apiToken
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('更新JIRA问题失败:', error)
      throw error
    }
  }
}

/**
 * TestRail对接服务
 */
export class TestRailService {
  private baseURL: string
  private username: string
  private apiKey: string

  constructor() {
    this.baseURL = process.env.TESTRAIL_BASE_URL || ''
    this.username = process.env.TESTRAIL_USERNAME || ''
    this.apiKey = process.env.TESTRAIL_API_KEY || ''
  }

  /**
   * 检查TestRail配置是否完整
   */
  public isConfigured(): boolean {
    return !!this.baseURL && !!this.username && !!this.apiKey
  }

  /**
   * 创建测试用例
   */
  public async createTestCase(projectId: number, title: string, steps: string, expectedResult: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('TestRail配置不完整')
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/index.php?/api/v2/add_case/${projectId}`,
        {
          title,
          steps,
          expected: expectedResult,
          type_id: 1, // 功能测试
          priority_id: 4 // 中优先级
        },
        {
          auth: {
            username: this.username,
            password: this.apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('创建TestRail测试用例失败:', error)
      throw error
    }
  }

  /**
   * 获取测试用例
   */
  public async getTestCase(caseId: number): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('TestRail配置不完整')
    }

    try {
      const response = await axios.get(`${this.baseURL}/index.php?/api/v2/get_case/${caseId}`, {
        auth: {
          username: this.username,
          password: this.apiKey
        }
      })
      return response.data
    } catch (error) {
      console.error('获取TestRail测试用例失败:', error)
      throw error
    }
  }

  /**
   * 更新测试用例
   */
  public async updateTestCase(caseId: number, updates: any): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('TestRail配置不完整')
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/index.php?/api/v2/update_case/${caseId}`,
        updates,
        {
          auth: {
            username: this.username,
            password: this.apiKey
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('更新TestRail测试用例失败:', error)
      throw error
    }
  }
}

/**
 * 测试管理系统同步服务
 */
export class TestManagementSyncService {
  private jiraService: JiraService
  private testRailService: TestRailService

  constructor() {
    this.jiraService = new JiraService()
    this.testRailService = new TestRailService()
  }

  /**
   * 将测试用例同步到JIRA
   */
  public async syncTestCaseToJira(testCase: any): Promise<any> {
    if (!this.jiraService.isConfigured()) {
      throw new Error('JIRA配置不完整')
    }

    try {
      const summary = testCase.title
      const description = `测试用例ID: ${testCase.id}\n` +
                        `测试类型: ${testCase.type}\n` +
                        `优先级: ${testCase.priority}\n` +
                        `前置条件: ${testCase.preconditions}\n` +
                        `测试数据: ${testCase.testData}\n` +
                        `测试步骤:\n${testCase.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}\n` +
                        `预期结果: ${testCase.expectedResult}\n` +
                        `后置处理: ${testCase.postconditions}\n` +
                        `描述: ${testCase.description}`

      const issue = await this.jiraService.createIssue(summary, description, 'Task')
      return issue
    } catch (error) {
      console.error('同步测试用例到JIRA失败:', error)
      throw error
    }
  }

  /**
   * 将测试用例同步到TestRail
   */
  public async syncTestCaseToTestRail(testCase: any, projectId: number): Promise<any> {
    if (!this.testRailService.isConfigured()) {
      throw new Error('TestRail配置不完整')
    }

    try {
      const steps = testCase.steps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')
      const testRailCase = await this.testRailService.createTestCase(
        projectId,
        testCase.title,
        steps,
        testCase.expectedResult
      )
      return testRailCase
    } catch (error) {
      console.error('同步测试用例到TestRail失败:', error)
      throw error
    }
  }

  /**
   * 从JIRA同步问题到测试用例
   */
  public async syncIssueFromJira(issueKey: string): Promise<any> {
    if (!this.jiraService.isConfigured()) {
      throw new Error('JIRA配置不完整')
    }

    try {
      const issue = await this.jiraService.getIssue(issueKey)
      const testCase = {
        title: issue.fields.summary,
        description: issue.fields.description || '',
        type: '功能测试',
        priority: 'P1',
        preconditions: '',
        testData: '',
        steps: ['打开系统', '执行操作', '验证结果'],
        expectedResult: '功能执行成功，结果符合预期',
        postconditions: '',
        test_point_id: ''
      }

      // 保存到数据库
      const newTestCase = db.createTestCase(testCase)
      return newTestCase
    } catch (error) {
      console.error('从JIRA同步问题失败:', error)
      throw error
    }
  }

  /**
   * 从TestRail同步测试用例
   */
  public async syncTestCaseFromTestRail(caseId: number): Promise<any> {
    if (!this.testRailService.isConfigured()) {
      throw new Error('TestRail配置不完整')
    }

    try {
      const testRailCase = await this.testRailService.getTestCase(caseId)
      const steps = testRailCase.steps.split('\n').filter((step: string) => step.trim())
      
      const testCase = {
        title: testRailCase.title,
        description: '',
        type: '功能测试',
        priority: 'P1',
        preconditions: '',
        testData: '',
        steps: steps,
        expectedResult: testRailCase.expected,
        postconditions: '',
        test_point_id: ''
      }

      // 保存到数据库
      const newTestCase = db.createTestCase(testCase)
      return newTestCase
    } catch (error) {
      console.error('从TestRail同步测试用例失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const testManagementSyncService = new TestManagementSyncService()
export const jiraService = new JiraService()
export const testRailService = new TestRailService()