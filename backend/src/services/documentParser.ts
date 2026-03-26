/**
 * 文档解析服务
 * 功能：从不同类型的文档中提取文本内容
 * 支持格式：.docx、.pdf、.txt
 */
import fs from 'fs'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

/**
 * 从docx文件提取文本
 * @param filePath 文件路径
 * @returns 提取的文本内容
 */
export const extractTextFromDocx = async (filePath: string): Promise<string> => {
  try {
    // 尝试使用mammoth库解析docx文件
    try {
      const result = await mammoth.extractRawText({ path: filePath })
      const text = result.value.trim() || ''
      console.log('提取的docx文本长度:', text.length)
      console.log('提取的docx文本前500字符:', text.substring(0, 500))
      return text
    } catch (mammothError) {
      console.warn('mammoth解析失败，尝试备用方法:', mammothError)
      // 备用方法：使用简单的文件读取
      const content = fs.readFileSync(filePath)
      const text = content.toString('utf-8').replace(/[\x00-\x1F\x7F]/g, '').trim() || ''
      console.log('备用方法提取的文本长度:', text.length)
      return text
    }
  } catch (error) {
    console.error('提取docx文本失败:', error)
    throw error
  }
}

/**
 * 从pdf文件提取文本
 * @param filePath 文件路径
 * @returns 提取的文本内容
 */
export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    // 读取文件为二进制缓冲区
    const dataBuffer = fs.readFileSync(filePath)
    // 使用pdf-parse解析文档
    const data = await pdfParse(dataBuffer)
    return data.text || ''
  } catch (error) {
    console.error('提取pdf文本失败:', error)
    throw error
  }
}

/**
 * 从txt文件提取文本
 * @param filePath 文件路径
 * @returns 提取的文本内容
 */
export const extractTextFromTxt = (filePath: string): string => {
  try {
    // 直接读取txt文件内容
    return fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error('提取txt文本失败:', error)
    throw error
  }
}
