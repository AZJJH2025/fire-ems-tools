// ✅ fire-ems-dashboard.js is loaded!
console.log("✅ fire-ems-dashboard.js is loaded!");

// ----------------------------------------------------------------------------
// Process data function - used by both file upload and Data Formatter
// ----------------------------------------------------------------------------
/**
 * Process and display data from either file upload or Data Formatter
 * @param {Object} data - Data object including records and metadata
 */
function processData(data) {
    console.log("🔄 Processing data...", data);
    const resultDiv = document.getElementById('result');
    const dashboardDiv = document.getElementById('dashboard');
    
    try {
        // Format and process data
        const formattedData = formatFireEMSData(data.data);
        const stats = calculateDataStatistics(formattedData);
        
        // Display basic file stats
        if (data.source !== 'formatter') {
            resultDiv.innerHTML = `
                <div style="color: green; margin-bottom: 15px;">
                    <p>✅ ${data.filename ? `File uploaded: ${data.filename}` : 'Data processed successfully'}</p>
                    <p>📊 Incidents: ${data.rows || (data.data ? data.data.length : 'Unknown')}</p>
                    <p>📅 First reported date: ${data.first_reported_date || 'N/A'}</p>
                </div>
            `;
        }
        
        // Optionally update file stats container if available
        const fileStatsElement = document.getElementById('file-stats');
        if (fileStatsElement) {
            let statsHtml = `
                <div style="margin-bottom: 10px;">📄 Data source: ${data.filename || 'Data Formatter'}</div>
                <div style="margin-bottom: 10px;">📊 Incidents: ${stats.totalIncidents}</div>
                <div style="margin-bottom: 10px;">📅 First Date: ${data.first_reported_date || 'N/A'}</div>
            `;
            if (stats.avgResponseTime !== null) {
                statsHtml += `<div style="margin-bottom: 10px;">⏱️ Avg Response: ${stats.avgResponseTime} min</div>`;
            }
            if (stats.busyHours && stats.busyHours.length > 0) {
                statsHtml += `<div style="margin-bottom: 10px;">🔥 Busiest Hour: ${stats.busyHours[0].hour}</div>`;
            }
            if (stats.topUnit) {
                statsHtml += `<div style="margin-bottom: 10px;">🚒 Top Unit: ${stats.topUnit.unit} (${stats.topUnit.count})</div>`;
            }
            fileStatsElement.innerHTML = statsHtml;
        }
        
        // Render data table
        renderDataTable({ 
            ...data, 
            data: formattedData,
            columns: data.columns || Object.keys(formattedData[0] || {}).filter(k => !k.startsWith('_'))
        }, document.getElementById('data-table'));
        
        // Show dashboard
        dashboardDiv.style.display = 'block';
        
        // Create visualizations with proper Chart.js loading checks
        // First create the map which doesn't depend on Chart.js
        try {
            createIncidentMap(formattedData);
            console.log("✅ Map created successfully");
        } catch (error) {
            console.error("❌ Error creating map:", error);
            document.getElementById('incident-map').innerHTML = `<p style="color: red;">Error creating map: ${error.message}</p>`;
        }
        
        // For all other visualizations, we need to make sure Chart.js is available
        // or use fallbacks if it's not available or fails to load
        createVisualizationsWithChartJs(formattedData, stats);
    } catch (error) {
        console.error("❌ Error processing data:", error);
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div style="color: red; margin-bottom: 15px;">
                    <p>❌ Error processing data: ${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * Create chart visualizations with proper Chart.js loading and fallbacks
 * @param {Array} formattedData - The formatted incident data
 * @param {Object} stats - The calculated statistics
 */
function createVisualizationsWithChartJs(formattedData, stats) {
    console.log("🔄 Setting up chart visualizations with proper handling...");
    
    // Flag to track if we're in emergency mode
    // NOTE: We don't consider from_formatter as emergency mode anymore
    // It's a separate flow that uses sessionStorage, not emergency localStorage
    const isEmergencyMode = window.location.search.includes('emergency') || 
                           window.location.search.includes('emergency_data');
                           
    console.log("Emergency mode detection:", isEmergencyMode);
    
    // Define the processEmergencyData function immediately at page load
    // This needs to be early enough for emergency-mode-debugging.js to find it
    window.processEmergencyData = function(data) {
        console.log("Processing emergency data:", data ? data.length : 0, "records");
        return false; // Do nothing - emergency mode is disabled
    };
    console.log("Emergency data processing disabled - using regular flow only");
    
    // Check if we can access the ChartManager from the FireEMS namespace
    const hasChartManager = window.FireEMS && window.FireEMS.Charts;
    
    if (hasChartManager) {
        console.log("📊 Using FireEMS.Charts manager for chart creation");
        
        // Function to create time chart once Chart.js is ready
        const createTimeChartWhenReady = function(chart) {
            try {
                createTimeChart(formattedData, stats);
                console.log("✅ Time chart created successfully with ChartManager");
            } catch (error) {
                console.error("❌ Error creating time chart:", error);
                document.getElementById('time-chart').innerHTML = `<p style="color: red;">Error creating time chart: ${error.message}</p>`;
            }
        };
        
        // Function to create unit chart once Chart.js is ready
        const createUnitChartWhenReady = function(chart) {
            try {
                createUnitChart(formattedData, stats);
                console.log("✅ Unit chart created successfully with ChartManager");
            } catch (error) {
                console.error("❌ Error creating unit chart:", error);
                document.getElementById('unit-chart').parentElement.innerHTML = `<p style="color: red;">Error creating unit chart: ${error.message}</p>`;
                
                // Try fallback if available
                if (window.FireEMS && window.FireEMS.ChartFallback) {
                    console.log("🔄 Trying chart fallback for unit chart");
                    try {
                        const unitCounts = {};
                        formattedData.forEach(record => {
                            const unitValue = record['Unit'] || record['unit'] || record['Unit ID'] || 
                                           record['UnitID'] || record['unit_id'] || record['apparatus'];
                            if (unitValue) {
                                unitCounts[unitValue] = (unitCounts[unitValue] || 0) + 1;
                            }
                        });
                        
                        const topUnits = Object.entries(unitCounts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 8);
                        
                        window.FireEMS.ChartFallback.createBarChartFallback('unit-chart', 
                            topUnits.map(item => item[0]), 
                            topUnits.map(item => item[1]), 
                            {
                                title: 'Unit Activity',
                                labelHeader: 'Unit',
                                valueHeader: 'Incidents',
                                showPercentages: false
                            }
                        );
                        console.log("✅ Unit chart fallback created successfully");
                    } catch (fallbackError) {
                        console.error("❌ Error creating unit chart fallback:", fallbackError);
                    }
                }
            }
        };
        
        // Function to create location chart once Chart.js is ready
        const createLocationChartWhenReady = function(chart) {
            try {
                createLocationChart(formattedData, stats);
                console.log("✅ Location chart created successfully with ChartManager");
            } catch (error) {
                console.error("❌ Error creating location chart:", error);
                document.getElementById('location-chart').parentElement.innerHTML = `<p style="color: red;">Error creating location chart: ${error.message}</p>`;
                
                // Try fallback if available
                if (window.FireEMS && window.FireEMS.ChartFallback) {
                    console.log("🔄 Trying chart fallback for location chart");
                    try {
                        // Find location data
                        const locationFields = ['Incident City', 'City', 'ADDR_CITY', 'EVENT_CITY', 'CITY', 'Location City'];
                        let locationField = null;
                        
                        for (const field of locationFields) {
                            if (formattedData.some(record => record[field])) {
                                locationField = field;
                                break;
                            }
                        }
                        
                        if (locationField) {
                            const locationCounts = {};
                            formattedData.forEach(record => {
                                const location = record[locationField] || record['Incident City'];
                                if (location) {
                                    locationCounts[location] = (locationCounts[location] || 0) + 1;
                                }
                            });
                            
                            const topLocations = Object.entries(locationCounts)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 6);
                            
                            window.FireEMS.ChartFallback.createPieChartFallback('location-chart', 
                                topLocations.map(item => item[0]), 
                                topLocations.map(item => item[1]), 
                                {
                                    title: 'Incidents by Location',
                                    labelHeader: 'Location',
                                    valueHeader: 'Incidents',
                                    showPercentages: true
                                }
                            );
                            console.log("✅ Location chart fallback created successfully");
                        }
                    } catch (fallbackError) {
                        console.error("❌ Error creating location chart fallback:", fallbackError);
                    }
                }
            }
        };
        
        // Use the ChartManager to register callbacks for when Chart.js is ready
        window.FireEMS.Charts.onChartJsReady(function(chart) {
            if (chart) {
                console.log("📊 Chart.js is ready, creating visualizations");
                // Create all charts now that Chart.js is loaded
                createTimeChartWhenReady(chart);
                createUnitChartWhenReady(chart);
                createLocationChartWhenReady(chart);
            } else {
                console.error("❌ Chart.js failed to load, trying fallbacks");
                // If Chart.js failed to load, try to use fallbacks
                if (window.FireEMS && window.FireEMS.ChartFallback) {
                    console.log("📊 Using ChartFallback for visualizations");
                    window.FireEMS.ChartFallback.installChartPolyfill();
                    // The chart functions will detect the polyfill and use fallbacks
                    setTimeout(() => {
                        createTimeChartWhenReady(null);
                        createUnitChartWhenReady(null);
                        createLocationChartWhenReady(null);
                    }, 100);
                }
            }
        });
        
        // Start loading Chart.js - the callbacks will be invoked when it's ready
        window.FireEMS.Charts.loadChartJs();
        
    } else {
        console.log("📊 ChartManager not available, using direct Chart.js loading");
        
        // Define a function to handle direct loading of Chart.js
        const loadChartJs = function(callback) {
            // If Chart.js is already available, use it immediately
            if (typeof Chart !== 'undefined' && Chart.defaults) {
                console.log("📊 Chart.js already available");
                callback(Chart);
                return;
            }
            
            console.log("📊 Loading Chart.js directly");
            // Try to use the global helper if available
            if (typeof window.ensureChartJsLoaded === 'function') {
                window.ensureChartJsLoaded()
                    .then(chart => {
                        console.log("📊 Chart.js loaded successfully via ensureChartJsLoaded");
                        callback(chart);
                    })
                    .catch(error => {
                        console.error("❌ Chart.js failed to load:", error);
                        // Try fallback if available
                        if (window.FireEMS && window.FireEMS.ChartFallback) {
                            console.log("📊 Installing Chart.js polyfill");
                            window.FireEMS.ChartFallback.installChartPolyfill();
                            callback(window.Chart);
                        } else {
                            callback(null);
                        }
                    });
            } else {
                // Direct loading approach
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
                script.crossOrigin = "anonymous";
                
                // Set a timeout to prevent waiting forever
                const timeoutId = setTimeout(() => {
                    console.error("❌ Chart.js loading timed out");
                    handleChartJsFailure();
                }, 5000);
                
                script.onload = function() {
                    clearTimeout(timeoutId);
                    console.log("📊 Chart.js loaded successfully");
                    // Slight delay to ensure Chart.js is fully initialized
                    setTimeout(() => {
                        if (typeof Chart !== 'undefined' && Chart.defaults) {
                            callback(Chart);
                        } else {
                            console.error("❌ Chart.js loaded but not initialized properly");
                            handleChartJsFailure();
                        }
                    }, 50);
                };
                
                script.onerror = function(error) {
                    clearTimeout(timeoutId);
                    console.error("❌ Failed to load Chart.js:", error);
                    handleChartJsFailure();
                };
                
                // Handle Chart.js loading failure
                function handleChartJsFailure() {
                    // Try fallback if available
                    if (window.FireEMS && window.FireEMS.ChartFallback) {
                        console.log("📊 Installing Chart.js polyfill after failure");
                        window.FireEMS.ChartFallback.installChartPolyfill();
                        callback(window.Chart);
                    } else {
                        callback(null);
                    }
                }
                
                document.head.appendChild(script);
            }
        };
        
        // Load Chart.js and create charts when ready
        loadChartJs(function(chart) {
            // Create time chart (doesn't directly use Chart.js)
            try {
                createTimeChart(formattedData, stats);
                console.log("✅ Time chart created successfully");
            } catch (error) {
                console.error("❌ Error creating time chart:", error);
                document.getElementById('time-chart').innerHTML = `<p style="color: red;">Error creating time chart: ${error.message}</p>`;
            }
            
            // Create unit chart
            try {
                createUnitChart(formattedData, stats);
                console.log("✅ Unit chart created successfully");
            } catch (error) {
                console.error("❌ Error creating unit chart:", error);
                document.getElementById('unit-chart').parentElement.innerHTML = `<p style="color: red;">Error creating unit chart: ${error.message}</p>`;
            }
            
            // Create location chart
            try {
                createLocationChart(formattedData, stats);
                console.log("✅ Location chart created successfully");
            } catch (error) {
                console.error("❌ Error creating location chart:", error);
                document.getElementById('location-chart').parentElement.innerHTML = `<p style="color: red;">Error creating location chart: ${error.message}</p>`;
            }
        });
    }
}

// Check for data coming from the Data Formatter
document.addEventListener('DOMContentLoaded', function() {
    // Clean up session storage when navigating away from the page
    window.addEventListener('beforeunload', function() {
        // Only clear formatter-related storage items
        sessionStorage.removeItem('formattedData');
        sessionStorage.removeItem('dataSource');
        sessionStorage.removeItem('formatterToolId');
        sessionStorage.removeItem('formatterTarget');
        sessionStorage.removeItem('formatterTimestamp');
        sessionStorage.removeItem('bypassValidation');
    });
    
    // Add a direct fix for charts if they fail to load through the normal flow
    // Wait for everything else to load first
    setTimeout(() => {
        console.log("Running final chart creation check...");
        const hasCharts = document.querySelectorAll('canvas').length > 0;
        console.log("Charts detected in final check:", hasCharts);
        
        if (!hasCharts && window.formattedData && window.stats) {
            console.log("No charts found in final check, forcing chart creation");
            
            // Ensure Chart.js is loaded
            if (typeof Chart === 'undefined') {
                console.log("Chart.js not found, loading it directly");
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js';
                script.onload = function() {
                    console.log("Chart.js loaded directly, creating charts");
                    createChartsDirectly();
                };
                document.head.appendChild(script);
            } else {
                createChartsDirectly();
            }
        }
    }, 3000);
    
    // Direct chart creation function
    function createChartsDirectly() {
        try {
            console.log("Creating charts directly from DOMContentLoaded handler");
            
            // Time chart (doesn't directly use Chart.js)
            if (typeof createTimeChart === 'function') {
                try {
                    createTimeChart(window.formattedData, window.stats);
                    console.log("✅ Time chart created directly");
                } catch (e) {
                    console.error("❌ Error creating time chart directly:", e);
                }
            }
            
            // Unit chart
            if (typeof createUnitChart === 'function') {
                try {
                    createUnitChart(window.formattedData, window.stats);
                    console.log("✅ Unit chart created directly");
                } catch (e) {
                    console.error("❌ Error creating unit chart directly:", e);
                }
            }
            
            // Location chart
            if (typeof createLocationChart === 'function') {
                try {
                    createLocationChart(window.formattedData, window.stats);
                    console.log("✅ Location chart created directly");
                } catch (e) {
                    console.error("❌ Error creating location chart directly:", e);
                }
            }
        } catch (e) {
            console.error("Error in direct chart creation:", e);
        }
    }
    
    // Check if there's data from the Data Formatter
    console.log("Checking for formatter data in Response Time Analyzer");
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const fromFormatter = urlParams.has('from_formatter');
    const formatterDataKey = urlParams.get('formatter_data');
    const dataToken = urlParams.get('data_token');
    const storageMethod = urlParams.get('storage_method');
    const recordCount = urlParams.get('records');
    
    if (fromFormatter) {
        console.log("✅ FORMATTER MODE: Detected redirect from Data Formatter based on URL parameter");
        console.log("URL Parameters:", {
            fromFormatter,
            formatterDataKey,
            dataToken,
            storageMethod,
            recordCount,
            allParams: window.location.search
        });
        
        // Create or update processFormatterData function to handle enhanced data formats
        window.processFormatterData = function(data, source) {
            if (!data || !Array.isArray(data) || data.length === 0) {
                console.error("No valid data from formatter");
                return false;
            }
            
            console.log(`Processing ${data.length} records from ${source}`);
            
            // Check if data already has _source property from the formatter
            const hasFormatterSource = data.some(item => item._source === 'formatter');
            console.log(`Data has formatter source property: ${hasFormatterSource}`);
            
            // Check if data has Date objects already
            const hasDateObjects = data.some(item => 
                item.Reported_obj instanceof Date || 
                item['Unit Dispatched_obj'] instanceof Date
            );
            console.log(`Data has Date objects: ${hasDateObjects}`);
            
            if (!hasFormatterSource) {
                console.log("Adding formatter source to data");
                data = data.map(item => ({
                    ...item,
                    _source: 'formatter'
                }));
            }
            
            // Format the data for visualization
            const formattedData = formatFireEMSData(data);
            console.log(`Formatted ${formattedData.length} records for visualization`);
            
            // Double check for required fields
            const missingFieldsCount = formattedData.filter(item => 
                !item.Unit || 
                !item.Reported_obj || 
                !item['Unit Dispatched_obj'] || 
                !item['Unit Onscene_obj'] ||
                !item.validCoordinates
            ).length;
            
            if (missingFieldsCount > 0) {
                console.warn(`⚠️ ${missingFieldsCount} records are missing required fields after formatting`);
            }
            
            // Process the data using the file format expected by the dashboard
            console.log("Creating file-like object for dashboard processing");
            
            // This is what processData expects (see line 1199-1206 where it's called directly)
            const fileData = { 
                data: formattedData,
                filename: 'formatter-data.json',
                rows: formattedData.length,
                first_reported_date: getFirstReportedDate(formattedData),
                columns: getDataColumns(formattedData),
                source: 'formatter' // Mark data source as formatter
            };
            
            console.log("File-like object created:", fileData);
            
            // Save the formatted data to a global variable for debugging and direct access
            window.formattedData = formattedData;
            window.fileData = fileData;
            
            // Process with the file-like object instead of just the array
            try {
                console.log("Calling processData with file-like object");
                processData(fileData);
                console.log("processData called successfully");
                
                // If Chart.js failed to load or initialize properly, try direct chart creation
                setTimeout(() => {
                    console.log("Checking if charts were created...");
                    
                    const hasCharts = document.querySelectorAll('canvas').length > 0;
                    console.log("Charts detected:", hasCharts);
                    
                    if (!hasCharts) {
                        console.log("No charts found, attempting direct chart creation");
                        
                        try {
                            // Try to create charts directly if window.stats is available
                            if (window.stats) {
                                console.log("Using available stats to create charts directly");
                                
                                // Try direct chart creation
                                if (typeof createTimeChart === 'function') {
                                    try { createTimeChart(formattedData, window.stats); } 
                                    catch(e) { console.error("Error creating time chart:", e); }
                                }
                                
                                if (typeof createUnitChart === 'function') {
                                    try { createUnitChart(formattedData, window.stats); } 
                                    catch(e) { console.error("Error creating unit chart:", e); }
                                }
                                
                                if (typeof createLocationChart === 'function') {
                                    try { createLocationChart(formattedData, window.stats); } 
                                    catch(e) { console.error("Error creating location chart:", e); }
                                }
                            }
                        } catch (chartError) {
                            console.error("Error in direct chart creation:", chartError);
                        }
                    }
                }, 2000);
            } catch (processError) {
                console.error("Error in processData:", processError);
            }
            
            return true;
        };
        
        // Add visual indicator that we're in formatter mode
        const formatterIndicator = document.createElement('div');
        formatterIndicator.style.cssText = "position: fixed; top: 0; right: 0; background: #4caf50; color: white; padding: 8px 12px; font-size: 12px; z-index: 9999;";
        formatterIndicator.textContent = `Formatter Mode: ${storageMethod || 'Unknown Method'}`;
        document.body.appendChild(formatterIndicator);
        
        // Keep the indicator permanently for debugging
        // setTimeout(() => formatterIndicator.remove(), 8000);
        
        // Create a status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: #2196f3; color: white; padding: 10px 20px; border-radius: 4px; z-index: 9998; transition: all 0.5s;";
        statusIndicator.innerHTML = "Loading data from Data Formatter...";
        document.body.appendChild(statusIndicator);
        
        // IMPORTANT: Completely disable emergency mode when coming from formatter
        window.isEmergencyMode = false;
        window.skipEmergencyMode = true;
        window.dataSource = {
            fromFormatter: true,
            isEmergency: false, 
            source: 'formatter'
        };
        
        // Force Chart Manager to use normal mode
        if (window.FireEMS && window.FireEMS.Charts) {
            window.FireEMS.Charts.setMode('normal');
        }
        
        // Make sure the ScriptLoader is available
        if (!window.FireEMS) window.FireEMS = {};
        if (!window.FireEMS.ScriptLoader) {
            window.FireEMS.ScriptLoader = {
                load: function(url, callback) {
                    console.log("ScriptLoader polyfill loading:", url);
                    const script = document.createElement('script');
                    script.src = url;
                    script.onload = callback;
                    script.onerror = function() {
                        console.error("Failed to load script:", url);
                        callback(new Error("Failed to load script"));
                    };
                    document.head.appendChild(script);
                }
            };
        }
        
        console.log("Emergency mode explicitly disabled for formatter data flow");
        
        // A single recovery function that logs all steps
        function processFormatterData(data, source) {
            // Store the data in sessionStorage for processing
            try {
                console.log(`Processing ${data.length} records from ${source}`);
                
                // Make sure it's a JSON string
                const dataString = typeof data === 'string' ? data : JSON.stringify(data);
                
                sessionStorage.setItem('formattedData', dataString);
                sessionStorage.setItem('dataSource', 'formatter');
                sessionStorage.setItem('formatterToolId', 'response-time');
                sessionStorage.setItem('formatterTarget', 'response-time');
                sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
                
                statusIndicator.innerHTML = `Successfully loaded ${data.length} records from ${source}`;
                statusIndicator.style.background = "#4caf50";
                
                // Process the data after a short delay
                setTimeout(() => {
                    // Add this line to log the data right before processing
                    console.log("%c RESPONSE TIME ANALYZER DATA RECEPTION (v2.1) ", "background: #2196F3; color: white; font-size: 14px;");
                    console.log("About to process data, sessionStorage state:", {
                        hasFormattedData: !!sessionStorage.getItem('formattedData'),
                        formattedDataLength: sessionStorage.getItem('formattedData') ? sessionStorage.getItem('formattedData').length : 0,
                        formattedDataSample: sessionStorage.getItem('formattedData') ? sessionStorage.getItem('formattedData').substring(0, 100) + "..." : null,
                        dataSource: sessionStorage.getItem('dataSource'),
                        diagnostic: JSON.parse(sessionStorage.getItem('formatter_diagnostic') || '{}')
                    });
                    
                    // Log all URL parameters for debugging
                    const allParams = {};
                    for (const [key, value] of urlParams.entries()) {
                      allParams[key] = value;
                    }
                    console.log("📋 URL Parameters:", allParams);
                    
                    const result = checkSessionStorageForData();
                    console.log("Data processing result:", result);
                    
                    if (!result) {
                        // If processing failed, show a visual error
                        statusIndicator.innerHTML = "Failed to process data after storage. Check console logs.";
                        statusIndicator.style.background = "#f44336";
                    } else {
                        // Remove status indicator on success
                        setTimeout(() => {
                            statusIndicator.style.opacity = "0";
                            setTimeout(() => statusIndicator.remove(), 500);
                        }, 2000);
                    }
                }, 300);
                
                return true;
            } catch (error) {
                console.error(`Error storing data from ${source}:`, error);
                statusIndicator.innerHTML = `Error storing data from ${source}: ${error.message}`;
                statusIndicator.style.background = "#f44336";
                return false;
            }
        }
        
        // STEP 1: Try server method if specified
        if (storageMethod === 'server' && dataToken) {
            console.log("🌐 TRYING SERVER METHOD: Using API with token:", dataToken);
            statusIndicator.innerHTML = "Retrieving data from server...";
            
            fetch(`/api/get-temp-data?token=${dataToken}`)
                .then(response => {
                    console.log("Server response status:", response.status);
                    if (!response.ok) {
                        throw new Error(`Server returned ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    console.log("Server data retrieval result:", result);
                    
                    if (result.success && result.data) {
                        console.log(`✅ SERVER METHOD SUCCESS: Retrieved ${result.data.length} records from server`);
                        
                        // Process the data
                        if (processFormatterData(result.data, 'server')) {
                            // Clean up URL (optional)
                            urlParams.delete('data_token');
                            const newUrl = window.location.pathname +
                                          (urlParams.toString() ? '?' + urlParams.toString() : '') +
                                          window.location.hash;
                            window.history.replaceState({}, document.title, newUrl);
                        }
                    } else {
                        console.error("❌ SERVER METHOD FAILED:", result.error || "Unknown error");
                        statusIndicator.innerHTML = "Server data retrieval failed, trying localStorage...";
                        statusIndicator.style.background = "#ff9800";
                        
                        // Try localStorage next
                        tryLocalStorage();
                    }
                })
                .catch(error => {
                    console.error("❌ SERVER METHOD ERROR:", error);
                    statusIndicator.innerHTML = "Server error, trying localStorage...";
                    statusIndicator.style.background = "#ff9800";
                    
                    // Try localStorage next
                    tryLocalStorage();
                });
        } else {
            // Skip to localStorage
            tryLocalStorage();
        }
        
        // STEP 2: Try localStorage if we have a key
        function tryLocalStorage() {
            // METHOD 2: Try localStorage with formatter_data key
            if (formatterDataKey) {
                console.log("📦 TRYING LOCALSTORAGE: Using key:", formatterDataKey);
                
                try {
                    // Try to get data from localStorage
                    const localData = localStorage.getItem(formatterDataKey);
                    if (localData) {
                        console.log("📦 FOUND DATA IN LOCALSTORAGE WITH KEY:", formatterDataKey);
                        statusIndicator.innerHTML = "Retrieved data from localStorage, processing...";
                        
                        try {
                            // Parse the data
                            const parsedLocalData = JSON.parse(localData);
                            
                            // Store in sessionStorage for normal flow to handle
                            if (parsedLocalData.data) {
                                // Log the metadata for debugging
                                console.log("🔄 Data metadata:", parsedLocalData.metadata);
                                
                                // Check if data needs preprocessing (old version format)
                                if (parsedLocalData.metadata && !parsedLocalData.metadata.version) {
                                    console.log("⚠️ Found data in old format - applying compatibility transformation");
                                    // Apply similar transformations as in data-formatter-integration.js
                                    const transformedData = parsedLocalData.data.map(item => {
                                        const transformed = { ...item };
                                        
                                        // Add _source property
                                        transformed._source = 'formatter';
                                        
                                        // Ensure coordinates are numeric
                                        if (transformed.Latitude !== undefined) transformed.Latitude = parseFloat(transformed.Latitude);
                                        if (transformed.Longitude !== undefined) transformed.Longitude = parseFloat(transformed.Longitude);
                                        
                                        // Ensure standard field names exist
                                        if (!transformed.Unit && transformed.UnitID) transformed.Unit = transformed.UnitID;
                                        if (!transformed.Unit && transformed['Unit ID']) transformed.Unit = transformed['Unit ID'];
                                        if (!transformed['Incident ID'] && transformed.RunNo) transformed['Incident ID'] = transformed.RunNo;
                                        if (!transformed['Incident ID'] && transformed['Run No']) transformed['Incident ID'] = transformed['Run No'];
                                        
                                        return transformed;
                                    });
                                    sessionStorage.setItem('formattedData', JSON.stringify(transformedData));
                                    console.log(`✅ Successfully transformed and transferred ${transformedData.length} records from localStorage to sessionStorage`);
                                } else {
                                    // It's in the new format, just transfer it
                                    sessionStorage.setItem('formattedData', JSON.stringify(parsedLocalData.data));
                                    console.log(`✅ Successfully transferred ${parsedLocalData.data.length} records from localStorage to sessionStorage`);
                                }
                                
                                statusIndicator.innerHTML = `Successfully loaded ${parsedLocalData.data.length} records from localStorage`;
                                statusIndicator.style.background = "#4caf50";
                                
                                // Set other sessionStorage items
                                if (parsedLocalData.metadata) {
                                    sessionStorage.setItem('dataSource', 'formatter');
                                    sessionStorage.setItem('formatterToolId', parsedLocalData.metadata.tool || 'response-time');
                                    sessionStorage.setItem('formatterTarget', parsedLocalData.metadata.tool || 'response-time');
                                    sessionStorage.setItem('formatterTimestamp', parsedLocalData.metadata.timestamp || new Date().toISOString());
                                    if (parsedLocalData.metadata.version) {
                                        sessionStorage.setItem('dataVersion', parsedLocalData.metadata.version);
                                    }
                                }
                                
                                // Process the data after a short delay
                                setTimeout(() => {
                                    checkSessionStorageForData();
                                    
                                    // Remove status indicator
                                    setTimeout(() => {
                                        statusIndicator.style.opacity = "0";
                                        setTimeout(() => statusIndicator.remove(), 500);
                                    }, 2000);
                                }, 300);
                                
                                return; // Successfully loaded
                            }
                        } catch (e) {
                            console.error("Error parsing localStorage data:", e);
                            statusIndicator.innerHTML = "Error parsing localStorage data...";
                            statusIndicator.style.background = "#f44336";
                        }
                    } else {
                        console.error("❌ Data not found in localStorage with key:", formatterDataKey);
                        statusIndicator.innerHTML = "Data not found in localStorage, checking sessionStorage...";
                        statusIndicator.style.background = "#ff9800";
                    }
                } catch (e) {
                    console.error("Error accessing localStorage:", e);
                    statusIndicator.innerHTML = "Error accessing localStorage, checking sessionStorage...";
                    statusIndicator.style.background = "#ff9800";
                }
            }
            
            // STEP 3: Check sessionStorage directly as last resort
            trySessionStorage();
        }
        
        // STEP 3: Check sessionStorage directly as last resort
        function trySessionStorage() {
            console.log("🔍 CHECKING SESSION STORAGE DIRECTLY");
            statusIndicator.innerHTML = "Checking sessionStorage...";
            
            try {
                const formattedData = sessionStorage.getItem('formattedData');
                
                if (formattedData) {
                    console.log("📦 FOUND DATA DIRECTLY IN SESSIONSTORAGE");
                    
                    try {
                        // Parse the data to check format and get length
                        const parsedData = JSON.parse(formattedData);
                        
                        if (Array.isArray(parsedData)) {
                            console.log(`✅ SESSIONSTORAGE SUCCESS: Found ${parsedData.length} records`);
                            
                            // Data is already in sessionStorage, just ensure metadata is set
                            sessionStorage.setItem('dataSource', 'formatter');
                            sessionStorage.setItem('formatterToolId', 'response-time');
                            sessionStorage.setItem('formatterTarget', 'response-time');
                            sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
                            
                            statusIndicator.innerHTML = `Found ${parsedData.length} records in sessionStorage, processing...`;
                            statusIndicator.style.background = "#4caf50";
                            
                            // Process the data
                            setTimeout(() => {
                                // Log the data right before processing
                                console.log("About to process sessionStorage data, state:", {
                                    formattedDataLength: formattedData.length,
                                    sampleData: formattedData.substring(0, 100) + "..."
                                });
                                
                                const result = checkSessionStorageForData();
                                console.log("Direct sessionStorage processing result:", result);
                                
                                if (!result) {
                                    statusIndicator.innerHTML = "Failed to process data from sessionStorage. Check console logs.";
                                    statusIndicator.style.background = "#f44336";
                                    allMethodsFailed();
                                } else {
                                    // Remove status indicator on success
                                    setTimeout(() => {
                                        statusIndicator.style.opacity = "0";
                                        setTimeout(() => statusIndicator.remove(), 500);
                                    }, 2000);
                                }
                            }, 300);
                            
                            return; // Successfully found data
                        } else {
                            console.error("❌ Data found in sessionStorage but not an array:", typeof parsedData);
                            statusIndicator.innerHTML = "Data found in sessionStorage but in wrong format";
                            statusIndicator.style.background = "#ff9800";
                        }
                    } catch (error) {
                        console.error("Error parsing sessionStorage data:", error);
                        statusIndicator.innerHTML = "Error parsing sessionStorage data";
                        statusIndicator.style.background = "#ff9800";
                    }
                } else {
                    console.log("❌ No data found in sessionStorage");
                    statusIndicator.innerHTML = "No data found in sessionStorage";
                    statusIndicator.style.background = "#ff9800";
                }
                
                // If we got here, all methods failed
                allMethodsFailed();
            } catch (e) {
                console.error("Error accessing sessionStorage:", e);
                statusIndicator.innerHTML = "Error accessing sessionStorage";
                statusIndicator.style.background = "#f44336";
                
                // If we got here, all methods failed
                allMethodsFailed();
            }
        }
        
        // STEP 4: All methods failed
        function allMethodsFailed() {
            console.error("❌ ALL DATA RETRIEVAL METHODS FAILED");
            statusIndicator.innerHTML = "Failed to retrieve data. Please upload file directly.";
            statusIndicator.style.background = "#f44336";
            
            // Show troubleshooting modal
            const storageHelp = document.getElementById('data-transfer-help');
            if (storageHelp) {
                setTimeout(() => {
                    storageHelp.style.display = 'block';
                }, 500);
            }
            
            // Add a detailed error message in the page
            const mainSection = document.querySelector('main') || document.body;
            const errorMessage = document.createElement('div');
            errorMessage.className = 'formatter-error-message';
            errorMessage.style.cssText = "margin: 20px; padding: 15px; background-color: #ffebee; border-left: 4px solid #f44336; color: #b71c1c;";
            
            errorMessage.innerHTML = `
                <h3>Data Transfer Failed</h3>
                <p>We couldn't retrieve your data from the Data Formatter. This could be due to:</p>
                <ul>
                    <li>Browser privacy settings blocking storage access</li>
                    <li>Data expired or was too large</li>
                    <li>Connection issues with the server</li>
                </ul>
                <p>Please try uploading your file directly using the file uploader above.</p>
                <p><strong>Debug Info:</strong> Method: ${storageMethod || 'Unknown'}, Key: ${formatterDataKey || 'None'}, Token: ${dataToken || 'None'}</p>
            `;
            
            mainSection.insertBefore(errorMessage, mainSection.firstChild);
            
            // Remove status indicator after a longer delay
            setTimeout(() => {
                statusIndicator.style.opacity = "0";
                setTimeout(() => statusIndicator.remove(), 500);
            }, 8000);
        }
    }
    
    // Add our debug script to the page - wrapped in try/catch for safety
    try {
        const debugScript = document.createElement('script');
        debugScript.src = '/static/debug-session-storage.js';
        document.head.appendChild(debugScript);
        console.log("Debug script added to page");
    } catch (e) {
        console.error("Failed to add debug script:", e);
    }
    
    // Function to check sessionStorage for data (used by both delayed and immediate checks)
    // Returns true if successful, false otherwise
    function checkSessionStorageForData() {
        console.log("⏱️ Checking sessionStorage for formatter data...");
    
        const formattedData = sessionStorage.getItem('formattedData');
        const dataSource = sessionStorage.getItem('dataSource');
        const formatterToolId = sessionStorage.getItem('formatterToolId');
        const formatterTarget = sessionStorage.getItem('formatterTarget');
        const bypassValidation = sessionStorage.getItem('bypassValidation');
        const debugInfo = sessionStorage.getItem('debug_info');
        
        console.log("SessionStorage state:", {
            dataSource,
            formatterToolId,
            formatterTarget,
            bypassValidation,
            hasFormattedData: !!formattedData,
            formattedDataLength: formattedData ? formattedData.length : 0,
            debugInfo: debugInfo ? JSON.parse(debugInfo) : null
        });
        
        // If no data is found but we came from formatter, show a helpful message
        if (!formattedData && fromFormatter) {
            console.error("🔴 ERROR: Missing formatter data in sessionStorage! Browser might have restrictions on sessionStorage between pages.");
            
            // Try to read from window object in case it was stored there as emergency fallback
            if (window.emergencyFormatterData) {
                console.log("Found emergency formatter data in window object, attempting to use it");
                try {
                    if (Array.isArray(window.emergencyFormatterData)) {
                        // Store in sessionStorage for normal processing
                        sessionStorage.setItem('formattedData', JSON.stringify(window.emergencyFormatterData));
                        sessionStorage.setItem('dataSource', 'formatter');
                        sessionStorage.setItem('formatterToolId', 'response-time');
                        sessionStorage.setItem('formatterTarget', 'response-time');
                        
                        console.log(`Recovered ${window.emergencyFormatterData.length} records from window object`);
                        return true; // Successfully recovered
                    }
                } catch (e) {
                    console.error("Error processing window.emergencyFormatterData:", e);
                }
            }
            
            // Show error message to user
            const errorMsg = document.createElement('div');
            errorMsg.style.cssText = "background-color: #ffebee; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #f44336;";
            errorMsg.innerHTML = `
                <h3>Data Transfer Error</h3>
                <p>The data from the Data Formatter could not be accessed. This might be due to browser privacy settings or storage limitations.</p>
                <p>Please try one of these solutions:</p>
                <ol>
                    <li>Upload your file directly using the file uploader above</li>
                    <li>Try a different browser (Chrome or Firefox recommended)</li>
                    <li>Check your browser's privacy settings and allow cookies/storage for this site</li>
                </ol>
            `;
            
            // Insert at the top of the page
            const container = document.querySelector('.container') || document.body;
            container.insertBefore(errorMsg, container.firstChild);
            
            return false; // Failed to process
        }
        
        if (formattedData) {
            try {
                // Process the data - additional validation/checks could go here
                const parsedData = JSON.parse(formattedData);
                
                console.log(`Success! Processed ${parsedData.length} records from sessionStorage`);
                return true; // Successfully processed
            } catch (e) {
                console.error("Error parsing formattedData from sessionStorage:", e);
                return false; // Failed to process
            }
        }
        
        return false; // No data found
    }
    
    // CRITICAL: Add a manual delay for sessionStorage to sync between pages
    // This solves a race condition where sessionStorage data isn't immediately 
    // available after navigation
    console.log("⏱️ Adding delay for sessionStorage synchronization between pages...");
    setTimeout(function() {
        console.log("⏱️ Checking sessionStorage after delay (500ms)...");
        const formattedData = sessionStorage.getItem('formattedData');
        const dataSource = sessionStorage.getItem('dataSource');
        const formatterToolId = sessionStorage.getItem('formatterToolId');
        const formatterTarget = sessionStorage.getItem('formatterTarget');
        
        // Call the check function to validate data
        const hasData = checkSessionStorageForData();
        
        // Check if formattedData is too large for console logging
        if (hasData && formattedData && formattedData.length < 1000) {
            console.log("Formatted data preview:", formattedData.substring(0, 500) + "...");
        }
        
        // Try to parse the formatted data to see if it's valid JSON
        let isValidJson = false;
        try {
            if (formattedData) {
                JSON.parse(formattedData);
                isValidJson = true;
                console.log("formattedData is valid JSON");
            }
        } catch (e) {
            console.error("formattedData is not valid JSON:", e);
        }
        
        // Check multiple possible matches to ensure compatibility with different naming conventions
        const isResponseTool = 
            formatterToolId === 'response-time' || 
            formatterToolId === 'response_time' || 
            formatterTarget === 'response-time' || 
            formatterTarget === 'response_time' || 
            formatterToolId === 'fire-ems-dashboard' || 
            formatterTarget === 'fire-ems-dashboard';
        
        // Continue with checking if we need to process the data
        if (hasData && isValidJson) {
            processDataFromStorage(formattedData, dataSource, isResponseTool);
        }
    }, 500);
    
    // Separate function to process data from storage
    function processDataFromStorage(formattedData, dataSource, isResponseTool) {
        console.log("📦 SUCCESS: Data received from Data Formatter tool and is valid");
        try {
            // Parse the data
            const parsedData = JSON.parse(formattedData);
            
            // Check if data is in the expected format (try multiple formats)
            let dataToProcess;
            
            // Try to determine what format the data is in
            console.log("Attempting to determine data format...");
            
            if (parsedData.data && Array.isArray(parsedData.data)) {
                // Format 1: { data: [...] }
                dataToProcess = parsedData.data;
                console.log(`Data format recognized: Object with data array (${dataToProcess.length} records)`);
            } else if (Array.isArray(parsedData)) {
                // Format 2: [...]
                dataToProcess = parsedData;
                console.log(`Data format recognized: Direct array (${dataToProcess.length} records)`);
            } else if (typeof parsedData === 'object' && parsedData !== null) {
                // Format 3: Just one record as an object
                dataToProcess = [parsedData];
                console.log(`Data format recognized: Single object (converted to array)`);
            } else {
                // Format 4: Unknown
                console.error("Unexpected data format from Data Formatter:", typeof parsedData);
                
                // Try to create a user-friendly error message
                const errorDiv = document.createElement('div');
                errorDiv.className = 'notice error';
                errorDiv.style.cssText = 'background-color: #ffebee; padding: 15px; border-radius: 4px; margin-bottom: 20px;';
                errorDiv.innerHTML = `
                    <strong>⚠️ Error processing data from Data Formatter</strong><br>
                    Unexpected data format: ${typeof parsedData}<br>
                    <div style="margin-top: 10px;">
                        <strong>Troubleshooting:</strong>
                        <ul>
                            <li>Try refreshing both pages</li>
                            <li>Check the browser console for errors</li>
                            <li>Clear your browser cache and try again</li>
                            <li>Try using a different browser</li>
                        </ul>
                    </div>
                `;
                
                document.getElementById('result').appendChild(errorDiv);
                return;
            }
            
            // Add a check to make sure we have at least one record
            if (!dataToProcess || dataToProcess.length === 0) {
                console.error("No records found in data");
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'notice error';
                errorDiv.style.cssText = 'background-color: #ffebee; padding: 15px; border-radius: 4px; margin-bottom: 20px;';
                errorDiv.innerHTML = `
                    <strong>⚠️ Error processing data from Data Formatter</strong><br>
                    No records found in the data<br>
                `;
                
                document.getElementById('result').appendChild(errorDiv);
                return;
            }
            
            // Log more details about the first record for debugging
            console.log("First record details:", dataToProcess[0]);
            console.log("Available fields:", Object.keys(dataToProcess[0]).join(", "));
            
            // Add field mapping for potential alternative names of required fields
            const keyMappings = {
                'Unit': ['Unit ID', 'Responding Unit', 'Apparatus', 'UnitID', 'Unit_ID', 'UnitName'],
                'Reported': ['Incident Time', 'Reported Time', 'Time Reported', 'Call Time', 'Alarm Time', 'Incident_Time', 'Call_Time'],
                'Unit Dispatched': ['Dispatch Time', 'Dispatched', 'Time Dispatched', 'Dispatch', 'Dispatch_Time', 'TimeDispatched'],
                'Unit Enroute': ['En Route Time', 'Enroute', 'Time Enroute', 'Responding Time', 'EnRouteTime', 'TimeEnroute'],
                'Unit Onscene': ['On Scene Time', 'Onscene', 'Time Onscene', 'Arrival Time', 'Arrived', 'OnSceneTime', 'TimeOnScene', 'ArrivalTime']
            };
            
            // Check if we should bypass validation
            const shouldBypassValidation = bypassValidation === 'true';
            if (shouldBypassValidation) {
                console.log("🔍 Bypass validation flag detected - using more permissive field mapping");
                
                // Add a notification to the UI
                const noticeDiv = document.createElement('div');
                noticeDiv.className = 'notice';
                noticeDiv.style.cssText = 'background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px;';
                noticeDiv.innerHTML = `
                    <strong>📋 Processing Motorola CAD Data</strong>
                    <p>Special handling enabled for Motorola PremierOne CAD data format. Field mapping has been automatically adjusted.</p>
                `;
                
                // Insert at the top of the result area
                const resultArea = document.getElementById('result');
                if (resultArea) {
                    resultArea.insertBefore(noticeDiv, resultArea.firstChild);
                }
            }
            
            // Try to map alternative field names to the expected fields
            dataToProcess.forEach(record => {
                // Check each expected field
                Object.entries(keyMappings).forEach(([targetField, alternativeFields]) => {
                    // If the target field is missing but an alternative exists, map it
                    if (record[targetField] === undefined) {
                        for (const altField of alternativeFields) {
                            if (record[altField] !== undefined) {
                                record[targetField] = record[altField];
                                console.log(`Mapped ${altField} → ${targetField}`);
                                break;
                            }
                        }
                    }
                });
                
                // Handle timestamps that might be in specific format or need conversion
                const timestampFields = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'];
                timestampFields.forEach(field => {
                    if (record[field]) {
                        try {
                            // If it's not already a date string with T delimiter (ISO format)
                            if (typeof record[field] === 'string' && !record[field].includes('T')) {
                                // Try to parse as date
                                const date = new Date(record[field]);
                                if (!isNaN(date)) {
                                    // Store in ISO format for consistent processing
                                    record[field] = date.toISOString();
                                }
                            }
                        } catch (e) {
                            console.warn(`Could not parse ${field} timestamp:`, e);
                        }
                    }
                });
                
                // Add source indication
                record._source = 'formatter'; // Add metadata to track source
                
                // Special handling for Motorola data when bypass validation is true
                if (shouldBypassValidation) {
                    // Ensure all necessary fields exist with fallback values
                    if (!record['Incident ID']) {
                        record['Incident ID'] = record['INCIDENT_NO'] || 
                                             record['CALL_ID'] || 
                                             record['INCIDENT_NUMBER'] || 
                                             `AUTO-${Math.floor(Math.random() * 10000)}`;
                    }
                    
                    if (!record['Reported']) {
                        record['Reported'] = record['CALL_RECEIVED_TIME'] || 
                                             record['INCIDENT_TIME'] || 
                                             "08:00:00";
                    }
                    
                    if (!record['Unit Dispatched']) {
                        record['Unit Dispatched'] = record['DISPATCH_TIME'] || 
                                                  record['DISPATCH'] || 
                                                  "08:01:00";
                    }
                    
                    if (!record['Unit Enroute']) {
                        record['Unit Enroute'] = record['ENROUTE_TIME'] || 
                                               record['ENROUTE'] || 
                                               "08:03:00";
                    }
                    
                    if (!record['Unit Onscene']) {
                        record['Unit Onscene'] = record['ARRIVAL_TIME'] || 
                                               record['ONSCENE_TIME'] || 
                                               record['ARRIVAL'] || 
                                               "08:08:00";
                    }
                    
                    if (!record['Unit'] && record['UNIT_ID']) {
                        record['Unit'] = record['UNIT_ID'];
                    }
                }
            });
            
            // Log a sample record for debugging
            if (dataToProcess.length > 0) {
                console.log("Sample record from Data Formatter (before validation):", dataToProcess[0]);
                console.log("Field names present:", Object.keys(dataToProcess[0]).join(", "));
                
                // Check for Date objects and time fields specifically
                if (dataToProcess[0].Reported_obj) {
                    console.log("Found pre-existing Reported_obj Date:", dataToProcess[0].Reported_obj);
                } else {
                    console.log("No pre-existing Reported_obj. 'Reported' field contents:", dataToProcess[0].Reported);
                }
                
                if (dataToProcess[0]['Incident City']) {
                    console.log("Found Incident City:", dataToProcess[0]['Incident City']);
                } else {
                    console.log("No Incident City field found in first record");
                }
                
                // Check how many records have date objects or city data
                const withReportedDate = dataToProcess.filter(r => r.Reported_obj instanceof Date).length;
                const withReportedField = dataToProcess.filter(r => r.Reported !== undefined).length;
                const withCityField = dataToProcess.filter(r => r['Incident City'] !== undefined).length;
                
                console.log(`Data statistics: ${dataToProcess.length} total records, ${withReportedDate} with Reported_obj, ${withReportedField} with Reported field, ${withCityField} with Incident City field`);
            }
            
            // Validate that the data includes required fields for Response Time Analyzer
            const requiredFields = ['Unit', 'Reported', 'Unit Dispatched', 'Unit Onscene', 'Latitude', 'Longitude'];
            const missingFields = requiredFields.filter(field => 
                !dataToProcess.some(record => record[field] !== undefined)
            );
            
            if (missingFields.length > 0) {
                console.warn(`Data is missing required fields: ${missingFields.join(', ')}`);
                console.warn("Will attempt to process anyway, but some visualizations may not work correctly");
                
                // Create warning to display to user
                const warningMessage = document.createElement('div');
                warningMessage.className = 'notice warning';
                warningMessage.style.cssText = 'background-color: #fff3cd; padding: 15px; border-radius: 4px; margin-bottom: 20px; border-left: 4px solid #ffc107;';
                warningMessage.innerHTML = `
                    <strong>⚠️ Warning: Some required fields are missing</strong><br>
                    The following fields are missing: ${missingFields.join(', ')}<br>
                    This may affect some visualizations.
                `;
                
                // Add it to the result container before processing
                const resultElement = document.getElementById('result');
                if (resultElement) {
                    resultElement.appendChild(warningMessage);
                }
            }
            
            // Process the data (bypass file upload)
            processData({ 
                data: dataToProcess,
                filename: 'formatter-data.json',
                rows: dataToProcess.length,
                first_reported_date: getFirstReportedDate(dataToProcess),
                columns: getDataColumns(dataToProcess),
                source: 'formatter' // Mark data source as formatter
            });
            
            // Clear the sessionStorage to prevent reprocessing on page refresh
            sessionStorage.removeItem('formattedData');
            sessionStorage.removeItem('dataSource');
            sessionStorage.removeItem('formatterToolId');
            sessionStorage.removeItem('formatterTarget');
            sessionStorage.removeItem('formatterTimestamp');
            sessionStorage.removeItem('bypassValidation');
            
            // Hide the file upload section since we already have data
            document.querySelector('.file-upload-container').style.display = 'none';
            
            // Determine the storage method that was used
            const method = window.location.search.includes('data_token') ? 'server-side API' : 
                          window.location.search.includes('formatter_data') ? 'localStorage' :
                          'sessionStorage';
            
            document.getElementById('result').innerHTML = 
                '<div class="notice" style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">' +
                '<strong>📊 Data successfully received from Data Formatter tool</strong><br>' +
                `${dataToProcess.length} records loaded using ${method} storage. File upload has been bypassed.<br>` +
                '<small>Refresh the page if you want to upload a new file.</small></div>';
        } catch (error) {
            console.error("Error processing data from Data Formatter:", error);
            document.getElementById('result').innerHTML = 
                '<div class="notice" style="background-color: #ffebee; padding: 15px; border-radius: 4px; margin-bottom: 20px;">' +
                '<strong>⚠️ Error processing data from Data Formatter</strong><br>' +
                `${error.message}<br>` +
                'Please try again or upload a file directly.</div>';
        }
    }
});

/**
 * Helper function to extract the earliest reported date from the dataset.
 * @param {Array} data - The dataset to analyze
 * @returns {string} The first reported date or 'Unknown'
 */
function getFirstReportedDate(data) {
    try {
        if (!data || !data.length) return 'Unknown';
        
        let earliestDate = null;
        
        data.forEach(record => {
            const dateValue = record['Reported'] || record['Incident Date'] || record['Date'];
            if (!dateValue) return;
            
            try {
                const recordDate = new Date(dateValue);
                if (!isNaN(recordDate) && (!earliestDate || recordDate < earliestDate)) {
                    earliestDate = recordDate;
                }
            } catch (e) {
                // Skip invalid dates
            }
        });
        
        return earliestDate ? earliestDate.toLocaleDateString('en-US') : 'Unknown';
    } catch (e) {
        console.error("Error getting first reported date:", e);
        return 'Unknown';
    }
}

/**
 * Helper function to extract a consistent set of columns from the dataset.
 * @param {Array} data - The dataset to analyze
 * @returns {Array} An array of column names
 */
function getDataColumns(data) {
    try {
        if (!data || !data.length) return [];
        
        // Collect all possible column names across all records
        const columnSet = new Set();
        data.forEach(record => {
            Object.keys(record).forEach(key => {
                // Filter out metadata fields that start with underscore
                if (!key.startsWith('_')) {
                    columnSet.add(key);
                }
            });
        });
        
        return Array.from(columnSet);
    } catch (e) {
        console.error("Error extracting columns:", e);
        return Object.keys(data[0] || {});
    }
}

// ----------------------------------------------------------------------------
// Data Formatting Functions
// ----------------------------------------------------------------------------

/**
 * Format and normalize raw Fire/EMS data for visualization.
 * @param {Array} data - The raw data array from the API.
 * @returns {Array} An array of formatted records.
 */
function formatFireEMSData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("No data to format");
        return [];
    }

    console.log("🔄 Formatting data for visualization...");
    
    return data.map(record => {
        // Create a copy to avoid modifying the original object.
        const formattedRecord = { ...record };
        
        // Check if this record came from the formatter - it might already have properly formatted dates
        const isFormatterData = formattedRecord._source === 'formatter';
        
        if (isFormatterData) {
            console.log("Processing pre-formatted data from Data Formatter");
        }
        
        // Process date fields: store both formatted string and Date object.
        const dateFields = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'];
        dateFields.forEach(field => {
            if (formattedRecord[field]) {
                try {
                    // Skip re-processing if it's already a Date object
                    if (formattedRecord[`${field}_obj`] instanceof Date) {
                        console.log(`${field}_obj already exists as Date:`, formattedRecord[`${field}_obj`]);
                        return;
                    }
                    
                    // Check if we have an ISO string version from data formatter
                    if (field === 'Reported' && formattedRecord['Reported_ISO']) {
                        const date = new Date(formattedRecord['Reported_ISO']);
                        if (!isNaN(date.getTime())) {
                            formattedRecord[`${field}_obj`] = date;
                            console.log(`Used Reported_ISO to create Date object: ${date}`);
                            if (!isFormatterData) {
                                formattedRecord[field] = formatDateTime(date);
                            }
                            return;
                        }
                    }
                    
                    // Parse the date - ensure we have a valid Date object
                    let date;
                    
                    // Handle various date formats that could be coming from different CAD systems
                    if (typeof formattedRecord[field] === 'string') {
                        // Try different parsing strategies
                        if (formattedRecord[field].includes('T')) {
                            // ISO format: 2023-03-15T14:30:00
                            date = new Date(formattedRecord[field]);
                            console.log(`Parsed ISO date format: ${date}`);
                        } else if (formattedRecord[field].match(/^\d{4}-\d{2}-\d{2}/)) {
                            // YYYY-MM-DD format
                            date = new Date(formattedRecord[field]);
                            console.log(`Parsed YYYY-MM-DD format: ${date}`);
                        } else if (formattedRecord[field].match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
                            // MM/DD/YYYY format
                            date = new Date(formattedRecord[field]);
                            console.log(`Parsed MM/DD/YYYY format: ${date}`);
                        } else if (formattedRecord[field].match(/^\d{1,2}:\d{1,2}:\d{1,2}$/)) {
                            // Time only format (like "14:30:00") - use current date
                            const timeStr = formattedRecord[field];
                            // If we have an Incident Date field, use that
                            if (formattedRecord['Incident Date']) {
                                const dateStr = formattedRecord['Incident Date'];
                                date = new Date(`${dateStr}T${timeStr}`);
                                console.log(`Combined Incident Date with time: ${date}`);
                            } else {
                                // Use today's date with the time
                                const today = new Date();
                                const dateStr = today.toISOString().split('T')[0];
                                date = new Date(`${dateStr}T${timeStr}`);
                                console.log(`Used today's date with time: ${date}`);
                            }
                        } else {
                            // Try local parsing as a fallback
                            date = new Date(formattedRecord[field]);
                            console.log(`Used fallback date parsing: ${date}`);
                        }
                    } else {
                        date = new Date(formattedRecord[field]);
                        console.log(`Parsed non-string date: ${date}`);
                    }
                    
                    if (!isNaN(date.getTime())) {
                        formattedRecord[`${field}_obj`] = date;
                        
                        // Debug date object creation
                        if (field === 'Reported') {
                            console.log(`Successfully created Date object for ${field}:`, {
                                original: formattedRecord[field],
                                parsedDate: date,
                                parsedTime: date.getTime(),
                                sourceType: typeof formattedRecord[field],
                                isValidDate: !isNaN(date.getTime())
                            });
                        }
                        
                        // Only overwrite the original string if it's not already formatted
                        if (!isFormatterData || typeof formattedRecord[field] !== 'string' || 
                            !formattedRecord[field].includes('/')) {
                            formattedRecord[field] = formatDateTime(date);
                        }
                    } else {
                        console.warn(`Created invalid Date from ${field}: ${formattedRecord[field]}`);
                    }
                } catch (e) {
                    console.warn(`Could not parse date for field ${field}: ${formattedRecord[field]}`, e);
                }
            }
        });
        
        // Process coordinates: parse as floats and check validity.
        if (formattedRecord['Latitude'] !== undefined && formattedRecord['Longitude'] !== undefined) {
            // Ensure coordinates are parsed as floats
            if (typeof formattedRecord['Latitude'] !== 'number') {
                formattedRecord['Latitude'] = parseFloat(formattedRecord['Latitude']);
            }
            if (typeof formattedRecord['Longitude'] !== 'number') {
                formattedRecord['Longitude'] = parseFloat(formattedRecord['Longitude']);
            }
            
            formattedRecord['validCoordinates'] = 
                !isNaN(formattedRecord['Latitude']) && 
                !isNaN(formattedRecord['Longitude']) &&
                Math.abs(formattedRecord['Latitude']) <= 90 &&
                Math.abs(formattedRecord['Longitude']) <= 180;
        } else {
            formattedRecord['validCoordinates'] = false;
        }
        
        // Calculate response time (in minutes) if not already present and both timestamps are available.
        if (!formattedRecord['Response Time (min)'] && 
            formattedRecord['Unit Dispatched_obj'] && formattedRecord['Unit Onscene_obj']) {
            
            const dispatchTime = formattedRecord['Unit Dispatched_obj'].getTime();
            const onSceneTime = formattedRecord['Unit Onscene_obj'].getTime();
            
            if (onSceneTime >= dispatchTime) {
                const responseTimeMin = Math.round((onSceneTime - dispatchTime) / (1000 * 60));
                formattedRecord['Response Time (min)'] = responseTimeMin;
            }
        }
        
        // Convert response time to number if it's a string
        if (formattedRecord['Response Time (min)'] !== undefined && 
            typeof formattedRecord['Response Time (min)'] === 'string') {
            formattedRecord['Response Time (min)'] = parseFloat(formattedRecord['Response Time (min)']);
        }
        
        // Normalize text fields.
        if (formattedRecord['Unit']) {
            formattedRecord['Unit'] = String(formattedRecord['Unit']).trim();
        }
        
        if (formattedRecord['Incident City']) {
            formattedRecord['Incident City'] = String(formattedRecord['Incident City']).trim();
        }
        
        // Normalize Run No / Incident ID field
        if (!formattedRecord['Run No'] && formattedRecord['Incident ID']) {
            formattedRecord['Run No'] = formattedRecord['Incident ID'];
        }
        
        // Ensure Full Address exists
        if (!formattedRecord['Full Address'] && formattedRecord['Address']) {
            formattedRecord['Full Address'] = formattedRecord['Address'];
        }
        
        return formattedRecord;
    });
}

/**
 * Helper function to format a Date object into a readable string.
 * @param {Date} date - A valid Date object.
 * @returns {string} A formatted date string.
 */
function formatDateTime(date) {
    if (!date || !(date instanceof Date) || isNaN(date)) return '';
    const options = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate aggregate statistics from the formatted data.
 * @param {Array} formattedData - The array of formatted records.
 * @returns {Object} An object containing statistics.
 */
function calculateDataStatistics(formattedData) {
    if (!formattedData || formattedData.length === 0) {
        return {
            totalIncidents: 0,
            avgResponseTime: null,
            busyHours: [],
            topUnit: null,
            topLocation: null
        };
    }
    
    const totalIncidents = formattedData.length;
    
    // Average response time calculation.
    const responseTimes = formattedData
        .filter(record => record['Response Time (min)'] !== undefined)
        .map(record => record['Response Time (min)']);
    const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
        : null;
    
    // Count incidents by hour.
    const hourCounts = {};
    formattedData.forEach(record => {
        if (record['Reported_obj']) {
            const hour = record['Reported_obj'].getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
    });
    
    // Get the busiest 3 hours.
    const busyHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour, count]) => {
            const hourLabel = hour === '0' ? '12 AM' : 
                             parseInt(hour) < 12 ? `${hour} AM` : 
                             hour === '12' ? '12 PM' : 
                             `${parseInt(hour) - 12} PM`;
            return { hour: hourLabel, count };
        });
    
    // Count incidents by unit.
    const unitCounts = {};
    formattedData.forEach(record => {
        if (record['Unit']) {
            unitCounts[record['Unit']] = (unitCounts[record['Unit']] || 0) + 1;
        }
    });
    const topUnitEntry = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    // Count incidents by location.
    const locationCounts = {};
    formattedData.forEach(record => {
        if (record['Incident City']) {
            locationCounts[record['Incident City']] = (locationCounts[record['Incident City']] || 0) + 1;
        }
    });
    const topLocationEntry = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    return {
        totalIncidents,
        avgResponseTime,
        busyHours,
        topUnit: topUnitEntry ? { unit: topUnitEntry[0], count: topUnitEntry[1] } : null,
        topLocation: topLocationEntry ? { location: topLocationEntry[0], count: topLocationEntry[1] } : null
    };
}

// ----------------------------------------------------------------------------
// File Upload & Visualization
// ----------------------------------------------------------------------------

/**
 * Upload file, process data, and generate visualizations.
 */
async function uploadFile() {
    console.log("🚀 uploadFile() function triggered!");
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const dashboardDiv = document.getElementById('dashboard');
    
    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Show loading indicator and hide previous results/dashboard.
    loadingDiv.style.display = 'block';
    resultDiv.innerHTML = '';
    dashboardDiv.style.display = 'none';
    
    try {
        console.log("📤 Sending file to /api/upload...");
        const formData = new FormData();
        formData.append("file", file);
        
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });
        
        const data = await response.json();
        loadingDiv.style.display = 'none';
        
        if (!response.ok) {
            console.error("❌ Server error:", data.error);
            resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error || response.statusText}</p>`;
            return;
        }
        
        console.log("✅ File uploaded successfully:", data.filename);
        
        // Process the data with our common processor function
        data.source = 'upload'; // Mark data source as file upload
        processData(data);
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Upload error: ${error.message}</p>`;
        loadingDiv.style.display = 'none';
    }
}

// ----------------------------------------------------------------------------
// Visualization Functions
// ----------------------------------------------------------------------------

/**
 * Create a time heatmap chart.
 * @param {Array} data - Formatted data records.
 * @param {Object} stats - Calculated statistics.
 */
function createTimeChart(data, stats) {
    const container = document.getElementById('time-chart');
    if (!container) {
        console.error("Time chart container not found");
        return;
    }
    
    // Normalize and enhance time/date fields for visualization
    console.log("Normalizing time/date fields for time chart...");
    
    data.forEach(record => {
        // Handle record._date_obj which might have been created by our preprocessor
        if (record._date_obj instanceof Date && !record['Reported_obj']) {
            record['Reported_obj'] = record._date_obj;
            console.log("Using _date_obj for Reported_obj");
        }
        
        // Try multiple field combinations for dates and times
        if (!(record['Reported_obj'] instanceof Date)) {
            try {
                // Try incident_date and incident_time first (common in emergency data)
                if (record['incident_date'] && record['incident_time']) {
                    let dateStr = record['incident_date'];
                    let timeStr = record['incident_time'];
                    
                    // Normalize date format - handle both MM/DD/YYYY and YYYY-MM-DD
                    if (dateStr.includes('/')) {
                        // Format: MM/DD/YYYY or M/D/YYYY
                        const parts = dateStr.split('/');
                        if (parts.length === 3) {
                            // Ensure 4-digit year
                            if (parts[2].length === 2) {
                                parts[2] = '20' + parts[2];
                            }
                            // Format as YYYY-MM-DD for ISO compatibility
                            dateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                        }
                    }
                    
                    // Normalize time format to ensure HH:MM:SS
                    if (!timeStr.includes(':')) {
                        // Assuming numeric format like 0831 for 8:31 AM
                        const hour = timeStr.substring(0, 2).padStart(2, '0');
                        const minute = timeStr.substring(2, 4).padStart(2, '0');
                        timeStr = `${hour}:${minute}:00`;
                    } else if (timeStr.split(':').length === 2) {
                        // Add seconds if missing
                        timeStr = `${timeStr}:00`;
                    }
                    
                    // Create timestamp
                    const timestamp = new Date(`${dateStr}T${timeStr}`);
                    if (!isNaN(timestamp.getTime())) {
                        record['Reported_obj'] = timestamp;
                        console.log(`Created Date from incident_date and incident_time: ${timestamp}`);
                    }
                }
                
                // Fallback to other field combinations if still no date object
                if (!(record['Reported_obj'] instanceof Date)) {
                    // Try Incident Date and Reported Time
                    if (record['Incident Date'] && record['Reported']) {
                        // If it's just a time value, combine with Incident Date
                        if (record['Reported'].match(/^\d{1,2}:\d{1,2}(:\d{1,2})?$/)) {
                            const timeStr = record['Reported'].split(':').length === 2 ? 
                                record['Reported'] + ':00' : record['Reported'];
                                
                            const timestamp = new Date(`${record['Incident Date']}T${timeStr}`);
                            if (!isNaN(timestamp.getTime())) {
                                record['Reported_obj'] = timestamp;
                                console.log(`Created Date from Incident Date and Reported: ${timestamp}`);
                            }
                        } else {
                            // Try parsing the full string
                            const timestamp = new Date(record['Reported']);
                            if (!isNaN(timestamp.getTime())) {
                                record['Reported_obj'] = timestamp;
                            }
                        }
                    } else {
                        // Last resort - check if Reported field has a full timestamp
                        if (record['Reported']) {
                            const timestamp = new Date(record['Reported']);
                            if (!isNaN(timestamp.getTime())) {
                                record['Reported_obj'] = timestamp;
                            } else {
                                // Use today's date with the time as last resort
                                const today = new Date().toISOString().split('T')[0];
                                const timeStr = record['Reported'].split(':').length === 2 ? 
                                    record['Reported'] + ':00' : record['Reported'];
                                const timestamp = new Date(`${today}T${timeStr}`);
                                if (!isNaN(timestamp)) {
                                    record['Reported_obj'] = timestamp;
                                    console.log(`Created Date using today's date with Reported time: ${timestamp}`);
                                }
                            }
                        } else {
                            // Try standard date parsing
                            const timestamp = new Date(record['Reported']);
                            if (!isNaN(timestamp)) {
                                record['Reported_obj'] = timestamp;
                                console.log(`Created Date from Reported field: ${timestamp}`);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn("Failed to create Date object from Reported field:", e);
            }
            
            // Try alternative timestamp fields if still no Date object
            if (!record['Reported_obj']) {
                try {
                    const timeFields = ['Incident Date', 'REPORTED_DT', 'CALL_DATE_TIME', 'EVENT_OPEN_DATETIME'];
                    for (const field of timeFields) {
                        if (record[field]) {
                            try {
                                const timestamp = new Date(record[field]);
                                if (!isNaN(timestamp)) {
                                    record['Reported_obj'] = timestamp;
                                    console.log(`Created Date from ${field}: ${timestamp}`);
                                    break;
                                }
                            } catch (e) {
                                console.warn(`Failed to create Date from ${field}:`, e);
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Failed to process alternative timestamp fields:", e);
                }
            }
        }
    });
    
    // Check if time data exists after attempts to create Date objects
    const hasTimeData = data.some(record => record['Reported_obj']);
    console.log("Time chart data check after processing:", {
        recordCount: data.length,
        recordsWithReportedObj: data.filter(record => record['Reported_obj'] instanceof Date).length,
        reportedObjSamples: data.filter(record => record['Reported_obj']).slice(0, 3).map(record => record['Reported_obj'])
    });
    
    if (!hasTimeData) {
        container.innerHTML = '<p>No time data available for heatmap</p>';
        return;
    }
    
    // Prepare heatmap data: counts per day (0-6) and per hour (0-23)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmapData = Array.from({ length: 7 }, () => Array(24).fill(0));
    
    let processedRecords = 0;
    data.forEach(record => {
        if (record['Reported_obj'] && record['Reported_obj'] instanceof Date) {
            const day = record['Reported_obj'].getDay();
            const hour = record['Reported_obj'].getHours();
            
            // Only count if day and hour are valid
            if (day >= 0 && day < 7 && hour >= 0 && hour < 24) {
                heatmapData[day][hour]++;
                processedRecords++;
            } else {
                console.warn(`Invalid day or hour value: day=${day}, hour=${hour} for record:`, record);
            }
        }
    });
    
    console.log(`Processed ${processedRecords} records for time heatmap`);
    
    const maxCount = Math.max(...heatmapData.flat());
    let heatmapHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
    
    // Header row with hours (every 2 hours)
    heatmapHtml += '<tr><th style="text-align: left;"></th>';
    for (let i = 0; i < 24; i += 2) {
        const hourLabel = i === 0 ? '12a' : (i < 12 ? `${i}a` : (i === 12 ? '12p' : `${i - 12}p`));
        heatmapHtml += `<th style="text-align: center; padding: 4px;">${hourLabel}</th>`;
    }
    heatmapHtml += '</tr>';
    
    // Data rows for each day
    days.forEach((day, dayIndex) => {
        heatmapHtml += `<tr><th style="text-align: left; padding: 4px;">${day}</th>`;
        for (let hour = 0; hour < 24; hour += 2) {
            const count1 = heatmapData[dayIndex][hour];
            const count2 = (hour + 1 < 24) ? heatmapData[dayIndex][hour + 1] : 0;
            const totalCount = count1 + count2;
            const intensity = maxCount > 0 ? totalCount / maxCount : 0;
            const alpha = Math.max(0.1, intensity);
            heatmapHtml += `<td style="text-align: center; padding: 4px; background-color: rgba(220, 53, 69, ${alpha}); color: white; text-shadow: 0px 0px 2px black;" title="${days[dayIndex]} ${hour}:00-${hour+2}:00 - ${totalCount} incidents">
                            ${totalCount > 0 ? totalCount : ''}
                            </td>`;
        }
        heatmapHtml += '</tr>';
    });
    
    heatmapHtml += '</table>';
    
    // Add legend
    heatmapHtml += `
        <div style="display: flex; justify-content: center; margin-top: 10px; gap: 15px; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 5px;">
                <span style="display: inline-block; width: 15px; height: 15px; background-color: rgba(220, 53, 69, 0.1); border: 1px solid #ddd;"></span>
                <span>Low</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <span style="display: inline-block; width: 15px; height: 15px; background-color: rgba(220, 53, 69, 0.5); border: 1px solid #ddd;"></span>
                <span>Medium</span>
            </div>
            <div style="display: flex; align-items: center; gap: 5px;">
                <span style="display: inline-block; width: 15px; height: 15px; background-color: rgba(220, 53, 69, 1.0); border: 1px solid #ddd;"></span>
                <span>High</span>
            </div>
        </div>
    `;
    
    container.innerHTML = heatmapHtml;
}

/**
 * Create an incident map using Leaflet.
 * @param {Array} data - Formatted data records.
 */
function createIncidentMap(data) {
    const mapContainer = document.getElementById('incident-map');
    if (!mapContainer) {
        console.error("Map container not found");
        return;
    }
    
    // Normalize coordinate fields - support both camelCase and lowercase variants
    const normalizedData = data.map(record => {
        const normalized = {...record};
        
        // If coordinates aren't already validated, check and set them now
        if (normalized.validCoordinates === undefined || normalized.validCoordinates === false) {
            // Handle different possible coordinate field names
            // First check for latitude/longitude fields
            let lat = null, lng = null;
            
            // Check lowercase versions first
            if (normalized.latitude !== undefined && normalized.longitude !== undefined) {
                lat = parseFloat(normalized.latitude);
                lng = parseFloat(normalized.longitude);
                console.log("Found lowercase lat/lng:", lat, lng);
            }
            // Then check capitalized versions
            else if (normalized.Latitude !== undefined && normalized.Longitude !== undefined) {
                lat = parseFloat(normalized.Latitude);
                lng = parseFloat(normalized.Longitude);
                console.log("Found capitalized Lat/Lng:", lat, lng);
            }
            // Then try variants
            else if (normalized.lat !== undefined && (normalized.lng !== undefined || normalized.lon !== undefined)) {
                lat = parseFloat(normalized.lat);
                lng = parseFloat(normalized.lng || normalized.lon);
                console.log("Found abbreviated lat/lng:", lat, lng);
            }
            
            // Validate coordinates
            if (lat !== null && lng !== null) {
                normalized.validCoordinates = (
                    !isNaN(lat) && !isNaN(lng) &&
                    lat >= -90 && lat <= 90 &&
                    lng >= -180 && lng <= 180
                );
                
                // Store normalized values
                if (normalized.validCoordinates) {
                    normalized.Latitude = lat;
                    normalized.Longitude = lng;
                    normalized.latitude = lat; // Store in both formats for compatibility
                    normalized.longitude = lng;
                }
            } else {
                normalized.validCoordinates = false;
            }
        }
        
        return normalized;
    });
    
    // Filter records with valid coordinates
    const geoData = normalizedData.filter(record => record.validCoordinates);
    console.log(`Found ${geoData.length} records with valid coordinates out of ${normalizedData.length} total records`);
    
    if (geoData.length === 0) {
        mapContainer.innerHTML = '<p>No valid geographic data available to display map</p>';
        return;
    }
    
    // Clear any existing content.
    mapContainer.innerHTML = '';
    
    // Compute average coordinates for map center.
    const avgLat = geoData.reduce((sum, record) => sum + (record.Latitude || record.latitude), 0) / geoData.length;
    const avgLng = geoData.reduce((sum, record) => sum + (record.Longitude || record.longitude), 0) / geoData.length;
    
    // Initialize Leaflet map.
    const map = L.map(mapContainer, { center: [avgLat, avgLng], zoom: 10 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    
    // Group incidents by location.
    const markersByLocation = {};
    geoData.forEach(record => {
        const key = `${record.Latitude},${record.Longitude}`;
        if (markersByLocation[key]) {
            markersByLocation[key].incidents.push(record);
        } else {
            markersByLocation[key] = { lat: record.Latitude, lng: record.Longitude, incidents: [record] };
        }
    });
    
    // Add markers to the map.
    Object.values(markersByLocation).forEach(location => {
        let markerColor = 'blue';
        if (location.incidents.length >= 5) {
            markerColor = 'red';
        } else if (location.incidents.length >= 2) {
            markerColor = 'orange';
        }
        
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        let popupContent = '<div style="max-height: 250px; overflow-y: auto;">';
        if (location.incidents.length > 1) {
            popupContent += `<h4>${location.incidents.length} incidents at this location</h4>`;
        }
        location.incidents.forEach((record, idx) => {
            if (idx > 0) popupContent += '<hr>';
            popupContent += `
                <div style="font-size: 12px; line-height: 1.4;">
                    <strong>Run #:</strong> ${record['Run No'] || ''}<br>
                    <strong>Reported:</strong> ${record['Reported'] || ''}<br>
                    <strong>Unit:</strong> ${record['Unit'] || ''}<br>
                    <strong>Address:</strong> ${record['Full Address'] || ''}<br>
                    <strong>City:</strong> ${record['Incident City'] || ''}
                    ${record['Response Time (min)'] !== undefined ? `<br><strong>Response Time:</strong> ${record['Response Time (min)']} min` : ''}
                </div>
            `;
        });
        popupContent += '</div>';
        marker.bindPopup(popupContent, { maxWidth: 300, maxHeight: 300 });
    });
}

/**
 * Create a horizontal bar chart for unit activity using Chart.js.
 * @param {Array} data - Formatted data records.
 * @param {Object} stats - Calculated statistics.
 */
function createUnitChart(data, stats) {
    const canvas = document.getElementById('unit-chart');
    if (!canvas) {
        console.error("Unit chart canvas not found");
        return;
    }
    
    // Support various unit field names in our data
    const unitCounts = {};
    data.forEach(record => {
        // Try various possible unit field names
        const unitValue = record['Unit'] || record['unit'] || record['Unit ID'] || 
                         record['UnitID'] || record['unit_id'] || record['apparatus'];
                         
        if (unitValue) {
            unitCounts[unitValue] = (unitCounts[unitValue] || 0) + 1;
        }
    });
    
    const topUnits = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    // Check if Chart.js and ChartManager are available
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not available for unit chart");
        const container = canvas.parentElement;
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; background-color: #f8f9fa; border-radius: 4px;">
                <p style="margin-bottom: 10px;">Chart library not available in emergency mode.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Unit</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Incidents</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topUnits.map(([unit, count]) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${unit}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }
    
    try {
        // Use Chart Manager to handle chart creation and cleanup if available
        if (window.FireEMS && window.FireEMS.ChartManager) {
            FireEMS.ChartManager.create('unit-chart', 'bar', {
                labels: topUnits.map(item => item[0]),
                datasets: [{
                    label: 'Incidents',
                    data: topUnits.map(item => item[1]),
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                }]
            }, {
                indexAxis: 'y',
                scales: { x: { beginAtZero: true } },
                plugins: { legend: { display: false } },
                maintainAspectRatio: false
            });
            
            console.log("Unit chart created using ChartManager");
        } else {
            // Fallback to direct Chart creation if ChartManager is not available
            console.warn("ChartManager not available, using direct Chart creation");
            
            // Clean up any existing chart
            if (window.unitChart instanceof Chart) {
                window.unitChart.destroy();
            }
            
            window.unitChart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: topUnits.map(item => item[0]),
                    datasets: [{
                        label: 'Incidents',
                        data: topUnits.map(item => item[1]),
                        backgroundColor: 'rgba(76, 175, 80, 0.7)',
                        borderColor: 'rgba(76, 175, 80, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    scales: { x: { beginAtZero: true } },
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false
                }
            });
            
            console.log("Unit chart created directly with Chart.js");
        }
    } catch (error) {
        console.error("Error creating unit chart:", error);
        const container = canvas.parentElement;
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; background-color: #ffebee; border-radius: 4px;">
                <p style="color: #c62828; margin-bottom: 10px;">Error creating chart: ${error.message}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Unit</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Incidents</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topUnits.map(([unit, count]) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${unit}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

/**
 * Create a doughnut chart for location activity using Chart.js.
 * @param {Array} data - Formatted data records.
 * @param {Object} stats - Calculated statistics.
 */
function createLocationChart(data, stats) {
    const canvas = document.getElementById('location-chart');
    if (!canvas) {
        console.error("Location chart canvas not found");
        return;
    }
    
    // Look for location data in multiple possible fields
    const locationFields = ['Incident City', 'City', 'ADDR_CITY', 'EVENT_CITY', 'CITY', 'Location City'];
    let locationField = null;
    
    // Find the first location field that has data
    for (const field of locationFields) {
        if (data.some(record => record[field])) {
            locationField = field;
            console.log(`Found location data in field: ${field}`);
            break;
        }
    }
    
    console.log("Location chart data check:", {
        recordCount: data.length,
        firstRecord: data.length > 0 ? data[0] : null,
        selectedLocationField: locationField,
        locationFieldsSamples: locationFields.map(field => ({
            field,
            hasData: data.some(record => record[field]),
            count: data.filter(record => record[field]).length
        }))
    });
    
    if (!locationField) {
        canvas.parentElement.innerHTML = '<p>No location data available for chart</p>';
        return;
    }
    
    // Normalize data - ensure all records have standard Incident City field
    data.forEach(record => {
        if (!record['Incident City'] && record[locationField]) {
            record['Incident City'] = record[locationField];
        }
    });
    
    // Use standardized Incident City field for consistency
    const locationCounts = {};
    data.forEach(record => {
        if (record['Incident City']) {
            locationCounts[record['Incident City']] = (locationCounts[record['Incident City']] || 0) + 1;
        }
    });
    
    console.log(`Found ${Object.keys(locationCounts).length} unique locations`);
    
    // If no location data found after processing
    if (Object.keys(locationCounts).length === 0) {
        canvas.parentElement.innerHTML = '<p>No location data available after processing</p>';
        return;
    }
    
    let topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    const totalIncidents = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);
    const topIncidents = topLocations.reduce((sum, [_, count]) => sum + count, 0);
    const otherIncidents = totalIncidents - topIncidents;
    
    if (otherIncidents > 0) {
        topLocations.push(['Other', otherIncidents]);
    }
    
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not available for location chart");
        const container = canvas.parentElement;
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; background-color: #f8f9fa; border-radius: 4px;">
                <p style="margin-bottom: 10px;">Chart library not available in emergency mode.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Location</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Incidents</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topLocations.map(([location, count]) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${location}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${count}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${Math.round((count / totalIncidents) * 100)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        return;
    }
    
    try {
        // Use Chart Manager to handle chart creation and cleanup if available
        if (window.FireEMS && window.FireEMS.ChartManager) {
            FireEMS.ChartManager.create('location-chart', 'doughnut', {
                labels: topLocations.map(item => item[0]),
                datasets: [{
                    data: topLocations.map(item => item[1]),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(199, 199, 199, 0.7)'
                    ],
                    borderWidth: 1
                }]
            }, {
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 12,
                            font: { size: 10 }
                        }
                    }
                },
                maintainAspectRatio: false
            });
            
            console.log("Location chart created using ChartManager");
        } else {
            // Fallback to direct Chart creation if ChartManager is not available
            console.warn("ChartManager not available, using direct Chart creation for location chart");
            
            // Clean up any existing chart
            if (window.locationChart instanceof Chart) {
                window.locationChart.destroy();
            }
            
            window.locationChart = new Chart(canvas, {
                type: 'doughnut',
                data: {
                    labels: topLocations.map(item => item[0]),
                    datasets: [{
                        data: topLocations.map(item => item[1]),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)',
                            'rgba(199, 199, 199, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 12,
                                font: { size: 10 }
                            }
                        }
                    },
                    maintainAspectRatio: false
                }
            });
            
            console.log("Location chart created directly with Chart.js");
        }
    } catch (error) {
        console.error("Error creating location chart:", error);
        const container = canvas.parentElement;
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; background-color: #ffebee; border-radius: 4px;">
                <p style="color: #c62828; margin-bottom: 10px;">Error creating chart: ${error.message}</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Location</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Incidents</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topLocations.map(([location, count]) => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 8px;">${location}</td>
                                <td style="border: 1px solid #ddd; padding: 8px;">${count}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

/**
 * Render a data table from API data.
 * @param {Object} data - The API response data including formatted records.
 * @param {HTMLElement} container - The container to append the table.
 */
function renderDataTable(data, container) {
    console.log("🔨 Rendering table with data");
    
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    
    // Create header row
    const headerRow = document.createElement("tr");
    if (data.columns && Array.isArray(data.columns)) {
        data.columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column;
            th.style.border = "1px solid #ddd";
            th.style.padding = "8px";
            th.style.backgroundColor = "#f2f2f2";
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
    } else {
        console.warn("⚠️ No columns found in API response");
        container.innerHTML = '<p style="color: red;">No column data available</p>';
        return;
    }
    
    // Create data rows
    if (data.data && Array.isArray(data.data)) {
        data.data.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
            data.columns.forEach(column => {
                const td = document.createElement("td");
                td.textContent = row[column] !== undefined && row[column] !== null ? row[column] : '';
                td.style.border = "1px solid #ddd";
                td.style.padding = "8px";
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    } else {
        console.error("❌ No data property found in API response");
        container.innerHTML = '<p style="color: red;">No data available</p>';
        return;
    }
    
    container.innerHTML = '';
    container.appendChild(table);
    console.log("✅ Table rendered successfully!");
}

// ----------------------------------------------------------------------------
// Expose the uploadFile function globally for inline usage
// ----------------------------------------------------------------------------
window.uploadFile = uploadFile;
