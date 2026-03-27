import React, { useState } from 'react'
import CategoryManager from './CategoryManager'
import KnowledgeItemManager from './KnowledgeItemManager'

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">知识库管理</h1>
        <p className="text-gray-600">管理项目文档、需求和测试用例</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'categories' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              分类管理
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'items' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              知识条目管理
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'categories' ? <CategoryManager /> : <KnowledgeItemManager />}
        </div>
      </div>
    </div>
  )
}

export default KnowledgeBase
