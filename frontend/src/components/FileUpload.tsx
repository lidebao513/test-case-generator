/**
 * 文件上传组件
 * 功能：提供文件选择和上传界面
 */
import React, { useState } from 'react'

/**
 * 组件属性接口
 */
interface FileUploadProps {
  onFileUpload: (selectedFile: File) => void // 文件上传回调函数
  loading: boolean // 加载状态
}

/**
 * 文件上传组件
 */
const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, loading }) => {
  // 状态管理
  const [file, setFile] = useState<File | null>(null) // 选中的文件
  const [error, setError] = useState<string | null>(null) // 错误信息
  const [isDragging, setIsDragging] = useState<boolean>(false) // 拖拽状态
  const [uploadProgress, setUploadProgress] = useState<number>(0) // 上传进度

  /**
   * 处理文件选择变化
   * @param e 事件对象
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      validateFile(selectedFile)
    }
  }

  /**
   * 验证文件类型
   * @param selectedFile 选中的文件
   */
  const validateFile = (selectedFile: File) => {
    const validTypes = ['.docx', '.pdf', '.txt']
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.'))
    
    if (validTypes.includes(fileExtension)) {
      setFile(selectedFile) // 设置选中的文件
      setError(null) // 清除错误信息
    } else {
      setError('仅支持 .docx, .pdf, .txt 文件') // 显示错误信息
      setFile(null) // 清除选中的文件
    }
  }

  /**
   * 处理拖拽开始
   * @param e 事件对象
   */
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
  }

  /**
   * 处理拖拽进入
   * @param e 事件对象
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  /**
   * 处理拖拽离开
   * @param e 事件对象
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  /**
   * 处理拖拽悬停
   * @param e 事件对象
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  /**
   * 处理文件放置
   * @param e 事件对象
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      validateFile(droppedFile)
    }
  }

  /**
   * 处理表单提交
   * @param e 事件对象
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault() // 阻止默认提交行为
    if (!file) {
      setError('请选择一个文件') // 显示错误信息
      return
    }
    
    // 模拟上传进度
    setUploadProgress(0)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + 10
        if (newProgress >= 100) {
          clearInterval(progressInterval)
        }
        return newProgress
      })
    }, 200)
    
    onFileUpload(file) // 调用上传回调
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 文件上传区域 */}
      <div 
        className={`border-2 rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-dashed border-gray-300'
        }`}
        onDragStart={handleDragStart}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 隐藏的文件输入 */}
        <input
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        {/* 自定义文件选择按钮 */}
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center">
            {/* 上传图标 */}
            <svg 
              className={`w-12 h-12 mb-4 transition-colors duration-200 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className={`text-lg font-medium transition-colors duration-200 ${
              isDragging ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {isDragging ? '释放文件以上传' : '点击或拖拽文件到此处上传'}
            </p>
            <p className="text-gray-400 text-sm mt-2">支持 .docx, .pdf, .txt 文件</p>
            {/* 显示选中的文件名 */}
            {file && (
              <p className="text-green-600 mt-2">已选择: {file.name}</p>
            )}
          </div>
        </label>
      </div>
      
      {/* 上传进度条 */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
      
      {/* 错误信息 */}
      {error && (
        <p className="text-red-600 text-center">{error}</p>
      )}
      
      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={loading || !file}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? '处理中...' : '生成测试用例'}
      </button>
    </form>
  )
}

export default FileUpload
