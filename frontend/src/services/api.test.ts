import axios from 'axios';
import { uploadFile, getTestPoints, createTestPoint, updateTestPoint, deleteTestPoint, getTestCasesByTestPoint, updateTestCase } from './api';

// Mock axios
jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file and return test cases', async () => {
      const mockTestCases = [
        {
          id: '1',
          title: '测试用例1',
          type: '功能测试',
          priority: 'P0',
          preconditions: '前置条件',
          testData: '测试数据',
          steps: ['步骤1', '步骤2'],
          expectedResult: '预期结果',
          postconditions: '后置条件',
          test_point_id: 'tp-001',
          review_status: '待评审',
          review_comments: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      mockAxios.post.mockResolvedValue({
        data: { testCases: mockTestCases }
      });

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const result = await uploadFile(file);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/upload', expect.any(FormData));
      expect(result).toEqual(mockTestCases);
    });

    it('should handle upload error', async () => {
      mockAxios.post.mockRejectedValue(new Error('Upload failed'));

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      await expect(uploadFile(file)).rejects.toThrow('Upload failed');
    });
  });

  describe('Test Point Management', () => {
    it('should get test points', async () => {
      const mockTestPoints = [
        {
          id: '1',
          requirement_id: 'req-001',
          title: '测试点1',
          description: '测试点描述',
          validation_target: '验证目标',
          validation_content: '验证内容',
          expected_result: '预期结果',
          priority: 'P0',
          type: '功能测试',
          status: '待实现',
          review_status: '待评审',
          review_comments: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      mockAxios.get.mockResolvedValue({
        data: mockTestPoints
      });

      const result = await getTestPoints('req-001');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/test-points', { params: { requirement_id: 'req-001' } });
      expect(result).toEqual(mockTestPoints);
    });

    it('should create a test point', async () => {
      const testPointData = {
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      };

      const mockResponse = {
        ...testPointData,
        id: '1',
        review_status: '待评审',
        review_comments: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockAxios.post.mockResolvedValue({
        data: mockResponse
      });

      const result = await createTestPoint(testPointData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/test-points', testPointData);
      expect(result).toEqual(mockResponse);
    });

    it('should update a test point', async () => {
      const mockResponse = {
        id: '1',
        requirement_id: 'req-001',
        title: '更新后的测试点',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现',
        review_status: '待评审',
        review_comments: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockAxios.put.mockResolvedValue({
        data: mockResponse
      });

      const result = await updateTestPoint('1', { title: '更新后的测试点' });

      expect(mockAxios.put).toHaveBeenCalledWith('/api/test-points/1', { title: '更新后的测试点' });
      expect(result).toEqual(mockResponse);
    });

    it('should delete a test point', async () => {
      mockAxios.delete.mockResolvedValue({
        data: { success: true }
      });

      const result = await deleteTestPoint('1');

      expect(mockAxios.delete).toHaveBeenCalledWith('/api/test-points/1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('Test Case Management', () => {
    it('should get test cases by test point', async () => {
      const mockTestCases = [
        {
          id: '1',
          title: '测试用例1',
          type: '功能测试',
          priority: 'P0',
          preconditions: '前置条件',
          testData: '测试数据',
          steps: ['步骤1', '步骤2'],
          expectedResult: '预期结果',
          postconditions: '后置条件',
          test_point_id: 'tp-001',
          review_status: '待评审',
          review_comments: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      mockAxios.get.mockResolvedValue({
        data: mockTestCases
      });

      const result = await getTestCasesByTestPoint('tp-001');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/test-cases', { params: { test_point_id: 'tp-001' } });
      expect(result).toEqual(mockTestCases);
    });

    it('should update a test case', async () => {
      const mockResponse = {
        id: '1',
        title: '更新后的测试用例',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件',
        testData: '测试数据',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果',
        postconditions: '后置条件',
        test_point_id: 'tp-001',
        review_status: '待评审',
        review_comments: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockAxios.put.mockResolvedValue({
        data: mockResponse
      });

      const result = await updateTestCase('1', { title: '更新后的测试用例' });

      expect(mockAxios.put).toHaveBeenCalledWith('/api/test-cases/1', { title: '更新后的测试用例' });
      expect(result).toEqual(mockResponse);
    });
  });
});
