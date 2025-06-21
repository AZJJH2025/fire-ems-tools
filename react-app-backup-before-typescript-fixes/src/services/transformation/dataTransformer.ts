import { FieldMapping, SampleData, FieldTransformation } from '@/types/formatter';

/**
 * Transform data based on field mappings
 * @param sampleData The source data to transform
 * @param mappings The field mappings to apply
 * @returns Transformed data
 */
export const transformData = (
  sampleData: SampleData,
  mappings: FieldMapping[]
): Record<string, any>[] => {
  if (!sampleData || !sampleData.length || !mappings || !mappings.length) {
    return [];
  }

  // Transform each row in the sample data
  return sampleData.map(row => {
    const transformedRow: Record<string, any> = {};
    
    // Apply each mapping
    mappings.forEach(mapping => {
      const { sourceField, targetField, transformations } = mapping;
      
      // Handle default values (when sourceField is __default__)
      let value;
      if (sourceField === '__default__' && transformations && transformations.length > 0) {
        // Use the default value from transformations
        const defaultTransform = transformations.find(t => t.type === 'convert' && t.params.defaultValue);
        if (defaultTransform) {
          console.log(`Using default value for ${targetField}:`, defaultTransform.params.defaultValue);
          value = defaultTransform.params.defaultValue;
        } else {
          console.log(`No default value found for ${targetField}, using null`);
          value = null;
        }
      } else {
        // Get source value from the row
        value = row[sourceField];
        console.log(`Using source value for ${targetField} from ${sourceField}:`, value);
      }
      
      // Apply transformations if any
      if (transformations && transformations.length > 0) {
        value = applyTransformations(value, transformations);
      }
      
      // Set the target field value
      transformedRow[targetField] = value;
    });
    
    return transformedRow;
  });
};

/**
 * Apply a series of transformations to a value
 * @param value The value to transform
 * @param transformations The transformations to apply
 * @returns Transformed value
 */
const applyTransformations = (
  value: any,
  transformations: FieldTransformation[]
): any => {
  // Apply each transformation in sequence
  return transformations.reduce((currentValue, transformation) => {
    return applyTransformation(currentValue, transformation);
  }, value);
};

/**
 * Apply a single transformation to a value
 * @param value The value to transform
 * @param transformation The transformation to apply
 * @returns Transformed value
 */
export const applyTransformation = (
  value: any,
  transformation: FieldTransformation
): any => {
  const { type, params } = transformation;

  switch (type) {
    case 'split':
      return applySplitTransformation(value, params);

    case 'join':
      return applyJoinTransformation(value, params);

    case 'format':
      return applyFormatTransformation(value, params);

    case 'convert':
      return applyConvertTransformation(value, params);

    case 'extract':
      return applyExtractTransformation(value, params);

    case 'replace':
      return applyReplaceTransformation(value, params);

    default:
      return value;
  }
};

/**
 * Extract part of a string using a pattern
 * @param value The string to extract from
 * @param params The parameters for extraction
 * @returns Extracted value
 */
const applyExtractTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  if (typeof value !== 'string') {
    return value;
  }

  const { pattern } = params;

  try {
    const regex = new RegExp(pattern);
    const match = value.match(regex);

    if (match && match.length > 0) {
      // If there are capture groups, return the first one
      return match[1] || match[0];
    }
  } catch (error) {
    // If regex is invalid, return original value
    console.error('Invalid regex pattern:', pattern);
  }

  return value;
};

/**
 * Replace parts of a string
 * @param value The string to perform replacements on
 * @param params The parameters for replacement
 * @returns Replaced value
 */
const applyReplaceTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  if (typeof value !== 'string') {
    return value;
  }

  const { from, to = '', useRegex = false } = params;

  if (!from) {
    return value;
  }

  try {
    if (useRegex) {
      const regex = new RegExp(from, 'g');
      return value.replace(regex, to);
    } else {
      return value.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    }
  } catch (error) {
    // If there's an error, return original value
    console.error('Error in replace transformation:', error);
    return value;
  }
};

/**
 * Split a string value
 * @param value The value to split
 * @param params The parameters for the split
 * @returns Split value
 */
const applySplitTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  if (typeof value !== 'string') {
    return value;
  }
  
  const { delimiter, index } = params;
  const parts = value.split(delimiter);
  
  if (index !== undefined) {
    return parts[index] || '';
  }
  
  return parts;
};

/**
 * Join array values
 * @param value The value to join
 * @param params The parameters for the join
 * @returns Joined value
 */
const applyJoinTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  if (!Array.isArray(value)) {
    return value;
  }
  
  const { delimiter = ', ' } = params;
  return value.join(delimiter);
};

/**
 * Format a value (e.g., date formatting)
 * @param value The value to format
 * @param params The parameters for the format
 * @returns Formatted value
 */
const applyFormatTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  const { format, type } = params;
  
  if (type === 'date' && value) {
    try {
      const date = new Date(value);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return value;
      }
      
      // Apply format
      switch (format) {
        case 'MM/DD/YYYY':
          return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
        case 'YYYY-MM-DD':
          return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        case 'ISO':
          return date.toISOString();
        default:
          return value;
      }
    } catch (error) {
      return value;
    }
  }
  
  if (type === 'number' && value !== undefined && value !== null) {
    try {
      const number = Number(value);
      
      if (isNaN(number)) {
        return value;
      }
      
      switch (format) {
        case 'integer':
          return Math.round(number);
        case 'fixed2':
          return number.toFixed(2);
        case 'currency':
          return `$${number.toFixed(2)}`;
        case 'percent':
          return `${(number * 100).toFixed(1)}%`;
        default:
          return value;
      }
    } catch (error) {
      return value;
    }
  }
  
  return value;
};

/**
 * Convert a value from one type to another
 * @param value The value to convert
 * @param params The parameters for the conversion
 * @returns Converted value
 */
const applyConvertTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  const { targetType } = params;
  
  switch (targetType) {
    case 'string':
      return value !== undefined && value !== null ? String(value) : '';
      
    case 'number':
      if (value === undefined || value === null || value === '') {
        return null;
      }
      const num = Number(value);
      return isNaN(num) ? value : num;
      
    case 'boolean':
      if (typeof value === 'string') {
        return ['true', 'yes', '1', 'y'].includes(value.toLowerCase());
      }
      return Boolean(value);
      
    case 'date':
      if (!value) {
        return null;
      }
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date;
      } catch (error) {
        return value;
      }
      
    default:
      return value;
  }
};