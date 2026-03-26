/**
 * 数据库工具
 * 注：当前版本使用内存存储，未使用实际数据库
 */

// 内存存储测试用例
let testCasesMemory: any[] = []

/**
 * 保存测试用例到内存
 * @param testCases 测试用例列表
 */
export const saveTestCases = (testCases: any[]) => {
  testCasesMemory = testCases
}

/**
 * 获取所有测试用例
 * @returns 测试用例列表
 */
export const getAllTestCases = () => {
  return testCasesMemory
}

/**
 * 清空测试用例
 */
export const clearTestCases = () => {
  testCasesMemory = []
}
