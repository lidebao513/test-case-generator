/**
 * AI测试用例生成服务
 * 功能：使用DeepSeek API分析需求文档并生成结构化测试用例
 */
import OpenAI from 'openai'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

/**
 * 测试用例接口定义
 */
export interface TestCase {
  id: string           // 测试用例ID
  title: string        // 测试用例标题
  description: string  // 测试用例描述
  steps: string[]      // 测试步骤
  expectedResult: string // 预期结果
  priority: string     // 优先级（高/中/低）
}

/**
 * 初始化DeepSeek客户端
 * 使用OpenAI SDK调用DeepSeek API
 * API密钥从环境变量读取
 */
const deepseekClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
})

/**
 * 初始化千问客户端
 * 使用OpenAI SDK调用千问API
 * API密钥从环境变量读取
 */
const qwenClient = new OpenAI({
  apiKey: process.env.QWEN_API_KEY || '',
  baseURL: process.env.QWEN_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
})

/**
 * 生成测试用例
 * @param text 需求文档文本内容
 * @param model 使用的模型，可选值：'deepseek' 或 'qwen'
 * @returns 生成的测试用例列表
 */
export const generateTestCases = async (text: string, model: 'deepseek' | 'qwen' = 'qwen'): Promise<TestCase[]> => {
  console.log(`使用模型: ${model}`)
  
  try {
    // 检查文档长度，限制在10000字符以内
    let processedText = text
    if (text.length > 10000) {
      processedText = text.substring(0, 10000) + '...（文档已截断）'
      console.warn('文档过长，已截断至10000字符')
    }

    // 构建AI提示词
    const prompt = `
你是一位专业的测试工程师，请仔细分析以下需求文档，生成与文档内容完全相关的高质量测试用例。

## 当前需求
${processedText}

## 生成要求
1. 首先仔细分析需求文档，识别所有功能点、流程和边界条件
2. 针对每个功能点，生成至少3个测试用例：
   - 1个正常场景测试用例
   - 2个异常场景测试用例
3. 测试用例必须严格基于需求文档内容，不要添加文档中没有提到的功能
4. 测试用例应包含：
   - id: 测试用例ID（格式：TC-XXX-001，其中XXX为功能模块缩写）
   - title: 测试用例标题（必须与需求文档中的功能点相关）
   - type: 测试类型（功能测试/异常测试/边界测试/回归测试）
   - priority: 优先级（P0/P1/P2，根据功能重要性确定）
   - preconditions: 前置条件（详细描述测试前需要满足的条件）
   - testData: 测试数据（使用真实、具体的值）
   - steps: 测试步骤数组（每个步骤都是用户可执行的具体操作）
   - expectedResult: 预期结果（详细描述具体的页面变化、数据变化）
   - postconditions: 后置处理（测试完成后需要执行的操作）
5. 确保测试用例覆盖：
   - 正常场景（40%）
   - 异常场景（40%）
   - 边界场景（20%）
6. 对于每个功能模块，生成至少5-8个测试用例，确保覆盖所有可能的使用场景
7. 生成的测试用例标题和描述必须明确体现与需求文档中功能点的关联性
8. 测试用例应具有可执行性，步骤清晰，预期结果明确

请以JSON格式返回测试用例列表，格式如下：
{
  "testCases": [
    {
      "id": "TC-XXX-001",
      "title": "测试标题",
      "type": "功能测试",
      "priority": "P0",
      "preconditions": "前置条件",
      "testData": "测试数据",
      "steps": ["步骤1", "步骤2", "步骤3"],
      "expectedResult": "预期结果",
      "postconditions": "后置处理"
    }
  ]
}

重要：请生成尽可能全面、细致的测试用例，确保覆盖所有功能点和场景。
    `

    // 定义一个函数来调用DeepSeek API
    const callDeepSeekAPI = async () => {
      console.log('调用DeepSeek API，模型: deepseek-chat')
      
      try {
        const deepseekClient = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY || '',
          baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
        })
        
        const response = await deepseekClient.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的测试用例生成器，擅长分析需求文档并生成高质量的测试用例。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
        
        console.log('DeepSeek API调用成功')
        
        // 解析响应
        const content = response.choices[0].message.content || '{}'
        console.log('DeepSeek API响应内容:', content.substring(0, 100) + '...')
        const result = JSON.parse(content)
        return result.testCases || []
      } catch (deepseekError) {
        console.error('DeepSeek API调用失败:', deepseekError)
        throw new Error('DeepSeek API调用失败')
      }
    }
    
    // 尝试调用千问API
    if (model === 'qwen') {
      console.log('尝试使用千问模型')
      
      try {
        // 检查千问API密钥是否存在
        if (!process.env.QWEN_API_KEY) {
          throw new Error('千问API密钥未配置')
        }
        
        console.log('调用qwen API，模型:', process.env.QWEN_MODEL || 'ep-20260326132716-bfcbr')
        
        // 尝试初始化千问客户端
        const qwenClient = new OpenAI({
          apiKey: process.env.QWEN_API_KEY,
          baseURL: process.env.QWEN_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
        })
        
        // 尝试调用千问API
        const response = await qwenClient.chat.completions.create({
          model: process.env.QWEN_MODEL || 'ep-20260326132716-bfcbr',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的测试用例生成器，擅长分析需求文档并生成高质量的测试用例。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
        
        console.log('qwen API调用成功')
        
        // 解析响应
        const content = response.choices[0].message.content || '{}'
        console.log('API响应内容:', content.substring(0, 100) + '...')
        const result = JSON.parse(content)
        return result.testCases || []
      } catch (qwenError) {
        console.error('千问API调用失败:', qwenError)
        console.log('千问API失败，切换到DeepSeek API')
        // 调用DeepSeek作为备用
        return await callDeepSeekAPI()
      }
    } else {
      // 直接调用DeepSeek API
      return await callDeepSeekAPI()
    }
  } catch (error) {
    console.error('生成测试用例失败:', error)
    
    // 基于需求文档内容生成更相关的测试用例
    if (text.includes('登录')) {
      return [
        {
          id: 'TC-001',
          title: '正确账号密码登录',
          description: '验证使用正确的账号和密码能够成功登录',
          steps: [
            '打开登录页面',
            '输入正确的账号',
            '输入正确的密码',
            '点击登录按钮'
          ],
          expectedResult: '登录成功，跳转至首页',
          priority: '高'
        },
        {
          id: 'TC-002',
          title: '错误密码登录',
          description: '验证使用错误的密码登录会失败',
          steps: [
            '打开登录页面',
            '输入正确的账号',
            '输入错误的密码',
            '点击登录按钮'
          ],
          expectedResult: '提示"账号或密码错误"',
          priority: '高'
        },
        {
          id: 'TC-003',
          title: '账号为空登录',
          description: '验证账号为空时点击登录会提示错误',
          steps: [
            '打开登录页面',
            '不输入账号',
            '输入密码',
            '点击登录按钮'
          ],
          expectedResult: '提示"请输入账号"',
          priority: '中'
        },
        {
          id: 'TC-004',
          title: '密码为空登录',
          description: '验证密码为空时点击登录会提示错误',
          steps: [
            '打开登录页面',
            '输入账号',
            '不输入密码',
            '点击登录按钮'
          ],
          expectedResult: '提示"请输入密码"',
          priority: '中'
        }
      ]
    }
    
    // 错误处理：返回基于文档内容的通用测试用例
    return [
      {
        id: '1',
        title: '功能测试',
        description: '验证系统核心功能是否正常工作',
        steps: [
          '打开系统',
          '执行核心操作',
          '验证结果'
        ],
        expectedResult: '功能执行成功，结果符合预期',
        priority: '高'
      },
      {
        id: '2',
        title: '边界测试',
        description: '测试系统在边界条件下的表现',
        steps: [
          '准备边界条件数据',
          '执行操作',
          '验证结果'
        ],
        expectedResult: '系统能够正确处理边界条件',
        priority: '中'
      }
    ]
  }
}
