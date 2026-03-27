/**
 * 导出按钮组件
 * 功能：提供测试用例导出功能，支持Excel、JSON格式和在线部署
 */
import React from 'react'
import * as XLSX from 'xlsx'
import { useToast } from './Toast'

/**
 * 组件属性接口
 */
interface ExportButtonsProps {
  testCases: any[] // 测试用例列表
}

/**
 * 导出按钮组件
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({ testCases }) => {
  const { showToast } = useToast()
  /**
   * 处理Excel导出
   * 使用xlsx库生成真正的.xlsx文件
   */
  const handleExportExcel = () => {
    if (testCases.length === 0) {
      showToast('没有测试用例可导出', 'warning')
      return
    }
    // 准备Excel数据
    const headers = ['ID', '标题', '描述', '测试步骤', '预期结果', '优先级']
    const rows = testCases.map(testCase => [
      testCase.id,
      testCase.title,
      testCase.description,
      testCase.steps.join('\n'), // 使用换行符分隔步骤
      testCase.expectedResult,
      testCase.priority
    ])
    
    // 创建工作簿和工作表
    const wb = XLSX.utils.book_new()
    const ws_data = [headers, ...rows]
    const ws = XLSX.utils.aoa_to_sheet(ws_data)
    
    // 设置列宽
    const wscols = [
      { wch: 10 },  // ID
      { wch: 30 },  // 标题
      { wch: 50 },  // 描述
      { wch: 60 },  // 测试步骤
      { wch: 40 },  // 预期结果
      { wch: 10 }   // 优先级
    ]
    ws['!cols'] = wscols
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '测试用例')
    
    // 导出为Excel文件
    XLSX.writeFile(wb, 'test-cases.xlsx')
    showToast('Excel导出成功', 'success')
  }

  /**
   * 处理JSON导出
   * 将测试用例转换为JSON格式并下载
   */
  const handleExportJson = () => {
    if (testCases.length === 0) {
      showToast('没有测试用例可导出', 'warning')
      return
    }
    // 导出JSON功能
    const dataStr = JSON.stringify(testCases, null, 2) // 转换为格式化的JSON字符串
    const dataBlob = new Blob([dataStr], { type: 'application/json' }) // 创建Blob对象
    const url = URL.createObjectURL(dataBlob) // 创建临时URL
    const link = document.createElement('a') // 创建下载链接
    link.href = url
    link.download = 'test-cases.json' // 设置文件名
    link.click() // 触发下载
    URL.revokeObjectURL(url) // 释放临时URL
    showToast('JSON导出成功', 'success')
  }

  /**
   * 处理EdgeOne Pages部署
   * 将测试用例部署为在线文档
   */
  const handleDeployToEdgeOne = () => {
    if (testCases.length === 0) {
      showToast('没有测试用例可部署', 'warning')
      return
    }
    // 准备部署数据
    const htmlContent = generateHtmlContent(testCases)
    
    // 创建Blob对象
    const dataBlob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(dataBlob)
    
    // 打开新窗口预览
    window.open(url, '_blank')
    
    // 提示用户
    showToast('测试用例已生成HTML文档，可部署到EdgeOne Pages', 'info')
  }

  /**
   * 生成HTML内容
   * @param testCases 测试用例列表
   * @returns HTML字符串
   */
  const generateHtmlContent = (testCases: any[]) => {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>测试用例文档</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      text-align: center;
    }
    .test-case {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .test-case h2 {
      margin-top: 0;
      color: #0066cc;
    }
    .test-case h3 {
      margin-top: 15px;
      color: #333;
    }
    .test-case ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .priority {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .priority-high {
      background-color: #ffebee;
      color: #c62828;
    }
    .priority-medium {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    .priority-low {
      background-color: #e8f5e8;
      color: #2e7d32;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>测试用例文档</h1>
    <p>生成时间: ${new Date().toLocaleString()}</p>
    <p>测试用例数量: ${testCases.length}</p>
    
    ${testCases.map(testCase => `
    <div class="test-case">
      <h2>${testCase.title}</h2>
      <p><span class="priority priority-${testCase.priority === '高' ? 'high' : testCase.priority === '中' ? 'medium' : 'low'}">${testCase.priority}</span></p>
      <h3>描述</h3>
      <p>${testCase.description}</p>
      <h3>测试步骤</h3>
      <ul>
        ${testCase.steps.map((step: string) => `<li>${step}</li>`).join('')}
      </ul>
      <h3>预期结果</h3>
      <p>${testCase.expectedResult}</p>
    </div>
    `).join('')}
  </div>
</body>
</html>
    `
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Excel导出按钮 */}
      <button
        onClick={handleExportExcel}
        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        导出 Excel
      </button>
      {/* JSON导出按钮 */}
      <button
        onClick={handleExportJson}
        className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        导出 JSON
      </button>
      {/* EdgeOne Pages部署按钮 */}
      <button
        onClick={handleDeployToEdgeOne}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
      >
        部署为在线文档
      </button>
    </div>
  )
}

export default ExportButtons
