import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  normalizeFieldName,
  calculateFieldSimilarity,
  suggestFieldMapping,
  validateFieldMapping,
  transformDataWithMapping,
  detectFieldTypes,
  generateFieldMappingReport
} from '../fieldMappingService';

// Mock data for testing
const mockSourceFields = [
  'Incident Number',
  'Call Received Date/Time',
  'Dispatch Time',
  'Incident Type',
  'Latitude',
  'Longitude',
  'Address',
  'City',
  'State'
];

const mockTargetFields = [
  { id: 'incident_id', name: 'Incident ID', type: 'string', required: true },
  { id: 'incident_time', name: 'Call Received Date/Time', type: 'datetime', required: true },
  { id: 'dispatch_time', name: 'Dispatch Time', type: 'time', required: false },
  { id: 'incident_type', name: 'Incident Type', type: 'string', required: false },
  { id: 'latitude', name: 'Latitude', type: 'number', required: false },
  { id: 'longitude', name: 'Longitude', type: 'number', required: false },
  { id: 'address', name: 'Address', type: 'string', required: false },
  { id: 'city', name: 'City', type: 'string', required: false },
  { id: 'state', name: 'State', type: 'string', required: false }
];

const mockDataRow = {
  'Incident Number': 'INC-2025-001',
  'Call Received Date/Time': '2025-01-15 14:23:45',
  'Dispatch Time': '14:24:15',
  'Incident Type': 'Medical Emergency',
  'Latitude': '39.7392',
  'Longitude': '-104.9903',
  'Address': '123 Main St',
  'City': 'Denver',
  'State': 'CO'
};

describe('Field Mapping Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeFieldName', () => {
    it('should normalize field names consistently', () => {
      expect(normalizeFieldName('Incident Number')).toBe('incident number');
      expect(normalizeFieldName('Call_Received_Date_Time')).toBe('call received date time');
      expect(normalizeFieldName('GPS-Latitude')).toBe('gps latitude');
      expect(normalizeFieldName('  Extra  Spaces  ')).toBe('extra spaces');
    });

    it('should handle empty and null values', () => {
      expect(normalizeFieldName('')).toBe('');
      expect(normalizeFieldName(null as any)).toBe('');
      expect(normalizeFieldName(undefined as any)).toBe('');
    });

    it('should remove special characters', () => {
      expect(normalizeFieldName('Field@Name#123')).toBe('fieldname123');
      expect(normalizeFieldName('Field.Name.With.Dots')).toBe('field name with dots');
    });
  });

  describe('calculateFieldSimilarity', () => {
    it('should calculate exact matches', () => {
      const similarity = calculateFieldSimilarity('incident_id', 'incident_id');
      expect(similarity).toBe(100);
    });

    it('should calculate partial matches', () => {
      const similarity = calculateFieldSimilarity('incident_number', 'incident_id');
      expect(similarity).toBeGreaterThan(50);
      expect(similarity).toBeLessThan(100);
    });

    it('should handle different formats', () => {
      const similarity = calculateFieldSimilarity('Incident Number', 'incident_id');
      expect(similarity).toBeGreaterThan(30);
    });

    it('should return 0 for completely different fields', () => {
      const similarity = calculateFieldSimilarity('incident_id', 'temperature');
      expect(similarity).toBe(0);
    });

    it('should handle empty strings', () => {
      expect(calculateFieldSimilarity('', 'incident_id')).toBe(0);
      expect(calculateFieldSimilarity('incident_id', '')).toBe(0);
      expect(calculateFieldSimilarity('', '')).toBe(0);
    });
  });

  describe('suggestFieldMapping', () => {
    it('should suggest mappings for all source fields', () => {
      const suggestions = suggestFieldMapping(mockSourceFields, mockTargetFields);
      expect(suggestions).toHaveLength(mockSourceFields.length);
    });

    it('should suggest high-confidence mappings', () => {
      const suggestions = suggestFieldMapping(mockSourceFields, mockTargetFields);
      
      const incidentIdSuggestion = suggestions.find(s => s.sourceField === 'Incident Number');
      expect(incidentIdSuggestion?.targetField?.id).toBe('incident_id');
      expect(incidentIdSuggestion?.confidence).toBeGreaterThan(70);
    });

    it('should suggest datetime field mappings', () => {
      const suggestions = suggestFieldMapping(mockSourceFields, mockTargetFields);
      
      const timeSuggestion = suggestions.find(s => s.sourceField === 'Call Received Date/Time');
      expect(timeSuggestion?.targetField?.id).toBe('incident_time');
      expect(timeSuggestion?.confidence).toBeGreaterThan(80);
    });

    it('should suggest geographic field mappings', () => {
      const suggestions = suggestFieldMapping(mockSourceFields, mockTargetFields);
      
      const latSuggestion = suggestions.find(s => s.sourceField === 'Latitude');
      const lngSuggestion = suggestions.find(s => s.sourceField === 'Longitude');
      
      expect(latSuggestion?.targetField?.id).toBe('latitude');
      expect(lngSuggestion?.targetField?.id).toBe('longitude');
    });

    it('should handle minimum confidence threshold', () => {
      const suggestions = suggestFieldMapping(mockSourceFields, mockTargetFields, 90);
      
      // With high threshold, only exact matches should be suggested
      const highConfidenceSuggestions = suggestions.filter(s => s.confidence >= 90);
      expect(highConfidenceSuggestions.length).toBeGreaterThan(0);
    });

    it('should prioritize required fields', () => {
      const suggestions = suggestFieldMapping(mockSourceFields, mockTargetFields);
      
      // Required fields should get priority in suggestions
      const requiredSuggestions = suggestions.filter(s => s.targetField?.required);
      expect(requiredSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('validateFieldMapping', () => {
    const validMapping = [
      { sourceField: 'Incident Number', targetField: 'incident_id', transformations: [] },
      { sourceField: 'Call Received Date/Time', targetField: 'incident_time', transformations: [] },
    ];

    it('should validate correct mappings', () => {
      const validation = validateFieldMapping(validMapping, mockTargetFields);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const incompleteMapping = [
        { sourceField: 'Dispatch Time', targetField: 'dispatch_time', transformations: [] },
      ];

      const validation = validateFieldMapping(incompleteMapping, mockTargetFields);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('required'))).toBe(true);
    });

    it('should detect duplicate target mappings', () => {
      const duplicateMapping = [
        { sourceField: 'Incident Number', targetField: 'incident_id', transformations: [] },
        { sourceField: 'Case Number', targetField: 'incident_id', transformations: [] },
      ];

      const validation = validateFieldMapping(duplicateMapping, mockTargetFields);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('duplicate'))).toBe(true);
    });

    it('should detect invalid target fields', () => {
      const invalidMapping = [
        { sourceField: 'Incident Number', targetField: 'invalid_field', transformations: [] },
      ];

      const validation = validateFieldMapping(invalidMapping, mockTargetFields);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('invalid'))).toBe(true);
    });

    it('should provide warnings for low-confidence mappings', () => {
      const lowConfidenceMapping = [
        { sourceField: 'Random Field', targetField: 'incident_id', transformations: [] },
      ];

      const validation = validateFieldMapping(lowConfidenceMapping, mockTargetFields);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('transformDataWithMapping', () => {
    const testMapping = [
      { sourceField: 'Incident Number', targetField: 'incident_id', transformations: [] },
      { sourceField: 'Call Received Date/Time', targetField: 'incident_time', transformations: [] },
      { sourceField: 'Latitude', targetField: 'latitude', transformations: [{ type: 'parseNumber' }] },
      { sourceField: 'Longitude', targetField: 'longitude', transformations: [{ type: 'parseNumber' }] },
    ];

    it('should transform data correctly', () => {
      const result = transformDataWithMapping([mockDataRow], testMapping);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('incident_id', 'INC-2025-001');
      expect(result[0]).toHaveProperty('incident_time', '2025-01-15 14:23:45');
      expect(result[0]).toHaveProperty('latitude', 39.7392);
      expect(result[0]).toHaveProperty('longitude', -104.9903);
    });

    it('should handle missing source fields', () => {
      const dataWithMissingField = {
        'Incident Number': 'INC-2025-001',
        // Missing 'Call Received Date/Time'
      };

      const result = transformDataWithMapping([dataWithMissingField], testMapping);
      expect(result[0]).toHaveProperty('incident_id', 'INC-2025-001');
      expect(result[0]).toHaveProperty('incident_time', undefined);
    });

    it('should apply transformations', () => {
      const transformationMapping = [
        { 
          sourceField: 'Incident Number', 
          targetField: 'incident_id', 
          transformations: [{ type: 'uppercase' }] 
        },
      ];

      const result = transformDataWithMapping([mockDataRow], transformationMapping);
      expect(result[0].incident_id).toBe('INC-2025-001'); // Already uppercase
    });

    it('should handle multiple data rows', () => {
      const multipleRows = [
        mockDataRow,
        { ...mockDataRow, 'Incident Number': 'INC-2025-002' },
        { ...mockDataRow, 'Incident Number': 'INC-2025-003' },
      ];

      const result = transformDataWithMapping(multipleRows, testMapping);
      expect(result).toHaveLength(3);
      expect(result[1].incident_id).toBe('INC-2025-002');
      expect(result[2].incident_id).toBe('INC-2025-003');
    });
  });

  describe('detectFieldTypes', () => {
    const sampleData = [
      {
        'Incident Number': 'INC-2025-001',
        'Call Received Date/Time': '2025-01-15 14:23:45',
        'Latitude': '39.7392',
        'Priority': '1',
        'Active': 'true',
        'Description': 'Medical emergency response',
      },
      {
        'Incident Number': 'INC-2025-002',
        'Call Received Date/Time': '2025-01-15 15:30:12',
        'Latitude': '39.7491',
        'Priority': '2',
        'Active': 'false',
        'Description': 'Structure fire response',
      },
    ];

    it('should detect string fields', () => {
      const types = detectFieldTypes(sampleData);
      expect(types['Incident Number']).toBe('string');
      expect(types['Description']).toBe('string');
    });

    it('should detect datetime fields', () => {
      const types = detectFieldTypes(sampleData);
      expect(types['Call Received Date/Time']).toBe('datetime');
    });

    it('should detect number fields', () => {
      const types = detectFieldTypes(sampleData);
      expect(types['Latitude']).toBe('number');
      expect(types['Priority']).toBe('number');
    });

    it('should detect boolean fields', () => {
      const types = detectFieldTypes(sampleData);
      expect(types['Active']).toBe('boolean');
    });

    it('should handle empty data', () => {
      const types = detectFieldTypes([]);
      expect(types).toEqual({});
    });

    it('should handle null and undefined values', () => {
      const dataWithNulls = [
        { field1: null, field2: undefined, field3: 'value' },
        { field1: 'value', field2: 'value', field3: null },
      ];

      const types = detectFieldTypes(dataWithNulls);
      expect(types['field1']).toBe('string');
      expect(types['field2']).toBe('string');
      expect(types['field3']).toBe('string');
    });
  });

  describe('generateFieldMappingReport', () => {
    const testMapping = [
      { sourceField: 'Incident Number', targetField: 'incident_id', transformations: [] },
      { sourceField: 'Call Received Date/Time', targetField: 'incident_time', transformations: [] },
    ];

    it('should generate mapping report', () => {
      const report = generateFieldMappingReport(testMapping, mockTargetFields, [mockDataRow]);
      
      expect(report).toHaveProperty('totalFields');
      expect(report).toHaveProperty('mappedFields');
      expect(report).toHaveProperty('unmappedFields');
      expect(report).toHaveProperty('requiredFieldsCovered');
      expect(report).toHaveProperty('dataQualityScore');
      expect(report).toHaveProperty('recommendations');
    });

    it('should calculate correct statistics', () => {
      const report = generateFieldMappingReport(testMapping, mockTargetFields, [mockDataRow]);
      
      expect(report.totalFields).toBe(mockTargetFields.length);
      expect(report.mappedFields).toBe(2);
      expect(report.unmappedFields).toBe(mockTargetFields.length - 2);
    });

    it('should track required field coverage', () => {
      const report = generateFieldMappingReport(testMapping, mockTargetFields, [mockDataRow]);
      
      const requiredFields = mockTargetFields.filter(f => f.required);
      expect(report.requiredFieldsCovered).toBeLessThanOrEqual(requiredFields.length);
    });

    it('should provide recommendations', () => {
      const incompleteMapping = [
        { sourceField: 'Dispatch Time', targetField: 'dispatch_time', transformations: [] },
      ];

      const report = generateFieldMappingReport(incompleteMapping, mockTargetFields, [mockDataRow]);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate data quality score', () => {
      const report = generateFieldMappingReport(testMapping, mockTargetFields, [mockDataRow]);
      
      expect(report.dataQualityScore).toBeGreaterThan(0);
      expect(report.dataQualityScore).toBeLessThanOrEqual(100);
    });
  });
});