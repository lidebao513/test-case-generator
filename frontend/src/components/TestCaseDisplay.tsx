/**
 * 测试用例显示组件
 * 功能：以表格形式展示生成的测试用例
 */
import React, { useState, useMemo } from 'react'

/**
 * 测试用例接口定义
 */
export interface TestCase {
  id: string           // 测试用例ID
  title: string        // 测试用例标题
  type: string         // 测试类型
  priority: string     // 优先级（P0/P1/P2）
  preconditions: string // 前置条件
  testData: string     // 测试数据
  steps: string[]      // 测试步骤
  expectedResult: string // 预期结果
  postconditions: string // 后置处理
  description?: string  // 测试用例描述（可选）
}

/**
 * 组件属性接口
 */
interface TestCaseDisplayProps {
  testCases: TestCase[] // 测试用例列表
}

/**
 * 测试用例显示组件
 */
const TestCaseDisplay: React.FC<TestCaseDisplayProps> = ({ testCases }) => {
  // 状态管理
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editedTestCase, setEditedTestCase] = useState<TestCase | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string>('all') // 优先级筛选
  const [searchTerm, setSearchTerm] = useState<string>('') // 搜索关键词

  /**
   * 处理查看按钮点击
   * @param testCase 测试用例
   */
  const handleView = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setIsEditing(false)
  }

  /**
   * 处理编辑按钮点击
   * @param testCase 测试用例
   */
  const handleEdit = (testCase: TestCase) => {
    setSelectedTestCase(testCase)
    setEditedTestCase({ ...testCase })
    setIsEditing(true)
  }

  /**
   * 处理保存编辑
   */
  const handleSave = () => {
    // 这里可以添加保存逻辑
    setIsEditing(false)
    setSelectedTestCase(null)
    setEditedTestCase(null)
  }

  /**
   * 处理取消编辑
   */
  const handleCancel = () => {
    setIsEditing(false)
    setSelectedTestCase(null)
    setEditedTestCase(null)
  }

  /**
   * 处理优先级筛选变化
   * @param e 事件对象
   */
  const handlePriorityFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriorityFilter(e.target.value)
  }

  /**
   * 处理搜索输入变化
   * @param e 事件对象
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  /**
   * 过滤测试用例
   */
  const filteredTestCases = useMemo(() => {
    return testCases.filter(testCase => {
      // 优先级筛选
      const priorityMatch = priorityFilter === 'all' || testCase.priority === priorityFilter
      
      // 搜索筛选
      const searchMatch = searchTerm === '' || 
        testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (testCase.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      
      return priorityMatch && searchMatch
    })
  }, [testCases, priorityFilter, searchTerm])

  return (
    <div className="space-y-4">
      {/* 筛选和搜索区域 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        {/* 优先级筛选 */}
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700">优先级筛选：</label>
          <select 
            value={priorityFilter}
            onChange={handlePriorityFilterChange}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">全部</option>
            <option value="高">高</option>
            <option value="中">中</option>
            <option value="低">低</option>
          </select>
        </div>
        
        {/* 搜索框 */}
        <div className="relative w-full sm:w-64">
          <input 
            type="text"
            placeholder="搜索测试用例..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 text-sm"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 测试用例表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* 表头 */}
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用例ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用例标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">测试类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">优先级</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          {/* 表体 */}
          <tbody className="bg-white divide-y divide-gray-200">
            {/* 遍历过滤后的测试用例列表 */}
            {filteredTestCases.length > 0 ? (
              filteredTestCases.map((testCase) => (
                <tr key={testCase.id}>
                  {/* 测试用例ID */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {testCase.id}
                  </td>
                  {/* 测试用例标题 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{testCase.title}</div>
                    {testCase.description && (
                      <div className="text-sm text-gray-500 mt-1">{testCase.description}</div>
                    )}
                  </td>
                  {/* 测试类型 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {testCase.type}
                  </td>
                  {/* 优先级标签 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${testCase.priority === 'P0' ? 'bg-red-100 text-red-800' : testCase.priority === 'P1' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {testCase.priority}
                    </span>
                  </td>
                  {/* 操作按钮 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleView(testCase)}
                    >
                      查看
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => handleEdit(testCase)}
                    >
                      编辑
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // 无数据提示
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  没有找到匹配的测试用例
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 查看/编辑模态框 */}
      {selectedTestCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {isEditing ? '编辑测试用例' : '查看测试用例'}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCancel}
              >
                ×
              </button>
            </div>

            {isEditing && editedTestCase ? (
              // 编辑模式
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">测试用例ID</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.id}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.title}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">测试类型</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.type}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.priority}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, priority: e.target.value })}
                  >
                    <option value="P0">P0</option>
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">前置条件</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.preconditions}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, preconditions: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">测试数据</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.testData}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, testData: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">测试步骤</label>
                  {editedTestCase.steps.map((step, index) => (
                    <input 
                      key={index}
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mb-1"
                      value={step}
                      onChange={(e) => {
                        const newSteps = [...editedTestCase.steps]
                        newSteps[index] = e.target.value
                        setEditedTestCase({ ...editedTestCase, steps: newSteps })
                      }}
                    />
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">预期结果</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.expectedResult}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, expectedResult: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">后置处理</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={editedTestCase.postconditions}
                    onChange={(e) => setEditedTestCase({ ...editedTestCase, postconditions: e.target.value })}
                  />
                </div>
                {editedTestCase.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={editedTestCase.description}
                      onChange={(e) => setEditedTestCase({ ...editedTestCase, description: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2 mt-6">
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                    onClick={handleCancel}
                  >
                    取消
                  </button>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    onClick={handleSave}
                  >
                    保存
                  </button>
                </div>
              </div>
            ) : (
              // 查看模式
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">测试用例ID</h4>
                  <p>{selectedTestCase.id}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">标题</h4>
                  <p>{selectedTestCase.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">测试类型</h4>
                  <p>{selectedTestCase.type}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">优先级</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedTestCase.priority === 'P0' ? 'bg-red-100 text-red-800' : selectedTestCase.priority === 'P1' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {selectedTestCase.priority}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">前置条件</h4>
                  <p>{selectedTestCase.preconditions}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">测试数据</h4>
                  <p>{selectedTestCase.testData}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">测试步骤</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    {selectedTestCase.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">预期结果</h4>
                  <p>{selectedTestCase.expectedResult}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">后置处理</h4>
                  <p>{selectedTestCase.postconditions}</p>
                </div>
                {selectedTestCase.description && (
                  <div>
                    <h4 className="font-medium text-gray-700">描述</h4>
                    <p>{selectedTestCase.description}</p>
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                    onClick={handleCancel}
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TestCaseDisplay
