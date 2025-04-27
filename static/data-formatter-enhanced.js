/**
 * Enhanced Data Formatter Implementation
 * Implements the fixes outlined in FIX_DATA_FORMATTER.md
 */

console.log("Loading enhanced data formatter functionality...");

(function() {
  // CRITICAL INITIALIZATION GUARD: Prevent multiple initialization
  if (window.dataFormatterEnhancedInitialized) {
    console.log('[DataFormatter] Enhanced version already initialized, skipping duplicate initialization');
    return;
  }
  window.dataFormatterEnhancedInitialized = true;

  // Store original transformData function if it exists
  const originalTransformData = window.dataFormatter?.transformData;

  /**
   * Detect which CAD system was used based on field names
   * @param {Array} sourceColumns - Array of source column names
   * @returns {String} - Detected CAD system type or 'generic' if unknown
   */
  function detectCADSystem(sourceColumns) {
    if (!sourceColumns || !Array.isArray(sourceColumns)) {
      console.error("Invalid sourceColumns provided to detectCADSystem");
      return 'generic';
    }
    
    // Convert all columns to lowercase for case-insensitive matching
    const columns = sourceColumns.map(col => col.toLowerCase());
    
    console.log("Detecting CAD system from columns:", columns);
    
    // Look for signature field patterns for each CAD system
    
    // Motorola PremierOne CAD
    if (
      columns.includes('callid') || 
      columns.includes('call_id') || 
      columns.includes('inc_no') ||
      (columns.includes('dispatch_time') && columns.includes('en_route_time'))
    ) {
      console.log("Detected Motorola PremierOne CAD system");
      return 'motorola';
    }
    
    // Tyler New World CAD
    if (
      columns.includes('incident_number') || 
      columns.includes('num') || 
      (columns.includes('call_type') && columns.includes('call_time'))
    ) {
      console.log("Detected Tyler New World CAD system");
      return 'tyler';
    }
    
    // Hexagon/Intergraph CAD
    if (
      columns.includes('event_number') || 
      columns.includes('event_id') || 
      columns.includes('event_time')
    ) {
      console.log("Detected Hexagon/Intergraph CAD system");
      return 'hexagon';
    }
    
    // Central Square CAD
    if (
      columns.includes('nature') || 
      columns.includes('cfs_number') || 
      columns.includes('cfs_id') ||
      columns.includes('reported_dt') ||
      columns.includes('call_number')
    ) {
      console.log("Detected Central Square CAD system");
      return 'centralsquare';
    }
    
    // Default to generic if no specific patterns were matched
    console.log("Could not determine specific CAD system, using generic mappings");
    return 'generic';
  }

  /**
   * Process timestamps from various formats
   * @param {Object} row - Data row
   * @param {String} fieldName - Field name to process
   * @returns {Object} - Object with parsed date and time
   */
  function processTimestamps(row, fieldName) {
    const value = row[fieldName];
    if (!value) return null;
    
    let result = null;
    
    // Try different date/time formats
    try {
      // Standard ISO format
      if (value.includes('T')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          result = {
            date: date.toISOString().split('T')[0],
            time: date.toISOString().split('T')[1].substring(0, 8),
            timestamp: date
          };
        }
      } 
      // Combined date/time with space separator (e.g., "2023-04-15 14:30:00")
      else if (value.includes(' ') && value.includes(':')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          result = {
            date: value.split(' ')[0],
            time: value.split(' ')[1],
            timestamp: date
          };
        }
      }
      // MM/DD/YYYY format
      else if (value.includes('/')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          result = {
            date: date.toISOString().split('T')[0],
            time: date.toISOString().split('T')[1].substring(0, 8),
            timestamp: date
          };
        }
      }
      // Unix timestamp (milliseconds)
      else if (!isNaN(value) && value.length > 9) {
        const timestamp = parseInt(value);
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          result = {
            date: date.toISOString().split('T')[0],
            time: date.toISOString().split('T')[1].substring(0, 8),
            timestamp: date
          };
        }
      }
    } catch (e) {
      console.warn(`Error parsing timestamp "${value}" from field "${fieldName}":`, e);
    }
    
    return result;
  }

  /**
   * Enhanced transformData function that improves field mapping
   * @param {Array} sourceData - Original data array
   * @param {Object} mappings - Field mappings
   * @param {String} toolId - The tool being used
   * @returns {Array} - Transformed data
   */
  function enhancedTransformData(sourceData, mappings, toolId) {
    console.log(`Enhancing data transformation for ${toolId} with ${Object.keys(mappings).length} mappings`);
    
    // Validate inputs
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      console.error("No source data provided for transformation");
      return [];
    }
    
    if (!mappings || Object.keys(mappings).length === 0) {
      console.error("No field mappings provided for transformation");
      return sourceData;
    }
    
    // Get column names from first row
    const sourceColumns = Object.keys(sourceData[0]);
    
    // Detect CAD system type
    const cadSystem = detectCADSystem(sourceColumns);
    console.log(`Detected CAD system: ${cadSystem}`);
    
    // CAD-specific field mapping extensions
    const cadFieldMappings = {
      // Motorola PremierOne CAD
      motorola: {
        'incident_id': ['callid', 'call_id', 'inc_no', 'incident_number', 'number'],
        'incident_date': ['call_date', 'incident_date', 'date'],
        'incident_time': ['call_time', 'incident_time', 'time'],
        'dispatch_time': ['dispatch_time', 'dispatched', 'dispatch_timestamp'],
        'arrival_time': ['arrival_time', 'arrived', 'on_scene', 'arrival_timestamp'],
        'clear_time': ['clear_time', 'cleared', 'clear_timestamp'],
        'latitude': ['latitude', 'lat', 'y', 'ycoord'],
        'longitude': ['longitude', 'long', 'lon', 'lng', 'x', 'xcoord'],
        'incident_type': ['call_type', 'incident_type', 'type', 'nature']
      },
      
      // Tyler New World CAD
      tyler: {
        'incident_id': ['incident_number', 'num', 'inc_number', 'id'],
        'incident_date': ['call_date', 'date'],
        'incident_time': ['call_time', 'time'],
        'dispatch_time': ['disp_time', 'dispatch_time', 'time_dispatched'],
        'arrival_time': ['arrival_time', 'time_arrived', 'on_scene_time'],
        'clear_time': ['clear_time', 'time_cleared'],
        'latitude': ['latitude', 'lat', 'y_coordinate'],
        'longitude': ['longitude', 'long', 'lon', 'x_coordinate'],
        'incident_type': ['call_type', 'type', 'nature', 'call_nature']
      },
      
      // Hexagon/Intergraph CAD
      hexagon: {
        'incident_id': ['event_number', 'event_id', 'event', 'incident_no'],
        'incident_date': ['event_date', 'date'],
        'incident_time': ['event_time', 'time'],
        'dispatch_time': ['dispatch_time', 'dispatched'],
        'arrival_time': ['arrival_time', 'arrived', 'on_scene'],
        'clear_time': ['clear_time', 'cleared', 'closed'],
        'latitude': ['latitude', 'lat', 'y_coord', 'y'],
        'longitude': ['longitude', 'long', 'lon', 'x_coord', 'x'],
        'incident_type': ['nature', 'type', 'problem', 'call_type']
      },
      
      // Central Square CAD
      centralsquare: {
        'incident_id': ['cfs_number', 'cfs_id', 'call_number', 'incident_number'],
        'incident_date': ['reported_date', 'date', 'call_date'],
        'incident_time': ['reported_time', 'time', 'call_time'],
        'dispatch_time': ['dispatch_time', 'dispatched'],
        'arrival_time': ['arrival_time', 'arrived', 'on_scene'],
        'clear_time': ['clear_time', 'cleared', 'closed_time'],
        'latitude': ['latitude', 'lat', 'y_coord', 'y'],
        'longitude': ['longitude', 'long', 'lon', 'x_coord', 'x'],
        'incident_type': ['nature', 'type', 'call_type', 'incident_type']
      },
      
      // Generic fallback mappings
      generic: {
        'incident_id': ['incident_id', 'id', 'incident_number', 'number', 'call_id', 'callid'],
        'incident_date': ['incident_date', 'date', 'call_date'],
        'incident_time': ['incident_time', 'time', 'call_time'],
        'dispatch_time': ['dispatch_time', 'dispatched'],
        'arrival_time': ['arrival_time', 'arrived', 'on_scene'],
        'clear_time': ['clear_time', 'cleared'],
        'latitude': ['latitude', 'lat', 'y', 'ycoord'],
        'longitude': ['longitude', 'long', 'lon', 'lng', 'x', 'xcoord'],
        'incident_type': ['incident_type', 'type', 'call_type', 'nature']
      }
    };
    
    // Helper function to find a field match using the CAD-specific mappings
    const findFieldMatch = (targetField, row) => {
      // First check the user-defined mapping
      if (mappings[targetField] && row[mappings[targetField]] !== undefined) {
        return row[mappings[targetField]];
      }
      
      // Then try CAD-specific mappings
      const possibleFields = cadFieldMappings[cadSystem][targetField] || [];
      for (const field of possibleFields) {
        // Check exact match first
        if (row[field] !== undefined) {
          return row[field];
        }
        
        // Then check case-insensitive match
        const lowerField = field.toLowerCase();
        for (const key of Object.keys(row)) {
          if (key.toLowerCase() === lowerField && row[key] !== undefined) {
            return row[key];
          }
        }
      }
      
      // Special case for CentralSquare's combined date/time fields
      if (cadSystem === 'centralsquare') {
        if ((targetField === 'incident_date' || targetField === 'incident_time') && 
            row['reported_dt'] !== undefined) {
          const timestamp = processTimestamps(row, 'reported_dt');
          if (timestamp) {
            return targetField === 'incident_date' ? timestamp.date : timestamp.time;
          }
        }
      }
      
      return undefined;
    };
    
    // Transform each row according to mappings
    const transformedData = sourceData.map(row => {
      const newRow = {};
      
      // Common fields needed by most tools
      const commonFields = [
        'incident_id', 'incident_date', 'incident_time', 
        'dispatch_time', 'arrival_time', 'clear_time',
        'latitude', 'longitude', 'incident_type'
      ];
      
      // Process common fields first
      commonFields.forEach(field => {
        const value = findFieldMatch(field, row);
        if (value !== undefined) {
          newRow[field] = value;
        }
      });
      
      // Apply each explicit field mapping from the user
      Object.keys(mappings).forEach(targetField => {
        const sourceField = mappings[targetField];
        
        // Skip if mapping is empty or we already processed this field
        if (!sourceField || newRow[targetField] !== undefined) return;
        
        // Copy data from source field to target field
        newRow[targetField] = row[sourceField];
      });
      
      // Special handling for date/time fields
      if ((newRow['incident_date'] && !newRow['incident_time']) || 
          (!newRow['incident_date'] && newRow['incident_time'])) {
        // Try to find a combined date/time field
        for (const key of Object.keys(row)) {
          if (key.toLowerCase().includes('date') && key.toLowerCase().includes('time')) {
            const timestamp = processTimestamps(row, key);
            if (timestamp) {
              if (!newRow['incident_date']) newRow['incident_date'] = timestamp.date;
              if (!newRow['incident_time']) newRow['incident_time'] = timestamp.time;
              break;
            }
          }
        }
      }
      
      // Process special fields with custom handling
      
      // Convert latitude/longitude to numbers if possible
      if (newRow['latitude'] !== undefined) {
        const numValue = parseFloat(newRow['latitude']);
        if (!isNaN(numValue)) {
          newRow['latitude'] = numValue;
        }
      }
      
      if (newRow['longitude'] !== undefined) {
        const numValue = parseFloat(newRow['longitude']);
        if (!isNaN(numValue)) {
          newRow['longitude'] = numValue;
        }
      }
      
      // Specific handling for each tool type
      if (toolId === 'response-time') {
        // Ensure we have both date and time for each timestamp
        if (newRow['dispatch_time'] && !newRow['dispatch_time'].includes(':')) {
          // This might be just a date without time, try to find time component
          for (const key of Object.keys(row)) {
            if (key.toLowerCase().includes('dispatch') && key.toLowerCase().includes('time')) {
              const value = row[key];
              if (value && value.includes(':')) {
                newRow['dispatch_time'] = value;
                break;
              }
            }
          }
        }
        
        // Repeat for arrival_time
        if (newRow['arrival_time'] && !newRow['arrival_time'].includes(':')) {
          for (const key of Object.keys(row)) {
            if ((key.toLowerCase().includes('arrival') || key.toLowerCase().includes('on_scene')) && 
                key.toLowerCase().includes('time')) {
              const value = row[key];
              if (value && value.includes(':')) {
                newRow['arrival_time'] = value;
                break;
              }
            }
          }
        }
      }
      else if (toolId === 'call-density') {
        // Ensure we have coordinates for heatmap
        if (newRow['latitude'] === undefined || newRow['longitude'] === undefined) {
          // Look for alternative coordinate formats
          for (const key of Object.keys(row)) {
            const lowerKey = key.toLowerCase();
            
            // Look for X/Y coordinates
            if (lowerKey.includes('x') && !newRow['longitude']) {
              const numValue = parseFloat(row[key]);
              if (!isNaN(numValue)) {
                newRow['longitude'] = numValue;
              }
            }
            else if (lowerKey.includes('y') && !newRow['latitude']) {
              const numValue = parseFloat(row[key]);
              if (!isNaN(numValue)) {
                newRow['latitude'] = numValue;
              }
            }
            
            // Look for combined coordinates (lat,lng)
            else if (lowerKey.includes('coord') || lowerKey.includes('location')) {
              const coordStr = row[key];
              if (coordStr && typeof coordStr === 'string') {
                // Try to parse "lat,lng" format
                const match = coordStr.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
                if (match) {
                  newRow['latitude'] = parseFloat(match[1]);
                  newRow['longitude'] = parseFloat(match[2]);
                }
              }
            }
          }
        }
      }
      
      return newRow;
    });
    
    console.log(`Enhanced transformation complete: ${transformedData.length} rows processed with CAD system: ${cadSystem}`);
    return transformedData;
  }
  
  // Replace the original transformData function with our enhanced version
  if (window.dataFormatter) {
    window.dataFormatter.transformData = enhancedTransformData;
    console.log("✅ Enhanced data transformation function installed successfully");
    
    // Add the detector function to make it available
    window.dataFormatter.detectCADSystem = detectCADSystem;
    window.dataFormatter.processTimestamps = processTimestamps;
  } else {
    console.error("❌ dataFormatter object not found - will retry in 1 second");
    
    // Retry after a short delay
    setTimeout(() => {
      if (window.dataFormatter) {
        window.dataFormatter.transformData = enhancedTransformData;
        window.dataFormatter.detectCADSystem = detectCADSystem;
        window.dataFormatter.processTimestamps = processTimestamps;
        console.log("✅ Enhanced data transformation function installed successfully (delayed)");
      } else {
        console.error("❌ dataFormatter object still not found after retry");
        
        // Create a MutationObserver to watch for the dataFormatter object
        const observer = new MutationObserver((mutations, obs) => {
          if (window.dataFormatter) {
            window.dataFormatter.transformData = enhancedTransformData;
            window.dataFormatter.detectCADSystem = detectCADSystem;
            window.dataFormatter.processTimestamps = processTimestamps;
            console.log("✅ Enhanced data transformation function installed successfully (via observer)");
            obs.disconnect(); // Stop observing once we've found it
          }
        });
        
        // Start observing
        observer.observe(document, {
          childList: true,
          subtree: true
        });
      }
    }, 1000);
  }
  
  // Add a load event listener to make sure we apply our fix after page load
  window.addEventListener('load', function() {
    // Check again if the dataFormatter object exists and apply our fix
    if (window.dataFormatter && window.dataFormatter.transformData !== enhancedTransformData) {
      window.dataFormatter.transformData = enhancedTransformData;
      window.dataFormatter.detectCADSystem = detectCADSystem;
      window.dataFormatter.processTimestamps = processTimestamps;
      console.log("✅ Enhanced data transformation function installed successfully (after page load)");
    }
    
    // Check if the map fields button exists and ensure it has the correct event handler
    const mapFieldsBtn = document.getElementById('map-fields-btn');
    if (mapFieldsBtn) {
      mapFieldsBtn.addEventListener('click', function() {
        console.log("Map fields button clicked, ensuring enhanced transformation is applied");
        
        // Make sure our enhanced version is installed
        if (window.dataFormatter && window.dataFormatter.transformData !== enhancedTransformData) {
          window.dataFormatter.transformData = enhancedTransformData;
          window.dataFormatter.detectCADSystem = detectCADSystem;
          window.dataFormatter.processTimestamps = processTimestamps;
          console.log("✅ Enhanced data transformation applied on map fields click");
        }
      });
    }
  });
  
  // Flag to indicate the fix is loaded
  window.dataFormatterEnhancedLoaded = true;
  
  console.log("Enhanced data formatter functionality initialization complete");
})();