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
export type TransformationType = 'split' | 'join' | 'format' | 'convert' | 'extract' | 'replace' | 'datetime_combine' | 'datetime_extract' | 'parseCoordinates';

// Template management types
export interface FieldMappingTemplate {
  id: string;
  name: string;
  description: string;
  departmentName?: string;
  cadVendor?: 'Console One' | 'Tyler' | 'Hexagon' | 'TriTech' | 'Motorola' | 'Zuercher' | 'Locution' | 'ESRI' | 'AWWA' | 'Municipal' | 'Water Utility' | 'Fire Department' | 'Universal' | 'Other';
  targetTool: string; // Tool ID this template is designed for
  fieldMappings: FieldMapping[];
  sourceFieldPattern: SourceFieldPattern;
  metadata: TemplateMetadata;
  createdAt: string;
  lastUsed?: string;
  useCount: number;
  isPublic: boolean; // Can be shared with other departments
}

export interface SourceFieldPattern {
  fieldNames: string[]; // List of source field names from original CSV
  fieldCount: number;
  hasHeaderRow: boolean;
  commonPatterns: string[]; // Common field name patterns (e.g., "datetime", "location")
  cadVendorSignature: string; // Computed signature to identify CAD vendor
}

export interface TemplateMetadata {
  version: string;
  compatibility: string[]; // Compatible tool versions
  qualityScore: number; // 0-100 based on field mapping completeness
  successRate: number; // How often this template works (0-100%)
  dataTypes: Record<string, FieldDataType>; // Expected data types for validation
  sampleValues: Record<string, string[]>; // Sample values for validation
  tags: string[]; // User-defined tags for organization
}

export interface TemplateSuggestion {
  template: FieldMappingTemplate;
  similarityScore: number; // 0-100% match confidence
  matchingFields: string[]; // Fields that matched
  missingFields: string[]; // Required fields not found
  suggestions: string[]; // Human-readable suggestions
}

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
  format?: string;
  examples?: string[];
  validation?: ValidationRule[];
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

// Global window extensions
declare global {
  interface Window {
    defaultValueRegistry?: {
      register: (fieldName: string, hasDefault: boolean) => void;
    };
  }
}