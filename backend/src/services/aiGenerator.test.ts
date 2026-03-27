import { generateTestPoints, generateTestCases } from './aiGenerator';
import * as db from '../utils/db';

// Mock external API calls
jest.mock('openai', () => {
  return {
    default: jest.fn(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock db
jest.mock('../utils/db', () => ({
  createTestPoint: jest.fn(),
  createTestCase: jest.fn((testCase) => ({
    ...testCase,
    id: 'TC-001',
    review_status: '待评审',
    review_comments: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })),
  searchKnowledge: jest.fn(() => []),
  createModelCallLog: jest.fn(() => ({
    id: 'log-001',
    created_at: new Date().toISOString()
  }))
}));

const _mockDb = db as jest.Mocked<typeof db>;

describe('AI Generator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateTestPoints', () => {
    it('should generate test points from requirement text', async () => {
      const requirementText = '用户登录功能：用户可以通过用户名和密码登录系统，登录成功后跳转到首页。';
      
      // Mock API response
      const mockOpenAI = require('openai').default;
      const mockChatCompletion = mockOpenAI().chat.completions.create;
      mockChatCompletion.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testPoints: [
                {
                  id: 'TP-001',
                  requirement_id: 'req-001',
                  title: '用户登录功能测试',
                  description: '测试用户通过用户名和密码登录系统的功能',
                  validation_target: '登录功能',
                  validation_content: '输入正确的用户名和密码',
                  expected_result: '登录成功，跳转到首页',
                  priority: 'P0',
                  type: '功能测试',
                  status: '待实现'
                }
              ]
            })
          }
        }]
      });

      const testPoints = await generateTestPoints(requirementText, 'qwen');
      
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
      testPoints.forEach(testPoint => {
        expect(testPoint).toHaveProperty('id');
        expect(testPoint).toHaveProperty('title');
        expect(testPoint).toHaveProperty('description');
        expect(testPoint).toHaveProperty('validation_target');
        expect(testPoint).toHaveProperty('validation_content');
        expect(testPoint).toHaveProperty('expected_result');
        expect(testPoint).toHaveProperty('priority');
        expect(testPoint).toHaveProperty('type');
      });
    }, 30000);

    it('should handle empty requirement text', async () => {
      const requirementText = '';
      const testPoints = await generateTestPoints(requirementText, 'qwen');
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle long requirement text (over 10000 characters)', async () => {
      const longText = 'a'.repeat(11000);
      
      // Mock API response
      const mockOpenAI = require('openai').default;
      const mockChatCompletion = mockOpenAI().chat.completions.create;
      mockChatCompletion.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testPoints: [
                {
                  id: 'TP-001',
                  requirement_id: 'req-001',
                  title: '测试点',
                  description: '测试描述',
                  validation_target: '验证目标',
                  validation_content: '验证内容',
                  expected_result: '预期结果',
                  priority: 'P0',
                  type: '功能测试',
                  status: '待实现'
                }
              ]
            })
          }
        }]
      });

      const testPoints = await generateTestPoints(longText, 'qwen');
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle API call failure and return default test points', async () => {
      const requirementText = '用户登录功能：用户可以通过用户名和密码登录系统，登录成功后跳转到首页。';
      
      // Mock API to fail
      const mockOpenAI = require('openai').default;
      const mockChatCompletion = mockOpenAI().chat.completions.create;
      mockChatCompletion.mockRejectedValue(new Error('API call failed'));

      const testPoints = await generateTestPoints(requirementText, 'qwen');
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle empty API response and return default test points', async () => {
      const requirementText = '用户登录功能：用户可以通过用户名和密码登录系统，登录成功后跳转到首页。';
      
      // Mock API to return empty response
      const mockOpenAI = require('openai').default;
      const mockChatCompletion = mockOpenAI().chat.completions.create;
      mockChatCompletion.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({})
          }
        }]
      });

      const testPoints = await generateTestPoints(requirementText, 'qwen');
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
    }, 30000);

    it('should use DeepSeek API when Qwen API fails', async () => {
      const requirementText = '用户登录功能：用户可以通过用户名和密码登录系统，登录成功后跳转到首页。';
      
      // Mock Qwen API to fail
      const mockOpenAI = require('openai').default;
      const mockChatCompletion = mockOpenAI().chat.completions.create;
      mockChatCompletion.mockRejectedValueOnce(new Error('Qwen API failed'))
        .mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                testPoints: [
                  {
                    id: 'TP-001',
                    requirement_id: 'req-001',
                    title: '用户登录功能测试',
                    description: '测试用户通过用户名和密码登录系统的功能',
                    validation_target: '登录功能',
                    validation_content: '输入正确的用户名和密码',
                    expected_result: '登录成功，跳转到首页',
                    priority: 'P0',
                    type: '功能测试',
                    status: '待实现'
                  }
                ]
              })
            }
          }]
        });

      const testPoints = await generateTestPoints(requirementText, 'qwen');
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('generateTestCases', () => {
    it('should generate test cases from requirement text', async () => {
      const requirementText = '用户登录功能：用户可以通过用户名和密码登录系统，登录成功后跳转到首页。';
      
      // Mock API response for test points
      const mockOpenAI = require('openai').default;
      const mockChatCompletion = mockOpenAI().chat.completions.create;
      mockChatCompletion.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              testPoints: [
                {
                  id: 'TP-001',
                  requirement_id: 'req-001',
                  title: '用户登录功能测试',
                  description: '测试用户通过用户名和密码登录系统的功能',
                  validation_target: '登录功能',
                  validation_content: '输入正确的用户名和密码',
                  expected_result: '登录成功，跳转到首页',
                  priority: 'P0',
                  type: '功能测试',
                  status: '待实现'
                }
              ]
            })
          }
        }]
      }).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              testCases: [
                {
                  id: 'TC-001',
                  test_point_id: 'TP-001',
                  title: '正确账号密码登录',
                  type: '功能测试',
                  priority: 'P0',
                  preconditions: '系统已部署并运行',
                  testData: '账号: admin, 密码: 123456',
                  steps: ['打开登录页面', '输入正确的账号', '输入正确的密码', '点击登录按钮'],
                  expectedResult: '登录成功，跳转至首页',
                  postconditions: '无',
                  description: '验证使用正确的账号和密码能够成功登录'
                }
              ]
            })
          }
        }]
      });

      const testCases = await generateTestCases(requirementText, 'qwen');
      expect(Array.isArray(testCases)).toBe(true);
      expect(testCases.length).toBeGreaterThan(0);
      testCases.forEach(testCase => {
        expect(testCase).toHaveProperty('id');
        expect(testCase).toHaveProperty('title');
        expect(testCase).toHaveProperty('type');
        expect(testCase).toHaveProperty('priority');
        expect(testCase).toHaveProperty('preconditions');
        expect(testCase).toHaveProperty('testData');
        expect(testCase).toHaveProperty('steps');
        expect(testCase).toHaveProperty('expectedResult');
        expect(testCase).toHaveProperty('postconditions');
        expect(testCase).toHaveProperty('test_point_id');
      });
    }, 30000);

    it('should handle empty requirement text', async () => {
      const requirementText = '';
      const testCases = await generateTestCases(requirementText, 'qwen');
      expect(Array.isArray(testCases)).toBe(true);
    }, 30000);

    it('should handle API call failure and return default test cases', async () => {
      const requirementText = '用户登录功能：用户可以通过用户名和密码登录系统，登录成功后跳转到首页。';
      
      // Mock API to fail
      const mockOpenAI = require('openai').default;
      const mockChatCompletion = mockOpenAI().chat.completions.create;
      mockChatCompletion.mockRejectedValue(new Error('API call failed'));

      const testCases = await generateTestCases(requirementText, 'qwen');
      expect(Array.isArray(testCases)).toBe(true);
      expect(testCases.length).toBeGreaterThan(0);
    }, 30000);
  });
});
