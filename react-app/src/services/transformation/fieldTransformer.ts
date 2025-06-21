import { FieldTransformation } from '@/types/formatter';

/**
 * Apply a transformation to a field value
 * @param value The value to transform
 * @param transformation The transformation to apply
 * @returns The transformed value
 */
export const transformValue = (value: any, transformation: FieldTransformation): any => {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return value;
  }
  
  try {
    switch (transformation.type) {
      case 'format':
        return formatValue(value, transformation.params);
      case 'split':
        return splitValue(value, transformation.params);
      case 'join':
        return joinValue(value, transformation.params);
      case 'convert':
        return convertValue(value, transformation.params);
      default:
        return value;
    }
  } catch (error) {
    console.error('Error transforming value:', error);
    return value; // Return original value on error
  }
};

/**
 * Format a value (typically for dates)
 * @param value The value to format
 * @param params Formatting parameters
 * @returns The formatted value
 */
const formatValue = (value: any, params: Record<string, any>): any => {
  // Handle date formatting - support both old (dateFormat) and new (format with type='date') parameter formats
  const isDateFormat = params.dateFormat || (params.type === 'date' && params.format);
  if (isDateFormat) {
    const date = new Date(value);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return value; // Return original if not a valid date
    }
    
    // Check if original value contains time component (HH:MM:SS pattern)
    // const originalStr = String(value);
    // const hasTimeComponent = /\d{1,2}:\d{2}(:\d{2})?/.test(originalStr);
    
    // Determine if time should be preserved based on field name and user intent
    // This function should be called with a fieldName parameter in production
    // const fieldNameLower = (params.fieldName || '').toLowerCase();
    // const isDateField = fieldNameLower.includes('date') && !fieldNameLower.includes('time');
    // const shouldPreserveTime = hasTimeComponent && !isDateField;
    
    // Helper function to format time component
    // const formatTime = (d: Date) => {
    //   const hours = d.getHours().toString().padStart(2, '0');
    //   const minutes = d.getMinutes().toString().padStart(2, '0');
    //   const seconds = d.getSeconds().toString().padStart(2, '0');
    //   return `${hours}:${minutes}:${seconds}`;
    // };
    
    // Get the format value from either old or new parameter structure
    const dateFormatType = params.format || params.dateFormat;
    switch (dateFormatType) {
      case 'MM/DD/YYYY':
        // Always strip time for explicit date-only formats
        const mmddyyyy = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        return mmddyyyy;
      case 'DD/MM/YYYY':
        // Always strip time for explicit date-only formats
        const ddmmyyyy = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return ddmmyyyy;
      case 'YYYY-MM-DD':
        // Always strip time for explicit date-only formats
        const yyyymmdd = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        return yyyymmdd;
      case 'date-only':
        // Strip time and use standard locale date format
        return date.toLocaleDateString();
      case 'custom':
        // Very basic custom formatting - in a real app we would use a library like date-fns
        return params.customFormat
          .replace('YYYY', date.getFullYear().toString())
          .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
          .replace('DD', date.getDate().toString().padStart(2, '0'))
          .replace('HH', date.getHours().toString().padStart(2, '0'))
          .replace('mm', date.getMinutes().toString().padStart(2, '0'))
          .replace('ss', date.getSeconds().toString().padStart(2, '0'));
      default:
        return value;
    }
  }
  
  return value;
};

/**
 * Split a value and extract a part
 * @param value The value to split
 * @param params Splitting parameters
 * @returns The extracted part
 */
const splitValue = (value: any, params: Record<string, any>): any => {
  // Convert to string first
  const stringValue = String(value);
  
  // Get delimiter and index
  const delimiter = params.delimiter || ',';
  const index = params.index || 0;
  
  // Split and extract
  const parts = stringValue.split(delimiter);
  
  // Return part at index if it exists, otherwise return original
  return parts.length > index ? parts[index].trim() : value;
};

/**
 * Join multiple values
 * @param value The value to join (expected to be an array)
 * @param params Joining parameters
 * @returns The joined value
 */
const joinValue = (value: any, params: Record<string, any>): any => {
  // If not an array, return as is
  if (!Array.isArray(value)) {
    return value;
  }
  
  // Get delimiter
  const delimiter = params.delimiter || ',';
  
  // Join and return
  return value.join(delimiter);
};

/**
 * Convert a value to another type
 * @param value The value to convert
 * @param params Conversion parameters
 * @returns The converted value
 */
const convertValue = (value: any, params: Record<string, any>): any => {
  const toType = params.toType || 'string';
  
  switch (toType) {
    case 'string':
      return String(value);
    case 'number':
      const num = Number(value);
      return isNaN(num) ? value : num;
    case 'boolean':
      // Convert various values to boolean
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (['true', 'yes', '1', 'y'].includes(lowerValue)) {
          return true;
        } else if (['false', 'no', '0', 'n'].includes(lowerValue)) {
          return false;
        }
      }
      return Boolean(value);
    default:
      return value;
  }
};