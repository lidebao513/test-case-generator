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
