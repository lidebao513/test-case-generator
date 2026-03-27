import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TestPointManager from './TestPointManager';
import * as api from '../services/api';

// Mock API services
jest.mock('../services/api');
const mockApi = api as jest.Mocked<typeof api>;

describe('TestPointManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render test point manager', () => {
    mockApi.getTestPoints.mockResolvedValue([]);
    
    render(<TestPointManager />);
    
    expect(screen.getByText('测试点管理')).toBeInTheDocument();
  });

  it('should display test points', async () => {
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
    
    mockApi.getTestPoints.mockResolvedValue(mockTestPoints);
    
    render(<TestPointManager />);
    
    await waitFor(() => {
      expect(screen.getByText('测试点1')).toBeInTheDocument();
    });
  });

  it('should display test cases when test point is selected', async () => {
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
        test_point_id: '1',
        review_status: '待评审',
        review_comments: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    mockApi.getTestPoints.mockResolvedValue(mockTestPoints);
    mockApi.getTestCasesByTestPoint.mockResolvedValue(mockTestCases);
    
    render(<TestPointManager />);
    
    await waitFor(() => {
      expect(screen.getByText('测试点1')).toBeInTheDocument();
    });
    
    // Click on test point
    fireEvent.click(screen.getByText('测试点1'));
    
    await waitFor(() => {
      expect(screen.getByText('测试用例1')).toBeInTheDocument();
    });
  });

  it('should handle add test point', async () => {
    mockApi.getTestPoints.mockResolvedValue([]);
    mockApi.createTestPoint.mockResolvedValue({
      id: '1',
      requirement_id: 'req-001',
      title: '新测试点',
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
    });
    
    render(<TestPointManager />);
    
    // Click add button
    fireEvent.click(screen.getByText('添加测试点'));
    
    // Fill form
    fireEvent.change(screen.getByLabelText('测试点标题 *'), { target: { value: '新测试点' } });
    fireEvent.change(screen.getByLabelText('测试点描述'), { target: { value: '测试点描述' } });
    fireEvent.change(screen.getByLabelText('验证对象 *'), { target: { value: '验证目标' } });
    fireEvent.change(screen.getByLabelText('验证内容 *'), { target: { value: '验证内容' } });
    fireEvent.change(screen.getByLabelText('预期结果 *'), { target: { value: '预期结果' } });
    fireEvent.change(screen.getByLabelText('优先级 *'), { target: { value: 'P0' } });
    fireEvent.change(screen.getByLabelText('测试类型 *'), { target: { value: '功能测试' } });
    fireEvent.change(screen.getByLabelText('状态 *'), { target: { value: '待实现' } });
    
    // Submit form
    const saveButton = screen.getByText('保存中...');
    const form = saveButton.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    await waitFor(() => {
      expect(mockApi.createTestPoint).toHaveBeenCalled();
    });
  });

  it('should handle test point review', async () => {
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
    
    mockApi.getTestPoints.mockResolvedValue(mockTestPoints);
    mockApi.updateTestPoint.mockResolvedValue({
      ...mockTestPoints[0],
      review_status: '已通过',
      review_comments: '评审通过'
    });
    
    render(<TestPointManager />);
    
    await waitFor(() => {
      expect(screen.getByText('测试点1')).toBeInTheDocument();
    });
    
    // Click review button
    fireEvent.click(screen.getByText('评审'));
    
    // Fill review form
    fireEvent.change(screen.getByLabelText('评审结果 *'), { target: { value: '已通过' } });
    fireEvent.change(screen.getByLabelText('评审意见'), { target: { value: '评审通过' } });
    
    // Submit review
    fireEvent.click(screen.getByText('提交评审'));
    
    await waitFor(() => {
      expect(mockApi.updateTestPoint).toHaveBeenCalledWith('1', {
        review_status: '已通过',
        review_comments: '评审通过'
      });
    });
  });
});
