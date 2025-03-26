document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const fileInput = document.getElementById('data-file');
    const fileName = document.getElementById('file-name');
    const inputFormat = document.getElementById('input-format');
    const targetTool = document.getElementById('target-tool');
    const transformBtn = document.getElementById('transform-btn');
    const clearBtn = document.getElementById('clear-btn');
    const downloadBtn = document.getElementById('download-btn');
    const sendToToolBtn = document.getElementById('send-to-tool-btn');
    const inputPreview = document.getElementById('input-preview');
    const outputPreview = document.getElementById('output-preview');
    const logContainer = document.getElementById('log-container');
    const dateFormat = document.getElementById('date-format');
    const customDateFormat = document.getElementById('custom-date-format');
    const handleMissing = document.getElementById('handle-missing');
    const missingValuesOptions = document.querySelector('.missing-values-options');
    
    // Toggle elements
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedOptions = document.querySelector('.advanced-options');
    const requirementsToggle = document.getElementById('requirements-toggle');
    const requirementsContent = document.querySelector('.requirements-content');
    
    // Data storage
    let originalData = null;
    let transformedData = null;
    let fileType = null;
    let selectedTool = null;
    
    // Tool-specific field mappings and requirements
    const toolRequirements = {
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
        'isochrone': {
            requiredFields: [
                'Station ID', 'Station Name', 'Station Address',
                'Latitude', 'Longitude', 'Unit Types'
            ],
            coordinateFields: ['Latitude', 'Longitude'],
            optionalFields: ['Personnel Count', 'Station Type', 'Active Units']
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
        'coverage-gap': {
            requiredFields: [
                'Station ID', 'Station Name', 'Latitude', 'Longitude',
                'Coverage Area'
            ],
            coordinateFields: ['Latitude', 'Longitude'],
            optionalFields: ['Population Served', 'Response Time Target', 'Unit Types']
        },
        'station-overview': {
            requiredFields: [
                'Station ID', 'Station Name', 'Unit IDs',
                'Call Volume', 'Average Response Time'
            ],
            dateFields: ['Data Period Start', 'Data Period End'],
            timeFields: ['Average Response Time'],
            optionalFields: ['Personnel Count', 'Coverage Area', 'Utilization Rate']
        },
        'fire-map-pro': {
            requiredFields: [
                'Name', 'Type', 'Latitude', 'Longitude'
            ],
            coordinateFields: ['Latitude', 'Longitude'],
            optionalFields: ['Description', 'Icon Type', 'Color', 'Group']
        }
    };
    
    // Initialize event listeners
    function init() {
        // File upload handling
        fileInput.addEventListener('change', handleFileUpload);
        
        // Tool selection
        targetTool.addEventListener('change', handleToolSelection);
        
        // Button actions
        transformBtn.addEventListener('click', transformData);
        clearBtn.addEventListener('click', clearAll);
        downloadBtn.addEventListener('click', downloadData);
        sendToToolBtn.addEventListener('click', sendToTool);
        
        // Toggle sections
        advancedToggle.addEventListener('click', function() {
            advancedOptions.style.display = advancedOptions.style.display === 'none' ? 'block' : 'none';
            advancedToggle.classList.toggle('collapsed');
        });
        
        requirementsToggle.addEventListener('click', function() {
            requirementsContent.style.display = requirementsContent.style.display === 'none' ? 'block' : 'none';
            requirementsToggle.classList.toggle('collapsed');
        });
        
        // Advanced options handling
        dateFormat.addEventListener('change', function() {
            if (dateFormat.value === 'custom') {
                customDateFormat.style.display = 'block';
            } else {
                customDateFormat.style.display = 'none';
            }
        });
        
        handleMissing.addEventListener('change', function() {
            missingValuesOptions.style.display = handleMissing.checked ? 'block' : 'none';
        });
    }
    
    // Handle file upload
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        fileName.textContent = file.name;
        fileType = getFileType(file);
        
        // Auto-select input format based on file extension
        if (fileType) {
            inputFormat.value = fileType;
        }
        
        // Enable buttons
        transformBtn.disabled = false;
        clearBtn.disabled = false;
        
        // Read and parse the file
        readFile(file)
            .then(data => {
                originalData = data;
                displayInputPreview(data);
                appendLog('File loaded successfully: ' + file.name);
            })
            .catch(error => {
                appendLog('Error loading file: ' + error, 'error');
                console.error('Error loading file:', error);
            });
    }
    
    // Determine file type from extension
    function getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        switch (extension) {
            case 'csv':
                return 'csv';
            case 'xlsx':
            case 'xls':
                return 'excel';
            case 'json':
                return 'json';
            case 'xml':
                return 'xml';
            case 'kml':
            case 'kmz':
                return 'kml';
            default:
                return null;
        }
    }
    
    // Read file contents based on type
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    let data;
                    
                    // Parse based on detected file type
                    switch (fileType) {
                        case 'csv':
                            data = parseCSV(e.target.result);
                            break;
                        case 'excel':
                            // In a real implementation, we would use a library like SheetJS
                            // For now, just mock the data
                            appendLog('Excel parsing would require additional libraries in a production environment');
                            data = mockExcelData();
                            break;
                        case 'json':
                            data = JSON.parse(e.target.result);
                            break;
                        case 'xml':
                        case 'kml':
                            // Mock data for now
                            appendLog('XML/KML parsing would require additional processing in a production environment');
                            data = mockSpatialData();
                            break;
                        default:
                            throw new Error('Unsupported file type');
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function() {
                reject(new Error('File could not be read'));
            };
            
            if (fileType === 'csv' || fileType === 'json' || fileType === 'xml' || fileType === 'kml') {
                reader.readAsText(file);
            } else {
                // For binary files like Excel, we would use readAsArrayBuffer
                // For this demo, we'll still use readAsText
                reader.readAsText(file);
            }
        });
    }
    
    // Simple CSV parser (a real implementation would use a robust library)
    function parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            data.push(row);
        }
        
        return data;
    }
    
    // Generate mock Excel data for demo purposes
    function mockExcelData() {
        return [
            {
                "Incident ID": "INC-2024-001",
                "Incident Date": "01/15/2024",
                "Incident Time": "08:23:45",
                "Dispatch Time": "08:24:12",
                "En Route Time": "08:26:35",
                "On Scene Time": "08:32:18",
                "Incident Type": "Medical Emergency",
                "Latitude": "33.4484",
                "Longitude": "-112.0740",
                "Unit ID": "M23",
                "Priority": "1"
            },
            {
                "Incident ID": "INC-2024-002",
                "Incident Date": "01/15/2024",
                "Incident Time": "09:15:22",
                "Dispatch Time": "09:15:45",
                "En Route Time": "09:17:30",
                "On Scene Time": "09:22:55",
                "Incident Type": "Structure Fire",
                "Latitude": "33.4518",
                "Longitude": "-112.0658",
                "Unit ID": "E12",
                "Priority": "1"
            },
            {
                "Incident ID": "INC-2024-003",
                "Incident Date": "01/15/2024",
                "Incident Time": "10:05:18",
                "Dispatch Time": "10:06:05",
                "En Route Time": "10:08:23",
                "On Scene Time": "10:15:47",
                "Incident Type": "Traffic Accident",
                "Latitude": "33.4395",
                "Longitude": "-112.0891",
                "Unit ID": "R8",
                "Priority": "2"
            }
        ];
    }
    
    // Generate mock spatial data for demo purposes
    function mockSpatialData() {
        return [
            {
                "Name": "Station 1",
                "Type": "Fire Station",
                "Latitude": "33.4484",
                "Longitude": "-112.0740",
                "Description": "Downtown headquarters",
                "Units": "E1, L1, BC1"
            },
            {
                "Name": "Station 12",
                "Type": "Fire Station",
                "Latitude": "33.4518",
                "Longitude": "-112.0658",
                "Description": "North district station",
                "Units": "E12, M12"
            },
            {
                "Name": "Station 8",
                "Type": "Fire Station",
                "Latitude": "33.4395",
                "Longitude": "-112.0891",
                "Description": "West district station",
                "Units": "E8, R8, M8"
            }
        ];
    }
    
    // Display input data preview
    function displayInputPreview(data) {
        if (!data || data.length === 0) {
            inputPreview.innerHTML = '<div class="placeholder-message"><i class="fas fa-exclamation-circle"></i><p>No data to preview</p></div>';
            return;
        }
        
        // Create table header
        const headers = Object.keys(data[0]);
        let tableHTML = '<table class="preview-table"><thead><tr>';
        
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        
        tableHTML += '</tr></thead><tbody>';
        
        // Add table rows (up to 10 rows for preview)
        const maxRows = Math.min(data.length, 10);
        for (let i = 0; i < maxRows; i++) {
            tableHTML += '<tr>';
            headers.forEach(header => {
                tableHTML += `<td>${data[i][header] || ''}</td>`;
            });
            tableHTML += '</tr>';
        }
        
        tableHTML += '</tbody></table>';
        
        // If more than 10 rows, add a message
        if (data.length > 10) {
            tableHTML += `<div class="more-data-message">${data.length - 10} more rows (not shown in preview)</div>`;
        }
        
        inputPreview.innerHTML = tableHTML;
    }
    
    // Handle tool selection change
    function handleToolSelection() {
        selectedTool = targetTool.value;
        
        if (selectedTool) {
            // Update requirements display
            updateRequirementsDisplay(selectedTool);
            
            // Enable transform button if we have data
            if (originalData) {
                transformBtn.disabled = false;
            }
            
            appendLog(`Selected target tool: ${getToolName(selectedTool)}`);
        } else {
            transformBtn.disabled = true;
        }
    }
    
    // Update the requirements display based on selected tool
    function updateRequirementsDisplay(toolId) {
        // Show all requirement sections
        document.querySelectorAll('.tool-requirements').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show specific section for selected tool
        const requirementSection = document.getElementById(`${toolId}-requirements`);
        if (requirementSection) {
            requirementSection.style.display = 'block';
        } else {
            document.getElementById('other-requirements').style.display = 'block';
            
            // Create and show specific requirements if we have them
            if (toolRequirements[toolId]) {
                const otherReqs = document.getElementById('other-requirements');
                
                let html = `<h3>${getToolName(toolId)}</h3><p>Required fields:</p><ul>`;
                
                toolRequirements[toolId].requiredFields.forEach(field => {
                    html += `<li>${field}</li>`;
                });
                
                html += '</ul>';
                
                if (toolRequirements[toolId].optionalFields && toolRequirements[toolId].optionalFields.length > 0) {
                    html += '<p>Optional fields:</p><ul>';
                    toolRequirements[toolId].optionalFields.forEach(field => {
                        html += `<li>${field}</li>`;
                    });
                    html += '</ul>';
                }
                
                otherReqs.innerHTML = html;
            }
        }
        
        // Show the requirements section
        requirementsContent.style.display = 'block';
        requirementsToggle.classList.remove('collapsed');
    }
    
    // Get friendly tool name from ID
    function getToolName(toolId) {
        switch (toolId) {
            case 'response-time': return 'Response Time Analyzer';
            case 'isochrone': return 'Isochrone Map Generator';
            case 'call-density': return 'Call Density Heatmap';
            case 'incident-logger': return 'Incident Logger';
            case 'coverage-gap': return 'Coverage Gap Finder';
            case 'station-overview': return 'Station Overview';
            case 'fire-map-pro': return 'FireMapPro';
            default: return toolId;
        }
    }
    
    // Transform data for the selected tool
    function transformData() {
        if (!originalData || !selectedTool) {
            appendLog('Cannot transform: missing data or tool selection', 'error');
            return;
        }
        
        appendLog(`Starting transformation for ${getToolName(selectedTool)}...`);
        
        // Show processing indicator
        outputPreview.innerHTML = `
            <div class="placeholder-message">
                <div class="loading-spinner"></div>
                <p>Transforming data...</p>
            </div>
        `;
        
        // Simulate processing time
        setTimeout(() => {
            try {
                // Perform the actual transformation
                transformedData = performToolSpecificTransformation(originalData, selectedTool);
                
                // Display the transformed data
                displayOutputPreview(transformedData);
                
                // Enable download buttons
                downloadBtn.disabled = false;
                sendToToolBtn.disabled = false;
                
                appendLog(`Transformation complete: ${transformedData.length} records processed`, 'success');
                
                // Add transformation stats
                appendTransformationStats(originalData, transformedData);
            } catch (error) {
                appendLog(`Error during transformation: ${error.message}`, 'error');
                console.error('Transformation error:', error);
                
                outputPreview.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-exclamation-triangle" style="color: #d32f2f;"></i>
                        <p>Error during transformation</p>
                    </div>
                `;
            }
        }, 1500); // Simulate processing delay
    }
    
    // Perform tool-specific data transformation
    function performToolSpecificTransformation(data, toolId) {
        // Get tool requirements
        const requirements = toolRequirements[toolId];
        if (!requirements) {
            throw new Error(`No transformation rules defined for ${getToolName(toolId)}`);
        }
        
        // Clone data to avoid modifying original
        let transformedData = JSON.parse(JSON.stringify(data));
        
        // Step 1: Map fields based on heuristics
        transformedData = mapFieldsToRequirements(transformedData, requirements);
        
        // Step 2: Standardize formats
        transformedData = standardizeFormats(transformedData, requirements);
        
        // Step 3: Handle missing values if configured
        if (document.getElementById('handle-missing').checked) {
            transformedData = handleMissingValues(transformedData, requirements);
        }
        
        // Step 4: Remove duplicates if configured
        if (document.getElementById('remove-duplicates').checked) {
            transformedData = removeDuplicates(transformedData);
        }
        
        // Step 5: Apply compression if selected
        const compressionLevel = document.getElementById('compression').value;
        if (compressionLevel !== 'none') {
            transformedData = applyCompression(transformedData, compressionLevel);
        }
        
        // Step 6: Clean addresses if configured
        if (document.getElementById('clean-addresses').checked) {
            transformedData = cleanAddresses(transformedData);
        }
        
        return transformedData;
    }
    
    // Map fields from source data to required fields based on heuristics
    function mapFieldsToRequirements(data, requirements) {
        const requiredFields = requirements.requiredFields;
        const fieldMapping = {};
        const sourceFields = Object.keys(data[0]);
        
        // Step 1: Attempt exact matches
        requiredFields.forEach(reqField => {
            const exactMatch = sourceFields.find(srcField => 
                srcField.toLowerCase() === reqField.toLowerCase());
            
            if (exactMatch) {
                fieldMapping[reqField] = exactMatch;
            }
        });
        
        // Step 2: Attempt fuzzy matches for remaining fields
        requiredFields.forEach(reqField => {
            if (!fieldMapping[reqField]) {
                // Look for partial matches
                const fuzzyMatches = sourceFields.filter(srcField => 
                    srcField.toLowerCase().includes(reqField.toLowerCase()) ||
                    reqField.toLowerCase().includes(srcField.toLowerCase())
                );
                
                if (fuzzyMatches.length === 1) {
                    fieldMapping[reqField] = fuzzyMatches[0];
                    appendLog(`Mapped '${fuzzyMatches[0]}' to required field '${reqField}'`);
                } else if (fuzzyMatches.length > 1) {
                    // Use best match heuristic
                    const bestMatch = fuzzyMatches.sort((a, b) => 
                        // Shorter field name that contains the required field is probably better
                        (a.length - reqField.length) - (b.length - reqField.length)
                    )[0];
                    
                    fieldMapping[reqField] = bestMatch;
                    appendLog(`Multiple matches found for '${reqField}', using best match: '${bestMatch}'`);
                }
            }
        });
        
        // Step 3: Create placeholders for missing fields
        const missingFields = requiredFields.filter(field => !fieldMapping[field]);
        if (missingFields.length > 0) {
            missingFields.forEach(field => {
                appendLog(`Required field '${field}' not found in source data. Creating placeholder.`, 'warning');
                fieldMapping[field] = field; // Use the required field name as the field name
            });
        }
        
        // Apply the mapping and create new objects with required field names
        return data.map(item => {
            const newItem = {};
            
            // Add all required fields (mapped or placeholder)
            requiredFields.forEach(reqField => {
                const sourceField = fieldMapping[reqField];
                if (sourceField && item[sourceField] !== undefined) {
                    // Source field exists and has a value
                    newItem[reqField] = item[sourceField];
                } else {
                    // Source field doesn't exist or is empty
                    newItem[reqField] = '';
                }
            });
            
            // Add optional fields if they exist in source data
            if (requirements.optionalFields) {
                requirements.optionalFields.forEach(optField => {
                    const exactMatch = sourceFields.find(srcField => 
                        srcField.toLowerCase() === optField.toLowerCase());
                    
                    if (exactMatch && item[exactMatch] !== undefined) {
                        newItem[optField] = item[exactMatch];
                    }
                });
            }
            
            return newItem;
        });
    }
    
    // Standardize data formats based on field types
    function standardizeFormats(data, requirements) {
        return data.map(item => {
            const newItem = {...item};
            
            // Format date fields
            if (requirements.dateFields) {
                requirements.dateFields.forEach(field => {
                    if (newItem[field]) {
                        newItem[field] = standardizeDate(newItem[field]);
                    }
                });
            }
            
            // Format time fields
            if (requirements.timeFields) {
                requirements.timeFields.forEach(field => {
                    if (newItem[field]) {
                        newItem[field] = standardizeTime(newItem[field]);
                    }
                });
            }
            
            // Format coordinate fields
            if (requirements.coordinateFields) {
                requirements.coordinateFields.forEach(field => {
                    if (newItem[field]) {
                        newItem[field] = standardizeCoordinate(newItem[field]);
                    }
                });
            }
            
            return newItem;
        });
    }
    
    // Standardize date format (to YYYY-MM-DD)
    function standardizeDate(dateStr) {
        // Try to parse the date
        const formats = [
            // MM/DD/YYYY
            {
                regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                format: (match) => `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
            },
            // DD/MM/YYYY
            {
                regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
                format: (match) => `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
            },
            // YYYY-MM-DD (already standardized)
            {
                regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                format: (match) => `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
            }
        ];
        
        // Try each format until one works
        for (const format of formats) {
            const match = dateStr.match(format.regex);
            if (match) {
                return format.format(match);
            }
        }
        
        // If no format matched, return original
        return dateStr;
    }
    
    // Standardize time format (to HH:MM:SS)
    function standardizeTime(timeStr) {
        // Try to parse the time
        const formats = [
            // HH:MM:SS (already standardized)
            {
                regex: /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/,
                format: (match) => `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}:${match[3].padStart(2, '0')}`
            },
            // HH:MM
            {
                regex: /^(\d{1,2}):(\d{1,2})$/,
                format: (match) => `${match[1].padStart(2, '0')}:${match[2].padStart(2, '0')}:00`
            },
            // HHMM
            {
                regex: /^(\d{2})(\d{2})$/,
                format: (match) => `${match[1]}:${match[2]}:00`
            }
        ];
        
        // Try each format until one works
        for (const format of formats) {
            const match = timeStr.match(format.regex);
            if (match) {
                return format.format(match);
            }
        }
        
        // If no format matched, return original
        return timeStr;
    }
    
    // Standardize coordinate format (decimal degrees, 6 decimal places)
    function standardizeCoordinate(coordStr) {
        // Remove any non-numeric characters except decimal point and minus sign
        const cleanStr = coordStr.replace(/[^\d.-]/g, '');
        
        // Try to parse as float
        const coord = parseFloat(cleanStr);
        if (isNaN(coord)) {
            return coordStr;
        }
        
        // Format to 6 decimal places
        return coord.toFixed(6);
    }
    
    // Handle missing values based on strategy
    function handleMissingValues(data, requirements) {
        const strategy = document.getElementById('missing-strategy').value;
        const requiredFields = requirements.requiredFields;
        
        switch (strategy) {
            case 'remove-rows':
                // Remove rows with any missing required values
                return data.filter(item => {
                    return requiredFields.every(field => item[field] && item[field] !== '');
                });
                
            case 'fill-default':
                // Fill missing values with defaults
                return data.map(item => {
                    const newItem = {...item};
                    
                    requiredFields.forEach(field => {
                        if (!newItem[field] || newItem[field] === '') {
                            // Provide sensible defaults based on field name
                            if (requirements.dateFields && requirements.dateFields.includes(field)) {
                                newItem[field] = new Date().toISOString().split('T')[0]; // Today's date
                            } else if (requirements.timeFields && requirements.timeFields.includes(field)) {
                                newItem[field] = '00:00:00'; // Midnight
                            } else if (requirements.coordinateFields && requirements.coordinateFields.includes(field)) {
                                newItem[field] = '0.000000'; // Zero coordinate
                            } else if (field.toLowerCase().includes('id')) {
                                newItem[field] = 'UNKNOWN'; // ID fields
                            } else {
                                newItem[field] = '(Not provided)'; // Generic default
                            }
                        }
                    });
                    
                    return newItem;
                });
                
            case 'interpolate':
                // Simple "interpolation" - just copy from previous row
                // A real implementation would do proper interpolation where possible
                const newData = [...data];
                
                for (let i = 1; i < newData.length; i++) {
                    requiredFields.forEach(field => {
                        if (!newData[i][field] || newData[i][field] === '') {
                            if (newData[i-1][field] && newData[i-1][field] !== '') {
                                newData[i][field] = newData[i-1][field];
                            }
                        }
                    });
                }
                
                return newData;
                
            default:
                return data;
        }
    }
    
    // Remove duplicate entries
    function removeDuplicates(data) {
        // This is a simple implementation that considers all fields
        // A more sophisticated version would use specific key fields
        
        const uniqueMap = new Map();
        
        data.forEach(item => {
            // Create a string key from all values
            const key = JSON.stringify(item);
            uniqueMap.set(key, item);
        });
        
        const uniqueData = Array.from(uniqueMap.values());
        
        if (uniqueData.length < data.length) {
            appendLog(`Removed ${data.length - uniqueData.length} duplicate records`);
        }
        
        return uniqueData;
    }
    
    // Apply compression based on selected level
    function applyCompression(data, level) {
        // This is a simulation of compression - in real implementation,
        // this would use techniques like reducing decimal precision,
        // trimming strings, removing optional fields, etc.
        
        let compressionFactor = 0;
        
        switch (level) {
            case 'high':
                compressionFactor = 0.7; // 70% reduction
                break;
            case 'medium':
                compressionFactor = 0.5; // 50% reduction
                break;
            case 'light':
                compressionFactor = 0.3; // 30% reduction
                break;
            default:
                return data;
        }
        
        // Calculate original size
        const originalSize = new Blob([JSON.stringify(data)]).size;
        
        // Log the compression stats
        appendLog(`Applied ${level} compression (theoretical ${Math.round(compressionFactor * 100)}% reduction)`);
        appendLog(`Original data size: ${formatBytes(originalSize)}`);
        appendLog(`Estimated compressed size: ${formatBytes(originalSize * (1 - compressionFactor))}`);
        
        return data; // Return unchanged data since this is just a simulation
    }
    
    // Clean and standardize addresses
    function cleanAddresses(data) {
        // In a real implementation, this would:
        // 1. Standardize address formats
        // 2. Correct common abbreviations (St./Street, etc.)
        // 3. Fix capitalization
        // 4. Add missing postal codes or other components
        
        // For this demo, we'll just add a log message
        appendLog('Address standardization applied');
        
        return data;
    }
    
    // Display output data preview
    function displayOutputPreview(data) {
        if (!data || data.length === 0) {
            outputPreview.innerHTML = '<div class="placeholder-message"><i class="fas fa-exclamation-circle"></i><p>No data to preview</p></div>';
            return;
        }
        
        // Create table header
        const headers = Object.keys(data[0]);
        let tableHTML = '<table class="preview-table"><thead><tr>';
        
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        
        tableHTML += '</tr></thead><tbody>';
        
        // Add table rows (up to 10 rows for preview)
        const maxRows = Math.min(data.length, 10);
        for (let i = 0; i < maxRows; i++) {
            tableHTML += '<tr>';
            headers.forEach(header => {
                let cellClass = '';
                
                // Highlight fields based on status
                if (toolRequirements[selectedTool] && 
                    toolRequirements[selectedTool].requiredFields.includes(header)) {
                    cellClass = 'field-match';
                }
                
                tableHTML += `<td class="${cellClass}">${data[i][header] || ''}</td>`;
            });
            tableHTML += '</tr>';
        }
        
        tableHTML += '</tbody></table>';
        
        // If more than 10 rows, add a message
        if (data.length > 10) {
            tableHTML += `<div class="more-data-message">${data.length - 10} more rows (not shown in preview)</div>`;
        }
        
        outputPreview.innerHTML = tableHTML;
    }
    
    // Append transformation statistics
    function appendTransformationStats(original, transformed) {
        const requiredFields = toolRequirements[selectedTool].requiredFields;
        
        // Count missing values in required fields
        let missingBefore = 0;
        let missingAfter = 0;
        
        original.forEach(item => {
            requiredFields.forEach(field => {
                const sourceField = Object.keys(item).find(key => 
                    key.toLowerCase() === field.toLowerCase()
                );
                
                if (!sourceField || !item[sourceField]) {
                    missingBefore++;
                }
            });
        });
        
        transformed.forEach(item => {
            requiredFields.forEach(field => {
                if (!item[field]) {
                    missingAfter++;
                }
            });
        });
        
        appendLog(`Missing required values before: ${missingBefore}`);
        appendLog(`Missing required values after: ${missingAfter}`);
        
        if (missingBefore > missingAfter) {
            appendLog(`Fixed ${missingBefore - missingAfter} missing values`, 'success');
        }
        
        // Calculate size difference
        const sizeBefore = new Blob([JSON.stringify(original)]).size;
        const sizeAfter = new Blob([JSON.stringify(transformed)]).size;
        const sizeChange = sizeBefore - sizeAfter;
        
        appendLog(`Size before: ${formatBytes(sizeBefore)}`);
        appendLog(`Size after: ${formatBytes(sizeAfter)}`);
        
        if (sizeChange > 0) {
            appendLog(`Size reduction: ${formatBytes(sizeChange)} (${Math.round(sizeChange / sizeBefore * 100)}%)`, 'success');
        } else if (sizeChange < 0) {
            appendLog(`Size increase: ${formatBytes(-sizeChange)} (${Math.round(-sizeChange / sizeBefore * 100)}%)`, 'warning');
        }
    }
    
    // Format bytes to human-readable size
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    
    // Append message to log container
    function appendLog(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry', `log-${type}`);
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${message}`;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Remove placeholder text if present
        const placeholder = logContainer.querySelector('.log-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
    }
    
    // Clear all data and reset the UI
    function clearAll() {
        // Reset data
        originalData = null;
        transformedData = null;
        
        // Reset file input
        fileInput.value = '';
        fileName.textContent = 'No file selected';
        
        // Reset previews
        inputPreview.innerHTML = '<div class="placeholder-message"><i class="fas fa-arrow-up"></i><p>Upload a file to preview</p></div>';
        outputPreview.innerHTML = '<div class="placeholder-message"><i class="fas fa-arrow-left"></i><p>Transform data to preview</p></div>';
        
        // Reset log
        logContainer.innerHTML = '<p class="log-placeholder">Transformation details will appear here</p>';
        
        // Disable buttons
        transformBtn.disabled = true;
        clearBtn.disabled = true;
        downloadBtn.disabled = true;
        sendToToolBtn.disabled = true;
        
        appendLog('All data cleared');
    }
    
    // Download the transformed data
    function downloadData() {
        if (!transformedData) {
            appendLog('No transformed data to download', 'error');
            return;
        }
        
        const format = document.getElementById('output-format').value;
        let blob, filename;
        
        switch (format) {
            case 'csv':
                blob = new Blob([convertToCSV(transformedData)], { type: 'text/csv' });
                filename = `formatted_data_${selectedTool}.csv`;
                break;
                
            case 'excel':
                // In a real implementation, we would use a library like SheetJS
                // For this demo, we'll just use CSV
                blob = new Blob([convertToCSV(transformedData)], { type: 'text/csv' });
                filename = `formatted_data_${selectedTool}.csv`;
                appendLog('Excel export would require additional libraries in a production environment', 'warning');
                break;
                
            case 'json':
                blob = new Blob([JSON.stringify(transformedData, null, 2)], { type: 'application/json' });
                filename = `formatted_data_${selectedTool}.json`;
                break;
                
            default:
                blob = new Blob([JSON.stringify(transformedData)], { type: 'text/plain' });
                filename = `formatted_data_${selectedTool}.txt`;
        }
        
        // Create download link and trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        appendLog(`Downloaded data as ${filename}`);
    }
    
    // Convert JSON data to CSV
    function convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        let csv = headers.join(',') + '\n';
        
        data.forEach(item => {
            const row = headers.map(header => {
                // Handle values that need quotes
                let value = item[header] || '';
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            
            csv += row.join(',') + '\n';
        });
        
        return csv;
    }
    
    // Send data to the selected tool
    function sendToTool() {
        if (!transformedData || !selectedTool) {
            appendLog('Cannot send data: missing transformed data or tool selection', 'error');
            return;
        }
        
        // In a real implementation, this would send the data to the appropriate tool
        appendLog(`Sending formatted data to ${getToolName(selectedTool)}...`);
        
        // Store the data in sessionStorage for the target tool to access
        sessionStorage.setItem('formattedData', JSON.stringify(transformedData));
        sessionStorage.setItem('dataSource', 'formatter');
        
        // Simulate success message
        setTimeout(() => {
            appendLog(`Data successfully sent to ${getToolName(selectedTool)}`, 'success');
            
            // Offer to redirect to the tool
            const confirmRedirect = confirm(
                `Data is ready for use in ${getToolName(selectedTool)}.\n\nWould you like to open the tool now?`
            );
            
            if (confirmRedirect) {
                // Determine the URL for the selected tool
                let toolUrl;
                switch (selectedTool) {
                    case 'response-time':
                        toolUrl = '/fire-ems-dashboard';
                        break;
                    case 'isochrone':
                        toolUrl = '/isochrone-map';
                        break;
                    case 'call-density':
                        toolUrl = '/call-density-heatmap';
                        break;
                    case 'incident-logger':
                        toolUrl = '/incident-logger';
                        break;
                    case 'coverage-gap':
                        toolUrl = '/coverage-gap-finder';
                        break;
                    case 'station-overview':
                        toolUrl = '/station-overview';
                        break;
                    case 'fire-map-pro':
                        toolUrl = '/fire-map-pro';
                        break;
                    default:
                        toolUrl = '/';
                }
                
                // Redirect to the tool
                window.location.href = toolUrl;
            }
        }, 1500);
    }
    
    // Initialize the application
    init();
});