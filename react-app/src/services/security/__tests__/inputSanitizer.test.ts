import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeString,
  sanitizeObject,
  validateFile,
  sanitizeWorkbookData,
  sanitizeParsedData,
  rateLimiter,
  securityConfig,
} from '../inputSanitizer';

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input) => input.replace(/<script.*?<\/script>/gi, '')),
  },
}));

describe('Input Sanitizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    securityConfig.enable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).toBe('<p>Safe content</p>');
    });

    it('should handle empty strings', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle non-string inputs', () => {
      const result = sanitizeHtml(null as any);
      expect(result).toBe('');
    });

    it('should throw error for overly long input', () => {
      const longInput = 'a'.repeat(10001);
      expect(() => sanitizeHtml(longInput)).toThrow('Input too long');
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize dangerous characters', () => {
      const maliciousString = '<script>alert("xss")</script>';
      const result = sanitizeString(maliciousString);
      expect(result).toBe('alert("xss")');
    });

    it('should remove javascript: protocol', () => {
      const maliciousString = 'javascript:alert("xss")';
      const result = sanitizeString(maliciousString);
      expect(result).toBe('alert("xss")');
    });

    it('should remove data: protocol', () => {
      const maliciousString = 'data:text/html,<script>alert("xss")</script>';
      const result = sanitizeString(maliciousString);
      expect(result).toBe('text/html,alert("xss")');
    });

    it('should remove event handlers', () => {
      const maliciousString = 'onclick=alert("xss")';
      const result = sanitizeString(maliciousString);
      expect(result).toBe('alert("xss")');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
    });

    it('should trim whitespace', () => {
      const result = sanitizeString('  test  ');
      expect(result).toBe('test');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize object properties', () => {
      const maliciousObject = {
        safe: 'safe value',
        dangerous: '<script>alert("xss")</script>',
        number: 42,
        boolean: true,
      };

      const result = sanitizeObject(maliciousObject);
      expect(result).toEqual({
        safe: 'safe value',
        dangerous: 'alert("xss")',
        number: 42,
        boolean: true,
      });
    });

    it('should prevent prototype pollution', () => {
      const maliciousObject = {
        __proto__: { polluted: true },
        constructor: { polluted: true },
        prototype: { polluted: true },
        safe: 'value',
      };

      const result = sanitizeObject(maliciousObject);
      expect(result).toEqual({
        safe: 'value',
      });
      expect(result.__proto__).toBeUndefined();
      expect(result.constructor).toBeUndefined();
      expect(result.prototype).toBeUndefined();
    });

    it('should handle nested objects', () => {
      const nestedObject = {
        level1: {
          level2: {
            dangerous: '<script>alert("xss")</script>',
            safe: 'value',
          },
        },
      };

      const result = sanitizeObject(nestedObject);
      expect(result.level1.level2.dangerous).toBe('alert("xss")');
      expect(result.level1.level2.safe).toBe('value');
    });

    it('should handle arrays', () => {
      const arrayObject = {
        items: ['safe', '<script>alert("xss")</script>', 42],
      };

      const result = sanitizeObject(arrayObject);
      expect(result.items).toEqual(['safe', 'alert("xss")', 42]);
    });

    it('should prevent deep nesting attacks', () => {
      const deepObject = { level1: { level2: { level3: { level4: { level5: { level6: { level7: { level8: { level9: { level10: { level11: 'deep' } } } } } } } } } } };
      
      expect(() => sanitizeObject(deepObject)).toThrow('Object too deeply nested');
    });

    it('should handle large arrays', () => {
      const largeArray = new Array(1001).fill('item');
      expect(() => sanitizeObject(largeArray)).toThrow('Array too long');
    });

    it('should handle infinite and NaN numbers', () => {
      const result = sanitizeObject({
        infinity: Infinity,
        negativeInfinity: -Infinity,
        nan: NaN,
      });

      expect(result).toEqual({
        infinity: 0,
        negativeInfinity: 0,
        nan: 0,
      });
    });
  });

  describe('validateFile', () => {
    it('should validate allowed file types', () => {
      const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      expect(() => validateFile(mockFile)).not.toThrow();
    });

    it('should reject disallowed file types', () => {
      const mockFile = new File(['content'], 'test.exe', { type: 'application/octet-stream' });
      expect(() => validateFile(mockFile)).toThrow('Invalid file type');
    });

    it('should reject oversized files', () => {
      const mockFile = new File(['x'.repeat(51 * 1024 * 1024)], 'test.csv', { type: 'text/csv' });
      expect(() => validateFile(mockFile)).toThrow('File too large');
    });

    it('should reject suspicious file extensions', () => {
      const mockFile = new File(['content'], 'test.exe', { type: 'text/csv' });
      expect(() => validateFile(mockFile)).toThrow('Suspicious file extension');
    });

    it('should reject files with invalid names', () => {
      const mockFile = new File(['content'], '<script>alert("xss")</script>.csv', { type: 'text/csv' });
      expect(() => validateFile(mockFile)).toThrow('Invalid filename');
    });
  });

  describe('sanitizeWorkbookData', () => {
    it('should sanitize workbook structure', () => {
      const mockWorkbook = {
        SheetNames: ['Sheet1', 'Sheet2'],
        Sheets: {
          Sheet1: {
            A1: { v: 'safe value' },
            B1: { v: '<script>alert("xss")</script>' },
          },
          Sheet2: {
            A1: { v: 'another safe value' },
          },
        },
      };

      const result = sanitizeWorkbookData(mockWorkbook);
      expect(result.SheetNames).toEqual(['Sheet1', 'Sheet2']);
      expect(result.Sheets.Sheet1.B1.v).toBe('alert("xss")');
    });

    it('should handle invalid workbook data', () => {
      expect(() => sanitizeWorkbookData(null)).toThrow('Invalid workbook data');
      expect(() => sanitizeWorkbookData(undefined)).toThrow('Invalid workbook data');
      expect(() => sanitizeWorkbookData('not an object')).toThrow('Invalid workbook data');
    });

    it('should limit number of sheets', () => {
      const manySheets = Array.from({ length: 15 }, (_, i) => `Sheet${i + 1}`);
      const mockWorkbook = {
        SheetNames: manySheets,
        Sheets: {},
      };

      const result = sanitizeWorkbookData(mockWorkbook);
      expect(result.SheetNames).toHaveLength(10);
    });
  });

  describe('sanitizeParsedData', () => {
    it('should sanitize parsed data structure', () => {
      const mockData = {
        columns: ['safe_column', '<script>alert("xss")</script>'],
        data: [
          { safe_column: 'safe value', dangerous_column: '<script>alert("xss")</script>' },
          { safe_column: 'another safe value', dangerous_column: 'clean value' },
        ],
      };

      const result = sanitizeParsedData(mockData);
      expect(result.columns).toEqual(['safe_column', 'alert("xss")']);
      expect(result.data[0].dangerous_column).toBe('alert("xss")');
    });

    it('should limit number of columns', () => {
      const manyColumns = Array.from({ length: 150 }, (_, i) => `column${i + 1}`);
      const mockData = {
        columns: manyColumns,
        data: [],
      };

      const result = sanitizeParsedData(mockData);
      expect(result.columns).toHaveLength(100);
    });

    it('should limit number of rows', () => {
      const manyRows = Array.from({ length: 15000 }, (_, i) => ({ id: i }));
      const mockData = {
        columns: ['id'],
        data: manyRows,
      };

      const result = sanitizeParsedData(mockData);
      expect(result.data).toHaveLength(10000);
    });
  });

  describe('rateLimiter', () => {
    it('should allow operations within rate limit', () => {
      expect(rateLimiter.canProceed('test-key')).toBe(true);
      expect(rateLimiter.canProceed('test-key')).toBe(true);
    });

    it('should prevent operations exceeding rate limit', () => {
      // Simulate many operations
      for (let i = 0; i < 100; i++) {
        rateLimiter.canProceed('test-key-2');
      }
      
      expect(rateLimiter.canProceed('test-key-2')).toBe(false);
    });

    it('should reset rate limit after time window', async () => {
      // Fill up the rate limit
      for (let i = 0; i < 100; i++) {
        rateLimiter.canProceed('test-key-3');
      }
      
      expect(rateLimiter.canProceed('test-key-3')).toBe(false);
      
      // Wait for time window to pass (mocked)
      vi.advanceTimersByTime(61000);
      
      expect(rateLimiter.canProceed('test-key-3')).toBe(true);
    });
  });

  describe('securityConfig', () => {
    it('should be enabled by default', () => {
      expect(securityConfig.enabled).toBe(true);
    });

    it('should allow configuration updates', () => {
      const newConfig = { maxStringLength: 5000 };
      securityConfig.updateConfig(newConfig);
      
      const config = securityConfig.getConfig();
      expect(config.maxStringLength).toBe(5000);
    });

    it('should allow disabling security features', () => {
      securityConfig.disable();
      expect(securityConfig.enabled).toBe(false);
      
      securityConfig.enable();
      expect(securityConfig.enabled).toBe(true);
    });
  });
});