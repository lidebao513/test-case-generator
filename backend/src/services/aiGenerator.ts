/**
 * AI测试用例生成服务
 * 功能：使用多种大模型API分析需求文档并生成结构化测试用例
 */
import OpenAI from 'openai'
import dotenv from 'dotenv'
import * as db from '../utils/db'

// 加载环境变量
dotenv.config()

/**
 * 测试点接口定义
 */
export interface TestPoint {
  id: string           // 测试点ID
  requirement_id: string // 需求ID
  title: string        // 测试点标题
  description: string  // 测试点描述
  validation_target: string // 验证对象
  validation_content: string // 验证内容
  expected_result: string // 预期结果
  priority: string     // 优先级（P0/P1/P2）
  type: string         // 测试类型（功能测试/非功能测试/边界测试）
  status: string       // 状态（待实现/已实现/已验证）
  created_at: string   // 创建时间
  updated_at: string   // 更新时间
}

/**
 * 测试用例接口定义
 */
export interface TestCase {
  id: string           // 测试用例ID
  test_point_id: string // 关联的测试点ID
  title: string        // 测试用例标题
  type: string         // 测试类型（功能测试/异常测试/边界测试/回归测试）
  priority: string     // 优先级（P0/P1/P2）
  preconditions: string // 前置条件
  testData: string     // 测试数据
  steps: string[]      // 测试步骤
  expectedResult: string // 预期结果
  postconditions: string // 后置处理
  description: string  // 测试用例描述
  created_at: string   // 创建时间
  updated_at: string   // 更新时间
}



/**
 * 生成测试点
 * @param text 需求文档文本内容
 * @param model 使用的模型，可选值：'deepseek' 或 'qwen'
 * @returns 生成的测试点列表
 */
export const generateTestPoints = async (text: string, model: 'deepseek' | 'qwen' | 'openai' | 'ernie' = 'qwen'): Promise<TestPoint[]> => {
  const requestId = Date.now().toString()
  console.log(`使用模型: ${model} 生成测试点，请求ID: ${requestId}`)
  
  const startTime = Date.now()
  let status = 'success'
  let errorMessage = ''
  let prompt = ''
  
  try {
    // 检查文档长度，限制在10000字符以内
    let processedText = text
    if (text.length > 10000) {
      processedText = text.substring(0, 10000) + '...（文档已截断）'
      console.warn('文档过长，已截断至10000字符')
    }

    // 从知识库中检索相关内容
    const keywords = processedText
      .match(/\b\w{3,}\b/g)?.filter((word, index, self) => 
        self.indexOf(word) === index && 
        !['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'].includes(word)
      ) || []
    
    let relatedKnowledge = ''
    if (keywords.length > 0) {
      const searchQuery = keywords.slice(0, 5).join(' ')
      const results = db.searchKnowledge(searchQuery)
      
      if (results.length > 0) {
        relatedKnowledge = '## 相关知识库内容\n'
        results.slice(0, 3).forEach((item, index) => {
          relatedKnowledge += `### ${index + 1}. ${item.title}\n${item.content.substring(0, 500)}${item.content.length > 500 ? '...' : ''}\n\n`
        })
      }
    }

    // 构建AI提示词
    prompt = `
你是一位专业的测试工程师，请仔细分析以下需求文档和相关知识库内容，将其转化为结构化的测试点。

## 当前需求
${processedText}

${relatedKnowledge}

## 生成要求
1. 对需求进行逐点分析，提取关键功能点、非功能需求、业务规则及边界条件
2. 将每个需求点转化为具有明确验证目标的测试点
3. 每个测试点应包含：
   - id: 测试点ID（格式：TP-XXX-001，其中XXX为功能模块缩写）
   - requirement_id: 需求ID（使用当前时间戳）
   - title: 测试点标题
   - description: 测试点描述
   - validation_target: 验证对象
   - validation_content: 验证内容
   - expected_result: 预期结果
   - priority: 优先级（P0/P1/P2，根据功能重要性确定）
   - type: 测试类型（功能测试/非功能测试/边界测试）
   - status: 状态（待实现）
4. 确保测试点覆盖所有功能点和场景
5. 生成的测试点应具有明确的验证目标和可测试性

请以JSON格式返回测试点列表，格式如下：
{
  "testPoints": [
    {
      "id": "TP-XXX-001",
      "requirement_id": "${Date.now()}",
      "title": "测试点标题",
      "description": "测试点描述",
      "validation_target": "验证对象",
      "validation_content": "验证内容",
      "expected_result": "预期结果",
      "priority": "P0",
      "type": "功能测试",
      "status": "待实现"
    }
  ]
}

重要：请生成尽可能全面、细致的测试点，确保覆盖所有功能点和场景，并参考知识库中的相关内容。
    `

    // 定义一个函数来调用DeepSeek API
    const callDeepSeekAPI = async () => {
      console.log('调用DeepSeek API生成测试点')
      
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
              content: '你是一个专业的测试点生成器，擅长分析需求文档并生成高质量的测试点。'
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
        return result.testPoints || []
      } catch (deepseekError) {
        console.error('DeepSeek API调用失败:', deepseekError)
        throw new Error('DeepSeek API调用失败')
      }
    }
    
    // 定义一个函数来调用OpenAI API
    const callOpenAIAPI = async () => {
      console.log('调用OpenAI API生成测试点')
      
      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API密钥未配置')
        }
        
        const openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
        })
        
        const response = await openaiClient.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的测试点生成器，擅长分析需求文档并生成高质量的测试点。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
        
        console.log('OpenAI API调用成功')
        
        // 解析响应
        const content = response.choices[0].message.content || '{}'
        console.log('OpenAI API响应内容:', content.substring(0, 100) + '...')
        const result = JSON.parse(content)
        return result.testPoints || []
      } catch (openaiError) {
        console.error('OpenAI API调用失败:', openaiError)
        throw new Error('OpenAI API调用失败')
      }
    }
    
    // 定义一个函数来调用ERNIE API
    const callErnieAPI = async () => {
      console.log('调用ERNIE API生成测试点')
      
      try {
        if (!process.env.ERNIE_API_KEY) {
          throw new Error('ERNIE API密钥未配置')
        }
        
        const ernieClient = new OpenAI({
          apiKey: process.env.ERNIE_API_KEY,
          baseURL: process.env.ERNIE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
        })
        
        const response = await ernieClient.chat.completions.create({
          model: process.env.ERNIE_MODEL || 'ernie-4.0',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的测试点生成器，擅长分析需求文档并生成高质量的测试点。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        })
        
        console.log('ERNIE API调用成功')
        
        // 解析响应
        const content = response.choices[0].message.content || '{}'
        console.log('ERNIE API响应内容:', content.substring(0, 100) + '...')
        const result = JSON.parse(content)
        return result.testPoints || []
      } catch (ernieError) {
        console.error('ERNIE API调用失败:', ernieError)
        throw new Error('ERNIE API调用失败')
      }
    }
    
    // 根据模型类型调用不同的API
    let testPoints: TestPoint[] = []
    switch (model) {
      case 'qwen':
        console.log('尝试使用千问模型生成测试点')
        try {
          // 检查千问API密钥是否存在
          if (!process.env.QWEN_API_KEY) {
            throw new Error('千问API密钥未配置')
          }
          
          console.log('调用qwen API生成测试点')
          
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
                content: '你是一个专业的测试点生成器，擅长分析需求文档并生成高质量的测试点。'
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
          testPoints = result.testPoints || []
        } catch (qwenError) {
          console.error('千问API调用失败:', qwenError)
          console.log('千问API失败，切换到DeepSeek API')
          // 调用DeepSeek作为备用
          testPoints = await callDeepSeekAPI()
        }
        break
      case 'openai':
        try {
          testPoints = await callOpenAIAPI()
        } catch {
          console.error('OpenAI API调用失败，切换到DeepSeek API')
          testPoints = await callDeepSeekAPI()
        }
        break
      case 'ernie':
        try {
          testPoints = await callErnieAPI()
        } catch {
          console.error('ERNIE API调用失败，切换到DeepSeek API')
          testPoints = await callDeepSeekAPI()
        }
        break
      default:
        // 直接调用DeepSeek API
        testPoints = await callDeepSeekAPI()
        break
    }
    
    // 为每个测试点添加时间戳
    const timestamp = new Date().toISOString()
    const finalTestPoints = testPoints.map(point => ({
      ...point,
      created_at: timestamp,
      updated_at: timestamp
    }))
    
    return finalTestPoints
  } catch (error) {
    console.error('生成测试点失败:', error)
    status = 'failed'
    errorMessage = (error as Error).message
    
    // 错误处理：返回基于文档内容的通用测试点
    const timestamp = new Date().toISOString()
    return [
      {
        id: 'TP-001',
        requirement_id: Date.now().toString(),
        title: '核心功能测试',
        description: '验证系统核心功能是否正常工作',
        validation_target: '系统核心功能',
        validation_content: '核心功能的基本操作流程',
        expected_result: '功能执行成功，结果符合预期',
        priority: 'P0',
        type: '功能测试',
        status: '待实现',
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 'TP-002',
        requirement_id: Date.now().toString(),
        title: '边界条件测试',
        description: '测试系统在边界条件下的表现',
        validation_target: '系统边界处理',
        validation_content: '各种边界条件的处理情况',
        expected_result: '系统能够正确处理边界条件',
        priority: 'P1',
        type: '边界测试',
        status: '待实现',
        created_at: timestamp,
        updated_at: timestamp
      }
    ]
  } finally {
    const duration = Date.now() - startTime
    
    // 记录大模型调用日志
    db.createModelCallLog({
      request_id: requestId,
      user_id: 'system',
      model_type: model,
      prompt_template_id: 'test-point-generator',
      input_parameters: {
        text_length: text.length,
        model: model
      },
      full_prompt: prompt,
      response: status === 'success' ? '测试点生成成功' : errorMessage,
      status: status as 'success' | 'failed' | 'pending',
      error_message: errorMessage,
      duration: duration,
      tags: ['test-point-generation']
    })
  }
}

/**
 * 生成测试用例
 * @param text 需求文档文本内容
 * @param model 使用的模型，可选值：'deepseek' 或 'qwen'
 * @returns 生成的测试用例列表
 */
export const generateTestCases = async (text: string, model: 'deepseek' | 'qwen' | 'openai' | 'ernie' = 'qwen'): Promise<TestCase[]> => {
  const requestId = Date.now().toString()
  console.log(`使用模型: ${model} 生成测试用例，请求ID: ${requestId}`)
  
  const startTime = Date.now()
  let status = 'success'
  let errorMessage = ''
  
  try {
    // 第一步：生成测试点
    console.log('开始生成测试点...')
    const testPoints = await generateTestPoints(text, model)
    console.log(`生成了 ${testPoints.length} 个测试点`)
    
    // 保存测试点到数据库
    testPoints.forEach(testPoint => {
      db.createTestPoint({
        requirement_id: testPoint.requirement_id,
        title: testPoint.title,
        description: testPoint.description,
        validation_target: testPoint.validation_target,
        validation_content: testPoint.validation_content,
        expected_result: testPoint.expected_result,
        priority: testPoint.priority,
        type: testPoint.type,
        status: testPoint.status
      })
    })

    // 第二步：基于测试点生成测试用例
    console.log('开始基于测试点生成测试用例...')
    let allTestCases: TestCase[] = []
    
    for (const testPoint of testPoints) {
      console.log(`为测试点 ${testPoint.title} 生成测试用例...`)
      
      // 构建AI提示词
      const prompt = `
你是一位专业的测试工程师，请基于以下测试点生成详细的测试用例。

## 测试点信息
- 测试点ID: ${testPoint.id}
- 测试点标题: ${testPoint.title}
- 测试点描述: ${testPoint.description}
- 验证对象: ${testPoint.validation_target}
- 验证内容: ${testPoint.validation_content}
- 预期结果: ${testPoint.expected_result}
- 优先级: ${testPoint.priority}
- 测试类型: ${testPoint.type}

## 生成要求
1. 基于测试点生成至少3个测试用例：
   - 1个正常场景测试用例
   - 1个异常场景测试用例
   - 1个边界场景测试用例
2. 测试用例应包含：
   - id: 测试用例ID（格式：TC-${testPoint.id.split('-')[1]}-001）
   - test_point_id: 关联的测试点ID（${testPoint.id}）
   - title: 测试用例标题（必须与测试点相关）
   - type: 测试类型（功能测试/异常测试/边界测试/回归测试）
   - priority: 优先级（P0/P1/P2，与测试点一致）
   - preconditions: 前置条件（详细描述测试前需要满足的条件）
   - testData: 测试数据（使用真实、具体的值）
   - steps: 测试步骤数组（每个步骤都是用户可执行的具体操作）
   - expectedResult: 预期结果（详细描述具体的页面变化、数据变化）
   - postconditions: 后置处理（测试完成后需要执行的操作）
   - description: 测试用例描述（与测试点的关联性）
3. 测试用例应具有可执行性，步骤清晰，预期结果明确

请以JSON格式返回测试用例列表，格式如下：
{
  "testCases": [
    {
      "id": "TC-XXX-001",
      "test_point_id": "${testPoint.id}",
      "title": "测试用例标题",
      "type": "功能测试",
      "priority": "${testPoint.priority}",
      "preconditions": "前置条件",
      "testData": "测试数据",
      "steps": ["步骤1", "步骤2", "步骤3"],
      "expectedResult": "预期结果",
      "postconditions": "后置处理",
      "description": "测试用例描述"
    }
  ]
}

重要：请生成尽可能全面、细致的测试用例，确保覆盖测试点的所有场景。
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
                content: '你是一个专业的测试用例生成器，擅长基于测试点生成高质量的测试用例。'
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
      
      // 定义一个函数来调用OpenAI API
      const callOpenAIAPI = async () => {
        console.log('调用OpenAI API生成测试用例')
        
        try {
          if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API密钥未配置')
          }
          
          const openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
          })
          
          const response = await openaiClient.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: [
              {
                role: 'system',
                content: '你是一个专业的测试用例生成器，擅长基于测试点生成高质量的测试用例。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            response_format: { type: 'json_object' }
          })
          
          console.log('OpenAI API调用成功')
          
          // 解析响应
          const content = response.choices[0].message.content || '{}'
          console.log('OpenAI API响应内容:', content.substring(0, 100) + '...')
          const result = JSON.parse(content)
          return result.testCases || []
        } catch (openaiError) {
          console.error('OpenAI API调用失败:', openaiError)
          throw new Error('OpenAI API调用失败')
        }
      }
      
      // 定义一个函数来调用ERNIE API
      const callErnieAPI = async () => {
        console.log('调用ERNIE API生成测试用例')
        
        try {
          if (!process.env.ERNIE_API_KEY) {
            throw new Error('ERNIE API密钥未配置')
          }
          
          const ernieClient = new OpenAI({
            apiKey: process.env.ERNIE_API_KEY,
            baseURL: process.env.ERNIE_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
          })
          
          const response = await ernieClient.chat.completions.create({
            model: process.env.ERNIE_MODEL || 'ernie-4.0',
            messages: [
              {
                role: 'system',
                content: '你是一个专业的测试用例生成器，擅长基于测试点生成高质量的测试用例。'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            response_format: { type: 'json_object' }
          })
          
          console.log('ERNIE API调用成功')
          
          // 解析响应
          const content = response.choices[0].message.content || '{}'
          console.log('ERNIE API响应内容:', content.substring(0, 100) + '...')
          const result = JSON.parse(content)
          return result.testCases || []
        } catch (ernieError) {
          console.error('ERNIE API调用失败:', ernieError)
          throw new Error('ERNIE API调用失败')
        }
      }
      
      // 根据模型类型调用不同的API
      let testCases: any[] = []
      switch (model) {
        case 'qwen':
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
                  content: '你是一个专业的测试用例生成器，擅长基于测试点生成高质量的测试用例。'
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
            testCases = result.testCases || []
          } catch (qwenError) {
            console.error('千问API调用失败:', qwenError)
            console.log('千问API失败，切换到DeepSeek API')
            // 调用DeepSeek作为备用
            testCases = await callDeepSeekAPI()
          }
          break
        case 'openai':
          try {
            testCases = await callOpenAIAPI()
          } catch {
            console.error('OpenAI API调用失败，切换到DeepSeek API')
            testCases = await callDeepSeekAPI()
          }
          break
        case 'ernie':
          try {
            testCases = await callErnieAPI()
          } catch {
            console.error('ERNIE API调用失败，切换到DeepSeek API')
            testCases = await callDeepSeekAPI()
          }
          break
        default:
          // 直接调用DeepSeek API
          testCases = await callDeepSeekAPI()
          break
      }
      
      // 保存测试用例到数据库并添加到结果列表
      testCases.forEach(testCase => {
        const newTestCase = db.createTestCase({
          test_point_id: testPoint.id,
          title: testCase.title,
          type: testCase.type || '功能测试',
          priority: testCase.priority || testPoint.priority,
          preconditions: testCase.preconditions || '',
          testData: testCase.testData || '',
          steps: testCase.steps || [],
          expectedResult: testCase.expectedResult || '',
          postconditions: testCase.postconditions || '',
          description: testCase.description || ''
        })
        allTestCases.push(newTestCase)
      })
    }
    
    console.log(`总共生成了 ${allTestCases.length} 个测试用例`)
    return allTestCases
  } catch (error) {
    console.error('生成测试用例失败:', error)
    status = 'failed'
    errorMessage = (error as Error).message
    
    // 生成默认测试点
    const defaultTestPoint = {
      id: 'TP-001',
      requirement_id: Date.now().toString(),
      title: '核心功能测试',
      description: '验证系统核心功能是否正常工作',
      validation_target: '系统核心功能',
      validation_content: '核心功能的基本操作流程',
      expected_result: '功能执行成功，结果符合预期',
      priority: 'P0',
      type: '功能测试',
      status: '待实现'
    }
    
    // 保存默认测试点
    db.createTestPoint(defaultTestPoint)
    
    // 基于需求文档内容生成更相关的测试用例
    if (text.includes('登录')) {
      const timestamp = new Date().toISOString()
      return [
        {
          id: 'TC-001',
          test_point_id: defaultTestPoint.id,
          title: '正确账号密码登录',
          type: '功能测试',
          priority: 'P0',
          preconditions: '系统已部署并运行',
          testData: '账号: admin, 密码: 123456',
          steps: [
            '打开登录页面',
            '输入正确的账号',
            '输入正确的密码',
            '点击登录按钮'
          ],
          expectedResult: '登录成功，跳转至首页',
          postconditions: '无',
          description: '验证使用正确的账号和密码能够成功登录',
          created_at: timestamp,
          updated_at: timestamp
        },
        {
          id: 'TC-002',
          test_point_id: defaultTestPoint.id,
          title: '错误密码登录',
          type: '异常测试',
          priority: 'P0',
          preconditions: '系统已部署并运行',
          testData: '账号: admin, 密码: wrongpassword',
          steps: [
            '打开登录页面',
            '输入正确的账号',
            '输入错误的密码',
            '点击登录按钮'
          ],
          expectedResult: '提示"账号或密码错误"',
          postconditions: '无',
          description: '验证使用错误的密码登录会失败',
          created_at: timestamp,
          updated_at: timestamp
        }
      ]
    }
    
    // 错误处理：返回基于文档内容的通用测试用例
    const timestamp = new Date().toISOString()
    return [
      {
        id: 'TC-001',
        test_point_id: defaultTestPoint.id,
        title: '功能测试',
        type: '功能测试',
        priority: 'P0',
        preconditions: '系统已部署并运行',
        testData: '无',
        steps: [
          '打开系统',
          '执行核心操作',
          '验证结果'
        ],
        expectedResult: '功能执行成功，结果符合预期',
        postconditions: '无',
        description: '验证系统核心功能是否正常工作',
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 'TC-002',
        test_point_id: defaultTestPoint.id,
        title: '边界测试',
        type: '边界测试',
        priority: 'P1',
        preconditions: '系统已部署并运行',
        testData: '边界条件数据',
        steps: [
          '准备边界条件数据',
          '执行操作',
          '验证结果'
        ],
        expectedResult: '系统能够正确处理边界条件',
        postconditions: '无',
        description: '测试系统在边界条件下的表现',
        created_at: timestamp,
        updated_at: timestamp
      }
    ]
  } finally {
    const duration = Date.now() - startTime
    
    // 记录大模型调用日志
    db.createModelCallLog({
      request_id: requestId,
      user_id: 'system',
      model_type: model,
      prompt_template_id: 'test-case-generator',
      input_parameters: {
        text_length: text.length,
        model: model
      },
      full_prompt: '基于测试点生成测试用例',
      response: status === 'success' ? '测试用例生成成功' : errorMessage,
      status: status as 'success' | 'failed' | 'pending',
      error_message: errorMessage,
      duration: duration,
      tags: ['test-case-generation']
    })
  }
}
