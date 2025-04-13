/**
 * FireEMS.ai MapFieldsManager
 * 
 * Centralized utility for managing field mapping operations throughout the application.
 * This utility consolidates the field mapping logic from various components and provides
 * a consistent API for:
 * 
 * - Creating mappings between source and target schemas
 * - Applying mappings to transform data
 * - Detecting field types and appropriate transformations
 * - Managing common field aliases and system-specific mappings
 * - Providing UI configuration for the field mapping interface
 * 
 * This utility works in conjunction with DataTransformer but focuses specifically
 * on the field mapping aspects of data transformation.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.Utils = window.FireEMS.Utils || {};

/**
 * MapFieldsManager - Centralized field mapping utility
 */
FireEMS.Utils.MapFieldsManager = (function() {
  // Import references to existing utilities if available
  const DataTransformer = window.FireEMS.Utils.DataTransformer;
  
  // CAD system field mappings (imported from DataTransformer if available)
  const CAD_SYSTEM_MAPPINGS = DataTransformer ? 
    DataTransformer.CAD_SYSTEM_MAPPINGS : 
    {
      'Motorola PremierOne': {
        'Incident ID': 'INCIDENT_NO',
        'Incident Date': 'CALL_RECEIVED_DATE',
        'Incident Time': 'CALL_RECEIVED_TIME',
        // ... other mappings
      },
      // ... other CAD systems
    };
  
  // Field aliases for common fields (imported from DataTransformer if available)
  const FIELD_ALIASES = DataTransformer ? 
    DataTransformer.FIELD_ALIASES : 
    {
      'Incident ID': [
        'Incident ID', 'IncidentID', 'incident_id', 'incidentId', 'call_id', 'callId', 
        // ... other aliases
      ],
      // ... other field aliases
    };
  
  // Tool requirements (imported from DataTransformer if available)
  const TOOL_REQUIREMENTS = DataTransformer ? 
    DataTransformer.TOOL_REQUIREMENTS : 
    {
      'response-time': {
        requiredFields: [
          'Incident ID', 'Incident Date', 'Incident Time', 
          'Dispatch Time', 'En Route Time', 'On Scene Time', 
          'Incident Type', 'Latitude', 'Longitude'
        ],
        // ... other requirements
      },
      // ... other tools
    };

  /**
   * Standard field schema with detailed metadata
   * This helps the UI display proper field information and validation
   */
  const STANDARD_FIELDS = [
    {
      name: 'Incident ID',
      type: 'text',
      category: 'incident',
      description: 'Unique identifier for the incident',
      example: 'F2023-12345',
      validation: '^[A-Za-z0-9\\-]+$',
      required: true,
      ui: {
        icon: 'tag',
        displayName: 'Incident ID',
        helpText: 'The unique ID assigned to this incident (e.g., call number, CAD ID)'
      }
    },
    {
      name: 'Incident Date',
      type: 'date',
      category: 'timestamp',
      description: 'Date the incident occurred',
      example: '2023-06-15',
      required: true,
      ui: {
        icon: 'calendar',
        displayName: 'Incident Date',
        helpText: 'The date when the incident occurred or was reported'
      }
    },
    {
      name: 'Incident Time',
      type: 'time',
      category: 'timestamp',
      description: 'Time the incident occurred',
      example: '14:30:00',
      required: true,
      ui: {
        icon: 'clock',
        displayName: 'Incident Time',
        helpText: 'The time when the incident occurred or was reported'
      }
    },
    {
      name: 'Latitude',
      type: 'coordinate',
      category: 'location',
      description: 'Latitude coordinate of the incident',
      example: '40.7128',
      validation: '^-?\\d+(\\.\\d+)?$',
      ui: {
        icon: 'place',
        displayName: 'Latitude',
        helpText: 'The north-south position of the incident location (e.g., 40.7128)'
      }
    },
    {
      name: 'Longitude',
      type: 'coordinate',
      category: 'location',
      description: 'Longitude coordinate of the incident',
      example: '-74.0060',
      validation: '^-?\\d+(\\.\\d+)?$',
      ui: {
        icon: 'place',
        displayName: 'Longitude',
        helpText: 'The east-west position of the incident location (e.g., -74.0060)'
      }
    },
    {
      name: 'Address',
      type: 'text',
      category: 'location',
      description: 'Street address of the incident',
      example: '123 Main St',
      ui: {
        icon: 'home',
        displayName: 'Address',
        helpText: 'The street address where the incident occurred'
      }
    },
    {
      name: 'City',
      type: 'text',
      category: 'location',
      description: 'City where the incident occurred',
      example: 'Springfield',
      ui: {
        icon: 'location_city',
        displayName: 'City',
        helpText: 'The city where the incident occurred'
      }
    },
    {
      name: 'State',
      type: 'text',
      category: 'location',
      description: 'State where the incident occurred',
      example: 'IL',
      ui: {
        icon: 'flag',
        displayName: 'State',
        helpText: 'The state where the incident occurred'
      }
    },
    {
      name: 'Incident Type',
      type: 'text',
      category: 'incident',
      description: 'Type or nature of the incident',
      example: 'Structure Fire',
      ui: {
        icon: 'local_fire_department',
        displayName: 'Incident Type',
        helpText: 'The type or nature of the emergency incident'
      }
    },
    {
      name: 'Priority',
      type: 'number',
      category: 'incident',
      description: 'Priority level of the incident',
      example: '1',
      ui: {
        icon: 'priority_high',
        displayName: 'Priority',
        helpText: 'The priority level assigned to this incident (1 = highest)'
      }
    },
    {
      name: 'Dispatch Time',
      type: 'time',
      category: 'timestamp',
      description: 'Time units were dispatched',
      example: '14:32:10',
      ui: {
        icon: 'send',
        displayName: 'Dispatch Time',
        helpText: 'The time when units were dispatched to the incident'
      }
    },
    {
      name: 'En Route Time',
      type: 'time',
      category: 'timestamp',
      description: 'Time units began responding',
      example: '14:33:45',
      ui: {
        icon: 'directions_car',
        displayName: 'En Route Time',
        helpText: 'The time when units began traveling to the incident'
      }
    },
    {
      name: 'On Scene Time',
      type: 'time',
      category: 'timestamp',
      description: 'Time units arrived on scene',
      example: '14:39:22',
      ui: {
        icon: 'location_on',
        displayName: 'On Scene Time',
        helpText: 'The time when units arrived at the incident location'
      }
    },
    {
      name: 'Transport Time',
      type: 'time',
      category: 'timestamp',
      description: 'Time patient transport began',
      example: '15:05:18',
      ui: {
        icon: 'airport_shuttle',
        displayName: 'Transport Time',
        helpText: 'The time when patient transport to a medical facility began'
      }
    },
    {
      name: 'At Hospital Time',
      type: 'time',
      category: 'timestamp',
      description: 'Time units arrived at the hospital',
      example: '15:22:30',
      ui: {
        icon: 'local_hospital',
        displayName: 'At Hospital Time',
        helpText: 'The time when units arrived at the hospital or medical facility'
      }
    },
    {
      name: 'Unit ID',
      type: 'text',
      category: 'incident',
      description: 'Identifier for the responding unit',
      example: 'E42',
      ui: {
        icon: 'local_shipping',
        displayName: 'Unit ID',
        helpText: 'The identifier for the responding unit (e.g., Engine 42, Medic 7)'
      }
    },
    {
      name: 'Station',
      type: 'text',
      category: 'incident',
      description: 'Station the responding unit belongs to',
      example: 'Station 5',
      ui: {
        icon: 'business',
        displayName: 'Station',
        helpText: 'The station that the responding unit is based at'
      }
    },
    {
      name: 'NFIRS Type',
      type: 'text',
      category: 'nfirs',
      description: 'NFIRS incident type code',
      example: '111',
      ui: {
        icon: 'assignment',
        displayName: 'NFIRS Type',
        helpText: 'The NFIRS (National Fire Incident Reporting System) incident type code'
      }
    },
    {
      name: 'FDID',
      type: 'text',
      category: 'nfirs',
      description: 'Fire Department Identifier',
      example: 'IL123',
      ui: {
        icon: 'apartment',
        displayName: 'FDID',
        helpText: 'The FDID (Fire Department Identifier) assigned by the state'
      }
    },
    {
      name: 'Response Time (min)',
      type: 'number',
      calculated: true,
      category: 'calculated',
      description: 'Total response time in minutes',
      example: '8.5',
      ui: {
        icon: 'timer',
        displayName: 'Response Time',
        helpText: 'The time between dispatch and arrival on scene (in minutes)'
      }
    }
  ];
  
  /**
   * Field categories with display metadata
   */
  const FIELD_CATEGORIES = [
    {
      id: 'timestamp',
      label: 'Time & Date Fields',
      icon: 'access_time',
      description: 'Fields related to time and date information',
      order: 10
    },
    {
      id: 'location',
      label: 'Location Fields',
      icon: 'place',
      description: 'Fields related to geographic location and addresses',
      order: 20
    },
    {
      id: 'incident',
      label: 'Incident Details',
      icon: 'assignment',
      description: 'Fields describing incident information and attributes',
      order: 30
    },
    {
      id: 'nfirs',
      label: 'NFIRS Fields',
      icon: 'assignment_turned_in',
      description: 'Fields specific to NFIRS reporting requirements',
      order: 40
    },
    {
      id: 'patient',
      label: 'Patient Information',
      icon: 'personal_injury',
      description: 'Fields related to patient details (HIPAA compliant)',
      order: 50
    },
    {
      id: 'calculated',
      label: 'Calculated Fields',
      icon: 'functions',
      description: 'Fields that are calculated from other fields',
      order: 60
    },
    {
      id: 'other',
      label: 'Other Fields',
      icon: 'more_horiz',
      description: 'Fields that don't fit into other categories',
      order: 70
    }
  ];
  
  /**
   * Transform configurations for different field types
   */
  const TRANSFORM_CONFIGS = {
    'date': {
      sourceFormats: [
        { value: 'auto', label: 'Auto-detect' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
        { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
        { value: 'custom', label: 'Custom...' }
      ],
      targetFormats: [
        { value: 'ISO8601', label: 'ISO8601 (YYYY-MM-DD)' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }
      ]
    },
    'time': {
      sourceFormats: [
        { value: 'auto', label: 'Auto-detect' },
        { value: 'HH:MM:SS', label: 'HH:MM:SS (24-hour)' },
        { value: 'HH:MM', label: 'HH:MM (24-hour)' },
        { value: 'hh:MM:SS A', label: 'hh:MM:SS AM/PM (12-hour)' },
        { value: 'hh:MM A', label: 'hh:MM AM/PM (12-hour)' },
        { value: 'military', label: 'Military (HHMM)' },
        { value: 'custom', label: 'Custom...' }
      ],
      targetFormats: [
        { value: 'HH:MM:SS', label: 'HH:MM:SS (24-hour)' },
        { value: 'HH:MM', label: 'HH:MM (24-hour)' },
        { value: 'hh:MM:SS A', label: 'hh:MM:SS AM/PM (12-hour)' },
        { value: 'hh:MM A', label: 'hh:MM AM/PM (12-hour)' }
      ]
    },
    'coordinate': {
      formats: [
        { value: 'decimal', label: 'Decimal Degrees (e.g., 40.7128, -74.0060)' },
        { value: 'dms', label: 'Degrees Minutes Seconds (e.g., 40°42\'46"N, 74°00\'21"W)' }
      ]
    },
    'text': {
      transforms: [
        { value: 'none', label: 'None' },
        { value: 'uppercase', label: 'UPPERCASE' },
        { value: 'lowercase', label: 'lowercase' },
        { value: 'capitalize', label: 'Capitalize First Letter' },
        { value: 'trim', label: 'Trim whitespace' }
      ]
    }
  };

  /**
   * Detect the most likely field type based on a field name and sample value
   * @param {string} fieldName - Name of the field
   * @param {*} sampleValue - Sample value for the field
   * @returns {string} - Detected field type
   */
  function detectFieldType(fieldName, sampleValue) {
    if (!fieldName) return 'text';
    
    const lowerName = fieldName.toLowerCase();
    
    // Check for coordinate fields
    if (lowerName.includes('lat') || lowerName === 'y' || lowerName === 'y_coordinate') {
      return 'coordinate';
    }
    if (lowerName.includes('lon') || lowerName.includes('lng') || lowerName === 'x' || lowerName === 'x_coordinate') {
      return 'coordinate';
    }
    
    // Check for date fields
    if ((lowerName.includes('date') && !lowerName.includes('time')) || lowerName === 'day') {
      return 'date';
    }
    
    // Check for time fields
    if ((lowerName.includes('time') && !lowerName.includes('date')) || 
        lowerName.includes('_time') || lowerName.endsWith('time')) {
      return 'time';
    }
    
    // Check for datetime fields
    if ((lowerName.includes('date') && lowerName.includes('time')) || 
        lowerName.includes('datetime') || lowerName.includes('timestamp')) {
      return 'datetime';
    }
    
    // Check for numeric/priority fields
    if (lowerName.includes('priority') || lowerName.includes('level') || 
        lowerName.includes('number') || lowerName.includes('count')) {
      return 'number';
    }
    
    // Try to detect based on sample value if available
    if (sampleValue !== undefined && sampleValue !== null) {
      // Check if it's a number
      if (typeof sampleValue === 'number' || 
          (typeof sampleValue === 'string' && !isNaN(sampleValue) && sampleValue.trim() !== '')) {
        return 'number';
      }
      
      // Check if it could be a date
      if (typeof sampleValue === 'string') {
        // Date patterns
        const datePatterns = [
          /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
          /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY or DD/MM/YYYY
          /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY or DD-MM-YYYY
          /^\d{8}$/ // YYYYMMDD
        ];
        
        // Time patterns
        const timePatterns = [
          /^\d{1,2}:\d{2}(:\d{2})?$/, // HH:MM or HH:MM:SS
          /^\d{1,2}:\d{2}(:\d{2})?\s?[AaPp][Mm]$/, // HH:MM AM/PM
          /^\d{4}$/ // HHMM military
        ];
        
        if (datePatterns.some(pattern => pattern.test(sampleValue))) {
          return 'date';
        }
        
        if (timePatterns.some(pattern => pattern.test(sampleValue))) {
          return 'time';
        }
        
        // Check for coordinates
        if (/^-?\d+\.\d+$/.test(sampleValue)) {
          // This could be a decimal coordinate, but it's hard to be sure without context
          const num = parseFloat(sampleValue);
          if (num >= -90 && num <= 90) {
            return 'coordinate'; // Could be latitude
          }
          if (num >= -180 && num <= 180) {
            return 'coordinate'; // Could be longitude
          }
        }
      }
    }
    
    // Default to text
    return 'text';
  }

  /**
   * Find a field in the standard schema by name
   * @param {string} fieldName - Name of the field to find
   * @returns {Object|null} - Found field or null if not found
   */
  function findFieldInSchema(fieldName) {
    if (!fieldName) return null;
    
    // Try exact match first
    const exactMatch = STANDARD_FIELDS.find(field => 
      field.name.toLowerCase() === fieldName.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Try to match using aliases
    for (const [standardName, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.some(alias => alias.toLowerCase() === fieldName.toLowerCase())) {
        return STANDARD_FIELDS.find(field => field.name === standardName) || null;
      }
    }
    
    return null;
  }

  /**
   * Categorize a field based on its name if it's not in the standard schema
   * @param {string} fieldName - Name of the field to categorize
   * @returns {string} - Category ID
   */
  function categorizeField(fieldName) {
    if (!fieldName) return 'other';
    
    const lowerField = fieldName.toLowerCase();
    
    // Timestamp fields
    if (lowerField.includes('time') || lowerField.includes('date') || 
        lowerField.includes('timestamp') || lowerField.includes('datetime')) {
      return 'timestamp';
    }
    
    // Location fields
    if (lowerField.includes('address') || lowerField.includes('location') || 
        lowerField.includes('latitude') || lowerField.includes('longitude') || 
        lowerField.includes('geo') || lowerField.includes('coordinates') ||
        lowerField.includes('city') || lowerField.includes('state') || 
        lowerField.includes('zip') || lowerField.includes('county')) {
      return 'location';
    }
    
    // NFIRS fields
    if (lowerField.includes('nfirs') || lowerField.includes('fdid') || 
        lowerField.includes('firescene') || lowerField.includes('fireground')) {
      return 'nfirs';
    }
    
    // Patient fields (with HIPAA caution)
    if (lowerField.includes('patient') || lowerField.includes('medical') || 
        lowerField.includes('injury') || lowerField.includes('treatment') ||
        lowerField.includes('vital') || lowerField.includes('age') ||
        lowerField.includes('gender') || lowerField.includes('weight')) {
      return 'patient';
    }
    
    // Incident fields
    if (lowerField.includes('incident') || lowerField.includes('call') || 
        lowerField.includes('emergency') || lowerField.includes('response') || 
        lowerField.includes('dispatch') || lowerField.includes('unit') || 
        lowerField.includes('type') || lowerField.includes('priority') ||
        lowerField.includes('alarm') || lowerField.includes('station')) {
      return 'incident';
    }
    
    // Calculated fields
    if (lowerField.includes('calculated') || lowerField.includes('elapsed') ||
        lowerField.includes('total') || lowerField.includes('average')) {
      return 'calculated';
    }
    
    // Default to other
    return 'other';
  }

  /**
   * Create a standardized field object for a non-standard field
   * @param {string} fieldName - Name of the field
   * @param {*} sampleValue - Sample value for type detection
   * @returns {Object} - Standardized field object
   */
  function createStandardizedField(fieldName, sampleValue) {
    // Try to find in existing schema first
    const existingField = findFieldInSchema(fieldName);
    if (existingField) {
      return { ...existingField };
    }
    
    // Detect field type
    const fieldType = detectFieldType(fieldName, sampleValue);
    
    // Determine category
    const category = categorizeField(fieldName);
    
    // Format display name
    const displayName = fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/\b\w/g, c => c.toUpperCase());
    
    // Generate field ID
    const id = fieldName.replace(/\s+/g, '_').toLowerCase();
    
    // Create new field object
    return {
      name: fieldName,
      id: id,
      type: fieldType,
      category: category,
      description: `${displayName} field`,
      required: false,
      ui: {
        icon: getCategoryIcon(category),
        displayName: displayName,
        helpText: `The ${displayName.toLowerCase()} value`
      }
    };
  }

  /**
   * Get an icon for a category
   * @param {string} categoryId - Category identifier
   * @returns {string} - Icon name
   */
  function getCategoryIcon(categoryId) {
    const category = FIELD_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.icon : 'label';
  }

  /**
   * Find the most appropriate field in a record that matches a target field
   * @param {Object} record - Data record to search
   * @param {string} targetField - Target field name
   * @returns {string|null} - Matching field name or null if not found
   */
  function findMatchingField(record, targetField) {
    if (!record || !targetField) return null;
    
    // If the field already exists in the record, return it
    if (record[targetField] !== undefined) {
      return targetField;
    }
    
    // Get aliases for the target field
    const aliases = FIELD_ALIASES[targetField] || [];
    
    // Check if any alias exists in the record
    for (const alias of aliases) {
      if (record[alias] !== undefined) {
        return alias;
      }
    }
    
    return null;
  }

  /**
   * Auto-generate field mappings between source and target schemas
   * @param {Array<string>} sourceFields - Array of source field names
   * @param {Array<Object>} targetSchema - Array of target field objects
   * @param {Object} options - Additional options
   * @returns {Object} - Mapping of target field IDs to source field indices or names
   */
  function autoGenerateMappings(sourceFields, targetSchema, options = {}) {
    const mappings = {};
    const { useIndices = true, sampleData = null } = options;
    
    targetSchema.forEach(targetField => {
      // First try exact name match
      const exactMatchIndex = sourceFields.findIndex(field => 
        field.toLowerCase() === targetField.name.toLowerCase()
      );
      
      if (exactMatchIndex !== -1) {
        mappings[targetField.id] = useIndices ? exactMatchIndex : sourceFields[exactMatchIndex];
        return;
      }
      
      // Try aliases
      const aliases = FIELD_ALIASES[targetField.name] || [];
      for (const alias of aliases) {
        const aliasMatchIndex = sourceFields.findIndex(field => 
          field.toLowerCase() === alias.toLowerCase()
        );
        
        if (aliasMatchIndex !== -1) {
          mappings[targetField.id] = useIndices ? aliasMatchIndex : sourceFields[aliasMatchIndex];
          return;
        }
      }
      
      // Try fuzzy matching based on terminology
      if (targetField.type === 'coordinate' && targetField.name === 'Latitude') {
        const latIndex = sourceFields.findIndex(field => 
          field.toLowerCase().includes('lat') || 
          field.toLowerCase() === 'y' || 
          field.toLowerCase().includes('_y') ||
          field.toLowerCase().includes('y_')
        );
        
        if (latIndex !== -1) {
          mappings[targetField.id] = useIndices ? latIndex : sourceFields[latIndex];
          return;
        }
      }
      
      if (targetField.type === 'coordinate' && targetField.name === 'Longitude') {
        const lngIndex = sourceFields.findIndex(field => 
          field.toLowerCase().includes('lon') || 
          field.toLowerCase().includes('lng') || 
          field.toLowerCase() === 'x' || 
          field.toLowerCase().includes('_x') ||
          field.toLowerCase().includes('x_')
        );
        
        if (lngIndex !== -1) {
          mappings[targetField.id] = useIndices ? lngIndex : sourceFields[lngIndex];
          return;
        }
      }
      
      // Try to match based on field type if we have sample data
      if (sampleData && sampleData.length > 0) {
        let bestMatch = -1;
        let bestScore = 0;
        
        sourceFields.forEach((sourceField, index) => {
          // Skip if already mapped
          if (Object.values(mappings).includes(useIndices ? index : sourceField)) {
            return;
          }
          
          const sample = sampleData[0][sourceField];
          const detectedType = detectFieldType(sourceField, sample);
          
          // Calculate match score
          let score = 0;
          if (detectedType === targetField.type) {
            score += 5; // Type match is most important
          }
          
          // Category match
          const detectedCategory = categorizeField(sourceField);
          if (detectedCategory === targetField.category) {
            score += 3;
          }
          
          // Name similarity
          if (sourceField.toLowerCase().includes(targetField.name.toLowerCase().split(' ')[0])) {
            score += 2;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = index;
          }
        });
        
        if (bestMatch !== -1 && bestScore >= 3) {
          mappings[targetField.id] = useIndices ? bestMatch : sourceFields[bestMatch];
        }
      }
    });
    
    return mappings;
  }

  /**
   * Apply field mappings to transform data
   * @param {Array} data - Array of data objects
   * @param {Object} mappings - Mapping of target fields to source fields
   * @param {Object} transformConfigs - Optional configurations for field transformations
   * @returns {Array} - Transformed data with fields mapped according to the mapping
   */
  function applyMappings(data, mappings, transformConfigs = {}) {
    if (!data || !data.length || !mappings) {
      return data;
    }
    
    return data.map(item => {
      const result = {};
      
      // Apply field mappings
      Object.entries(mappings).forEach(([targetField, sourceField]) => {
        // Skip if source field doesn't exist
        if (item[sourceField] === undefined) {
          return;
        }
        
        // Get original value
        let value = item[sourceField];
        
        // Apply transformations if configured
        if (transformConfigs[targetField]) {
          value = applyTransformation(value, transformConfigs[targetField]);
        }
        
        // Set the value in the result
        result[targetField] = value;
      });
      
      return result;
    });
  }

  /**
   * Apply a specific transformation to a value
   * @param {*} value - The value to transform
   * @param {Object} config - Transformation configuration
   * @returns {*} - Transformed value
   */
  function applyTransformation(value, config) {
    if (value === undefined || value === null || value === '') {
      return value;
    }
    
    if (!config || !config.type) {
      return value;
    }
    
    // Text transformations
    if (config.type === 'text') {
      if (typeof value !== 'string') {
        value = String(value);
      }
      
      switch (config.textTransform) {
        case 'uppercase':
          return value.toUpperCase();
        case 'lowercase':
          return value.toLowerCase();
        case 'capitalize':
          return value.replace(/\b\w/g, c => c.toUpperCase());
        case 'trim':
          return value.trim();
        default:
          return value;
      }
    }
    
    // Date transformations
    if (config.type === 'date') {
      // Use DataTransformer if available for complex date handling
      if (DataTransformer && typeof DataTransformer.parseDate === 'function') {
        const date = DataTransformer.parseDate(value);
        if (date) {
          return DataTransformer.formatDate(date, config.targetFormat || 'ISO8601');
        }
      }
      
      // Basic fallback date handling
      try {
        const date = new Date(value);
        if (!isNaN(date)) {
          switch (config.targetFormat) {
            case 'MM/DD/YYYY':
              return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
            case 'DD/MM/YYYY':
              return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            case 'ISO8601':
            default:
              return date.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        console.warn('Error transforming date:', e);
      }
      
      return value;
    }
    
    // Time transformations
    if (config.type === 'time') {
      // Use DataTransformer if available for complex time handling
      if (DataTransformer && typeof DataTransformer.parseTime === 'function') {
        const time = DataTransformer.parseTime(value);
        if (time) {
          return DataTransformer.formatTime(time, config.targetFormat || 'HH:MM:SS');
        }
      }
      
      // Return original if can't transform
      return value;
    }
    
    // Coordinate transformations
    if (config.type === 'coordinate') {
      // Simple numeric conversion for coordinates
      if (typeof value === 'string') {
        const num = parseFloat(value);
        if (!isNaN(num)) {
          return num;
        }
      }
      return value;
    }
    
    // No matching transformation
    return value;
  }

  /**
   * Get fields required for a specific tool
   * @param {string} toolId - Tool identifier
   * @returns {Array} - Array of required field objects
   */
  function getRequiredFieldsForTool(toolId) {
    if (!toolId || !TOOL_REQUIREMENTS[toolId]) {
      return [];
    }
    
    const requirements = TOOL_REQUIREMENTS[toolId];
    const requiredFields = requirements.requiredFields || [];
    
    // Return standardized field objects for each required field
    return requiredFields.map(fieldName => {
      const field = findFieldInSchema(fieldName);
      return field ? { ...field, required: true } : createStandardizedField(fieldName, null);
    });
  }

  /**
   * Validate mapped data against tool requirements
   * @param {Object} mappedData - First record of mapped data to validate
   * @param {string} toolId - Tool identifier
   * @returns {Object} - Validation result with errors and warnings
   */
  function validateMappedData(mappedData, toolId) {
    if (!mappedData || !toolId || !TOOL_REQUIREMENTS[toolId]) {
      return { valid: false, errors: ['Invalid data or tool ID'] };
    }
    
    const requirements = TOOL_REQUIREMENTS[toolId];
    const errors = [];
    const warnings = [];
    
    // Check that all required fields are present
    requirements.requiredFields.forEach(fieldName => {
      if (mappedData[fieldName] === undefined || mappedData[fieldName] === null || mappedData[fieldName] === '') {
        errors.push(`Missing required field: ${fieldName}`);
      }
    });
    
    // Validate types
    if (requirements.coordinateFields) {
      requirements.coordinateFields.forEach(fieldName => {
        if (mappedData[fieldName] !== undefined) {
          const value = mappedData[fieldName];
          // Check if it's a number or can be converted to one
          if (typeof value !== 'number' && (isNaN(parseFloat(value)) || parseFloat(value).toString() !== value.toString())) {
            warnings.push(`Field ${fieldName} should be a numeric coordinate value`);
          }
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get the user interface configuration for a field
   * @param {Object} field - Field object
   * @returns {Object} - UI configuration
   */
  function getFieldUIConfig(field) {
    if (!field) return {};
    
    // Get the base configuration from the field
    const ui = field.ui || {};
    
    // Add transform config based on field type
    const transformConfig = TRANSFORM_CONFIGS[field.type] || TRANSFORM_CONFIGS['text'];
    
    return {
      ...ui,
      transform: transformConfig,
      validation: field.validation || null,
      example: field.example || null
    };
  }

  /**
   * Generate an empty mapping configuration for a schema
   * @param {Array} targetSchema - Target schema fields
   * @returns {Object} - Empty mapping configuration
   */
  function generateEmptyMapping(targetSchema) {
    const mapping = {};
    
    targetSchema.forEach(field => {
      mapping[field.id] = null;
    });
    
    return mapping;
  }

  /**
   * Convert field mappings to a format suitable for the API
   * @param {Object} mappings - Field mappings (target field IDs to source indices/names)
   * @param {Array} sourceColumns - Source column names
   * @param {Array} targetSchema - Target schema fields
   * @param {Object} transformConfigs - Field transformation configurations
   * @returns {Array} - API-compatible mapping array
   */
  function convertMappingsForAPI(mappings, sourceColumns, targetSchema, transformConfigs = {}) {
    const apiMappings = [];
    
    Object.entries(mappings).forEach(([targetId, sourceIdx]) => {
      // Skip unmapped fields
      if (sourceIdx === null || sourceIdx === undefined) {
        return;
      }
      
      // Find the target field in the schema
      const targetField = targetSchema.find(field => field.id === targetId);
      if (!targetField) {
        return;
      }
      
      // Get the source field name
      const sourceField = typeof sourceIdx === 'number' ? 
        sourceColumns[sourceIdx] : sourceIdx;
      
      // Create the mapping object
      apiMappings.push({
        sourceField,
        targetField: targetField.name,
        required: targetField.required || false,
        transformConfig: transformConfigs[targetId] || null
      });
    });
    
    return apiMappings;
  }

  // Public API
  return {
    // Core field mapping functions
    findMatchingField,
    applyMappings,
    autoGenerateMappings,
    validateMappedData,
    
    // Field metadata and schema functions
    getRequiredFieldsForTool,
    findFieldInSchema,
    createStandardizedField,
    detectFieldType,
    categorizeField,
    getFieldUIConfig,
    
    // Transformation functions
    applyTransformation,
    
    // API helper functions
    generateEmptyMapping,
    convertMappingsForAPI,
    
    // Constants and schemas
    STANDARD_FIELDS,
    FIELD_CATEGORIES,
    TRANSFORM_CONFIGS,
    FIELD_ALIASES: FIELD_ALIASES,
    CAD_SYSTEM_MAPPINGS: CAD_SYSTEM_MAPPINGS,
    TOOL_REQUIREMENTS: TOOL_REQUIREMENTS
  };
})();

// Add convenience aliases
FireEMS.Utils.mapFields = FireEMS.Utils.MapFieldsManager.applyMappings;
FireEMS.Utils.autoMap = FireEMS.Utils.MapFieldsManager.autoGenerateMappings;