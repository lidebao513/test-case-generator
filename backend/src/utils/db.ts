/**
 * 数据库工具
 * 实现知识库系统的数据库模型和操作
 */

// 内存存储实现

// 分类表
interface Category {
  id: string
  name: string
  parent_id: string | null
  description: string
  created_at: string
  updated_at: string
}

// 知识条目表
interface KnowledgeItem {
  id: string
  title: string
  content: string
  type: string
  category_id: string
  created_at: string
  updated_at: string
}

// 知识版本表
interface KnowledgeVersion {
  id: string
  knowledge_id: string
  content: string
  version: string
  created_at: string
  created_by: string
}

// 知识关联表
interface KnowledgeRelation {
  id: string
  source_id: string
  target_id: string
  relation_type: string
  created_at: string
}

// 测试点表
interface TestPoint {
  id: string
  requirement_id: string
  title: string
  description: string
  validation_target: string
  validation_content: string
  expected_result: string
  priority: string
  type: string
  status: string
  review_status: string // 评审状态：待评审/已通过/已拒绝
  review_comments: string // 评审意见
  created_at: string
  updated_at: string
}

// 测试用例表
interface TestCase {
  id: string
  test_point_id: string
  title: string
  type: string
  priority: string
  preconditions: string
  testData: string
  steps: string[]
  expectedResult: string
  postconditions: string
  description: string
  review_status: string // 评审状态：待评审/已通过/已拒绝
  review_comments: string // 评审意见
  created_at: string
  updated_at: string
}

// 内存存储
let categories: Category[] = []
let knowledgeItems: KnowledgeItem[] = []
let knowledgeVersions: KnowledgeVersion[] = []
let knowledgeRelations: KnowledgeRelation[] = []
let testPoints: TestPoint[] = []
let testCases: TestCase[] = []
let promptTemplates: any[] = []
let promptTemplateVersions: any[] = []
let modelCallLogs: any[] = []
let testAssetGenerationTasks: any[] = []

// 生成唯一ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 分类管理
export const createCategory = (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Category => {
  const newCategory: Category = {
    ...category,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  categories.push(newCategory)
  return newCategory
}

export const getCategories = (): Category[] => {
  return categories
}

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id)
}

export const updateCategory = (id: string, updates: Partial<Category>): Category | undefined => {
  const index = categories.findIndex(cat => cat.id === id)
  if (index !== -1) {
    categories[index] = {
      ...categories[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return categories[index]
  }
  return undefined
}

export const deleteCategory = (id: string): boolean => {
  const index = categories.findIndex(cat => cat.id === id)
  if (index !== -1) {
    categories.splice(index, 1)
    return true
  }
  return false
}

// 知识条目管理
export const createKnowledgeItem = (item: Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at'>): KnowledgeItem => {
  const newItem: KnowledgeItem = {
    ...item,
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  knowledgeItems.push(newItem)
  
  // 创建初始版本
  const initialVersion: KnowledgeVersion = {
    id: generateId(),
    knowledge_id: newItem.id,
    content: item.content,
    version: '1.0',
    created_at: new Date().toISOString(),
    created_by: 'system'
  }
  knowledgeVersions.push(initialVersion)
  
  return newItem
}

export const getKnowledgeItems = (): KnowledgeItem[] => {
  return knowledgeItems
}

export const getKnowledgeItemById = (id: string): KnowledgeItem | undefined => {
  return knowledgeItems.find(item => item.id === id)
}

export const getKnowledgeItemsByCategory = (categoryId: string): KnowledgeItem[] => {
  return knowledgeItems.filter(item => item.category_id === categoryId)
}

export const updateKnowledgeItem = (id: string, updates: Partial<KnowledgeItem>): KnowledgeItem | undefined => {
  const index = knowledgeItems.findIndex(item => item.id === id)
  if (index !== -1) {
    // 创建新版本
    if (updates.content) {
      const _currentItem = knowledgeItems[index]
      const versions = knowledgeVersions.filter(v => v.knowledge_id === id)
      const newVersion = versions.length + 1
      
      const version: KnowledgeVersion = {
        id: generateId(),
        knowledge_id: id,
        content: updates.content,
        version: `${newVersion}.0`,
        created_at: new Date().toISOString(),
        created_by: 'system'
      }
      knowledgeVersions.push(version)
    }
    
    knowledgeItems[index] = {
      ...knowledgeItems[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return knowledgeItems[index]
  }
  return undefined
}

export const deleteKnowledgeItem = (id: string): boolean => {
  const index = knowledgeItems.findIndex(item => item.id === id)
  if (index !== -1) {
    knowledgeItems.splice(index, 1)
    // 删除相关版本
    knowledgeVersions = knowledgeVersions.filter(v => v.knowledge_id !== id)
    // 删除相关关联
    knowledgeRelations = knowledgeRelations.filter(r => r.source_id !== id && r.target_id !== id)
    return true
  }
  return false
}

// 知识版本管理
export const getKnowledgeVersions = (knowledgeId: string): KnowledgeVersion[] => {
  return knowledgeVersions.filter(v => v.knowledge_id === knowledgeId)
}

// 知识关联管理
export const createKnowledgeRelation = (relation: Omit<KnowledgeRelation, 'id' | 'created_at'>): KnowledgeRelation => {
  const newRelation: KnowledgeRelation = {
    ...relation,
    id: generateId(),
    created_at: new Date().toISOString()
  }
  knowledgeRelations.push(newRelation)
  return newRelation
}

export const getKnowledgeRelations = (sourceId: string): KnowledgeRelation[] => {
  return knowledgeRelations.filter(r => r.source_id === sourceId)
}

// 测试点管理
export const createTestPoint = (testPoint: Omit<TestPoint, 'id' | 'created_at' | 'updated_at' | 'review_status' | 'review_comments'>): TestPoint => {
  const newTestPoint: TestPoint = {
    ...testPoint,
    review_status: '待评审',
    review_comments: '',
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  testPoints.push(newTestPoint)
  return newTestPoint
}

export const getTestPoints = (requirement_id?: string): TestPoint[] => {
  if (requirement_id) {
    return testPoints.filter(point => point.requirement_id === requirement_id)
  }
  return testPoints
}

export const getTestPointById = (id: string): TestPoint | undefined => {
  return testPoints.find(point => point.id === id)
}

export const updateTestPoint = (id: string, updates: Partial<TestPoint>): TestPoint | undefined => {
  const index = testPoints.findIndex(point => point.id === id)
  if (index !== -1) {
    testPoints[index] = {
      ...testPoints[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return testPoints[index]
  }
  return undefined
}

export const deleteTestPoint = (id: string): boolean => {
  const index = testPoints.findIndex(point => point.id === id)
  if (index !== -1) {
    testPoints.splice(index, 1)
    // 删除相关的测试用例
    testCases = testCases.filter(testCase => testCase.test_point_id !== id)
    return true
  }
  return false
}

// 测试用例管理
export const createTestCase = (testCase: Omit<TestCase, 'id' | 'created_at' | 'updated_at' | 'review_status' | 'review_comments'>): TestCase => {
  const newTestCase: TestCase = {
    ...testCase,
    review_status: '待评审',
    review_comments: '',
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  testCases.push(newTestCase)
  return newTestCase
}

export const getTestCases = (test_point_id?: string): TestCase[] => {
  if (test_point_id) {
    return testCases.filter(testCase => testCase.test_point_id === test_point_id)
  }
  return testCases
}

export const getTestCaseById = (id: string): TestCase | undefined => {
  return testCases.find(testCase => testCase.id === id)
}

export const updateTestCase = (id: string, updates: Partial<TestCase>): TestCase | undefined => {
  const index = testCases.findIndex(testCase => testCase.id === id)
  if (index !== -1) {
    testCases[index] = {
      ...testCases[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return testCases[index]
  }
  return undefined
}

export const deleteTestCase = (id: string): boolean => {
  const index = testCases.findIndex(testCase => testCase.id === id)
  if (index !== -1) {
    testCases.splice(index, 1)
    return true
  }
  return false
}

export const saveTestCases = (testCases: any[]) => {
  // 向后兼容的函数
  testCases.forEach(testCase => {
    if (testCase.id) {
      const existing = testCases.find(tc => tc.id === testCase.id)
      if (existing) {
        updateTestCase(testCase.id, testCase)
      } else {
        createTestCase({
          test_point_id: testCase.test_point_id || '',
          title: testCase.title,
          type: testCase.type || '功能测试',
          priority: testCase.priority || 'P1',
          preconditions: testCase.preconditions || '',
          testData: testCase.testData || '',
          steps: testCase.steps || [],
          expectedResult: testCase.expectedResult || '',
          postconditions: testCase.postconditions || '',
          description: testCase.description || ''
        })
      }
    }
  })
}

export const getAllTestCases = () => {
  return testCases
}

export const clearTestCases = () => {
  testCases = []
}

// 知识库搜索
export const searchKnowledge = (query: string): KnowledgeItem[] => {
  return knowledgeItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.content.toLowerCase().includes(query.toLowerCase())
  )
}

// 提示词模板管理
export const createPromptTemplate = (template: any): any => {
  const newTemplate = {
    ...template,
    id: generateId(),
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  promptTemplates.push(newTemplate)
  return newTemplate
}

export const getPromptTemplates = (): any[] => {
  return promptTemplates
}

export const getPromptTemplateById = (id: string): any | undefined => {
  return promptTemplates.find(template => template.id === id)
}

export const updatePromptTemplate = (id: string, updates: any): any | undefined => {
  const index = promptTemplates.findIndex(template => template.id === id)
  if (index !== -1) {
    promptTemplates[index] = {
      ...promptTemplates[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return promptTemplates[index]
  }
  return undefined
}

export const deletePromptTemplate = (id: string): boolean => {
  const index = promptTemplates.findIndex(template => template.id === id)
  if (index !== -1) {
    promptTemplates[index].status = 'archived'
    promptTemplates[index].updated_at = new Date().toISOString()
    return true
  }
  return false
}

// 提示词模板版本管理
export const createPromptTemplateVersion = (version: any): any => {
  const newVersion = {
    ...version,
    id: generateId(),
    created_at: new Date().toISOString()
  }
  promptTemplateVersions.push(newVersion)
  return newVersion
}

export const getPromptTemplateVersions = (templateId: string): any[] => {
  return promptTemplateVersions.filter(version => version.template_id === templateId)
}

// 大模型调用日志管理
export const createModelCallLog = (log: any): any => {
  const newLog = {
    ...log,
    id: generateId(),
    created_at: new Date().toISOString()
  }
  modelCallLogs.push(newLog)
  return newLog
}

export const getModelCallLogs = (filters?: any): any[] => {
  let logs = modelCallLogs
  if (filters) {
    if (filters.model_type) {
      logs = logs.filter(log => log.model_type === filters.model_type)
    }
    if (filters.status) {
      logs = logs.filter(log => log.status === filters.status)
    }
    if (filters.start_date) {
      logs = logs.filter(log => new Date(log.created_at) >= new Date(filters.start_date))
    }
    if (filters.end_date) {
      logs = logs.filter(log => new Date(log.created_at) <= new Date(filters.end_date))
    }
  }
  return logs
}

export const getModelCallLogById = (id: string): any | undefined => {
  return modelCallLogs.find(log => log.id === id)
}

// 测试资产生成任务管理
export const createTestAssetGenerationTask = (task: any): any => {
  const newTask = {
    ...task,
    id: generateId(),
    status: 'pending',
    progress: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  testAssetGenerationTasks.push(newTask)
  return newTask
}

export const getTestAssetGenerationTasks = (status?: string): any[] => {
  if (status) {
    return testAssetGenerationTasks.filter(task => task.status === status)
  }
  return testAssetGenerationTasks
}

export const updateTestAssetGenerationTask = (id: string, updates: any): any | undefined => {
  const index = testAssetGenerationTasks.findIndex(task => task.id === id)
  if (index !== -1) {
    testAssetGenerationTasks[index] = {
      ...testAssetGenerationTasks[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return testAssetGenerationTasks[index]
  }
  return undefined
}

export const getTestAssetGenerationTaskById = (id: string): any | undefined => {
  return testAssetGenerationTasks.find(task => task.id === id)
}
