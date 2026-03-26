/**
 * 测试用例控制器
 * 功能：处理文件上传和测试用例生成请求
 */
import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { extractTextFromDocx, extractTextFromPdf, extractTextFromTxt } from '../services/documentParser'
import { generateTestCases } from '../services/aiGenerator'

/**
 * 处理文件上传
 * @param req 请求对象，包含上传的文件
 * @param res 响应对象，返回生成的测试用例
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    // 检查是否有文件上传
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' })
    }

    let text = ''
    const ext = path.extname(req.file.originalname) // 获取文件扩展名

    // 根据文件类型提取文本
    switch (ext) {
      case '.docx':
        text = await extractTextFromDocx(req.file.path)
        break
      case '.pdf':
        text = await extractTextFromPdf(req.file.path)
        break
      case '.txt':
        text = await extractTextFromTxt(req.file.path)
        break
      default:
        return res.status(400).json({ error: '不支持的文件类型' })
    }

    // 清理上传的临时文件
    fs.unlinkSync(req.file.path)

    // 调用AI生成测试用例，使用千问模型
    const testCases = await generateTestCases(text, 'qwen')

    // 返回生成的测试用例
    res.json({ testCases })
  } catch (error) {
    console.error('上传失败:', error)
    res.status(500).json({ error: '处理文件时出错' })
  }
}
