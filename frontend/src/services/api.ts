/**
 * API服务
 * 功能：与后端服务器通信，处理文件上传和测试用例获取
 */
import axios from 'axios'

/**
 * 测试用例接口定义
 */
export interface TestCase {
  id: string           // 测试用例ID
  title: string        // 测试用例标题
  type: string         // 测试类型
  priority: string     // 优先级（P0/P1/P2）
  preconditions: string // 前置条件
  testData: string     // 测试数据
  steps: string[]      // 测试步骤
  expectedResult: string // 预期结果
  postconditions: string // 后置处理
  description?: string  // 测试用例描述（可选）
  test_point_id: string // 关联的测试点ID
  review_status: string // 评审状态
  review_comments: string // 评审意见
  created_at: string
  updated_at: string
}

/**
 * 分类接口定义
 */
export interface Category {
  id: string
  name: string
  parent_id: string | null
  description: string
  created_at: string
  updated_at: string
}

/**
 * 知识条目接口定义
 */
export interface KnowledgeItem {
  id: string
  title: string
  content: string
  type: string
  category_id: string
  created_at: string
  updated_at: string
}

/**
 * 知识版本接口定义
 */
export interface KnowledgeVersion {
  id: string
  knowledge_id: string
  content: string
  version: string
  created_at: string
  created_by: string
}

/**
 * 知识关联接口定义
 */
export interface KnowledgeRelation {
  id: string
  source_id: string
  target_id: string
  relation_type: string
  created_at: string
}

/**
 * 上传文件并获取测试用例
 * @param file 要上传的文件
 * @returns 生成的测试用例列表
 */
export const uploadFile = async (file: File): Promise<TestCase[]> => {
  // 创建FormData对象，用于发送文件
  const formData = new FormData()
  formData.append('file', file)

  // 发送POST请求到后端API
  // 注意：不要手动设置Content-Type，让axios自动处理
  // 这样axios会自动添加正确的boundary参数
  const response = await axios.post('/api/upload', formData)

  // 返回后端生成的测试用例
  return response.data.testCases
}

/**
 * 知识库相关API
 */

// 分类管理
export const createCategory = async (category: { name: string; parent_id: string | null; description: string }): Promise<Category> => {
  const response = await axios.post('/api/knowledge/categories', category)
  return response.data
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await axios.get('/api/knowledge/categories')
  return response.data
}

export const updateCategory = async (id: string, updates: { name?: string; parent_id?: string | null; description?: string }): Promise<Category> => {
  const response = await axios.put(`/api/knowledge/categories/${id}`, updates)
  return response.data
}

export const deleteCategory = async (id: string): Promise<any> => {
  const response = await axios.delete(`/api/knowledge/categories/${id}`)
  return response.data
}

// 知识条目管理
export const createKnowledgeItem = async (item: { title: string; content: string; type: string; category_id: string }): Promise<KnowledgeItem> => {
  const response = await axios.post('/api/knowledge/items', item)
  return response.data
}

export const getKnowledgeItems = async (category_id?: string): Promise<KnowledgeItem[]> => {
  const params = category_id ? { category_id } : {}
  const response = await axios.get('/api/knowledge/items', { params })
  return response.data
}

export const updateKnowledgeItem = async (id: string, updates: { title?: string; content?: string; type?: string; category_id?: string }): Promise<KnowledgeItem> => {
  const response = await axios.put(`/api/knowledge/items/${id}`, updates)
  return response.data
}

export const deleteKnowledgeItem = async (id: string): Promise<any> => {
  const response = await axios.delete(`/api/knowledge/items/${id}`)
  return response.data
}

export const getKnowledgeVersions = async (id: string): Promise<KnowledgeVersion[]> => {
  const response = await axios.get(`/api/knowledge/items/${id}/versions`)
  return response.data
}

// 知识关联管理
export const createKnowledgeRelation = async (relation: { source_id: string; target_id: string; relation_type: string }): Promise<KnowledgeRelation> => {
  const response = await axios.post('/api/knowledge/relations', relation)
  return response.data
}

// 知识库搜索
export const searchKnowledge = async (query: string): Promise<KnowledgeItem[]> => {
  const response = await axios.get('/api/knowledge/search', { params: { query } })
  return response.data
}

// 测试点管理
export interface TestPoint {
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
  review_status: string
  review_comments: string
  created_at: string
  updated_at: string
}

export const getTestPoints = async (requirement_id?: string): Promise<TestPoint[]> => {
  const params = requirement_id ? { requirement_id } : {}
  const response = await axios.get('/api/test-points', { params })
  return response.data
}

export const getTestPointById = async (id: string): Promise<TestPoint> => {
  const response = await axios.get(`/api/test-points/${id}`)
  return response.data
}

export const createTestPoint = async (testPoint: {
  requirement_id: string
  title: string
  description: string
  validation_target: string
  validation_content: string
  expected_result: string
  priority: string
  type: string
  status: string
}): Promise<TestPoint> => {
  const response = await axios.post('/api/test-points', testPoint)
  return response.data
}

export const updateTestPoint = async (id: string, updates: Partial<TestPoint>): Promise<TestPoint> => {
  const response = await axios.put(`/api/test-points/${id}`, updates)
  return response.data
}

export const deleteTestPoint = async (id: string): Promise<any> => {
  const response = await axios.delete(`/api/test-points/${id}`)
  return response.data
}

// 测试用例管理（更新接口）
export const getTestCasesByTestPoint = async (test_point_id: string): Promise<TestCase[]> => {
  const response = await axios.get(`/api/test-cases`, { params: { test_point_id } })
  return response.data
}

export const updateTestCase = async (id: string, updates: Partial<TestCase>): Promise<TestCase> => {
  const response = await axios.put(`/api/test-cases/${id}`, updates)
  return response.data
}

// 提示词模板相关接口定义
export interface PromptParameter {
  id: string
  name: string
  type: 'string' | 'number' | 'enum' | 'boolean'
  defaultValue: any
  required: boolean
  description: string
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
}

export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  parameters: PromptParameter[]
  category: string
  tags: string[]
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
  created_by: string
}

export interface PromptTemplateVersion {
  id: string
  template_id: string
  version: string
  content: string
  parameters: PromptParameter[]
  created_at: string
  created_by: string
  change_description: string
}

export interface ModelCallLog {
  id: string
  request_id: string
  user_id: string
  model_type: string
  prompt_template_id: string
  input_parameters: Record<string, any>
  full_prompt: string
  response: string
  status: 'success' | 'failed' | 'pending'
  error_message?: string
  duration: number
  created_at: string
  tags: string[]
}

export interface TestAssetGenerationTask {
  id: string
  user_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  type: 'test_point' | 'test_case'
  model: string
  input_data: any
  output_data: any
  progress: number
  error_message?: string
  created_at: string
  updated_at: string
}

// 提示词模板管理
export const createPromptTemplate = async (template: {
  name: string
  description: string
  content: string
  parameters: PromptParameter[]
  category: string
  tags: string[]
  created_by: string
}): Promise<PromptTemplate> => {
  const response = await axios.post('/api/prompt/templates', template)
  return response.data
}

export const getPromptTemplates = async (): Promise<PromptTemplate[]> => {
  const response = await axios.get('/api/prompt/templates')
  return response.data
}

export const getPromptTemplateById = async (id: string): Promise<PromptTemplate> => {
  const response = await axios.get(`/api/prompt/templates/${id}`)
  return response.data
}

export const updatePromptTemplate = async (id: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate> => {
  const response = await axios.put(`/api/prompt/templates/${id}`, updates)
  return response.data
}

export const deletePromptTemplate = async (id: string): Promise<any> => {
  const response = await axios.delete(`/api/prompt/templates/${id}`)
  return response.data
}

// 提示词模板版本管理
export const createPromptTemplateVersion = async (templateId: string, version: {
  version: string
  content: string
  parameters: PromptParameter[]
  created_by: string
  change_description: string
}): Promise<PromptTemplateVersion> => {
  const response = await axios.post(`/api/prompt/templates/${templateId}/versions`, version)
  return response.data
}

export const getPromptTemplateVersions = async (templateId: string): Promise<PromptTemplateVersion[]> => {
  const response = await axios.get(`/api/prompt/templates/${templateId}/versions`)
  return response.data
}

// 大模型调用日志管理
export const getModelCallLogs = async (filters?: {
  model_type?: string
  status?: string
  start_date?: string
  end_date?: string
}): Promise<ModelCallLog[]> => {
  const response = await axios.get('/api/prompt/logs', { params: filters })
  return response.data
}

export const getModelCallLogById = async (id: string): Promise<ModelCallLog> => {
  const response = await axios.get(`/api/prompt/logs/${id}`)
  return response.data
}

// 测试资产生成任务管理
export const createTestAssetGenerationTask = async (task: {
  user_id: string
  type: 'test_point' | 'test_case'
  model: string
  input_data: any
}): Promise<TestAssetGenerationTask> => {
  const response = await axios.post('/api/prompt/tasks', task)
  return response.data
}

export const getTestAssetGenerationTasks = async (status?: string): Promise<TestAssetGenerationTask[]> => {
  const params = status ? { status } : {}
  const response = await axios.get('/api/prompt/tasks', { params })
  return response.data
}

export const getTestAssetGenerationTaskById = async (id: string): Promise<TestAssetGenerationTask> => {
  const response = await axios.get(`/api/prompt/tasks/${id}`)
  return response.data
}

export const updateTestAssetGenerationTask = async (id: string, updates: Partial<TestAssetGenerationTask>): Promise<TestAssetGenerationTask> => {
  const response = await axios.put(`/api/prompt/tasks/${id}`, updates)
  return response.data
}

