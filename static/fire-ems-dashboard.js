// ✅ fire-ems-dashboard.js is loaded!
console.log("✅ fire-ems-dashboard.js is loaded!");

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
        
        // Process date fields: store both formatted string and Date object.
        const dateFields = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'];
        dateFields.forEach(field => {
            if (formattedRecord[field]) {
                try {
                    const date = new Date(formattedRecord[field]);
                    if (!isNaN(date.getTime())) {
                        formattedRecord[`${field}_obj`] = date;
                        formattedRecord[field] = formatDateTime(date);
                    }
                } catch (e) {
                    console.warn(`Could not parse date for field ${field}: ${formattedRecord[field]}`);
                }
            }
        });
        
        // Process coordinates: parse as floats and check validity.
        if (formattedRecord['Latitude'] && formattedRecord['Longitude']) {
            formattedRecord['Latitude'] = parseFloat(formattedRecord['Latitude']);
            formattedRecord['Longitude'] = parseFloat(formattedRecord['Longitude']);
            formattedRecord['validCoordinates'] = !isNaN(formattedRecord['Latitude']) && !isNaN(formattedRecord['Longitude']);
        } else {
            formattedRecord['validCoordinates'] = false;
        }
        
        // Calculate response time (in minutes) if both timestamps are available.
        if (formattedRecord['Unit Dispatched_obj'] && formattedRecord['Unit Onscene_obj']) {
            const dispatchTime = formattedRecord['Unit Dispatched_obj'].getTime();
            const onSceneTime = formattedRecord['Unit Onscene_obj'].getTime();
            if (onSceneTime >= dispatchTime) {
                const responseTimeMin = Math.round((onSceneTime - dispatchTime) / (1000 * 60));
                formattedRecord['Response Time (min)'] = responseTimeMin;
            }
        }
        
        // Normalize text fields.
        if (formattedRecord['Unit']) {
            formattedRecord['Unit'] = formattedRecord['Unit'].trim();
        }
        if (formattedRecord['Incident City']) {
            formattedRecord['Incident City'] = formattedRecord['Incident City'].trim();
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
        
        // Format and process data
        const formattedData = formatFireEMSData(data.data);
        const stats = calculateDataStatistics(formattedData);
        
        // Display basic file stats
        resultDiv.innerHTML = `
            <div style="color: green; margin-bottom: 15px;">
                <p>✅ File uploaded: ${data.filename}</p>
                <p>📊 Incidents: ${data.rows || (data.data ? data.data.length : 'Unknown')}</p>
                <p>📅 First reported date: ${data.first_reported_date || 'N/A'}</p>
            </div>
        `;
        
        // Optionally update file stats container if available
        const fileStatsElement = document.getElementById('file-stats');
        if (fileStatsElement) {
            let statsHtml = `
                <div style="margin-bottom: 10px;">📄 File: ${data.filename}</div>
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
        renderDataTable({ ...data, data: formattedData }, document.getElementById('data-table'));
        
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
// Expose the uploadFile function globally for inline usage
// ----------------------------------------------------------------------------
window.uploadFile = uploadFile;
