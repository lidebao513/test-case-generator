// 类型声明文件

// 声明pdf-parse模块
declare module 'pdf-parse' {
  interface PDFData {
    text: string
    info: any
    metadata: any
    version: string
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>
  export default pdfParse
}

// 声明docx-parser模块
declare module 'docx-parser' {
  interface DocxResult {
    text: string
    [key: string]: any
  }

  const docxParser: {
    parseBuffer(content: string): Promise<DocxResult>
    [key: string]: any
  }

  export default docxParser
}

// 提示词模板接口
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

// 提示词参数接口
export interface PromptParameter {
  id: string
  name: string
  type: 'string' | 'number' | 'enum' | 'boolean'
  defaultValue: any
  required: boolean
  description: string
  options?: string[] // 用于enum类型
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
}

// 提示词模板版本接口
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

// 大模型调用日志接口
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

// 测试资产生成任务接口
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
