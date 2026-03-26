/**
 * 应用主组件
 * 功能：整合文件上传、测试用例生成和展示功能
 */
import React, { useState } from 'react'
import FileUpload from './components/FileUpload'
import TestCaseDisplay from './components/TestCaseDisplay'
import ExportButtons from './components/ExportButtons'
import { uploadFile, TestCase } from './services/api'

/**
 * 应用主组件
 */
function App() {
  // 状态管理
  const [loading, setLoading] = useState(false) // 加载状态
  const [testCases, setTestCases] = useState<TestCase[]>([]) // 测试用例列表

  /**
   * 处理文件上传
   * @param file 上传的文件
   */
  const handleFileUpload = async (file: File) => {
    setLoading(true) // 设置加载状态为true
    try {
      const cases = await uploadFile(file) // 调用API上传文件并获取测试用例
      setTestCases(cases) // 更新测试用例列表
    } catch (error) {
      console.error('上传失败:', error) // 错误处理
    } finally {
      setLoading(false) // 无论成功失败，都设置加载状态为false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部 */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">测试用例生成平台</h1>
          <p className="mt-2 text-blue-100">上传需求文档，自动生成测试用例</p>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* 文件上传区域 */}
        <section className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">上传需求文档</h2>
          <FileUpload onFileUpload={handleFileUpload} loading={loading} />
        </section>

        {/* 测试用例展示区域（仅当有测试用例时显示） */}
        {testCases.length > 0 && (
          <section className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">生成的测试用例</h2>
              <ExportButtons testCases={testCases} />
            </div>
            <TestCaseDisplay testCases={testCases} />
          </section>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 测试用例生成平台</p>
        </div>
      </footer>
    </div>
  )
}

export default App
