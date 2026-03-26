# 测试用例生成平台项目文档

## 项目概述

测试用例生成平台是一个前后端分离的应用，旨在帮助测试人员快速生成结构化的测试用例。通过上传需求文档（支持.docx、.pdf、.txt格式），系统会自动提取文本内容，调用DeepSeek AI API分析需求并生成测试用例，最后在前端展示并支持导出功能。

## 技术栈

### 前端
- React 18+
- TypeScript
- Tailwind CSS
- Axios

### 后端
- Node.js (Express)
- TypeScript
- Multer (文件上传)
- docx-parser (解析Word文档)
- pdf-parse (解析PDF文档)
- OpenAI SDK (调用DeepSeek API)

### AI能力
- DeepSeek API
- API密钥：sk-21e2a3c7e3194479afe32627891578a3
- API基础URL：https://api.deepseek.com/v1

## 项目架构

### 整体架构

```
┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐
│       前端应用        │    │       后端服务        │    │      DeepSeek API     │
├───────────────────────┤    ├───────────────────────┤    ├───────────────────────┤
│ - 文件上传组件        │    │ - 文件上传路由        │    │ - 需求分析           │
│ - 测试用例展示        │    │ - 文档解析服务        │    │ - 测试用例生成        │
│ - 导出功能            │    │ - AI测试用例生成服务  │    └───────────────────────┘
└───────────────────────┘    └───────────────────────┘
```

### 核心流程

1. **文件上传**：用户在前端选择并上传需求文档
2. **文档解析**：后端接收文件并根据文件类型提取文本内容
3. **AI分析**：调用DeepSeek API分析需求文档，生成结构化测试用例
4. **结果展示**：前端展示生成的测试用例
5. **导出功能**：支持将测试用例导出为JSON格式

## 项目结构

```
testCase/
├── backend/                # 后端代码
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   │   └── testCaseController.ts
│   │   ├── routes/         # 路由
│   │   │   └── upload.ts
│   │   ├── services/       # 服务
│   │   │   ├── aiGenerator.ts
│   │   │   └── documentParser.ts
│   │   ├── utils/          # 工具函数
│   │   │   ├── aiGenerator.ts
│   │   │   ├── db.ts
│   │   │   └── textExtractor.ts
│   │   └── index.ts        # 后端入口
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── ExportButtons.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   └── TestCaseDisplay.tsx
│   │   ├── services/       # 服务
│   │   │   └── api.ts
│   │   ├── App.tsx         # 主组件
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── .gitignore
├── PROJECT_DOCUMENTATION.md
└── README.md
```

## 核心功能实现

### 1. 文件上传功能

**前端**：
- 使用React的`FileUpload`组件提供文件选择界面
- 支持拖拽上传和点击选择
- 只允许上传.docx、.pdf、.txt文件
- 显示上传进度和错误信息

**后端**：
- 使用Express和Multer处理文件上传
- 配置文件过滤，只允许特定文件类型
- 临时存储上传的文件，处理完成后删除

### 2. 文档解析功能

**后端**：
- `documentParser.ts`服务根据文件类型调用不同的解析方法
- 支持.docx：使用docx-parser库解析
- 支持.pdf：使用pdf-parse库解析
- 支持.txt：直接读取文件内容

### 3. AI测试用例生成

**后端**：
- `aiGenerator.ts`服务使用OpenAI SDK调用DeepSeek API
- 构建详细的提示词，指导AI生成结构化测试用例
- 处理API响应，解析生成的测试用例
- 错误处理：当API调用失败时返回模拟测试用例

**AI提示词设计**：
- 明确要求分析需求文档中的功能点和验收标准
- 为每个功能点生成至少2个测试用例
- 测试用例应包含：id、标题、描述、测试步骤、预期结果、优先级
- 以JSON格式返回测试用例列表
- 确保测试用例覆盖正常场景和异常场景

### 4. 测试用例展示

**前端**：
- `TestCaseDisplay`组件以表格形式展示测试用例
- 显示测试用例标题、描述和优先级
- 优先级使用不同颜色标签区分（高：红色，中：黄色，低：绿色）
- 提供查看和编辑按钮（编辑功能待实现）

### 5. 导出功能

**前端**：
- `ExportButtons`组件提供Excel和JSON导出按钮
- JSON导出：将测试用例转换为JSON格式并下载
- Excel导出：预留功能，需要集成Excel库实现

## API接口

### POST /api/upload

**功能**：上传需求文档并生成测试用例

**请求**：
- 方法：POST
- 路径：/api/upload
- 内容类型：multipart/form-data
- 字段：file（文件）

**响应**：
- 成功：`{ "testCases": [...] }`
- 失败：`{ "error": "错误信息" }`

**测试用例格式**：
```json
[
  {
    "id": "1",
    "title": "测试标题",
    "description": "测试描述",
    "steps": ["步骤1", "步骤2"],
    "expectedResult": "预期结果",
    "priority": "高"
  }
]
```

## 环境配置

### 后端环境

1. 进入backend目录
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`
4. 构建生产版本：`npm run build`

### 前端环境

1. 进入frontend目录
2. 安装依赖：`npm install`
3. 启动开发服务器：`npm run dev`
4. 构建生产版本：`npm run build`

## 注意事项

1. **AI API配置**：
   - 已配置使用DeepSeek API
   - API密钥：sk-21e2a3c7e3194479afe32627891578a3
   - API基础URL：https://api.deepseek.com/v1

2. **文件大小限制**：
   - 默认限制为Multer的默认配置
   - 如需调整，可在`upload.ts`中修改Multer配置

3. **错误处理**：
   - 前端和后端都实现了基本的错误处理
   - 当AI API调用失败时，会返回模拟测试用例

4. **安全性**：
   - 生产环境中应添加更多安全措施，如文件大小限制、病毒扫描等
   - API密钥应通过环境变量配置，避免硬编码

## 扩展功能

1. **用户认证**：添加用户登录功能，支持多用户使用
2. **测试用例管理**：支持保存、编辑和删除测试用例
3. **数据库集成**：使用PostgreSQL存储测试用例和用户数据
4. **Excel导出**：集成Excel库，实现完整的Excel导出功能
5. **测试执行**：添加测试执行和结果记录功能
6. **AI模型选择**：支持切换不同的AI模型

## 故障排查

### 常见问题

1. **文件上传失败**：
   - 检查文件类型是否支持（.docx、.pdf、.txt）
   - 检查文件大小是否超过限制

2. **测试用例生成失败**：
   - 检查网络连接
   - 检查DeepSeek API密钥是否有效
   - 检查需求文档是否清晰、完整

3. **前端页面空白**：
   - 检查前端开发服务器是否运行
   - 检查浏览器控制台是否有错误

4. **后端服务启动失败**：
   - 检查端口是否被占用
   - 检查依赖是否正确安装

### 日志查看

- 前端：浏览器控制台
- 后端：终端输出

## 总结

测试用例生成平台通过结合AI技术，大大提高了测试用例的生成效率和质量。系统支持多种文档格式，使用DeepSeek API进行智能分析，生成结构化的测试用例，并提供友好的用户界面和导出功能。

该平台可以帮助测试团队节省大量手动编写测试用例的时间，同时确保测试用例的完整性和覆盖度。通过扩展功能，可以进一步提升平台的实用性和价值。