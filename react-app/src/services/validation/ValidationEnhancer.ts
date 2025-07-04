/**
 * ValidationEnhancer - Fixes validation for fields with default values
 * 
 * This addresses the issue where fields with default values are showing validation errors
 * because validation happens before default values are applied.
 */

import { FieldMapping, ValidationError, TargetField, FieldDataType, ValidationRule } from '@/types/formatter';

// Registry to track fields that have default values
class DefaultValueRegistry {
  private defaultFields: Record<string, any> = {};

  // Register a field that has a default value
  registerField(fieldName: string, defaultValue: any): void {
    console.log(`Registering default value for ${fieldName}:`, defaultValue);
    this.defaultFields[fieldName] = defaultValue;
  }

  // Check if field has a default value
  hasDefaultValue(fieldName: string): boolean {
    return this.defaultFields[fieldName] !== undefined;
  }

  // Get the default value for a field
  getDefaultValue(fieldName: string): any {
    return this.defaultFields[fieldName];
  }

  // Register all fields with default values from mappings
  registerMappings(mappings: FieldMapping[]): void {
    // Clear existing registry
    this.defaultFields = {};
    
    // Process each mapping
    mappings.forEach(mapping => {
      if (mapping.sourceField === '__default__' && mapping.transformations) {
        // Look for the default value in transformations
        const defaultTransform = mapping.transformations.find(t => 
          t.type === 'convert' && t.params && t.params.defaultValue !== undefined
        );
        
        if (defaultTransform && defaultTransform.params.defaultValue !== undefined) {
          this.registerField(
            mapping.targetField, 
            defaultTransform.params.defaultValue
          );
        }
      }
    });

    console.log('Registered default values:', this.defaultFields);
  }

  // Clear all registered default values
  clear(): void {
    this.defaultFields = {};
  }
}

// Export singleton instance
export const defaultValueRegistry = new DefaultValueRegistry();

/**
 * Enhanced validation function that properly handles default values
 * @param data The data to validate
 * @param targetFields The field definitions
 * @param mappings The field mappings containing default values
 * @returns Array of validation errors
 */
export const validateWithDefaultValues = (
  data: Record<string, any>[],
  targetFields: TargetField[],
  mappings?: FieldMapping[]
): ValidationError[] => {
  // If mappings are provided, register them
  if (mappings && mappings.length > 0) {
    defaultValueRegistry.registerMappings(mappings);
  }

  const errors: ValidationError[] = [];
  
  // Validate each row
  data.forEach((row, rowIndex) => {
    // Create a copy of the row with default values applied for validation
    const rowWithDefaults = { ...row };
    
    // Validate each field
    targetFields.forEach(field => {
      let value = rowWithDefaults[field.name];
      
      // If this field has a default value and the actual value is empty,
      // use the default value for validation purposes
      if (
        (value === undefined || value === null || value === '') && 
        defaultValueRegistry.hasDefaultValue(field.name)
      ) {
        value = defaultValueRegistry.getDefaultValue(field.name);
        rowWithDefaults[field.name] = value;
      }
      
      // Special case for Incident ID - just check if it exists
      if (field.name === 'Incident ID') {
        // Skip all other validations for incident ID - just check if it's present
        if (field.isRequired && 
            (value === undefined || value === null || value === '') && 
            !defaultValueRegistry.hasDefaultValue(field.name)) {
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
        if (field.isRequired && 
            (value === undefined || value === null || value === '') && 
            !defaultValueRegistry.hasDefaultValue(field.name)) {
          errors.push({
            rowIndex,
            field: field.name,
            message: `${field.name} is required`,
            type: 'required'
          });
        }
        return;
      }
      
      // Check if field is required
      if (field.isRequired && 
          (value === undefined || value === null || value === '') && 
          !defaultValueRegistry.hasDefaultValue(field.name)) {
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
  
  return errors;
};

/**
 * Apply default values to a dataset based on field mappings
 * This is used to enhance the preview by showing default values
 * @param data The original data
 * @param mappings The field mappings containing default values
 * @returns The data with default values applied
 */
export const applyDefaultValues = (
  data: Record<string, any>[],
  mappings: FieldMapping[]
): Record<string, any>[] => {
  // Register default values from mappings
  defaultValueRegistry.registerMappings(mappings);
  
  // Apply default values to each record
  return data.map(record => {
    const newRecord = { ...record };
    
    // For each mapping that might have a default value
    mappings.forEach(mapping => {
      const fieldName = mapping.targetField;
      // Check if this field has a default value and is empty in the record
      if (defaultValueRegistry.hasDefaultValue(fieldName) && 
          (newRecord[fieldName] === undefined || newRecord[fieldName] === null || newRecord[fieldName] === '')) {
        newRecord[fieldName] = defaultValueRegistry.getDefaultValue(fieldName);
      }
    });
    
    return newRecord;
  });
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