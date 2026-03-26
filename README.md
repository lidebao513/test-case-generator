# 测试用例生成平台

一个基于前后端分离架构的测试用例生成平台，使用AI技术自动分析需求文档并生成结构化测试用例。

## 技术栈

- **前端**：React + TypeScript + Tailwind CSS
- **后端**：Node.js + Express + TypeScript
- **数据库**：SQLite（开发阶段）
- **AI能力**：DeepSeek API

## 项目结构

```
test-case-generator/
├── frontend/               # React前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.tsx      # 文件上传组件
│   │   │   ├── TestCaseDisplay.tsx # 测试用例展示
│   │   │   └── ExportButtons.tsx   # 导出功能
│   │   ├── services/
│   │   │   └── api.ts              # API调用
│   │   └── App.tsx
│   └── package.json
├── backend/                # Node.js后端
│   ├── src/
│   │   ├── controllers/
│   │   │   └── testCaseController.ts
│   │   ├── services/
│   │   │   ├── documentParser.ts   # 文档解析
│   │   │   └── aiGenerator.ts      # AI调用逻辑
│   │   ├── routes/
│   │   │   └── upload.ts
│   │   └── index.ts
│   ├── uploads/            # 临时文件存储
│   └── package.json
└── README.md
```

## 核心功能

1. **文件上传**：支持上传 .docx, .pdf, .txt 格式的需求文档
2. **文本提取**：从上传的文档中提取文本内容
3. **AI 分析**：调用 DeepSeek API 分析需求并生成测试用例
4. **测试用例展示**：前端展示生成的测试用例
5. **导出功能**：支持导出测试用例为 Excel/JSON 格式
6. **数据库存储**：使用 SQLite 存储测试用例

## 如何运行

### 1. 安装依赖

#### 前端依赖
```bash
cd frontend
npm install
```

#### 后端依赖
```bash
cd backend
npm install
```

### 2. 启动服务

#### 启动后端服务
```bash
cd backend
npm run dev
# 服务运行在 http://localhost:8000
```

#### 启动前端服务
```bash
cd frontend
npm run dev
# 服务运行在 http://localhost:3000
```

### 3. 配置 AI API

项目已默认配置使用 DeepSeek API，API 密钥已设置为 `sk-21e2a3c7e3194479afe32627891578a3`。

如需修改 API 配置，请编辑 `backend/src/services/aiGenerator.ts` 文件。

## 使用说明

1. 打开前端页面：http://localhost:3000
2. 点击或拖拽文件到上传区域，选择需求文档（支持 .docx, .pdf, .txt 格式）
3. 点击「生成测试用例」按钮
4. 等待 AI 分析完成，查看生成的测试用例
5. 点击「导出 Excel」或「导出 JSON」按钮下载测试用例

## 注意事项

- 确保后端服务先启动，以便前端能够正常调用 API
- 首次运行时，后端会自动创建 SQLite 数据库文件
- 由于使用了 DeepSeek API，需要确保网络连接正常且 API 密钥有效
- 上传的文档大小建议不超过 10MB，以确保处理速度
