import { 
  createCategory, getCategories, getCategoryById, updateCategory, deleteCategory,
  createKnowledgeItem, getKnowledgeItems, getKnowledgeItemById, getKnowledgeItemsByCategory, updateKnowledgeItem, deleteKnowledgeItem,
  getKnowledgeVersions,
  createKnowledgeRelation, getKnowledgeRelations,
  createTestPoint, getTestPoints, getTestPointById, updateTestPoint, deleteTestPoint,
  createTestCase, getTestCases, getTestCaseById, updateTestCase, deleteTestCase,
  saveTestCases, getAllTestCases, clearTestCases,
  searchKnowledge
} from './db';

describe('Database Utils', () => {
  beforeEach(() => {
    // Clear all data before each test
    // Note: In a real test, we would need to reset the in-memory storage
    // For simplicity, we'll just create new data for each test
  });

  describe('Category Management', () => {
    it('should create a category', () => {
      const categoryData = {
        name: '测试分类',
        parent_id: null,
        description: '测试分类描述'
      };
      const category = createCategory(categoryData);
      expect(category).toHaveProperty('id');
      expect(category.name).toBe(categoryData.name);
      expect(category.parent_id).toBe(categoryData.parent_id);
      expect(category.description).toBe(categoryData.description);
    });

    it('should get all categories', () => {
      // Create some categories
      createCategory({ name: '分类1', parent_id: null, description: '描述1' });
      createCategory({ name: '分类2', parent_id: null, description: '描述2' });
      
      const categories = getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should get category by id', () => {
      const categoryData = {
        name: '测试分类',
        parent_id: null,
        description: '测试分类描述'
      };
      const category = createCategory(categoryData);
      const foundCategory = getCategoryById(category.id);
      expect(foundCategory).toBeDefined();
      expect(foundCategory?.id).toBe(category.id);
    });

    it('should update a category', () => {
      const categoryData = {
        name: '测试分类',
        parent_id: null,
        description: '测试分类描述'
      };
      const category = createCategory(categoryData);
      const updatedCategory = updateCategory(category.id, { name: '更新后的分类' });
      expect(updatedCategory).toBeDefined();
      if (updatedCategory) {
        expect(updatedCategory.name).toBe('更新后的分类');
      }
    });

    it('should return undefined when updating non-existent category', () => {
      const updatedCategory = updateCategory('non-existent-id', { name: '更新后的分类' });
      expect(updatedCategory).toBeUndefined();
    });

    it('should delete a category', () => {
      const categoryData = {
        name: '测试分类',
        parent_id: null,
        description: '测试分类描述'
      };
      const category = createCategory(categoryData);
      const result = deleteCategory(category.id);
      expect(result).toBe(true);
      const foundCategory = getCategoryById(category.id);
      expect(foundCategory).toBeUndefined();
    });

    it('should return false when deleting non-existent category', () => {
      const result = deleteCategory('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('Knowledge Item Management', () => {
    it('should create a knowledge item', () => {
      // First create a category
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      
      const itemData = {
        title: '测试知识条目',
        content: '测试内容',
        type: '文档',
        category_id: category.id
      };
      const item = createKnowledgeItem(itemData);
      expect(item).toHaveProperty('id');
      expect(item.title).toBe(itemData.title);
      expect(item.content).toBe(itemData.content);
      expect(item.type).toBe(itemData.type);
      expect(item.category_id).toBe(itemData.category_id);
    });

    it('should get all knowledge items', () => {
      // First create a category
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      
      // Create some knowledge items
      createKnowledgeItem({ title: '条目1', content: '内容1', type: '文档', category_id: category.id });
      createKnowledgeItem({ title: '条目2', content: '内容2', type: '文档', category_id: category.id });
      
      const items = getKnowledgeItems();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should get knowledge item by id', () => {
      // First create a category
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      
      const itemData = {
        title: '测试知识条目',
        content: '测试内容',
        type: '文档',
        category_id: category.id
      };
      const item = createKnowledgeItem(itemData);
      const foundItem = getKnowledgeItemById(item.id);
      expect(foundItem).toBeDefined();
      expect(foundItem?.id).toBe(item.id);
    });

    it('should get knowledge items by category', () => {
      // First create categories
      const category1 = createCategory({ name: '分类1', parent_id: null, description: '描述1' });
      const category2 = createCategory({ name: '分类2', parent_id: null, description: '描述2' });
      
      // Create knowledge items
      createKnowledgeItem({ title: '条目1', content: '内容1', type: '文档', category_id: category1.id });
      createKnowledgeItem({ title: '条目2', content: '内容2', type: '文档', category_id: category2.id });
      
      const items = getKnowledgeItemsByCategory(category1.id);
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => {
        expect(item.category_id).toBe(category1.id);
      });
    });

    it('should update a knowledge item', () => {
      // First create a category
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      
      const itemData = {
        title: '测试知识条目',
        content: '测试内容',
        type: '文档',
        category_id: category.id
      };
      const item = createKnowledgeItem(itemData);
      const updatedItem = updateKnowledgeItem(item.id, { title: '更新后的条目' });
      expect(updatedItem).toBeDefined();
      if (updatedItem) {
        expect(updatedItem.title).toBe('更新后的条目');
      }
    });

    it('should return undefined when updating non-existent knowledge item', () => {
      const updatedItem = updateKnowledgeItem('non-existent-id', { title: '更新后的条目' });
      expect(updatedItem).toBeUndefined();
    });

    it('should delete a knowledge item', () => {
      // First create a category
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      
      const itemData = {
        title: '测试知识条目',
        content: '测试内容',
        type: '文档',
        category_id: category.id
      };
      const item = createKnowledgeItem(itemData);
      const result = deleteKnowledgeItem(item.id);
      expect(result).toBe(true);
      const foundItem = getKnowledgeItemById(item.id);
      expect(foundItem).toBeUndefined();
    });

    it('should return false when deleting non-existent knowledge item', () => {
      const result = deleteKnowledgeItem('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('Knowledge Version Management', () => {
    it('should get knowledge versions', () => {
      // First create a category and knowledge item
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      const item = createKnowledgeItem({ title: '测试知识条目', content: '测试内容', type: '文档', category_id: category.id });
      
      // Update the item to create a new version
      updateKnowledgeItem(item.id, { content: '更新后的内容' });
      
      const versions = getKnowledgeVersions(item.id);
      expect(Array.isArray(versions)).toBe(true);
      expect(versions.length).toBeGreaterThan(0);
    });
  });

  describe('Knowledge Relation Management', () => {
    it('should create a knowledge relation', () => {
      // First create a category and knowledge items
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      const item1 = createKnowledgeItem({ title: '条目1', content: '内容1', type: '文档', category_id: category.id });
      const item2 = createKnowledgeItem({ title: '条目2', content: '内容2', type: '文档', category_id: category.id });
      
      const relationData = {
        source_id: item1.id,
        target_id: item2.id,
        relation_type: '关联'
      };
      const relation = createKnowledgeRelation(relationData);
      expect(relation).toHaveProperty('id');
      expect(relation.source_id).toBe(relationData.source_id);
      expect(relation.target_id).toBe(relationData.target_id);
      expect(relation.relation_type).toBe(relationData.relation_type);
    });

    it('should get knowledge relations', () => {
      // First create a category and knowledge items
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      const item1 = createKnowledgeItem({ title: '条目1', content: '内容1', type: '文档', category_id: category.id });
      const item2 = createKnowledgeItem({ title: '条目2', content: '内容2', type: '文档', category_id: category.id });
      
      // Create a relation
      createKnowledgeRelation({ source_id: item1.id, target_id: item2.id, relation_type: '关联' });
      
      const relations = getKnowledgeRelations(item1.id);
      expect(Array.isArray(relations)).toBe(true);
      expect(relations.length).toBeGreaterThan(0);
    });
  });

  describe('Test Point Management', () => {
    it('should create a test point', () => {
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
      const testPoint = createTestPoint(testPointData);
      expect(testPoint).toHaveProperty('id');
      expect(testPoint.title).toBe(testPointData.title);
      expect(testPoint.priority).toBe(testPointData.priority);
    });

    it('should get test points', () => {
      // Create some test points
      createTestPoint({
        requirement_id: 'req-001',
        title: '测试点1',
        description: '描述1',
        validation_target: '目标1',
        validation_content: '内容1',
        expected_result: '结果1',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      createTestPoint({
        requirement_id: 'req-001',
        title: '测试点2',
        description: '描述2',
        validation_target: '目标2',
        validation_content: '内容2',
        expected_result: '结果2',
        priority: 'P1',
        type: '边界测试',
        status: '待实现'
      });
      
      const testPoints = getTestPoints();
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
    });

    it('should get test points by requirement_id', () => {
      // Create test points with different requirement_ids
      createTestPoint({
        requirement_id: 'req-001',
        title: '测试点1',
        description: '描述1',
        validation_target: '目标1',
        validation_content: '内容1',
        expected_result: '结果1',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      createTestPoint({
        requirement_id: 'req-002',
        title: '测试点2',
        description: '描述2',
        validation_target: '目标2',
        validation_content: '内容2',
        expected_result: '结果2',
        priority: 'P1',
        type: '边界测试',
        status: '待实现'
      });
      
      const testPoints = getTestPoints('req-001');
      expect(Array.isArray(testPoints)).toBe(true);
      expect(testPoints.length).toBeGreaterThan(0);
      testPoints.forEach(testPoint => {
        expect(testPoint.requirement_id).toBe('req-001');
      });
    });

    it('should get test point by id', () => {
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
      const testPoint = createTestPoint(testPointData);
      const foundTestPoint = getTestPointById(testPoint.id);
      expect(foundTestPoint).toBeDefined();
      expect(foundTestPoint?.id).toBe(testPoint.id);
    });

    it('should update a test point', () => {
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
      const testPoint = createTestPoint(testPointData);
      const updatedTestPoint = updateTestPoint(testPoint.id, { title: '更新后的测试点标题' });
      expect(updatedTestPoint).toBeDefined();
      if (updatedTestPoint) {
        expect(updatedTestPoint.title).toBe('更新后的测试点标题');
      }
    });

    it('should return undefined when updating non-existent test point', () => {
      const updatedTestPoint = updateTestPoint('non-existent-id', { title: '更新后的测试点标题' });
      expect(updatedTestPoint).toBeUndefined();
    });

    it('should delete a test point', () => {
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
      const testPoint = createTestPoint(testPointData);
      const result = deleteTestPoint(testPoint.id);
      expect(result).toBe(true);
      const foundTestPoint = getTestPointById(testPoint.id);
      expect(foundTestPoint).toBeUndefined();
    });

    it('should return false when deleting non-existent test point', () => {
      const result = deleteTestPoint('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('Test Case Management', () => {
    it('should create a test case', () => {
      // First create a test point
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      const testCaseData = {
        test_point_id: testPoint.id,
        title: '测试用例标题',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件',
        testData: '测试数据',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果',
        postconditions: '后置条件',
        description: '测试用例描述'
      };
      const testCase = createTestCase(testCaseData);
      expect(testCase).toHaveProperty('id');
      expect(testCase.title).toBe(testCaseData.title);
      expect(testCase.test_point_id).toBe(testPoint.id);
    });

    it('should get test cases', () => {
      // First create a test point
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      // Create some test cases
      createTestCase({
        test_point_id: testPoint.id,
        title: '测试用例1',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件1',
        testData: '测试数据1',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果1',
        postconditions: '后置条件1',
        description: '测试用例描述1'
      });
      createTestCase({
        test_point_id: testPoint.id,
        title: '测试用例2',
        type: '异常测试',
        priority: 'P1',
        preconditions: '前置条件2',
        testData: '测试数据2',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果2',
        postconditions: '后置条件2',
        description: '测试用例描述2'
      });
      
      const testCases = getTestCases();
      expect(Array.isArray(testCases)).toBe(true);
      expect(testCases.length).toBeGreaterThan(0);
    });

    it('should get test cases by test_point_id', () => {
      // First create test points
      const testPoint1 = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点1',
        description: '描述1',
        validation_target: '目标1',
        validation_content: '内容1',
        expected_result: '结果1',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      const testPoint2 = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点2',
        description: '描述2',
        validation_target: '目标2',
        validation_content: '内容2',
        expected_result: '结果2',
        priority: 'P1',
        type: '边界测试',
        status: '待实现'
      });
      
      // Create test cases
      createTestCase({
        test_point_id: testPoint1.id,
        title: '测试用例1',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件1',
        testData: '测试数据1',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果1',
        postconditions: '后置条件1',
        description: '测试用例描述1'
      });
      createTestCase({
        test_point_id: testPoint2.id,
        title: '测试用例2',
        type: '异常测试',
        priority: 'P1',
        preconditions: '前置条件2',
        testData: '测试数据2',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果2',
        postconditions: '后置条件2',
        description: '测试用例描述2'
      });
      
      const testCases = getTestCases(testPoint1.id);
      expect(Array.isArray(testCases)).toBe(true);
      expect(testCases.length).toBeGreaterThan(0);
      testCases.forEach(testCase => {
        expect(testCase.test_point_id).toBe(testPoint1.id);
      });
    });

    it('should get test case by id', () => {
      // First create a test point
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      const testCaseData = {
        test_point_id: testPoint.id,
        title: '测试用例标题',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件',
        testData: '测试数据',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果',
        postconditions: '后置条件',
        description: '测试用例描述'
      };
      const testCase = createTestCase(testCaseData);
      const foundTestCase = getTestCaseById(testCase.id);
      expect(foundTestCase).toBeDefined();
      expect(foundTestCase?.id).toBe(testCase.id);
    });

    it('should update a test case', () => {
      // First create a test point
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      const testCaseData = {
        test_point_id: testPoint.id,
        title: '测试用例标题',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件',
        testData: '测试数据',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果',
        postconditions: '后置条件',
        description: '测试用例描述'
      };
      const testCase = createTestCase(testCaseData);
      const updatedTestCase = updateTestCase(testCase.id, { title: '更新后的测试用例标题' });
      expect(updatedTestCase).toBeDefined();
      if (updatedTestCase) {
        expect(updatedTestCase.title).toBe('更新后的测试用例标题');
      }
    });

    it('should return undefined when updating non-existent test case', () => {
      const updatedTestCase = updateTestCase('non-existent-id', { title: '更新后的测试用例标题' });
      expect(updatedTestCase).toBeUndefined();
    });

    it('should delete a test case', () => {
      // First create a test point
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      const testCaseData = {
        test_point_id: testPoint.id,
        title: '测试用例标题',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件',
        testData: '测试数据',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果',
        postconditions: '后置条件',
        description: '测试用例描述'
      };
      const testCase = createTestCase(testCaseData);
      const result = deleteTestCase(testCase.id);
      expect(result).toBe(true);
      const foundTestCase = getTestCaseById(testCase.id);
      expect(foundTestCase).toBeUndefined();
    });

    it('should return false when deleting non-existent test case', () => {
      const result = deleteTestCase('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('Test Case Utility Functions', () => {
    it('should save test cases', () => {
      // First create a test point
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      const testCases = [
        {
          id: 'TC-001',
          test_point_id: testPoint.id,
          title: '测试用例1',
          type: '功能测试',
          priority: 'P0',
          preconditions: '前置条件1',
          testData: '测试数据1',
          steps: ['步骤1', '步骤2'],
          expectedResult: '预期结果1',
          postconditions: '后置条件1',
          description: '测试用例描述1'
        }
      ];
      
      saveTestCases(testCases);
      const allTestCases = getAllTestCases();
      expect(Array.isArray(allTestCases)).toBe(true);
      expect(allTestCases.length).toBeGreaterThan(0);
    });

    it('should get all test cases', () => {
      // First create a test point
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      // Create a test case
      createTestCase({
        test_point_id: testPoint.id,
        title: '测试用例1',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件1',
        testData: '测试数据1',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果1',
        postconditions: '后置条件1',
        description: '测试用例描述1'
      });
      
      const allTestCases = getAllTestCases();
      expect(Array.isArray(allTestCases)).toBe(true);
      expect(allTestCases.length).toBeGreaterThan(0);
    });

    it('should clear test cases', () => {
      // First create a test point and test case
      const testPoint = createTestPoint({
        requirement_id: 'req-001',
        title: '测试点标题',
        description: '测试点描述',
        validation_target: '验证目标',
        validation_content: '验证内容',
        expected_result: '预期结果',
        priority: 'P0',
        type: '功能测试',
        status: '待实现'
      });
      
      createTestCase({
        test_point_id: testPoint.id,
        title: '测试用例1',
        type: '功能测试',
        priority: 'P0',
        preconditions: '前置条件1',
        testData: '测试数据1',
        steps: ['步骤1', '步骤2'],
        expectedResult: '预期结果1',
        postconditions: '后置条件1',
        description: '测试用例描述1'
      });
      
      clearTestCases();
      const allTestCases = getAllTestCases();
      expect(Array.isArray(allTestCases)).toBe(true);
      expect(allTestCases.length).toBe(0);
    });
  });

  describe('Knowledge Search', () => {
    it('should search knowledge', () => {
      // First create a category and knowledge items
      const category = createCategory({ name: '测试分类', parent_id: null, description: '测试分类描述' });
      createKnowledgeItem({ title: '登录功能', content: '用户登录系统的功能', type: '文档', category_id: category.id });
      createKnowledgeItem({ title: '注册功能', content: '用户注册系统的功能', type: '文档', category_id: category.id });
      
      const results = searchKnowledge('登录');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      results.forEach(item => {
        expect(item.title.toLowerCase()).toContain('登录');
        expect(item.content.toLowerCase()).toContain('登录');
      });
    });

    it('should return empty array when no results', () => {
      const results = searchKnowledge('不存在的关键词');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });
});
