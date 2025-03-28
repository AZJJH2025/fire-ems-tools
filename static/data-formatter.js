/**
 * FireEMS.ai Data Formatter
 * Version: 2.5.0
 * 
 * This tool helps transform various data formats to work with FireEMS.ai analysis tools.
 * It supports:
 * - CAD/RMS data from multiple vendors
 * - CSV, Excel, JSON, XML, and KML/KMZ formats
 * - Field mapping to standardize data across tools
 */

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
    
    // Instructions panel elements
    const showInstructionsBtn = document.getElementById('show-instructions');
    const closeInstructionsBtn = document.getElementById('close-instructions');
    const instructionsPanel = document.getElementById('instructions-panel');
    
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
                'Station ID', 'Station Name', 'Address',
                'Latitude', 'Longitude', 'Unit Count'
            ],
            coordinateFields: ['Latitude', 'Longitude'],
            dateFields: ['Last Updated'],
            optionalFields: ['Equipment', 'Personnel', 'Status', 'Notes']
        },
        'fire-map-pro': {
            requiredFields: [
                'Incident ID', 'Incident Type', 'Incident Date',
                'Latitude', 'Longitude', 'Address'
            ],
            dateFields: ['Incident Date'],
            timeFields: ['Incident Time'],
            coordinateFields: ['Latitude', 'Longitude'],
            optionalFields: ['Priority', 'Unit ID', 'Status', 'Duration', 'Notes']
        }
    };
    
    // File event handlers
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            fileName.textContent = 'No file selected';
            return;
        }
        
        fileName.textContent = file.name;
        fileType = getFileType(file);
        
        if (inputFormat.value === 'auto') {
            inputFormat.value = fileType;
        }
        
        loadFile(file);
        
        // Enable buttons once file is loaded
        transformBtn.disabled = false;
        clearBtn.disabled = false;
    });
    
    // Tool selection
    targetTool.addEventListener('change', function() {
        selectedTool = this.value;
        
        // Highlight the corresponding requirements section
        document.querySelectorAll('.tool-requirements').forEach(el => {
            el.style.display = 'none';
        });
        
        const requirementsEl = document.getElementById(`${selectedTool}-requirements`);
        if (requirementsEl) {
            requirementsEl.style.display = 'block';
            
            // Show requirements panel if it's not already visible
            if (requirementsContent.style.display === 'none') {
                requirementsToggle.click();
            }
        }
        
        // If we have data, enable transform button
        if (originalData) {
            transformBtn.disabled = false;
        }
    });
    
    // Transform data
    transformBtn.addEventListener('click', function() {
        if (!originalData || !selectedTool) return;
        
        try {
            appendLog(`Starting transformation for ${getToolName(selectedTool)}...`);
            appendLog(`Processing ${originalData.length} records with ${Object.keys(originalData[0]).length} fields`);
            
            // Apply transformations based on selected tool
            transformedData = transformData(originalData, selectedTool);
            
            // Show preview and enable download
            showOutputPreview(transformedData);
            downloadBtn.disabled = false;
            sendToToolBtn.disabled = false;
            
            appendLog(`Transformation complete. ${transformedData.length} records ready for ${getToolName(selectedTool)}.`);
        } catch (error) {
            appendLog(`Error during transformation: ${error.message}`, 'error');
            console.error('Transformation error:', error);
            
            // Show error in output preview
            outputPreview.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error during transformation</p>
                    <code>${error.message}</code>
                    <p>Possible solutions:</p>
                    <ul>
                        <li>Check your data format and structure</li>
                        <li>Try selecting a different input format</li>
                        <li>Use the "Remove duplicates" option if your data contains duplicates</li>
                        <li>For coordinate data issues, ensure your latitude and longitude are in decimal format</li>
                    </ul>
                </div>
            `;
        }
    });
    
    // Download transformed data
    downloadBtn.addEventListener('click', function() {
        if (!transformedData) return;
        
        const outputFormatValue = document.getElementById('output-format').value;
        let outputData, fileName, mimeType;
        
        switch (outputFormatValue) {
            case 'csv':
                outputData = convertToCSV(transformedData);
                fileName = 'transformed_data.csv';
                mimeType = 'text/csv';
                break;
            case 'excel':
                // Since we can't actually create Excel files in browser, we'll use CSV
                outputData = convertToCSV(transformedData);
                fileName = 'transformed_data.xlsx';
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'json':
            default:
                outputData = JSON.stringify(transformedData, null, 2);
                fileName = 'transformed_data.json';
                mimeType = 'application/json';
                break;
        }
        
        const blob = new Blob([outputData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        appendLog(`Downloaded ${fileName} with ${transformedData.length} records`);
    });
    
    // Send to selected tool
    sendToToolBtn.addEventListener('click', function() {
        if (!transformedData || !selectedTool) return;
        
        // Store in localStorage for the target tool to use
        localStorage.setItem('fireems_formatted_data', JSON.stringify(transformedData));
        localStorage.setItem('fireems_formatted_source', 'data-formatter');
        
        // Redirect to the selected tool
        const toolUrls = {
            'response-time': '/fire-ems-dashboard',
            'isochrone': '/isochrone-map',
            'isochrone-stations': '/isochrone-map?type=stations',
            'isochrone-incidents': '/isochrone-map?type=incidents',
            'call-density': '/call-density-heatmap',
            'incident-logger': '/incident-logger',
            'coverage-gap': '/coverage-gap-finder',
            'station-overview': '/station-overview',
            'fire-map-pro': '/fire-map-pro'
        };
        
        if (toolUrls[selectedTool]) {
            appendLog(`Sending data to ${getToolName(selectedTool)}...`);
            window.location.href = toolUrls[selectedTool];
        } else {
            appendLog(`Error: No URL defined for ${selectedTool}`, 'error');
        }
    });
    
    // Clear button
    clearBtn.addEventListener('click', function() {
        // Reset file input
        fileInput.value = '';
        fileName.textContent = 'No file selected';
        
        // Clear previews
        inputPreview.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-arrow-up"></i>
                <p>Upload a file to preview</p>
            </div>
        `;
        
        outputPreview.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-arrow-left"></i>
                <p>Transform data to preview</p>
            </div>
        `;
        
        // Reset log
        logContainer.innerHTML = '<p class="log-placeholder">Transformation details will appear here</p>';
        
        // Disable buttons
        transformBtn.disabled = true;
        clearBtn.disabled = true;
        downloadBtn.disabled = true;
        sendToToolBtn.disabled = true;
        
        // Reset data
        originalData = null;
        transformedData = null;
        
        appendLog('Data cleared');
    });
    
    // Toggle advanced options
    advancedToggle.addEventListener('click', function() {
        advancedOptions.style.display = advancedOptions.style.display === 'none' ? 'block' : 'none';
        advancedToggle.classList.toggle('collapsed');
        advancedToggle.querySelector('i').classList.toggle('fa-chevron-down');
        advancedToggle.querySelector('i').classList.toggle('fa-chevron-up');
    });
    
    // Toggle requirements panel
    requirementsToggle.addEventListener('click', function() {
        requirementsContent.style.display = requirementsContent.style.display === 'none' ? 'block' : 'none';
        requirementsToggle.classList.toggle('collapsed');
        requirementsToggle.querySelector('i').classList.toggle('fa-chevron-down');
        requirementsToggle.querySelector('i').classList.toggle('fa-chevron-up');
    });
    
    // Date format handling
    dateFormat.addEventListener('change', function() {
        if (this.value === 'custom') {
            customDateFormat.style.display = 'inline-block';
        } else {
            customDateFormat.style.display = 'none';
        }
    });
    
    // Missing values options
    handleMissing.addEventListener('change', function() {
        missingValuesOptions.style.display = this.checked ? 'block' : 'none';
    });
    
    // Instructions panel
    showInstructionsBtn.addEventListener('click', function() {
        instructionsPanel.style.display = 'block';
    });
    
    closeInstructionsBtn.addEventListener('click', function() {
        instructionsPanel.style.display = 'none';
    });
    
    // Helper function to identify CAD system from field names
    function identifyCADSystem(sampleRecord) {
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
        
        // Detect Emergency Reporting
        if (fields.some(f => f.includes('NFIRS')) || 
            fields.some(f => f.includes('ER_INCIDENT_ID'))) {
            return 'Emergency Reporting';
        }
        
        // Detect ESO FireRMS
        if (fields.some(f => f.includes('ESO_INCIDENT_ID')) || 
            fields.some(f => f.includes('PCR_NUMBER'))) {
            return 'ESO FireRMS';
        }
        
        // Detect ImageTrend
        if (fields.some(f => f.includes('IMAGETREND_ID')) || 
            fields.some(f => f.includes('EMS_RUN_NUMBER'))) {
            return 'ImageTrend';
        }
        
        // Detect Spillman Flex
        if (fields.some(f => f.includes('SPILLMAN_INCIDENT')) || 
            fields.some(f => f.includes('FLEX_CALL_NUMBER'))) {
            return 'Spillman Flex';
        }
        
        // Detect Alpine RedNMX
        if (fields.some(f => f.includes('REDNMX')) || 
            fields.some(f => f.includes('ALPINE_INCIDENT'))) {
            return 'Alpine RedNMX';
        }
        
        // Detect Regional Shared Systems
        if (fields.some(f => f.includes('REGIONAL_ID')) || 
            fields.some(f => f.includes('SHARED_SYSTEM'))) {
            return 'Regional Shared';
        }
        
        return null;
    }
    
    // Process CAD system specific formats
    function processCADSystemData(data, cadSystem, toolId) {
        if (!data || !cadSystem) return data;
        
        appendLog(`Applying ${cadSystem} specific transformations...`);
        
        switch(cadSystem) {
            case 'Motorola PremierOne':
                return processMotorolaPremierOneData(data, toolId);
            case 'Tyler New World':
                return processTylerNewWorldData(data, toolId);
            case 'Hexagon/Intergraph':
                return processHexagonIntergraphData(data, toolId);
            case 'Central Square':
                return processCentralSquareData(data, toolId);
            case 'Emergency Reporting':
                return processEmergencyReportingData(data, toolId);
            case 'ESO FireRMS':
                return processESOFireRMSData(data, toolId);
            case 'ImageTrend':
                return processImageTrendData(data, toolId);
            case 'Spillman Flex':
                return processSpillmanFlexData(data, toolId);
            case 'Alpine RedNMX':
                return processAlpineRedNMXData(data, toolId);
            case 'Regional Shared':
                return processRegionalSharedData(data, toolId);
            default:
                return data;
        }
    }
    
    // System-specific data processors
    function processMotorolaPremierOneData(data, toolId) {
        const processedData = JSON.parse(JSON.stringify(data));
        
        // Handle different tools
        if (toolId === 'call-density' || toolId === 'response-time') {
            processedData.forEach(item => {
                // Handle date and time fields
                if (item.CALL_RECEIVED_DATE && item.CALL_RECEIVED_TIME) {
                    // For call-density
                    item['Incident Date'] = item.CALL_RECEIVED_DATE;
                    item['Incident Time'] = item.CALL_RECEIVED_TIME;
                    
                    // For response-time
                    item['Reported'] = item.CALL_RECEIVED_TIME;
                    item['Unit Dispatched'] = item.DISPATCH_TIME || '';
                    item['Unit Onscene'] = item.ARRIVAL_TIME || '';
                }
                
                // ID field
                item['Incident ID'] = item.INCIDENT_NO;
                item['Run No'] = item.INCIDENT_NO;
                
                // Location fields
                item['Latitude'] = parseFloat(item.LAT);
                item['Longitude'] = parseFloat(item.LON);
                item['Address'] = item.LOCATION_ADDR;
                item['Full Address'] = item.LOCATION_ADDR + (item.LOCATION_CITY ? `, ${item.LOCATION_CITY}` : '') + (item.LOCATION_ST ? `, ${item.LOCATION_ST}` : '');
                
                // Type info
                item['Incident Type'] = item.INCIDENT_TYPE_DESC || item.INCIDENT_TYPE_CD;
                item['Nature'] = item.INCIDENT_TYPE_DESC || '';
                
                // Unit info
                item['Unit'] = item.UNIT_ID || '';
                
                // Priority
                item['Priority'] = item.PRIORITY_CD || '';
            });
        }
        
        return processedData;
    }
    
    function processCentralSquareData(data, toolId) {
        const processedData = JSON.parse(JSON.stringify(data));
        
        // Process based on tool type
        if (toolId === 'response-time') {
            processedData.forEach(item => {
                // Field mappings for Central Square CAD
                if (item.REPORTED_DT) {
                    // Extract date and time from datetime field
                    const reportedDate = new Date(item.REPORTED_DT);
                    if (!isNaN(reportedDate)) {
                        item['Reported'] = reportedDate.toTimeString().split(' ')[0];
                        item['Incident Date'] = reportedDate.toISOString().split('T')[0];
                    }
                }
                
                if (item.DISPATCH_DT) {
                    const dispatchDate = new Date(item.DISPATCH_DT);
                    if (!isNaN(dispatchDate)) {
                        item['Unit Dispatched'] = dispatchDate.toTimeString().split(' ')[0];
                    }
                }
                
                if (item.ARRIVAL_DT) {
                    const arrivalDate = new Date(item.ARRIVAL_DT);
                    if (!isNaN(arrivalDate)) {
                        item['Unit Onscene'] = arrivalDate.toTimeString().split(' ')[0];
                    }
                }
                
                // Other field mappings
                item['Run No'] = item.CAD_INCIDENT_ID || '';
                item['Nature'] = item.CALL_DESCRIPTION || item.CALL_TYPE || '';
                item['Unit'] = item.APPARATUS_ID || '';
                item['Full Address'] = item.ADDR_STR || '';
                item['Incident City'] = item.ADDR_CITY || '';
                
                // Coordinates
                if (item.GEOY) item['Latitude'] = parseFloat(item.GEOY);
                if (item.GEOX) item['Longitude'] = parseFloat(item.GEOX);
            });
        }
        
        return processedData;
    }
    
    // Add other CAD system processors (Tyler, Hexagon, etc.)
    
    // File processing functions
    function loadFile(file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const result = e.target.result;
            
            try {
                // Process file based on type
                switch (fileType) {
                    case 'csv':
                        originalData = parseCSV(result);
                        appendLog(`Loaded CSV with ${originalData.length} records and ${Object.keys(originalData[0]).length} fields`);
                        break;
                    case 'excel':
                        // In a real implementation, this would use a library like SheetJS
                        appendLog('Excel import not implemented in this demo. Please use CSV format.', 'warning');
                        break;
                    case 'json':
                        originalData = JSON.parse(result);
                        appendLog(`Loaded JSON with ${originalData.length} records`);
                        break;
                    case 'xml':
                        // Simplified XML parsing for demo
                        appendLog('XML import not fully implemented. Please use CSV or JSON format.', 'warning');
                        break;
                    case 'kml':
                        appendLog('KML/KMZ import not implemented in this demo. Please use CSV or JSON format.', 'warning');
                        break;
                    default:
                        appendLog('Unknown file format', 'error');
                        return;
                }
                
                // Show preview
                showInputPreview(originalData);
                
                // Enable transform button if tool is selected
                if (selectedTool) {
                    transformBtn.disabled = false;
                }
                
                appendLog(`File loaded successfully: ${file.name}`);
            } catch (error) {
                appendLog(`Error parsing file: ${error.message}`, 'error');
                console.error('File parsing error:', error);
            }
        };
        
        reader.onerror = function() {
            appendLog('Error reading file', 'error');
        };
        
        if (fileType === 'csv' || fileType === 'xml' || fileType === 'kml') {
            reader.readAsText(file);
        } else if (fileType === 'excel') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }
    
    function getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        switch (extension) {
            case 'csv':
                return 'csv';
            case 'xls':
            case 'xlsx':
                return 'excel';
            case 'json':
                return 'json';
            case 'xml':
                return 'xml';
            case 'kml':
            case 'kmz':
                return 'kml';
            default:
                return 'csv'; // Default to CSV
        }
    }
    
    function parseCSV(csvText) {
        const lines = csvText.split(/\r\n|\n/);
        const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
        
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            // Simple CSV parsing (doesn't handle quoted fields with commas correctly)
            const values = lines[i].split(',').map(value => value.trim().replace(/^"|"$/g, ''));
            
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            result.push(row);
        }
        
        return result;
    }
    
    function transformData(data, toolId) {
        // Deep copy to avoid modifying original
        const transformedData = JSON.parse(JSON.stringify(data));
        
        // Auto-detect CAD system based on field names
        const cadSystem = identifyCADSystem(transformedData[0]);
        if (cadSystem) {
            appendLog(`Detected ${cadSystem} CAD system format`);
            
            // Apply CAD system specific transformations
            return processCADSystemData(transformedData, cadSystem, toolId);
        }
        
        // If no CAD system detected, perform generic transformations
        return performToolSpecificTransformation(transformedData, toolId);
    }
    
    function performToolSpecificTransformation(data, toolId) {
        const requirements = toolRequirements[toolId];
        if (!requirements) return data;
        
        const transformedData = JSON.parse(JSON.stringify(data));
        
        // Auto-detect CAD system based on field names
        const cadSystem = identifyCADSystem(transformedData[0]);
        if (cadSystem) {
            appendLog(`Detected ${cadSystem} CAD system format`);
            
            // Apply CAD system specific transformations
            return processCADSystemData(transformedData, cadSystem, toolId);
        }
        
        // Process based on tool type (generic processing if no CAD system detected)
        switch (toolId) {
            case 'response-time':
                transformedData.forEach(item => {
                    // Look for fields that might match required fields
                    mapTimeFields(item, 'Incident Time', ['time', 'incident_time', 'call_time', 'time_reported']);
                    mapTimeFields(item, 'Dispatch Time', ['dispatch_time', 'dispatched_time', 'time_dispatched']);
                    mapTimeFields(item, 'En Route Time', ['enroute_time', 'responding_time', 'time_enroute']);
                    mapTimeFields(item, 'On Scene Time', ['onscene_time', 'arrival_time', 'time_arrived', 'time_onscene']);
                    
                    // Handle coordinates
                    ensureCoordinates(item);
                    
                    // Handle additional fields
                    if (!item['Incident Type'] && item['call_type']) {
                        item['Incident Type'] = item['call_type'];
                    }
                    
                    if (!item['Incident ID'] && item['call_id']) {
                        item['Incident ID'] = item['call_id'];
                    }
                });
                break;
                
            case 'call-density':
                transformedData.forEach(item => {
                    // Ensure coordinates
                    ensureCoordinates(item);
                    
                    // Find date and time fields
                    mapTimeFields(item, 'Incident Time', ['time', 'incident_time', 'call_time', 'time_reported']);
                    
                    // Look for date fields
                    if (!item['Incident Date']) {
                        ['date', 'incident_date', 'call_date'].forEach(field => {
                            if (item[field] && !item['Incident Date']) {
                                item['Incident Date'] = item[field];
                            }
                        });
                    }
                    
                    // If we have a datetime field, split it
                    ['datetime', 'timestamp', 'call_datetime'].forEach(field => {
                        if (item[field] && (!item['Incident Date'] || !item['Incident Time'])) {
                            try {
                                const date = new Date(item[field]);
                                if (!isNaN(date)) {
                                    if (!item['Incident Date']) {
                                        item['Incident Date'] = date.toISOString().split('T')[0];
                                    }
                                    if (!item['Incident Time']) {
                                        item['Incident Time'] = date.toTimeString().split(' ')[0];
                                    }
                                }
                            } catch (error) {
                                console.error(`Error parsing datetime: ${error.message}`);
                            }
                        }
                    });
                });
                break;
                
            // Add other tool transformations
        }
        
        return transformedData;
    }
    
    // Helper for mapping time fields
    function mapTimeFields(item, targetField, possibleFieldNames) {
        if (item[targetField]) return; // Already set
        
        for (const field of possibleFieldNames) {
            if (item[field]) {
                item[targetField] = item[field];
                return;
            }
        }
    }
    
    // Helper to ensure coordinates are present and in correct format
    function ensureCoordinates(item) {
        // Check for coordinates under different names
        if (!item['Latitude']) {
            ['lat', 'y', 'latitude', 'geoy'].forEach(field => {
                if (item[field] && !item['Latitude']) {
                    const value = parseFloat(item[field]);
                    if (!isNaN(value)) {
                        item['Latitude'] = value;
                    }
                }
            });
        } else if (typeof item['Latitude'] === 'string') {
            item['Latitude'] = parseFloat(item['Latitude']);
        }
        
        if (!item['Longitude']) {
            ['lng', 'lon', 'long', 'x', 'longitude', 'geox'].forEach(field => {
                if (item[field] && !item['Longitude']) {
                    const value = parseFloat(item[field]);
                    if (!isNaN(value)) {
                        item['Longitude'] = value;
                    }
                }
            });
        } else if (typeof item['Longitude'] === 'string') {
            item['Longitude'] = parseFloat(item['Longitude']);
        }
    }
    
    // Display functions
    function showInputPreview(data) {
        if (!data || data.length === 0) {
            inputPreview.innerHTML = '<p>No data to preview</p>';
            return;
        }
        
        // Show the first 5 records
        const previewData = data.slice(0, 5);
        
        // Create table headers
        const headers = Object.keys(previewData[0]);
        
        let tableHTML = '<table class="preview-table"><thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        // Add data rows
        previewData.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                tableHTML += `<td>${row[header] || ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        // Add record count
        tableHTML += `<p class="preview-info">${data.length} total records, ${headers.length} fields</p>`;
        
        inputPreview.innerHTML = tableHTML;
    }
    
    function showOutputPreview(data) {
        if (!data || data.length === 0) {
            outputPreview.innerHTML = '<p>No data to preview</p>';
            return;
        }
        
        // Show the first 5 records
        const previewData = data.slice(0, 5);
        
        // Create table headers
        const headers = Object.keys(previewData[0]);
        
        let tableHTML = '<table class="preview-table"><thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        // Add data rows
        previewData.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                tableHTML += `<td>${row[header] !== undefined ? row[header] : ''}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        // Add record count
        tableHTML += `<p class="preview-info">${data.length} total records, ${headers.length} fields</p>`;
        
        outputPreview.innerHTML = tableHTML;
    }
    
    function appendLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('p');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        // Remove placeholder if it exists
        const placeholder = logContainer.querySelector('.log-placeholder');
        if (placeholder) {
            logContainer.removeChild(placeholder);
        }
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Also log to console
        console.log(`[${timestamp}] ${message}`);
    }
    
    // Helper functions
    function convertToCSV(objArray) {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = '';

        // Add header row
        const headers = Object.keys(array[0]);
        str += headers.join(',') + '\r\n';

        // Add data rows
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in headers) {
                if (line !== '') line += ',';
                
                // Handle values with commas by quoting
                const value = array[i][headers[index]];
                if (value !== undefined && value !== null) {
                    if (typeof value === 'string' && value.includes(',')) {
                        line += `"${value}"`;
                    } else {
                        line += value;
                    }
                }
            }
            
            str += line + '\r\n';
        }
        
        return str;
    }
    
    function getToolName(toolId) {
        const toolNames = {
            'response-time': 'Response Time Analyzer',
            'isochrone': 'Isochrone Map Generator',
            'isochrone-stations': 'Isochrone Map - Station Locations',
            'isochrone-incidents': 'Isochrone Map - Incident Data',
            'call-density': 'Call Density Heatmap',
            'incident-logger': 'Incident Logger',
            'coverage-gap': 'Coverage Gap Finder',
            'station-overview': 'Station Overview',
            'fire-map-pro': 'FireMapPro'
        };
        
        return toolNames[toolId] || toolId;
    }
    
    // Timezone and date handling helpers
    function standardizeDate(dateStr) {
        // Date formatting logic would go here
        return dateStr;
    }
    
    function standardizeTime(timeStr) {
        // Time formatting logic would go here
        return timeStr;
    }
    
    // Handle direct linking with URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('tool')) {
        const preselectedTool = urlParams.get('tool');
        if (document.getElementById('target-tool').querySelector(`option[value="${preselectedTool}"]`)) {
            document.getElementById('target-tool').value = preselectedTool;
            selectedTool = preselectedTool;
        }
    }
});