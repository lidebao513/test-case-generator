import React, { useState } from 'react'
import axios from 'axios'
import { Category } from '../services/api'

const DocumentImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [documentType, setDocumentType] = useState<string>('document')
  const [title, setTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>('')

  // 加载分类列表
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get('/api/knowledge/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('加载分类失败:', error)
      }
    }
    loadCategories()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // 自动设置标题为文件名（不包含扩展名）
      const fileName = e.target.files[0].name
      setTitle(fileName.substring(0, fileName.lastIndexOf('.')))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedCategory || !title) {
      setMessage('请选择文件、分类并输入标题')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('category_id', selectedCategory)
      formData.append('type', documentType)

      await axios.post('/api/knowledge/import', formData)
      setMessage('文档导入成功！')
      // 重置表单
      setFile(null)
      setTitle('')
      setSelectedCategory('')
      setDocumentType('document')
    } catch (error) {
      console.error('文档导入失败:', error)
      setMessage('文档导入失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">文档导入</h1>
        <p className="text-gray-600">将历史需求文档、测试用例、设计文档等导入知识库</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {message && (
          <div className={`mb-4 p-3 rounded-md ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              选择文件 *
            </label>
            <input
              type="file"
              id="file"
              accept=".docx,.pdf,.txt"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {file && (
              <div className="mt-2 text-sm text-gray-500">
                已选择文件: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              标题 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              文档类型 *
            </label>
            <select
              id="type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="document">文档</option>
              <option value="requirement">需求</option>
              <option value="testcase">测试用例</option>
              <option value="design">设计</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              分类 *
            </label>
            <select
              id="category_id"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">选择分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? '导入中...' : '导入文档'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DocumentImporter