/**
 * Field Mapping Enhancement for FireEMS.ai Data Formatter
 * 
 * This is a patch that enhances field mapping for different CAD system formats
 * to ensure proper data transformation for the Response Time Analyzer and Isochrone Map.
 * 
 * How to use:
 * 1. Apply this as a patch to data-formatter.js
 * 2. Replace the prepareDataForTool function with this enhanced version
 */

// Enhanced prepareDataForTool function with improved CAD system detection and field mapping
function prepareDataForTool(data, toolId) {
    if (!data || !toolId) return data;
    
    const requirements = toolRequirements[toolId];
    if (!requirements) return data;
    
    try {
        appendLog(`Applying final adjustments for ${getToolName(toolId)}...`);
        
        // Create a deep copy to avoid modifying the original data
        const preparedData = JSON.parse(JSON.stringify(data));
        
        // Detect CAD system based on field names in the first record
        const cadSystem = detectCADSystem(preparedData[0]);
        if (cadSystem) {
            appendLog(`Detected ${cadSystem} CAD system format`);
        }
        
        // Apply tool-specific transformations
        switch (toolId) {
            case 'response-time':
                // Ensure response time is calculated if not present and fields are properly named
                preparedData.forEach(item => {
                    // Enhanced field mappings with CAD-specific fields
                    const keyMappings = {
                        'Reported': [
                            // General fields
                            'Incident Time', 'Reported Time', 'Time Reported', 'Call Time', 'Alarm Time', 'Incident_Time', 'Call_Time',
                            // Motorola fields
                            'CALL_RECEIVED_TIME',
                            // Tyler fields
                            'CALL_DATE_TIME',
                            // Hexagon fields
                            'EVENT_OPEN_DATETIME',
                            // Central Square fields
                            'REPORTED_DT'
                        ],
                        'Unit Dispatched': [
                            // General fields
                            'Dispatch Time', 'Dispatched', 'Time Dispatched', 'Dispatch', 'Dispatch_Time', 'TimeDispatched',
                            // Motorola fields
                            'DISPATCH_TIME',
                            // Tyler fields
                            'DISP_DATE_TIME',
                            // Hexagon fields
                            'DISPATCH_DATETIME',
                            // Central Square fields
                            'DISPATCH_DT'
                        ],
                        'Unit Enroute': [
                            // General fields
                            'En Route Time', 'Enroute', 'Time Enroute', 'Responding Time', 'EnRouteTime', 'TimeEnroute',
                            // Specific CAD fields would be added here - most systems combine with unit status tables
                            'ENROUTE_TIME', 'ENROUTE_DATETIME', 'ENROUTE_DT'
                        ],
                        'Unit Onscene': [
                            // General fields
                            'On Scene Time', 'Onscene', 'Time Onscene', 'Arrival Time', 'Arrived', 'OnSceneTime', 'TimeOnScene', 'ArrivalTime',
                            // Motorola fields
                            'ARRIVAL_TIME',
                            // Tyler fields
                            'ARRV_DATE_TIME',
                            // Hexagon fields
                            'ARRIVE_DATETIME',
                            // Central Square fields
                            'ARRIVAL_DT'
                        ],
                        'Run No': [
                            // General fields
                            'Incident ID', 'Call No', 'Call ID', 'Incident Number', 'IncidentID', 'CallNumber',
                            // Motorola fields
                            'INCIDENT_NO',
                            // Tyler fields
                            'CAD_CALL_ID',
                            // Hexagon fields
                            'EVENT_NUMBER',
                            // Central Square fields
                            'CAD_INCIDENT_ID'
                        ],
                        'Incident City': [
                            // General fields
                            'City', 'Location City', 'Municipality', 'City_Name',
                            // Motorola fields
                            'LOCATION_CITY',
                            // Tyler fields
                            'CITY',
                            // Hexagon fields
                            'EVENT_CITY',
                            // Central Square fields
                            'ADDR_CITY'
                        ],
                        'Full Address': [
                            // General fields
                            'Address', 'Incident Address', 'Location', 'Location Address', 'IncidentAddress',
                            // Motorola fields
                            'LOCATION_ADDR',
                            // Tyler fields
                            'ADDRESS',
                            // Hexagon fields
                            'EVENT_STREET',
                            // Central Square fields
                            'ADDR_STR'
                        ],
                        'Unit': [
                            // General fields
                            'Unit ID', 'Responding Unit', 'Apparatus', 'UnitID', 'Unit_ID', 'UnitName',
                            // Motorola fields
                            'UNIT_ID',
                            // Tyler fields
                            'UNIT_ASSIGNED',
                            // Hexagon fields
                            'UNIT_NUMBER',
                            // Central Square fields
                            'APPARATUS_ID'
                        ],
                        'Nature': [
                            // Incident type fields from different systems
                            'Incident Type', 'Call Type', 'Call_Type', 'Nature',
                            // Motorola fields
                            'INCIDENT_TYPE_DESC',
                            // Tyler fields
                            'NATURE_DESC',
                            // Hexagon fields
                            'PROBLEM_DESCRIPTION',
                            // Central Square fields
                            'CALL_DESCRIPTION'
                        ],
                        // Add lat/long mappings to ensure coordinates are available
                        'Latitude': [
                            'Latitude', 'Lat', 'lat', 'LAT', 'latitude',
                            // Motorola fields
                            'LAT',
                            // Tyler fields
                            'LATITUDE',
                            // Hexagon fields
                            'EVENT_Y_COORDINATE',
                            // Central Square fields
                            'GEOY'
                        ],
                        'Longitude': [
                            'Longitude', 'Long', 'lng', 'LON', 'longitude',
                            // Motorola fields
                            'LON',
                            // Tyler fields
                            'LONGITUDE',
                            // Hexagon fields
                            'EVENT_X_COORDINATE',
                            // Central Square fields
                            'GEOX'
                        ]
                    };
                    
                    // Enhanced field mapping with explicit console output for debugging
                    Object.entries(keyMappings).forEach(([targetField, possibleSourceFields]) => {
                        // Skip if already exists and not empty
                        if (item[targetField] !== undefined && item[targetField] !== '') {
                            console.log(`Field ${targetField} already exists: ${item[targetField]}`);
                            return;
                        }
                        
                        // Try to find one of the source fields
                        for (const sourceField of possibleSourceFields) {
                            if (item[sourceField] !== undefined && item[sourceField] !== '') {
                                // Store the original field for reference
                                console.log(`Found field mapping: ${sourceField} → ${targetField}: ${item[sourceField]}`);
                                
                                // Handle special cases for date/time fields
                                if (['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'].includes(targetField)) {
                                    // If the source field is a full datetime, extract the time portion
                                    if (sourceField.toLowerCase().includes('datetime') || 
                                        sourceField.includes('_DT') || 
                                        sourceField.endsWith('_DATE_TIME')) {
                                        try {
                                            const datetime = new Date(item[sourceField]);
                                            if (!isNaN(datetime)) {
                                                item[targetField] = datetime.toTimeString().split(' ')[0];
                                                console.log(`Extracted time from ${sourceField}: ${item[targetField]}`);
                                            } else {
                                                item[targetField] = item[sourceField];
                                            }
                                        } catch (e) {
                                            console.warn(`Error extracting time from ${sourceField}:`, e);
                                            item[targetField] = item[sourceField];
                                        }
                                    } else {
                                        item[targetField] = item[sourceField];
                                    }
                                } else {
                                    item[targetField] = item[sourceField];
                                }
                                break;
                            }
                        }
                    });
                    
                    // For debugging - log all available fields in this record
                    console.log(`Available fields in record: ${Object.keys(item).join(', ')}`);
                    
                    // Special handling for latitude/longitude to ensure numeric values
                    if (item['Latitude'] !== undefined) {
                        const lat = parseFloat(item['Latitude']);
                        if (!isNaN(lat)) {
                            item['Latitude'] = lat;
                        }
                    }
                    
                    if (item['Longitude'] !== undefined) {
                        const lng = parseFloat(item['Longitude']);
                        if (!isNaN(lng)) {
                            item['Longitude'] = lng;
                        }
                    }
                    
                    // Special handling for timestamps in various formats
                    processTimestamps(item);
                });
                break;
                
            case 'isochrone-stations':
                // Ensure stations have proper fields
                preparedData.forEach((item, index) => {
                    // Expanded field name handling for different CAD systems
                    const coordMappings = {
                        'Latitude': [
                            'Latitude', 'latitude', 'lat', 'y', 'LAT', 'Lat',
                            'STATION_LAT', 'LAT', 'Y_COORDINATE', 'GEOY'
                        ],
                        'Longitude': [
                            'Longitude', 'longitude', 'long', 'lng', 'x', 'LONG', 'Lng', 'LON', 'Lon',
                            'STATION_LONG', 'LON', 'X_COORDINATE', 'GEOX'
                        ],
                        'Station Name': [
                            'Station Name', 'station_name', 'stationName', 'name', 'Name', 'STATION_NAME', 'Station',
                            'STATION_NAME', 'FACILITY_NAME', 'STATION_DESC', 'STATION_TITLE'
                        ],
                        'Station ID': [
                            'Station ID', 'station_id', 'stationID', 'id', 'ID', 'STATION_ID', 'StationID',
                            'STATION_ID', 'FACILITY_ID', 'STATION_NUMBER', 'STATION_CODE'
                        ]
                    };
                    
                    // Map fields with expanded mappings
                    Object.entries(coordMappings).forEach(([targetField, sourceFields]) => {
                        if (item[targetField] === undefined) {
                            for (const field of sourceFields) {
                                if (item[field] !== undefined) {
                                    // For coordinates, ensure numeric values
                                    if (targetField === 'Latitude' || targetField === 'Longitude') {
                                        const coordValue = parseFloat(item[field]);
                                        if (!isNaN(coordValue)) {
                                            item[targetField] = coordValue;
                                            console.log(`Mapped ${field} to ${targetField}: ${coordValue}`);
                                            break;
                                        }
                                    } else {
                                        item[targetField] = item[field];
                                        console.log(`Mapped ${field} to ${targetField}: ${item[field]}`);
                                        break;
                                    }
                                }
                            }
                        }
                    });
                    
                    // If still no name but we have ID, use ID as name
                    if (item['Station Name'] === undefined && item['Station ID'] !== undefined) {
                        item['Station Name'] = `Station ${item['Station ID']}`;
                    } else if (item['Station Name'] === undefined) {
                        // Generate a name if none exists
                        item['Station Name'] = `Station ${index + 1}`;
                    }
                });
                break;
                
            case 'isochrone-incidents':
                // Enhanced field mapping for incidents across different CAD systems
                preparedData.forEach(item => {
                    // Expanded coordinate and type mappings
                    const incidentMappings = {
                        'Latitude': [
                            'Latitude', 'latitude', 'lat', 'y', 'LAT', 'Lat',
                            'LAT', 'LATITUDE', 'EVENT_Y_COORDINATE', 'GEOY'
                        ],
                        'Longitude': [
                            'Longitude', 'longitude', 'long', 'lng', 'x', 'LONG', 'Lng', 'LON', 'Lon',
                            'LON', 'LONGITUDE', 'EVENT_X_COORDINATE', 'GEOX'
                        ],
                        'Incident Type': [
                            'Incident Type', 'incident_type', 'incidentType', 'type', 'Type', 'call_type', 'callType',
                            'INCIDENT_TYPE_DESC', 'NATURE_DESC', 'PROBLEM_DESCRIPTION', 'CALL_DESCRIPTION'
                        ],
                        'Incident ID': [
                            'Incident ID', 'incident_id', 'incidentID', 'id', 'ID', 'INCIDENT_ID', 'IncidentID',
                            'INCIDENT_NO', 'CAD_CALL_ID', 'EVENT_NUMBER', 'CAD_INCIDENT_ID'
                        ]
                    };
                    
                    // Map fields with expanded mappings
                    Object.entries(incidentMappings).forEach(([targetField, sourceFields]) => {
                        if (item[targetField] === undefined) {
                            for (const field of sourceFields) {
                                if (item[field] !== undefined) {
                                    // For coordinates, ensure numeric values
                                    if (targetField === 'Latitude' || targetField === 'Longitude') {
                                        const coordValue = parseFloat(item[field]);
                                        if (!isNaN(coordValue)) {
                                            item[targetField] = coordValue;
                                            console.log(`Mapped ${field} to ${targetField}: ${coordValue}`);
                                            break;
                                        }
                                    } else {
                                        item[targetField] = item[field];
                                        console.log(`Mapped ${field} to ${targetField}: ${item[field]}`);
                                        break;
                                    }
                                }
                            }
                        }
                    });
                    
                    // If still no incident type, use a default
                    if (item['Incident Type'] === undefined) {
                        item['Incident Type'] = 'Unknown';
                    }
                });
                break;
            
            // Add mappings for other tools as needed
        }
        
        return preparedData;
    } catch (error) {
        appendLog(`Warning: Error during final data preparation: ${error.message}`, 'warning');
        console.error('Data preparation error:', error);
        return data; // Return original data if preparation fails
    }
}

// Helper function to detect CAD system based on field names
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
    
    return null;
}

// Helper function to process various timestamp formats
function processTimestamps(item) {
    // Handle date and time fields that might be combined in a single timestamp
    const timestampFields = [
        // General fields
        'timestamp', 'datetime', 'incident_datetime', 'created_at', 'Timestamp', 'DateTime', 'Date_Time', 'CreateTime',
        // System specific fields
        'CALL_DATE_TIME', 'EVENT_OPEN_DATETIME', 'REPORTED_DT', 'CALL_RECEIVED_DATE'
    ];
    
    let hasProcessedTimestamp = false;
    
    for (const field of timestampFields) {
        if (item[field] !== undefined && item[field] !== '') {
            console.log(`Processing timestamp field: ${field} = ${item[field]}`);
            try {
                // Try to parse as a standard date format
                const timestamp = new Date(item[field]);
                
                if (!isNaN(timestamp)) {
                    // Set date fields if they don't exist
                    if (!item['Incident Date']) {
                        item['Incident Date'] = timestamp.toISOString().split('T')[0];
                        console.log(`Set Incident Date from ${field}: ${item['Incident Date']}`);
                    }
                    
                    // Set time fields if they don't exist
                    if (!item['Reported']) {
                        item['Reported'] = timestamp.toISOString().split('T')[1].substring(0, 8);
                        console.log(`Set Reported time from ${field}: ${item['Reported']}`);
                    }
                    
                    hasProcessedTimestamp = true;
                }
            } catch (e) {
                console.warn(`Failed to parse timestamp field ${field}:`, e);
            }
        }
    }
    
    // If we didn't process any timestamps, try to look for separate date/time fields
    if (!hasProcessedTimestamp) {
        // First, check for fields that might contain dates
        const dateFields = [
            'Date', 'Incident Date', 'Call Date', 'Alarm Date', 'Date_Reported', 'Date_Created',
            'CALL_RECEIVED_DATE'
        ];
        
        // Then, check for fields that might contain times
        const timeFields = [
            'Time', 'Incident Time', 'Call Time', 'Alarm Time', 'Time_Reported', 'Time_Created',
            'CALL_RECEIVED_TIME'
        ];
        
        // Try to find date and time fields
        let dateField = null;
        let timeField = null;
        
        for (const field of dateFields) {
            if (item[field] !== undefined && item[field] !== '') {
                dateField = field;
                break;
            }
        }
        
        for (const field of timeFields) {
            if (item[field] !== undefined && item[field] !== '') {
                timeField = field;
                break;
            }
        }
        
        // If we found both date and time fields, combine them
        if (dateField && timeField) {
            console.log(`Found separate date field: ${dateField} and time field: ${timeField}`);
            try {
                // Try to standardize date format
                const dateStr = standardizeDate(item[dateField]);
                const timeStr = standardizeTime(item[timeField]);
                
                // Set fields
                if (!item['Incident Date']) {
                    item['Incident Date'] = dateStr;
                    console.log(`Set Incident Date from ${dateField}: ${dateStr}`);
                }
                
                if (!item['Reported']) {
                    item['Reported'] = timeStr;
                    console.log(`Set Reported from ${timeField}: ${timeStr}`);
                }
            } catch (e) {
                console.warn(`Error processing date/time fields:`, e);
            }
        }
    }
}