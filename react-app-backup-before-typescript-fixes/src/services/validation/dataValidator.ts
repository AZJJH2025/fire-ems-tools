import {
  ValidationError,
  ValidationRule,
  FieldDataType,
  TargetField
} from '@/types/formatter';

// Import the DefaultValueRegistry for handling default values
import { defaultValueRegistry } from './ValidationEnhancer';

/**
 * Validate data against field definitions
 * @param data The data to validate
 * @param targetFields The target field definitions
 * @returns Array of validation errors
 */
export const validateData = (
  data: Record<string, any>[],
  targetFields: TargetField[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate each row
  data.forEach((row, rowIndex) => {
    // Validate each field
    targetFields.forEach(field => {
      let value = row[field.name];

      // Check if this field has a default value registered and the value is empty
      const hasDefault = defaultValueRegistry.hasDefaultValue(field.name);
      if ((value === undefined || value === null || value === '') && hasDefault) {
        // Use the default value for validation purposes
        value = defaultValueRegistry.getDefaultValue(field.name);
        console.log(`Using default value for validation of ${field.name}:`, value);
      }

      // Special case for Incident ID - just check if it exists
      if (field.name === 'Incident ID') {
        // Skip all other validations for incident ID - just check if it's present
        if (field.isRequired && !hasDefault && (value === undefined || value === null || value === '')) {
          errors.push({
            rowIndex,
            field: field.name,
            message: `${field.name} is required`,
            type: 'required'
          });
        }
        return;
      }

      // Special case for time fields with date components
      if (field.name.includes('Time') && typeof value === 'string') {
        // For time fields, accept any string value
        if (field.isRequired && !hasDefault && (value === undefined || value === null || value === '')) {
          errors.push({
            rowIndex,
            field: field.name,
            message: `${field.name} is required`,
            type: 'required'
          });
        }
        return;
      }

      // Check if field is required - skip this check if the field has a default value
      if (field.isRequired && !hasDefault && (value === undefined || value === null || value === '')) {
        errors.push({
          rowIndex,
          field: field.name,
          message: `${field.name} is required`,
          type: 'required'
        });
        return; // Skip other validations if required field is missing
      }

      // If value is null/undefined and field is not required, skip validation
      if (value === undefined || value === null || value === '') {
        return;
      }
      
      // Validate data type
      const typeError = validateDataType(value, field.dataType, field.name, rowIndex);
      if (typeError) {
        errors.push(typeError);
        return; // Skip other validations if type is incorrect
      }
      
      // Apply additional validation rules if present
      if (field.validationRules) {
        field.validationRules.forEach(rule => {
          const ruleError = applyValidationRule(value, rule, field.name, rowIndex);
          if (ruleError) {
            errors.push(ruleError);
          }
        });
      }
    });
  });
  
  console.log("Validation completed with errors:", errors);
  return errors;
};

/**
 * Validate data type
 * @param value The value to validate
 * @param dataType The expected data type
 * @param fieldName The field name
 * @param rowIndex The row index
 * @returns Validation error or null
 */
const validateDataType = (
  value: any,
  dataType: FieldDataType,
  fieldName: string,
  rowIndex: number
): ValidationError | null => {
  switch (dataType) {
    case 'string':
      if (typeof value !== 'string') {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be a string`,
          type: 'custom'
        };
      }
      break;
      
    case 'number':
      // Allow both numeric strings and numbers
      if (typeof value !== 'number' && (typeof value !== 'string' || isNaN(Number(value)))) {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be a number`,
          type: 'custom'
        };
      }
      break;
      
    case 'date':
      // Check if value is a valid date
      if (!(typeof value === 'string' || value instanceof Date)) {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be a date`,
          type: 'custom'
        };
      }
      
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} contains an invalid date format`,
          type: 'custom'
        };
      }
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false' && value !== '0' && value !== '1') {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be a boolean value`,
          type: 'custom'
        };
      }
      break;
      
    case 'location':
      // Simple check for location format (latitude,longitude)
      if (typeof value === 'string') {
        const latLngPattern = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
        if (!latLngPattern.test(value)) {
          return {
            rowIndex,
            field: fieldName,
            message: `${fieldName} must be a valid location format (latitude,longitude)`,
            type: 'custom'
          };
        }
      } else if (!value.lat || !value.lng) {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be a valid location object or string`,
          type: 'custom'
        };
      }
      break;
  }
  
  return null;
};

/**
 * Apply a validation rule
 * @param value The value to validate
 * @param rule The validation rule
 * @param fieldName The field name
 * @param rowIndex The row index
 * @returns Validation error or null
 */
const applyValidationRule = (
  value: any,
  rule: ValidationRule,
  fieldName: string,
  rowIndex: number
): ValidationError | null => {
  switch (rule.type) {
    case 'required':
      // Already handled in the main validation function
      break;
      
    case 'min':
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = Number(value);
        if (numValue < rule.params.value) {
          return {
            rowIndex,
            field: fieldName,
            message: `${fieldName} must be at least ${rule.params.value}`,
            type: 'min'
          };
        }
      } else if (typeof value === 'string' && value.length < rule.params.value) {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be at least ${rule.params.value} characters`,
          type: 'min'
        };
      }
      break;
      
    case 'max':
      if (typeof value === 'number' || !isNaN(Number(value))) {
        const numValue = Number(value);
        if (numValue > rule.params.value) {
          return {
            rowIndex,
            field: fieldName,
            message: `${fieldName} must be at most ${rule.params.value}`,
            type: 'max'
          };
        }
      } else if (typeof value === 'string' && value.length > rule.params.value) {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be at most ${rule.params.value} characters`,
          type: 'max'
        };
      }
      break;
      
    case 'pattern':
      if (typeof value === 'string') {
        const pattern = new RegExp(rule.params.regex);
        if (!pattern.test(value)) {
          return {
            rowIndex,
            field: fieldName,
            message: rule.params.message || `${fieldName} does not match the required pattern`,
            type: 'pattern'
          };
        }
      }
      break;
      
    case 'oneOf':
      const allowedValues = rule.params.values;
      if (!allowedValues.includes(value)) {
        return {
          rowIndex,
          field: fieldName,
          message: `${fieldName} must be one of: ${allowedValues.join(', ')}`,
          type: 'oneOf'
        };
      }
      break;
      
    case 'custom':
      if (rule.params.validateFn && typeof rule.params.validateFn === 'function') {
        const isValid = rule.params.validateFn(value);
        if (!isValid) {
          return {
            rowIndex,
            field: fieldName,
            message: rule.params.message || `${fieldName} is invalid`,
            type: 'custom'
          };
        }
      }
      break;
  }
  
  return null;
};

/**
 * Group validation errors by field
 * @param errors The validation errors
 * @returns Errors grouped by field
 */
export const groupErrorsByField = (errors: ValidationError[]) => {
  const grouped: Record<string, ValidationError[]> = {};
  
  errors.forEach(error => {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error);
  });
  
  return grouped;
};

/**
 * Get error statistics
 * @param errors The validation errors
 * @returns Error statistics
 */
export const getErrorStats = (errors: ValidationError[]) => {
  const stats = {
    total: errors.length,
    byType: {} as Record<string, number>,
    byField: {} as Record<string, number>
  };
  
  errors.forEach(error => {
    // Count by type
    if (!stats.byType[error.type]) {
      stats.byType[error.type] = 0;
    }
    stats.byType[error.type]++;
    
    // Count by field
    if (!stats.byField[error.field]) {
      stats.byField[error.field] = 0;
    }
    stats.byField[error.field]++;
  });
  
  return stats;
};