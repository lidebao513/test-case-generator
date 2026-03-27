import React, { useState, useEffect } from 'react'
import { KnowledgeVersion, getKnowledgeVersions } from '../services/api'

interface VersionControlProps {
  knowledgeId: string
  onVersionSelect?: (_version: KnowledgeVersion) => void
}

const VersionControl: React.FC<VersionControlProps> = ({ knowledgeId, onVersionSelect }) => {
  const [versions, setVersions] = useState<KnowledgeVersion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // 加载版本历史
  useEffect(() => {
    if (knowledgeId) {
      loadVersions()
    }
  }, [knowledgeId])

  const loadVersions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getKnowledgeVersions(knowledgeId)
      setVersions(data)
    } catch (err) {
      console.error('加载版本历史失败:', err)
      setError('加载版本历史失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">版本历史</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">加载中...</div>
      ) : versions.length === 0 ? (
        <div className="text-center py-4 text-gray-500">暂无版本历史</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  版本号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建者
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {versions.map((version) => (
                <tr key={version.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{version.version}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(version.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{version.created_by}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {onVersionSelect && (
                      <button
                        onClick={() => onVersionSelect(version)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        查看
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default VersionControl