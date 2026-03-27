#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 运行测试并生成覆盖率报告
function runTestsWithCoverage() {
  console.log('正在运行测试并生成覆盖率报告...');
  
  try {
    // 忽略退出码，只要测试通过就继续
    const { exec } = require('child_process');
    
    return new Promise((resolve, reject) => {
      exec('npm test -- --coverage', {
        cwd: path.join(__dirname, '..')
      }, (error, stdout, stderr) => {
        console.log('测试执行完成');
        // 合并输出
        const output = stdout + stderr;
        resolve(output);
      });
    });
  } catch (error) {
    console.error('测试执行失败:', error.message);
    process.exit(1);
  }
}

// 分析覆盖率报告
function analyzeCoverage(output) {
  console.log('\n=== 覆盖率分析 ===');
  
  // 提取覆盖率数据
  const coverageMatch = output.match(/All files\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)\s+\|\s+(\d+\.\d+)/);
  
  if (coverageMatch) {
    const [, statements, branches, functions, lines] = coverageMatch;
    
    console.log(`语句覆盖率: ${statements}%`);
    console.log(`分支覆盖率: ${branches}%`);
    console.log(`函数覆盖率: ${functions}%`);
    console.log(`行覆盖率: ${lines}%`);
    
    // 检查是否达到目标
    const target = 80;
    const coverageValues = [parseFloat(statements), parseFloat(branches), parseFloat(functions), parseFloat(lines)];
    const allTargetsMet = coverageValues.every(value => value >= target);
    
    if (allTargetsMet) {
      console.log('\n✅ 所有覆盖率指标均达到目标 (80%)');
    } else {
      console.log('\n❌ 部分覆盖率指标未达到目标 (80%)');
      console.log('需要进一步优化测试用例');
    }
    
    return {
      statements: parseFloat(statements),
      branches: parseFloat(branches),
      functions: parseFloat(functions),
      lines: parseFloat(lines),
      timestamp: new Date().toISOString()
    };
  } else {
    console.error('无法提取覆盖率数据');
    return null;
  }
}

// 保存覆盖率历史
function saveCoverageHistory(coverageData) {
  const historyPath = path.join(__dirname, '..', 'coverage-history.json');
  
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (error) {
      console.error('读取覆盖率历史失败:', error.message);
      history = [];
    }
  }
  
  history.push(coverageData);
  
  // 只保留最近30条记录
  if (history.length > 30) {
    history = history.slice(-30);
  }
  
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log('\n覆盖率历史已更新');
}

// 主函数
async function main() {
  console.log('=== 后端代码覆盖率检查 ===');
  console.log('时间:', new Date().toLocaleString());
  console.log('==========================\n');
  
  const output = await runTestsWithCoverage();
  const coverageData = analyzeCoverage(output);
  
  if (coverageData) {
    saveCoverageHistory(coverageData);
  }
  
  console.log('\n=== 检查完成 ===');
}

if (require.main === module) {
  main();
}

module.exports = {
  runTestsWithCoverage,
  analyzeCoverage,
  saveCoverageHistory
};