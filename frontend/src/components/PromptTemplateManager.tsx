/**
 * 提示词模板管理组件
 * 功能：管理提示词模板的创建、编辑、复制、删除和归档
 */
import { useState, useEffect } from 'react'
import { PromptTemplate, PromptParameter, getPromptTemplates, createPromptTemplate, updatePromptTemplate, deletePromptTemplate } from '../services/api'
import { useToast } from './Toast'

/**
 * 提示词模板管理组件
 */
const PromptTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<PromptTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    parameters: [] as PromptParameter[],
    category: '',
    tags: ''
  })
  const { showToast } = useToast()

  // 加载提示词模板列表
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const data = await getPromptTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('加载提示词模板失败:', error)
      showToast('加载提示词模板失败', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  // 打开创建模板模态框
  const handleCreateTemplate = () => {
    setCurrentTemplate(null)
    setFormData({
      name: '',
      description: '',
      content: '',
      parameters: [],
      category: '',
      tags: ''
    })
    setIsModalOpen(true)
  }

  // 打开编辑模板模态框
  const handleEditTemplate = (template: PromptTemplate) => {
    setCurrentTemplate(template)
    setFormData({
      name: template.name,
      description: template.description,
      content: template.content,
      parameters: [...template.parameters],
      category: template.category,
      tags: template.tags.join(', ')
    })
    setIsModalOpen(true)
  }

  // 复制模板
  const handleCopyTemplate = async (template: PromptTemplate) => {
    try {
      const newTemplate = await createPromptTemplate({
        name: `${template.name} (复制)`,
        description: template.description,
        content: template.content,
        parameters: [...template.parameters],
        category: template.category,
        tags: template.tags,
        created_by: 'user'
      })
      setTemplates([...templates, newTemplate])
      showToast('复制提示词模板成功', 'success')
    } catch (error) {
      console.error('复制提示词模板失败:', error)
      showToast('复制提示词模板失败', 'error')
    }
  }

  // 删除模板
  const handleDeleteTemplate = async (id: string) => {
    if (window.confirm('确定要归档此提示词模板吗？')) {
      try {
        await deletePromptTemplate(id)
        setTemplates(templates.map(template => 
          template.id === id ? { ...template, status: 'archived' } : template
        ))
        showToast('归档提示词模板成功', 'success')
      } catch (error) {
        console.error('归档提示词模板失败:', error)
        showToast('归档提示词模板失败', 'error')
      }
    }
  }

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      if (currentTemplate) {
        // 更新现有模板
        await updatePromptTemplate(currentTemplate.id, {
          name: formData.name,
          description: formData.description,
          content: formData.content,
          parameters: formData.parameters,
          category: formData.category,
          tags
        })
        setTemplates(templates.map(template => 
          template.id === currentTemplate.id ? {
            ...template,
            name: formData.name,
            description: formData.description,
            content: formData.content,
            parameters: formData.parameters,
            category: formData.category,
            tags
          } : template
        ))
        showToast('更新提示词模板成功', 'success')
      } else {
        // 创建新模板
        const newTemplate = await createPromptTemplate({
          name: formData.name,
          description: formData.description,
          content: formData.content,
          parameters: formData.parameters,
          category: formData.category,
          tags,
          created_by: 'user'
        })
        setTemplates([...templates, newTemplate])
        showToast('创建提示词模板成功', 'success')
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error('保存提示词模板失败:', error)
      showToast('保存提示词模板失败', 'error')
    }
  }

  // 添加参数
  const handleAddParameter = () => {
    const newParameter: PromptParameter = {
      id: Date.now().toString(),
      name: '',
      type: 'string',
      defaultValue: '',
      required: false,
      description: ''
    }
    setFormData(prev => ({
      ...prev,
      parameters: [...prev.parameters, newParameter]
    }))
  }

  // 更新参数
  const handleUpdateParameter = (index: number, updates: Partial<PromptParameter>) => {
    const updatedParameters = [...formData.parameters]
    updatedParameters[index] = { ...updatedParameters[index], ...updates }
    setFormData(prev => ({ ...prev, parameters: updatedParameters }))
  }

  // 删除参数
  const handleDeleteParameter = (index: number) => {
    const updatedParameters = formData.parameters.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, parameters: updatedParameters }))
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">提示词模板管理</h2>
        <button
          onClick={handleCreateTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          创建模板
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className={`border rounded-lg p-4 ${template.status === 'archived' ? 'bg-gray-100' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                {template.status === 'archived' && (
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">已归档</span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {template.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 transition"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleCopyTemplate(template)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition"
                >
                  复制
                </button>
                {template.status === 'active' && (
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition"
                  >
                    归档
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{currentTemplate ? '编辑提示词模板' : '创建提示词模板'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">模板描述</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">提示词内容</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                  rows={6}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">标签（用逗号分隔）</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">参数</label>
                {formData.parameters.map((param, index) => (
                  <div key={param.id} className="border rounded-md p-3 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">参数 {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteParameter(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        删除
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">参数名称</label>
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => handleUpdateParameter(index, { name: e.target.value })}
                          className="w-full border rounded-md px-3 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">参数类型</label>
                        <select
                          value={param.type}
                          onChange={(e) => handleUpdateParameter(index, { type: e.target.value as any })}
                          className="w-full border rounded-md px-3 py-1 text-sm"
                        >
                          <option value="string">字符串</option>
                          <option value="number">数字</option>
                          <option value="enum">枚举</option>
                          <option value="boolean">布尔值</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">默认值</label>
                        <input
                          type="text"
                          value={param.defaultValue}
                          onChange={(e) => handleUpdateParameter(index, { defaultValue: e.target.value })}
                          className="w-full border rounded-md px-3 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">是否必填</label>
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) => handleUpdateParameter(index, { required: e.target.checked })}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">参数描述</label>
                        <input
                          type="text"
                          value={param.description}
                          onChange={(e) => handleUpdateParameter(index, { description: e.target.value })}
                          className="w-full border rounded-md px-3 py-1 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddParameter}
                  className="mt-2 bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm hover:bg-gray-300 transition"
                >
                  添加参数
                </button>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptTemplateManager