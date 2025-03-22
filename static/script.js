// ✅ script.js is loaded!
console.log("✅ script.js is loaded!");

// ✅ Upload function
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
        
        // Show file stats in dashboard header
        document.getElementById('file-stats').innerHTML = `
            <div class="stat-item">📄 File: ${data.filename}</div>
            <div class="stat-item">📊 Incidents: ${data.rows}</div>
            <div class="stat-item">📅 First Date: ${data.first_reported_date || 'N/A'}</div>
        `;
        
        // Create data table
        renderDataTable(data, document.getElementById('data-table'));
        
        // Create visualizations
        createVisualizations(data);
        
    } catch (error) {
        console.error("❌ Upload error:", error);
        resultDiv.innerHTML = `<p class="error-message">Upload error: ${error.message}</p>`;
        loadingDiv.style.display = 'none';
    }
}

// Function to create all visualizations
function createVisualizations(data) {
    // Create map
    createIncidentMap(data.data);
    
    // Create time chart
    createTimeChart(data.data);
    
    // Create unit chart
    createUnitChart(data.data);
    
    // Create location chart
    createLocationChart(data.data);
}

// Function to create incident map using Leaflet
function createIncidentMap(data) {
    const mapContainer = document.getElementById('incident-map');
    
    // Check if we have latitude and longitude in the data
    const hasGeoData = data.some(record => 
        record.Latitude && record.Longitude && 
        !isNaN(parseFloat(record.Latitude)) && 
        !isNaN(parseFloat(record.Longitude))
    );
    
    if (!hasGeoData) {
        mapContainer.innerHTML = '<p>No geographic data available to display map</p>';
        return;
    }
    
    // Clear any existing map
    mapContainer.innerHTML = '';
    
    // Filter data to only include records with valid coordinates
    const geoData = data.filter(record => 
        record.Latitude && record.Longitude && 
        !isNaN(parseFloat(record.Latitude)) && 
        !isNaN(parseFloat(record.Longitude))
    );
    
    if (geoData.length === 0) {
        mapContainer.innerHTML = '<p>No valid geographic data available</p>';
        return;
    }
    
    // Calculate center of map based on average of coordinates
    const avgLat = geoData.reduce((sum, record) => sum + parseFloat(record.Latitude), 0) / geoData.length;
    const avgLng = geoData.reduce((sum, record) => sum + parseFloat(record.Longitude), 0) / geoData.length;
    
    // Create Leaflet map
    const map = L.map(mapContainer).setView([avgLat, avgLng], 10);
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add markers for each incident
    geoData.forEach(record => {
        const marker = L.marker([parseFloat(record.Latitude), parseFloat(record.Longitude)]).addTo(map);
        
        // Add popup with incident details
        const popupContent = `
            <div class="incident-popup">
                <strong>Run #:</strong> ${record['Run No'] || ''}<br>
                <strong>Reported:</strong> ${record['Reported'] || ''}<br>
                <strong>Unit:</strong> ${record['Unit'] || ''}<br>
                <strong>Address:</strong> ${record['Full Address'] || ''}<br>
                <strong>City:</strong> ${record['Incident City'] || ''}
            </div>
        `;
        
        marker.bindPopup(popupContent);
    });
}

// Function to create time chart using Chart.js
function createTimeChart(data) {
    const canvas = document.getElementById('time-chart');
    
    // Check if we have time data
    const hasTimeData = data.some(record => record['Reported']);
    
    if (!hasTimeData) {
        const parent = canvas.parentElement;
        parent.innerHTML = '<p>No time data available for chart</p>';
        return;
    }
    
    // Count incidents by hour
    const hourCounts = Array(24).fill(0);
    
    data.forEach(record => {
        if (record['Reported']) {
            try {
                const date = new Date(record['Reported']);
                if (!isNaN(date)) {
                    const hour = date.getHours();
                    hourCounts[hour]++;
                }
            } catch (e) {
                // Skip invalid dates
            }
        }
    });
    
    // Prepare labels for each hour
    const hourLabels = hourCounts.map((_, hour) => {
        if (hour === 0) return '12 AM';
        if (hour < 12) return `${hour} AM`;
        if (hour === 12) return '12 PM';
        return `${hour - 12} PM`;
    });
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: hourLabels,
            datasets: [{
                label: 'Incidents by Hour',
                data: hourCounts,
                backgroundColor: 'rgba(33, 150, 243, 0.7)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Incidents'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hour of Day'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Incidents by Hour of Day',
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to create unit activity chart
function createUnitChart(data) {
    const canvas = document.getElementById('unit-chart');
    
    // Check if we have unit data
    const hasUnitData = data.some(record => record['Unit']);
    
    if (!hasUnitData) {
        const parent = canvas.parentElement;
        parent.innerHTML = '<p>No unit data available for chart</p>';
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
    
    // Sort units by count and take top 10
    const topUnits = Object.entries(unitCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    // Create chart
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: topUnits.map(unit => unit[0]),
            datasets: [{
                label: 'Incidents by Unit',
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
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Incidents'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Top 10 Units by Activity',
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to create location/city chart
function createLocationChart(data) {
    const canvas = document.getElementById('location-chart');
    
    // Determine which field to use for location data
    const locationField = data.some(record => record['Incident City']) ? 'Incident City' : null;
    
    if (!locationField) {
        const parent = canvas.parentElement;
        parent.innerHTML = '<p>No location data available for chart</p>';
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
    
    // Sort locations by count and take top 10
    const topLocations = Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    // Create chart
    new Chart(canvas, {
        type: 'pie',
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
                    'rgba(199, 199, 199, 0.7)',
                    'rgba(83, 102, 255, 0.7)',
                    'rgba(40, 159, 64, 0.7)',
                    'rgba(210, 99, 132, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(199, 199, 199, 1)',
                    'rgba(83, 102, 255, 1)',
                    'rgba(40, 159, 64, 1)',
                    'rgba(210, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Incidents by Location',
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                legend: {
                    position: 'right'
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to render table from API data
function renderDataTable(data, container) {
    console.log("🔨 Rendering table with data");
    
    // Create table element
    const table = document.createElement("table");
    
    // Create header row
    const headerRow = document.createElement("tr");
    
    // Add column headers
    if (data.columns && Array.isArray(data.columns)) {
        data.columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
    } else {
        console.warn("⚠️ No columns found in API response");
        container.innerHTML = '<p class="error-message">No column data available</p>';
        return;
    }
    
    // Add data rows
    if (data.data && Array.isArray(data.data)) {
        // Handle data as array of objects (your API format)
        data.data.forEach(row => {
            const tr = document.createElement("tr");
            
            data.columns.forEach(column => {
                const td = document.createElement("td");
                td.textContent = row[column] !== undefined && row[column] !== null 
                    ? row[column] 
                    : '';
                tr.appendChild(td);
            });
            
            table.appendChild(tr);
        });
    } else {
        console.error("❌ No data property found in API response");
        container.innerHTML = '<p class="error-message">No data available</p>';
        return;
    }
    
    // Clear container and add table
    container.innerHTML = '';
    container.appendChild(table);
    console.log("✅ Table rendered successfully!");
}

// Make uploadFile globally accessible
window.uploadFile = uploadFile;
