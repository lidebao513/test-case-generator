/**
 * 应用主组件
 * 功能：整合文件上传、测试用例生成、提示词模板管理和日志管理功能
 */
import { useState, lazy, Suspense } from 'react'
import FileUpload from './components/FileUpload'
import TestCaseDisplay from './components/TestCaseDisplay'
import ExportButtons from './components/ExportButtons'
import { ToastProvider, useToast } from './components/Toast'
import { uploadFile, TestCase } from './services/api'

// 组件懒加载
const PromptTemplateManager = lazy(() => import('./components/PromptTemplateManager'))
const LogManager = lazy(() => import('./components/LogManager'))

/**
 * 应用主组件
 */
const AppContent = () => {
  // 状态管理
  const [loading, setLoading] = useState(false) // 加载状态
  const [testCases, setTestCases] = useState<TestCase[]>([]) // 测试用例列表
  const [activeTab, setActiveTab] = useState('upload') // 当前激活的标签
  const { showToast } = useToast() // 使用Toast通知系统

  /**
   * 处理文件上传
   * @param file 上传的文件
   */
  const handleFileUpload = async (file: File) => {
    setLoading(true) // 设置加载状态为true
    try {
      const cases = await uploadFile(file) // 调用API上传文件并获取测试用例
      setTestCases(cases) // 更新测试用例列表
      showToast('测试用例生成成功', 'success')
    } catch (error) {
      console.error('上传失败:', error) // 错误处理
      showToast('测试用例生成失败', 'error')
    } finally {
      setLoading(false) // 无论成功失败，都设置加载状态为false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部 */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">大模型提示词管理与测试资产生成系统</h1>
          <p className="mt-2 text-blue-100">智能生成测试用例，管理提示词模板，监控大模型调用</p>
        </div>
      </header>

      {/* 导航 */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-3 font-medium transition ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              测试用例生成
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-4 py-3 font-medium transition ${activeTab === 'prompt' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              提示词模板管理
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-3 font-medium transition ${activeTab === 'logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
            >
              大模型调用日志
            </button>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'upload' && (
          <>
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
          </>
        )}

        {activeTab === 'prompt' && (
          <section className="max-w-6xl mx-auto">
            <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
              <PromptTemplateManager />
            </Suspense>
          </section>
        )}

        {activeTab === 'logs' && (
          <section className="max-w-6xl mx-auto">
            <Suspense fallback={<div className="text-center py-12">加载中...</div>}>
              <LogManager />
            </Suspense>
          </section>
        )}
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 大模型提示词管理与测试资产生成系统</p>
        </div>
      </footer>
    </div>
  )
}

/**
 * 应用主组件（带ToastProvider）
 */
const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
)

export default App
