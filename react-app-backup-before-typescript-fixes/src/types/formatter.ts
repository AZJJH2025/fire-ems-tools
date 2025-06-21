// Source file information
export interface SourceFile {
  id: string;
  name: string;
  type: FileType;
  size: number;
  lastModified: number;
}

// File type enum
export type FileType = 'csv' | 'excel' | 'json' | 'xml' | 'pdf' | 'txt';

// Sample data - generic record with string keys and any values
export type SampleData = Record<string, any>[];

// Field mapping
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformations?: FieldTransformation[];
}

// Field transformation (for advanced mapping)
export interface FieldTransformation {
  type: TransformationType;
  params: Record<string, any>;
}

// Transformation types
export type TransformationType = 'split' | 'join' | 'format' | 'convert' | 'extract' | 'replace';

// Tool configuration
export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  requiredFields: TargetField[];
  optionalFields: TargetField[];
}

// Target field definition
export interface TargetField {
  id: string;
  name: string;
  description: string;
  dataType: FieldDataType;
  isRequired: boolean;
  validationRules?: ValidationRule[];
}

// Field data types
export type FieldDataType = 'string' | 'number' | 'date' | 'boolean' | 'location';

// Validation rule
export interface ValidationRule {
  type: ValidationRuleType;
  params: Record<string, any>;
}

// Validation rule types
export type ValidationRuleType = 'required' | 'min' | 'max' | 'pattern' | 'oneOf' | 'custom';

// Validation error
export interface ValidationError {
  rowIndex?: number;
  field: string;
  message: string;
  type: ValidationRuleType;
}

// Processing status
export type ProcessingStatus = 'idle' | 'uploading' | 'mapping' | 'transforming' | 'complete' | 'error';