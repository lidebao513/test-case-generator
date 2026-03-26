// 类型声明文件

// 声明pdf-parse模块
declare module 'pdf-parse' {
  interface PDFData {
    text: string
    info: any
    metadata: any
    version: string
  }

  function pdfParse(dataBuffer: Buffer): Promise<PDFData>
  export default pdfParse
}

// 声明docx-parser模块
declare module 'docx-parser' {
  interface DocxResult {
    text: string
    [key: string]: any
  }

  const docxParser: {
    parseBuffer(content: string): Promise<DocxResult>
    [key: string]: any
  }

  export default docxParser
}
