import Papa from 'papaparse';
import { FileType } from '@/types/formatter';
// Use dynamic import for pdf-parse to avoid Node.js fs dependency at build time
// This will be loaded only when needed for PDF parsing

/**
 * Parse a file based on its type
 * @param file The file to parse
 * @param fileType The type of the file
 * @returns Object containing columns and data
 */
export const parseFile = async (
  file: File,
  fileType: FileType
): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  switch (fileType) {
    case 'csv':
      return parseCSV(file);
    case 'excel':
      return parseExcel(file);
    case 'json':
      return parseJSON(file);
    case 'xml':
      return parseXML(file);
    case 'pdf':
      return parsePDF(file);
    case 'txt':
      return parseTXT(file);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

/**
 * Parse a CSV file
 * @param file The CSV file to parse
 * @returns Object containing columns and data
 */
const parseCSV = (file: File): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        // Get the column names
        const columns = results.meta.fields || [];
        
        // Get the data
        const data = results.data as Record<string, any>[];
        
        resolve({
          columns,
          data: data.slice(0, 100) // Limit to first 100 rows for sample data
        });
      },
      error: (error) => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    });
  });
};

/**
 * Parse an Excel file
 * @param file The Excel file to parse
 * @returns Object containing columns and data
 */
const parseExcel = (file: File): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read Excel file'));
          return;
        }
        
        // Parse the Excel data (dynamic import for bundle optimization)
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        // Get column names from the first row
        const columns = (jsonData[0] as string[]).map(String);
        
        // Convert remaining rows to objects
        const rows = jsonData.slice(1).map((row: any) => {
          const obj: Record<string, any> = {};
          (row as any[]).forEach((value, index) => {
            if (index < columns.length) {
              obj[columns[index]] = value;
            }
          });
          return obj;
        });
        
        resolve({
          columns,
          data: rows.slice(0, 100) // Limit to first 100 rows for sample data
        });
      } catch (error) {
        reject(new Error(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse a JSON file
 * @param file The JSON file to parse
 * @returns Object containing columns and data
 */
const parseJSON = (file: File): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const jsonData = JSON.parse(jsonString);
        
        // Handle array of objects
        if (Array.isArray(jsonData)) {
          if (jsonData.length === 0) {
            reject(new Error('JSON file contains an empty array'));
            return;
          }
          
          // Get unique columns from all objects
          const columns = Array.from(
            new Set(
              jsonData.flatMap(item => Object.keys(item))
            )
          );
          
          resolve({
            columns,
            data: jsonData.slice(0, 100) // Limit to first 100 rows for sample data
          });
        } 
        // Handle single object with array property
        else if (jsonData && typeof jsonData === 'object') {
          // Find the first array property
          const arrayProp = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
          
          if (arrayProp && jsonData[arrayProp].length > 0) {
            const dataArray = jsonData[arrayProp];
            const columns: string[] = Array.from(
              new Set(
                dataArray.flatMap((item: Record<string, any>) => Object.keys(item))
              )
            );
            
            resolve({
              columns,
              data: dataArray.slice(0, 100) // Limit to first 100 rows for sample data
            });
          } else {
            // Treat the object itself as a single row
            const columns = Object.keys(jsonData);
            resolve({
              columns,
              data: [jsonData]
            });
          }
        } else {
          reject(new Error('JSON file format not recognized'));
        }
      } catch (error) {
        reject(new Error(`Error parsing JSON file: ${error instanceof Error ? error.message : 'Invalid JSON'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading JSON file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse an XML file
 * @param file The XML file to parse
 * @returns Object containing columns and data
 */
const parseXML = (file: File): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const xmlString = e.target?.result as string;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        
        // XML parsing is more complex and varies based on structure
        // This is a simplified approach that works for basic XML
        
        // Find repeating elements (assume these are data rows)
        // We'll look for elements that have multiple instances under the same parent
        const allElements = xmlDoc.getElementsByTagName('*');
        const elementCounts = new Map<string, number>();
        
        for (let i = 0; i < allElements.length; i++) {
          const tagName = allElements[i].tagName;
          elementCounts.set(tagName, (elementCounts.get(tagName) || 0) + 1);
        }
        
        // Find potential row elements (elements with multiple instances)
        const rowElements = Array.from(elementCounts.entries())
          .filter(([_, count]) => count > 1)
          .map(([tagName]) => tagName)
          .sort((a, b) => {
            // Prefer elements that have more instances
            return (elementCounts.get(b) || 0) - (elementCounts.get(a) || 0);
          });
        
        if (rowElements.length === 0) {
          reject(new Error('Could not identify repeating elements in XML'));
          return;
        }
        
        // Use the most common repeating element as row
        const rowTagName = rowElements[0];
        const rows = xmlDoc.getElementsByTagName(rowTagName);
        
        if (rows.length === 0) {
          reject(new Error(`No elements found with tag ${rowTagName}`));
          return;
        }
        
        // Get columns from child elements of the first row
        const firstRow = rows[0];
        const childElements = Array.from(firstRow.children);
        const columns = childElements.map(el => el.tagName);
        
        // Convert rows to data objects
        const data: Record<string, any>[] = [];
        
        for (let i = 0; i < Math.min(rows.length, 100); i++) {
          const rowElement = rows[i];
          const rowData: Record<string, any> = {};
          
          for (const column of columns) {
            const elementValue = rowElement.getElementsByTagName(column)[0]?.textContent || '';
            rowData[column] = elementValue;
          }
          
          data.push(rowData);
        }
        
        resolve({
          columns,
          data
        });
      } catch (error) {
        reject(new Error(`Error parsing XML file: ${error instanceof Error ? error.message : 'Invalid XML'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading XML file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Parse a PDF file - Browser-compatible fallback
 * @param file The PDF file to parse
 * @returns Object containing columns and data
 */
const parsePDF = (file: File): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  return new Promise((resolve, reject) => {
    // For now, PDF parsing in browser is limited
    // In a real application, you would either:
    // 1. Use a server-side API endpoint for PDF processing
    // 2. Use PDF.js library for browser-based PDF text extraction
    // 3. Ask users to convert PDFs to supported formats
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) {
          reject(new Error('Failed to read PDF file'));
          return;
        }
        
        // Browser-safe PDF handling - provide informative message
        resolve({
          columns: ['Information'],
          data: [
            { 
              'Information': 'PDF files are not currently supported for direct parsing in the browser.' 
            },
            { 
              'Information': 'Please convert your PDF to CSV, Excel, or JSON format for processing.' 
            },
            { 
              'Information': 'Alternatively, copy and paste the data from your PDF into a text file.' 
            },
            { 
              'Information': `File name: ${file.name}` 
            },
            { 
              'Information': `File size: ${(file.size / 1024).toFixed(2)} KB` 
            },
            { 
              'Information': 'Supported formats: CSV, Excel (.xlsx, .xls), JSON, XML, TXT' 
            }
          ]
        });
      } catch (error) {
        reject(new Error(`Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading PDF file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse a TXT file
 * @param file The TXT file to parse
 * @returns Object containing columns and data
 */
const parseTXT = (file: File): Promise<{
  columns: string[];
  data: Record<string, any>[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const textContent = e.target?.result as string;
        if (!textContent) {
          reject(new Error('Failed to read text file'));
          return;
        }
        
        // Split into lines
        const lines = textContent.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        
        if (lines.length === 0) {
          reject(new Error('Text file is empty'));
          return;
        }
        
        // Try to detect if this is a delimited file (CSV-like)
        const delimiters = [',', '\t', '|', ';'];
        let bestDelimiter = '';
        let maxFieldCount = 0;
        
        // Find the most likely delimiter by checking what creates the most consistent columns
        for (const delimiter of delimiters) {
          const fieldCounts = lines.slice(0, 10).map(line => line.split(delimiter).length);
          const avgFieldCount = fieldCounts.reduce((a, b) => a + b, 0) / fieldCounts.length;
          const consistentFields = fieldCounts.every(count => 
            Math.abs(count - avgFieldCount) <= 1 && count > 1
          );
          
          if (consistentFields && avgFieldCount > maxFieldCount) {
            maxFieldCount = avgFieldCount;
            bestDelimiter = delimiter;
          }
        }
        
        // If we found a likely delimiter, parse as delimited
        if (bestDelimiter && maxFieldCount > 1) {
          // Parse as a delimited file
          const headers = lines[0].split(bestDelimiter).map(h => h.trim());
          const data: Record<string, any>[] = [];
          
          for (let i = 1; i < Math.min(lines.length, 100); i++) {
            const rowValues = lines[i].split(bestDelimiter).map(val => val.trim());
            const rowData: Record<string, any> = {};
            
            for (let j = 0; j < headers.length; j++) {
              rowData[headers[j]] = rowValues[j] || '';
            }
            
            data.push(rowData);
          }
          
          resolve({
            columns: headers,
            data
          });
        } else {
          // Parse as plain text with line numbers
          const data = lines.slice(0, 100).map((line, index) => ({
            LineNumber: index + 1,
            Text: line
          }));
          
          resolve({
            columns: ['LineNumber', 'Text'],
            data
          });
        }
      } catch (error) {
        reject(new Error(`Error parsing text file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading text file'));
    };
    
    reader.readAsText(file);
  });
};