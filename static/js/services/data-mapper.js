/**
 * DataMapper - Core Service for Schema-Based Data Transformation
 * 
 * This service provides a unified way to map and transform data between
 * different formats based on the standardized schema.
 */

class DataMapper {
  /**
   * Create a new DataMapper instance
   * @param {Object} schema - The standardized schema object
   */
  constructor(schema = null) {
    this.schema = schema;
    this.mappings = {};
    this.loadSchema();
  }

  /**
   * Load the schema from a file if not provided in constructor
   */
  async loadSchema() {
    if (this.schema) return;
    
    try {
      const response = await fetch('/static/standardized_incident_record_schema.json');
      if (!response.ok) {
        throw new Error(`Failed to load schema: ${response.status}`);
      }
      this.schema = await response.json();
      console.log("Schema loaded successfully");
    } catch (error) {
      console.error("Error loading schema:", error);
      // Create an emergency fallback schema
      this.createFallbackSchema();
    }
  }
  
  /**
   * Create a minimal fallback schema for emergencies
   */
  createFallbackSchema() {
    console.warn("Creating fallback schema");
    this.schema = {
      schemaVersion: "1.0",
      description: "Fallback schema",
      coreMappings: {
        incident: {
          id: { name: "Incident ID", required: true, aliases: ["Inc_ID", "IncidentID"] },
          date: { name: "Incident Date", required: true, aliases: ["Call_Date", "Date"] },
          time: { name: "Incident Time", required: true, aliases: ["Call_Time", "Time"] }
        },
        location: {
          latitude: { name: "Latitude", required: true, aliases: ["GPS_Lat", "Lat"] },
          longitude: { name: "Longitude", required: true, aliases: ["GPS_Lon", "Lon"] }
        },
        response: {
          unit: { name: "Unit", required: true, aliases: ["Units", "Unit_ID"] },
          dispatched: { name: "Unit Dispatched", required: true, aliases: ["Disp_Time"] },
          arrived: { name: "Unit Onscene", required: true, aliases: ["Arriv_Time"] }
        }
      },
      toolRequirements: {
        "response-time": [
          "incident.id", "incident.date", "incident.time", 
          "location.latitude", "location.longitude", 
          "response.unit", "response.dispatched", "response.arrived"
        ]
      }
    };
  }
  
  /**
   * Set user-defined field mappings
   * @param {Object} sourceMappings - Source field to schema field mappings
   */
  setMappings(sourceMappings) {
    this.mappings = sourceMappings;
    return this;
  }
  
  /**
   * Transform data using schema and mappings
   * @param {Array} data - The input data records
   * @param {string} targetTool - The target tool ID
   * @returns {Array} The transformed data records
   */
  transform(data, targetTool) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("No valid data to transform");
      return [];
    }
    
    if (!this.schema) {
      console.error("Schema not loaded, cannot transform data");
      return data;
    }
    
    // Log the transformation start
    console.log(`Transforming ${data.length} records for ${targetTool}`);
    console.log("Source record sample:", data[0]);
    
    // Get required fields for the target tool
    const requiredFields = this.getRequiredFields(targetTool);
    if (requiredFields.length === 0) {
      console.warn(`No requirements found for tool: ${targetTool}. Using original data.`);
      return data;
    }
    
    // Transform each record
    const transformedData = data.map((record, index) => {
      const transformedRecord = {};
      
      // Process each required field
      for (const fieldPath of requiredFields) {
        try {
          // Get field definition from schema
          const fieldDef = this.getFieldDefinition(fieldPath);
          if (!fieldDef) {
            console.warn(`Field definition not found for: ${fieldPath}`);
            continue;
          }
          
          // Find source value
          const value = this.resolveFieldValue(record, fieldPath, fieldDef);
          
          // Format value according to field type
          const formattedValue = this.formatValue(value, fieldDef);
          
          // Set in transformed record using standardized name
          transformedRecord[fieldDef.name] = formattedValue;
          
        } catch (error) {
          console.error(`Error transforming field ${fieldPath} in record ${index}:`, error);
        }
      }
      
      // Add source tracking for debugging
      transformedRecord._source = "schema_mapper";
      
      return transformedRecord;
    });
    
    // Log the first transformed record
    if (transformedData.length > 0) {
      console.log("Transformed record sample:", transformedData[0]);
      console.log("Transformed fields:", Object.keys(transformedData[0]));
    }
    
    return transformedData;
  }
  
  /**
   * Get required fields for a specific tool
   * @param {string} toolId - The tool ID
   * @returns {Array} List of required field paths
   */
  getRequiredFields(toolId) {
    if (!this.schema || !this.schema.toolRequirements) {
      console.error("Schema or toolRequirements not found");
      return [];
    }
    
    return this.schema.toolRequirements[toolId] || [];
  }
  
  /**
   * Get field definition from schema using dot path
   * @param {string} fieldPath - Path in format "category.field"
   * @returns {Object} Field definition
   */
  getFieldDefinition(fieldPath) {
    if (!this.schema || !this.schema.coreMappings) {
      console.error("Schema or coreMappings not found");
      return null;
    }
    
    const [category, field] = fieldPath.split('.');
    if (!category || !field) {
      console.error(`Invalid field path: ${fieldPath}`);
      return null;
    }
    
    if (!this.schema.coreMappings[category]) {
      console.error(`Category not found: ${category}`);
      return null;
    }
    
    return this.schema.coreMappings[category][field] || null;
  }
  
  /**
   * Find the value from user mappings or auto-detection
   * @param {Object} record - The source data record
   * @param {string} fieldPath - The field path in schema
   * @param {Object} fieldDef - The field definition
   * @returns {*} The field value
   */
  resolveFieldValue(record, fieldPath, fieldDef) {
    // Check if user mapped this field
    if (this.mappings[fieldPath]) {
      const sourceField = this.mappings[fieldPath];
      
      // Handle array of source fields (for fallbacks)
      if (Array.isArray(sourceField)) {
        for (const field of sourceField) {
          if (record[field] !== undefined) {
            return record[field];
          }
        }
      } else if (record[sourceField] !== undefined) {
        return record[sourceField];
      }
    }
    
    // Try auto-detection using aliases
    if (fieldDef.aliases) {
      for (const alias of fieldDef.aliases) {
        if (record[alias] !== undefined) {
          return record[alias];
        }
      }
    }
    
    // Try case-insensitive match for field names (common issue with different CAD systems)
    const fieldName = fieldDef.name.toLowerCase();
    for (const key of Object.keys(record)) {
      if (key.toLowerCase() === fieldName) {
        return record[key];
      }
    }
    
    // Search for partial matches in field names as last resort
    // Only for critical fields like coordinates and identifiers
    const isCriticalField = fieldPath.includes('latitude') || 
                           fieldPath.includes('longitude') || 
                           fieldPath.includes('incident.id') || 
                           fieldPath.includes('response.unit');
    
    if (isCriticalField) {
      const fieldNameParts = fieldDef.name.toLowerCase().split(/\s+/);
      
      // Check each source field for partial matches
      for (const key of Object.keys(record)) {
        const keyLower = key.toLowerCase();
        
        // For coordinates, check for any field with lat/lon in the name
        if (fieldPath.includes('latitude') && (keyLower.includes('lat') || keyLower.includes('y'))) {
          console.log(`Found potential latitude match: ${key}`);
          return record[key];
        }
        
        if (fieldPath.includes('longitude') && (keyLower.includes('lon') || keyLower.includes('long') || keyLower.includes('x'))) {
          console.log(`Found potential longitude match: ${key}`);
          return record[key];
        }
        
        // For other critical fields, check if all parts of the field name are in the source field
        if (fieldNameParts.every(part => keyLower.includes(part))) {
          console.log(`Found potential match for ${fieldDef.name}: ${key}`);
          return record[key];
        }
      }
    }
    
    // For debugging
    if (fieldDef.required) {
      console.warn(`Required field ${fieldDef.name} not found in record`);
    }
    
    return null; // Not found
  }
  
  /**
   * Format value according to field type
   * @param {*} value - The raw value
   * @param {Object} fieldDef - The field definition
   * @returns {*} The formatted value
   */
  formatValue(value, fieldDef) {
    if (value === null || value === undefined) {
      return null;
    }
    
    try {
      switch (fieldDef.type) {
        case 'number':
          // Handle DMS format (common in some GIS systems)
          if (typeof value === 'string' && (value.includes('°') || value.includes("'") || value.includes('"'))) {
            console.log(`Converting potential DMS coordinate: ${value}`);
            return this.convertDMSToDecimal(value);
          }
          
          // Handle special case for map coordinates which must be numbers
          if (fieldDef.name === 'Latitude' || fieldDef.name === 'Longitude') {
            // First try parsing as a float
            let num = parseFloat(value);
            
            // If it's a valid number, ensure it's in a reasonable range
            if (!isNaN(num)) {
              // For latitude, must be between -90 and 90
              if (fieldDef.name === 'Latitude') {
                if (num > 90 || num < -90) {
                  console.warn(`Invalid latitude value out of range: ${num}, attempting to fix`);
                  
                  // Try some common fixes - sometimes lat/long are swapped
                  if (num > 90 && num < 180) {
                    // Might be a longitude in latitude field
                    console.log(`Value ${num} looks like longitude in latitude field`);
                    return null; // Return null to trigger warning and allow fallback
                  } else if (num > 180 || num < -180) {
                    // Might be a projection coordinate system, not lat/long
                    console.log(`Value ${num} appears to be in a projection coordinate system, not lat/long`);
                    return null;
                  }
                }
              }
              // For longitude, must be between -180 and 180
              else if (fieldDef.name === 'Longitude') {
                if (num > 180 || num < -180) {
                  console.warn(`Invalid longitude value out of range: ${num}, attempting to fix`);
                  
                  // Try some common fixes
                  if (num > -90 && num < 90) {
                    // Might be a latitude in longitude field
                    console.log(`Value ${num} looks like latitude in longitude field`);
                    return null; // Return null to trigger warning and allow fallback
                  } else if (num > 180 || num < -180) {
                    // Might be a projection coordinate system, not lat/long
                    console.log(`Value ${num} appears to be in a projection coordinate system, not lat/long`);
                    return null;
                  }
                }
              }
              
              return num;
            }
            
            // If we couldn't parse as a number, try cleaning the string
            if (typeof value === 'string') {
              // Remove any non-numeric characters except decimal point and minus sign
              const cleaned = value.replace(/[^\d.-]/g, '');
              num = parseFloat(cleaned);
              if (!isNaN(num)) {
                console.log(`Successfully cleaned coordinate string: ${value} -> ${num}`);
                return num;
              }
            }
            
            // If all else fails, return null for coordinate fields
            console.warn(`Could not convert coordinate value to number: ${value}`);
            return null;
          }
          
          // Regular number handling for other fields
          const num = parseFloat(value);
          return isNaN(num) ? null : num;
          
        case 'date':
          // Date formatting logic
          return this.formatDate(value, fieldDef.format);
          
        case 'time':
          // Time formatting logic
          return this.formatTime(value, fieldDef.format);
          
        default:
          // For strings and other types, return as is
          return value;
      }
    } catch (error) {
      console.error(`Error formatting ${fieldDef.name}:`, error);
      return value; // Return original value on error
    }
  }
  
  /**
   * Convert DMS coordinate format to decimal degrees
   * @param {string} dmsStr - Coordinate in DMS format (e.g. "40° 26' 46" N")
   * @returns {number} Coordinate in decimal degrees
   */
  convertDMSToDecimal(dmsStr) {
    try {
      // Remove any non-essential characters and split into components
      const dms = dmsStr.replace(/[^\d°'"NSEW.-\s]/g, '');
      
      // Check if it's a simple decimal format with a directional indicator
      if (/^-?\d+\.?\d*\s*[NSEW]$/.test(dms)) {
        const value = parseFloat(dms);
        const dir = dms.match(/[NSEW]$/)[0];
        return (dir === 'S' || dir === 'W') ? -Math.abs(value) : Math.abs(value);
      }
      
      // Check for degrees, minutes, seconds format
      if (dms.includes('°')) {
        const parts = dms.split(/[°'"]/);
        const degrees = parseFloat(parts[0]);
        const minutes = parts.length > 1 ? parseFloat(parts[1]) : 0;
        const seconds = parts.length > 2 ? parseFloat(parts[2]) : 0;
        
        let decimal = degrees + (minutes / 60) + (seconds / 3600);
        
        // Check for directional indicators
        if (dms.includes('S') || dms.includes('W')) {
          decimal = -decimal;
        }
        
        return decimal;
      }
      
      // Fallback to original parsing
      return parseFloat(dmsStr);
    } catch (error) {
      console.error('Error converting DMS to decimal:', error);
      return null;
    }
  }
  
  /**
   * Format date according to specified format
   * @param {*} value - The date value
   * @param {string} format - The target format
   * @returns {string} Formatted date
   */
  formatDate(value, format) {
    if (!value) return null;
    
    // Handle different date formats
    let date;
    
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string') {
      // Try different parsing strategies
      if (value.includes('T')) {
        // ISO format
        date = new Date(value);
      } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
        // YYYY-MM-DD
        date = new Date(value);
      } else if (value.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
        // MM/DD/YYYY or DD/MM/YYYY
        const parts = value.split('/');
        if (parts.length === 3) {
          // Detect if month or day comes first
          if (parseInt(parts[0]) > 12) {
            // DD/MM/YYYY
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          } else {
            // MM/DD/YYYY
            date = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
          }
        }
      }
    }
    
    if (!date || isNaN(date.getTime())) {
      console.warn(`Invalid date: ${value}`);
      return value;
    }
    
    // Format according to specified format
    if (format === 'YYYY-MM-DD') {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    // Default to ISO format
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Format time according to specified format
   * @param {*} value - The time value
   * @param {string} format - The target format
   * @returns {string} Formatted time
   */
  formatTime(value, format) {
    if (!value) return null;
    
    // Extract time if value is a full datetime
    if (typeof value === 'string' && value.includes('T')) {
      value = value.split('T')[1].substring(0, 8);
    }
    
    // Handle time format HH:MM:SS
    if (typeof value === 'string' && value.match(/^\d{1,2}:\d{1,2}(:\d{1,2})?$/)) {
      // Already in time format, just ensure proper padding
      const parts = value.split(':');
      if (parts.length === 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
      } else if (parts.length === 3) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`;
      }
    }
    
    // If it's a date object
    if (value instanceof Date) {
      return value.toTimeString().substring(0, 8);
    }
    
    return value;
  }
  
  /**
   * Validate transformed data
   * @param {Array} data - The transformed data
   * @param {string} toolId - The target tool ID
   * @returns {Object} Validation results with problems list
   */
  validate(data, toolId) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        valid: false,
        problems: [{ issue: 'no_data' }]
      };
    }
    
    const problems = [];
    const requiredFields = this.getRequiredFields(toolId);
    
    // Check if all required fields are present and valid
    data.forEach((record, index) => {
      requiredFields.forEach(fieldPath => {
        const fieldDef = this.getFieldDefinition(fieldPath);
        if (!fieldDef) return;
        
        const value = record[fieldDef.name];
        
        if (value === null || value === undefined) {
          problems.push({
            record: index,
            field: fieldDef.name,
            issue: 'missing_value',
            fieldPath
          });
        } else if (fieldDef.type === 'number' && isNaN(value)) {
          problems.push({
            record: index,
            field: fieldDef.name,
            issue: 'invalid_number',
            value,
            fieldPath
          });
        }
      });
    });
    
    return {
      valid: problems.length === 0,
      problems
    };
  }
  
  /**
   * Auto-suggest mappings based on field names in source data
   * @param {Array} data - The source data records
   * @param {string} toolId - The target tool ID
   * @returns {Object} Suggested mappings
   */
  suggestMappings(data, toolId) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {};
    }
    
    const requiredFields = this.getRequiredFields(toolId);
    const suggestions = {};
    
    // Get keys from first record
    const sourceFields = Object.keys(data[0]);
    
    // For each required field
    requiredFields.forEach(fieldPath => {
      const fieldDef = this.getFieldDefinition(fieldPath);
      if (!fieldDef) return;
      
      // Look for exact match first
      if (sourceFields.includes(fieldDef.name)) {
        suggestions[fieldPath] = fieldDef.name;
        return;
      }
      
      // Then check aliases
      if (fieldDef.aliases) {
        for (const alias of fieldDef.aliases) {
          if (sourceFields.includes(alias)) {
            suggestions[fieldPath] = alias;
            return;
          }
        }
      }
      
      // Finally look for partial matches
      const lowercaseName = fieldDef.name.toLowerCase();
      const match = sourceFields.find(field => 
        field.toLowerCase().includes(lowercaseName) || 
        lowercaseName.includes(field.toLowerCase())
      );
      
      if (match) {
        suggestions[fieldPath] = match;
      }
    });
    
    return suggestions;
  }
}

// Make available globally
window.DataMapper = DataMapper;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataMapper;
}