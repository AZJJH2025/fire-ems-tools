/**
 * FireEMS.ai Data Transformer Utility
 * 
 * Provides centralized data transformation with:
 * - Standardized parsers for common data formats (CSV, JSON, Excel, XML)
 * - Field mapping capabilities for various CAD/RMS systems
 * - Date/time format conversions
 * - Coordinate standardization
 * - Data validation and cleanup
 * - Type conversions and casting
 * - Special handling for emergency services data
 * 
 * This utility consolidates data transformation throughout the application
 * to provide a consistent approach.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.Utils = window.FireEMS.Utils || {};

/**
 * DataTransformer - Centralized data transformation utility
 */
FireEMS.Utils.DataTransformer = (function() {
  // Common date and time format patterns
  const DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    US: 'MM/DD/YYYY',
    EU: 'DD/MM/YYYY',
    DATETIME_ISO: 'YYYY-MM-DDTHH:mm:ss',
    DATETIME_US: 'MM/DD/YYYY HH:mm:ss',
    DATETIME_EU: 'DD/MM/YYYY HH:mm:ss'
  };
  
  // CAD system field mappings - centralizes mapping logic from various places
  const CAD_SYSTEM_MAPPINGS = {
    'Motorola PremierOne': {
      'Incident ID': 'INCIDENT_NO',
      'Incident Date': 'CALL_RECEIVED_DATE',
      'Incident Time': 'CALL_RECEIVED_TIME',
      'Dispatch Time': 'DISPATCH_TIME',
      'En Route Time': 'EN_ROUTE_TIME',
      'On Scene Time': 'ARRIVAL_TIME',
      'Latitude': 'LAT',
      'Longitude': 'LON',
      'Address': 'LOCATION_ADDR',
      'City': 'LOCATION_CITY',
      'State': 'LOCATION_ST',
      'Incident Type': 'INCIDENT_TYPE_DESC',
      'Unit ID': 'UNIT_ID',
      'Priority': 'PRIORITY_CD'
    },
    'Tyler New World': {
      'Incident ID': 'CAD_CALL_ID',
      'Incident Date': date => {
        if (date.CALL_DATE_TIME) {
          return new Date(date.CALL_DATE_TIME).toISOString().split('T')[0];
        }
        return date.CALL_DATE || '';
      },
      'Incident Time': date => {
        if (date.CALL_DATE_TIME) {
          return new Date(date.CALL_DATE_TIME).toISOString().split('T')[1].substring(0, 8);
        }
        return date.CALL_TIME || '';
      },
      'Dispatch Time': date => {
        if (date.DISP_DATE_TIME) {
          return new Date(date.DISP_DATE_TIME).toISOString().split('T')[1].substring(0, 8);
        }
        return date.DISPATCH_TIME || '';
      },
      'On Scene Time': date => {
        if (date.ARRV_DATE_TIME) {
          return new Date(date.ARRV_DATE_TIME).toISOString().split('T')[1].substring(0, 8);
        }
        return date.ARRIVAL_TIME || '';
      },
      'Latitude': 'LATITUDE',
      'Longitude': 'LONGITUDE',
      'Address': 'ADDRESS',
      'City': 'CITY',
      'State': 'STATE',
      'Incident Type': val => val.NATURE_DESC || val.NATURE_CODE || '',
      'Unit ID': 'UNIT_ASSIGNED',
      'Priority': 'PRIORITY'
    },
    'Hexagon/Intergraph': {
      'Incident ID': 'EVENT_NUMBER',
      'Incident Date': date => {
        if (date.EVENT_OPEN_DATETIME) {
          return new Date(date.EVENT_OPEN_DATETIME).toISOString().split('T')[0];
        }
        return date.EVENT_DATE || '';
      },
      'Incident Time': date => {
        if (date.EVENT_OPEN_DATETIME) {
          return new Date(date.EVENT_OPEN_DATETIME).toISOString().split('T')[1].substring(0, 8);
        }
        return date.EVENT_TIME || '';
      },
      'Dispatch Time': date => {
        if (date.DISPATCH_DATETIME) {
          return new Date(date.DISPATCH_DATETIME).toISOString().split('T')[1].substring(0, 8);
        }
        return date.DISPATCH_TIME || '';
      },
      'On Scene Time': date => {
        if (date.ARRIVE_DATETIME) {
          return new Date(date.ARRIVE_DATETIME).toISOString().split('T')[1].substring(0, 8);
        }
        return date.ARRIVE_TIME || '';
      },
      'Latitude': 'EVENT_Y_COORDINATE',
      'Longitude': 'EVENT_X_COORDINATE',
      'Address': 'EVENT_STREET',
      'City': 'EVENT_CITY',
      'State': 'EVENT_STATE',
      'Incident Type': val => val.PROBLEM_DESCRIPTION || val.PROBLEM_TYPE || '',
      'Unit ID': 'UNIT_NUMBER',
      'Priority': 'EVENT_PRIORITY'
    },
    'Central Square': {
      'Incident ID': 'CAD_INCIDENT_ID',
      'Incident Date': date => {
        if (date.REPORTED_DT) {
          return new Date(date.REPORTED_DT).toISOString().split('T')[0];
        }
        return date.INCIDENT_DATE || '';
      },
      'Incident Time': date => {
        if (date.REPORTED_DT) {
          return new Date(date.REPORTED_DT).toISOString().split('T')[1].substring(0, 8);
        }
        return date.INCIDENT_TIME || '';
      },
      'Dispatch Time': date => {
        if (date.DISPATCH_DT) {
          return new Date(date.DISPATCH_DT).toISOString().split('T')[1].substring(0, 8);
        }
        return date.DISPATCH_TIME || '';
      },
      'On Scene Time': date => {
        if (date.ARRIVAL_DT) {
          return new Date(date.ARRIVAL_DT).toISOString().split('T')[1].substring(0, 8);
        }
        return date.ARRIVAL_TIME || '';
      },
      'Latitude': 'GEOY',
      'Longitude': 'GEOX',
      'Address': 'ADDR_STR',
      'City': 'ADDR_CITY',
      'State': 'ADDR_STATE',
      'Incident Type': val => val.CALL_DESCRIPTION || val.CALL_TYPE || '',
      'Unit ID': 'APPARATUS_ID',
      'Priority': 'CALL_PRIORITY'
    },
    'ImageTrend': {
      'Incident ID': 'IncidentPK',
      'Incident Date': 'IncidentDate',
      'Incident Time': 'IncidentTime',
      'Dispatch Time': 'DispatchTime',
      'En Route Time': 'EnRouteTime',
      'On Scene Time': 'ArriveTime',
      'Latitude': 'Latitude',
      'Longitude': 'Longitude',
      'Address': 'StreetAddress',
      'City': 'City',
      'State': 'State',
      'Incident Type': val => val.IncidentTypeCode || val.CallType || '',
      'Unit ID': 'VehicleID',
      'Priority': val => {
        // Convert alarm level to numeric priority (lower number = higher priority)
        if (val.AlarmLevel) {
          const alarmLevel = parseInt(val.AlarmLevel.replace(/[^0-9]/g, ''));
          if (!isNaN(alarmLevel)) {
            return alarmLevel;
          }
        }
        return val.Priority || '';
      }
    }
  };
  
  // Field name aliases for common fields - used when direct mapping isn't available
  const FIELD_ALIASES = {
    'Incident ID': [
      'Incident ID', 'IncidentID', 'incident_id', 'incidentId', 'call_id', 'callId', 
      'Call ID', 'Call Number', 'call_number', 'Run Number', 'run_number', 'RunNumber',
      'id', 'ID', 'IncidentNumber', 'incident_number', 'Incident Number', 'EventID',
      'event_id', 'Event ID', 'INCIDENT_NO', 'CAD_CALL_ID', 'EVENT_NUMBER', 'CAD_INCIDENT_ID',
      'IncidentPK', 'INCIDENTID', 'PC_IncidentNumber'
    ],
    'Latitude': [
      'Latitude', 'latitude', 'lat', 'Lat', 'LAT', 'y', 'Y', 'GEOY', 'GeoY',
      'LAT', 'LATITUDE', 'EVENT_Y_COORDINATE', 'GEOY', 'Lat_Long_Y', 'Lat_Y',
      'gps_lat', 'GPS_LAT', 'GPS_Latitude', 'gps_latitude', 'WGS84Latitude'
    ],
    'Longitude': [
      'Longitude', 'longitude', 'long', 'Long', 'LONG', 'lng', 'Lng', 'LON', 'Lon', 'lon',
      'x', 'X', 'GEOX', 'GeoX', 'LON', 'LONGITUDE', 'EVENT_X_COORDINATE', 'GEOX',
      'Lat_Long_X', 'Long_X', 'gps_long', 'GPS_LONG', 'GPS_Longitude', 'gps_longitude',
      'WGS84Longitude'
    ],
    'Address': [
      'Address', 'address', 'LOCATION_ADDR', 'street_address', 'StreetAddress', 'Location',
      'location', 'full_address', 'FullAddress', 'ADDR_STR', 'EVENT_STREET', 'ADDRESS',
      'street', 'Street', 'address_line_1', 'AddressLine1', 'IncidentAddress', 'incident_address',
      'DispatchAddress', 'dispatch_address', 'CallLocation', 'call_location', 'LocationAddress'
    ],
    'Incident Date': [
      'Incident Date', 'incident_date', 'IncidentDate', 'date', 'Date', 'CallDate',
      'call_date', 'AlarmDate', 'alarm_date', 'EventDate', 'event_date', 'DateOfCall',
      'date_of_call', 'ResponseDate', 'response_date', 'CALL_RECEIVED_DATE', 'CALL_DATE',
      'EVENT_DATE', 'INCIDENT_DATE', 'IncidentDate', 'CALL_DATE', 'IncidentOccurrenceDate'
    ],
    'Incident Time': [
      'Incident Time', 'incident_time', 'IncidentTime', 'time', 'Time', 'CallTime',
      'call_time', 'AlarmTime', 'alarm_time', 'EventTime', 'event_time', 'TimeOfCall',
      'time_of_call', 'ResponseTime', 'response_time', 'CALL_RECEIVED_TIME', 'CALL_TIME',
      'EVENT_TIME', 'INCIDENT_TIME', 'IncidentTime', 'CALL_TIME', 'IncidentOccurrenceTime'
    ],
    'Dispatch Time': [
      'Dispatch Time', 'dispatch_time', 'DispatchTime', 'TimeDispatched', 'time_dispatched',
      'UnitDispatched', 'unit_dispatched', 'TimeOfDispatch', 'time_of_dispatch',
      'DISPATCH_TIME', 'DISP_TIME', 'DISPATCHED_TIME', 'DispatchTime', 'DISPATCH_TIME',
      'UnitDispatchTime', 'unit_dispatch_time', 'DispatchDateTime', 'dispatch_date_time'
    ],
    'En Route Time': [
      'En Route Time', 'en_route_time', 'EnRouteTime', 'TimeEnRoute', 'time_en_route',
      'UnitEnRoute', 'unit_en_route', 'TimeOfEnRoute', 'time_of_en_route', 'RespondingTime',
      'responding_time', 'EN_ROUTE_TIME', 'ENRT_TIME', 'ENROUTE_TIME', 'EnRouteTime',
      'ENROUTE_TIME', 'UnitEnRouteTime', 'unit_enroute_time', 'EnRouteDateTime'
    ],
    'On Scene Time': [
      'On Scene Time', 'on_scene_time', 'OnSceneTime', 'TimeOnScene', 'time_on_scene',
      'UnitOnScene', 'unit_on_scene', 'TimeOfArrival', 'time_of_arrival', 'ArrivalTime',
      'arrival_time', 'ARRIVAL_TIME', 'ARRV_TIME', 'ONSCENE_TIME', 'OnSceneTime',
      'ARRIVAL_TIME', 'UnitOnSceneTime', 'unit_onscene_time', 'ArrivalDateTime'
    ],
    'Incident Type': [
      'Incident Type', 'incident_type', 'IncidentType', 'type', 'Type', 'CallType',
      'call_type', 'NatureOfCall', 'nature_of_call', 'CallCategory', 'call_category',
      'CallDescription', 'call_description', 'INCIDENT_TYPE_DESC', 'NATURE_DESC',
      'PROBLEM_DESCRIPTION', 'CALL_DESCRIPTION', 'IncidentTypeCode', 'IncidentType',
      'CALL_TYPE', 'EventType', 'event_type', 'EmergencyCategory', 'CategoryName'
    ],
    'Unit ID': [
      'Unit ID', 'unit_id', 'UnitID', 'unit', 'Unit', 'ApparatusID', 'apparatus_id',
      'VehicleID', 'vehicle_id', 'RespondingUnit', 'responding_unit', 'ResourceID',
      'resource_id', 'UNIT_ID', 'UNIT_ASSIGNED', 'UNIT_NUMBER', 'APPARATUS_ID',
      'VehicleID', 'ResponderID', 'responder_id', 'TruckID', 'EngineID', 'AmbulanceID'
    ],
    'Priority': [
      'Priority', 'priority', 'CallPriority', 'call_priority', 'ResponsePriority',
      'response_priority', 'UrgencyLevel', 'urgency_level', 'Urgency', 'urgency',
      'EmergencyLevel', 'emergency_level', 'PRIORITY_CD', 'PRIORITY', 'EVENT_PRIORITY',
      'CALL_PRIORITY', 'IncidentPriority', 'incident_priority', 'PriorityCode',
      'AlarmLevel', 'alarm_level', 'DispatchPriority', 'dispatch_priority'
    ]
  };

  // Tool-specific field requirements
  const TOOL_REQUIREMENTS = {
    'response-time': {
      requiredFields: [
        'Incident ID', 'Incident Date', 'Incident Time', 
        'Dispatch Time', 'En Route Time', 'On Scene Time', 
        'Incident Type', 'Latitude', 'Longitude'
      ],
      dateFields: ['Incident Date'],
      timeFields: ['Incident Time', 'Dispatch Time', 'En Route Time', 'On Scene Time'],
      coordinateFields: ['Latitude', 'Longitude'],
      optionalFields: ['Unit ID', 'Station', 'Priority', 'Address']
    },
    'call-density': {
      requiredFields: [
        'Incident ID', 'Incident Date', 'Incident Time',
        'Latitude', 'Longitude'
      ],
      dateFields: ['Incident Date'],
      timeFields: ['Incident Time'],
      coordinateFields: ['Latitude', 'Longitude'],
      optionalFields: ['Incident Type', 'Priority', 'Unit ID']
    },
    'incident-logger': {
      requiredFields: [
        'Incident ID', 'Incident Date', 'Incident Time',
        'Incident Type', 'Address', 'Unit ID'
      ],
      dateFields: ['Incident Date'],
      timeFields: ['Incident Time'],
      optionalFields: ['Latitude', 'Longitude', 'Patient Info', 'Notes']
    },
    'isochrone': {
      requiredFields: [
        'Station ID', 'Station Name', 'Station Address',
        'Latitude', 'Longitude', 'Unit Types'
      ],
      coordinateFields: ['Latitude', 'Longitude'],
      optionalFields: ['Personnel Count', 'Station Type', 'Active Units']
    },
    'isochrone-stations': {
      requiredFields: [
        'Station ID', 'Station Name',
        'Latitude', 'Longitude'
      ],
      coordinateFields: ['Latitude', 'Longitude'],
      optionalFields: ['Station Address', 'Unit Types', 'Personnel Count', 'Station Type', 'Active Units']
    },
    'isochrone-incidents': {
      requiredFields: [
        'Incident ID', 'Incident Type',
        'Latitude', 'Longitude'
      ],
      coordinateFields: ['Latitude', 'Longitude'],
      dateFields: ['Incident Date'],
      timeFields: ['Incident Time'],
      optionalFields: ['Address', 'City', 'Priority', 'Response Time (min)']
    }
  };

  /**
   * Detect the CAD system from data field names
   * @param {Object} sampleRecord - A sample record from the data
   * @returns {string|null} Detected CAD system name or null if not detected
   */
  function detectCADSystem(sampleRecord) {
    if (!sampleRecord) return null;
    
    const fields = Object.keys(sampleRecord);
    
    // Detect Motorola PremierOne CAD
    if (fields.some(f => f.includes('INCIDENT_NO')) || 
        fields.some(f => f.includes('CALL_RECEIVED'))) {
      return 'Motorola PremierOne';
    }
    
    // Detect Tyler New World CAD
    if (fields.some(f => f.includes('CAD_CALL_ID')) || 
        fields.some(f => f.includes('NATURE_CODE'))) {
      return 'Tyler New World';
    }
    
    // Detect Hexagon/Intergraph CAD
    if (fields.some(f => f.includes('EVENT_NUMBER')) || 
        fields.some(f => f.includes('EVENT_OPEN_DATETIME'))) {
      return 'Hexagon/Intergraph';
    }
    
    // Detect Central Square CAD
    if (fields.some(f => f.includes('CAD_INCIDENT_ID')) || 
        fields.some(f => f.includes('REPORTED_DT')) ||
        fields.includes('GEOX') || fields.includes('GEOY')) {
      return 'Central Square';
    }
    
    // Detect ImageTrend
    if (fields.some(f => f.includes('IncidentPK')) || 
        (fields.includes('IncidentDate') && fields.includes('IncidentTime'))) {
      return 'ImageTrend';
    }
    
    return null;
  }

  /**
   * Apply CAD system field mappings
   * @param {Array} data - Array of data records
   * @param {string} cadSystem - CAD system name
   * @returns {Array} Transformed data with standard field names
   */
  function applyCADSystemMappings(data, cadSystem) {
    if (!data || !data.length || !cadSystem || !CAD_SYSTEM_MAPPINGS[cadSystem]) {
      return data;
    }
    
    const fieldMappings = CAD_SYSTEM_MAPPINGS[cadSystem];
    
    return data.map(item => {
      const result = { ...item };
      
      // Apply field mappings
      Object.entries(fieldMappings).forEach(([targetField, sourceField]) => {
        // Skip if target field already exists
        if (result[targetField] !== undefined && result[targetField] !== '') {
          return;
        }
        
        // If mapping is a function, call it with the item
        if (typeof sourceField === 'function') {
          result[targetField] = sourceField(item);
        } 
        // If mapping is a field name and that field exists in the item
        else if (typeof sourceField === 'string' && item[sourceField] !== undefined && item[sourceField] !== '') {
          result[targetField] = item[sourceField];
        }
      });
      
      return result;
    });
  }

  /**
   * Parse CSV data to an array of objects
   * @param {string} csvText - CSV text content
   * @param {Object} options - Parsing options
   * @returns {Array} Array of parsed data objects
   */
  function parseCSV(csvText, options = {}) {
    try {
      const lines = csvText.split(/\r\n|\n/);
      if (lines.length === 0) {
        return [];
      }
      
      // Parse headers
      let headers;
      try {
        headers = parseCSVRow(lines[0]);
      } catch (error) {
        // Fallback to simple splitting
        headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      }
      
      const result = [];
      
      // Parse each data row
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        let values;
        try {
          values = parseCSVRow(lines[i]);
        } catch (error) {
          // Fallback to simple splitting
          values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        }
        
        // Create record object
        const row = {};
        headers.forEach((header, index) => {
          if (header) { // Skip empty headers
            row[header] = values[index] !== undefined ? values[index] : '';
          }
        });
        
        // Only add non-empty rows
        if (Object.values(row).some(val => val !== '')) {
          result.push(row);
        }
      }
      
      return result;
    } catch (error) {
      console.error('CSV parsing error:', error);
      return [];
    }
  }

  /**
   * Parse a CSV row, handling quoted fields correctly
   * @param {string} line - CSV line to parse
   * @returns {Array} Array of field values
   */
  function parseCSVRow(line) {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && i < line.length - 1 && line[i + 1] === '"') {
          // Double quotes inside quotes - add a single quote and skip the next one
          currentValue += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field, add to result
        result.push(currentValue.trim());
        currentValue = '';
      } else {
        // Add character to current field
        currentValue += char;
      }
    }
    
    // Add the last field
    result.push(currentValue.trim());
    
    return result;
  }

  /**
   * Parse JSON data safely
   * @param {string} jsonText - JSON text to parse
   * @returns {Array|Object} Parsed JSON data
   */
  function parseJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      
      // If it's not an array, wrap it in an array
      if (!Array.isArray(parsed)) {
        if (typeof parsed === 'object' && parsed !== null) {
          // If it has a data property that's an array, use that
          if (Array.isArray(parsed.data)) {
            return parsed.data;
          }
          // If it has a results property that's an array, use that
          if (Array.isArray(parsed.results)) {
            return parsed.results;
          }
          // Otherwise return the object in an array
          return [parsed];
        }
        return [];
      }
      
      return parsed;
    } catch (error) {
      console.error('JSON parsing error:', error);
      return [];
    }
  }

  /**
   * Find the most appropriate field in a record that matches a target field
   * @param {Object} record - Data record to search
   * @param {string} targetField - Target field name
   * @returns {string|null} Matching field name or null if not found
   */
  function findMatchingField(record, targetField) {
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
   * Map fields across data records
   * @param {Array} data - Array of data records
   * @param {Object} fieldMap - Mapping of target field names to source field names
   * @returns {Array} Transformed data with mapped fields
   */
  function mapFields(data, fieldMap) {
    // Use the MapFieldsManager if available
    if (window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.MapFieldsManager) {
      return window.FireEMS.Utils.MapFieldsManager.applyMappings(data, fieldMap);
    }
    
    // Fall back to original implementation
    if (!data || !data.length || !fieldMap) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Apply field mappings
      Object.entries(fieldMap).forEach(([targetField, sourceField]) => {
        // Skip if target field already exists and is not empty
        if (result[targetField] !== undefined && result[targetField] !== '') {
          return;
        }
        
        // If mapping is a function, call it with the item
        if (typeof sourceField === 'function') {
          result[targetField] = sourceField(item);
        } 
        // If mapping is a field name and that field exists in the item
        else if (typeof sourceField === 'string' && item[sourceField] !== undefined && item[sourceField] !== '') {
          result[targetField] = item[sourceField];
        }
        // If mapping is an array, try each field in order
        else if (Array.isArray(sourceField)) {
          for (const field of sourceField) {
            if (item[field] !== undefined && item[field] !== '') {
              result[targetField] = item[field];
              break;
            }
          }
        }
      });
      
      return result;
    });
  }

  /**
   * Standardize coordinate fields to numeric format
   * @param {Array} data - Array of data records
   * @param {string} latField - Latitude field name
   * @param {string} lngField - Longitude field name
   * @returns {Array} Data with standardized coordinates
   */
  function standardizeCoordinates(data, latField = 'Latitude', lngField = 'Longitude') {
    if (!data || !data.length) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Process latitude
      if (result[latField] !== undefined) {
        const lat = parseFloat(result[latField]);
        if (!isNaN(lat)) {
          result[latField] = lat;
        }
      }
      
      // Process longitude
      if (result[lngField] !== undefined) {
        const lng = parseFloat(result[lngField]);
        if (!isNaN(lng)) {
          result[lngField] = lng;
        }
      }
      
      // Try to find coordinates from other fields if they don't exist
      if (result[latField] === undefined || result[lngField] === undefined) {
        // Find alternative field names
        const latField = findMatchingField(result, 'Latitude');
        const lngField = findMatchingField(result, 'Longitude');
        
        if (latField && result[latField] !== undefined) {
          const lat = parseFloat(result[latField]);
          if (!isNaN(lat)) {
            result['Latitude'] = lat;
          }
        }
        
        if (lngField && result[lngField] !== undefined) {
          const lng = parseFloat(result[lngField]);
          if (!isNaN(lng)) {
            result['Longitude'] = lng;
          }
        }
      }
      
      return result;
    });
  }

  /**
   * Standardize date fields to a consistent format
   * @param {Array} data - Array of data records
   * @param {Array} dateFields - Array of date field names
   * @param {string} targetFormat - Target date format (default: ISO)
   * @returns {Array} Data with standardized dates
   */
  function standardizeDates(data, dateFields = ['Incident Date'], targetFormat = DATE_FORMATS.ISO) {
    if (!data || !data.length || !dateFields || !dateFields.length) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Process each date field
      dateFields.forEach(field => {
        if (result[field] !== undefined && result[field] !== '') {
          try {
            // Try to parse the date
            const parsedDate = parseDate(result[field]);
            if (parsedDate) {
              // Format the date
              result[field] = formatDate(parsedDate, targetFormat);
            }
          } catch (error) {
            // Keep original value if parsing fails
          }
        }
      });
      
      return result;
    });
  }

  /**
   * Standardize time fields to a consistent format
   * @param {Array} data - Array of data records
   * @param {Array} timeFields - Array of time field names
   * @param {string} format - Target time format (HH:MM:SS or HH:MM)
   * @returns {Array} Data with standardized times
   */
  function standardizeTimes(data, timeFields = ['Incident Time', 'Dispatch Time', 'En Route Time', 'On Scene Time'], format = 'HH:MM:SS') {
    if (!data || !data.length || !timeFields || !timeFields.length) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Process each time field
      timeFields.forEach(field => {
        if (result[field] !== undefined && result[field] !== '') {
          try {
            // Try to parse the time
            const parsedTime = parseTime(result[field]);
            if (parsedTime) {
              // Format the time
              result[field] = formatTime(parsedTime, format);
            }
          } catch (error) {
            // Keep original value if parsing fails
          }
        }
      });
      
      return result;
    });
  }

  /**
   * Try to parse a date string in various formats
   * @param {string} dateStr - Date string to parse
   * @returns {Date|null} Parsed date or null if parsing fails
   */
  function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Try to parse as a standard date format
    const date = new Date(dateStr);
    if (!isNaN(date)) {
      return date;
    }
    
    // Try common US format (MM/DD/YYYY)
    const usParts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usParts) {
      return new Date(parseInt(usParts[3]), parseInt(usParts[1]) - 1, parseInt(usParts[2]));
    }
    
    // Try common EU format (DD/MM/YYYY)
    const euParts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (euParts) {
      return new Date(parseInt(euParts[3]), parseInt(euParts[2]) - 1, parseInt(euParts[1]));
    }
    
    // Try other common formats
    const formats = [
      // YYYY-MM-DD
      { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, parts: [1, 2, 3] },
      // MM-DD-YYYY
      { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, parts: [3, 1, 2] },
      // DD-MM-YYYY
      { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, parts: [3, 2, 1] },
      // MM.DD.YYYY
      { regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, parts: [3, 1, 2] },
      // DD.MM.YYYY
      { regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, parts: [3, 2, 1] }
    ];
    
    for (const format of formats) {
      const parts = dateStr.match(format.regex);
      if (parts) {
        return new Date(
          parseInt(parts[format.parts[0]]),
          parseInt(parts[format.parts[1]]) - 1,
          parseInt(parts[format.parts[2]])
        );
      }
    }
    
    return null;
  }

  /**
   * Format a date object to a string
   * @param {Date} date - Date object to format
   * @param {string} format - Target format pattern
   * @returns {string} Formatted date string
   */
  function formatDate(date, format = DATE_FORMATS.ISO) {
    if (!date || isNaN(date)) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    switch (format) {
      case DATE_FORMATS.ISO:
        return `${year}-${month}-${day}`;
      case DATE_FORMATS.US:
        return `${month}/${day}/${year}`;
      case DATE_FORMATS.EU:
        return `${day}/${month}/${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }

  /**
   * Parse a time string in various formats
   * @param {string} timeStr - Time string to parse
   * @returns {Object|null} Parsed time object or null if parsing fails
   */
  function parseTime(timeStr) {
    if (!timeStr) return null;
    
    // Simple HH:MM:SS format
    const hmsPattern = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
    const hmsParts = timeStr.match(hmsPattern);
    if (hmsParts) {
      return {
        hours: parseInt(hmsParts[1]),
        minutes: parseInt(hmsParts[2]),
        seconds: hmsParts[3] ? parseInt(hmsParts[3]) : 0
      };
    }
    
    // Try from date object if time includes date
    try {
      const date = new Date(timeStr);
      if (!isNaN(date)) {
        return {
          hours: date.getHours(),
          minutes: date.getMinutes(),
          seconds: date.getSeconds()
        };
      }
    } catch (e) {
      // Continue with other formats
    }
    
    // Military time format (HHMM)
    const militaryPattern = /^(\d{2})(\d{2})$/;
    const militaryParts = timeStr.match(militaryPattern);
    if (militaryParts) {
      return {
        hours: parseInt(militaryParts[1]),
        minutes: parseInt(militaryParts[2]),
        seconds: 0
      };
    }
    
    return null;
  }

  /**
   * Format a time object to a string
   * @param {Object} timeObj - Time object with hours, minutes, seconds
   * @param {string} format - Target format (HH:MM:SS or HH:MM)
   * @returns {string} Formatted time string
   */
  function formatTime(timeObj, format = 'HH:MM:SS') {
    if (!timeObj) return '';
    
    const hours = timeObj.hours.toString().padStart(2, '0');
    const minutes = timeObj.minutes.toString().padStart(2, '0');
    const seconds = timeObj.seconds.toString().padStart(2, '0');
    
    if (format === 'HH:MM') {
      return `${hours}:${minutes}`;
    }
    
    return `${hours}:${minutes}:${seconds}`;
  }

  /**
   * Combine date and time fields into a single datetime field
   * @param {Array} data - Array of data records
   * @param {string} dateField - Date field name
   * @param {string} timeField - Time field name
   * @param {string} targetField - Target datetime field name
   * @returns {Array} Data with combined datetime fields
   */
  function combineDateAndTime(data, dateField = 'Incident Date', timeField = 'Incident Time', targetField = 'Incident DateTime') {
    if (!data || !data.length) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Skip if either date or time is missing
      if (!result[dateField] || !result[timeField]) {
        return result;
      }
      
      try {
        const date = parseDate(result[dateField]);
        const time = parseTime(result[timeField]);
        
        if (date && time) {
          // Create a new date with the combined date and time
          const combinedDate = new Date(date);
          combinedDate.setHours(time.hours, time.minutes, time.seconds);
          
          // Add the combined datetime to the result
          result[targetField] = combinedDate.toISOString();
        }
      } catch (error) {
        console.warn(`Error combining date and time for record:`, error);
      }
      
      return result;
    });
  }

  /**
   * Extract date and time components from a datetime field
   * @param {Array} data - Array of data records
   * @param {string} datetimeField - Datetime field name
   * @param {string} dateField - Target date field name
   * @param {string} timeField - Target time field name
   * @returns {Array} Data with extracted date and time fields
   */
  function extractDateAndTime(data, datetimeField, dateField = 'Incident Date', timeField = 'Incident Time') {
    if (!data || !data.length || !datetimeField) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Skip if datetime field is missing
      if (!result[datetimeField]) {
        return result;
      }
      
      try {
        const datetime = new Date(result[datetimeField]);
        
        if (!isNaN(datetime)) {
          // Extract date
          if (!result[dateField]) {
            result[dateField] = formatDate(datetime, DATE_FORMATS.ISO);
          }
          
          // Extract time
          if (!result[timeField]) {
            result[timeField] = formatTime({
              hours: datetime.getHours(),
              minutes: datetime.getMinutes(),
              seconds: datetime.getSeconds()
            });
          }
        }
      } catch (error) {
        console.warn(`Error extracting date and time from ${datetimeField}:`, error);
      }
      
      return result;
    });
  }

  /**
   * Calculate the time difference between two time fields
   * @param {Array} data - Array of data records
   * @param {string} startField - Start time field name
   * @param {string} endField - End time field name
   * @param {string} targetField - Target field for the calculated difference
   * @param {string} unit - Unit for the result (seconds, minutes, hours)
   * @returns {Array} Data with calculated time differences
   */
  function calculateTimeDifference(data, startField, endField, targetField, unit = 'minutes') {
    if (!data || !data.length || !startField || !endField || !targetField) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Skip if start or end field is missing
      if (!result[startField] || !result[endField]) {
        return result;
      }
      
      try {
        // Parse dates including the date part if available
        let startDate, endDate;
        
        if (result['Incident Date']) {
          // If we have a date field, combine it with the time
          const dateStr = result['Incident Date'];
          startDate = new Date(`${dateStr}T${result[startField]}`);
          endDate = new Date(`${dateStr}T${result[endField]}`);
        } else {
          // Otherwise use the current date
          const today = new Date().toISOString().split('T')[0];
          startDate = new Date(`${today}T${result[startField]}`);
          endDate = new Date(`${today}T${result[endField]}`);
          
          // Handle overnight cases
          if (endDate < startDate) {
            endDate.setDate(endDate.getDate() + 1);
          }
        }
        
        if (!isNaN(startDate) && !isNaN(endDate)) {
          // Calculate the difference in milliseconds
          const diffMs = endDate - startDate;
          
          // Convert to the requested unit
          let diff;
          switch (unit) {
            case 'seconds':
              diff = diffMs / 1000;
              break;
            case 'minutes':
              diff = diffMs / (1000 * 60);
              break;
            case 'hours':
              diff = diffMs / (1000 * 60 * 60);
              break;
            default:
              diff = diffMs / (1000 * 60); // Default to minutes
          }
          
          // Add the calculated difference to the result
          result[targetField] = Math.round(diff * 100) / 100; // Round to 2 decimal places
        }
      } catch (error) {
        console.warn(`Error calculating time difference:`, error);
      }
      
      return result;
    });
  }

  /**
   * Clean and standardize address fields
   * @param {Array} data - Array of data records
   * @param {string} addressField - Address field name
   * @param {string} cityField - City field name
   * @param {string} stateField - State field name
   * @param {string} zipField - ZIP code field name
   * @param {string} targetField - Target field for the combined address
   * @returns {Array} Data with standardized addresses
   */
  function standardizeAddresses(data, addressField = 'Address', cityField = 'City', stateField = 'State', zipField = 'ZIP', targetField = 'Full Address') {
    if (!data || !data.length) {
      return data;
    }
    
    return data.map(item => {
      const result = { ...item };
      
      // Skip if address field is missing
      if (!result[addressField]) {
        return result;
      }
      
      // Clean up the address
      if (result[addressField]) {
        result[addressField] = cleanAddressString(result[addressField]);
      }
      
      // Create a full address if not already present
      if (!result[targetField]) {
        const addressParts = [];
        
        if (result[addressField]) addressParts.push(result[addressField]);
        if (result[cityField]) addressParts.push(result[cityField]);
        if (result[stateField]) {
          addressParts.push(result[stateField] + 
            (result[zipField] ? ' ' + result[zipField] : ''));
        } else if (result[zipField]) {
          addressParts.push(result[zipField]);
        }
        
        if (addressParts.length > 0) {
          result[targetField] = addressParts.join(', ');
        }
      }
      
      return result;
    });
  }

  /**
   * Clean up an address string
   * @param {string} address - Address string to clean
   * @returns {string} Cleaned address string
   */
  function cleanAddressString(address) {
    if (!address) return '';
    
    // Trim whitespace
    let cleaned = address.trim();
    
    // Remove special characters
    cleaned = cleaned.replace(/[^\w\s,.'#-]/g, '');
    
    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Normalize common abbreviations
    const abbreviations = {
      'STREET': 'ST',
      'AVENUE': 'AVE',
      'BOULEVARD': 'BLVD',
      'DRIVE': 'DR',
      'ROAD': 'RD',
      'LANE': 'LN',
      'COURT': 'CT',
      'CIRCLE': 'CIR',
      'HIGHWAY': 'HWY',
      'PARKWAY': 'PKWY'
    };
    
    Object.entries(abbreviations).forEach(([full, abbr]) => {
      const regex = new RegExp(`\\b${full}\\b`, 'gi');
      cleaned = cleaned.replace(regex, abbr);
    });
    
    return cleaned;
  }

  /**
   * Transform data for a specific tool
   * @param {Array} data - Array of data records
   * @param {string} toolId - Tool ID
   * @returns {Array} Transformed data for the specified tool
   */
  function transformForTool(data, toolId) {
    if (!data || !data.length || !toolId || !TOOL_REQUIREMENTS[toolId]) {
      return data;
    }
    
    const requirements = TOOL_REQUIREMENTS[toolId];
    
    let transformedData = [...data];
    
    // Detect and apply CAD system mappings
    const cadSystem = detectCADSystem(transformedData[0]);
    if (cadSystem) {
      console.log(`Detected ${cadSystem} format, applying mappings`);
      transformedData = applyCADSystemMappings(transformedData, cadSystem);
    }
    
    // Apply field mappings based on field aliases for any missing required fields
    const missingFields = {};
    requirements.requiredFields.forEach(field => {
      // Skip fields that already exist in transformed data
      if (transformedData[0][field] !== undefined) {
        return;
      }
      
      // Find matching field using aliases
      const matchingField = findMatchingField(transformedData[0], field);
      if (matchingField) {
        missingFields[field] = matchingField;
      }
    });
    
    if (Object.keys(missingFields).length > 0) {
      transformedData = mapFields(transformedData, missingFields);
    }
    
    // Standardize coordinates if required
    if (requirements.coordinateFields && requirements.coordinateFields.length > 0) {
      transformedData = standardizeCoordinates(transformedData);
    }
    
    // Standardize dates if required
    if (requirements.dateFields && requirements.dateFields.length > 0) {
      transformedData = standardizeDates(transformedData, requirements.dateFields);
    }
    
    // Standardize times if required
    if (requirements.timeFields && requirements.timeFields.length > 0) {
      transformedData = standardizeTimes(transformedData, requirements.timeFields);
    }
    
    // Apply tool-specific transformations
    switch (toolId) {
      case 'response-time':
        // Calculate response times
        if (transformedData[0]['Dispatch Time'] && transformedData[0]['On Scene Time']) {
          transformedData = calculateTimeDifference(
            transformedData, 
            'Dispatch Time', 
            'On Scene Time', 
            'Response Time (min)',
            'minutes'
          );
        }
        break;
        
      case 'call-density':
        // Ensure datetime field exists for mapping
        if (transformedData[0]['Incident Date'] && transformedData[0]['Incident Time']) {
          transformedData = combineDateAndTime(
            transformedData,
            'Incident Date',
            'Incident Time',
            'Incident DateTime'
          );
        }
        break;
        
      case 'incident-logger':
        // Standardize addresses
        transformedData = standardizeAddresses(transformedData);
        break;
    }
    
    return transformedData;
  }

  /**
   * Generate test data for a specific tool
   * @param {string} toolId - Tool ID
   * @param {number} count - Number of records to generate
   * @returns {Array} Generated test data
   */
  function generateTestData(toolId, count = 10) {
    if (!toolId || !TOOL_REQUIREMENTS[toolId]) {
      return [];
    }
    
    const requirements = TOOL_REQUIREMENTS[toolId];
    const data = [];
    
    // Generate data based on the tool's requirements
    switch (toolId) {
      case 'response-time':
      case 'call-density':
        for (let i = 0; i < count; i++) {
          const incidentDate = new Date();
          incidentDate.setDate(incidentDate.getDate() - Math.floor(Math.random() * 30));
          
          const dispatchTime = new Date(incidentDate);
          dispatchTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
          
          const enRouteTime = new Date(dispatchTime);
          enRouteTime.setMinutes(enRouteTime.getMinutes() + Math.floor(Math.random() * 3) + 1);
          
          const onSceneTime = new Date(enRouteTime);
          onSceneTime.setMinutes(onSceneTime.getMinutes() + Math.floor(Math.random() * 10) + 5);
          
          // Base latitude and longitude (approximately center of US)
          const baseLat = 39.8333;
          const baseLng = -98.5855;
          
          data.push({
            'Incident ID': `TEST-${i+1000}`,
            'Incident Date': formatDate(incidentDate),
            'Incident Time': formatTime({
              hours: dispatchTime.getHours(),
              minutes: dispatchTime.getMinutes(),
              seconds: dispatchTime.getSeconds()
            }),
            'Dispatch Time': formatTime({
              hours: dispatchTime.getHours(),
              minutes: dispatchTime.getMinutes(),
              seconds: dispatchTime.getSeconds()
            }),
            'En Route Time': formatTime({
              hours: enRouteTime.getHours(),
              minutes: enRouteTime.getMinutes(),
              seconds: enRouteTime.getSeconds()
            }),
            'On Scene Time': formatTime({
              hours: onSceneTime.getHours(),
              minutes: onSceneTime.getMinutes(),
              seconds: onSceneTime.getSeconds()
            }),
            'Incident Type': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT', 'OTHER'][i % 5],
            'Priority': `${i % 5 + 1}`,
            'Address': `${1000 + i} Main St`,
            'City': 'Anytown',
            'State': 'US',
            'Latitude': (baseLat + (Math.random() * 4 - 2)).toFixed(6),
            'Longitude': (baseLng + (Math.random() * 8 - 4)).toFixed(6),
            'Unit ID': `E${Math.floor(Math.random() * 20) + 1}`
          });
        }
        break;
        
      case 'isochrone-stations':
      case 'isochrone':
        for (let i = 0; i < count; i++) {
          // Base latitude and longitude (approximately center of US)
          const baseLat = 39.8333;
          const baseLng = -98.5855;
          
          data.push({
            'Station ID': `S${i+1}`,
            'Station Name': `Station ${i+1}`,
            'Station Address': `${1000 + i} Main St, Anytown, US`,
            'Latitude': (baseLat + (Math.random() * 4 - 2)).toFixed(6),
            'Longitude': (baseLng + (Math.random() * 8 - 4)).toFixed(6),
            'Unit Types': ['Engine', 'Ladder', 'Ambulance'][i % 3]
          });
        }
        break;
        
      case 'isochrone-incidents':
        for (let i = 0; i < count; i++) {
          const incidentDate = new Date();
          incidentDate.setDate(incidentDate.getDate() - Math.floor(Math.random() * 30));
          
          // Base latitude and longitude (approximately center of US)
          const baseLat = 39.8333;
          const baseLng = -98.5855;
          
          data.push({
            'Incident ID': `TEST-${i+1000}`,
            'Incident Date': formatDate(incidentDate),
            'Incident Time': formatTime({
              hours: Math.floor(Math.random() * 24),
              minutes: Math.floor(Math.random() * 60),
              seconds: Math.floor(Math.random() * 60)
            }),
            'Incident Type': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT', 'OTHER'][i % 5],
            'Latitude': (baseLat + (Math.random() * 4 - 2)).toFixed(6),
            'Longitude': (baseLng + (Math.random() * 8 - 4)).toFixed(6),
            'Address': `${1000 + i} Main St, Anytown, US`
          });
        }
        break;
    }
    
    return data;
  }

  /**
   * Create a field mapping based on a source and target schema
   * @param {Object} sourceSchema - The source data schema
   * @param {Object} targetSchema - The target schema to map to
   * @returns {Object} Mapping of target fields to source fields
   */
  function createFieldMapping(sourceSchema, targetSchema) {
    const mapping = {};
    
    // For each field in the target schema
    Object.keys(targetSchema).forEach(targetField => {
      // Check if field exists in source schema
      if (sourceSchema[targetField] !== undefined) {
        mapping[targetField] = targetField;
        return;
      }
      
      // Try to find a matching field using aliases
      const aliases = FIELD_ALIASES[targetField] || [];
      for (const alias of aliases) {
        if (sourceSchema[alias] !== undefined) {
          mapping[targetField] = alias;
          return;
        }
      }
    });
    
    return mapping;
  }

  /**
   * Convert data to CSV format
   * @param {Array} data - Array of data objects
   * @returns {string} CSV string
   */
  function toCSV(data) {
    if (!data || !data.length) {
      return '';
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create header row
    let csv = headers.join(',') + '\r\n';
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        
        // Handle different value types
        if (value === undefined || value === null) {
          return '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if needed
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        } else {
          return String(value);
        }
      });
      
      csv += row.join(',') + '\r\n';
    });
    
    return csv;
  }

  /**
   * Convert data to JSON format
   * @param {Array} data - Array of data objects
   * @param {boolean} pretty - Whether to pretty-print the JSON
   * @returns {string} JSON string
   */
  function toJSON(data, pretty = false) {
    if (!data) {
      return '';
    }
    
    return pretty ? 
      JSON.stringify(data, null, 2) : 
      JSON.stringify(data);
  }

  // Public API
  return {
    // Core transformation functions
    parseCSV,
    parseJSON,
    mapFields,
    standardizeCoordinates,
    standardizeDates,
    standardizeTimes,
    combineDateAndTime,
    extractDateAndTime,
    calculateTimeDifference,
    standardizeAddresses,
    
    // Tool-specific functions
    transformForTool,
    generateTestData,
    
    // CAD system detection
    detectCADSystem,
    applyCADSystemMappings,
    
    // Field mapping utilities
    createFieldMapping,
    findMatchingField,
    
    // Export utilities
    toCSV,
    toJSON,
    
    // Constants
    DATE_FORMATS,
    CAD_SYSTEM_MAPPINGS,
    FIELD_ALIASES,
    TOOL_REQUIREMENTS
  };
})();

// Some convenience aliases
FireEMS.Utils.transform = FireEMS.Utils.DataTransformer.transformForTool;
FireEMS.Utils.parseCSV = FireEMS.Utils.DataTransformer.parseCSV;
FireEMS.Utils.toCSV = FireEMS.Utils.DataTransformer.toCSV;