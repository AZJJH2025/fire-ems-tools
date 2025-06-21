import { FieldMapping, SampleData, FieldTransformation } from '../../types/formatter';

/**
 * Check if a field should have time-only values extracted from datetime
 * @param fieldName - The target field name
 * @returns True if this field should extract time-only from datetime
 */
const isTimeOnlyField = (fieldName: string): boolean => {
  const timeOnlyFields = [
    'dispatch_time',
    'enroute_time', 
    'arrival_time',
    'clear_time',
    // NOTE: incident_time is NOT included - it needs full datetime for Response Time Analyzer
  ];
  return timeOnlyFields.includes(fieldName);
};

/**
 * Check if a field should have date-only values extracted from datetime
 * @param fieldName - The target field name
 * @returns True if this field should extract date-only from datetime
 */
const isDateOnlyField = (fieldName: string): boolean => {
  const dateOnlyFields = [
    'incident_date',
    // Add other date-only fields as needed
  ];
  return dateOnlyFields.includes(fieldName);
};

/**
 * Extract time portion from a datetime string
 * @param dateTimeStr - Full datetime string like "01/15/2024 14:24:12"
 * @returns Time portion like "14:24:12" or original string if no time found
 */
const extractTimeFromDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr || typeof dateTimeStr !== 'string') {
    return dateTimeStr;
  }
  
  // Try to match various datetime formats and extract the time portion
  const patterns = [
    // MM/DD/YYYY HH:MM:SS format
    /^\d{1,2}\/\d{1,2}\/\d{4}\s+(\d{1,2}:\d{2}:\d{2})$/,
    // YYYY-MM-DD HH:MM:SS format  
    /^\d{4}-\d{2}-\d{2}\s+(\d{1,2}:\d{2}:\d{2})$/,
    // MM/DD/YYYY HH:MM format
    /^\d{1,2}\/\d{1,2}\/\d{4}\s+(\d{1,2}:\d{2})$/,
    // YYYY-MM-DD HH:MM format
    /^\d{4}-\d{2}-\d{2}\s+(\d{1,2}:\d{2})$/,
    // More flexible: any date followed by time
    /^.+\s+(\d{1,2}:\d{2}(?::\d{2})?)$/
  ];
  
  for (const pattern of patterns) {
    const match = dateTimeStr.match(pattern);
    if (match && match[1]) {
      return match[1]; // Return the captured time portion
    }
  }
  
  // If no datetime pattern found, check if it's already just a time
  const timeOnlyPattern = /^\d{1,2}:\d{2}(?::\d{2})?$/;
  if (timeOnlyPattern.test(dateTimeStr.trim())) {
    return dateTimeStr.trim(); // Already time-only
  }
  
  // If no time pattern found, return original value
  return dateTimeStr;
};

/**
 * Extract date portion from a datetime string
 * @param dateTimeStr - Full datetime string like "01/15/2024 14:24:12"
 * @returns Date portion like "01/15/2024" or original string if no date found
 */
const extractDateFromDateTime = (dateTimeStr: string): string => {
  console.log(`🔍 DATE EXTRACTION: Input "${dateTimeStr}" (type: ${typeof dateTimeStr})`);
  
  if (!dateTimeStr || typeof dateTimeStr !== 'string') {
    console.log(`🔍 DATE EXTRACTION: Invalid input, returning original`);
    return dateTimeStr;
  }
  
  // Try to match various datetime formats and extract the date portion
  const patterns = [
    // MM/DD/YYYY HH:MM:SS format
    /^(\d{1,2}\/\d{1,2}\/\d{4})\s+\d{1,2}:\d{2}(?::\d{2})?$/,
    // YYYY-MM-DD HH:MM:SS format  
    /^(\d{4}-\d{2}-\d{2})\s+\d{1,2}:\d{2}(?::\d{2})?$/,
    // Date with any time after space
    /^([^\\s]+)\s+\d{1,2}:\d{2}(?::\d{2})?$/
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = dateTimeStr.match(pattern);
    console.log(`🔍 Pattern ${i + 1} test: "${dateTimeStr}" → ${match ? `MATCH: "${match[1]}"` : 'NO MATCH'}`);
    if (match && match[1]) {
      console.log(`🔍 DATE EXTRACTION SUCCESS: "${dateTimeStr}" → "${match[1]}"`);
      return match[1]; // Return the captured date portion
    }
  }
  
  // If no datetime pattern found, check if it's already just a date
  const dateOnlyPatterns = [
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,
    /^\d{4}-\d{2}-\d{2}$/
  ];
  
  for (const pattern of dateOnlyPatterns) {
    if (pattern.test(dateTimeStr.trim())) {
      return dateTimeStr.trim(); // Already date-only
    }
  }
  
  // If no date pattern found, return original value
  return dateTimeStr;
};

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
    const preservedOriginalFields = new Set<string>(); // Track which original fields we've already preserved
    
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
        // 🤖 ENHANCED PARSED FIELD DETECTION
        // Check if this sourceField might be a parsed field ID (format: "ColumnName_fieldType")
        if (sourceField.includes('_') && sourceField.split('_').length >= 2) {
          const [originalColumn, ...fieldTypeParts] = sourceField.split('_');
          const fieldType = fieldTypeParts.join('_');
          
          // Try multiple parsed field key patterns
          const possibleParsedKeys = [
            `${originalColumn}_parsed_${fieldType}`,  // Data injection pattern: "Notes_parsed_incident_type"
            `${originalColumn}_parsed_${targetField}`, // Target field fallback: "Notes_parsed_incident_type"
            sourceField  // Direct lookup as fallback: "Notes_incident_type"
          ];
          
          console.log(`🤖 DEBUG: Looking for parsed data with sourceField: "${sourceField}"`);
          console.log(`🤖 DEBUG: Trying keys:`, possibleParsedKeys);
          console.log(`🤖 DEBUG: Available row keys:`, Object.keys(row));
          
          let foundParsedValue = false;
          for (const parsedKey of possibleParsedKeys) {
            if (row[parsedKey] !== undefined && row[parsedKey] !== null) {
              value = row[parsedKey];
              console.log(`🤖 ✅ Using PARSED value for ${targetField} from key "${parsedKey}": "${value}"`);
              foundParsedValue = true;
              break;
            } else {
              console.log(`🤖 ❌ No data found at key: "${parsedKey}"`);
            }
          }
          
          if (!foundParsedValue) {
            // Fallback to original source value
            value = row[sourceField];
            console.log(`🤖 ⚠️ No parsed data found, using source value for ${targetField} from ${sourceField}:`, value);
          }
        } else {
          // Get source value from the row
          value = row[sourceField];
          console.log(`Using source value for ${targetField} from ${sourceField}:`, value);
        }
      }
      
      // Apply transformations if any
      if (transformations && transformations.length > 0) {
        console.log(`Applying ${transformations.length} transformations to ${targetField}:`, transformations);
        const originalValue = value;
        value = applyTransformations(value, transformations, targetField, row);
        console.log(`Transformation result for ${targetField}:`, originalValue, '→', value);
      }
      
      // 🔧 SMART DATA CONVERSION: Ensure incident_type is always a string
      if (targetField === 'incident_type' && value !== null && value !== undefined) {
        if (typeof value === 'number') {
          console.log(`🔢 Converting numeric incident_type to string: ${value} → "${String(value)}"`);
          value = String(value);
        } else if (typeof value !== 'string') {
          console.log(`🔄 Converting incident_type to string: ${value} (${typeof value}) → "${String(value)}"`);
          value = String(value);
        }
      }
      
      // 🔧 SMART DATA EXTRACTION: Auto-extract appropriate data type from datetime fields
      console.log(`🔧 CHECKING FIELD: ${targetField}, isTimeOnly: ${isTimeOnlyField(targetField)}, isDateOnly: ${isDateOnlyField(targetField)}, value type: ${typeof value}`);
      
      if (value && typeof value === 'string') {
        // Extract time-only for time fields (but NOT incident_time which needs full datetime)
        if (isTimeOnlyField(targetField)) {
          const extractedTime = extractTimeFromDateTime(value);
          if (extractedTime !== value) {
            console.log(`🕒 Auto-extracted time for ${targetField}: "${value}" → "${extractedTime}"`);
            value = extractedTime;
          } else {
            console.log(`🕒 No time extraction needed for ${targetField}: "${value}"`);
          }
        }
        // Extract date-only for date fields
        else if (isDateOnlyField(targetField)) {
          console.log(`📅 ATTEMPTING DATE EXTRACTION for ${targetField}: Input value "${value}"`);
          const extractedDate = extractDateFromDateTime(value);
          console.log(`📅 DATE EXTRACTION RESULT: "${value}" → "${extractedDate}" (changed: ${extractedDate !== value})`);
          if (extractedDate !== value) {
            console.log(`📅 ✅ Auto-extracted date for ${targetField}: "${value}" → "${extractedDate}"`);
            value = extractedDate;
          } else {
            console.log(`📅 ❌ No date extraction needed for ${targetField}: "${value}"`);
          }
        }
        // incident_time and other full datetime fields keep original value
        else if (targetField === 'incident_time') {
          console.log(`🕒 Keeping full datetime for ${targetField}: "${value}"`);
        }
      }
      
      // Set the target field value
      transformedRow[targetField] = value;
      
      // 🔧 PRESERVE ORIGINAL FIELD NAMES: For Response Time Analyzer compatibility
      // When a source field maps to a transformed target field, also preserve the original field name
      // BUT only preserve the FIRST mapping to avoid duplicate overwrites
      // AND don't overwrite target fields that have already been transformed
      // AND don't preserve parsed field injection keys (they contain "_parsed_")
      if (sourceField !== targetField && 
          sourceField !== '__default__' && 
          !preservedOriginalFields.has(sourceField) &&
          !sourceField.includes('_parsed_')) { // 🤖 SKIP PARSED FIELD INJECTION KEYS
        
        // Check if this sourceField is also a target field that was already transformed
        const isAlsoTargetField = mappings.some(m => m.targetField === sourceField);
        
        if (isAlsoTargetField) {
          // Don't preserve if this field is also a target that was already transformed
          console.log(`🚫 SKIPPING PRESERVATION: "${sourceField}" is also a target field - keeping transformed value`);
        } else {
          // Determine the best value to preserve for the original field name
          let originalFieldValue = value;
          
          // Special handling for dual-mapped fields like "incident_date"
          // If this is a date-only extraction but original field contains datetime, preserve the full datetime
          if (isDateOnlyField(targetField) && row[sourceField] && typeof row[sourceField] === 'string' && row[sourceField].includes(' ')) {
            originalFieldValue = row[sourceField]; // Keep the full original datetime value
            console.log(`📅 PRESERVING FULL DATETIME for original field "${sourceField}": "${originalFieldValue}" (target "${targetField}" gets date-only: "${value}")`);
          }
          
          // Store the original field name with appropriate value
          transformedRow[sourceField] = originalFieldValue;
          console.log(`🔄 PRESERVED ORIGINAL FIELD NAME: "${sourceField}" → "${originalFieldValue}" (also mapped to ${targetField})`);
        }
        
        preservedOriginalFields.add(sourceField); // Mark as preserved regardless
      } else if (sourceField.includes('_parsed_')) {
        console.log(`🤖 SKIPPING PARSED FIELD PRESERVATION: "${sourceField}" (parsed field injection key)`);
      }
    });
    
    // 🧹 CLEANUP: Remove any parsed field injection keys that might have been copied over
    // These keys are only used internally for parsing and should not appear in final transformed data
    Object.keys(transformedRow).forEach(key => {
      if (key.includes('_parsed_')) {
        console.log(`🧹 CLEANUP: Removing parsed field injection key "${key}" from transformed data`);
        delete transformedRow[key];
      }
    });
    
    return transformedRow;
  });
};

/**
 * Apply a series of transformations to a value
 * @param value The value to transform
 * @param transformations The transformations to apply
 * @param fieldName The name of the target field (for context-aware transformations)
 * @returns Transformed value
 */
const applyTransformations = (
  value: any,
  transformations: FieldTransformation[],
  fieldName?: string,
  rowData?: Record<string, any>
): any => {
  // Apply each transformation in sequence
  return transformations.reduce((currentValue, transformation) => {
    return applyTransformation(currentValue, transformation, fieldName, rowData);
  }, value);
};

/**
 * Apply a single transformation to a value
 * @param value The value to transform
 * @param transformation The transformation to apply
 * @param fieldName The name of the target field (for context-aware transformations)
 * @returns Transformed value
 */
export const applyTransformation = (
  value: any,
  transformation: FieldTransformation,
  fieldName?: string,
  rowData?: Record<string, any>
): any => {
  const { type, params } = transformation;
  
  // Add fieldName and rowData to params for context-aware transformations
  const enhancedParams = { 
    ...params, 
    ...(fieldName && { fieldName }),
    ...(rowData && { rowData })
  };

  switch (type) {
    case 'split':
      return applySplitTransformation(value, enhancedParams);

    case 'join':
      return applyJoinTransformation(value, enhancedParams);

    case 'format':
      return applyFormatTransformation(value, enhancedParams);

    case 'convert':
      return applyConvertTransformation(value, enhancedParams);

    case 'extract':
      return applyExtractTransformation(value, enhancedParams);

    case 'replace':
      return applyReplaceTransformation(value, enhancedParams);

    case 'datetime_combine':
      return applyDateTimeCombineTransformation(value, enhancedParams);

    case 'datetime_extract':
      return applyDateTimeExtractTransformation(value, enhancedParams);

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
  const { format, type, fieldName } = params;
  console.log(`applyFormatTransformation called with:`, { value, format, type, fieldName });
  
  if (type === 'date' && value) {
    try {
      const date = new Date(value);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return value;
      }
      
      // Check if original value contains time component (HH:MM:SS pattern)
      // const originalStr = String(value);
      // const hasTimeComponent = /\d{1,2}:\d{2}(:\d{2})?/.test(originalStr);
      
      // Determine if time should be preserved based on field name and user intent
      // Use field-name-aware logic like fieldTransformer.ts
      // const fieldNameLower = (fieldName || '').toLowerCase();
      // const isDateField = fieldNameLower.includes('date') && !fieldNameLower.includes('time');
      // const shouldPreserveTime = hasTimeComponent && !isDateField;
      
      // Helper function to format time component
      // const formatTime = (d: Date) => {
      //   const hours = d.getHours().toString().padStart(2, '0');
      //   const minutes = d.getMinutes().toString().padStart(2, '0');
      //   const seconds = d.getSeconds().toString().padStart(2, '0');
      //   return `${hours}:${minutes}:${seconds}`;
      // };
      
      // Apply format
      switch (format) {
        case 'MM/DD/YYYY':
          // Always strip time for explicit date-only formats
          const mmddyyyy = `${(date.getMonth() + 1)}/${date.getDate()}/${date.getFullYear()}`;
          return mmddyyyy;
        case 'YYYY-MM-DD':
          // Always strip time for explicit date-only formats
          const yyyymmdd = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          return yyyymmdd;
        case 'DD/MM/YYYY':
          // Always strip time for explicit date-only formats
          const ddmmyyyy = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
          return ddmmyyyy;
        case 'date-only':
          // Strip time and use standard locale date format
          return date.toLocaleDateString();
        case 'custom':
          // Support custom formatting using the customFormat parameter
          const customFormat = params.customFormat || 'YYYY-MM-DD';
          return customFormat
            .replace('YYYY', date.getFullYear().toString())
            .replace('MM', (date.getMonth() + 1).toString().padStart(2, '0'))
            .replace('DD', date.getDate().toString().padStart(2, '0'))
            .replace('HH', date.getHours().toString().padStart(2, '0'))
            .replace('mm', date.getMinutes().toString().padStart(2, '0'))
            .replace('ss', date.getSeconds().toString().padStart(2, '0'));
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

/**
 * Combine separate date and time fields into a single datetime string
 * Used for Tyler CAD style split datetime patterns
 * @param value The primary source field value (usually the date)
 * @param params Parameters including sourceFields array and row data
 * @returns Combined datetime string
 */
const applyDateTimeCombineTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  const { sourceFields, description, rowData } = params;
  
  console.log('🕐 DATETIME COMBINE: Starting transformation');
  console.log('🕐 Source fields:', sourceFields);
  console.log('🕐 Primary value:', value);
  console.log('🕐 Description:', description);
  
  if (!sourceFields || sourceFields.length < 2) {
    console.log('⚠️ DATETIME COMBINE: Need at least 2 source fields');
    return value;
  }

  if (!rowData) {
    console.log('⚠️ DATETIME COMBINE: No row data provided for field combination');
    return value;
  }

  const [dateField, timeField] = sourceFields;
  const dateValue = String(rowData[dateField] || '').trim();
  const timeValue = String(rowData[timeField] || '').trim();
  
  console.log(`🕐 Date field "${dateField}":`, dateValue);
  console.log(`🕐 Time field "${timeField}":`, timeValue);

  if (!dateValue || !timeValue) {
    console.log('⚠️ DATETIME COMBINE: Missing date or time component');
    return value;
  }

  // Combine date and time with space separator
  const combinedDateTime = `${dateValue} ${timeValue}`;
  console.log('✅ DATETIME COMBINE: Result:', combinedDateTime);
  
  return combinedDateTime;
};

/**
 * Extract date or time component from a datetime string
 * Used for extracting date-only or time-only from combined datetime fields
 * @param value The datetime string to extract from
 * @param params Parameters including extractType ('date' or 'time')
 * @returns Extracted date or time component
 */
const applyDateTimeExtractTransformation = (
  value: any,
  params: Record<string, any>
): any => {
  const { extractType, description } = params;
  
  console.log('🕐 DATETIME EXTRACT: Starting transformation');
  console.log('🕐 Extract type:', extractType);
  console.log('🕐 Input value:', value);
  console.log('🕐 Description:', description);
  
  if (!value || typeof value !== 'string') {
    console.log('⚠️ DATETIME EXTRACT: Invalid input value');
    return value;
  }

  const dateTimeStr = value.trim();
  
  if (extractType === 'date') {
    // Extract date portion from datetime string
    const patterns = [
      /^(\d{1,2}\/\d{1,2}\/\d{4})\s+/, // MM/DD/YYYY from "MM/DD/YYYY HH:MM:SS"
      /^(\d{4}-\d{2}-\d{2})\s+/,       // YYYY-MM-DD from "YYYY-MM-DD HH:MM:SS"
    ];
    
    for (const pattern of patterns) {
      const match = dateTimeStr.match(pattern);
      if (match) {
        const dateOnly = match[1];
        console.log('✅ DATETIME EXTRACT (date):', dateOnly);
        return dateOnly;
      }
    }
    
    // If no pattern matches, check if it's already date-only
    const dateOnlyPatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{4}-\d{2}-\d{2}$/
    ];
    
    for (const pattern of dateOnlyPatterns) {
      if (pattern.test(dateTimeStr)) {
        console.log('✅ DATETIME EXTRACT (date): Already date-only format');
        return dateTimeStr;
      }
    }
    
  } else if (extractType === 'time') {
    // Extract time portion from datetime string
    const patterns = [
      /\s+(\d{1,2}:\d{2}:\d{2})$/,  // HH:MM:SS from "MM/DD/YYYY HH:MM:SS"
      /\s+(\d{1,2}:\d{2})$/,        // HH:MM from "MM/DD/YYYY HH:MM"
    ];
    
    for (const pattern of patterns) {
      const match = dateTimeStr.match(pattern);
      if (match) {
        const timeOnly = match[1];
        console.log('✅ DATETIME EXTRACT (time):', timeOnly);
        return timeOnly;
      }
    }
    
    // If no pattern matches, check if it's already time-only
    const timeOnlyPatterns = [
      /^\d{1,2}:\d{2}:\d{2}$/,
      /^\d{1,2}:\d{2}$/
    ];
    
    for (const pattern of timeOnlyPatterns) {
      if (pattern.test(dateTimeStr)) {
        console.log('✅ DATETIME EXTRACT (time): Already time-only format');
        return dateTimeStr;
      }
    }
  }
  
  console.log('⚠️ DATETIME EXTRACT: No matching pattern found, returning original value');
  return value;
};