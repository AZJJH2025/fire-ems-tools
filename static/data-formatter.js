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
        },
        'isochrone-stations': {
            requiredFields: [
                'Station Name', 'Latitude', 'Longitude'
            ],
            coordinateFields: ['Latitude', 'Longitude'],
            optionalFields: ['Station ID', 'Address', 'Station Type', 'Coverage Area', 'Unit Types']
        },
        'isochrone-incidents': {
            requiredFields: [
                'Latitude', 'Longitude'
            ],
            coordinateFields: ['Latitude', 'Longitude'],
            optionalFields: ['Incident Type', 'Incident ID', 'Incident Date', 'Incident Time', 'Priority']
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
        
        // Instructions panel
        showInstructionsBtn.addEventListener('click', function() {
            instructionsPanel.style.display = 'block';
        });
        
        closeInstructionsBtn.addEventListener('click', function() {
            instructionsPanel.style.display = 'none';
        });
        
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
                            // Validate CSV content
                            if (!e.target.result || e.target.result.trim() === '') {
                                throw new Error('CSV file appears to be empty');
                            }
                            
                            // Check if file has headers and at least one row of data
                            const csvLines = e.target.result.split('\n').filter(line => line.trim() !== '');
                            if (csvLines.length < 2) {
                                throw new Error('CSV file must have headers and at least one data row');
                            }
                            
                            data = parseCSV(e.target.result);
                            appendLog(`Loaded CSV with ${data.length} records and ${Object.keys(data[0] || {}).length} fields`);
                            break;
                            
                        case 'excel':
                            // In a real implementation, we would use a library like SheetJS
                            // For now, just mock the data
                            appendLog('Excel parsing would require additional libraries in a production environment');
                            data = mockExcelData();
                            appendLog(`Loaded sample Excel data with ${data.length} records`);
                            break;
                            
                        case 'json':
                            // Validate JSON content
                            if (!e.target.result || e.target.result.trim() === '') {
                                throw new Error('JSON file appears to be empty');
                            }
                            
                            const parsedJson = JSON.parse(e.target.result);
                            
                            // Handle different JSON structures
                            if (Array.isArray(parsedJson)) {
                                // Array of objects format
                                data = parsedJson;
                            } else if (typeof parsedJson === 'object' && parsedJson !== null) {
                                // Object with data property containing array
                                if (Array.isArray(parsedJson.data)) {
                                    data = parsedJson.data;
                                } else if (Array.isArray(parsedJson.records)) {
                                    data = parsedJson.records;
                                } else if (Array.isArray(parsedJson.results)) {
                                    data = parsedJson.results;
                                } else if (Array.isArray(parsedJson.features)) {
                                    // GeoJSON format
                                    data = parsedJson.features.map(feature => ({
                                        ...feature.properties,
                                        latitude: feature.geometry?.coordinates?.[1],
                                        longitude: feature.geometry?.coordinates?.[0]
                                    }));
                                } else {
                                    // Create array from single object
                                    data = [parsedJson];
                                }
                            } else {
                                throw new Error('JSON data must contain an array of records');
                            }
                            
                            appendLog(`Loaded JSON with ${data.length} records`);
                            break;
                            
                        case 'xml':
                        case 'kml':
                            // Mock data for now
                            appendLog('XML/KML parsing would require additional processing in a production environment');
                            data = mockSpatialData();
                            appendLog(`Loaded sample ${fileType.toUpperCase()} data with ${data.length} records`);
                            break;
                            
                        default:
                            throw new Error('Unsupported file type');
                    }
                    
                    // Validate data structure
                    if (!Array.isArray(data) || data.length === 0) {
                        throw new Error('No valid data records found in file');
                    }
                    
                    // Check that data objects have properties
                    if (Object.keys(data[0]).length === 0) {
                        throw new Error('Data records do not contain any fields');
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
    
    // Improved CSV parser with support for quoted values and commas within fields
    function parseCSV(text) {
        const lines = text.split(/\r?\n/);  // Handle both CRLF and LF line endings
        
        // Function to parse a single line, handling quoted values
        function parseLine(line) {
            const values = [];
            let currentValue = '';
            let insideQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                
                if (char === '"') {
                    // Handle escaped quotes (double quotes)
                    if (insideQuotes && line[i + 1] === '"') {
                        currentValue += '"';
                        i++; // Skip the next quote
                    } else {
                        // Toggle quote state
                        insideQuotes = !insideQuotes;
                    }
                } else if (char === ',' && !insideQuotes) {
                    // End of field
                    values.push(currentValue.trim());
                    currentValue = '';
                } else {
                    // Regular character
                    currentValue += char;
                }
            }
            
            // Don't forget the last value
            values.push(currentValue.trim());
            
            return values;
        }
        
        // Parse headers
        let headers = parseLine(lines[0]);
        
        // Create clean, unique headers
        headers = headers.map((header, index) => {
            // Remove quotes if present
            let cleanHeader = header.replace(/^"(.*)"$/, '$1').trim();
            
            // If header is empty, create a placeholder
            if (!cleanHeader) {
                cleanHeader = `Column_${index + 1}`;
            }
            
            return cleanHeader;
        });
        
        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = parseLine(lines[i]);
            
            // Skip rows with fewer values than expected
            if (values.length < Math.max(1, headers.length / 2)) {
                continue;
            }
            
            const row = {};
            
            // Map values to headers
            headers.forEach((header, index) => {
                let value = values[index] || '';
                
                // Remove quotes from values if present
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                
                // Try to convert numeric values
                if (/^-?\d+(\.\d+)?$/.test(value)) {
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                        value = num;
                    }
                }
                
                row[header] = value;
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
    
    // Create sample data for Response Time Analyzer
    function createSampleResponseTimeData() {
        return [
            {
                "Run No": "INC-2024-001",
                "Reported": "2024-01-15T08:23:45.000Z",
                "Unit Dispatched": "2024-01-15T08:24:12.000Z",
                "Unit Enroute": "2024-01-15T08:26:35.000Z",
                "Unit Onscene": "2024-01-15T08:32:18.000Z",
                "Incident Type": "Medical Emergency",
                "Latitude": 33.4484,
                "Longitude": -112.0740,
                "Unit": "M23",
                "Incident City": "Phoenix",
                "Full Address": "123 Main St, Phoenix, AZ",
                "Response Time (min)": 8
            },
            {
                "Run No": "INC-2024-002",
                "Reported": "2024-01-15T09:15:22.000Z",
                "Unit Dispatched": "2024-01-15T09:15:45.000Z",
                "Unit Enroute": "2024-01-15T09:17:30.000Z",
                "Unit Onscene": "2024-01-15T09:22:55.000Z",
                "Incident Type": "Structure Fire",
                "Latitude": 33.4518,
                "Longitude": -112.0658,
                "Unit": "E12",
                "Incident City": "Phoenix",
                "Full Address": "456 Oak Ave, Phoenix, AZ",
                "Response Time (min)": 7
            },
            {
                "Run No": "INC-2024-003",
                "Reported": "2024-01-15T10:05:18.000Z",
                "Unit Dispatched": "2024-01-15T10:06:05.000Z",
                "Unit Enroute": "2024-01-15T10:08:23.000Z",
                "Unit Onscene": "2024-01-15T10:15:47.000Z",
                "Incident Type": "Traffic Accident",
                "Latitude": 33.4395,
                "Longitude": -112.0891,
                "Unit": "R8",
                "Incident City": "Phoenix",
                "Full Address": "789 Elm Blvd, Phoenix, AZ",
                "Response Time (min)": 10
            },
            {
                "Run No": "INC-2024-004",
                "Reported": "2024-01-15T11:30:10.000Z",
                "Unit Dispatched": "2024-01-15T11:31:22.000Z",
                "Unit Enroute": "2024-01-15T11:33:45.000Z",
                "Unit Onscene": "2024-01-15T11:38:12.000Z",
                "Incident Type": "Medical Emergency",
                "Latitude": 33.4562,
                "Longitude": -112.0712,
                "Unit": "M15",
                "Incident City": "Phoenix",
                "Full Address": "101 Pine St, Phoenix, AZ",
                "Response Time (min)": 7
            },
            {
                "Run No": "INC-2024-005",
                "Reported": "2024-01-15T13:45:30.000Z",
                "Unit Dispatched": "2024-01-15T13:46:10.000Z",
                "Unit Enroute": "2024-01-15T13:48:25.000Z",
                "Unit Onscene": "2024-01-15T13:53:40.000Z",
                "Incident Type": "Gas Leak",
                "Latitude": 33.4427,
                "Longitude": -112.0819,
                "Unit": "E7",
                "Incident City": "Phoenix",
                "Full Address": "222 Maple Dr, Phoenix, AZ",
                "Response Time (min)": 8
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
    
    // Function to ensure consistent tool ID format
    function normalizeToolId(toolId) {
        // Make sure we're using the correct IDs that match with the receiving tools
        const toolMap = {
            'response-time': 'response-time',
            'isochrone': 'isochrone',
            'call-density': 'call-density',
            'incident-logger': 'incident-logger',
            'coverage-gap': 'coverage-gap',
            'station-overview': 'station-overview',
            'fire-map-pro': 'fire-map-pro'
        };
        
        return toolMap[toolId] || toolId;
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
        
        // Create a safe copy of the original data to prevent mutation issues
        let dataCopy;
        try {
            dataCopy = JSON.parse(JSON.stringify(originalData));
        } catch (error) {
            appendLog(`Error creating data copy: ${error.message}. Using original data.`, 'warning');
            dataCopy = originalData;
        }
        
        // Add a small processing delay to allow UI updates
        setTimeout(() => {
            try {
                // First, validate the data
                if (!Array.isArray(dataCopy)) {
                    throw new Error('Data must be an array of records');
                }
                
                if (dataCopy.length === 0) {
                    throw new Error('No data records to process');
                }
                
                // Log data structure for debugging
                appendLog(`Processing ${dataCopy.length} records with ${Object.keys(dataCopy[0]).length} fields`);
                
                // Perform the actual transformation with enhanced error handling
                transformedData = performToolSpecificTransformation(dataCopy, selectedTool);
                
                // Verify the transformation result
                if (!transformedData || !Array.isArray(transformedData)) {
                    throw new Error('Transformation did not produce valid data');
                }
                
                // Display the transformed data
                displayOutputPreview(transformedData);
                
                // Enable download buttons
                downloadBtn.disabled = false;
                sendToToolBtn.disabled = false;
                
                appendLog(`Transformation complete: ${transformedData.length} records processed`, 'success');
                
                // Add transformation stats
                appendTransformationStats(dataCopy, transformedData);
            } catch (error) {
                appendLog(`Error during transformation: ${error.message}`, 'error');
                console.error('Transformation error:', error);
                
                // Display detailed error information for troubleshooting
                let errorInfo = error.stack ? error.stack.split('\n')[0] : error.message;
                
                outputPreview.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-exclamation-triangle" style="color: #d32f2f;"></i>
                        <p>Error during transformation</p>
                        <div style="margin-top: 10px; font-size: 0.8rem; color: #777; text-align: left;">
                            <code>${errorInfo}</code>
                            <p style="margin-top: 10px;">Possible solutions:</p>
                            <ul style="text-align: left;">
                                <li>Check your data format and structure</li>
                                <li>Try selecting a different input format</li>
                                <li>Use the "Remove duplicates" option if your data contains duplicates</li>
                                <li>For coordinate data issues, ensure your latitude and longitude are in decimal format</li>
                            </ul>
                        </div>
                    </div>
                `;
            }
        }, 500);
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
        
        // Special handling for Central Square CAD data
        if (transformedData.length > 0) {
            const firstRecord = transformedData[0];
            const isCentralSquare = detectCentralSquareFormat(firstRecord);
            
            if (isCentralSquare) {
                appendLog("Detected Central Square CAD format - applying special handling");
                console.log("Pre-processing Central Square CAD data");
                transformedData = processCentralSquareData(transformedData, toolId);
            }
        }
        
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
            try {
                const newItem = {...item};
                
                // Format date fields
                if (requirements.dateFields) {
                    requirements.dateFields.forEach(field => {
                        try {
                            if (newItem[field] !== undefined && newItem[field] !== null && newItem[field] !== '') {
                                newItem[field] = standardizeDate(newItem[field]);
                            }
                        } catch (err) {
                            console.warn(`Error standardizing date field '${field}':`, err);
                        }
                    });
                }
                
                // Format time fields
                if (requirements.timeFields) {
                    requirements.timeFields.forEach(field => {
                        try {
                            if (newItem[field] !== undefined && newItem[field] !== null && newItem[field] !== '') {
                                newItem[field] = standardizeTime(newItem[field]);
                            }
                        } catch (err) {
                            console.warn(`Error standardizing time field '${field}':`, err);
                        }
                    });
                }
                
                // Format coordinate fields
                if (requirements.coordinateFields) {
                    requirements.coordinateFields.forEach(field => {
                        try {
                            if (newItem[field] !== undefined && newItem[field] !== null && newItem[field] !== '') {
                                newItem[field] = standardizeCoordinate(newItem[field]);
                            }
                        } catch (err) {
                            console.warn(`Error standardizing coordinate field '${field}':`, err);
                        }
                    });
                }
                
                return newItem;
            } catch (error) {
                console.error("Error in standardization, returning original item:", error);
                return item; // Return original item if standardization fails
            }
        });
    }
    
    // Standardize date format (to YYYY-MM-DD)
    function standardizeDate(dateValue) {
        // If it's already a Date object
        if (dateValue instanceof Date) {
            return dateValue.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        
        // If it's a number (timestamp), convert to date
        if (typeof dateValue === 'number') {
            return new Date(dateValue).toISOString().split('T')[0];
        }
        
        // If it's not a string, return as is
        if (typeof dateValue !== 'string') {
            return dateValue;
        }
        
        const dateStr = dateValue.trim();
        
        // Try to use the browser's built-in date parsing first for common formats
        try {
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate) && parsedDate.getFullYear() > 1900) {
                return parsedDate.toISOString().split('T')[0];
            }
        } catch (e) {
            // Continue with our manual parsing if built-in parsing fails
        }
        
        // Define common date formats
        const formats = [
            // MM/DD/YYYY
            {
                regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                format: (match) => `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
            },
            // DD/MM/YYYY
            {
                regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                format: (match) => `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
            },
            // MM-DD-YYYY
            {
                regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
                format: (match) => `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
            },
            // DD-MM-YYYY
            {
                regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
                format: (match) => `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
            },
            // YYYY-MM-DD (already standardized)
            {
                regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                format: (match) => `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
            },
            // YYYY/MM/DD
            {
                regex: /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
                format: (match) => `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
            },
            // MM.DD.YYYY
            {
                regex: /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
                format: (match) => `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
            },
            // YYYY.MM.DD
            {
                regex: /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/,
                format: (match) => `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
            },
            // Month DD, YYYY (e.g., "January 1, 2023")
            {
                regex: /^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
                format: (match) => {
                    const months = {
                        january: '01', february: '02', march: '03', april: '04',
                        may: '05', june: '06', july: '07', august: '08',
                        september: '09', october: '10', november: '11', december: '12'
                    };
                    const month = months[match[1].toLowerCase()];
                    return month ? `${match[3]}-${month}-${match[2].padStart(2, '0')}` : dateStr;
                }
            }
        ];
        
        // Try each format until one works
        for (const format of formats) {
            const match = dateStr.match(format.regex);
            if (match) {
                try {
                    const formatted = format.format(match);
                    // Verify it's a valid date by parsing it
                    const testDate = new Date(formatted);
                    if (!isNaN(testDate) && testDate.getFullYear() > 1900) {
                        return formatted;
                    }
                } catch (e) {
                    // Continue to next format if this fails
                }
            }
        }
        
        // If all else fails, return original
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
    function standardizeCoordinate(coordValue) {
        // Handle case where coordinate is already a number
        if (typeof coordValue === 'number') {
            // Format to 6 decimal places
            return coordValue.toFixed(6);
        }
        
        // If it's not a string or number, return as is
        if (typeof coordValue !== 'string') {
            return coordValue;
        }
        
        // For strings, clean up first
        try {
            // Remove any non-numeric characters except decimal point and minus sign
            const cleanStr = coordValue.replace(/[^\d.-]/g, '');
            
            // Try to parse as float
            const coord = parseFloat(cleanStr);
            if (isNaN(coord)) {
                return coordValue;
            }
            
            // Format to 6 decimal places
            return coord.toFixed(6);
        } catch (e) {
            // If any error occurs during processing, return the original value
            console.warn('Error standardizing coordinate:', e);
            return coordValue;
        }
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
        let blob, filename, timestamp;
        
        // Add timestamp to filename for uniqueness
        timestamp = new Date().toISOString().replace(/[-:]/g, '').substring(0, 15);
        
        // Show loading message for large datasets
        if (transformedData.length > 1000) {
            appendLog(`Preparing download for ${transformedData.length} records...`);
        }
        
        // Create a safe filename based on the selected tool
        const toolName = selectedTool ? selectedTool.replace(/[^a-z0-9]/gi, '_') : 'data';
        
        try {
            switch (format) {
                case 'csv':
                    blob = new Blob([convertToCSV(transformedData)], { type: 'text/csv' });
                    filename = `fireems_${toolName}_${timestamp}.csv`;
                    break;
                    
                case 'excel':
                    // In a real implementation, we would use a library like SheetJS
                    // For this demo, we'll just use CSV
                    blob = new Blob([convertToCSV(transformedData)], { type: 'text/csv' });
                    filename = `fireems_${toolName}_${timestamp}.csv`;
                    appendLog('Excel export would require additional libraries in a production environment. Exporting as CSV instead.', 'warning');
                    break;
                    
                case 'json':
                    let jsonStr;
                    
                    // Handle large datasets more efficiently
                    if (transformedData.length > 5000) {
                        // Without pretty-printing for large datasets
                        jsonStr = JSON.stringify(transformedData);
                    } else {
                        // With pretty-printing for smaller datasets
                        jsonStr = JSON.stringify(transformedData, null, 2);
                    }
                    
                    blob = new Blob([jsonStr], { type: 'application/json' });
                    filename = `fireems_${toolName}_${timestamp}.json`;
                    break;
                    
                default:
                    blob = new Blob([JSON.stringify(transformedData)], { type: 'text/plain' });
                    filename = `fireems_${toolName}_${timestamp}.txt`;
            }
            
            // Create download link and trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);
            
            appendLog(`Downloaded data as ${filename} (${formatBytes(blob.size)})`, 'success');
        } catch (error) {
            appendLog(`Error during file download: ${error.message}`, 'error');
            console.error('Download error:', error);
        }
    }
    
    // Convert JSON data to CSV
    function convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        try {
            // Get all unique headers from all objects
            const headerSet = new Set();
            data.forEach(item => {
                Object.keys(item).forEach(key => headerSet.add(key));
            });
            
            const headers = Array.from(headerSet);
            
            // Create CSV header row
            let csv = headers.map(header => {
                // Escape header if it contains special characters
                if (header.includes(',') || header.includes('"') || header.includes('\n')) {
                    return '"' + header.replace(/"/g, '""') + '"';
                }
                return header;
            }).join(',') + '\n';
            
            // Process data in chunks for large datasets
            const chunkSize = 500;
            const chunks = Math.ceil(data.length / chunkSize);
            
            for (let c = 0; c < chunks; c++) {
                const start = c * chunkSize;
                const end = Math.min(start + chunkSize, data.length);
                
                for (let i = start; i < end; i++) {
                    const item = data[i];
                    const row = headers.map(header => {
                        // Handle missing values
                        let value = item[header];
                        
                        if (value === undefined || value === null) {
                            return '';
                        }
                        
                        // Convert non-string values
                        if (typeof value !== 'string') {
                            if (typeof value === 'object') {
                                value = JSON.stringify(value);
                            } else {
                                value = String(value);
                            }
                        }
                        
                        // Handle values that need quotes
                        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                            value = '"' + value.replace(/"/g, '""') + '"';
                        }
                        
                        return value;
                    }).join(',');
                    
                    csv += row + '\n';
                }
            }
            
            return csv;
        } catch (error) {
            console.error('Error converting to CSV:', error);
            appendLog('Error converting data to CSV', 'error');
            throw error;
        }
    }
    
    // Send data to the selected tool
    function sendToTool() {
        if (!transformedData || !selectedTool) {
            appendLog('Cannot send data: missing transformed data or tool selection', 'error');
            return;
        }
        
        try {
            // Show processing indicator
            const processingStatus = document.createElement('div');
            processingStatus.innerHTML = `
                <div style="display: flex; align-items: center; margin: 15px 0; padding: 10px; background-color: #e3f2fd; border-radius: 4px;">
                    <div class="loading-spinner"></div>
                    <span>Sending data to ${getToolName(selectedTool)}...</span>
                </div>
            `;
            document.querySelector('.download-section').appendChild(processingStatus);
            
            // Ensure data is in the proper format for the selected tool
            let preparedData = prepareDataForTool(transformedData, selectedTool);
            
            // Compress large datasets for storage
            let dataToStore;
            if (preparedData.length > 1000) {
                appendLog(`Large dataset detected (${preparedData.length} records). Optimizing for transfer...`);
                
                // Store an abbreviated version for large datasets to prevent session storage limits
                // In a real implementation, this would use proper compression
                
                // Keep only essential fields
                const requirements = toolRequirements[selectedTool];
                if (requirements && requirements.requiredFields) {
                    // Create a list of critical fields that must be preserved for Response Time Analyzer
                    const criticalTimeFields = [
                        'Unit', 'Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene',
                        'Response Time (min)', 'Latitude', 'Longitude', 'Run No', 'Incident City',
                        'Full Address', 'Incident Type', '_source', '_formatted', '_timestamp'
                    ];
                    
                    preparedData = preparedData.map(item => {
                        const essentialItem = {};
                        
                        // Special handling for Response Time Analyzer - preserve all time-related fields
                        if (selectedTool === 'response-time') {
                            criticalTimeFields.forEach(field => {
                                if (item[field] !== undefined) {
                                    essentialItem[field] = item[field];
                                }
                            });
                        } else {
                            // Standard handling for other tools
                            
                            // Include required fields
                            requirements.requiredFields.forEach(field => {
                                essentialItem[field] = item[field];
                            });
                            
                            // Add a few optional fields if present
                            if (requirements.optionalFields && requirements.optionalFields.length > 0) {
                                const optionalFieldsToInclude = requirements.optionalFields.slice(0, 3); // Limit to first 3 optional fields
                                optionalFieldsToInclude.forEach(field => {
                                    if (item[field] !== undefined) {
                                        essentialItem[field] = item[field];
                                    }
                                });
                            }
                        }
                        
                        // Always preserve metadata fields
                        if (item._source) essentialItem._source = item._source;
                        if (item._formatted) essentialItem._formatted = item._formatted;
                        if (item._timestamp) essentialItem._timestamp = item._timestamp;
                        
                        return essentialItem;
                    });
                    
                    // Log the first record after optimization for debugging
                    if (preparedData.length > 0) {
                        console.log("First record after optimization:", preparedData[0]);
                    }
                    
                    appendLog(`Data optimized: Keeping only essential fields for ${selectedTool}`);
                }
                
                // For extremely large datasets, sample the data
                if (preparedData.length > 5000) {
                    const sampleSize = 5000;
                    const sampledData = [];
                    
                    // Take a statistically valid sample
                    const interval = Math.floor(preparedData.length / sampleSize);
                    for (let i = 0; i < preparedData.length; i += interval) {
                        sampledData.push(preparedData[i]);
                        if (sampledData.length >= sampleSize) break;
                    }
                    
                    dataToStore = {
                        data: sampledData,
                        meta: {
                            originalSize: preparedData.length,
                            sampled: true,
                            sampleRatio: sampledData.length / preparedData.length
                        }
                    };
                    
                    appendLog(`Data sampled: Using ${sampledData.length} representative records out of ${preparedData.length}`);
                } else {
                    dataToStore = { data: preparedData, meta: { originalSize: preparedData.length } };
                }
            } else {
                dataToStore = { data: preparedData, meta: { originalSize: preparedData.length } };
            }
            
            // Store the data in sessionStorage for the target tool to access
            const normalizedTool = normalizeToolId(selectedTool);
            sessionStorage.setItem('formattedData', JSON.stringify(dataToStore));
            sessionStorage.setItem('dataSource', 'formatter');
            sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
            sessionStorage.setItem('formatterToolId', normalizedTool);
            sessionStorage.setItem('formatterTarget', normalizedTool);
            
            // Log for debugging
            console.log("Data stored in sessionStorage with toolId:", selectedTool);
            
            // Remove processing indicator
            setTimeout(() => {
                document.querySelector('.download-section').removeChild(processingStatus);
                
                appendLog(`Data successfully prepared for ${getToolName(selectedTool)} (${formatBytes(JSON.stringify(dataToStore).length)})`, 'success');
                
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
                    
                    // Add a query parameter to indicate data is available
                    toolUrl += `?source=formatter&ts=${Date.now()}`;
                    
                    console.log(`Redirecting to ${toolUrl} with data for ${normalizedTool}`);
                    console.log("SessionStorage contents:", {
                        formattedData: "LARGE_DATA_OBJECT",
                        dataSource: sessionStorage.getItem('dataSource'),
                        formatterToolId: sessionStorage.getItem('formatterToolId'),
                        formatterTarget: sessionStorage.getItem('formatterTarget')
                    });
                    
                    // Redirect to the tool
                    window.location.href = toolUrl;
                }
            }, 1500);
        } catch (error) {
            appendLog(`Error while preparing data for selected tool: ${error.message}`, 'error');
            console.error('Error sending to tool:', error);
        }
    }
    
    // Additional preparation of data based on specific tool requirements
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
                        
                        // Calculate response times if missing but component times are available
                        const missingResponseTime = !item['Response Time (min)'];
                        const hasDispatchTime = item['Unit Dispatched'] !== undefined && item['Unit Dispatched'] !== '';
                        const hasOnSceneTime = item['Unit Onscene'] !== undefined && item['Unit Onscene'] !== '';
                        
                        if (missingResponseTime && hasDispatchTime && hasOnSceneTime) {
                            try {
                                // Parse times - converting them to Date objects for calculation
                                const dispatchTime = new Date(item['Unit Dispatched']);
                                const onSceneTime = new Date(item['Unit Onscene']);
                                
                                // Calculate if we have valid times
                                if (!isNaN(dispatchTime) && !isNaN(onSceneTime)) {
                                    // Calculate minutes
                                    const diffMs = onSceneTime - dispatchTime;
                                    const diffMinutes = Math.round(diffMs / 60000);
                                    
                                    if (diffMinutes >= 0 && diffMinutes < 120) { // Sanity check
                                        item['Response Time (min)'] = diffMinutes;
                                        console.log(`Calculated response time: ${item['Response Time (min)']} minutes`);
                                    } else {
                                        console.warn(`Suspicious response time calculated (${diffMinutes} minutes) - ignoring`);
                                    }
                                }
                            } catch (e) {
                                console.warn('Error calculating response time:', e);
                            }
                        }
                    });
                    
                    // Verify data has required fields
                    const requiredFields = ['Unit', 'Reported', 'Unit Dispatched', 'Unit Onscene', 'Latitude', 'Longitude'];
                    const missingFields = requiredFields.filter(field => 
                        !preparedData.some(record => record[field] !== undefined)
                    );
                    
                    if (missingFields.length > 0) {
                        console.warn(`Data is missing required fields: ${missingFields.join(', ')}`);
                        appendLog(`Warning: Data is missing required fields: ${missingFields.join(', ')}`, 'warning');
                    }
                    
                    // Create sample data if the formatted data is empty
                    if (preparedData.length === 0) {
                        console.warn("No data was prepared. Creating sample data for demonstration.");
                        preparedData = createSampleResponseTimeData();
                        appendLog("Created sample Response Time Analyzer data for demonstration", "info");
                    }
                    
                    // Add metadata to indicate the data is coming from the formatter
                    preparedData.forEach(record => {
                        record._source = 'formatter';
                        record._formatted = true;
                        record._timestamp = new Date().toISOString();
                    });
                    
                    // Debug report of the data being sent
                    console.log('Response Time Analyzer data sample:', 
                        preparedData.length > 0 ? preparedData[0] : 'No data');
                    
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
                    
                    console.log('Isochrone Map Station data sample:', preparedData.length > 0 ? preparedData[0] : 'No data');
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
                    
                    console.log('Isochrone Map Incident data sample:', preparedData.length > 0 ? preparedData[0] : 'No data');
                    break;
                
                // For call-density and coverage-gap, preserving existing transformations
                case 'call-density':
                    // Ensure coordinates are parsed as numbers and map fields for Call Density Heatmap
                    preparedData.forEach(item => {
                        // Handle coordinate fields
                        if (item['Latitude'] && typeof item['Latitude'] === 'string') {
                            item['Latitude'] = parseFloat(item['Latitude']);
                        }
                        if (item['Longitude'] && typeof item['Longitude'] === 'string') {
                            item['Longitude'] = parseFloat(item['Longitude']);
                        }
                        
                        // Map common incident type fields if not already mapped
                        if (!item['Incident Type']) {
                            const typeFields = ['call_type', 'calltype', 'nature', 'incident_nature', 'type', 'problem', 'call type', 'Call Type'];
                            for (const field of typeFields) {
                                if (item[field]) {
                                    item['Incident Type'] = item[field];
                                    break;
                                }
                            }
                        }
                        
                        // Map date fields - look for alternative names if needed
                        if (!item['Incident Date']) {
                            const dateFields = ['date', 'call_date', 'incident_date', 'alarm_date', 'Date', 'CallDate', 'ReportedDate'];
                            for (const field of dateFields) {
                                if (item[field]) {
                                    item['Incident Date'] = standardizeDate(item[field]);
                                    break;
                                }
                            }
                        }
                        
                        // Map time fields - look for alternative names if needed
                        if (!item['Incident Time']) {
                            const timeFields = ['time', 'call_time', 'incident_time', 'alarm_time', 'Time', 'CallTime', 'ReportedTime'];
                            for (const field of timeFields) {
                                if (item[field]) {
                                    item['Incident Time'] = standardizeTime(item[field]);
                                    break;
                                }
                            }
                        }
                        
                        // Check for combined date/time fields and split them
                        const dateTimeFields = ['datetime', 'timestamp', 'call_datetime', 'incident_datetime', 'DateTime', 'Timestamp'];
                        for (const field of dateTimeFields) {
                            if (item[field] && !item['Incident Date']) {
                                try {
                                    const dt = new Date(item[field]);
                                    if (!isNaN(dt)) {
                                        item['Incident Date'] = dt.toISOString().split('T')[0];
                                        item['Incident Time'] = dt.toTimeString().split(' ')[0];
                                    }
                                } catch (e) {
                                    // Try alternative format parsing if needed
                                }
                            }
                        }
                        
                        // Extract time components from incident timestamps if available
                        if (item['Incident Date'] && item['Incident Time']) {
                            try {
                                const dateTime = new Date(`${item['Incident Date']}T${item['Incident Time']}`);
                                if (!isNaN(dateTime)) {
                                    item['hour'] = dateTime.getHours();
                                    item['dayOfWeek'] = dateTime.getDay();
                                    item['month'] = dateTime.getMonth() + 1;
                                }
                            } catch (e) {
                                console.warn("Error extracting time components:", e);
                            }
                        }
                        
                        // Last resort for time components - check for individual hour/day/month fields
                        if (!item.hour) {
                            const hourFields = ['hour', 'hour_of_day', 'incident_hour', 'Hour'];
                            for (const field of hourFields) {
                                if (item[field] !== undefined) {
                                    const hourVal = parseInt(item[field]);
                                    if (!isNaN(hourVal) && hourVal >= 0 && hourVal < 24) {
                                        item.hour = hourVal;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (!item.dayOfWeek) {
                            const dayFields = ['day', 'day_of_week', 'incident_day', 'weekday', 'Day', 'Weekday'];
                            for (const field of dayFields) {
                                if (item[field] !== undefined) {
                                    const dayVal = parseInt(item[field]);
                                    if (!isNaN(dayVal) && dayVal >= 0 && dayVal < 7) {
                                        item.dayOfWeek = dayVal;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (!item.month) {
                            const monthFields = ['month', 'incident_month', 'Month'];
                            for (const field of monthFields) {
                                if (item[field] !== undefined) {
                                    const monthVal = parseInt(item[field]);
                                    if (!isNaN(monthVal) && monthVal >= 1 && monthVal <= 12) {
                                        item.month = monthVal;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // Add intensity field if available - useful for heat map weighting
                        if (!item.intensity) {
                            const intensityFields = ['intensity', 'weight', 'priority', 'severity', 'count', 'Intensity', 'Priority'];
                            for (const field of intensityFields) {
                                if (item[field] !== undefined) {
                                    const intensityVal = parseFloat(item[field]);
                                    if (!isNaN(intensityVal)) {
                                        item.intensity = intensityVal;
                                        break;
                                    }
                                }
                            }
                        }
                    });
                    
                    // Log a sample of the prepared data
                    console.log('Call Density Heatmap data sample:', preparedData.length > 0 ? preparedData[0] : 'No data');
                    break;
                    
                case 'coverage-gap':
                    // Ensure stations have required fields properly mapped
                    preparedData.forEach(item => {
                        // Standardize coordinates
                        for (const field of ['Latitude', 'Longitude']) {
                            // Try standard field names first
                            if (item[field] !== undefined) {
                                const coordValue = parseFloat(item[field]);
                                if (!isNaN(coordValue)) {
                                    item[field] = coordValue;
                                }
                            } else {
                                // Try alternate field names
                                const alternates = field === 'Latitude' ? 
                                    ['latitude', 'lat', 'y', 'LAT', 'Lat'] : 
                                    ['longitude', 'long', 'lng', 'x', 'LONG', 'Lng', 'LON', 'Lon'];
                                
                                for (const altField of alternates) {
                                    if (item[altField] !== undefined) {
                                        const coordValue = parseFloat(item[altField]);
                                        if (!isNaN(coordValue)) {
                                            item[field] = coordValue;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Map station identification fields
                        if (item['Station ID'] === undefined) {
                            // Try alternate fields for Station ID
                            const idFields = ['station_id', 'stationId', 'id', 'ID', 'StationID', 'STATION_ID'];
                            for (const field of idFields) {
                                if (item[field] !== undefined) {
                                    item['Station ID'] = item[field];
                                    break;
                                }
                            }
                        }
                        
                        if (item['Station Name'] === undefined) {
                            // Try alternate fields for Station Name
                            const nameFields = ['station_name', 'stationName', 'name', 'Name', 'STATION_NAME', 'Station'];
                            for (const field of nameFields) {
                                if (item[field] !== undefined) {
                                    item['Station Name'] = item[field];
                                    break;
                                }
                            }
                            
                            // If still no name but we have ID, use ID as name
                            if (item['Station Name'] === undefined && item['Station ID'] !== undefined) {
                                item['Station Name'] = `Station ${item['Station ID']}`;
                            }
                        }
                        
                        // Handle Coverage Area field
                        if (item['Coverage Area'] === undefined) {
                            // Try alternate fields
                            const coverageFields = ['coverage_area', 'coverageArea', 'coverage', 'Coverage', 'COVERAGE_AREA', 'radius', 'Radius'];
                            for (const field of coverageFields) {
                                if (item[field] !== undefined) {
                                    item['Coverage Area'] = item[field];
                                    break;
                                }
                            }
                            
                            // If still no coverage area, set a default value
                            if (item['Coverage Area'] === undefined) {
                                item['Coverage Area'] = 5; // Default 5 mile coverage
                            }
                        }
                    });
                    
                    console.log('Coverage Gap Finder data sample:', preparedData.length > 0 ? preparedData[0] : 'No data');
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

    // Helper function to detect Central Square format
    function detectCentralSquareFormat(record) {
        if (!record) return false;
        
        const fields = Object.keys(record);
        return fields.includes('CAD_INCIDENT_ID') || 
               fields.includes('REPORTED_DT') || 
               (fields.includes('GEOX') && fields.includes('GEOY'));
    }
    
    // Helper function to process Central Square data
    function processCentralSquareData(data, toolId) {
        console.log("Processing Central Square data for tool:", toolId);
        appendLog("Processing Central Square data format");
        
        return data.map(item => {
            const newItem = {...item};
            
            // Process REPORTED_DT for timestamp
            if (item['REPORTED_DT']) {
                try {
                    const dt = new Date(item['REPORTED_DT']);
                    if (!isNaN(dt)) {
                        // Set standard fields for Response Time Analyzer
                        newItem['Incident Date'] = dt.toISOString().split('T')[0];
                        newItem['Incident Time'] = dt.toTimeString().split(' ')[0];
                        newItem['Reported'] = dt.toTimeString().split(' ')[0];
                        console.log(`Extracted from REPORTED_DT: Date=${newItem['Incident Date']}, Time=${newItem['Incident Time']}`);
                    }
                } catch (e) {
                    console.warn('Error processing REPORTED_DT:', e);
                }
            }
            
            // Process DISPATCH_DT
            if (item['DISPATCH_DT']) {
                try {
                    const dt = new Date(item['DISPATCH_DT']);
                    if (!isNaN(dt)) {
                        newItem['Dispatch Time'] = dt.toTimeString().split(' ')[0];
                        newItem['Unit Dispatched'] = dt.toTimeString().split(' ')[0];
                        console.log(`Extracted from DISPATCH_DT: ${newItem['Dispatch Time']}`);
                    }
                } catch (e) {
                    console.warn('Error processing DISPATCH_DT:', e);
                }
            }
            
            // Process ARRIVAL_DT
            if (item['ARRIVAL_DT']) {
                try {
                    const dt = new Date(item['ARRIVAL_DT']);
                    if (!isNaN(dt)) {
                        newItem['On Scene Time'] = dt.toTimeString().split(' ')[0];
                        newItem['Unit Onscene'] = dt.toTimeString().split(' ')[0];
                        console.log(`Extracted from ARRIVAL_DT: ${newItem['On Scene Time']}`);
                    }
                } catch (e) {
                    console.warn('Error processing ARRIVAL_DT:', e);
                }
            }
            
            // Process ENROUTE_DT if available
            if (item['ENROUTE_DT']) {
                try {
                    const dt = new Date(item['ENROUTE_DT']);
                    if (!isNaN(dt)) {
                        newItem['En Route Time'] = dt.toTimeString().split(' ')[0];
                        newItem['Unit Enroute'] = dt.toTimeString().split(' ')[0];
                        console.log(`Extracted from ENROUTE_DT: ${newItem['En Route Time']}`);
                    }
                } catch (e) {
                    console.warn('Error processing ENROUTE_DT:', e);
                }
            }
            
            // Process coordinates
            if (item['GEOY'] !== undefined) {
                const lat = parseFloat(item['GEOY']);
                if (!isNaN(lat)) {
                    newItem['Latitude'] = lat;
                    console.log(`Converted GEOY to Latitude: ${lat}`);
                }
            }
            
            if (item['GEOX'] !== undefined) {
                const lng = parseFloat(item['GEOX']);
                if (!isNaN(lng)) {
                    newItem['Longitude'] = lng;
                    console.log(`Converted GEOX to Longitude: ${lng}`);
                }
            }
            
            // Map Central Square fields to standard fields
            if (item['CAD_INCIDENT_ID']) {
                newItem['Incident ID'] = item['CAD_INCIDENT_ID'];
                newItem['Run No'] = item['CAD_INCIDENT_ID'];
            }
            
            if (item['APPARATUS_ID']) {
                newItem['Unit ID'] = item['APPARATUS_ID'];
                newItem['Unit'] = item['APPARATUS_ID'];
            }
            
            if (item['CALL_DESCRIPTION']) {
                newItem['Incident Type'] = item['CALL_DESCRIPTION'];
                newItem['Nature'] = item['CALL_DESCRIPTION'];
            } else if (item['CALL_TYPE']) {
                newItem['Incident Type'] = item['CALL_TYPE'];
                newItem['Nature'] = item['CALL_TYPE'];
            }
            
            if (item['ADDR_STR']) {
                newItem['Address'] = item['ADDR_STR'];
                newItem['Full Address'] = item['ADDR_STR'];
            }
            
            if (item['ADDR_CITY']) {
                newItem['City'] = item['ADDR_CITY'];
                newItem['Incident City'] = item['ADDR_CITY'];
            }
            
            if (item['PRIORITY']) {
                newItem['Priority'] = item['PRIORITY'];
            }
            
            // Calculate response time if we have dispatch and arrival times
            if (newItem['Unit Dispatched'] && newItem['Unit Onscene']) {
                try {
                    const dispatchTime = new Date(`2000-01-01T${newItem['Unit Dispatched']}`);
                    const onSceneTime = new Date(`2000-01-01T${newItem['Unit Onscene']}`);
                    
                    if (!isNaN(dispatchTime) && !isNaN(onSceneTime)) {
                        const diffMs = onSceneTime - dispatchTime;
                        const diffMinutes = Math.round(diffMs / 60000);
                        
                        if (diffMinutes >= 0 && diffMinutes < 120) { // Sanity check
                            newItem['Response Time (min)'] = diffMinutes;
                            console.log(`Calculated response time: ${diffMinutes} minutes`);
                        }
                    }
                } catch (e) {
                    console.warn('Error calculating response time:', e);
                }
            }
            
            return newItem;
        });
    }

    // Initialize the application
    init();
});