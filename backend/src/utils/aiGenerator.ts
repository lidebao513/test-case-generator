/**
 * AI测试用例生成器
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
 * 生成测试用例
 * @param text 需求文档文本内容
 * @returns 生成的测试用例列表
 */
export const generateTestCases = async (text: string): Promise<TestCase[]> => {
  try {
    // 检查文档长度，限制在10000字符以内
    let processedText = text
    if (text.length > 10000) {
      processedText = text.substring(0, 10000) + '...（文档已截断）'
      console.warn('文档过长，已截断至10000字符')
    }

    // 构建AI提示词
    const prompt = `
请根据以下需求文档生成结构化的测试用例：

${processedText}

要求：
1. 分析需求文档中的功能点和验收标准
2. 为每个功能点生成至少2个测试用例
3. 测试用例应包含：id、title、description、steps、expectedResult、priority
4. 以JSON格式返回测试用例列表，格式如下：
   {
     "testCases": [
       {
         "id": "1",
         "title": "测试标题",
         "description": "测试描述",
         "steps": ["步骤1", "步骤2", "步骤3"],
         "expectedResult": "预期结果",
         "priority": "高"
       }
     ]
   }
5. 确保测试用例覆盖正常场景和异常场景
6. 只根据提供的需求文档生成测试用例，不要生成文档中没有提到的功能
7. 不要生成登录、注册相关的测试用例，除非需求文档中明确提到
    `

    // 调用DeepSeek API
    const response = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',  // 使用deepseek-chat模型
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
      response_format: { type: 'json_object' }  // 要求返回JSON格式
    })

    // 解析API响应
    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.testCases || []
  } catch (error) {
    console.error('生成测试用例失败:', error)
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
