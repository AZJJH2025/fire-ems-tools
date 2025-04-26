/**
 * FireEMS.ai Incident Logger - CAD Integration Module
 * 
 * This module handles Computer-Aided Dispatch (CAD) data integration including:
 * - Importing CAD data from various formats
 * - Mapping CAD fields to incident schema
 * - Reconciling CAD data with manually entered data
 */

/**
 * Parse and import CAD data from various file formats
 * @param {File} file - The CAD data file
 * @returns {Promise<Object>} - Promise resolving to parsed CAD data
 */
function importCadData(file) {
    return new Promise((resolve, reject) => {
        const fileType = file.name.split('.').pop().toLowerCase();
        
        // Create a FileReader to read the file
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                let parsedData;
                
                // Parse based on file type
                if (fileType === 'csv') {
                    parsedData = parseCSV(e.target.result);
                } else if (fileType === 'json') {
                    parsedData = parseJSON(e.target.result);
                } else if (fileType === 'xml') {
                    parsedData = parseXML(e.target.result);
                } else {
                    throw new Error(`Unsupported file type: ${fileType}`);
                }
                
                // Map the parsed data to our schema
                const mappedData = mapCadToIncidentSchema(parsedData);
                
                resolve(mappedData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Error reading file'));
        };
        
        // Read the file based on its type
        if (fileType === 'csv' || fileType === 'xml') {
            reader.readAsText(file);
        } else {
            reader.readAsText(file);
        }
    });
}

/**
 * Parse CSV CAD data
 * @param {string} csvData - The CSV data as string
 * @returns {Array} - Array of parsed CAD records
 */
function parseCSV(csvData) {
    // Use PapaParse for robust CSV parsing
    // This is a simplified implementation
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',');
        const record = {};
        
        headers.forEach((header, index) => {
            // Handle case where CSV has missing values
            record[header] = index < values.length ? values[index].trim() : '';
        });
        
        records.push(record);
    }
    
    return records;
}

/**
 * Parse JSON CAD data
 * @param {string} jsonData - The JSON data as string
 * @returns {Array} - Array of parsed CAD records
 */
function parseJSON(jsonData) {
    const data = JSON.parse(jsonData);
    
    // Handle different JSON structures
    if (Array.isArray(data)) {
        return data; // Already an array of records
    } else if (data.incidents || data.calls || data.records || data.data) {
        // Common JSON structure with a container property
        return data.incidents || data.calls || data.records || data.data;
    } else {
        // Might be a single record
        return [data];
    }
}

/**
 * Parse XML CAD data
 * @param {string} xmlData - The XML data as string
 * @returns {Array} - Array of parsed CAD records
 */
function parseXML(xmlData) {
    // This is a simplified implementation
    // In production, use a proper XML parser library
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "text/xml");
    
    // Common XML structures in CAD exports
    const incidentNodes = xmlDoc.getElementsByTagName('incident');
    if (incidentNodes.length > 0) {
        return Array.from(incidentNodes).map(nodeToObject);
    }
    
    const callNodes = xmlDoc.getElementsByTagName('call');
    if (callNodes.length > 0) {
        return Array.from(callNodes).map(nodeToObject);
    }
    
    const recordNodes = xmlDoc.getElementsByTagName('record');
    if (recordNodes.length > 0) {
        return Array.from(recordNodes).map(nodeToObject);
    }
    
    throw new Error('Unrecognized XML structure');
}

/**
 * Convert an XML node to a JavaScript object
 * @param {Node} node - The XML node
 * @returns {Object} - JavaScript object representing the node
 */
function nodeToObject(node) {
    const obj = {};
    
    // Get attributes
    if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            obj[attr.name] = attr.value;
        }
    }
    
    // Get child elements
    if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            
            // Skip text nodes and other non-element nodes
            if (child.nodeType !== 1) continue;
            
            const childName = child.nodeName;
            
            // If child has children, recurse
            if (child.childNodes.length > 1 || (child.childNodes.length === 1 && child.childNodes[0].nodeType !== 3)) {
                obj[childName] = nodeToObject(child);
            } else {
                // Simple text content
                obj[childName] = child.textContent;
            }
        }
    }
    
    return obj;
}

/**
 * Map CAD data fields to our incident schema
 * @param {Array} cadRecords - Array of CAD records
 * @returns {Array} - Array of incidents mapped to our schema
 */
function mapCadToIncidentSchema(cadRecords) {
    return cadRecords.map(record => {
        // Create a mapping configuration based on common CAD field names
        // This should be customizable per agency's CAD system
        const fieldMapping = getFieldMapping();
        
        // Create a new incident with CAD data
        const incident = {
            // We'll create an incident ID based on CAD ID if available
            id: getValueByPath(record, fieldMapping.id) ? 
                `INC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${getValueByPath(record, fieldMapping.id)}` :
                `INC-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
            
            // Track that this incident came from CAD
            cad_info: {
                cad_incident_id: getValueByPath(record, fieldMapping.id) || '',
                cad_call_type: getValueByPath(record, fieldMapping.call_type) || '',
                cad_priority: getValueByPath(record, fieldMapping.priority) || '',
                cad_import_timestamp: new Date().toISOString(),
                cad_data_source: 'CAD Import',
                cad_imported_by: 'system'
            },
            
            // Set the timestamp from CAD data or current time
            timestamp: parseCADDateTime(getValueByPath(record, fieldMapping.timestamp)) || new Date().toISOString(),
            
            // Default to active status for CAD imports
            status: 'active',
            
            // Location information
            location: {
                address: getValueByPath(record, fieldMapping.address) || '',
                latitude: parseFloat(getValueByPath(record, fieldMapping.latitude)) || null,
                longitude: parseFloat(getValueByPath(record, fieldMapping.longitude)) || null,
                notes: '',
                source: 'CAD'
            },
            
            // Incident type classification
            incident_type: {
                primary: mapCadIncidentType(getValueByPath(record, fieldMapping.call_type)),
                secondary: '',
                specific: getValueByPath(record, fieldMapping.call_type) || '',
                source: 'CAD'
            },
            
            // Caller information
            caller_info: {
                name: getValueByPath(record, fieldMapping.caller_name) || '',
                phone: getValueByPath(record, fieldMapping.caller_phone) || '',
                relationship: '',
                source: 'CAD'
            },
            
            // Dispatch timestamps
            dispatch: {
                time_received: parseCADDateTime(getValueByPath(record, fieldMapping.time_received)) || '',
                time_dispatched: parseCADDateTime(getValueByPath(record, fieldMapping.time_dispatched)) || '',
                time_enroute: parseCADDateTime(getValueByPath(record, fieldMapping.time_enroute)) || '',
                time_arrived: parseCADDateTime(getValueByPath(record, fieldMapping.time_arrived)) || '',
                time_transported: '',
                time_at_hospital: '',
                time_cleared: parseCADDateTime(getValueByPath(record, fieldMapping.time_cleared)) || '',
                source: 'CAD'
            },
            
            // Units assigned
            units: parseCADUnits(getValueByPath(record, fieldMapping.units)),
            
            // Initialize empty patient info
            patient_info: {
                count: 0,
                hipaa_consent_obtained: false,
                hipaa_consent_type: '',
                hipaa_consent_timestamp: '',
                hipaa_consent_obtained_by: '',
                details: []
            },
            
            // Initialize empty narrative
            narrative: getValueByPath(record, fieldMapping.comments) || '',
            
            // Initialize empty disposition
            disposition: {
                transported: false,
                destination: '',
                reason: ''
            },
            
            // Initialize empty attachments
            attachments: [],
            
            // Create audit trail
            audit: {
                created_by: 'CAD Import',
                created_at: new Date().toISOString(),
                last_modified_by: 'CAD Import',
                last_modified: new Date().toISOString(),
                access_log: [
                    {
                        user: 'CAD Import',
                        timestamp: new Date().toISOString(),
                        action: 'created from CAD'
                    }
                ]
            }
        };
        
        return incident;
    });
}

/**
 * Get a standardized mapping of CAD fields to our schema
 * This should be customizable for different CAD systems
 * @returns {Object} - Mapping configuration
 */
function getFieldMapping() {
    // This mapping would ideally be configurable in the UI
    return {
        // Basic incident info
        id: ['incident_id', 'cad_number', 'call_id', 'id', 'call_number', 'incident_number'],
        timestamp: ['call_datetime', 'incident_time', 'time_reported', 'timestamp', 'date_time', 'call_time'],
        call_type: ['nature', 'type', 'call_type', 'incident_type', 'nature_of_call', 'call_nature'],
        priority: ['priority', 'call_priority', 'incident_priority'],
        
        // Location info
        address: ['address', 'incident_address', 'location', 'call_location', 'street_address'],
        latitude: ['latitude', 'lat', 'y'],
        longitude: ['longitude', 'long', 'lon', 'lng', 'x'],
        
        // Caller info
        caller_name: ['caller_name', 'reporting_party', 'complainant', 'caller'],
        caller_phone: ['caller_phone', 'phone', 'callback_number', 'contact_number'],
        
        // Times
        time_received: ['time_received', 'call_received', 'received', 'alarm_time'],
        time_dispatched: ['time_dispatched', 'dispatched', 'dispatch_time'],
        time_enroute: ['time_enroute', 'enroute', 'enroute_time'],
        time_arrived: ['time_arrived', 'arrived', 'arrival_time', 'on_scene'],
        time_cleared: ['time_cleared', 'cleared', 'clear_time'],
        
        // Units
        units: ['units', 'unit_list', 'assigned_units', 'responding_units', 'apparatus'],
        
        // Additional info
        comments: ['comments', 'notes', 'call_notes', 'narrative', 'remarks']
    };
}

/**
 * Get a value from an object using any of the provided path keys
 * @param {Object} obj - The object to search in
 * @param {Array} pathKeys - Array of possible key paths
 * @returns {*} - The value found or undefined
 */
function getValueByPath(obj, pathKeys) {
    if (!obj || !pathKeys || !Array.isArray(pathKeys)) {
        return undefined;
    }
    
    // Try each possible key path
    for (const key of pathKeys) {
        // Handle nested paths like 'location.address'
        if (key.includes('.')) {
            const parts = key.split('.');
            let value = obj;
            
            for (const part of parts) {
                if (value === undefined || value === null) break;
                value = value[part];
            }
            
            if (value !== undefined) return value;
        } 
        // Handle direct key
        else if (obj[key] !== undefined) {
            return obj[key];
        }
        
        // Try case-insensitive match
        const lowerKey = key.toLowerCase();
        for (const objKey in obj) {
            if (objKey.toLowerCase() === lowerKey) {
                return obj[objKey];
            }
        }
    }
    
    return undefined;
}

/**
 * Parse units from CAD data
 * @param {string|Array} unitsData - Units data from CAD
 * @returns {Array} - Array of unit objects
 */
function parseCADUnits(unitsData) {
    if (!unitsData) return [];
    
    // Handle different formats of unit data
    let unitsList = [];
    
    if (Array.isArray(unitsData)) {
        // Already an array
        unitsList = unitsData;
    } else if (typeof unitsData === 'string') {
        // Comma-separated string
        unitsList = unitsData.split(',').map(unit => unit.trim());
    } else if (typeof unitsData === 'object') {
        // Object with unit properties
        unitsList = Object.values(unitsData);
    } else {
        // Convert to string and try to split
        unitsList = String(unitsData).split(',').map(unit => unit.trim());
    }
    
    // Convert to our unit schema
    return unitsList.map(unit => {
        if (typeof unit === 'string') {
            return {
                id: unit,
                type: guessUnitType(unit),
                personnel: [],
                source: 'CAD'
            };
        } else if (typeof unit === 'object') {
            return {
                id: unit.id || unit.unit_id || unit.name || 'Unknown',
                type: unit.type || unit.unit_type || guessUnitType(unit.id || unit.unit_id || unit.name),
                personnel: unit.personnel || unit.crew || [],
                source: 'CAD'
            };
        }
    }).filter(Boolean); // Remove any undefined entries
}

/**
 * Guess unit type based on unit ID
 * @param {string} unitId - The unit ID
 * @returns {string} - The guessed unit type
 */
function guessUnitType(unitId) {
    if (!unitId) return 'Unknown';
    
    unitId = unitId.toUpperCase();
    
    if (unitId.startsWith('E') || unitId.startsWith('ENGINE')) return 'Engine';
    if (unitId.startsWith('T') || unitId.startsWith('TRUCK') || unitId.startsWith('LADDER')) return 'Ladder';
    if (unitId.startsWith('M') || unitId.startsWith('MEDIC') || unitId.startsWith('AMB')) return 'Ambulance';
    if (unitId.startsWith('R') || unitId.startsWith('RESCUE')) return 'Rescue';
    if (unitId.startsWith('B') || unitId.startsWith('BAT')) return 'Battalion';
    if (unitId.startsWith('HM') || unitId.startsWith('HAZ')) return 'Hazmat';
    if (unitId.startsWith('SQ')) return 'Squad';
    if (unitId.startsWith('BC') || unitId.startsWith('CHIEF')) return 'Chief';
    
    return 'Other';
}

/**
 * Map CAD incident type to our primary categories
 * @param {string} cadType - The CAD incident type
 * @returns {string} - Mapped primary type
 */
function mapCadIncidentType(cadType) {
    if (!cadType) return '';
    
    cadType = cadType.toUpperCase();
    
    // Fire-related calls
    if (cadType.includes('FIRE') || 
        cadType.includes('SMOKE') || 
        cadType.includes('ALARM') ||
        cadType.includes('BURN')) {
        return 'FIRE';
    }
    
    // EMS-related calls
    if (cadType.includes('EMS') || 
        cadType.includes('MEDICAL') || 
        cadType.includes('TRAUMA') ||
        cadType.includes('SICK') ||
        cadType.includes('INJURY') ||
        cadType.includes('CARDIAC') ||
        cadType.includes('BREATHING') ||
        cadType.includes('FALL')) {
        return 'EMS';
    }
    
    // HAZMAT-related calls
    if (cadType.includes('HAZ') || 
        cadType.includes('SPILL') || 
        cadType.includes('LEAK') ||
        cadType.includes('GAS') ||
        cadType.includes('FUEL') ||
        cadType.includes('CHEMICAL')) {
        return 'HAZMAT';
    }
    
    // Rescue-related calls
    if (cadType.includes('RESCUE') || 
        cadType.includes('TRAPPED') || 
        cadType.includes('EXTRICATION') ||
        cadType.includes('WATER') && cadType.includes('RESCUE') ||
        cadType.includes('COLLAPSE')) {
        return 'RESCUE';
    }
    
    // Service calls
    if (cadType.includes('SERVICE') || 
        cadType.includes('ASSIST') || 
        cadType.includes('LOCKOUT') ||
        cadType.includes('WATER') && !cadType.includes('RESCUE')) {
        return 'SERVICE';
    }
    
    return 'OTHER';
}

/**
 * Parse CAD date/time strings to ISO format
 * @param {string} dateTimeStr - The date/time string from CAD
 * @returns {string} - ISO formatted date/time or empty string if invalid
 */
function parseCADDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    
    try {
        // Try direct parsing first
        let parsedDate = new Date(dateTimeStr);
        
        // Check if the date is valid
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
        }
        
        // Try common CAD date formats
        // MM/DD/YYYY HH:MM:SS
        const mmddyyyy = /(\d{1,2})\/(\d{1,2})\/(\d{4})\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM))?/i;
        let match = dateTimeStr.match(mmddyyyy);
        if (match) {
            const month = parseInt(match[1]) - 1; // 0-indexed month
            const day = parseInt(match[2]);
            const year = parseInt(match[3]);
            let hour = parseInt(match[4]);
            const minute = parseInt(match[5]);
            const second = match[6] ? parseInt(match[6]) : 0;
            const isPM = match[7] && match[7].toUpperCase() === 'PM';
            
            if (isPM && hour < 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
            
            parsedDate = new Date(year, month, day, hour, minute, second);
            return parsedDate.toISOString();
        }
        
        // YYYY-MM-DD HH:MM:SS
        const yyyymmdd = /(\d{4})-(\d{1,2})-(\d{1,2})\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/;
        match = dateTimeStr.match(yyyymmdd);
        if (match) {
            const year = parseInt(match[1]);
            const month = parseInt(match[2]) - 1; // 0-indexed month
            const day = parseInt(match[3]);
            const hour = parseInt(match[4]);
            const minute = parseInt(match[5]);
            const second = match[6] ? parseInt(match[6]) : 0;
            
            parsedDate = new Date(year, month, day, hour, minute, second);
            return parsedDate.toISOString();
        }
        
        // Unix timestamp
        if (/^\d+$/.test(dateTimeStr)) {
            const timestamp = parseInt(dateTimeStr);
            // Detect if it's seconds (10 digits) or milliseconds (13 digits)
            if (dateTimeStr.length === 10) {
                parsedDate = new Date(timestamp * 1000);
            } else {
                parsedDate = new Date(timestamp);
            }
            return parsedDate.toISOString();
        }
        
        return '';
    } catch (error) {
        console.error('Error parsing CAD date/time:', error, dateTimeStr);
        return '';
    }
}

/**
 * Apply CAD data to an existing incident
 * @param {Object} incident - The existing incident
 * @param {Object} cadData - The CAD data
 * @returns {Object} - The merged incident
 */
function applyCadToIncident(incident, cadData) {
    // Create a copy of the incident to avoid modifying the original
    const updatedIncident = JSON.parse(JSON.stringify(incident));
    
    // Add CAD information
    updatedIncident.cad_info = cadData.cad_info;
    
    // Update the incident with CAD data, but don't overwrite existing data
    // unless it came from CAD
    
    // Location - update if empty or if existing data is from CAD
    if (!updatedIncident.location.address || updatedIncident.location.source === 'CAD') {
        updatedIncident.location = {
            ...cadData.location,
            notes: updatedIncident.location.notes // Preserve any existing notes
        };
    }
    
    // Incident type - update if empty or if existing data is from CAD
    if (!updatedIncident.incident_type.primary || updatedIncident.incident_type.source === 'CAD') {
        updatedIncident.incident_type = cadData.incident_type;
    }
    
    // Caller info - update if empty or if existing data is from CAD
    if (!updatedIncident.caller_info.name || updatedIncident.caller_info.source === 'CAD') {
        updatedIncident.caller_info = cadData.caller_info;
    }
    
    // Dispatch times - use CAD times where available (but don't overwrite manually entered times)
    const dispatchFields = ['time_received', 'time_dispatched', 'time_enroute', 'time_arrived', 'time_cleared'];
    dispatchFields.forEach(field => {
        // Update if the field is empty, or if it was sourced from CAD
        const fieldSource = `${field}_source`;
        
        if (cadData.dispatch[field] && 
            (!updatedIncident.dispatch[field] || 
             updatedIncident.dispatch.source === 'CAD')) {
            updatedIncident.dispatch[field] = cadData.dispatch[field];
        }
    });
    
    // Update source to indicate mixed data
    updatedIncident.dispatch.source = 'mixed';
    
    // Units - merge CAD units with existing units
    const existingUnitIds = updatedIncident.units.map(unit => unit.id);
    const newUnits = cadData.units.filter(unit => !existingUnitIds.includes(unit.id));
    updatedIncident.units = [...updatedIncident.units, ...newUnits];
    
    // Update audit trail
    updatedIncident.audit.last_modified = new Date().toISOString();
    updatedIncident.audit.last_modified_by = 'CAD Import';
    updatedIncident.audit.access_log.push({
        user: 'CAD Import',
        timestamp: new Date().toISOString(),
        action: 'updated from CAD'
    });
    
    return updatedIncident;
}

/**
 * Create a UI component for CAD import
 * @returns {HTMLElement} - The CAD import UI element
 */
function createCadImportUI() {
    const container = document.createElement('div');
    container.className = 'cad-import-container';
    container.innerHTML = `
        <h3>Import From CAD</h3>
        <div class="cad-import-form">
            <div class="form-group">
                <label for="cad-file">CAD Export File</label>
                <input type="file" id="cad-file" accept=".csv,.json,.xml">
                <p class="file-hint">Supported formats: CSV, JSON, XML</p>
            </div>
            
            <div class="form-group">
                <label for="cad-import-mode">Import Mode</label>
                <select id="cad-import-mode">
                    <option value="new">Create New Incidents</option>
                    <option value="update">Update Existing Incident</option>
                </select>
            </div>
            
            <div id="cad-match-container" style="display:none;">
                <div class="form-group">
                    <label for="cad-match-id">Incident ID to Update</label>
                    <input type="text" id="cad-match-id" placeholder="e.g., INC-20250322-001">
                </div>
            </div>
            
            <div class="cad-import-actions">
                <button id="cad-import-btn" class="primary-btn">
                    <i class="fas fa-file-import"></i> Import CAD Data
                </button>
            </div>
        </div>
        
        <div id="cad-import-preview" style="display:none;">
            <h4>Import Preview</h4>
            <div id="cad-preview-content"></div>
            
            <div class="cad-import-actions">
                <button id="cad-apply-btn" class="primary-btn">
                    <i class="fas fa-check"></i> Apply CAD Data
                </button>
                <button id="cad-cancel-btn" class="secondary-btn">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners after the element is added to the DOM
    setTimeout(() => {
        // Import mode change
        const importMode = document.getElementById('cad-import-mode');
        const matchContainer = document.getElementById('cad-match-container');
        
        if (importMode && matchContainer) {
            importMode.addEventListener('change', function() {
                matchContainer.style.display = this.value === 'update' ? 'block' : 'none';
            });
        }
        
        // Import button
        const importBtn = document.getElementById('cad-import-btn');
        const fileInput = document.getElementById('cad-file');
        const previewSection = document.getElementById('cad-import-preview');
        const previewContent = document.getElementById('cad-preview-content');
        
        if (importBtn && fileInput && previewSection && previewContent) {
            importBtn.addEventListener('click', async function() {
                if (!fileInput.files || !fileInput.files[0]) {
                    showToast('Please select a CAD file to import', 'error');
                    return;
                }
                
                try {
                    // Show loading state
                    importBtn.disabled = true;
                    importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    
                    // Import the CAD data
                    const cadData = await importCadData(fileInput.files[0]);
                    
                    // Show preview
                    previewSection.style.display = 'block';
                    
                    // Create preview content
                    let previewHtml = '';
                    
                    if (cadData.length === 0) {
                        previewHtml = '<p>No incidents found in the CAD data.</p>';
                    } else {
                        previewHtml = `<p>Found ${cadData.length} incident(s) in the CAD data.</p>`;
                        
                        // Show preview table for the first few incidents
                        const previewCount = Math.min(cadData.length, 5);
                        previewHtml += '<div class="preview-table-container"><table class="preview-table">';
                        previewHtml += '<thead><tr><th>CAD ID</th><th>Time</th><th>Type</th><th>Address</th></tr></thead><tbody>';
                        
                        for (let i = 0; i < previewCount; i++) {
                            const incident = cadData[i];
                            previewHtml += `<tr>
                                <td>${incident.cad_info.cad_incident_id || 'N/A'}</td>
                                <td>${formatDateTime(incident.timestamp)}</td>
                                <td>${incident.incident_type.primary} - ${incident.incident_type.specific}</td>
                                <td>${incident.location.address}</td>
                            </tr>`;
                        }
                        
                        previewHtml += '</tbody></table></div>';
                        
                        if (cadData.length > previewCount) {
                            previewHtml += `<p>...and ${cadData.length - previewCount} more.</p>`;
                        }
                    }
                    
                    previewContent.innerHTML = previewHtml;
                    
                    // Store the imported data for later use
                    window.importedCadData = cadData;
                    
                } catch (error) {
                    console.error('CAD import error:', error);
                    showToast(`Error importing CAD data: ${error.message}`, 'error');
                    previewSection.style.display = 'none';
                } finally {
                    // Reset button
                    importBtn.disabled = false;
                    importBtn.innerHTML = '<i class="fas fa-file-import"></i> Import CAD Data';
                }
            });
        }
        
        // Apply button
        const applyBtn = document.getElementById('cad-apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', function() {
                const importMode = document.getElementById('cad-import-mode').value;
                const matchId = document.getElementById('cad-match-id')?.value;
                
                if (!window.importedCadData || window.importedCadData.length === 0) {
                    showToast('No CAD data to apply', 'error');
                    return;
                }
                
                if (importMode === 'update') {
                    // Update existing incident
                    if (!matchId) {
                        showToast('Please enter an incident ID to update', 'error');
                        return;
                    }
                    
                    // Find current incident
                    const currentIncident = getIncidentById(matchId);
                    if (!currentIncident) {
                        showToast(`Incident ${matchId} not found`, 'error');
                        return;
                    }
                    
                    // Find matching CAD data (use first record for now)
                    const cadData = window.importedCadData[0];
                    
                    // Apply CAD data to current incident
                    const updatedIncident = applyCadToIncident(currentIncident, cadData);
                    
                    // Save the updated incident
                    saveIncident(updatedIncident);
                    
                    showToast(`Incident ${matchId} updated with CAD data`, 'success');
                    
                    // Reload the form if we're editing this incident
                    if (window.currentIncident && window.currentIncident.id === matchId) {
                        loadIncidentIntoForm(updatedIncident);
                    }
                } else {
                    // Create new incidents
                    const created = [];
                    
                    // Create each incident from CAD data
                    for (const cadData of window.importedCadData) {
                        // Save the incident
                        saveIncident(cadData);
                        created.push(cadData.id);
                    }
                    
                    showToast(`Created ${created.length} new incidents from CAD data`, 'success');
                    
                    // Refresh the incident list if it's visible
                    if (document.getElementById('incident-list-container').style.display !== 'none') {
                        refreshIncidentList();
                    }
                }
                
                // Hide the preview section
                previewSection.style.display = 'none';
                
                // Clear the imported data
                window.importedCadData = null;
                
                // Clear the file input
                document.getElementById('cad-file').value = '';
            });
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cad-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                // Hide the preview section
                previewSection.style.display = 'none';
                
                // Clear the imported data
                window.importedCadData = null;
                
                // Clear the file input
                document.getElementById('cad-file').value = '';
            });
        }
    }, 0);
    
    return container;
}

/**
 * Format a date/time for display
 * @param {string} dateTimeStr - ISO date/time string
 * @returns {string} - Formatted date/time string
 */
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    
    try {
        const date = new Date(dateTimeStr);
        return date.toLocaleString();
    } catch (error) {
        return dateTimeStr;
    }
}

// Helper function to show a toast notification (simplified)
function showToast(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    // In a real implementation, this would show a UI toast notification
    // For now, we'll just use the console
}

// Helper function to get incident by ID (simplified)
function getIncidentById(incidentId) {
    // In a real implementation, this would fetch from storage
    // For this example, we'll just return from window.incidentList
    if (window.incidentList) {
        return window.incidentList.find(incident => incident.id === incidentId);
    }
    return null;
}

// Helper function to save incident (simplified)
function saveIncident(incident) {
    // In a real implementation, this would save to storage
    // For this example, we'll just update window.incidentList
    if (!window.incidentList) {
        window.incidentList = [];
    }
    
    const index = window.incidentList.findIndex(i => i.id === incident.id);
    if (index !== -1) {
        window.incidentList[index] = incident;
    } else {
        window.incidentList.push(incident);
    }
    
    console.log(`Saved incident: ${incident.id}`);
}

// Export the functions
export {
    importCadData,
    applyCadToIncident,
    createCadImportUI
};
