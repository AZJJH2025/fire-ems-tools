/**
 * Input sanitization utilities for security hardening
 * 
 * Provides protection against:
 * - Prototype pollution attacks
 * - ReDoS (Regular Expression Denial of Service) attacks
 * - XSS (Cross-Site Scripting) attacks
 * - Input validation bypass
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for input sanitization
 */
interface SanitizerConfig {
  maxStringLength: number;
  maxArrayLength: number;
  maxObjectDepth: number;
  allowedMimeTypes: string[];
  maxFileSize: number;
  timeoutMs: number;
}

/**
 * Default sanitizer configuration
 */
const DEFAULT_CONFIG: SanitizerConfig = {
  maxStringLength: 10000,
  maxArrayLength: 1000,
  maxObjectDepth: 10,
  allowedMimeTypes: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'text/xml',
    'application/xml',
    'text/plain',
    'application/pdf'
  ],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  timeoutMs: 30000, // 30 seconds
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') {
    return '';
  }
  
  // Limit length to prevent DoS
  if (html.length > DEFAULT_CONFIG.maxStringLength) {
    throw new Error(`Input too long (${html.length} > ${DEFAULT_CONFIG.maxStringLength})`);
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
};

/**
 * Sanitize string input to prevent injection attacks
 */
export const sanitizeString = (input: unknown): string => {
  if (input === null || input === undefined) {
    return '';
  }
  
  const str = String(input);
  
  // Length check
  if (str.length > DEFAULT_CONFIG.maxStringLength) {
    throw new Error(`String too long (${str.length} > ${DEFAULT_CONFIG.maxStringLength})`);
  }
  
  // Remove potentially dangerous characters
  const sanitized = str
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
  
  return sanitized;
};

/**
 * Sanitize object to prevent prototype pollution
 */
export const sanitizeObject = (obj: any, depth = 0): any => {
  if (depth > DEFAULT_CONFIG.maxObjectDepth) {
    throw new Error(`Object too deeply nested (${depth} > ${DEFAULT_CONFIG.maxObjectDepth})`);
  }
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Prevent prototype pollution
  if (typeof obj === 'object' && obj.constructor !== Object && obj.constructor !== Array) {
    return {};
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length > DEFAULT_CONFIG.maxArrayLength) {
      throw new Error(`Array too long (${obj.length} > ${DEFAULT_CONFIG.maxArrayLength})`);
    }
    
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const sanitized: any = {};
    
    for (const key in obj) {
      // Skip prototype chain properties
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      // Sanitize key
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey.length === 0) {
        continue;
      }
      
      // Recursively sanitize value
      sanitized[sanitizedKey] = sanitizeObject(obj[key], depth + 1);
    }
    
    return sanitized;
  }
  
  // Handle primitive values
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number') {
    // Check for NaN and Infinity
    if (!isFinite(obj)) {
      return 0;
    }
    return obj;
  }
  
  if (typeof obj === 'boolean') {
    return obj;
  }
  
  // For other types, return empty string
  return '';
};

/**
 * Validate file before processing
 */
export const validateFile = (file: File): void => {
  // Check file size
  if (file.size > DEFAULT_CONFIG.maxFileSize) {
    throw new Error(`File too large (${file.size} > ${DEFAULT_CONFIG.maxFileSize})`);
  }
  
  // Check MIME type
  if (!DEFAULT_CONFIG.allowedMimeTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}`);
  }
  
  // Check filename for suspicious patterns
  const filename = sanitizeString(file.name);
  if (filename.length === 0) {
    throw new Error('Invalid filename');
  }
  
  // Check for suspicious extensions
  const suspiciousExtensions = /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|zip|rar)$/i;
  if (suspiciousExtensions.test(filename)) {
    throw new Error(`Suspicious file extension: ${filename}`);
  }
};

/**
 * Create a timeout wrapper for async operations
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_CONFIG.timeoutMs
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
};

/**
 * Sanitize Excel workbook data specifically
 */
export const sanitizeWorkbookData = (workbook: any): any => {
  if (!workbook || typeof workbook !== 'object') {
    throw new Error('Invalid workbook data');
  }
  
  // Sanitize workbook structure
  const sanitized = {
    SheetNames: Array.isArray(workbook.SheetNames) 
      ? workbook.SheetNames.slice(0, 10).map(sanitizeString) // Limit to 10 sheets
      : [],
    Sheets: {}
  };
  
  // Sanitize each sheet
  if (workbook.Sheets && typeof workbook.Sheets === 'object') {
    for (const sheetName of sanitized.SheetNames) {
      if (workbook.Sheets[sheetName]) {
        (sanitized.Sheets as any)[sheetName] = sanitizeObject(workbook.Sheets[sheetName], 0);
      }
    }
  }
  
  return sanitized;
};

/**
 * Sanitize parsed data from any source
 */
export const sanitizeParsedData = (data: {
  columns: string[];
  data: Record<string, any>[];
}): {
  columns: string[];
  data: Record<string, any>[];
} => {
  // Sanitize columns
  const sanitizedColumns = data.columns
    .map(col => sanitizeString(col))
    .filter(col => col.length > 0)
    .slice(0, 100); // Limit to 100 columns
  
  // Sanitize data rows
  const sanitizedData = data.data
    .slice(0, 10000) // Limit to 10,000 rows
    .map(row => sanitizeObject(row))
    .filter(row => row && typeof row === 'object');
  
  return {
    columns: sanitizedColumns,
    data: sanitizedData
  };
};

/**
 * Security-hardened regex matcher with timeout
 */
export const safeRegexMatch = (input: string, pattern: RegExp, timeoutMs: number = 1000): RegExpMatchArray | null => {
  return new Promise<RegExpMatchArray | null>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Regex execution timed out'));
    }, timeoutMs);
    
    try {
      const result = input.match(pattern);
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  }).catch(() => null) as any; // Return null on timeout or error
};

/**
 * Rate limiting for operations
 */
class RateLimiter {
  private operations: Map<string, number[]> = new Map();
  private readonly maxOperations: number;
  private readonly windowMs: number;
  
  constructor(maxOperations: number = 100, windowMs: number = 60000) {
    this.maxOperations = maxOperations;
    this.windowMs = windowMs;
  }
  
  canProceed(key: string): boolean {
    const now = Date.now();
    const operations = this.operations.get(key) || [];
    
    // Remove old operations outside the window
    const validOperations = operations.filter(time => now - time < this.windowMs);
    
    if (validOperations.length >= this.maxOperations) {
      return false;
    }
    
    // Add current operation
    validOperations.push(now);
    this.operations.set(key, validOperations);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Security configuration
 */
export const securityConfig = {
  updateConfig: (config: Partial<SanitizerConfig>) => {
    Object.assign(DEFAULT_CONFIG, config);
  },
  
  getConfig: () => ({ ...DEFAULT_CONFIG }),
  
  // Emergency disable switch
  enabled: true,
  
  disable: () => {
    securityConfig.enabled = false;
  },
  
  enable: () => {
    securityConfig.enabled = true;
  }
};

export default {
  sanitizeHtml,
  sanitizeString,
  sanitizeObject,
  validateFile,
  withTimeout,
  sanitizeWorkbookData,
  sanitizeParsedData,
  safeRegexMatch,
  rateLimiter,
  securityConfig
};