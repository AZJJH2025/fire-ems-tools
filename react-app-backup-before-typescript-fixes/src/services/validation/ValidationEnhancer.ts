/**
 * ValidationEnhancer - Fixes validation for fields with default values
 * 
 * This addresses the issue where fields with default values are showing validation errors
 * because validation happens before default values are applied.
 */

import { FieldMapping, ValidationError, TargetField } from '@/types/formatter';

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
      
      // TODO: Continue with other validations (type validation, etc.)
      // This would be copied from the original validator
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
    
    // For each field with a default value
    Object.keys(defaultValueRegistry.defaultFields).forEach(fieldName => {
      // If the field is empty in the record, use the default value
      if (newRecord[fieldName] === undefined || newRecord[fieldName] === null || newRecord[fieldName] === '') {
        newRecord[fieldName] = defaultValueRegistry.getDefaultValue(fieldName);
      }
    });
    
    return newRecord;
  });
};