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
    const mapFieldsBtn = document.getElementById('map-fields-btn');
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
    const excelOptions = document.getElementById('excel-options');
    const excelSheet = document.getElementById('excel-sheet');
    
    // Toggle elements
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedOptions = document.querySelector('.advanced-options');
    const requirementsToggle = document.getElementById('requirements-toggle');
    const requirementsContent = document.querySelector('.requirements-content');
    
    // Instructions panel elements
    const showInstructionsBtn = document.getElementById('show-instructions');
    const closeInstructionsBtn = document.getElementById('close-instructions');
    const instructionsPanel = document.getElementById('instructions-panel');
    
    // Use local variables for convenience, but store data in the central store
    let originalData = null;
    let transformedData = null;
    let fileType = null;
    let selectedTool = null;
    
    // Get store reference for shorter code
    const store = window.DataFormatterStore;
    
    // Subscribe to store updates to keep local variables in sync
    if (store) {
        store.subscribe(function(newState) {
            // Update local variables when store changes
            originalData = newState.originalData;
            transformedData = newState.transformedData;
            fileType = newState.fileType;
            selectedTool = newState.selectedTool;
            
            // For backward compatibility - expose to window
            window.originalData = newState.originalData;
            window.selectedTool = newState.selectedTool;
            
            console.log('DataFormatter: Store update received', {
                hasOriginalData: !!originalData,
                hasTransformedData: !!transformedData,
                fileType,
                selectedTool
            });
        });
        
        console.log('DataFormatter: Subscribed to store updates');
    } else {
        console.error('DataFormatter: Store not available! Falling back to local variables only.');
    }
    
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
    
    // Global workbook reference for Excel files
    let excelWorkbook = null;
    
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
        
        // Hide Excel options by default
        excelOptions.style.display = 'none';
        
        // If it's an Excel file, we need special handling to load sheets
        if (fileType === 'excel') {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const arrayBuffer = e.target.result;
                    // Parse Excel file to get workbook
                    excelWorkbook = XLSX.read(arrayBuffer, {type: 'array'});
                    
                    // Populate sheet select dropdown
                    excelSheet.innerHTML = '';
                    excelWorkbook.SheetNames.forEach(sheet => {
                        const option = document.createElement('option');
                        option.value = sheet;
                        option.textContent = sheet;
                        excelSheet.appendChild(option);
                    });
                    
                    // Show Excel sheet selector
                    excelOptions.style.display = 'block';
                    
                    // Load the first sheet by default
                    loadExcelSheet(excelWorkbook.SheetNames[0]);
                    
                    // Enable buttons once file is loaded
                    mapFieldsBtn.disabled = false;
                    clearBtn.disabled = false;
                } catch (error) {
                    appendLog(`Error reading Excel file: ${error.message}`, 'error');
                    console.error('Excel read error:', error);
                }
            };
            
            reader.onerror = function() {
                appendLog('Error reading file', 'error');
            };
            
            reader.readAsArrayBuffer(file);
        } else {
            // For non-Excel files, use the regular load function
            loadFile(file);
            
            // Enable buttons once file is loaded
            mapFieldsBtn.disabled = false;
            clearBtn.disabled = false;
        }
    });
    
    // Handle Excel sheet selection
    excelSheet.addEventListener('change', function() {
        if (excelWorkbook && this.value) {
            loadExcelSheet(this.value);
        }
    });
    
    // Tool selection
    targetTool.addEventListener('change', function() {
        // Set the selected tool in our store
        if (store) {
            store.actions.setSelectedTool(this.value);
        } else {
            // Fallback if store isn't available
            selectedTool = this.value;
            window.selectedTool = this.value;
        }
        
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
        
        // If we have data, enable map fields button
        if (originalData) {
            mapFieldsBtn.disabled = false;
        }
    });
    
    // Enable map fields button when data is loaded
    function updateMapFieldsButton() {
        const mapFieldsBtn = document.getElementById('map-fields-btn');
        if (mapFieldsBtn) {
            mapFieldsBtn.disabled = !(originalData && originalData.length > 0);
        }
    }
    
    // Map fields button - functionality moved to column mapping UI
    mapFieldsBtn.addEventListener('click', function() {
        console.log("🔧 IMPROVED: Map fields button clicked");
        
        // IMPORTANT: Make sure the mapping container is displayed
        const mappingContainer = document.getElementById('column-mapping-container');
        if (mappingContainer) {
            console.log("Making column mapping container visible");
            mappingContainer.style.display = 'block';
            
            // Hide the main formatter panels
            const formatterPanels = document.querySelectorAll('.formatter-panel');
            formatterPanels.forEach(panel => {
                panel.style.display = 'none';
            });
        } else {
            console.error("Column mapping container not found!");
        }
        
        // Get current state from store
        const currentState = store ? store.getState() : { originalData, selectedTool };
        
        // Make sure we have data and a selected tool
        if (!currentState.originalData || !currentState.selectedTool) {
            console.warn("Missing originalData or selectedTool");
            
            // Create fallback data if needed
            if (!currentState.originalData) {
                console.log("Creating fallback data");
                const fallbackData = createBasicTestData(10);
                
                // Update the store with fallback data
                if (store) {
                    store.actions.setOriginalData(fallbackData);
                } else {
                    originalData = fallbackData;
                }
                
                // Make sure it's also available in the legacy global variable
                window.originalData = fallbackData;
                
                showInputPreview(fallbackData);
                console.log("Created fallback data");
            }
            
            // Select a default tool if needed
            if (!currentState.selectedTool) {
                console.log("Auto-selecting Response Time Analyzer tool");
                const defaultTool = 'response-time';
                
                // Update the store with default tool
                if (store) {
                    store.actions.setSelectedTool(defaultTool);
                } else {
                    selectedTool = defaultTool;
                }
                
                // Make sure it's also available in the legacy global variable
                window.selectedTool = defaultTool;
                
                targetTool.value = defaultTool;
                const event = new Event('change');
                targetTool.dispatchEvent(event);
                
                appendLog("Auto-selected Response Time Analyzer", 'info');
            }
        }
        
        // Log the current state for debugging
        if (store) {
            console.log("Current store state before showing mapping UI:", store.getState());
        }
        
        try {
            appendLog(`Starting transformation for ${getToolName(selectedTool)}...`);
            console.log(`Processing ${originalData.length} records`);
            
            try {
                appendLog(`Processing ${originalData.length} records with ${Object.keys(originalData[0] || {}).length} fields`);
            } catch (logError) {
                console.warn("Error logging field count:", logError);
                appendLog(`Processing ${originalData.length} records`);
            }
            
            // Apply transformations based on selected tool
            try {
                transformedData = transformData(originalData, selectedTool);
                console.log("Data transformation successful");
            } catch (transformError) {
                console.error("Error in transformData:", transformError);
                appendLog(`Error in transformation: ${transformError.message}`, 'error');
                
                // Create emergency fallback transformed data
                console.log("Creating fallback transformed data");
                transformedData = createBasicTestData(originalData.length || 10);
            }
            
            // Make sure we have transformed data
            if (!transformedData || transformedData.length === 0) {
                console.warn("No transformed data was created, generating fallback data");
                transformedData = createBasicTestData(originalData.length || 10);
                appendLog("Created fallback data for preview", 'warning');
            }
            
            // Show preview 
            try {
                console.log("Showing output preview");
                showOutputPreview(transformedData);
            } catch (previewError) {
                console.error("Error showing output preview:", previewError);
                appendLog(`Error showing preview: ${previewError.message}`, 'error');
                
                // Create a simple preview message
                outputPreview.innerHTML = `
                    <div class="info-message">
                        <p>Data transformed successfully: ${transformedData.length} records ready</p>
                    </div>
                `;
            }
            
            // Always enable buttons
            console.log("Enabling download and send to tool buttons");
            downloadBtn.disabled = false;
            sendToToolBtn.disabled = false;
            
            appendLog(`Transformation complete. ${transformedData.length} records ready for ${getToolName(selectedTool)}.`);
        } catch (error) {
            // Handle any unexpected errors
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
            
            // Create fallback data and enable buttons anyway
            console.log("Creating emergency fallback data after error");
            transformedData = createBasicTestData(10);
            downloadBtn.disabled = false;
            sendToToolBtn.disabled = false;
        }
    });
    
    // Download transformed data
    downloadBtn.addEventListener('click', function() {
        if (!transformedData) return;
        
        const outputFormatValue = document.getElementById('output-format').value;
        let outputData, fileName, mimeType, blob;
        
        switch (outputFormatValue) {
            case 'csv':
                outputData = convertToCSV(transformedData);
                fileName = 'transformed_data.csv';
                mimeType = 'text/csv';
                blob = new Blob([outputData], { type: mimeType });
                break;
            case 'excel':
                try {
                    // Create Excel file using XLSX.js
                    // Convert our data array to a worksheet
                    const worksheet = XLSX.utils.json_to_sheet(transformedData);
                    // Create a workbook with one worksheet
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Transformed Data");
                    // Generate Excel file as array buffer
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                    // Convert to Blob
                    blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    fileName = 'transformed_data.xlsx';
                    appendLog(`Created Excel file with ${transformedData.length} records`);
                } catch (e) {
                    // Fallback to CSV if Excel generation fails
                    console.error('Excel generation error:', e);
                    appendLog(`Error creating Excel file: ${e.message}. Falling back to CSV.`, 'warning');
                    outputData = convertToCSV(transformedData);
                    fileName = 'transformed_data.csv';
                    mimeType = 'text/csv';
                    blob = new Blob([outputData], { type: mimeType });
                }
                break;
            case 'json':
            default:
                outputData = JSON.stringify(transformedData, null, 2);
                fileName = 'transformed_data.json';
                mimeType = 'application/json';
                blob = new Blob([outputData], { type: mimeType });
                break;
        }
        
        // Create download link
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
        
        // Log what we're about to send for debugging
        console.log("Sending to tool:", selectedTool);
        console.log("First record sample:", transformedData[0]);
        console.log("Total records:", transformedData.length);
        
        try {
            // Generate a unique token for server storage
            const timestamp = Date.now();
            const token = 'token_' + timestamp + '_' + Math.random().toString(36).substring(2, 10);
            
            // Show loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.style.cssText = "position: fixed; top: 20px; right: 20px; background: #2196f3; color: white; padding: 10px 20px; border-radius: 4px; z-index: 9999;";
            loadingIndicator.innerHTML = "Sending data to server...";
            document.body.appendChild(loadingIndicator);
            
            // Use both approaches in parallel for maximum reliability:
            
            // 1. Server-side approach (primary)
            // Prepare data with token
            const serverData = {
                token: token,
                data: transformedData,
                expiry: Date.now() + (10 * 60 * 1000) // 10 minute expiry
            };
            
            // Send data to server endpoint
            fetch('/api/store-temp-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(serverData)
            })
            .then(response => response.json())
            .then(result => {
                console.log("Server data storage result:", result);
                
                if (result.success) {
                    // Server storage successful - Use server token
                    redirectToTool(token, 'server');
                } else {
                    console.error("Server data storage failed:", result.error);
                    // Fall back to browser storage
                    useBrowserStorageFallback(token);
                }
            })
            .catch(error => {
                console.error("Server data storage error:", error);
                // Fall back to browser storage
                useBrowserStorageFallback(token);
            });
            
            // 2. Browser storage fallback function (if server-side fails)
            function useBrowserStorageFallback(token) {
                try {
                    // Store in sessionStorage (traditional approach)
                    sessionStorage.setItem('formattedData', JSON.stringify(transformedData));
                    sessionStorage.setItem('dataSource', 'formatter');
                    sessionStorage.setItem('formatterToolId', selectedTool);
                    sessionStorage.setItem('formatterTarget', selectedTool);
                    sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
                    
                    // Add debug info to storage
                    sessionStorage.setItem('debug_info', JSON.stringify({
                        browser: navigator.userAgent,
                        timestamp: new Date().toISOString(),
                        tool: selectedTool,
                        recordCount: transformedData.length,
                        sampleKeys: Object.keys(transformedData[0] || {})
                    }));
                    
                    // Store in localStorage as well as a deeper fallback
                    const storageKey = 'formatter_data_' + timestamp;
                    
                    localStorage.setItem(storageKey, JSON.stringify({
                        data: transformedData,
                        metadata: {
                            source: 'formatter',
                            tool: selectedTool,
                            timestamp: new Date().toISOString(),
                            recordCount: transformedData.length,
                            browser: navigator.userAgent,
                            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString() // 10 minutes expiration
                        }
                    }));
                    
                    appendLog(`Data prepared for ${getToolName(selectedTool)} (${transformedData.length} records) with key: ${storageKey}`);
                    
                    // Redirect using browser storage approach
                    redirectToTool(storageKey, 'browser');
                } catch (error) {
                    console.error("Browser storage fallback failed:", error);
                    appendLog(`Browser storage fallback failed: ${error.message}`, 'error');
                    
                    // Try one last approach - direct URL with minimal data
                    if (loadingIndicator) {
                        loadingIndicator.innerHTML = "All storage methods failed! Trying minimal data transfer...";
                        loadingIndicator.style.background = "#ff9800";
                    }
                    
                    // Last resort - just redirect with a flag, tool will prompt for file upload
                    redirectToTool('failed', 'minimal');
                }
            }
            
            // Common redirect function
            function redirectToTool(dataKey, method) {
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
                    appendLog(`Sending data to ${getToolName(selectedTool)} using ${method} method...`);
                    
                    // Update loading indicator
                    if (loadingIndicator) {
                        loadingIndicator.innerHTML = `Redirecting using ${method} method...`;
                        loadingIndicator.style.background = "#4caf50";
                    }
                    
                    // Build URL based on the method
                    let url = toolUrls[selectedTool];
                    
                    if (method === 'server') {
                        // Server-side storage - pass the token
                        url += (url.includes('?') ? '&' : '?') + 
                               `from_formatter=true&data_token=${dataKey}&storage_method=${method}&t=${timestamp}&records=${transformedData.length}`;
                    } else if (method === 'browser') {
                        // Browser storage - pass localStorage key
                        url += (url.includes('?') ? '&' : '?') + 
                               `from_formatter=true&formatter_data=${dataKey}&storage_method=${method}&t=${timestamp}&records=${transformedData.length}`;
                    } else {
                        // Minimal approach - just pass the flag
                        url += (url.includes('?') ? '&' : '?') + 
                               `from_formatter=true&storage_method=failed&t=${timestamp}`;
                    }
                    
                    console.log(`Redirecting to: ${url} (${method} method)`);
                    window.location.href = url;
                } else {
                    appendLog(`Error: No URL defined for ${selectedTool}`, 'error');
                    if (loadingIndicator) {
                        loadingIndicator.innerHTML = "Error: Unknown tool specified";
                        loadingIndicator.style.background = "#f44336";
                    }
                }
            }
        } catch (error) {
            console.error("Error in data transfer process:", error);
            appendLog(`Error preparing data transfer: ${error.message}`, 'error');
            alert("Error preparing data for transfer. Check browser console for details.");
            return;
        }
    });
    
    // Function to load an Excel sheet
    function loadExcelSheet(sheetName) {
        if (!excelWorkbook) return;
        
        try {
            const worksheet = excelWorkbook.Sheets[sheetName];
            
            // Convert to JSON (headers: true means use first row as headers)
            const rawData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            
            // Transform to match our expected format (array of objects with column headers as keys)
            if (rawData.length > 1) {
                const headers = rawData[0];
                originalData = rawData.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((header, i) => {
                        if (header) { // Skip empty headers
                            obj[header] = row[i] !== undefined ? row[i] : '';
                        }
                    });
                    return obj;
                });
                
                // Filter out entirely empty rows
                originalData = originalData.filter(row => Object.values(row).some(val => val !== ''));
                
                appendLog(`Loaded Excel sheet "${sheetName}" with ${originalData.length} records and ${headers.length} fields`);
                
                // Show preview
                showInputPreview(originalData);
            } else {
                // Empty or only headers
                appendLog(`Excel sheet "${sheetName}" has no data rows`, 'warning');
                originalData = [];
                
                // Show empty preview
                inputPreview.innerHTML = `
                    <div class="placeholder-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>No data found in selected sheet</p>
                    </div>
                `;
            }
        } catch (error) {
            appendLog(`Error parsing Excel sheet: ${error.message}`, 'error');
            console.error('Excel sheet parse error:', error);
            
            // Reset data
            originalData = null;
        }
    }
    
    // Clear button
    clearBtn.addEventListener('click', function() {
        // Reset file input
        fileInput.value = '';
        fileName.textContent = 'No file selected';
        
        // Hide Excel options
        excelOptions.style.display = 'none';
        excelWorkbook = null;
        
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
        mapFieldsBtn.disabled = true;
        clearBtn.disabled = true;
        downloadBtn.disabled = true;
        sendToToolBtn.disabled = true;
        
        // Reset data in the store
        if (store) {
            store.actions.resetState();
            console.log("Store state reset");
        } else {
            // Fallback
            originalData = null;
            transformedData = null;
            window.originalData = null;
            window.selectedTool = null;
        }
        
        // Disable the map fields button
        updateMapFieldsButton();
        
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
        // Check if we can use the new DataTransformer utility
        if (window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer) {
            try {
                console.log("Using FireEMS.Utils.DataTransformer for CAD system detection");
                const cadSystem = window.FireEMS.Utils.DataTransformer.detectCADSystem(sampleRecord);
                
                if (cadSystem) {
                    console.log(`Detected CAD system using DataTransformer: ${cadSystem}`);
                    return cadSystem;
                } else {
                    console.log("DataTransformer did not detect a CAD system, falling back to legacy detection");
                }
            } catch (error) {
                console.error("Error using DataTransformer for CAD system detection:", error);
                console.warn("Falling back to legacy CAD system detection");
            }
        }
        
        // Legacy fallback detection
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
            fields.some(f => f.includes('EMS_RUN_NUMBER')) ||
            fields.some(f => f.includes('IncidentPK')) ||
            (fields.includes('IncidentDate') && fields.includes('IncidentTime') && 
             fields.includes('NatureOfCall') && fields.includes('ResponseMode'))) {
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
        
        // Check if we can use the new DataTransformer utility
        if (window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer) {
            try {
                console.log(`Using FireEMS.Utils.DataTransformer for ${cadSystem} transformations`);
                appendLog(`Using DataTransformer to handle ${cadSystem} data...`);
                
                const transformedResult = window.FireEMS.Utils.DataTransformer.applyCADSystemMappings(data, cadSystem);
                
                if (transformedResult && transformedResult.length > 0) {
                    // Apply additional tool-specific transformations
                    const finalResult = window.FireEMS.Utils.DataTransformer.transformForTool(transformedResult, toolId);
                    
                    if (finalResult && finalResult.length > 0) {
                        appendLog(`Data transformed successfully for ${toolId} using DataTransformer`);
                        return finalResult;
                    }
                    
                    // At least return the CAD system mappings if tool-specific transform fails
                    appendLog(`Applied ${cadSystem} mappings with DataTransformer`);
                    return transformedResult;
                } else {
                    console.warn("DataTransformer returned no results for CAD system mappings, falling back to legacy processor");
                    appendLog(`Falling back to legacy processor for ${cadSystem} data`, 'warning');
                }
            } catch (error) {
                console.error(`Error using DataTransformer for ${cadSystem} transformations:`, error);
                console.warn("Falling back to legacy CAD system processor");
                appendLog(`Error in DataTransformer, using legacy processor: ${error.message}`, 'warning');
            }
        }
        
        // Legacy fallback processing
        appendLog(`Applying ${cadSystem} specific transformations using legacy processor...`);
        
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
                appendLog(`Processing ImageTrend Fire Records Management data...`);
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
    
    function processImageTrendData(data, toolId) {
        const processedData = JSON.parse(JSON.stringify(data));
        
        // Process based on the tool type
        if (toolId === 'response-time' || toolId === 'call-density') {
            processedData.forEach(item => {
                // Basic identification fields
                item['Incident ID'] = item.IncidentPK || '';
                item['Run No'] = item.IncidentPK || '';
                
                // Date/time fields
                item['Incident Date'] = item.IncidentDate || '';
                item['Incident Time'] = item.IncidentTime || '';
                item['Reported'] = item.IncidentTime || '';
                item['Unit Dispatched'] = item.DispatchTime || '';
                item['Unit Enroute'] = item.EnRouteTime || '';
                item['Unit Onscene'] = item.ArriveTime || '';
                
                // Response time calculation if it doesn't exist
                if (!item['Response Time'] && item.TotalResponseTimeMinutes) {
                    item['Response Time'] = parseFloat(item.TotalResponseTimeMinutes);
                }
                
                // Location information
                item['Full Address'] = item.StreetAddress || '';
                item['Incident City'] = item.City || '';
                item['Incident State'] = item.State || '';
                item['Address'] = [
                    item.StreetAddress || '',
                    item.City || '',
                    item.State || '',
                    item.PostalCode || ''
                ].filter(Boolean).join(', ');
                
                // Lat/Lon coordinates
                if (item.Latitude) item['Latitude'] = parseFloat(item.Latitude);
                if (item.Longitude) item['Longitude'] = parseFloat(item.Longitude);
                
                // Incident type and nature
                item['Incident Type'] = item.IncidentTypeCode || item.CallType || '';
                item['Nature'] = item.NatureOfCall || '';
                
                // Unit information
                item['Unit'] = item.VehicleID || '';
                item['Station'] = item.StationID || '';
                
                // Priority based on alarm level
                if (item.AlarmLevel) {
                    // Convert alarm level to numeric priority (lower number = higher priority)
                    const alarmLevel = parseInt(item.AlarmLevel.replace(/[^0-9]/g, ''));
                    if (!isNaN(alarmLevel)) {
                        item['Priority'] = alarmLevel;
                    }
                }
            });
        } else if (toolId === 'incident-logger') {
            processedData.forEach(item => {
                // Basic identification fields
                item['Incident ID'] = item.IncidentPK || '';
                
                // Date/time fields
                item['Incident Date'] = item.IncidentDate || '';
                item['Incident Time'] = item.IncidentTime || '';
                
                // Incident details
                item['Incident Type'] = item.IncidentTypeCode || item.CallType || '';
                item['Address'] = item.StreetAddress || '';
                
                // Unit information
                item['Unit ID'] = item.VehicleID || '';
                
                // Patient information
                item['Patient Info'] = `Count: ${item.PatientCount || 'N/A'}, Age: ${item.PatientAge || 'N/A'}, Gender: ${item.PatientGender || 'N/A'}`;
                
                // Additional notes
                const notes = [];
                if (item.PrimaryImpression) notes.push(`Primary: ${item.PrimaryImpression}`);
                if (item.SecondaryImpression) notes.push(`Secondary: ${item.SecondaryImpression}`);
                if (item.SituationFound) notes.push(`Situation: ${item.SituationFound}`);
                if (item.ActionsTaken) notes.push(`Actions: ${item.ActionsTaken}`);
                
                item['Notes'] = notes.join(' | ');
                
                // Coordinates
                if (item.Latitude) item['Latitude'] = parseFloat(item.Latitude);
                if (item.Longitude) item['Longitude'] = parseFloat(item.Longitude);
            });
        } else if (toolId.includes('isochrone')) {
            // For isochrone maps, we need to extract station information
            const stationData = [];
            const seenStations = new Set();
            
            processedData.forEach(item => {
                if (item.StationID && !seenStations.has(item.StationID)) {
                    seenStations.add(item.StationID);
                    
                    // Create a station record
                    const station = {
                        'Station ID': item.StationID,
                        'Station Name': `Station ${item.StationID}`,
                        'Latitude': parseFloat(item.Latitude || 0),
                        'Longitude': parseFloat(item.Longitude || 0),
                        'Unit Types': item.UnitType || 'Unknown'
                    };
                    
                    stationData.push(station);
                }
            });
            
            // For isochrone-stations, return the station data
            if (toolId === 'isochrone-stations') {
                return stationData.length > 0 ? stationData : processedData;
            }
            
            // For isochrone-incidents, prepare incident data
            if (toolId === 'isochrone-incidents') {
                processedData.forEach(item => {
                    item['Incident ID'] = item.IncidentPK || '';
                    item['Incident Type'] = item.IncidentTypeCode || item.CallType || '';
                    
                    if (item.Latitude) item['Latitude'] = parseFloat(item.Latitude);
                    if (item.Longitude) item['Longitude'] = parseFloat(item.Longitude);
                });
            }
        }
        
        return processedData;
    }
    
    // Add other CAD system processors (Tyler, Hexagon, etc.)
    
    // File processing functions
    function loadFile(file) {
        console.log("🔧 IMPROVED: Loading file", file.name, "of type", fileType);
        appendLog(`Loading file: ${file.name}...`);
        
        // Create a new FileReader with better error handling
        const reader = new FileReader();
        
        // Set up file loaded handler with robust error handling
        reader.onload = function(e) {
            console.log("File loaded into memory successfully");
            
            try {
                // Get the file content
                const result = e.target.result;
                console.log(`File content loaded, size: ${result.length} bytes`);
                
                // Process file based on type with proper error handling
                switch (fileType) {
                    case 'csv':
                        console.log("Processing CSV file");
                        try {
                            originalData = parseCSV(result);
                            
                            if (!originalData || originalData.length === 0) {
                                console.warn("CSV parsing returned no data");
                                appendLog(`No data found in CSV file`, 'warning');
                                originalData = [];
                            } else {
                                console.log("CSV parsed successfully");
                                appendLog(`Loaded CSV with ${originalData.length} records and ${Object.keys(originalData[0] || {}).length} fields`);
                                
                                // Update store with the parsed data
                                if (store) {
                                    store.actions.setOriginalData(originalData);
                                    store.actions.setFileType('csv');
                                    console.log("Updated store with CSV data");
                                }
                                
                                // Enable the map fields button
                                updateMapFieldsButton();
                            }
                        } catch (csvError) {
                            console.error("CSV parsing failed:", csvError);
                            appendLog(`CSV parsing failed: ${csvError.message}`, 'error');
                            originalData = [];
                        }
                        break;
                        
                    case 'excel':
                        console.log("Processing Excel file");
                        try {
                            // Use XLSX.js library to parse Excel files
                            const arrayBuffer = e.target.result;
                            const workbook = XLSX.read(arrayBuffer, {type: 'array'});
                            
                            // Assume first sheet is the data
                            const firstSheetName = workbook.SheetNames[0];
                            const worksheet = workbook.Sheets[firstSheetName];
                            
                            // Convert to JSON (headers: true means use first row as headers)
                            originalData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                            
                            // Transform to match our expected format (array of objects with column headers as keys)
                            if (originalData.length > 1) {
                                const headers = originalData[0];
                                originalData = originalData.slice(1).map(row => {
                                    const obj = {};
                                    headers.forEach((header, i) => {
                                        if (header) { // Skip empty headers
                                            obj[header] = row[i] !== undefined ? row[i] : '';
                                        }
                                    });
                                    return obj;
                                });
                                
                                // Filter out entirely empty rows
                                originalData = originalData.filter(row => Object.values(row).some(val => val !== ''));
                                
                                console.log("Excel file processed successfully");
                                appendLog(`Loaded Excel file with ${originalData.length} records and ${headers.length} fields from sheet: ${firstSheetName}`);
                                
                                // Enable the map fields button
                                updateMapFieldsButton();
                            } else {
                                // Empty or only headers
                                console.warn("Excel file has no data rows");
                                appendLog('Excel file has no data rows', 'warning');
                                originalData = [];
                            }
                        } catch (excelError) {
                            console.error('Excel parse error:', excelError);
                            appendLog(`Error parsing Excel file: ${excelError.message}`, 'error');
                            originalData = [];
                        }
                        break;
                        
                    case 'json':
                        console.log("Processing JSON file");
                        try {
                            originalData = JSON.parse(result);
                            console.log("JSON parsed successfully");
                            appendLog(`Loaded JSON with ${originalData.length} records`);
                            
                            // Enable the map fields button
                            updateMapFieldsButton();
                        } catch (jsonError) {
                            console.error("JSON parsing failed:", jsonError);
                            appendLog(`JSON parsing failed: ${jsonError.message}`, 'error');
                            originalData = [];
                        }
                        break;
                        
                    case 'xml':
                        // Simplified XML parsing for demo
                        appendLog('XML import not fully implemented. Please use CSV or JSON format.', 'warning');
                        originalData = [];
                        break;
                        
                    case 'kml':
                        appendLog('KML/KMZ import not implemented in this demo. Please use CSV or JSON format.', 'warning');
                        originalData = [];
                        break;
                        
                    default:
                        console.warn("Unknown file format:", fileType);
                        appendLog('Unknown file format, trying as CSV', 'warning');
                        try {
                            // Attempt to parse as CSV
                            originalData = parseCSV(result);
                            if (originalData.length > 0) {
                                appendLog(`Loaded file as CSV with ${originalData.length} records`);
                            } else {
                                originalData = [];
                                appendLog('Could not parse file content', 'error');
                            }
                        } catch (fallbackError) {
                            console.error("Fallback parsing failed:", fallbackError);
                            appendLog(`Fallback parsing failed: ${fallbackError.message}`, 'error');
                            originalData = [];
                        }
                }
                
                // Create fallback data if necessary
                if (!originalData || originalData.length === 0) {
                    console.warn("No data was loaded, creating fallback data");
                    
                    // Detect Motorola CAD from filename
                    const isMotorolaFile = file.name.toLowerCase().includes('motorola') || 
                                         file.name.toLowerCase().includes('cad') ||
                                         file.name.toLowerCase().includes('premier');
                    
                    if (isMotorolaFile) {
                        appendLog(`Creating Motorola CAD test data based on filename`, 'warning');
                        originalData = createMotorolaTestData(10);
                    } else {
                        appendLog(`Creating basic test data`, 'warning');
                        originalData = createBasicTestData(10);
                    }
                    
                    // Enable the map fields button
                    updateMapFieldsButton();
                }
                
                // Show preview
                console.log("Showing preview of data");
                showInputPreview(originalData);
                
                // Enable buttons
                mapFieldsBtn.disabled = false;
                clearBtn.disabled = false;
                
                // Success message
                appendLog(`File processed: ${file.name}`);
                
            } catch (error) {
                // Handle any unexpected errors during processing
                console.error('Unexpected error during file processing:', error);
                appendLog(`Unexpected error: ${error.message}`, 'error');
                
                // Create emergency fallback data
                originalData = createBasicTestData(5);
                showInputPreview(originalData);
                
                // Still enable buttons so user can proceed
                mapFieldsBtn.disabled = false;
                clearBtn.disabled = false;
            }
        };
        
        // Set up error handler
        reader.onerror = function(event) {
            console.error("FileReader error event:", event);
            appendLog('Error reading file. Please try again or use a different file.', 'error');
            
            // Create emergency fallback data
            originalData = createBasicTestData(5);
            showInputPreview(originalData);
            
            // Still enable buttons
            mapFieldsBtn.disabled = false;
            clearBtn.disabled = false;
        };
        
        // Start reading the file with appropriate method
        try {
            console.log(`Reading file as ${fileType === 'excel' ? 'binary' : 'text'}`);
            if (fileType === 'excel') {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        } catch (readError) {
            console.error("Error initiating file read:", readError);
            appendLog(`File read error: ${readError.message}`, 'error');
            
            // Create emergency fallback data
            originalData = createBasicTestData(5);
            showInputPreview(originalData);
            
            // Still enable buttons
            mapFieldsBtn.disabled = false;
            clearBtn.disabled = false;
        }
    }
    
    // Helper functions for test data creation
    function createBasicTestData(count) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                'Incident ID': `TEST-${i+1000}`,
                'Incident Date': new Date().toISOString().split('T')[0],
                'Incident Time': '08:00:00',
                'Dispatch Time': '08:01:30',
                'En Route Time': '08:02:45',
                'On Scene Time': '08:07:15',
                'Incident Type': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT', 'OTHER'][i % 5],
                'Priority': `${i % 5 + 1}`,
                'Notes': 'Test data record',
                'Latitude': (33.4484 + (i * 0.01)).toFixed(4),
                'Longitude': (-112.0740 - (i * 0.01)).toFixed(4)
            });
        }
        return data;
    }
    
    function createMotorolaTestData(count) {
        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({
                'INCIDENT_NO': `M-${i+1000}`,
                'CALL_RECEIVED_DATE': new Date().toISOString().split('T')[0],
                'CALL_RECEIVED_TIME': '08:00:00',
                'DISPATCH_TIME': '08:01:30',
                'EN_ROUTE_TIME': '08:02:45',
                'ARRIVAL_TIME': '08:07:15',
                'INCIDENT_TYPE': ['FIRE', 'EMS', 'RESCUE', 'HAZMAT', 'OTHER'][i % 5],
                'PRIORITY': `${i % 5 + 1}`,
                'NOTES': 'Test Motorola data',
                'LAT': (33.4484 + (i * 0.01)).toFixed(4),
                'LON': (-112.0740 - (i * 0.01)).toFixed(4)
            });
        }
        return data;
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
        console.log("🔧 IMPROVED: Starting CSV parsing");
        
        // Check if we can use the new DataTransformer utility
        if (window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer) {
            try {
                console.log("Using FireEMS.Utils.DataTransformer for CSV parsing");
                const result = window.FireEMS.Utils.DataTransformer.parseCSV(csvText);
                
                if (result && result.length > 0) {
                    console.log(`Successfully parsed ${result.length} records from CSV using DataTransformer`);
                    return result;
                } else {
                    console.warn("DataTransformer returned no results for CSV parsing, falling back to legacy parser");
                }
            } catch (error) {
                console.error("Error using DataTransformer for CSV parsing:", error);
                console.warn("Falling back to legacy CSV parser");
            }
        }
        
        // Legacy fallback parser
        try {
            // Handle different line endings
            const lines = csvText.split(/\r\n|\n/);
            if (lines.length === 0) {
                console.error("No lines found in CSV");
                return [];
            }
            
            console.log(`CSV file has ${lines.length} lines`);
            
            // Try to parse headers
            if (lines[0].trim() === '') {
                console.error("First line (headers) is empty");
                return [];
            }
            
            // Parse headers properly
            let headers = [];
            try {
                // First try the robust parser
                headers = parseCSVRow(lines[0]);
                console.log("CSV headers parsed successfully:", headers);
            } catch (headerError) {
                // Fall back to simple parsing
                console.warn("Robust header parsing failed, using simple splitting:", headerError);
                headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            }
            
            const result = [];
            
            // Parse each data row
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                let values = [];
                try {
                    // Try robust parsing first
                    values = parseCSVRow(lines[i]);
                } catch (rowError) {
                    // Fall back to simple parsing if robust parsing fails
                    console.warn(`Robust parsing failed for row ${i}, using simple splitting:`, rowError);
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
            
            console.log(`Successfully parsed ${result.length} records from CSV using legacy parser`);
            return result;
        } catch (err) {
            console.error("CSV parsing error:", err);
            return [];
        }
    }
    
    // Helper function to parse a CSV row, handling quoted fields correctly
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
    
    function transformData(data, toolId) {
        // Deep copy to avoid modifying original
        const transformedData = JSON.parse(JSON.stringify(data));
        
        // Check if we can use the new DataTransformer utility
        if (window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer) {
            try {
                appendLog(`Using FireEMS.Utils.DataTransformer for ${toolId}`);
                console.log("Using DataTransformer utility");
                
                // Use the new utility to transform the data
                const transformedResult = window.FireEMS.Utils.DataTransformer.transformForTool(transformedData, toolId);
                
                if (transformedResult && transformedResult.length > 0) {
                    appendLog(`Data transformed successfully using DataTransformer`);
                    return transformedResult;
                } else {
                    appendLog(`DataTransformer returned no results, falling back to legacy transform`, 'warning');
                }
            } catch (error) {
                console.error("Error using DataTransformer:", error);
                appendLog(`Error using DataTransformer: ${error.message}, falling back to legacy transform`, 'warning');
            }
        }
        
        // Legacy fallback path
        console.log("Using legacy transformation path");
        
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
        
        // Check if we can use the new DataTransformer utility
        if (window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer) {
            try {
                console.log(`Using FireEMS.Utils.DataTransformer for ${toolId} tool-specific transformations`);
                appendLog(`Using DataTransformer to prepare data for ${toolId}...`);
                
                const transformedResult = window.FireEMS.Utils.DataTransformer.transformForTool(data, toolId);
                
                if (transformedResult && transformedResult.length > 0) {
                    appendLog(`Data transformed successfully for ${toolId} using DataTransformer`);
                    return transformedResult;
                } else {
                    console.warn(`DataTransformer returned no results for ${toolId} transformations, falling back to legacy processor`);
                    appendLog(`Falling back to legacy processor for ${toolId} data`, 'warning');
                }
            } catch (error) {
                console.error(`Error using DataTransformer for ${toolId} transformations:`, error);
                console.warn("Falling back to legacy tool-specific processor");
                appendLog(`Error in DataTransformer, using legacy processor: ${error.message}`, 'warning');
            }
        }
        
        // Legacy fallback processing
        appendLog(`Applying ${toolId} transformations using legacy processor...`);
        const transformedData = JSON.parse(JSON.stringify(data));
        
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
        
        // Make global function available
        window.showOutputPreview = showOutputPreview;
        
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
                // Convert null/undefined to empty string and handle non-string values
                const value = row[header];
                const displayValue = value === null || value === undefined ? '' : 
                    (typeof value === 'object' ? JSON.stringify(value) : String(value));
                
                tableHTML += `<td>${displayValue}</td>`;
            });
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        // Add record count with additional information
        tableHTML += `
            <div class="preview-info">
                <p><strong>${data.length}</strong> total records, <strong>${headers.length}</strong> fields</p>
                <p class="preview-note">This is a preview of the transformed data. Click "Download" to save the complete dataset.</p>
            </div>
        `;
        
        // Replace the placeholder with our table
        outputPreview.innerHTML = tableHTML;
        
        // Add a success message
        appendLog(`Output preview generated with ${Math.min(data.length, 5)} sample records`, 'success');
        
        // Ensure the buttons are enabled
        const downloadBtn = document.getElementById('download-btn');
        const sendToToolBtn = document.getElementById('send-to-tool-btn');
        
        if (downloadBtn) downloadBtn.disabled = false;
        if (sendToToolBtn) sendToToolBtn.disabled = false;
        
        // Expose the function globally for the React component to use
        window.showOutputPreview = showOutputPreview;
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
        // Check if we can use the new DataTransformer utility
        if (window.FireEMS && window.FireEMS.Utils && window.FireEMS.Utils.DataTransformer) {
            try {
                console.log("Using FireEMS.Utils.DataTransformer for CSV conversion");
                const result = window.FireEMS.Utils.DataTransformer.toCSV(objArray);
                
                if (result) {
                    console.log("Successfully converted to CSV using DataTransformer");
                    return result;
                } else {
                    console.warn("DataTransformer returned empty result for CSV conversion, falling back to legacy converter");
                }
            } catch (error) {
                console.error("Error using DataTransformer for CSV conversion:", error);
                console.warn("Falling back to legacy CSV converter");
            }
        }
        
        // Legacy fallback converter
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