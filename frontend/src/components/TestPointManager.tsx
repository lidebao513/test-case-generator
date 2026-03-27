import React, { useState, useEffect } from 'react'
import { TestPoint, getTestPoints, createTestPoint, updateTestPoint, deleteTestPoint, getTestCasesByTestPoint, TestCase, updateTestCase } from '../services/api'

const TestPointManager: React.FC = () => {
  const [testPoints, setTestPoints] = useState<TestPoint[]>([])
  const [selectedTestPoint, setSelectedTestPoint] = useState<TestPoint | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTestPoint, setEditingTestPoint] = useState<TestPoint | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewingItem, setReviewingItem] = useState<{ type: 'testPoint' | 'testCase'; id: string } | null>(null)
  const [reviewData, setReviewData] = useState({
    status: '已通过',
    comments: ''
  })
  const [formData, setFormData] = useState({
    requirement_id: Date.now().toString(),
    title: '',
    description: '',
    validation_target: '',
    validation_content: '',
    expected_result: '',
    priority: 'P1',
    type: '功能测试',
    status: '待实现'
  })

  // 加载测试点列表
  useEffect(() => {
    loadTestPoints()
  }, [])

  // 加载测试用例
  useEffect(() => {
    if (selectedTestPoint) {
      loadTestCases(selectedTestPoint.id)
    }
  }, [selectedTestPoint])

  const loadTestPoints = async () => {
    setIsLoading(true)
    try {
      const data = await getTestPoints()
      setTestPoints(data)
    } catch (error) {
      console.error('加载测试点失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTestCases = async (testPointId: string) => {
    setIsLoading(true)
    try {
      const data = await getTestCasesByTestPoint(testPointId)
      setTestCases(data)
    } catch (error) {
      console.error('加载测试用例失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (editingTestPoint) {
        await updateTestPoint(editingTestPoint.id, formData)
      } else {
        await createTestPoint(formData)
      }
      loadTestPoints()
      resetForm()
    } catch (error) {
      console.error('保存测试点失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (testPoint: TestPoint) => {
    setEditingTestPoint(testPoint)
    setFormData({
      requirement_id: testPoint.requirement_id,
      title: testPoint.title,
      description: testPoint.description,
      validation_target: testPoint.validation_target,
      validation_content: testPoint.validation_content,
      expected_result: testPoint.expected_result,
      priority: testPoint.priority,
      type: testPoint.type,
      status: testPoint.status
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个测试点吗？')) {
      setIsLoading(true)
      try {
        await deleteTestPoint(id)
        loadTestPoints()
        if (selectedTestPoint?.id === id) {
          setSelectedTestPoint(null)
          setTestCases([])
        }
      } catch (error) {
        console.error('删除测试点失败:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const resetForm = () => {
    setEditingTestPoint(null)
    setFormData({
      requirement_id: Date.now().toString(),
      title: '',
      description: '',
      validation_target: '',
      validation_content: '',
      expected_result: '',
      priority: 'P1',
      type: '功能测试',
      status: '待实现'
    })
    setShowForm(false)
  }

  const handleReview = (type: 'testPoint' | 'testCase', id: string) => {
    setReviewingItem({ type, id })
    setReviewData({
      status: '已通过',
      comments: ''
    })
    setShowReviewForm(true)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (reviewingItem) {
        if (reviewingItem.type === 'testPoint') {
          await updateTestPoint(reviewingItem.id, {
            review_status: reviewData.status,
            review_comments: reviewData.comments
          })
          loadTestPoints()
        } else if (reviewingItem.type === 'testCase') {
          await updateTestCase(reviewingItem.id, {
            review_status: reviewData.status,
            review_comments: reviewData.comments
          })
          if (selectedTestPoint) {
            loadTestCases(selectedTestPoint.id)
          }
        }
        resetReviewForm()
      }
    } catch (error) {
      console.error('提交评审失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetReviewForm = () => {
    setReviewingItem(null)
    setReviewData({
      status: '已通过',
      comments: ''
    })
    setShowReviewForm(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">测试点管理</h1>
        <p className="text-gray-600">管理测试点和相关测试用例</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 测试点列表 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">测试点列表</h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                添加测试点
              </button>
            </div>

            {showForm && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingTestPoint ? '编辑测试点' : '添加测试点'}
                </h3>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        测试点标题 *
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                        优先级 *
                      </label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="P0">P0 (最高)</option>
                        <option value="P1">P1 (中等)</option>
                        <option value="P2">P2 (最低)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        测试类型 *
                      </label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="功能测试">功能测试</option>
                        <option value="非功能测试">非功能测试</option>
                        <option value="边界测试">边界测试</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        状态 *
                      </label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="待实现">待实现</option>
                        <option value="已实现">已实现</option>
                        <option value="已验证">已验证</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        测试点描述
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      ></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="validation_target" className="block text-sm font-medium text-gray-700 mb-1">
                        验证对象 *
                      </label>
                      <input
                        type="text"
                        id="validation_target"
                        value={formData.validation_target}
                        onChange={(e) => setFormData({ ...formData, validation_target: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="validation_content" className="block text-sm font-medium text-gray-700 mb-1">
                        验证内容 *
                      </label>
                      <textarea
                        id="validation_content"
                        value={formData.validation_content}
                        onChange={(e) => setFormData({ ...formData, validation_content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      ></textarea>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="expected_result" className="block text-sm font-medium text-gray-700 mb-1">
                        预期结果 *
                      </label>
                      <textarea
                        id="expected_result"
                        value={formData.expected_result}
                        onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      disabled={isLoading}
                    >
                      {isLoading ? '保存中...' : '保存'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showReviewForm && (
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {reviewingItem?.type === 'testPoint' ? '评审测试点' : '评审测试用例'}
                </h3>
                <form onSubmit={handleSubmitReview}>
                  <div className="mb-4">
                    <label htmlFor="reviewStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      评审结果 *
                    </label>
                    <select
                      id="reviewStatus"
                      value={reviewData.status}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="已通过">已通过</option>
                      <option value="已拒绝">已拒绝</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="reviewComments" className="block text-sm font-medium text-gray-700 mb-1">
                      评审意见
                    </label>
                    <textarea
                      id="reviewComments"
                      value={reviewData.comments}
                      onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      disabled={isLoading}
                    >
                      {isLoading ? '提交中...' : '提交评审'}
                    </button>
                    <button
                      type="button"
                      onClick={resetReviewForm}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      测试点ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      优先级
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      评审状态
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        加载中...
                      </td>
                    </tr>
                  ) : testPoints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center">
                        暂无测试点
                      </td>
                    </tr>
                  ) : (
                    testPoints.map((testPoint) => (
                      <tr 
                        key={testPoint.id}
                        className={selectedTestPoint?.id === testPoint.id ? 'bg-blue-50' : ''}
                        onClick={() => setSelectedTestPoint(testPoint)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">{testPoint.id}</div>
                        </td>
                        <td className="px-6 py-4 cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">{testPoint.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {testPoint.description || '无描述'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${testPoint.priority === 'P0' ? 'bg-red-100 text-red-800' : testPoint.priority === 'P1' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {testPoint.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                          <div className="text-sm text-gray-500">{testPoint.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${testPoint.status === '待实现' ? 'bg-gray-100 text-gray-800' : testPoint.status === '已实现' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {testPoint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${testPoint.review_status === '待评审' ? 'bg-yellow-100 text-yellow-800' : testPoint.review_status === '已通过' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {testPoint.review_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(testPoint)
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            编辑
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleReview('testPoint', testPoint.id)
                            }}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                          >
                            评审
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(testPoint.id)
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 测试用例列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">相关测试用例</h2>
              {selectedTestPoint && (
                <p className="text-sm text-gray-500 mt-1">
                  测试点: {selectedTestPoint.title}
                </p>
              )}
            </div>
            <div className="p-6">
              {!selectedTestPoint ? (
                <div className="text-center py-8 text-gray-500">
                  请选择一个测试点
                </div>
              ) : isLoading ? (
                <div className="text-center py-4">
                  加载中...
                </div>
              ) : testCases.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  暂无测试用例
                </div>
              ) : (
                <div className="space-y-4">
                  {testCases.map((testCase) => (
                    <div key={testCase.id} className="p-4 border border-gray-200 rounded-md">
                      <div className="text-sm font-medium text-gray-900">{testCase.title}</div>
                      <div className="text-xs text-gray-500 mt-1">类型: {testCase.type}</div>
                      <div className="text-xs text-gray-500">优先级: {testCase.priority}</div>
                      <div className="text-xs text-gray-500">
                        评审状态: <span className={`px-1 py-0.5 text-xs font-semibold rounded ${testCase.review_status === '待评审' ? 'bg-yellow-100 text-yellow-800' : testCase.review_status === '已通过' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {testCase.review_status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {testCase.description || '无描述'}
                      </div>
                      {testCase.review_comments && (
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>评审意见:</strong> {testCase.review_comments}
                        </div>
                      )}
                      <div className="mt-3 flex justify-end space-x-2">
                        <button
                          onClick={() => handleReview('testCase', testCase.id)}
                          className="text-xs text-purple-600 hover:text-purple-900"
                        >
                          评审
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPointManager