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
        resultDiv.innerHTML = '<p style="color: red;">Please select a file first.</p>';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    const validTypes = ["text/csv", "application/vnd.ms-excel", 
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    
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
            resultDiv.innerHTML = `<p style="color: red;">Error: ${data.error || response.statusText}</p>`;
            return;
        }
        
        console.log("✅ File uploaded successfully:", data.filename);
        
        // Format the data
        const formattedData = formatFireEMSData(data.data);
        
        // Calculate statistics
        const stats = calculateDataStatistics(formattedData);
        
        // Display basic file stats
        resultDiv.innerHTML = `
            <div style="color: green; margin-bottom: 15px;">
                <p>✅ File uploaded successfully: ${data.filename}</p>
                <p>📊 Rows: ${data.rows || (data.data ? data.data.length : 'Unknown')}</p>
                <p>📅 First reported date: ${data.first_reported_date || 'N/A'}</p>
            </div>
        `;
        
        // Show dashboard
        dashboardDiv.style.display = 'block';
        
        // Display file stats if we have a dedicated container
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
        
        // Create data table
        renderDataTable({...data, data: formattedData}, document.getElementById('data-table'));
        
        // Create visualizations with formatted data
        try {
            // Try each visualization separately to prevent one failure from stopping others
            try {
                createIncidentMap(formattedData);
                console.log("✅ Map created successfully");
            } catch (error) {
                console.error("❌ Error creating map:", error);
                document.getElementById('incident-map').innerHTML = '<p style="color: red;">Error creating map: ' + error.message + '</p>';
            }
            
            try {
                createTimeChart(formattedData, stats);
                console.log("✅ Time chart created successfully");
            } catch (error) {
                console.error("❌ Error creating time chart:", error);
                document.getElementById('time-chart').innerHTML = '<p style="color: red;">Error creating time chart: ' + error.message + '</p>';
            }
            
            try {
                createUnitChart(formattedData, stats);
                console.log("✅ Unit chart created successfully");
            } catch (error) {
                console.error("❌ Error creating unit chart:", error);
                document.getElementById('unit-chart').parentElement.innerHTML = '<p style="color: red;">Error creating unit chart: ' + error.message + '</p>';
            }
            
            try {
                createLocationChart(formattedData, stats);
                console.log("✅ Location chart created successfully");
            } catch (error) {
                console.error("❌ Error creating location chart:", error);
                document.getElementById('location-chart').parentElement.innerHTML = '<p style="color: red;">Error creating location chart: ' + error.message + '</p>';
            }
        } catch (error) {
            console.error("❌ Error creating visualizations:", error);
        }
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        resultDiv.innerHTML = `<p style="color: red;">Upload error: ${error.message}</p>`;
        loadingDiv.style.display = 'none';
    }
}

// Function to create time heatmap
function createTimeChart(data, stats) {
    const container = document.getElementById('time-chart');
    if (!container) {
        console.error("Time chart container not found");
        return;
    }
    
    // Check if we have time data
    const hasTimeData = data.some(record => record['Reported_obj']);
    
    if (!hasTimeData) {
        container.innerHTML = '<p>No time data available for heatmap</p>';
        return;
    }
    
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
    let heatmapHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 12px;">';
    
    // Add header row with hours
    heatmapHtml += '<tr><th style="text-align: left;"></th>';
    for (let i = 0; i < 24; i += 2) {  // Use every 2 hours to save space
        const hour = i;
        const hourLabel = hour === 0 ? '12a' : 
                         hour < 12 ? `${hour}a` : 
                         hour === 12 ? '12p' : 
                         `${hour - 12}p`;
        heatmapHtml += `<th style="text-align: center; padding: 4px;">${hourLabel}</th>`;
    }
    heatmapHtml += '</tr>';
    
    // Add rows for each day
    days.forEach((day, dayIndex) => {
        heatmapHtml += `<tr><th style="text-align: left; padding: 4px;">${day}</th>`;
        
        for (let hour = 0; hour < 24; hour += 2) {
            // Calculate average for this 2-hour block
            const count1 = heatmapData[dayIndex][hour];
            const count2 = hour + 1 < 24 ? heatmapData[dayIndex][hour + 1] : 0;
            const avgCount = (count1 + count2) / 2;
            
            // Calculate color intensity (red scale)
            const intensity = maxCount > 0 ? avgCount / maxCount : 0;
            const alpha = Math.max(0.1, intensity); // Minimum opacity for visibility
            
            heatmapHtml += `
                <td style="text-align: center; padding: 4px; background-color: rgba(220, 53, 69, ${alpha}); color: white; text-shadow: 0px 0px 2px black;" 
                    title="${day} ${hour}:00-${hour+2}:00 - ${count1 + count2} incidents">
                    ${count1 + count2 > 0 ? count1 + count2 : ''}
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

// Function to create incident map using Leaflet
function createIncidentMap(data) {
    const mapContainer = document.getElementById('incident-map');
    if (!mapContainer) {
        console.error("Map container not found");
        return;
    }
    
    // Filter data to only include records with valid coordinates
    const geoData = data.filter(record => record.validCoordinates);
    
    if (geoData.length === 0) {
        mapContainer.innerHTML = '<p>No valid geographic data available to display map</p>';
        return;
    }
    
    // Clear any existing map
    mapContainer.innerHTML = '';
    
    // Calculate center of map based on average of coordinates
    const avgLat = geoData.reduce((sum, record) => sum + record.Latitude, 0) / geoData.length;
    const avgLng = geoData.reduce((sum, record) => sum + record.Longitude, 0) / geoData.length;
    
    // Create Leaflet map
    const map = L.map(mapContainer, {
        center: [avgLat, avgLng],
        zoom: 10
    });
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Group markers by location for clustering
    const markersByLocation = {};
    
    // Process each incident for mapping
    geoData.forEach(record => {
        // Create a key for this location
        const locationKey = `${record.Latitude},${record.Longitude}`;
        
        // If we already have a marker at this location, add this incident to its popup
        if (markersByLocation[locationKey]) {
            markersByLocation[locationKey].incidents.push(record);
        } else {
            // Otherwise, create a new marker entry
            markersByLocation[locationKey] = {
                lat: record.Latitude,
                lng: record.Longitude,
                incidents: [record]
            };
        }
    });
    
    // Create markers for each location
    Object.values(markersByLocation).forEach(location => {
        // Determine marker color based on number of incidents at this location
        let markerColor = 'blue';
        if (location.incidents.length >= 5) {
            markerColor = 'red';
        } else if (location.incidents.length >= 2) {
            markerColor = 'orange';
        }
        
        // Create basic marker
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        
        // Create popup content with all incidents at this location
        let popupContent = '<div style="max-height: 250px; overflow-y: auto;">';
        
        if (location.incidents.length > 1) {
            popupContent += `<h4>${location.incidents.length} incidents at this location</h4>`;
        }
        
        // Add details for each incident
        location.incidents.forEach((record, index) => {
            if (index > 0) popupContent += '<hr>';
            
            popupContent += `
                <div style="font-size: 12px; line-height: 1.4;">
                    <strong>Run #:</strong> ${record['Run No'] || ''}<br>
                    <strong>Reported:</strong> ${record['Reported'] || ''}<br>
                    <strong>Unit:</strong> ${record['Unit'] || ''}<br>
                    <strong>Address:</strong> ${record['Full Address'] || ''}<br>
                    <strong>City:</strong> ${record['Incident City'] || ''}
                `;
            
            if (record['Response Time (min)'] !== undefined) {
                popupContent += `<br><strong>Response Time:</strong> ${record['Response Time (min)']} min`;
            }
            
            popupContent += '</div>';
        });
        
        popupContent += '</div>';
        
        // Bind popup to marker
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            maxHeight: 300
        });
    });
}

// Function to create unit activity chart
function createUnitChart(data, stats) {
    const canvas = document.getElementById('unit-chart');
    if (!canvas) {
        console.error("Unit chart canvas not found");
        return;
    }
    
    // Check if we have unit data
    const hasUnitData = data.some(record => record['Unit']);
    
    if (!hasUnitData) {
        canvas.parentElement.innerHTML = '<p>No unit data available for chart</p>';
        return;
    }
    
    // Count incidents by unit
    const unitCounts = {};
    
    data.forEach(record => {
        if (record['Unit']) {
            const unit = record['Unit'];
            unitCounts[unit] = (unitCounts[unit] || 0) + 1;
        }
    });
    
    // Sort units by count and take top 8
    const topUnits = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: topUnits.map(unit => unit[0]),
            datasets: [{
                label: 'Incidents',
                data: topUnits.map(unit => unit[1]),
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',  // Horizontal bar chart
            scales: {
                x: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            maintainAspectRatio: false
        }
    });
}

// Function to create location/city chart
function createLocationChart(data, stats) {
    const canvas = document.getElementById('location-chart');
    if (!canvas) {
        console.error("Location chart canvas not found");
        return;
    }
    
    // Determine which field to use for location data
    const locationField = data.some(record => record['Incident City']) ? 'Incident City' : null;
    
    if (!locationField) {
        canvas.parentElement.innerHTML = '<p>No location data available for chart</p>';
        return;
    }
    
    // Count incidents by location
    const locationCounts = {};
    
    data.forEach(record => {
        if (record[locationField]) {
            const location = record[locationField];
            locationCounts[location] = (locationCounts[location] || 0) + 1;
        }
    });
    
    // Sort locations by count and take top 6
    const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    
    // Calculate "Other" category
    const totalIncidents = Object.values(locationCounts).reduce((sum, count) => sum + count, 0);
    const topIncidents = topLocations.reduce((sum, [_, count]) => sum + count, 0);
    const otherIncidents = totalIncidents - topIncidents;
    
    // Add "Other" category if significant
    if (otherIncidents > 0) {
        topLocations.push(['Other', otherIncidents]);
    }
    
    // Create chart
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: topLocations.map(location => location[0]),
            datasets: [{
                data: topLocations.map(location => location[1]),
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
                        font: {
                            size: 10
                        }
                    }
                }
            },
            maintainAspectRatio: false
        }
    });
}

// Function to render table from API data
function renderDataTable(data, container) {
    console.log("🔨 Rendering table with data");
    
    // Create table element
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    
    // Create header row
    const headerRow = document.createElement("tr");
    
    // Add column headers
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
    
    // Add data rows
    if (data.data && Array.isArray(data.data)) {
        // Handle data as array of objects (your API format)
        data.data.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            tr.style.backgroundColor = rowIndex % 2 === 0 ? "#ffffff" : "#f9f9f9";
            
            data.columns.forEach(column => {
                const td = document.createElement("td");
                td.textContent = row[column] !== undefined && row[column] !== null 
                    ? row[column] 
                    : '';
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
    
    // Clear container and add table
    container.innerHTML = '';
    container.appendChild(table);
    console.log("✅ Table rendered successfully!");
}

// Make uploadFile globally accessible
window.uploadFile = uploadFile;
