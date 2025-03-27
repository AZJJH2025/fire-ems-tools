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
        
        // Create visualizations
        try {
            createIncidentMap(formattedData);
            console.log("✅ Map created successfully");
        } catch (error) {
            console.error("❌ Error creating map:", error);
            document.getElementById('incident-map').innerHTML = `<p style="color: red;">Error creating map: ${error.message}</p>`;
        }
        
        try {
            createTimeChart(formattedData, stats);
            console.log("✅ Time chart created successfully");
        } catch (error) {
            console.error("❌ Error creating time chart:", error);
            document.getElementById('time-chart').innerHTML = `<p style="color: red;">Error creating time chart: ${error.message}</p>`;
        }
        
        try {
            createUnitChart(formattedData, stats);
            console.log("✅ Unit chart created successfully");
        } catch (error) {
            console.error("❌ Error creating unit chart:", error);
            document.getElementById('unit-chart').parentElement.innerHTML = `<p style="color: red;">Error creating unit chart: ${error.message}</p>`;
        }
        
        try {
            createLocationChart(formattedData, stats);
            console.log("✅ Location chart created successfully");
        } catch (error) {
            console.error("❌ Error creating location chart:", error);
            document.getElementById('location-chart').parentElement.innerHTML = `<p style="color: red;">Error creating location chart: ${error.message}</p>`;
        }
    } catch (error) {
        console.error("❌ Processing error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Processing error: ${error.message}</p>`;
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
    });
    
    // Check if there's data in sessionStorage from the Data Formatter
    console.log("Checking for formatter data in Response Time Analyzer");
    const formattedData = sessionStorage.getItem('formattedData');
    const dataSource = sessionStorage.getItem('dataSource');
    const formatterToolId = sessionStorage.getItem('formatterToolId');
    const formatterTarget = sessionStorage.getItem('formatterTarget');
    
    console.log("SessionStorage state:", {
        dataSource,
        formatterToolId,
        formatterTarget
    });
    
    // Check multiple possible matches to ensure compatibility with different naming conventions
    const isResponseTool = 
        formatterToolId === 'response-time' || 
        formatterToolId === 'response_time' || 
        formatterTarget === 'response-time' || 
        formatterTarget === 'response_time' || 
        formatterToolId === 'fire-ems-dashboard' || 
        formatterTarget === 'fire-ems-dashboard';
    
    if (formattedData && dataSource === 'formatter' && (isResponseTool || !formatterToolId)) {
        console.log("📦 Data received from Data Formatter tool");
        try {
            // Parse the data
            const parsedData = JSON.parse(formattedData);
            
            // Check if data is in the expected format (with data property)
            let dataToProcess;
            if (parsedData.data && Array.isArray(parsedData.data)) {
                dataToProcess = parsedData.data;
                console.log(`Processing ${dataToProcess.length} records from Data Formatter`);
            } else if (Array.isArray(parsedData)) {
                dataToProcess = parsedData;
                console.log(`Processing ${dataToProcess.length} records from Data Formatter`);
            } else {
                console.error("Unexpected data format from Data Formatter");
                return;
            }
            
            // Add field mapping for potential alternative names of required fields
            const keyMappings = {
                'Unit': ['Unit ID', 'Responding Unit', 'Apparatus', 'UnitID', 'Unit_ID', 'UnitName'],
                'Reported': ['Incident Time', 'Reported Time', 'Time Reported', 'Call Time', 'Alarm Time', 'Incident_Time', 'Call_Time'],
                'Unit Dispatched': ['Dispatch Time', 'Dispatched', 'Time Dispatched', 'Dispatch', 'Dispatch_Time', 'TimeDispatched'],
                'Unit Enroute': ['En Route Time', 'Enroute', 'Time Enroute', 'Responding Time', 'EnRouteTime', 'TimeEnroute'],
                'Unit Onscene': ['On Scene Time', 'Onscene', 'Time Onscene', 'Arrival Time', 'Arrived', 'OnSceneTime', 'TimeOnScene', 'ArrivalTime']
            };
            
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
            });
            
            // Log a sample record for debugging
            if (dataToProcess.length > 0) {
                console.log("Sample record from Data Formatter (before validation):", dataToProcess[0]);
                console.log("Field names present:", Object.keys(dataToProcess[0]).join(", "));
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
            
            // Hide the file upload section since we already have data
            document.querySelector('.file-upload-container').style.display = 'none';
            document.getElementById('result').innerHTML = 
                '<div class="notice" style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">' +
                '<strong>📊 Data successfully received from Data Formatter tool</strong><br>' +
                `${dataToProcess.length} records loaded. File upload has been bypassed.<br>` +
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
                        return;
                    }
                    
                    // Parse the date
                    const date = new Date(formattedRecord[field]);
                    if (!isNaN(date.getTime())) {
                        formattedRecord[`${field}_obj`] = date;
                        
                        // Only overwrite the original string if it's not already formatted
                        if (!isFormatterData || typeof formattedRecord[field] !== 'string' || 
                            !formattedRecord[field].includes('/')) {
                            formattedRecord[field] = formatDateTime(date);
                        }
                    }
                } catch (e) {
                    console.warn(`Could not parse date for field ${field}: ${formattedRecord[field]}`);
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
    
    // Check if time data exists.
    const hasTimeData = data.some(record => record['Reported_obj']);
    if (!hasTimeData) {
        container.innerHTML = '<p>No time data available for heatmap</p>';
        return;
    }
    
    // Prepare heatmap data: counts per day (0-6) and per hour (0-23)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmapData = Array.from({ length: 7 }, () => Array(24).fill(0));
    
    data.forEach(record => {
        if (record['Reported_obj'] && record['Reported_obj'] instanceof Date) {
            const day = record['Reported_obj'].getDay();
            const hour = record['Reported_obj'].getHours();
            heatmapData[day][hour]++;
        }
    });
    
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
    
    // Filter records with valid coordinates.
    const geoData = data.filter(record => record.validCoordinates);
    if (geoData.length === 0) {
        mapContainer.innerHTML = '<p>No valid geographic data available to display map</p>';
        return;
    }
    
    // Clear any existing content.
    mapContainer.innerHTML = '';
    
    // Compute average coordinates for map center.
    const avgLat = geoData.reduce((sum, record) => sum + record.Latitude, 0) / geoData.length;
    const avgLng = geoData.reduce((sum, record) => sum + record.Longitude, 0) / geoData.length;
    
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
    
    const unitCounts = {};
    data.forEach(record => {
        if (record['Unit']) {
            unitCounts[record['Unit']] = (unitCounts[record['Unit']] || 0) + 1;
        }
    });
    
    const topUnits = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    new Chart(canvas, {
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
    
    const locationField = data.some(record => record['Incident City']) ? 'Incident City' : null;
    if (!locationField) {
        canvas.parentElement.innerHTML = '<p>No location data available for chart</p>';
        return;
    }
    
    const locationCounts = {};
    data.forEach(record => {
        if (record[locationField]) {
            locationCounts[record[locationField]] = (locationCounts[record[locationField]] || 0) + 1;
        }
    });
    
    let topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    const totalIncidents = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);
    const topIncidents = topLocations.reduce((sum, [_, count]) => sum + count, 0);
    const otherIncidents = totalIncidents - topIncidents;
    
    if (otherIncidents > 0) {
        topLocations.push(['Other', otherIncidents]);
    }
    
    new Chart(canvas, {
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
            columns: data.columns || getDataColumns(formattedData)
        }, document.getElementById('data-table'));
        
        // Show dashboard
        dashboardDiv.style.display = 'block';
        
        // Create visualizations
        try {
            createIncidentMap(formattedData);
            console.log("✅ Map created successfully");
        } catch (error) {
            console.error("❌ Error creating map:", error);
            document.getElementById('incident-map').innerHTML = `<p style="color: red;">Error creating map: ${error.message}</p>`;
        }
        
        try {
            createTimeChart(formattedData, stats);
            console.log("✅ Time chart created successfully");
        } catch (error) {
            console.error("❌ Error creating time chart:", error);
            document.getElementById('time-chart').innerHTML = `<p style="color: red;">Error creating time chart: ${error.message}</p>`;
        }
        
        try {
            createUnitChart(formattedData, stats);
            console.log("✅ Unit chart created successfully");
        } catch (error) {
            console.error("❌ Error creating unit chart:", error);
            document.getElementById('unit-chart').parentElement.innerHTML = `<p style="color: red;">Error creating unit chart: ${error.message}</p>`;
        }
        
        try {
            createLocationChart(formattedData, stats);
            console.log("✅ Location chart created successfully");
        } catch (error) {
            console.error("❌ Error creating location chart:", error);
            document.getElementById('location-chart').parentElement.innerHTML = `<p style="color: red;">Error creating location chart: ${error.message}</p>`;
        }
    } catch (error) {
        console.error("❌ Processing error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Processing error: ${error.message}</p>`;
    }
}

// ----------------------------------------------------------------------------
// Expose the uploadFile function globally for inline usage
// ----------------------------------------------------------------------------
window.uploadFile = uploadFile;
