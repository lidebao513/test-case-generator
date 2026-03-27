/**
 * 日志管理组件
 * 功能：展示大模型调用日志，支持多维度筛选和详情查看
 */
import { useState, useEffect } from 'react'
import { ModelCallLog, getModelCallLogs } from '../services/api'
import { useToast } from './Toast'

/**
 * 日志管理组件
 */
const LogManager: React.FC = () => {
  const [logs, setLogs] = useState<ModelCallLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ModelCallLog | null>(null)
  const [filters, setFilters] = useState({
    model_type: '',
    status: '',
    start_date: '',
    end_date: ''
  })
  const { showToast } = useToast()

  // 加载日志列表
  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const data = await getModelCallLogs(filters)
      setLogs(data)
    } catch (error) {
      console.error('加载日志失败:', error)
      showToast('加载日志失败', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理筛选条件变化
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  // 重置筛选条件
  const handleResetFilters = () => {
    setFilters({
      model_type: '',
      status: '',
      start_date: '',
      end_date: ''
    })
  }

  // 查看日志详情
  const handleViewLog = (log: ModelCallLog) => {
    setSelectedLog(log)
  }

  // 关闭详情模态框
  const handleCloseDetail = () => {
    setSelectedLog(null)
  }

  // 导出日志
  const handleExportLogs = () => {
    if (logs.length === 0) {
      showToast('没有日志数据可导出', 'warning')
      return
    }
    const csvContent = convertToCSV(logs)
    downloadCSV(csvContent, 'model_call_logs.csv')
    showToast('日志导出成功', 'success')
  }

  // 转换为CSV格式
  const convertToCSV = (data: ModelCallLog[]): string => {
    const headers = ['ID', '请求ID', '用户ID', '模型类型', '提示词模板ID', '状态', '耗时(ms)', '创建时间']
    const rows = data.map(log => [
      log.id,
      log.request_id,
      log.user_id,
      log.model_type,
      log.prompt_template_id,
      log.status,
      log.duration,
      log.created_at
    ])
    
    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ]
    
    return csvRows.join('\n')
  }

  // 下载CSV文件
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">大模型调用日志</h2>
        <button
          onClick={handleExportLogs}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          导出日志
        </button>
      </div>

      {/* 筛选条件 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">模型类型</label>
          <select
            name="model_type"
            value={filters.model_type}
            onChange={handleFilterChange}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">全部</option>
            <option value="deepseek">DeepSeek</option>
            <option value="qwen">千问</option>
            <option value="openai">OpenAI</option>
            <option value="ernie">ERNIE</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">全部</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
            <option value="pending">处理中</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <input
            type="date"
            name="start_date"
            value={filters.start_date}
            onChange={handleFilterChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <input
            type="date"
            name="end_date"
            value={filters.end_date}
            onChange={handleFilterChange}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleResetFilters}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
        >
          重置筛选
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">加载中...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模型类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">耗时(ms)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.model_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'success' ? 'bg-green-100 text-green-800' : log.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {log.status === 'success' ? '成功' : log.status === 'failed' ? '失败' : '处理中'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.duration}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewLog(log)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 日志详情模态框 */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">日志详情</h3>
              <button
                onClick={handleCloseDetail}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">请求ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.request_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用户ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.user_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">模型类型</label>
                  <p className="text-sm text-gray-900">{selectedLog.model_type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">提示词模板ID</label>
                  <p className="text-sm text-gray-900">{selectedLog.prompt_template_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <p className={`text-sm ${selectedLog.status === 'success' ? 'text-green-800' : selectedLog.status === 'failed' ? 'text-red-800' : 'text-yellow-800'}`}>
                    {selectedLog.status === 'success' ? '成功' : selectedLog.status === 'failed' ? '失败' : '处理中'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">耗时(ms)</label>
                  <p className="text-sm text-gray-900">{selectedLog.duration}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">创建时间</label>
                  <p className="text-sm text-gray-900">{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">输入参数</label>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(selectedLog.input_parameters, null, 2)}
                </pre>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">完整提示词</label>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                  {selectedLog.full_prompt}
                </pre>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模型响应</label>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                  {selectedLog.response}
                </pre>
              </div>
              {selectedLog.error_message && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">错误信息</label>
                  <pre className="bg-red-100 p-3 rounded-md text-sm overflow-x-auto text-red-800">
                    {selectedLog.error_message}
                  </pre>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <div className="flex flex-wrap gap-2">
                  {selectedLog.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCloseDetail}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogManager