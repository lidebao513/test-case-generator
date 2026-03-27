/**
 * 知识库控制器
 * 功能：处理知识库相关的请求
 */
import type { Request, Response } from 'express'
import * as db from '../utils/db'
import * as documentParser from '../services/documentParser'
import fs from 'fs'
import path from 'path'

/**
 * 分类管理
 */

/**
 * 创建分类
 * @param req 请求对象
 * @param res 响应对象
 */
export const createCategory = (req: Request, res: Response) => {
  try {
    const { name, parent_id, description } = req.body
    if (!name) {
      return res.status(400).json({ error: '分类名称不能为空' })
    }
    
    const category = db.createCategory({ name, parent_id, description })
    res.status(201).json(category)
  } catch (error) {
    console.error('创建分类失败:', error)
    res.status(500).json({ error: '创建分类失败' })
  }
}

/**
 * 获取所有分类
 * @param req 请求对象
 * @param res 响应对象
 */
export const getCategories = (req: Request, res: Response) => {
  try {
    const categories = db.getCategories()
    res.json(categories)
  } catch (error) {
    console.error('获取分类失败:', error)
    res.status(500).json({ error: '获取分类失败' })
  }
}

/**
 * 获取单个分类
 * @param req 请求对象
 * @param res 响应对象
 */
export const getCategoryById = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const category = db.getCategoryById(id)
    if (!category) {
      return res.status(404).json({ error: '分类不存在' })
    }
    res.json(category)
  } catch (error) {
    console.error('获取分类失败:', error)
    res.status(500).json({ error: '获取分类失败' })
  }
}

/**
 * 更新分类
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateCategory = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const category = db.updateCategory(id, updates)
    if (!category) {
      return res.status(404).json({ error: '分类不存在' })
    }
    res.json(category)
  } catch (error) {
    console.error('更新分类失败:', error)
    res.status(500).json({ error: '更新分类失败' })
  }
}

/**
 * 删除分类
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteCategory = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = db.deleteCategory(id)
    if (!success) {
      return res.status(404).json({ error: '分类不存在' })
    }
    res.json({ message: '分类删除成功' })
  } catch (error) {
    console.error('删除分类失败:', error)
    res.status(500).json({ error: '删除分类失败' })
  }
}

/**
 * 知识条目管理
 */

/**
 * 创建知识条目
 * @param req 请求对象
 * @param res 响应对象
 */
export const createKnowledgeItem = (req: Request, res: Response) => {
  try {
    const { title, content, type, category_id } = req.body
    if (!title || !content || !category_id) {
      return res.status(400).json({ error: '标题、内容和分类ID不能为空' })
    }
    
    const item = db.createKnowledgeItem({ title, content, type, category_id })
    res.status(201).json(item)
  } catch (error) {
    console.error('创建知识条目失败:', error)
    res.status(500).json({ error: '创建知识条目失败' })
  }
}

/**
 * 获取所有知识条目
 * @param req 请求对象
 * @param res 响应对象
 */
export const getKnowledgeItems = (req: Request, res: Response) => {
  try {
    const { category_id } = req.query
    let items
    if (category_id) {
      items = db.getKnowledgeItemsByCategory(category_id as string)
    } else {
      items = db.getKnowledgeItems()
    }
    res.json(items)
  } catch (error) {
    console.error('获取知识条目失败:', error)
    res.status(500).json({ error: '获取知识条目失败' })
  }
}

/**
 * 获取单个知识条目
 * @param req 请求对象
 * @param res 响应对象
 */
export const getKnowledgeItemById = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const item = db.getKnowledgeItemById(id)
    if (!item) {
      return res.status(404).json({ error: '知识条目不存在' })
    }
    res.json(item)
  } catch (error) {
    console.error('获取知识条目失败:', error)
    res.status(500).json({ error: '获取知识条目失败' })
  }
}

/**
 * 更新知识条目
 * @param req 请求对象
 * @param res 响应对象
 */
export const updateKnowledgeItem = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const item = db.updateKnowledgeItem(id, updates)
    if (!item) {
      return res.status(404).json({ error: '知识条目不存在' })
    }
    res.json(item)
  } catch (error) {
    console.error('更新知识条目失败:', error)
    res.status(500).json({ error: '更新知识条目失败' })
  }
}

/**
 * 删除知识条目
 * @param req 请求对象
 * @param res 响应对象
 */
export const deleteKnowledgeItem = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = db.deleteKnowledgeItem(id)
    if (!success) {
      return res.status(404).json({ error: '知识条目不存在' })
    }
    res.json({ message: '知识条目删除成功' })
  } catch (error) {
    console.error('删除知识条目失败:', error)
    res.status(500).json({ error: '删除知识条目失败' })
  }
}

/**
 * 获取知识条目版本
 * @param req 请求对象
 * @param res 响应对象
 */
export const getKnowledgeVersions = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const versions = db.getKnowledgeVersions(id)
    res.json(versions)
  } catch (error) {
    console.error('获取知识版本失败:', error)
    res.status(500).json({ error: '获取知识版本失败' })
  }
}

/**
 * 知识关联管理
 */

/**
 * 创建知识关联
 * @param req 请求对象
 * @param res 响应对象
 */
export const createKnowledgeRelation = (req: Request, res: Response) => {
  try {
    const { source_id, target_id, relation_type } = req.body
    if (!source_id || !target_id || !relation_type) {
      return res.status(400).json({ error: '源ID、目标ID和关联类型不能为空' })
    }
    
    const relation = db.createKnowledgeRelation({ source_id, target_id, relation_type })
    res.status(201).json(relation)
  } catch (error) {
    console.error('创建知识关联失败:', error)
    res.status(500).json({ error: '创建知识关联失败' })
  }
}

/**
 * 获取知识关联
 * @param req 请求对象
 * @param res 响应对象
 */
export const getKnowledgeRelations = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const relations = db.getKnowledgeRelations(id)
    res.json(relations)
  } catch (error) {
    console.error('获取知识关联失败:', error)
    res.status(500).json({ error: '获取知识关联失败' })
  }
}

/**
 * 知识库搜索
 */

/**
 * 搜索知识
 * @param req 请求对象
 * @param res 响应对象
 */
export const searchKnowledge = (req: Request, res: Response) => {
  try {
    const { query } = req.query
    if (!query) {
      return res.status(400).json({ error: '搜索关键词不能为空' })
    }
    
    const results = db.searchKnowledge(query as string)
    res.json(results)
  } catch (error) {
    console.error('搜索知识失败:', error)
    res.status(500).json({ error: '搜索知识失败' })
  }
}

/**
 * 文档导入
 * @param req 请求对象
 * @param res 响应对象
 */
export const importDocument = async (req: Request, res: Response) => {
  try {
    const { title, category_id, type } = req.body
    const file = (req as any).file
    
    if (!file) {
      return res.status(400).json({ error: '请上传文件' })
    }
    
    if (!title || !category_id || !type) {
      // 清理上传的文件
      fs.unlinkSync(file.path)
      return res.status(400).json({ error: '标题、分类和类型不能为空' })
    }
    
    // 解析文档内容
    let content = ''
    const fileExtension = path.extname(file.originalname).toLowerCase()
    
    try {
      switch (fileExtension) {
        case '.docx':
          content = await documentParser.extractTextFromDocx(file.path)
          break
        case '.pdf':
          content = await documentParser.extractTextFromPdf(file.path)
          break
        case '.txt':
          content = documentParser.extractTextFromTxt(file.path)
          break
        default:
          // 清理上传的文件
          fs.unlinkSync(file.path)
          return res.status(400).json({ error: '不支持的文件类型' })
      }
    } catch (parseError) {
      console.error('解析文档失败:', parseError)
      // 清理上传的文件
      fs.unlinkSync(file.path)
      return res.status(400).json({ error: '解析文档失败' })
    }
    
    // 清理上传的文件
    fs.unlinkSync(file.path)
    
    if (!content) {
      return res.status(400).json({ error: '文档内容为空' })
    }
    
    // 创建知识条目
    const item = db.createKnowledgeItem({ title, content, type, category_id })
    res.status(201).json(item)
  } catch (error) {
    console.error('导入文档失败:', error)
    // 尝试清理上传的文件
    if ((req as any).file) {
      try {
        fs.unlinkSync((req as any).file.path)
      } catch (unlinkError) {
        console.error('清理文件失败:', unlinkError)
      }
    }
    res.status(500).json({ error: '导入文档失败' })
  }
}
