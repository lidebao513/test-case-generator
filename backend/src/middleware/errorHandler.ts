/**
 * 错误处理中间件
 * 功能：统一处理所有API错误，返回标准化的错误响应
 */
import { Request, Response, NextFunction } from 'express'

/**
 * 自定义错误类
 */
export class AppError extends Error {
  statusCode: number
  isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 全局错误处理中间件
 */
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  let error = { ...err }
  error.message = err.message

  // 记录错误日志
  console.error('Error:', err)

  // Mongoose错误
  if (err.name === 'CastError') {
    const message = `资源未找到，ID格式错误: ${err.value}`
    error = new AppError(message, 404)
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ')
    error = new AppError(message, 400)
  }

  // 重复键错误
  if (err.code === 11000) {
    const message = `重复的字段值: ${Object.keys(err.keyValue).join(', ')}`
    error = new AppError(message, 400)
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌'
    error = new AppError(message, 401)
  }

  // JWT过期错误
  if (err.name === 'TokenExpiredError') {
    const message = '令牌已过期'
    error = new AppError(message, 401)
  }

  // API调用错误
  if (err.response) {
    const message = `外部API调用失败: ${err.response.status} ${err.response.statusText}`
    error = new AppError(message, 503)
  }

  // 网络错误
  if (err.code === 'ECONNREFUSED') {
    const message = '无法连接到外部服务'
    error = new AppError(message, 503)
  }

  // 默认错误
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器内部错误'
  })
}

/**
 * 404错误处理
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`未找到路径: ${req.originalUrl}`, 404)
  next(error)
}
