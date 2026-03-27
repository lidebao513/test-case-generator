/**
 * 提示词模板控制器
 * 功能：处理提示词模板的CRUD操作
 */
import { Request, Response } from 'express'
import * as db from '../utils/db'

// 创建提示词模板
export const createPromptTemplate = (req: Request, res: Response) => {
  try {
    const template = req.body
    const newTemplate = db.createPromptTemplate(template)
    res.status(201).json(newTemplate)
  } catch {
    res.status(500).json({ error: '创建提示词模板失败' })
  }
}

// 获取提示词模板列表
export const getPromptTemplates = (req: Request, res: Response) => {
  try {
    const templates = db.getPromptTemplates()
    res.status(200).json(templates)
  } catch {
    res.status(500).json({ error: '获取提示词模板列表失败' })
  }
}

// 获取单个提示词模板
export const getPromptTemplateById = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const template = db.getPromptTemplateById(id)
    if (template) {
      res.status(200).json(template)
    } else {
      res.status(404).json({ error: '提示词模板不存在' })
    }
  } catch {
    res.status(500).json({ error: '获取提示词模板失败' })
  }
}

// 更新提示词模板
export const updatePromptTemplate = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const updatedTemplate = db.updatePromptTemplate(id, updates)
    if (updatedTemplate) {
      res.status(200).json(updatedTemplate)
    } else {
      res.status(404).json({ error: '提示词模板不存在' })
    }
  } catch {
    res.status(500).json({ error: '更新提示词模板失败' })
  }
}

// 删除提示词模板
export const deletePromptTemplate = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const success = db.deletePromptTemplate(id)
    if (success) {
      res.status(200).json({ message: '提示词模板已归档' })
    } else {
      res.status(404).json({ error: '提示词模板不存在' })
    }
  } catch {
    res.status(500).json({ error: '删除提示词模板失败' })
  }
}

// 创建提示词模板版本
export const createPromptTemplateVersion = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const versionData = req.body
    const version = db.createPromptTemplateVersion({
      ...versionData,
      template_id: id
    })
    res.status(201).json(version)
  } catch {
    res.status(500).json({ error: '创建提示词模板版本失败' })
  }
}

// 获取提示词模板版本列表
export const getPromptTemplateVersions = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const versions = db.getPromptTemplateVersions(id)
    res.status(200).json(versions)
  } catch {
    res.status(500).json({ error: '获取提示词模板版本列表失败' })
  }
}

// 获取大模型调用日志列表
export const getModelCallLogs = (req: Request, res: Response) => {
  try {
    const filters = req.query
    const logs = db.getModelCallLogs(filters)
    res.status(200).json(logs)
  } catch {
    res.status(500).json({ error: '获取大模型调用日志列表失败' })
  }
}

// 获取单个大模型调用日志
export const getModelCallLogById = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const log = db.getModelCallLogById(id)
    if (log) {
      res.status(200).json(log)
    } else {
      res.status(404).json({ error: '大模型调用日志不存在' })
    }
  } catch {
    res.status(500).json({ error: '获取大模型调用日志失败' })
  }
}

// 创建测试资产生成任务
export const createTestAssetGenerationTask = (req: Request, res: Response) => {
  try {
    const taskData = req.body
    const task = db.createTestAssetGenerationTask(taskData)
    res.status(201).json(task)
  } catch {
    res.status(500).json({ error: '创建测试资产生成任务失败' })
  }
}

// 获取测试资产生成任务列表
export const getTestAssetGenerationTasks = (req: Request, res: Response) => {
  try {
    const { status } = req.query
    const tasks = db.getTestAssetGenerationTasks(status as string)
    res.status(200).json(tasks)
  } catch {
    res.status(500).json({ error: '获取测试资产生成任务列表失败' })
  }
}

// 获取单个测试资产生成任务
export const getTestAssetGenerationTaskById = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const task = db.getTestAssetGenerationTaskById(id)
    if (task) {
      res.status(200).json(task)
    } else {
      res.status(404).json({ error: '测试资产生成任务不存在' })
    }
  } catch {
    res.status(500).json({ error: '获取测试资产生成任务失败' })
  }
}

// 更新测试资产生成任务
export const updateTestAssetGenerationTask = (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const updates = req.body
    const updatedTask = db.updateTestAssetGenerationTask(id, updates)
    if (updatedTask) {
      res.status(200).json(updatedTask)
    } else {
      res.status(404).json({ error: '测试资产生成任务不存在' })
    }
  } catch {
    res.status(500).json({ error: '更新测试资产生成任务失败' })
  }
}