/**
 * FireEMS.ai DataStandardizer
 * 
 * A standardization layer for handling field name variations and data format conversion
 * across all Fire-EMS tools. This utility builds on the MapFieldsManager to provide
 * consistent field handling, intelligent data conversion, and resilient data access.
 * 
 * Key features:
 * - Standardizes field names across different tools and data sources
 * - Provides consistent date/time format handling with military time
 * - Enables intelligent data access with fallbacks for missing fields
 * - Automatically enriches data with derived fields when possible
 * - Integrates with the existing MapFieldsManager for full mapping capabilities
 * 
 * This utility is designed to be used as a foundation layer for all data-handling
 * components, providing a resilient approach to data inconsistencies.
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.Utils = window.FireEMS.Utils || {};

/**
 * DataStandardizer - Centralized data standardization utility
 */
FireEMS.Utils.DataStandardizer = (function() {
  // Import references to existing utilities if available
  const MapFieldsManager = window.FireEMS.Utils.MapFieldsManager;
  const DataTransformer = window.FireEMS.Utils.DataTransformer;

  // Field naming standards based on the MapFieldsManager's standards
  const FIELD_STANDARDS = MapFieldsManager ? 
    MapFieldsManager.STANDARD_FIELDS : 
    [
      // Fallback minimal field standards if MapFieldsManager is not available
      { name: 'Incident ID', type: 'text', category: 'incident' },
      { name: 'Incident Date', type: 'date', category: 'timestamp' },
      { name: 'Incident Time', type: 'time', category: 'timestamp' },
      { name: 'Unit ID', type: 'text', category: 'incident' },
      { name: 'Latitude', type: 'coordinate', category: 'location' },
      { name: 'Longitude', type: 'coordinate', category: 'location' },
      { name: 'Address', type: 'text', category: 'location' },
      { name: 'Incident Type', type: 'text', category: 'incident' },
      { name: 'Response Time', type: 'number', category: 'calculated' }
    ];

  // Extended field aliases beyond what MapFieldsManager provides
  const EXTENDED_FIELD_ALIASES = {
    'Incident ID': [
      'Incident ID', 'IncidentID', 'incident_id', 'incidentId', 'call_id', 'callId', 
      'Incident Number', 'incident_number', 'Call Number', 'call_number',
      'CAD ID', 'cad_id', 'CADID', 'Run Number', 'run_number', 'ID', 'id'
    ],
    'Incident Date': [
      'Incident Date', 'incident_date', 'Call Date', 'call_date', 'Date', 'date',
      'Alarm Date', 'alarm_date', 'Report Date', 'report_date', 'Reported Date', 'reported_date'
    ],
    'Incident Time': [
      'Incident Time', 'incident_time', 'Call Time', 'call_time', 'Time', 'time',
      'Alarm Time', 'alarm_time', 'Reported Time', 'reported_time', 'Reported', 'reported'
    ],
    'Unit ID': [
      'Unit ID', 'UnitID', 'unit_id', 'Unit', 'unit', 'Apparatus ID', 'apparatus_id',
      'Unit Number', 'unit_number', 'Resource ID', 'resource_id', 'Vehicle ID', 'vehicle_id',
      'Equipment ID', 'equipment_id', 'UnitName', 'unit_name'
    ],
    'Latitude': [
      'Latitude', 'latitude', 'Lat', 'lat', 'Y', 'y', 'Y_COORDINATE', 'y_coordinate'
    ],
    'Longitude': [
      'Longitude', 'longitude', 'Long', 'long', 'Lng', 'lng', 'X', 'x', 'X_COORDINATE', 'x_coordinate'
    ],
    'Address': [
      'Address', 'address', 'Location', 'location', 'Street Address', 'street_address',
      'Incident Location', 'incident_location', 'Incident Address', 'incident_address',
      'Scene Address', 'scene_address', 'Full Address', 'full_address'
    ],
    'City': [
      'City', 'city', 'Incident City', 'incident_city', 'City Name', 'city_name',
      'Municipality', 'municipality', 'Town', 'town', 'Location City', 'location_city'
    ],
    'State': [
      'State', 'state', 'Incident State', 'incident_state', 'State Name', 'state_name',
      'Province', 'province', 'Location State', 'location_state', 'ST', 'st'
    ],
    'Incident Type': [
      'Incident Type', 'incident_type', 'Call Type', 'call_type', 'Type', 'type',
      'Nature', 'nature', 'Call Nature', 'call_nature', 'Incident Nature', 'incident_nature',
      'Incident Category', 'incident_category', 'Category', 'category'
    ],
    'Dispatch Time': [
      'Dispatch Time', 'dispatch_time', 'Dispatched', 'dispatched', 'Dispatch', 'dispatch',
      'Unit Dispatched', 'unit_dispatched', 'Time Dispatched', 'time_dispatched'
    ],
    'En Route Time': [
      'En Route Time', 'en_route_time', 'Enroute', 'enroute', 'En Route', 'en_route',
      'Unit En Route', 'unit_en_route', 'Responding Time', 'responding_time', 'Responding', 'responding'
    ],
    'On Scene Time': [
      'On Scene Time', 'on_scene_time', 'Arrived', 'arrived', 'Arrival Time', 'arrival_time',
      'Arrival', 'arrival', 'Unit On Scene', 'unit_on_scene', 'On Scene', 'on_scene',
      'Onscene', 'onscene', 'Arrive Time', 'arrive_time', 'Unit Arrival', 'unit_arrival'
    ],
    'Response Time': [
      'Response Time', 'response_time', 'ResponseTime', 'responseTime', 'Resp Time', 'resp_time',
      'Total Response Time', 'total_response_time', 'Response', 'response', 'Response Minutes', 'response_minutes'
    ]
  };

  /**
   * Merge field aliases from MapFieldsManager with extended aliases
   */
  const FIELD_ALIASES = {};
  
  // If MapFieldsManager is available, use its aliases as a base
  if (MapFieldsManager && MapFieldsManager.FIELD_ALIASES) {
    Object.entries(MapFieldsManager.FIELD_ALIASES).forEach(([key, values]) => {
      FIELD_ALIASES[key] = [...values]; // Start with MapFieldsManager aliases
    });
  }
  
  // Add or extend with our extended aliases
  Object.entries(EXTENDED_FIELD_ALIASES).forEach(([key, values]) => {
    if (!FIELD_ALIASES[key]) {
      FIELD_ALIASES[key] = [...values]; // New field
    } else {
      // Merge without duplicates
      values.forEach(alias => {
        if (!FIELD_ALIASES[key].includes(alias)) {
          FIELD_ALIASES[key].push(alias);
        }
      });
    }
  });

  /**
   * Get a standard field name from a non-standard field name
   * @param {string} fieldName - The non-standard field name
   * @returns {string|null} - The standard field name or null if not found
   */
  function getStandardFieldName(fieldName) {
    if (!fieldName) return null;
    
    // Normalize the field name for comparison
    const normalizedName = fieldName.toLowerCase();
    
    // Check each standard field and its aliases
    for (const [standardName, aliases] of Object.entries(FIELD_ALIASES)) {
      // Try to match the normalized name against aliases
      if (aliases.some(alias => alias.toLowerCase() === normalizedName)) {
        return standardName;
      }
    }
    
    // No match found
    return null;
  }

  /**
   * Get all possible field names for a standard field
   * @param {string} standardField - The standard field name
   * @returns {Array<string>} - Array of all possible field names (standard + aliases)
   */
  function getAllFieldNames(standardField) {
    if (!standardField || !FIELD_ALIASES[standardField]) {
      return [standardField];
    }
    
    // Return standard name plus all aliases
    return [standardField, ...FIELD_ALIASES[standardField]];
  }

  /**
   * Get a value from an object using a standard field name with fallbacks
   * @param {Object} data - The data object
   * @param {string} standardField - The standard field name
   * @param {*} defaultValue - Default value if field not found
   * @returns {*} - The field value or default value if not found
   */
  function getValue(data, standardField, defaultValue = null) {
    if (!data || !standardField) return defaultValue;
    
    // 1. Try the standard field name directly
    if (data[standardField] !== undefined) {
      return data[standardField];
    }
    
    // 2. Try all aliases
    const allNames = getAllFieldNames(standardField);
    for (const name of allNames) {
      if (data[name] !== undefined) {
        return data[name];
      }
    }
    
    // 3. Return default value
    return defaultValue;
  }

  /**
   * Parse a date value with flexible format handling
   * @param {string|Date} dateValue - The date value to parse
   * @returns {Date|null} - Parsed Date object or null if invalid
   */
  function parseDate(dateValue) {
    if (!dateValue) return null;
    
    // If already a Date object, return it
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // If DataTransformer is available, use its parseDate function
    if (DataTransformer && typeof DataTransformer.parseDate === 'function') {
      const parsed = DataTransformer.parseDate(dateValue);
      if (parsed) return parsed;
    }
    
    // Try to parse as ISO string or common date formats
    try {
      // Try standard Date parsing first
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      // Try common date formats
      const formats = [
        // MM/DD/YYYY
        {
          regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
          parse: (m) => new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]))
        },
        // DD/MM/YYYY
        {
          regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
          parse: (m) => new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]))
        },
        // YYYY-MM-DD
        {
          regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
          parse: (m) => new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))
        },
        // MM-DD-YYYY
        {
          regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
          parse: (m) => new Date(parseInt(m[3]), parseInt(m[1]) - 1, parseInt(m[2]))
        }
      ];
      
      // Try each format
      for (const format of formats) {
        const match = dateValue.match(format.regex);
        if (match) {
          const parsedDate = format.parse(match);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    } catch (e) {
      console.warn('Error parsing date:', e);
    }
    
    return null;
  }

  /**
   * Parse a time value with flexible format handling
   * @param {string} timeValue - The time value to parse
   * @returns {Object|null} - Object with hours, minutes, seconds or null if invalid
   */
  function parseTime(timeValue) {
    if (!timeValue) return null;
    
    // If DataTransformer is available, use its parseTime function
    if (DataTransformer && typeof DataTransformer.parseTime === 'function') {
      const parsed = DataTransformer.parseTime(timeValue);
      if (parsed) return parsed;
    }
    
    try {
      // Handle different time formats
      let hours = 0, minutes = 0, seconds = 0;
      
      // Full datetime strings
      if (timeValue.includes(' ') || timeValue.includes('T')) {
        const date = new Date(timeValue);
        if (!isNaN(date.getTime())) {
          return {
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds()
          };
        }
      }
      
      // HH:MM:SS or HH:MM format
      if (typeof timeValue === 'string' && timeValue.includes(':')) {
        const parts = timeValue.split(':');
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        
        if (parts.length > 2) {
          // Handle seconds if present
          seconds = parseInt(parts[2].replace(/[^\d]/g, ''), 10);
        }
        
        // Check for AM/PM
        const isPM = timeValue.toLowerCase().includes('pm');
        const isAM = timeValue.toLowerCase().includes('am');
        
        // Convert to 24-hour time
        if (isPM && hours < 12) {
          hours += 12;
        } else if (isAM && hours === 12) {
          hours = 0;
        }
        
        return { hours, minutes, seconds };
      }
      
      // Military time format (HHMM)
      if (typeof timeValue === 'string' && /^\d{3,4}$/.test(timeValue)) {
        const strValue = timeValue.padStart(4, '0');
        hours = parseInt(strValue.substring(0, 2), 10);
        minutes = parseInt(strValue.substring(2, 4), 10);
        
        return { hours, minutes, seconds: 0 };
      }
    } catch (e) {
      console.warn('Error parsing time:', e);
    }
    
    return null;
  }

  /**
   * Format a date object as a standard date string
   * @param {Date} date - The date to format
   * @param {string} format - The output format ('ISO8601', 'MM/DD/YYYY', etc.)
   * @returns {string|null} - Formatted date string or null if invalid
   */
  function formatDate(date, format = 'ISO8601') {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return null;
    }
    
    // If DataTransformer is available, use its formatDate function
    if (DataTransformer && typeof DataTransformer.formatDate === 'function') {
      return DataTransformer.formatDate(date, format);
    }
    
    try {
      switch (format) {
        case 'ISO8601':
          return date.toISOString().split('T')[0]; // YYYY-MM-DD
        case 'MM/DD/YYYY':
          return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
        case 'DD/MM/YYYY':
          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        default:
          return date.toISOString().split('T')[0]; // Default to ISO
      }
    } catch (e) {
      console.warn('Error formatting date:', e);
      return null;
    }
  }

  /**
   * Format a time object or value as a standard time string
   * @param {Object|string} time - Time object (hours, minutes, seconds) or string to format
   * @param {string} format - The output format ('HH:MM:SS', 'HH:MM', etc.)
   * @returns {string|null} - Formatted time string or null if invalid
   */
  function formatTime(time, format = 'HH:MM:SS') {
    if (!time) return null;
    
    let hours, minutes, seconds;
    
    // Parse the time if it's a string
    if (typeof time === 'string') {
      const parsed = parseTime(time);
      if (!parsed) return null;
      
      hours = parsed.hours;
      minutes = parsed.minutes;
      seconds = parsed.seconds;
    } 
    // Use time object directly
    else if (typeof time === 'object') {
      hours = time.hours || 0;
      minutes = time.minutes || 0;
      seconds = time.seconds || 0;
    }
    // Invalid input
    else {
      return null;
    }
    
    try {
      // Apply the requested format
      switch (format) {
        case 'HH:MM:SS': // 24-hour with seconds
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        case 'HH:MM': // 24-hour without seconds
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        case 'hh:MM:SS A': // 12-hour with seconds and AM/PM
          {
            const period = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
          }
        case 'hh:MM A': // 12-hour without seconds and with AM/PM
          {
            const period = hours >= 12 ? 'PM' : 'AM';
            const h12 = hours % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
          }
        default:
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    } catch (e) {
      console.warn('Error formatting time:', e);
      return null;
    }
  }

  /**
   * Get a date and time value from a data object, handling separate or combined fields
   * @param {Object} data - The data object
   * @param {string} dateField - The standard date field name
   * @param {string} timeField - The standard time field name
   * @returns {Date|null} - Combined date and time or null if invalid
   */
  function getDateTime(data, dateField = 'Incident Date', timeField = 'Incident Time') {
    if (!data) return null;
    
    // Try to get date and time values
    const dateValue = getValue(data, dateField);
    const timeValue = getValue(data, timeField);
    
    // If we have both, combine them
    if (dateValue && timeValue) {
      // Parse date
      const datePart = parseDate(dateValue);
      if (!datePart) return null;
      
      // Parse time
      const timePart = parseTime(timeValue);
      if (!timePart) return datePart; // Return just the date if time is invalid
      
      // Combine date and time
      const combined = new Date(datePart);
      combined.setHours(timePart.hours, timePart.minutes, timePart.seconds);
      
      return combined;
    }
    
    // If we only have a date, try to parse it
    if (dateValue) {
      return parseDate(dateValue);
    }
    
    // Try to find a combined datetime field
    const datetimeFields = [
      'Incident DateTime', 'incident_datetime', 'DateTime', 'datetime',
      'timestamp', 'Timestamp', 'event_time', 'EventTime'
    ];
    
    for (const field of datetimeFields) {
      const value = data[field];
      if (value) {
        const parsed = parseDate(value);
        if (parsed) return parsed;
      }
    }
    
    return null;
  }

  /**
   * Calculate the response time in minutes between two time points
   * @param {Object} data - The data object
   * @param {string} startField - Standard field name for start time (e.g., 'Dispatch Time')
   * @param {string} endField - Standard field name for end time (e.g., 'On Scene Time')
   * @returns {number|null} - Response time in minutes or null if invalid
   */
  function calculateResponseTime(data, startField = 'Dispatch Time', endField = 'On Scene Time') {
    if (!data) return null;
    
    // First, check if the response time is already calculated
    const existingTime = getValue(data, 'Response Time');
    if (existingTime !== null) {
      const parsed = parseFloat(existingTime);
      if (!isNaN(parsed)) return parsed;
    }
    
    // Try to get timestamps for both fields
    const startDateTime = getDateTime(data, 'Incident Date', startField);
    const endDateTime = getDateTime(data, 'Incident Date', endField);
    
    // If we have both timestamps, calculate the difference
    if (startDateTime && endDateTime) {
      // Convert to minutes
      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      
      // Ensure it's not negative and return with 1 decimal place
      return Math.max(0, parseFloat(diffMinutes.toFixed(1)));
    }
    
    // Check if we have separate time fields
    const startTime = getValue(data, startField);
    const endTime = getValue(data, endField);
    
    if (startTime && endTime) {
      // Parse the times
      const startParsed = parseTime(startTime);
      const endParsed = parseTime(endTime);
      
      if (startParsed && endParsed) {
        // Convert to minutes since midnight
        const startMinutes = startParsed.hours * 60 + startParsed.minutes;
        const endMinutes = endParsed.hours * 60 + endParsed.minutes;
        
        // Calculate difference, handling crossing midnight
        let diffMinutes = endMinutes - startMinutes;
        if (diffMinutes < 0) {
          diffMinutes += 24 * 60; // Add a day's worth of minutes
        }
        
        return parseFloat(diffMinutes.toFixed(1));
      }
    }
    
    return null;
  }

  /**
   * Extract location coordinates from a data object, handling different field names
   * @param {Object} data - The data object
   * @returns {Object|null} - Object with lat and lng or null if invalid
   */
  function getCoordinates(data) {
    if (!data) return null;
    
    // Try to get latitude and longitude
    const lat = getValue(data, 'Latitude');
    const lng = getValue(data, 'Longitude');
    
    // If we have both, parse them
    if (lat !== null && lng !== null) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        // Validate reasonable coordinate values
        if (parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
          return { lat: parsedLat, lng: parsedLng };
        }
      }
    }
    
    // Try to extract from a combined field
    const combinedCoordFields = [
      'Coordinates', 'coordinates', 'Location', 'location',
      'LatLng', 'latlng', 'Position', 'position'
    ];
    
    for (const field of combinedCoordFields) {
      const value = data[field];
      if (typeof value === 'string') {
        // Try to parse as "lat,lng" format
        const parts = value.split(',');
        if (parts.length === 2) {
          const parsedLat = parseFloat(parts[0].trim());
          const parsedLng = parseFloat(parts[1].trim());
          
          if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            if (parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
              return { lat: parsedLat, lng: parsedLng };
            }
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Standardize a data record or array of records with consistent field names
   * @param {Object|Array} data - The data record or array of records
   * @param {boolean} applyDerivations - Whether to apply data derivations (calculated fields)
   * @returns {Object|Array} - Standardized data with consistent field names
   */
  function standardize(data, applyDerivations = true) {
    // Handle empty data
    if (!data) return data;
    
    // Function to standardize a single record
    const standardizeRecord = (record) => {
      if (!record || typeof record !== 'object') return record;
      
      const result = {};
      
      // 1. Copy all original fields
      Object.entries(record).forEach(([key, value]) => {
        result[key] = value;
      });
      
      // 2. Add standard field names for fields that have non-standard names
      Object.entries(FIELD_ALIASES).forEach(([standardName, aliases]) => {
        // Skip if we already have the standard field
        if (result[standardName] !== undefined) return;
        
        // Try each alias
        for (const alias of aliases) {
          if (record[alias] !== undefined) {
            result[standardName] = record[alias];
            break;
          }
        }
      });
      
      // 3. Apply derivations if requested
      if (applyDerivations) {
        // Calculate response time if not present
        if (result['Response Time'] === undefined) {
          const responseTime = calculateResponseTime(result);
          if (responseTime !== null) {
            result['Response Time'] = responseTime;
          }
        }
        
        // Ensure coordinates are in the standard fields
        if (result['Latitude'] === undefined || result['Longitude'] === undefined) {
          const coords = getCoordinates(result);
          if (coords) {
            if (result['Latitude'] === undefined) result['Latitude'] = coords.lat;
            if (result['Longitude'] === undefined) result['Longitude'] = coords.lng;
          }
        }
        
        // Ensure Incident DateTime is available as a derived field
        if (!result['Incident DateTime']) {
          const dateTime = getDateTime(result);
          if (dateTime) {
            result['Incident DateTime'] = dateTime;
          }
        }
      }
      
      return result;
    };
    
    // Apply to single record or array
    if (Array.isArray(data)) {
      return data.map(record => standardizeRecord(record));
    } else {
      return standardizeRecord(data);
    }
  }

  /**
   * Get a specific value from a standardized record with proper formatting
   * @param {Object} data - The data record
   * @param {string} field - The standard field name
   * @param {Object} options - Options for formatting
   * @returns {*} - The formatted value
   */
  function getFormattedValue(data, field, options = {}) {
    if (!data || !field) return null;
    
    const { 
      dateFormat = 'ISO8601',
      timeFormat = 'HH:MM:SS',
      defaultValue = null,
      applyFormatting = true
    } = options;
    
    // Get the raw value
    const value = getValue(data, field, defaultValue);
    if (value === null || value === undefined) return defaultValue;
    
    // Apply formatting based on field type
    if (!applyFormatting) return value;
    
    // Get the field type based on field name
    const fieldInfo = FIELD_STANDARDS.find(f => f.name === field);
    const fieldType = fieldInfo ? fieldInfo.type : detectFieldType(field, value);
    
    switch (fieldType) {
      case 'date':
        const parsedDate = parseDate(value);
        return parsedDate ? formatDate(parsedDate, dateFormat) : value;
        
      case 'time':
        const parsedTime = parseTime(value);
        return parsedTime ? formatTime(parsedTime, timeFormat) : value;
        
      case 'datetime':
        const parsedDateTime = parseDate(value);
        if (parsedDateTime) {
          const date = formatDate(parsedDateTime, dateFormat);
          const time = formatTime({
            hours: parsedDateTime.getHours(),
            minutes: parsedDateTime.getMinutes(),
            seconds: parsedDateTime.getSeconds()
          }, timeFormat);
          
          return `${date} ${time}`;
        }
        return value;
        
      case 'number':
        if (typeof value === 'string') {
          const parsedNum = parseFloat(value);
          return isNaN(parsedNum) ? value : parsedNum;
        }
        return value;
        
      case 'coordinate':
        if (typeof value === 'string') {
          const parsedCoord = parseFloat(value);
          return isNaN(parsedCoord) ? value : parsedCoord.toFixed(6);
        } else if (typeof value === 'number') {
          return value.toFixed(6);
        }
        return value;
        
      default:
        return value;
    }
  }
  
  /**
   * Detect the field type based on name and sample value
   * @param {string} fieldName - The field name
   * @param {*} sampleValue - Sample value for the field
   * @returns {string} - Detected field type
   */
  function detectFieldType(fieldName, sampleValue) {
    // Use MapFieldsManager if available
    if (MapFieldsManager && typeof MapFieldsManager.detectFieldType === 'function') {
      return MapFieldsManager.detectFieldType(fieldName, sampleValue);
    }
    
    // Simplified detection logic
    if (!fieldName) return 'text';
    
    const name = fieldName.toLowerCase();
    
    // Coordinate fields
    if (name.includes('lat') || name.includes('lon') || name.includes('lng') ||
        name === 'x' || name === 'y' || name.includes('coordinate')) {
      return 'coordinate';
    }
    
    // Date fields
    if (name.includes('date') && !name.includes('time')) {
      return 'date';
    }
    
    // Time fields
    if ((name.includes('time') || name.includes('hour')) && !name.includes('date')) {
      return 'time';
    }
    
    // Datetime fields
    if ((name.includes('date') && name.includes('time')) || name.includes('datetime')) {
      return 'datetime';
    }
    
    // Numeric fields
    if (name.includes('count') || name.includes('number') || name.includes('amount') ||
        name.includes('total') || name.includes('sum') || name.includes('min') ||
        name.includes('max') || name.includes('avg') || name.includes('time')) {
      return 'number';
    }
    
    // Try to detect from sample value
    if (sampleValue !== undefined && sampleValue !== null) {
      if (typeof sampleValue === 'number') {
        return 'number';
      }
      
      if (typeof sampleValue === 'string') {
        // Check for date pattern
        if (/^\d{4}-\d{2}-\d{2}$/.test(sampleValue) || 
            /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(sampleValue)) {
          return 'date';
        }
        
        // Check for time pattern
        if (/^\d{1,2}:\d{2}(:\d{2})?(\s*[AP]M)?$/i.test(sampleValue)) {
          return 'time';
        }
      }
    }
    
    return 'text';
  }

  /**
   * Main entry point to process data through the standardizer
   * @param {Object|Array} data - The raw data (single record or array)
   * @param {Object} options - Processing options
   * @returns {Object|Array} - Standardized data
   */
  function process(data, options = {}) {
    const {
      applyDerivations = true,
      standardizeFieldNames = true,
      applyFormatting = true,
      dateFormat = 'ISO8601',
      timeFormat = 'HH:MM:SS'
    } = options;
    
    // Standardize field names first
    let result = data;
    if (standardizeFieldNames) {
      result = standardize(data, applyDerivations);
    }
    
    // Apply formatting if requested
    if (applyFormatting) {
      const formatOptions = { dateFormat, timeFormat, applyFormatting: true };
      
      if (Array.isArray(result)) {
        result = result.map(record => {
          const formatted = { ...record };
          
          // Format date and time fields
          Object.entries(formatted).forEach(([field, value]) => {
            const standardField = getStandardFieldName(field) || field;
            const formattedValue = getFormattedValue({ [field]: value }, standardField, formatOptions);
            formatted[field] = formattedValue;
          });
          
          return formatted;
        });
      } else if (result && typeof result === 'object') {
        const formatted = { ...result };
        
        // Format date and time fields
        Object.entries(formatted).forEach(([field, value]) => {
          const standardField = getStandardFieldName(field) || field;
          const formattedValue = getFormattedValue({ [field]: value }, standardField, formatOptions);
          formatted[field] = formattedValue;
        });
        
        result = formatted;
      }
    }
    
    return result;
  }

  // Public API
  return {
    // Core data standardization
    standardize,
    process,
    
    // Field standardization
    getStandardFieldName,
    getAllFieldNames,
    getValue,
    getFormattedValue,
    
    // Date/time handling
    parseDate,
    parseTime,
    formatDate,
    formatTime,
    getDateTime,
    
    // Special field handling
    calculateResponseTime,
    getCoordinates,
    
    // Type detection
    detectFieldType,
    
    // Constants
    FIELD_STANDARDS,
    FIELD_ALIASES
  };
})();

// Add convenience aliases
FireEMS.Utils.standardizeData = FireEMS.Utils.DataStandardizer.standardize;
FireEMS.Utils.processData = FireEMS.Utils.DataStandardizer.process;
FireEMS.Utils.getField = FireEMS.Utils.DataStandardizer.getValue;

// Register availability for feature detection
FireEMS.Utils.dataStandardizerAvailable = true;

// Add check function to the global space for emergency mode prevention
window.checkDataStandardizer = function() {
  // Check if the DataStandardizer is actually available and functioning
  const fullyAvailable = window.FireEMS && 
                         window.FireEMS.Utils && 
                         window.FireEMS.Utils.DataStandardizer &&
                         typeof window.FireEMS.Utils.DataStandardizer.standardize === 'function';
  
  return {
    available: fullyAvailable,
    utility: "DataStandardizer",
    version: "1.0.0",
    methods: [
      "standardize", 
      "process", 
      "getValue",
      "getDateTime"
    ],
    status: fullyAvailable ? "loaded" : "unavailable"
  };
};

// Immediate invocation to register availability in FireEMS global object
(function() {
  try {
    // Set an emergency mode detection flag that gets checked before emergency mode activates
    if (!window.FireEMS) window.FireEMS = {};
    if (!window.FireEMS.features) window.FireEMS.features = {};
    window.FireEMS.features.dataStandardizerAvailable = true;
    
    // Log successful registration for debugging
    console.log("DataStandardizer registered feature availability flag");
  } catch (e) {
    console.error("Failed to register DataStandardizer availability:", e);
  }
})();