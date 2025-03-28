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
    // Make sure the map container has a proper height
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.height = '500px'; // Set a fixed height
    }

    // Initialize the map with animations disabled to prevent rendering issues
    const map = L.map('map', {
        fadeAnimation: false // Disable animations which can cause issues
    }).setView([39.8283, -98.5795], 4); // Default center of US

    // Make sure map is ready
    map.whenReady(() => {
        console.log("Map is ready");
    });

    // Add the base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Initialize variables
    let heatLayer = null;
    let originalData = [];
    let filteredData = [];
    let callTypes = [];
    
    // Check for data from Data Formatter
    checkForFormatterData();

    // Handle file input change (display selected filename)
    document.getElementById('call-data-file').addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : 'No file selected';
        document.getElementById('file-name').textContent = fileName;
    });

    // Handle form submission
    document.getElementById('upload-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fileInput = document.getElementById('call-data-file');
        const file = fileInput.files[0];
        
        if (!file) {
            showUploadStatus('Please select a file to upload', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        showUploadStatus('Uploading file...', 'info');
        
        // Upload file to server
        fetch('/upload-call-data', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showUploadStatus('File uploaded successfully!', 'success');
                
                // Store the original data
                originalData = data.points;
                
                // Extract unique call types for filtering
                callTypes = [...new Set(originalData.map(point => point.type))];
                populateCallTypeFilter(callTypes);
                
                // Apply initial filtering and display heat map
                applyFilters();
                
                // Update map view to fit data points
                fitMapToData(originalData);
                
            } else {
                showUploadStatus(`Error: ${data.error}`, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showUploadStatus('Error uploading file. Please try again.', 'error');
        });
    });

    // Function to display upload status
    function showUploadStatus(message, type) {
        const statusElement = document.getElementById('upload-status');
        statusElement.textContent = message;
        
        // Remove existing classes
        statusElement.classList.remove('status-success', 'status-error', 'status-info');
        
        // Add appropriate class based on status type
        if (type === 'success') {
            statusElement.classList.add('status-success');
        } else if (type === 'error') {
            statusElement.classList.add('status-error');
        } else {
            statusElement.classList.add('status-info');
        }
    }

    // Function to populate call type filter with actual data
    function populateCallTypeFilter(types) {
        const filterElement = document.getElementById('call-type-filter');
        
        // Clear existing options (except "All Types")
        while (filterElement.options.length > 1) {
            filterElement.remove(1);
        }
        
        // Add options for each unique call type
        types.forEach(type => {
            if (type && type !== '') {
                const option = document.createElement('option');
                option.value = type.toLowerCase();
                option.textContent = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
                filterElement.appendChild(option);
            }
        });
    }

    // Filter visibility toggle based on time filter selection
    document.getElementById('time-filter').addEventListener('change', function() {
        const value = this.value;
        
        // Hide all time-specific filters
        document.querySelectorAll('.time-specific-filter').forEach(el => {
            el.classList.add('hidden');
        });
        
        // Show the selected filter
        if (value !== 'all') {
            document.getElementById(`${value}-filter`).classList.remove('hidden');
        }
    });

    // Hour slider update
    document.getElementById('hour-range').addEventListener('input', function() {
        const hour = parseInt(this.value);
        const hourFormatted = hour.toString().padStart(2, '0');
        const nextHour = (hour + 1) % 24;
        const nextHourFormatted = nextHour.toString().padStart(2, '0');
        
        document.getElementById('hour-value').textContent = `${hourFormatted}:00 - ${nextHourFormatted}:00`;
    });

    // Apply filters button
    document.getElementById('apply-filters').addEventListener('click', applyFilters);

    // Function to apply filters and update heatmap
    function applyFilters() {
        if (originalData.length === 0) {
            return;
        }
        
        // Start with all data
        let filtered = [...originalData];
        
        // Apply call type filter
        const callTypeFilter = document.getElementById('call-type-filter').value;
        if (callTypeFilter !== 'all') {
            filtered = filtered.filter(point => 
                point.type && point.type.toLowerCase() === callTypeFilter);
        }
        
        // Apply time filters
        const timeFilter = document.getElementById('time-filter').value;
        
        if (timeFilter === 'hour') {
            const hourValue = parseInt(document.getElementById('hour-range').value);
            filtered = filtered.filter(point => point.hour === hourValue);
        } 
        else if (timeFilter === 'day') {
            const selectedDays = [...document.querySelectorAll('#day-filter input:checked')]
                .map(input => parseInt(input.value));
            
            filtered = filtered.filter(point => selectedDays.includes(point.dayOfWeek));
        }
        else if (timeFilter === 'month') {
            const selectedMonths = [...document.querySelectorAll('#month-filter input:checked')]
                .map(input => parseInt(input.value));
            
            filtered = filtered.filter(point => selectedMonths.includes(point.month));
        }
        
        // Update the filtered data
        filteredData = filtered;
        
        // Update the heatmap
        updateHeatmap(filteredData);
        
        // Update the hotspot analysis
        updateHotspotAnalysis(filteredData);
    }

    // Function to update the heatmap
    function updateHeatmap(data) {
        // Remove existing heat layer if it exists
        if (heatLayer) {
            map.removeLayer(heatLayer);
        }
        
        // Remove any existing marker groups
        if (window.markerGroup) {
            map.removeLayer(window.markerGroup);
        }
        
        console.log(`Total data points received: ${data.length}`);
        
        if (data.length === 0) {
            document.getElementById('hotspot-results').innerHTML = 
                '<p>No data points match the current filters</p>';
            return;
        }
        
        // Create new marker group
        window.markerGroup = L.layerGroup().addTo(map);
        
        // Count the occurrences of each location to determine hotspots
        const locationCounts = {};
        
        for (const point of data) {
            // Validate coordinates
            const lat = parseFloat(point.latitude);
            const lng = parseFloat(point.longitude);
            
            // Skip invalid coordinates
            if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
                continue;
            }
            
            // Round coordinates to 4 decimal places for grouping nearby points
            const roundedLat = Math.round(lat * 10000) / 10000;
            const roundedLng = Math.round(lng * 10000) / 10000;
            const locationKey = `${roundedLat},${roundedLng}`;
            
            // Count occurrences at this location
            if (locationCounts[locationKey]) {
                locationCounts[locationKey].count++;
                // Track call types if available
                if (point.type && point.type !== '') {
                    locationCounts[locationKey].types[point.type] = 
                        (locationCounts[locationKey].types[point.type] || 0) + 1;
                }
                // Track time periods if available
                if (point.hour !== undefined) {
                    const hour = parseInt(point.hour);
                    if (!isNaN(hour)) {
                        locationCounts[locationKey].hours[hour] = 
                            (locationCounts[locationKey].hours[hour] || 0) + 1;
                    }
                }
            } else {
                locationCounts[locationKey] = {
                    lat: lat,
                    lng: lng,
                    count: 1,
                    types: {},
                    hours: {}
                };
                // Initialize with first point's data
                if (point.type && point.type !== '') {
                    locationCounts[locationKey].types[point.type] = 1;
                }
                if (point.hour !== undefined) {
                    const hour = parseInt(point.hour);
                    if (!isNaN(hour)) {
                        locationCounts[locationKey].hours[hour] = 1;
                    }
                }
            }
        }
        
        // Convert the location counts to an array
        const locations = Object.values(locationCounts);
        
        // Find the maximum count to scale sizes and colors
        const maxCount = Math.max(...locations.map(loc => loc.count));
        console.log(`Maximum count at any location: ${maxCount}`);
        
        // Add markers with size and color based on count
        locations.forEach(location => {
            // Calculate the size based on count relative to max
            const sizeFactor = Math.max(0.3, location.count / maxCount);
            const radius = 5 + (sizeFactor * 25); // Scale radius between 5 and 30
            
            // Calculate color intensity based on count
            const intensity = location.count / maxCount;
            let color;
            
            // Match the colors to the legend
            if (intensity < 0.25) {
                color = '#a6cee3'; // Light blue for Low
            } else if (intensity < 0.5) {
                color = '#6495ed'; // Medium blue for Medium
            } else if (intensity < 0.8) {
                color = '#1f4eb0'; // Dark blue for High
            } else {
                color = '#d73027'; // Red for Critical
            }
            
            // Create a circle marker with size and color based on count
            const marker = L.circleMarker([location.lat, location.lng], {
                radius: radius,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(window.markerGroup);
            
            // Determine most common call type
            let mostCommonType = 'Unknown';
            let maxTypeCount = 0;
            
            for (const [type, count] of Object.entries(location.types)) {
                if (count > maxTypeCount) {
                    maxTypeCount = count;
                    mostCommonType = type;
                }
            }
            
            // Determine busiest hour
            let busiestHour = null;
            let maxHourCount = 0;
            
            for (const [hour, count] of Object.entries(location.hours)) {
                if (count > maxHourCount) {
                    maxHourCount = count;
                    busiestHour = parseInt(hour);
                }
            }
            
            // Format busiest hour for display (if available)
            let busiestHourText = 'Unknown';
            if (busiestHour !== null) {
                const hourFormatted = busiestHour.toString().padStart(2, '0');
                const nextHour = (busiestHour + 1) % 24;
                const nextHourFormatted = nextHour.toString().padStart(2, '0');
                busiestHourText = `${hourFormatted}:00 - ${nextHourFormatted}:00`;
            }
            
            // Determine call density category for display
            let densityCategory = "Low";
            if (intensity >= 0.8) {
                densityCategory = "Critical";
            } else if (intensity >= 0.5) {
                densityCategory = "High";
            } else if (intensity >= 0.25) {
                densityCategory = "Medium";
            }
            
            // Add popup with detailed info
            marker.bindPopup(`
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0;">Call Density Information</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 3px 0; font-weight: bold;">Location:</td>
                            <td style="padding: 3px 0;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px 0; font-weight: bold;">Call Count:</td>
                            <td style="padding: 3px 0;">${location.count}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px 0; font-weight: bold;">Density Level:</td>
                            <td style="padding: 3px 0;">${densityCategory}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px 0; font-weight: bold;">Most Common Type:</td>
                            <td style="padding: 3px 0;">${mostCommonType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 3px 0; font-weight: bold;">Busiest Time:</td>
                            <td style="padding: 3px 0;">${busiestHourText}</td>
                        </tr>
                    </table>
                </div>
            `);
        });
        
        console.log(`Added ${locations.length} heat markers to the map`);
        
        // Ensure the map view includes all the markers
        if (locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 13
                });
            } catch (error) {
                console.error("Error fitting map to markers:", error);
            }
        }
    }

    // Function to update hotspot analysis section
    function updateHotspotAnalysis(data) {
        if (data.length === 0) {
            document.getElementById('hotspot-results').innerHTML = 
                '<p>No data points match the current filters</p>';
            return;
        }
        
        // Calculate statistics from the filtered data
        const totalCalls = data.length;
        
        // Count by type
        const typeCount = {};
        data.forEach(point => {
            const type = point.type || 'Unknown';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
        
        // Sort types by frequency (descending)
        const sortedTypes = Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);  // Top 5 types
        
        // Count by hour of day (if hour data is available)
        const hourCount = {};
        data.forEach(point => {
            if (typeof point.hour !== 'undefined') {
                hourCount[point.hour] = (hourCount[point.hour] || 0) + 1;
            }
        });
        
        // Find busiest hour
        let busiestHour = null;
        let maxHourCount = 0;
        
        Object.entries(hourCount).forEach(([hour, count]) => {
            if (count > maxHourCount) {
                busiestHour = parseInt(hour);
                maxHourCount = count;
            }
        });
        
        // Format busiest hour for display
        let busiestHourText = 'N/A';
        if (busiestHour !== null) {
            const hourFormatted = busiestHour.toString().padStart(2, '0');
            const nextHour = (busiestHour + 1) % 24;
            const nextHourFormatted = nextHour.toString().padStart(2, '0');
            busiestHourText = `${hourFormatted}:00 - ${nextHourFormatted}:00`;
        }
        
        // Generate hotspot results HTML
        let resultsHTML = `
            <div class="hotspot-stat">
                <span>Total Incidents:</span>
                <strong>${totalCalls.toLocaleString()}</strong>
            </div>
        `;
        
        if (sortedTypes.length > 0) {
            resultsHTML += `
                <div class="hotspot-stat">
                    <span>Most Common Type:</span>
                    <strong>${sortedTypes[0][0]} (${sortedTypes[0][1].toLocaleString()})</strong>
                </div>
            `;
        }
        
        if (busiestHour !== null) {
            resultsHTML += `
                <div class="hotspot-stat">
                    <span>Busiest Time:</span>
                    <strong>${busiestHourText}</strong>
                </div>
            `;
        }
        
        // Determine if there's a clear hotspot area
        if (heatLayer) {
            resultsHTML += `
                <div class="hotspot-stat">
                    <span>Hotspot Analysis:</span>
                    <strong>Significant clustering detected</strong>
                </div>
            `;
        }
        
        document.getElementById('hotspot-results').innerHTML = resultsHTML;
    }

    // Function to fit the map to data points
    function fitMapToData(data) {
        if (!data || data.length === 0) {
            console.log("No data to fit map to");
            return;
        }
        
        try {
            // Filter out any invalid coordinates
            const validPoints = data.filter(point => {
                const lat = parseFloat(point.latitude);
                const lng = parseFloat(point.longitude);
                return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
            });
            
            if (validPoints.length === 0) {
                console.log("No valid coordinates to fit map to");
                return;
            }
            
            // Create bounds from valid points
            const validLatLngs = validPoints.map(point => [
                parseFloat(point.latitude), 
                parseFloat(point.longitude)
            ]);
            
            // Create bounds
            const bounds = L.latLngBounds(validLatLngs);
            
            // Check if bounds are valid
            if (!bounds.isValid()) {
                console.log("Generated bounds are invalid");
                return;
            }
            
            // Fit the map to these bounds
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 13
            });
            
            // Ensure we're not zoomed out too far or in too close
            if (map.getZoom() > 12) {
                map.setZoom(12); // Limit max zoom to prevent over-zooming
            } else if (map.getZoom() < 7) {
                map.setZoom(7); // Ensure we're zoomed in enough to see points
            }
            
            console.log("Map zoomed to fit data points at zoom level:", map.getZoom());
        } catch (error) {
            console.error("Error fitting map to data:", error);
            // Fall back to default view
            map.setView([39.8283, -98.5795], 4);
        }
    }

    // Export as PNG button
    document.getElementById('export-png').addEventListener('click', function() {
        if (originalData.length === 0) {
            alert('Please upload and process data before exporting');
            return;
        }
        
        html2canvas(document.getElementById('map-container')).then(canvas => {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `FireEMS_HeatMap_${new Date().toISOString().slice(0, 10)}.png`;
            link.click();
        });
    });

    // Export as PDF button
    document.getElementById('export-pdf').addEventListener('click', function() {
        if (originalData.length === 0) {
            alert('Please upload and process data before exporting');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        
        // Create PDF
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        
        // Add title
        pdf.setFontSize(18);
        pdf.text('FireEMS.ai Call Density Heatmap', 15, 15);
        
        // Add timestamp
        pdf.setFontSize(10);
        pdf.text(`Generated on ${new Date().toLocaleString()}`, 15, 22);
        
        // Add filter information
        pdf.setFontSize(12);
        pdf.text('Filter Settings:', 15, 30);
        
        const timeFilter = document.getElementById('time-filter').value;
        const callTypeFilter = document.getElementById('call-type-filter').value;
        
        pdf.setFontSize(10);
        pdf.text(`Time Filter: ${timeFilter === 'all' ? 'All Time' : timeFilter}`, 15, 36);
        pdf.text(`Call Type: ${callTypeFilter === 'all' ? 'All Types' : callTypeFilter}`, 15, 42);
        
        // Add statistics
        pdf.setFontSize(12);
        pdf.text('Statistics:', 15, 52);
        
        if (filteredData.length > 0) {
            pdf.setFontSize(10);
            pdf.text(`Total Incidents: ${filteredData.length.toLocaleString()}`, 15, 58);
        }
        
        // Add map image
        html2canvas(document.getElementById('map-container')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            // Calculate dimensions to fit in PDF and preserve aspect ratio
            const imgWidth = 270; // A4 landscape width (minus margins)
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            // Add the image (centered)
            pdf.addImage(imgData, 'PNG', 15, 65, imgWidth, imgHeight);
            
            // Add footer
            pdf.setFontSize(8);
            pdf.text('Generated by FireEMS.ai - Analytics for Fire and Emergency Services', 15, 200);
            
            // Save the PDF
            pdf.save(`FireEMS_HeatMap_${new Date().toISOString().slice(0, 10)}.pdf`);
        });
    });

    // Function to check for and process data from the Data Formatter
    function checkForFormatterData() {
        // Check if we have data from the Data Formatter tool
        console.log("Checking for formatter data, tool ID:", sessionStorage.getItem('formatterToolId'));
        if (sessionStorage.getItem('dataSource') === 'formatter' && 
            (sessionStorage.getItem('formatterToolId') === 'call-density' || 
             sessionStorage.getItem('formatterTarget') === 'call-density')) {
            try {
                console.log("Detected data from Data Formatter");
                
                // Show status message
                showUploadStatus('Detected data from Data Formatter. Processing...', 'info');
                
                // Get the data from sessionStorage
                const formatterData = JSON.parse(sessionStorage.getItem('formattedData'));
                
                if (formatterData && formatterData.data && formatterData.data.length > 0) {
                    // Process the data
                    const callData = formatterData.data.map(item => {
                        // Create point objects in the format expected by the heatmap
                        const point = {
                            latitude: parseFloat(item.Latitude),
                            longitude: parseFloat(item.Longitude)
                        };
                        
                        // Map other common fields
                        if (item['Incident Type']) {
                            point.type = item['Incident Type'];
                        }
                        
                        // If hour, dayOfWeek, and month are already in the data
                        if (item.hour !== undefined) point.hour = item.hour;
                        if (item.dayOfWeek !== undefined) point.dayOfWeek = item.dayOfWeek;
                        if (item.month !== undefined) point.month = item.month;
                        
                        // If the data includes a timestamp, extract time components
                        if (item['Incident Date'] && item['Incident Time']) {
                            try {
                                const dateTimeStr = `${item['Incident Date']}T${item['Incident Time']}`;
                                const dateTime = new Date(dateTimeStr);
                                
                                if (!isNaN(dateTime.getTime())) {
                                    if (point.hour === undefined) point.hour = dateTime.getHours();
                                    if (point.dayOfWeek === undefined) point.dayOfWeek = dateTime.getDay();
                                    if (point.month === undefined) point.month = dateTime.getMonth() + 1;
                                }
                            } catch (e) {
                                console.warn("Error parsing incident date/time:", e);
                            }
                        }
                        
                        return point;
                    });
                    
                    // Filter out any points with invalid coordinates
                    const validPoints = callData.filter(point => {
                        return !isNaN(point.latitude) && !isNaN(point.longitude) && 
                               isFinite(point.latitude) && isFinite(point.longitude);
                    });
                    
                    if (validPoints.length > 0) {
                        // Store the data
                        originalData = validPoints;
                        
                        // Extract unique call types for filtering
                        callTypes = [...new Set(originalData.map(point => point.type).filter(Boolean))];
                        populateCallTypeFilter(callTypes);
                        
                        // Apply initial filtering and display heat map
                        applyFilters();
                        
                        // Update map view to fit data points
                        fitMapToData(originalData);
                        
                        // Show success message
                        showUploadStatus(
                            `Successfully loaded ${validPoints.length} points from Data Formatter`, 
                            'success'
                        );
                        
                        // Add a visual indicator to show data came from formatter
                        addFormatterIndicator(validPoints.length);
                        
                        // Clear the session storage to avoid reloading on refresh
                        sessionStorage.removeItem('formattedData');
                        sessionStorage.removeItem('dataSource');
                    } else {
                        showUploadStatus('No valid coordinate data found in the formatted data', 'error');
                    }
                } else {
                    showUploadStatus('No valid data found from Data Formatter', 'error');
                }
            } catch (error) {
                console.error('Error processing data from formatter:', error);
                showUploadStatus('Error processing data from formatter: ' + error.message, 'error');
            }
        }
    }
    
    // Mock data for development and testing (when no file is uploaded)
    document.getElementById('apply-filters').addEventListener('dblclick', function() {
        // Only use mock data if no real data is uploaded
        if (originalData.length === 0) {
            loadMockData();
        }
    });

    function loadMockData() {
        // Generate mock data points (simulating a call data file)
        const mockPoints = [];
        
        // Create cluster around a major city (e.g., Chicago)
        const chicagoLat = 41.8781;
        const chicagoLng = -87.6298;
        
        // Generate 200 random points around Chicago
        for (let i = 0; i < 200; i++) {
            // Random offset (higher density closer to center)
            const latOffset = (Math.random() - 0.5) * 0.5; // +/- 0.25 degrees
            const lngOffset = (Math.random() - 0.5) * 0.5;
            
            // Random hour of day (with higher probability during daytime)
            const hour = Math.floor(Math.random() * 24);
            const intensity = 0.5 + Math.random() * 1.5; // Random intensity between 0.5 and 2
            
            // Random day of week (0-6, Sunday-Saturday)
            const dayOfWeek = Math.floor(Math.random() * 7);
            
            // Random month (1-12)
            const month = Math.floor(Math.random() * 12) + 1;
            
            // Random call type
            const callTypes = ['Fire', 'EMS', 'Hazmat', 'Rescue', 'Service'];
            const type = callTypes[Math.floor(Math.random() * callTypes.length)];
            
            mockPoints.push({
                latitude: chicagoLat + latOffset,
                longitude: chicagoLng + lngOffset,
                hour: hour,
                dayOfWeek: dayOfWeek,
                month: month,
                type: type,
                intensity: intensity
            });
        }
        
        // Store the mock data
        originalData = mockPoints;
        
        // Extract unique call types
        callTypes = [...new Set(originalData.map(point => point.type))];
        populateCallTypeFilter(callTypes);
        
        // Apply initial filtering and display heat map
        applyFilters();
        
        // Update map view to fit data points
        fitMapToData(originalData);
        
        // Show success message
        showUploadStatus('Mock data loaded successfully!', 'success');
    }
    
    // Function to add a visual indicator when data comes from the formatter
    function addFormatterIndicator(pointCount) {
        // Create indicator element if it doesn't exist
        let indicator = document.getElementById('formatter-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'formatter-indicator';
            indicator.className = 'formatter-badge';
            indicator.style.position = 'absolute';
            indicator.style.top = '10px';
            indicator.style.right = '10px';
            indicator.style.backgroundColor = '#4caf50';
            indicator.style.color = 'white';
            indicator.style.padding = '5px 10px';
            indicator.style.borderRadius = '4px';
            indicator.style.fontSize = '0.8rem';
            indicator.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            indicator.style.zIndex = '1000';
            indicator.style.display = 'flex';
            indicator.style.alignItems = 'center';
            indicator.style.gap = '5px';
            
            // Add to map container
            document.getElementById('map-container').appendChild(indicator);
        }
        
        // Update indicator content
        indicator.innerHTML = `
            <i class="fas fa-exchange-alt" style="font-size: 0.9rem;"></i>
            <span>Data from Formatter (${pointCount} points)</span>
        `;
        
        // Make it dismissible with a close button
        const closeBtn = document.createElement('i');
        closeBtn.className = 'fas fa-times';
        closeBtn.style.marginLeft = '5px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.opacity = '0.7';
        closeBtn.title = 'Dismiss';
        closeBtn.addEventListener('click', function() {
            indicator.style.display = 'none';
        });
        
        indicator.appendChild(closeBtn);
    }
});
