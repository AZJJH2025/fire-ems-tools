// ✅ script.js is loaded!
console.log("✅ script.js is loaded!");

// Function to format and normalize the data
function formatFireEMSData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn("No data to format");
        return [];
    }

    console.log("🔄 Formatting data for visualization...");
    
    return data.map(record => {
        // Create a new object to avoid modifying the original
        const formattedRecord = { ...record };
        
        // Format dates and times
        const dateFields = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'];
        dateFields.forEach(field => {
            if (formattedRecord[field]) {
                try {
                    const date = new Date(formattedRecord[field]);
                    if (!isNaN(date.getTime())) {
                        // Store both formatted string and Date object
                        formattedRecord[`${field}_obj`] = date;
                        formattedRecord[field] = formatDateTime(date);
                    }
                } catch (e) {
                    console.warn(`Could not parse date: ${formattedRecord[field]}`);
                }
            }
        });
        
        // Format coordinates
        if (formattedRecord['Latitude'] && formattedRecord['Longitude']) {
            formattedRecord['Latitude'] = parseFloat(formattedRecord['Latitude']);
            formattedRecord['Longitude'] = parseFloat(formattedRecord['Longitude']);
            
            // Check if coordinates are valid
            if (isNaN(formattedRecord['Latitude']) || isNaN(formattedRecord['Longitude'])) {
                formattedRecord['validCoordinates'] = false;
            } else {
                formattedRecord['validCoordinates'] = true;
            }
        } else {
            formattedRecord['validCoordinates'] = false;
        }
        
        // Calculate response times if timestamps are available
        if (formattedRecord['Unit Dispatched_obj'] && formattedRecord['Unit Onscene_obj']) {
            const dispatchTime = formattedRecord['Unit Dispatched_obj'].getTime();
            const onSceneTime = formattedRecord['Unit Onscene_obj'].getTime();
            
            if (onSceneTime >= dispatchTime) {
                // Calculate response time in minutes
                const responseTimeMs = onSceneTime - dispatchTime;
                const responseTimeMin = Math.round(responseTimeMs / (1000 * 60));
                formattedRecord['Response Time (min)'] = responseTimeMin;
            }
        }
        
        // Ensure unit is properly formatted
        if (formattedRecord['Unit']) {
            // Trim whitespace and ensure consistent format
            formattedRecord['Unit'] = formattedRecord['Unit'].trim();
        }
        
        // Ensure incident location/city is properly formatted
        if (formattedRecord['Incident City']) {
            formattedRecord['Incident City'] = formattedRecord['Incident City'].trim();
        }
        
        return formattedRecord;
    });
}

// Helper function to format date and time in a readable format
function formatDateTime(date) {
    if (!date || !(date instanceof Date) || isNaN(date)) return '';
    
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
}

// Function to calculate aggregate statistics from the data
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
    
    // Total incidents
    const totalIncidents = formattedData.length;
    
    // Average response time
    const responseTimes = formattedData
        .filter(record => record['Response Time (min)'] !== undefined)
        .map(record => record['Response Time (min)']);
    
    const avgResponseTime = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
        : null;
    
    // Count incidents by hour
    const hourCounts = {};
    formattedData.forEach(record => {
        if (record['Reported_obj']) {
            const hour = record['Reported_obj'].getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
    });
    
    // Get the busiest 3 hours
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
    
    // Count incidents by unit
    const unitCounts = {};
    formattedData.forEach(record => {
        if (record['Unit']) {
            unitCounts[record['Unit']] = (unitCounts[record['Unit']] || 0) + 1;
        }
    });
    
    // Get top unit by incidents
    const topUnit = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])
        .shift();
    
    // Count incidents by location
    const locationCounts = {};
    formattedData.forEach(record => {
        if (record['Incident City']) {
            locationCounts[record['Incident City']] = (locationCounts[record['Incident City']] || 0) + 1;
        }
    });
    
    // Get top location by incidents
    const topLocation = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .shift();
    
    return {
        totalIncidents,
        avgResponseTime,
        busyHours,
        topUnit: topUnit ? { unit: topUnit[0], count: topUnit[1] } : null,
        topLocation: topLocation ? { location: topLocation[0], count: topLocation[1] } : null
    };
}

// ✅ Upload function with data formatting
async function uploadFile() {
    console.log("🚀 uploadFile() function triggered!");
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const dashboardDiv = document.getElementById('dashboard');
    
    if (!fileInput.files.length) {
        resultDiv.innerHTML = '<p class="error-message">Please select a file first.</p>';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    const validTypes = ["text/csv", "application/vnd.ms-excel", 
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!validTypes.includes(file.type)) {
        resultDiv.innerHTML = '<p class="error-message">Invalid file type. Only CSV & Excel allowed.</p>';
        return;
    }
    
    // Show loading message
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
        
        // Hide loading indicator
        loadingDiv.style.display = 'none';
        
        if (!response.ok) {
            console.error("❌ Server error:", data.error);
            resultDiv.innerHTML = `<p class="error-message">Error: ${data.error || response.statusText}</p>`;
            return;
        }
        
        console.log("✅ File uploaded successfully:", data.filename);
        
        // Format the data
        const formattedData = formatFireEMSData(data.data);
        
        // Calculate statistics
        const stats = calculateDataStatistics(formattedData);
        
        // Display basic file stats
        resultDiv.innerHTML = `
            <div class="success-message">
                <p>✅ File uploaded successfully: ${data.filename}</p>
                <p>📊 Rows: ${data.rows || (data.data ? data.data.length : 'Unknown')}</p>
                <p>📅 First reported date: ${data.first_reported_date || 'N/A'}</p>
            </div>
        `;
        
        // Show dashboard
        dashboardDiv.style.display = 'block';
        
        // Show file stats in dashboard header with calculated statistics
        let statsHtml = `
            <div class="stat-item">📄 File: ${data.filename}</div>
            <div class="stat-item">📊 Incidents: ${stats.totalIncidents}</div>
            <div class="stat-item">📅 First Date: ${data.first_reported_date || 'N/A'}</div>
        `;
        
        // Add response time if available
        if (stats.avgResponseTime !== null) {
            statsHtml += `<div class="stat-item">⏱️ Avg Response: ${stats.avgResponseTime} min</div>`;
        }
        
        // Add busiest hour if available
        if (stats.busyHours && stats.busyHours.length > 0) {
            statsHtml += `<div class="stat-item">🔥 Busiest Hour: ${stats.busyHours[0].hour}</div>`;
        }
        
        // Add top unit if available
        if (stats.topUnit) {
            statsHtml += `<div class="stat-item">🚒 Top Unit: ${stats.topUnit.unit} (${stats.topUnit.count})</div>`;
        }
        
        document.getElementById('file-stats').innerHTML = statsHtml;
        
        // Create data table
        renderDataTable({...data, data: formattedData}, document.getElementById('data-table'));
        
        // Create visualizations with formatted data
        createVisualizations({...data, data: formattedData}, stats);
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        resultDiv.innerHTML = `<p class="error-message">Upload error: ${error.message}</p>`;
        loadingDiv.style.display = 'none';
    }
}

// Function to create all visualizations with formatted data
function createVisualizations(data, stats) {
    // Create map
    createIncidentMap(data.data);
    
    // Create time chart
    createTimeChart(data.data, stats);
    
    // Create unit chart
    createUnitChart(data.data, stats);
    
    // Create location chart
    createLocationChart(data.data, stats);
    
    // Add additional visualization if we have response time data
    if (stats.avgResponseTime !== null) {
        // Check if we need to create a container for the chart
        if (!document.getElementById('response-time-container')) {
            // Add a new row for response time analysis
            const dashboardContainer = document.getElementById('dashboard');
            const newRow = document.createElement('div');
            newRow.className = 'dashboard-row';
            newRow.innerHTML = `
                <div class="dashboard-card full-width">
                    <h3>⏱️ Response Time Analysis</h3>
                    <div id="response-time-container">
                        <canvas id="response-time-chart"></canvas>
                    </div>
                </div>
            `;
            
            // Insert before the data table row
            const dataTableRow = Array.from(dashboardContainer.querySelectorAll('.dashboard-row'))
                .find(row => row.querySelector('#data-table'));
            
            if (dataTableRow) {
                dashboardContainer.insertBefore(newRow, dataTableRow);
            } else {
                dashboardContainer.appendChild(newRow);
            }
        }
        
        // Create response time chart
        createResponseTimeChart(data.data);
    }
}

// Function to create time heatmap instead of bar chart
function createTimeChart(data, stats) {
    const container = document.getElementById('time-chart');
    if (!container) return;
    
    // Check if we have time data
    const hasTimeData = data.some(record => record['Reported_obj']);
    
    if (!hasTimeData) {
        container.parentElement.innerHTML = '<h3>⏰ Incidents by Time (Day/Hour)</h3><p>No time data available for heatmap</p>';
        return;
    }
    
    // Clear any existing content
    container.parentElement.innerHTML = '<h3>⏰ Incidents by Time (Day/Hour)</h3><div id="time-heatmap" style="height: 200px;"></div>';
    const heatmapContainer = document.getElementById('time-heatmap');
    
    // Initialize counts by day and hour
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // Create 2D array for heatmap data
    const heatmapData = Array(7).fill().map(() => Array(24).fill(0));
    
    // Count incidents by day and hour
    data.forEach(record => {
        if (record['Reported_obj'] && record['Reported_obj'] instanceof Date) {
            const day = record['Reported_obj'].getDay(); // 0 = Sunday, 6 = Saturday
            const hour = record['Reported_obj'].getHours();
            heatmapData[day][hour]++;
        }
    });
    
    // Find the maximum count for color scaling
    const maxCount = Math.max(...heatmapData.flat());
    
    // Create HTML table for heatmap
    let heatmapHtml = '<table class="heatmap-table">';
    
    // Add header row with hours
    heatmapHtml += '<tr><th></th>';
    for (let i = 0; i < 24; i += 2) {  // Use every 2 hours to save space
        const hour = i;
        const hourLabel = hour === 0 ? '12a' : 
                         hour < 12 ? `${hour}a` : 
                         hour === 12 ? '12p' : 
                         `${hour - 12}p`;
        heatmapHtml += `<th>${hourLabel}</th>`;
    }
    heatmapHtml += '</tr>';
    
    // Add rows for each day
    days.forEach((day, dayIndex) => {
        heatmapHtml += `<tr><th>${day}</th>`;
        
        for (let hour = 0; hour < 24; hour += 2) {
            // Calculate average for this 2-hour block
            const count1 = heatmapData[dayIndex][hour];
            const count2 = hour + 1 < 24 ? heatmapData[dayIndex][hour + 1] : 0;
            const avgCount = (count1 + count2) / 2;
            
            // Calculate color intensity (red scale)
            const intensity = maxCount > 0 ? avgCount / maxCount : 0;
            const alpha = Math.max(0.1, intensity); // Minimum opacity for visibility
            
            heatmapHtml += `
                <td style="background-color: rgba(220, 53, 69, ${alpha})" 
                    title="${day} ${hour}:00-${hour+2}:00 - ${count1 + count2} incidents">
                    ${count1 + count2 > 0 ? count1 + count2 : ''}
                </td>`;
        }
        
        heatmapHtml += '</tr>';
    });
    
    heatmapHtml += '</table>';
    heatmapContainer.innerHTML = heatmapHtml;
    
    // Add legend
    const legend = document.createElement('div');
    legend.className = 'heatmap-legend';
    legend.innerHTML = `
        <div class="legend-item">
            <span class="color-box" style="background-color: rgba(220, 53, 69, 0.1);"></span>
            <span class="legend-label">Low</span>
        </div>
        <div class="legend-item">
            <span class="color-box" style="background-color: rgba(220, 53, 69, 0.5);"></span>
            <span class="legend-label">Medium</span>
        </div>
        <div class="legend-item">
            <span class="color-box" style="background-color: rgba(220, 53, 69, 1.0);"></span>
            <span class="legend-label">High</span>
        </div>
    `;
    heatmapContainer.appendChild(legend);
}

// Function to create incident map using Leaflet with formatted data
function createIncidentMap(data) {
    const mapContainer = document.getElementById('incident-map');
    if (!mapContainer) return;
    
    // Filter data to only include records with valid coordinates
    const geoData = data.filter(record => record.validCoordinates);
    
    if (geoData.length === 0) {
        mapContainer.innerHTML = '<p>No valid geographic data available to display map</p>';
        return;
