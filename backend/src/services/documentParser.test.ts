import { extractTextFromDocx, extractTextFromPdf, extractTextFromTxt } from './documentParser';
import * as fs from 'fs';
import * as _path from 'path';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock mammoth module
jest.mock('mammoth', () => ({
  extractRawText: jest.fn()
}));
import * as mammoth from 'mammoth';
const mockMammoth = mammoth as jest.Mocked<typeof mammoth>;

// Mock pdf-parse module
jest.mock('pdf-parse', () => jest.fn());
import pdfParse from 'pdf-parse';
const mockPdfParse = pdfParse as jest.Mocked<typeof pdfParse>;

describe('Document Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractTextFromTxt', () => {
    it('should extract text from txt files', () => {
      const testTxtPath = 'test.txt';
      const mockContent = 'This is a test text';
      
      mockFs.readFileSync.mockReturnValue(mockContent);
      
      const result = extractTextFromTxt(testTxtPath);
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(testTxtPath, 'utf-8');
      expect(result).toBe(mockContent);
    });

    it('should throw error when file reading fails', () => {
      const testTxtPath = 'test.txt';
      
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      expect(() => extractTextFromTxt(testTxtPath)).toThrow('File not found');
    });
  });

  describe('extractTextFromDocx', () => {
    it('should extract text from docx files using mammoth', async () => {
      const testDocxPath = 'test.docx';
      const mockContent = 'This is a test docx content';
      
      mockMammoth.extractRawText.mockResolvedValue({
        value: mockContent,
        messages: []
      });
      
      const result = await extractTextFromDocx(testDocxPath);
      
      expect(mockMammoth.extractRawText).toHaveBeenCalledWith({ path: testDocxPath });
      expect(result).toBe(mockContent);
    });

    it('should use fallback method when mammoth fails', async () => {
      const testDocxPath = 'test.docx';
      const mockContent = 'This is fallback content';
      
      // Mock mammoth to fail
      mockMammoth.extractRawText.mockRejectedValue(new Error('Mammoth failed'));
      // Mock fs to return content
      mockFs.readFileSync.mockReturnValue(Buffer.from(mockContent));
      
      const result = await extractTextFromDocx(testDocxPath);
      
      expect(mockMammoth.extractRawText).toHaveBeenCalledWith({ path: testDocxPath });
      expect(mockFs.readFileSync).toHaveBeenCalledWith(testDocxPath);
      expect(result).toBe(mockContent);
    });

    it('should throw error when both mammoth and fallback fail', async () => {
      const testDocxPath = 'test.docx';
      
      // Mock mammoth to fail
      mockMammoth.extractRawText.mockRejectedValue(new Error('Mammoth failed'));
      // Mock fs to fail
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('FS failed');
      });
      
      await expect(extractTextFromDocx(testDocxPath)).rejects.toThrow('FS failed');
    });
  });

  describe('extractTextFromPdf', () => {
    it('should extract text from pdf files', async () => {
      const testPdfPath = 'test.pdf';
      const mockContent = 'This is a test pdf content';
      
      // Mock fs to return buffer
      const mockBuffer = Buffer.from('pdf content');
      mockFs.readFileSync.mockReturnValue(mockBuffer);
      // Mock pdf-parse to return content
      (mockPdfParse as any).mockResolvedValue({
        text: mockContent,
        info: {},
        metadata: {},
        version: '',
        numpages: 1
      });
      
      const result = await extractTextFromPdf(testPdfPath);
      
      expect(mockFs.readFileSync).toHaveBeenCalledWith(testPdfPath);
      expect(mockPdfParse).toHaveBeenCalledWith(mockBuffer);
      expect(result).toBe(mockContent);
    });

    it('should return empty string when pdf has no text', async () => {
      const testPdfPath = 'test.pdf';
      
      // Mock fs to return buffer
      const mockBuffer = Buffer.from('pdf content');
      mockFs.readFileSync.mockReturnValue(mockBuffer);
      // Mock pdf-parse to return no text
      (mockPdfParse as any).mockResolvedValue({
        text: '',
        info: {},
        metadata: {},
        version: '',
        numpages: 1
      });
      
      const result = await extractTextFromPdf(testPdfPath);
      
      expect(result).toBe('');
    });

    it('should throw error when pdf parsing fails', async () => {
      const testPdfPath = 'test.pdf';
      
      // Mock fs to return buffer
      const mockBuffer = Buffer.from('pdf content');
      mockFs.readFileSync.mockReturnValue(mockBuffer);
      // Mock pdf-parse to fail
      (mockPdfParse as any).mockRejectedValue(new Error('PDF parsing failed'));
      
      await expect(extractTextFromPdf(testPdfPath)).rejects.toThrow('PDF parsing failed');
    });

    it('should throw error when file reading fails', async () => {
      const testPdfPath = 'test.pdf';
      
      // Mock fs to fail
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      await expect(extractTextFromPdf(testPdfPath)).rejects.toThrow('File not found');
    });
  });
});
