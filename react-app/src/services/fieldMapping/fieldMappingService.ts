/**
 * Field Mapping Service
 * 
 * Provides intelligent field mapping capabilities for data transformation
 * between different data formats and systems.
 */

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformations: Array<{
    type: string;
    params?: Record<string, any>;
  }>;
}

interface TargetField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'datetime' | 'date' | 'time';
  required: boolean;
  description?: string;
}

interface MappingSuggestion {
  sourceField: string;
  targetField: TargetField | null;
  confidence: number;
  reasons: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface MappingReport {
  totalFields: number;
  mappedFields: number;
  unmappedFields: number;
  requiredFieldsCovered: number;
  dataQualityScore: number;
  recommendations: string[];
}

/**
 * Normalize field names for comparison
 */
export function normalizeFieldName(fieldName: string | null | undefined): string {
  if (!fieldName) return '';
  
  return fieldName
    .toLowerCase()
    .replace(/[_\-\.]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity between two field names
 */
export function calculateFieldSimilarity(field1: string, field2: string): number {
  const norm1 = normalizeFieldName(field1);
  const norm2 = normalizeFieldName(field2);
  
  if (norm1 === norm2) return 100;
  if (!norm1 || !norm2) return 0;
  
  // Check for exact word matches
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  if (commonWords.length > 0) {
    const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;
    return Math.round(similarity);
  }
  
  // Check for partial matches using Levenshtein distance
  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.max(0, Math.round(similarity));
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Suggest field mappings based on similarity
 */
export function suggestFieldMapping(
  sourceFields: string[],
  targetFields: TargetField[],
  minConfidence: number = 30
): MappingSuggestion[] {
  const suggestions: MappingSuggestion[] = [];
  
  for (const sourceField of sourceFields) {
    let bestMatch: TargetField | null = null;
    let bestScore = 0;
    const reasons: string[] = [];
    
    for (const targetField of targetFields) {
      // Calculate similarity with both field ID and display name
      const idSimilarity = calculateFieldSimilarity(sourceField, targetField.id);
      const nameSimilarity = calculateFieldSimilarity(sourceField, targetField.name);
      const maxSimilarity = Math.max(idSimilarity, nameSimilarity);
      
      if (maxSimilarity > bestScore) {
        bestMatch = targetField;
        bestScore = maxSimilarity;
        reasons.length = 0; // Clear previous reasons
        
        if (idSimilarity > nameSimilarity) {
          reasons.push(`Field ID similarity: ${idSimilarity}%`);
        } else {
          reasons.push(`Display name similarity: ${nameSimilarity}%`);
        }
        
        if (maxSimilarity === 100) {
          reasons.push('Exact match found');
        }
        
        if (targetField.required && maxSimilarity > 50) {
          reasons.push('Required field prioritized');
        }
      }
    }
    
    suggestions.push({
      sourceField,
      targetField: bestScore >= minConfidence ? bestMatch : null,
      confidence: bestScore,
      reasons: bestScore >= minConfidence ? reasons : ['No suitable match found']
    });
  }
  
  return suggestions;
}

/**
 * Validate field mapping configuration
 */
export function validateFieldMapping(
  mapping: FieldMapping[],
  targetFields: TargetField[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required fields
  const requiredFields = targetFields.filter(f => f.required);
  const mappedTargetFields = mapping.map(m => m.targetField);
  
  for (const requiredField of requiredFields) {
    if (!mappedTargetFields.includes(requiredField.id)) {
      errors.push(`Required field '${requiredField.name}' is not mapped`);
    }
  }
  
  // Check for duplicate target mappings
  const targetFieldCounts = new Map<string, number>();
  for (const m of mapping) {
    const count = targetFieldCounts.get(m.targetField) || 0;
    targetFieldCounts.set(m.targetField, count + 1);
  }
  
  for (const [targetField, count] of targetFieldCounts) {
    if (count > 1) {
      errors.push(`Target field '${targetField}' is mapped multiple times`);
    }
  }
  
  // Check for invalid target fields
  const validTargetFieldIds = targetFields.map(f => f.id);
  for (const m of mapping) {
    if (!validTargetFieldIds.includes(m.targetField)) {
      errors.push(`Invalid target field '${m.targetField}'`);
    }
  }
  
  // Check for low-confidence mappings
  const sourceFields = mapping.map(m => m.sourceField);
  const suggestions = suggestFieldMapping(sourceFields, targetFields, 70);
  
  for (const suggestion of suggestions) {
    if (suggestion.confidence < 70 && suggestion.targetField) {
      warnings.push(`Low confidence mapping: ${suggestion.sourceField} → ${suggestion.targetField.name}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Transform data using field mapping
 */
export function transformDataWithMapping(
  data: Record<string, any>[],
  mapping: FieldMapping[]
): Record<string, any>[] {
  return data.map(row => {
    const transformedRow: Record<string, any> = {};
    
    for (const fieldMapping of mapping) {
      const sourceValue = row[fieldMapping.sourceField];
      let transformedValue = sourceValue;
      
      // Apply transformations
      for (const transformation of fieldMapping.transformations) {
        transformedValue = applyTransformation(transformedValue, transformation);
      }
      
      transformedRow[fieldMapping.targetField] = transformedValue;
    }
    
    return transformedRow;
  });
}

/**
 * Apply a single transformation to a value
 */
function applyTransformation(value: any, transformation: { type: string; params?: Record<string, any> }): any {
  if (value === null || value === undefined) return value;
  
  switch (transformation.type) {
    case 'parseNumber':
      return parseFloat(value) || 0;
    
    case 'parseInt':
      return parseInt(value) || 0;
    
    case 'parseBoolean':
      return value === 'true' || value === '1' || value === 1;
    
    case 'uppercase':
      return String(value).toUpperCase();
    
    case 'lowercase':
      return String(value).toLowerCase();
    
    case 'trim':
      return String(value).trim();
    
    case 'parseDate':
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString();
    
    case 'extractNumbers':
      const numbers = String(value).match(/\d+/g);
      return numbers ? numbers.join('') : '';
    
    case 'removeSpecialChars':
      return String(value).replace(/[^a-zA-Z0-9\s]/g, '');
    
    default:
      return value;
  }
}

/**
 * Detect field types based on sample data
 */
export function detectFieldTypes(data: Record<string, any>[]): Record<string, string> {
  if (data.length === 0) return {};
  
  const fieldTypes: Record<string, string> = {};
  const fields = Object.keys(data[0]);
  
  for (const field of fields) {
    const samples = data.map(row => row[field]).filter(val => val !== null && val !== undefined);
    
    if (samples.length === 0) {
      fieldTypes[field] = 'string';
      continue;
    }
    
    // Check if all samples are numbers
    const allNumbers = samples.every(val => !isNaN(parseFloat(val)) && isFinite(val));
    if (allNumbers) {
      fieldTypes[field] = 'number';
      continue;
    }
    
    // Check if all samples are booleans
    const allBooleans = samples.every(val => 
      val === true || val === false || 
      val === 'true' || val === 'false' || 
      val === '1' || val === '0'
    );
    if (allBooleans) {
      fieldTypes[field] = 'boolean';
      continue;
    }
    
    // Check if all samples are dates
    const allDates = samples.every(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && val.toString().match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/);
    });
    if (allDates) {
      fieldTypes[field] = 'datetime';
      continue;
    }
    
    // Default to string
    fieldTypes[field] = 'string';
  }
  
  return fieldTypes;
}

/**
 * Generate a comprehensive mapping report
 */
export function generateFieldMappingReport(
  mapping: FieldMapping[],
  targetFields: TargetField[],
  _sampleData: Record<string, any>[]
): MappingReport {
  const mappedFieldIds = mapping.map(m => m.targetField);
  const requiredFields = targetFields.filter(f => f.required);
  const requiredFieldsCovered = requiredFields.filter(f => mappedFieldIds.includes(f.id));
  
  const recommendations: string[] = [];
  
  // Check for unmapped required fields
  const unmappedRequired = requiredFields.filter(f => !mappedFieldIds.includes(f.id));
  for (const field of unmappedRequired) {
    recommendations.push(`Map required field: ${field.name}`);
  }
  
  // Check for optional fields that could improve analysis
  const optionalFields = targetFields.filter(f => !f.required && !mappedFieldIds.includes(f.id));
  const importantOptional = optionalFields.filter(f => 
    f.id.includes('time') || f.id.includes('location') || f.id.includes('type')
  );
  
  for (const field of importantOptional.slice(0, 3)) {
    recommendations.push(`Consider mapping: ${field.name} for enhanced analysis`);
  }
  
  // Calculate data quality score
  const requiredCoverage = (requiredFieldsCovered.length / requiredFields.length) * 100;
  const optionalCoverage = ((mappedFieldIds.length - requiredFieldsCovered.length) / optionalFields.length) * 100;
  const dataQualityScore = Math.round((requiredCoverage * 0.7) + (optionalCoverage * 0.3));
  
  return {
    totalFields: targetFields.length,
    mappedFields: mappedFieldIds.length,
    unmappedFields: targetFields.length - mappedFieldIds.length,
    requiredFieldsCovered: requiredFieldsCovered.length,
    dataQualityScore: Math.min(100, dataQualityScore),
    recommendations
  };
}