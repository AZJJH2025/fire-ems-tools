import { FieldMappingTemplate, SourceFieldPattern, TemplateMetadata, TemplateSuggestion, FieldMapping, SampleData } from '@/types/formatter';
import { getCertifiedTemplates, seedVendorTemplates } from './vendorTemplates';

/**
 * Template Management Service
 * Handles saving, loading, and suggesting field mapping templates for reuse
 */
export class TemplateService {
  private static readonly STORAGE_KEY = 'fireems_field_mapping_templates';
  private static readonly VERSION = '1.0.0';

  /**
   * Save a new template based on successful field mapping
   */
  static async saveTemplate(
    name: string,
    description: string,
    fieldMappings: FieldMapping[],
    sourceFields: string[],
    sampleData: SampleData,
    targetTool: string,
    departmentName?: string,
    cadVendor?: string
  ): Promise<FieldMappingTemplate> {
    const template: FieldMappingTemplate = {
      id: this.generateTemplateId(),
      name: name.trim(),
      description: description.trim(),
      departmentName,
      cadVendor: cadVendor as any,
      targetTool,
      fieldMappings,
      sourceFieldPattern: this.analyzeSourcePattern(sourceFields, sampleData),
      metadata: this.generateMetadata(fieldMappings, sampleData),
      createdAt: new Date().toISOString(),
      useCount: 0,
      isPublic: false
    };

    // Save to localStorage
    const templates = this.getStoredTemplates();
    templates.push(template);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));

    console.log(`✅ Template saved: "${name}" (${template.id})`);
    return template;
  }

  /**
   * Load all saved templates (including vendor templates)
   */
  static getTemplates(): FieldMappingTemplate[] {
    // Ensure vendor templates are seeded
    try {
      seedVendorTemplates();
      const templates = this.getStoredTemplates();
      console.log('📚 TemplateService.getTemplates() found:', templates.length, 'templates');
      console.log('🏅 Vendor templates:', templates.filter(t => t.id?.startsWith('vendor_')).length);
      return templates;
    } catch (error) {
      console.error('❌ Error in getTemplates:', error);
      return [];
    }
  }

  /**
   * Get templates for a specific tool (including vendor templates)
   */
  static getTemplatesForTool(toolId: string): FieldMappingTemplate[] {
    // Ensure vendor templates are seeded
    seedVendorTemplates();
    return this.getStoredTemplates().filter(template => template.targetTool === toolId);
  }

  /**
   * Get certified vendor templates for a specific tool
   */
  static getCertifiedTemplatesForTool(toolId: string): FieldMappingTemplate[] {
    return getCertifiedTemplates().filter(template => template.targetTool === toolId);
  }

  /**
   * Delete a template
   */
  static deleteTemplate(templateId: string): boolean {
    const templates = this.getStoredTemplates();
    const index = templates.findIndex(t => t.id === templateId);
    
    if (index !== -1) {
      templates.splice(index, 1);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
      console.log(`🗑️ Template deleted: ${templateId}`);
      return true;
    }
    
    return false;
  }

  /**
   * Find template suggestions based on source fields
   */
  static suggestTemplates(
    sourceFields: string[],
    _sampleData: SampleData,
    targetTool: string
  ): TemplateSuggestion[] {
    const templates = this.getTemplatesForTool(targetTool);
    const suggestions: TemplateSuggestion[] = [];

    for (const template of templates) {
      const similarity = this.calculateSimilarity(sourceFields, template.sourceFieldPattern.fieldNames);
      
      if (similarity.score >= 30) { // Only suggest if 30%+ similarity
        // Boost certified vendor templates in ranking
        let adjustedScore = similarity.score;
        if (template.metadata?.tags?.includes('certified') && template.isPublic) {
          adjustedScore += 10; // 10 point boost for certified templates
          console.log(`🏅 Certified template boost: "${template.name}" ${similarity.score}% → ${adjustedScore}%`);
        }

        suggestions.push({
          template,
          similarityScore: adjustedScore,
          matchingFields: similarity.matchingFields,
          missingFields: similarity.missingFields,
          suggestions: this.generateSuggestions(similarity, template)
        });
      }
    }

    // Sort by adjusted similarity score (highest first), with certified templates prioritized
    suggestions.sort((a, b) => {
      // First priority: certified templates
      const aCertified = a.template.metadata?.tags?.includes('certified') ? 1 : 0;
      const bCertified = b.template.metadata?.tags?.includes('certified') ? 1 : 0;
      
      if (aCertified !== bCertified) {
        return bCertified - aCertified; // Certified first
      }
      
      // Second priority: similarity score
      return b.similarityScore - a.similarityScore;
    });
    
    console.log(`🔍 Found ${suggestions.length} template suggestions for tool: ${targetTool}`);
    console.log(`🏅 Certified templates: ${suggestions.filter(s => s.template.metadata?.tags?.includes('certified')).length}`);
    return suggestions.slice(0, 8); // Return top 8 suggestions (more room for certified templates)
  }

  /**
   * Apply a template to current field mappings
   */
  static applyTemplate(template: FieldMappingTemplate, sourceFields: string[]): FieldMapping[] {
    const appliedMappings: FieldMapping[] = [];
    
    // Update usage statistics
    this.incrementTemplateUsage(template.id);
    
    // Map template field mappings to available source fields
    for (const templateMapping of template.fieldMappings) {
      // Try exact match first
      if (sourceFields.includes(templateMapping.sourceField)) {
        appliedMappings.push({ ...templateMapping });
        continue;
      }
      
      // Try case-insensitive match
      const caseInsensitiveMatch = sourceFields.find(field => 
        field.toLowerCase() === templateMapping.sourceField.toLowerCase()
      );
      
      if (caseInsensitiveMatch) {
        appliedMappings.push({
          ...templateMapping,
          sourceField: caseInsensitiveMatch
        });
        continue;
      }
      
      // Try fuzzy matching for slight variations
      const fuzzyMatch = this.findFuzzyMatch(templateMapping.sourceField, sourceFields);
      if (fuzzyMatch) {
        appliedMappings.push({
          ...templateMapping,
          sourceField: fuzzyMatch
        });
      }
    }
    
    console.log(`🔧 Applied template "${template.name}": ${appliedMappings.length} mappings applied`);
    return appliedMappings;
  }

  /**
   * Generate CAD vendor signature for pattern recognition
   * Enhanced with more accurate pattern matching and confidence scoring
   */
  static generateCADSignature(sourceFields: string[]): string {
    const patterns = {
      'Console One': {
        required: ['INC_DATE_TIME', 'PROBLEM_TYPE', 'UNIT_ID'],
        optional: ['INC_NUM', 'LOCATION_ADDRESS', 'CLEAR_TIME'],
        confidence: 0
      },
      'Tyler': {
        required: ['ALARM_TIME', 'INCIDENT_DATE', 'DISPATCH_DATE'],
        optional: ['INCIDENT_NUMBER', 'NATURE_CODE', 'PRIMARY_UNIT'],
        confidence: 0
      },
      'Hexagon': {
        required: ['CallDateTime', 'DispatchDateTime', 'ArrivalDateTime'],
        optional: ['IncidentNumber', 'IncidentType', 'UnitId'],
        confidence: 0
      },
      'TriTech': {
        required: ['EventNum', 'Call_Date_Time', 'Unit_ID'],
        optional: ['Call_Type', 'Address', 'City'],
        confidence: 0
      }
    };
    
    let bestMatch = 'Other';
    let maxConfidence = 0;
    
    for (const [vendor, vendorData] of Object.entries(patterns)) {
      // Score based on required field matches (weighted heavily)
      const requiredMatches = vendorData.required.filter(pattern => 
        sourceFields.some(field => 
          field.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(field.toLowerCase())
        )
      ).length;
      
      // Score based on optional field matches (weighted lightly)
      const optionalMatches = vendorData.optional.filter(pattern => 
        sourceFields.some(field => 
          field.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(field.toLowerCase())
        )
      ).length;
      
      // Calculate confidence: 70% weight on required, 30% on optional
      const confidence = (requiredMatches / vendorData.required.length * 0.7) + 
                        (optionalMatches / vendorData.optional.length * 0.3);
      
      if (confidence > maxConfidence && confidence > 0.4) { // Minimum 40% confidence threshold
        maxConfidence = confidence;
        bestMatch = vendor;
      }
    }
    
    console.log(`🏅 CAD Vendor Detection: ${bestMatch} (${Math.round(maxConfidence * 100)}% confidence)`);
    return bestMatch;
  }

  // Private helper methods
  
  private static getStoredTemplates(): FieldMappingTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load templates from localStorage:', error);
      return [];
    }
  }

  private static generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static analyzeSourcePattern(sourceFields: string[], _sampleData: SampleData): SourceFieldPattern {
    return {
      fieldNames: [...sourceFields],
      fieldCount: sourceFields.length,
      hasHeaderRow: true, // Assume true for CSV files
      commonPatterns: this.extractCommonPatterns(sourceFields),
      cadVendorSignature: this.generateCADSignature(sourceFields)
    };
  }

  private static extractCommonPatterns(sourceFields: string[]): string[] {
    const patterns: string[] = [];
    
    // Look for common field patterns
    const patternKeys = {
      datetime: ['date', 'time', 'datetime'],
      location: ['address', 'location', 'lat', 'lng', 'coord'],
      incident: ['incident', 'call', 'event', 'alarm'],
      unit: ['unit', 'apparatus', 'resource'],
      type: ['type', 'category', 'classification']
    };
    
    for (const [patternName, keywords] of Object.entries(patternKeys)) {
      if (keywords.some(keyword => 
        sourceFields.some(field => field.toLowerCase().includes(keyword))
      )) {
        patterns.push(patternName);
      }
    }
    
    return patterns;
  }

  private static generateMetadata(fieldMappings: FieldMapping[], sampleData: SampleData): TemplateMetadata {
    // Enhanced quality scoring based on field importance and completeness
    const fieldWeights = {
      'incident_id': 10,      // Critical for all tools
      'incident_time': 10,    // Critical for response time analysis
      'incident_date': 8,     // Important for temporal analysis
      'dispatch_time': 9,     // Critical for NFPA compliance
      'arrival_time': 9,      // Critical for NFPA compliance
      'latitude': 7,          // Important for mapping tools
      'longitude': 7,         // Important for mapping tools
      'incident_type': 6,     // Useful for categorization
      'responding_unit': 5,   // Useful for unit analysis
      'address': 4,           // Helpful for context
      'city': 3,              // Geographic context
      'state': 3,             // Geographic context
      'enroute_time': 6,      // NFPA compliance
      'clear_time': 5         // Scene time analysis
    };
    
    // Calculate weighted quality score
    let totalWeight = 0;
    let achievedWeight = 0;
    
    for (const [fieldId, weight] of Object.entries(fieldWeights)) {
      totalWeight += weight;
      if (fieldMappings.some(mapping => mapping.targetField === fieldId)) {
        achievedWeight += weight;
      }
    }
    
    const qualityScore = Math.round((achievedWeight / totalWeight) * 100);
    
    // Extract sample values for validation with enhanced data type detection
    const sampleValues: Record<string, string[]> = {};
    const dataTypes: Record<string, string> = {};
    
    if (sampleData.length > 0) {
      for (const mapping of fieldMappings) {
        const values = sampleData
          .slice(0, 3) // First 3 rows
          .map(row => row[mapping.sourceField])
          .filter(val => val != null && val !== '')
          .map(val => String(val));
        
        if (values.length > 0) {
          sampleValues[mapping.sourceField] = values;
          
          // Detect data type from sample values
          dataTypes[mapping.sourceField] = this.detectDataType(values);
        }
      }
    }
    
    // Generate smart tags based on template characteristics
    const tags = this.generateSmartTags(fieldMappings, sampleData);
    
    return {
      version: this.VERSION,
      compatibility: ['1.0.0'], // Compatible versions
      qualityScore: Math.max(20, qualityScore), // Minimum 20% quality score
      successRate: 100, // Start with 100%, adjust based on usage
      dataTypes,
      sampleValues,
      tags
    };
  }

  /**
   * Detect data type from sample values
   */
  private static detectDataType(values: string[]): string {
    if (values.length === 0) return 'unknown';
    
    const firstValue = values[0];
    
    // DateTime patterns
    if (/\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}/.test(firstValue)) return 'datetime';
    if (/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(firstValue)) return 'datetime';
    
    // Date patterns
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(firstValue)) return 'date';
    if (/^\d{4}-\d{2}-\d{2}$/.test(firstValue)) return 'date';
    
    // Time patterns
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(firstValue)) return 'time';
    
    // Number patterns
    if (/^-?\d+(\.\d+)?$/.test(firstValue)) return 'number';
    
    // ID patterns
    if (/^[A-Z0-9]+[-_]?[A-Z0-9]*$/i.test(firstValue) && firstValue.length < 20) return 'id';
    
    // Default to string
    return 'string';
  }

  /**
   * Generate smart tags based on template characteristics
   */
  private static generateSmartTags(fieldMappings: FieldMapping[], sampleData: SampleData): string[] {
    const tags: string[] = [];
    
    // Tool capability tags
    const hasResponseTimeFields = fieldMappings.some(m => 
      ['incident_time', 'dispatch_time', 'arrival_time'].includes(m.targetField)
    );
    if (hasResponseTimeFields) tags.push('response-time-ready');
    
    const hasGeographicFields = fieldMappings.some(m => 
      ['latitude', 'longitude', 'address'].includes(m.targetField)
    );
    if (hasGeographicFields) tags.push('mapping-ready');
    
    const hasNFPAFields = fieldMappings.some(m => 
      ['dispatch_time', 'enroute_time', 'arrival_time'].includes(m.targetField)
    );
    if (hasNFPAFields) tags.push('nfpa-1710');
    
    // Data quality tags
    const fieldCount = fieldMappings.length;
    if (fieldCount >= 10) tags.push('comprehensive');
    else if (fieldCount >= 6) tags.push('standard');
    else if (fieldCount >= 3) tags.push('basic');
    
    // Data pattern tags
    if (sampleData.length > 0) {
      const firstRow = sampleData[0];
      const fieldNames = Object.keys(firstRow);
      
      // CAD vendor patterns (more specific detection)
      if (fieldNames.some(f => f.includes('INC_DATE_TIME'))) tags.push('console-one');
      if (fieldNames.some(f => f.includes('ALARM_TIME'))) tags.push('tyler');
      if (fieldNames.some(f => f.includes('CallDateTime'))) tags.push('hexagon');
      if (fieldNames.some(f => f.includes('EventNum'))) tags.push('tritech');
    }
    
    return tags;
  }

  private static calculateSimilarity(sourceFields: string[], templateFields: string[]): {
    score: number;
    matchingFields: string[];
    missingFields: string[];
  } {
    const sourceSet = new Set(sourceFields.map(f => f.toLowerCase()));
    // const _templateSet = new Set(templateFields.map(f => f.toLowerCase()));
    
    const matchingFields: string[] = [];
    const missingFields: string[] = [];
    
    for (const templateField of templateFields) {
      if (sourceSet.has(templateField.toLowerCase())) {
        matchingFields.push(templateField);
      } else {
        missingFields.push(templateField);
      }
    }
    
    // Calculate similarity score
    const score = (matchingFields.length / templateFields.length) * 100;
    
    return {
      score: Math.round(score),
      matchingFields,
      missingFields
    };
  }

  private static generateSuggestions(similarity: any, _template: FieldMappingTemplate): string[] {
    const suggestions: string[] = [];
    
    if (similarity.score >= 80) {
      suggestions.push('Excellent match! This template should work with minimal adjustments.');
    } else if (similarity.score >= 60) {
      suggestions.push('Good match. May need minor field mapping adjustments.');
    } else if (similarity.score >= 30) {
      suggestions.push('Partial match. Review field mappings carefully.');
    }
    
    if (similarity.missingFields.length > 0) {
      suggestions.push(`Missing fields: ${similarity.missingFields.slice(0, 3).join(', ')}`);
    }
    
    return suggestions;
  }

  private static findFuzzyMatch(targetField: string, sourceFields: string[]): string | null {
    const target = targetField.toLowerCase();
    
    for (const sourceField of sourceFields) {
      const source = sourceField.toLowerCase();
      
      // Simple fuzzy matching: check if 70% of characters match
      const similarity = this.stringSimilarity(target, source);
      if (similarity >= 0.7) {
        return sourceField;
      }
    }
    
    return null;
  }

  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
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

  private static incrementTemplateUsage(templateId: string): void {
    const templates = this.getStoredTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      template.useCount++;
      template.lastUsed = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    }
  }
}