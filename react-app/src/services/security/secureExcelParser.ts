/**
 * Secure Excel parser that wraps xlsx with security protections
 * 
 * Provides protection against:
 * - Prototype pollution attacks
 * - ReDoS (Regular Expression Denial of Service) attacks
 * - Memory exhaustion attacks
 * - Malicious file processing
 */

import { 
  validateFile, 
  withTimeout, 
  sanitizeWorkbookData, 
  sanitizeParsedData, 
  rateLimiter,
  securityConfig
} from './inputSanitizer';

/**
 * Secure Excel parsing options
 */
interface SecureExcelOptions {
  maxRows?: number;
  maxColumns?: number;
  maxFileSize?: number;
  timeoutMs?: number;
  sheetIndex?: number;
  sheetName?: string;
}

/**
 * Default secure options
 */
const DEFAULT_OPTIONS: Required<SecureExcelOptions> = {
  maxRows: 10000,
  maxColumns: 100,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  timeoutMs: 30000, // 30 seconds
  sheetIndex: 0,
  sheetName: '',
};

/**
 * Security-hardened Excel parser
 */
export class SecureExcelParser {
  private options: Required<SecureExcelOptions>;
  
  constructor(options: SecureExcelOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  /**
   * Parse Excel file with security protections
   */
  async parseExcelFile(file: File): Promise<{
    columns: string[];
    data: Record<string, any>[];
  }> {
    // Security checks
    if (!securityConfig.enabled) {
      throw new Error('Security features are disabled');
    }
    
    // Rate limiting
    const rateLimitKey = `excel_parse_${file.name}_${file.size}`;
    if (!rateLimiter.canProceed(rateLimitKey)) {
      throw new Error('Rate limit exceeded for file parsing');
    }
    
    // File validation
    validateFile(file);
    
    // Additional Excel-specific validations
    if (file.size > this.options.maxFileSize) {
      throw new Error(`Excel file too large: ${file.size} bytes`);
    }
    
    // Wrap the entire operation with timeout
    return withTimeout(
      this.parseExcelFileInternal(file),
      this.options.timeoutMs
    );
  }
  
  /**
   * Internal Excel parsing implementation
   */
  private async parseExcelFileInternal(file: File): Promise<{
    columns: string[];
    data: Record<string, any>[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read Excel file'));
            return;
          }
          
          if (!(data instanceof ArrayBuffer)) {
            reject(new Error('Invalid file format - expected binary data'));
            return;
          }
          
          // Parse with security wrapper
          const result = await this.parseExcelData(data);
          
          // Sanitize the result
          const sanitizedResult = sanitizeParsedData(result);
          
          // Apply limits
          const limitedResult = this.applyLimits(sanitizedResult);
          
          resolve(limitedResult);
        } catch (error) {
          reject(new Error(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading Excel file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
  
  /**
   * Parse Excel data with security protections using secure ExcelJS
   */
  private async parseExcelData(data: ArrayBuffer): Promise<{
    columns: string[];
    data: Record<string, any>[];
  }> {
    // Dynamic import to avoid loading exceljs unless needed
    const ExcelJS = await import('exceljs');
    
    // Security wrapper around ExcelJS.Workbook
    let workbook: any;
    try {
      // Create workbook instance with security considerations
      workbook = new ExcelJS.Workbook();
      
      // Parse with security-focused options - ExcelJS is inherently more secure
      await workbook.xlsx.load(data);
    } catch (error) {
      throw new Error('Failed to parse Excel file: Invalid or corrupted file');
    }
    
    // Sanitize workbook to prevent prototype pollution
    const sanitizedWorkbook = sanitizeWorkbookData(workbook);
    
    // Get sheet to process
    const sheet = this.getTargetSheet(sanitizedWorkbook);
    
    // Convert to JSON with security limits
    const jsonData = await this.convertSheetToJsonExcelJS(sheet);
    
    if (jsonData.length === 0) {
      throw new Error('Excel file is empty or contains no data');
    }
    
    // Extract columns and data
    const columns = this.extractColumns(jsonData);
    const processedData = this.extractData(jsonData, columns);
    
    return {
      columns,
      data: processedData
    };
  }
  
  /**
   * Get target sheet with security checks (ExcelJS version)
   */
  private getTargetSheet(workbook: any): any {
    if (!workbook.worksheets || workbook.worksheets.length === 0) {
      throw new Error('Excel file contains no sheets');
    }
    
    // Determine which sheet to use
    let sheet: any;
    if (this.options.sheetName) {
      sheet = workbook.getWorksheet(this.options.sheetName);
      if (!sheet) {
        throw new Error(`Sheet "${this.options.sheetName}" not found`);
      }
    } else {
      if (this.options.sheetIndex >= workbook.worksheets.length) {
        throw new Error(`Sheet index ${this.options.sheetIndex} out of range`);
      }
      sheet = workbook.worksheets[this.options.sheetIndex];
    }
    
    if (!sheet) {
      throw new Error(`Sheet is empty or corrupted`);
    }
    
    return sheet;
  }
  
  /**
   * Convert sheet to JSON with security limits (ExcelJS version)
   */
  private async convertSheetToJsonExcelJS(sheet: any): Promise<any[]> {
    try {
      const jsonData: any[] = [];
      
      // Get the actual dimensions of the sheet
      const rowCount = Math.min(sheet.actualRowCount || 0, this.options.maxRows);
      const colCount = Math.min(sheet.actualColumnCount || 0, this.options.maxColumns);
      
      // Convert each row to array format
      for (let rowIndex = 1; rowIndex <= rowCount; rowIndex++) {
        const row = sheet.getRow(rowIndex);
        const rowData: any[] = [];
        
        // Convert each cell in the row
        for (let colIndex = 1; colIndex <= colCount; colIndex++) {
          const cell = row.getCell(colIndex);
          let cellValue = '';
          
          if (cell && cell.value !== null && cell.value !== undefined) {
            // Handle different cell types securely
            if (typeof cell.value === 'string') {
              cellValue = cell.value;
            } else if (typeof cell.value === 'number') {
              cellValue = cell.value.toString();
            } else if (cell.value instanceof Date) {
              cellValue = cell.value.toISOString();
            } else if (cell.value && typeof cell.value === 'object' && 'text' in cell.value) {
              // Handle rich text objects
              cellValue = cell.value.text || '';
            } else {
              cellValue = String(cell.value);
            }
          }
          
          rowData.push(cellValue);
        }
        
        // Only add non-empty rows
        if (rowData.some(cell => cell !== '')) {
          jsonData.push(rowData);
        }
      }
      
      return jsonData;
    } catch (error) {
      throw new Error('Failed to convert sheet to JSON');
    }
  }

  
  /**
   * Extract columns from JSON data
   */
  private extractColumns(jsonData: any[]): string[] {
    if (jsonData.length === 0) {
      return [];
    }
    
    // Get columns from first row
    const firstRow = jsonData[0];
    if (!Array.isArray(firstRow)) {
      throw new Error('Invalid data format');
    }
    
    // Convert to strings and apply limits
    const columns = firstRow
      .map((col: any) => String(col || ''))
      .filter((col: string) => col.trim().length > 0)
      .slice(0, this.options.maxColumns);
    
    return columns;
  }
  
  /**
   * Extract data rows from JSON data
   */
  private extractData(jsonData: any[], columns: string[]): Record<string, any>[] {
    const data: Record<string, any>[] = [];
    
    // Process data rows (skip header row)
    for (let i = 1; i < jsonData.length && data.length < this.options.maxRows; i++) {
      const row = jsonData[i];
      if (!Array.isArray(row)) {
        continue;
      }
      
      const rowData: Record<string, any> = {};
      
      // Map columns to row data
      for (let j = 0; j < columns.length; j++) {
        const value = row[j];
        const columnName = columns[j];
        
        // Sanitize value
        if (value !== null && value !== undefined) {
          rowData[columnName] = String(value);
        } else {
          rowData[columnName] = '';
        }
      }
      
      data.push(rowData);
    }
    
    return data;
  }
  
  /**
   * Apply security limits to parsed data
   */
  private applyLimits(result: {
    columns: string[];
    data: Record<string, any>[];
  }): {
    columns: string[];
    data: Record<string, any>[];
  } {
    return {
      columns: result.columns.slice(0, this.options.maxColumns),
      data: result.data.slice(0, this.options.maxRows)
    };
  }
}

/**
 * Secure Excel parsing function (convenience wrapper)
 */
export const parseExcelFileSecurely = async (
  file: File,
  options: SecureExcelOptions = {}
): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  const parser = new SecureExcelParser(options);
  return parser.parseExcelFile(file);
};

/**
 * Security audit for Excel files
 */
export const auditExcelFile = (file: File): {
  safe: boolean;
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];
  let safe = true;
  
  // Check file size
  if (file.size > 10 * 1024 * 1024) { // 10MB
    warnings.push('Large file size may impact performance');
  }
  
  if (file.size > 50 * 1024 * 1024) { // 50MB
    errors.push('File size exceeds maximum limit');
    safe = false;
  }
  
  // Check MIME type
  const allowedTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}`);
    safe = false;
  }
  
  // Check filename
  if (file.name.length > 255) {
    errors.push('Filename too long');
    safe = false;
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.exe\./i,
    /\.bat\./i,
    /\.vbs\./i,
    /\.js\./i,
    /script/i,
    /macro/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      errors.push('Suspicious filename pattern detected');
      safe = false;
      break;
    }
  }
  
  return {
    safe,
    warnings,
    errors
  };
};

export default {
  SecureExcelParser,
  parseExcelFileSecurely,
  auditExcelFile
};