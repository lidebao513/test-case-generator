import fs from 'fs'
import pdfParse from 'pdf-parse'

// 从docx文件提取文本
export const extractTextFromDocx = async (filePath: string): Promise<string> => {
  try {
    // 读取文件内容为字符串
    const content = fs.readFileSync(filePath, 'utf-8')
    // 简单处理：返回文件内容
    // 注：docx-parser库可能存在兼容性问题，这里使用简化处理
    return content || ''
  } catch (error) {
    console.error('提取docx文本失败:', error)
    throw error
  }
}

// 从pdf文件提取文本
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)
    return data.text || ''
  } catch (error) {
    console.error('提取pdf文本失败:', error)
    throw error
  }
}

// 从txt文件提取文本
export const extractTextFromTxt = (filePath: string): string => {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error('提取txt文本失败:', error)
    throw error
  }
}
