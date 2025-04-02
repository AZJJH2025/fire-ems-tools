document.addEventListener('DOMContentLoaded', function() {
    console.log("🚑 Call Density Heatmap initializing...");
    
    // Add a debugging function for visibility
    function debugLog(message) {
        console.log(`🔍 DEBUG: ${message}`);
    }
    
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
        fadeAnimation: false, // Disable animations which can cause issues
        preferCanvas: false   // Use SVG renderer for better export compatibility
    }).setView([39.8283, -98.5795], 4); // Default center of US

    // Make sure map is ready
    map.whenReady(() => {
        debugLog("Leaflet map is ready");
    });
    
    // Helper function to ensure map is in good state for exporting
    function prepareMapForExport() {
        // Force redraw all layers
        map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                layer.redraw();
            }
        });
        
        // Invalidate size to ensure map is properly sized
        map.invalidateSize();
        
        // Make sure all tiles are loaded
        const container = map.getContainer();
        const tiles = container.querySelectorAll('.leaflet-tile');
        let allTilesLoaded = true;
        
        tiles.forEach(tile => {
            // Check if any tiles are still loading
            if (!tile.complete) {
                allTilesLoaded = false;
            }
        });
        
        return allTilesLoaded;
    }

    // Add the base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Initialize variables
    let markers = null;
    let originalData = [];
    let filteredData = [];
    let callTypes = [];
    
    // Create a marker cluster group with custom styling
    markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 18,
        chunkedLoading: true,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let className = 'custom-cluster ';
            
            // Define class based on cluster size
            if (count < 10) {
                className += 'cluster-small';
            } else if (count < 30) {
                className += 'cluster-medium';
            } else if (count < 100) {
                className += 'cluster-large';
            } else {
                className += 'cluster-xlarge';
            }
            
            return L.divIcon({ 
                html: '<div><span>' + count + '</span></div>', 
                className: className,
                iconSize: L.point(40, 40)
            });
        }
    }).addTo(map);
    
    // Add a test marker to verify map functionality
    const testMarker = L.marker([39.8283, -98.5795], {
        title: "TEST MARKER"
    });
    testMarker.bindPopup("<b>Test Marker</b><br>This marker will be removed when data is loaded.");
    markers.addLayer(testMarker);
    debugLog("Added test marker to the center of the map");
    
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
                
                // Apply initial filtering and display density map
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

    // Function to apply filters and update the map display
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
        
        // Update the map display
        displayMarkers(filteredData);
        
        // Update the hotspot analysis
        updateHotspotAnalysis(filteredData);
    }

    // Process and aggregate location data
    function processLocationData(data) {
        const locationCounts = {};
        let validCount = 0;
        let invalidCount = 0;
        
        // Check the first few data points to debug
        if (data.length > 0) {
            debugLog(`First data point sample: ${JSON.stringify(data[0])}`);
            // Check all properties of the first point
            const firstPoint = data[0];
            for (const key in firstPoint) {
                debugLog(`Property ${key}: ${firstPoint[key]} (type: ${typeof firstPoint[key]})`);
            }
        }
        
        for (const point of data) {
            // Validate coordinates - try different possible property names
            let lat = null;
            let lng = null;
            
            // Try different property names for latitude
            if (point.latitude !== undefined) {
                lat = parseFloat(point.latitude);
            } else if (point.lat !== undefined) {
                lat = parseFloat(point.lat);
            } else if (point.y !== undefined) {
                lat = parseFloat(point.y);
            }
            
            // Try different property names for longitude
            if (point.longitude !== undefined) {
                lng = parseFloat(point.longitude);
            } else if (point.lng !== undefined) {
                lng = parseFloat(point.lng);
            } else if (point.x !== undefined) {
                lng = parseFloat(point.x);
            }
            
            // Skip invalid coordinates
            if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
                invalidCount++;
                // Log the first few invalid points for debugging
                if (invalidCount <= 3) {
                    debugLog(`Invalid coordinates in point: ${JSON.stringify(point)}`);
                }
                continue;
            }
            
            validCount++;
            
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
        
        debugLog(`Processed ${data.length} points: ${validCount} valid, ${invalidCount} invalid`);
        
        return locationCounts;
    }
    
    // Display markers on the map with clustering
    function displayMarkers(data) {
        debugLog(`Displaying ${data.length} data points on map`);
        
        // Clear existing markers
        markers.clearLayers();
        
        // If no data, show message and return
        if (data.length === 0) {
            document.getElementById('hotspot-results').innerHTML = 
                '<p>No data points match the current filters</p>';
            return;
        }
        
        // If no valid locations found, add a fallback marker to show something
        const hasValidCoordinates = data.some(point => {
            const lat = parseFloat(point.latitude);
            const lng = parseFloat(point.longitude);
            return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
        });
        
        if (!hasValidCoordinates) {
            debugLog("No valid coordinates found in data, adding sample markers");
            
            // Add some sample markers for testing - will help users see if clustering works
            const sampleLocations = [
                { lat: 33.4484, lng: -112.0740, count: 15, type: "Sample" }, // Phoenix
                { lat: 33.4255, lng: -111.9400, count: 10, type: "Sample" }, // Tempe
                { lat: 33.3062, lng: -111.8413, count: 8, type: "Sample" },  // Chandler
                { lat: 33.4942, lng: -112.2691, count: 5, type: "Sample" },  // Glendale
                { lat: 33.3528, lng: -111.7890, count: 7, type: "Sample" }   // Mesa
            ];
            
            // Add sample markers
            sampleLocations.forEach(location => {
                const marker = L.marker([location.lat, location.lng], {
                    title: "Sample Marker"
                });
                marker.bindPopup(`<b>Sample Marker</b><br>This is a demonstration marker.<br>Your data appears to be missing valid coordinates.`);
                markers.addLayer(marker);
            });
            
            // Show clear message to the user
            showUploadStatus('Warning: Your data appears to be missing valid coordinates. Sample markers are shown for demonstration purposes.', 'error');
            
            // Zoom to the sample area
            map.setView([33.4484, -112.0740], 10);
            
            return;
        }
        
        // Process data to aggregate points
        const locationCounts = processLocationData(data);
        const locations = Object.values(locationCounts);
        debugLog(`Aggregated to ${locations.length} unique locations`);
        
        // If still no locations after processing, show clear error
        if (locations.length === 0) {
            debugLog("No valid locations after processing. Adding notice marker.");
            
            // Add a marker in the center of the US to show something
            const errorMarker = L.marker([39.8283, -98.5795], {
                title: "No Valid Locations"
            });
            errorMarker.bindPopup(`<div style="text-align:center; width:200px;"><b>No Valid Location Data</b><br>
                Your data was loaded but no valid geographic coordinates were found.<br><br>
                Please check your data format. Coordinates should be in latitude/longitude format.</div>`);
            markers.addLayer(errorMarker);
            
            // Show message to user
            showUploadStatus('Error: No valid geographic coordinates found in your data.', 'error');
            
            // Center map on US
            map.setView([39.8283, -98.5795], 4);
            
            return;
        }
        
        // Find maximum count for scaling
        const maxCount = Math.max(...locations.map(loc => loc.count));
        debugLog(`Maximum count: ${maxCount}`);
        
        // Add markers for each location
        for (let i = 0; i < locations.length; i++) {
            const location = locations[i];
            
            // Calculate intensity for color selection
            const intensity = location.count / maxCount;
            
            // Determine density category and color
            let densityCategory = "Low";
            let color;
            
            if (intensity < 0.25) {
                color = '#a6cee3'; // Light blue for Low
                densityCategory = "Low";
            } else if (intensity < 0.5) {
                color = '#6495ed'; // Medium blue for Medium
                densityCategory = "Medium";
            } else if (intensity < 0.8) {
                color = '#1f4eb0'; // Dark blue for High
                densityCategory = "High";
            } else {
                color = '#d73027'; // Red for Critical
                densityCategory = "Critical";
            }
            
            // Determine icon size based on count
            const sizeFactor = Math.max(0.3, location.count / maxCount);
            const size = Math.min(60, Math.max(30, Math.floor(20 + (sizeFactor * 30)))); // Scale icon size between 30 and 60px
            
            // Create a custom icon for better visibility on mobile
            const icon = L.divIcon({
                className: `call-density-marker density-${densityCategory.toLowerCase()}`,
                html: `<div style="background-color:${color}; width:${size}px; height:${size}px; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-weight:bold; border: 2px solid white;">${location.count}</div>`,
                iconSize: [size, size],
                iconAnchor: [size/2, size/2]
            });
            
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
            
            // Format busiest hour for display
            let busiestHourText = 'Unknown';
            if (busiestHour !== null) {
                const hourFormatted = busiestHour.toString().padStart(2, '0');
                const nextHour = (busiestHour + 1) % 24;
                const nextHourFormatted = nextHour.toString().padStart(2, '0');
                busiestHourText = `${hourFormatted}:00 - ${nextHourFormatted}:00`;
            }
            
            // Create marker with the custom icon
            const marker = L.marker([location.lat, location.lng], {
                icon: icon,
                title: `${location.count} calls at this location`
            });
            
            // Add popup with details - now with improved mobile formatting
            marker.bindPopup(`
                <div style="min-width: 200px; max-width: 300px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                        Call Density Information
                    </h4>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 6px 4px; font-weight: bold; width: 40%;">Location:</td>
                            <td style="padding: 6px 4px;">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 4px; font-weight: bold;">Call Count:</td>
                            <td style="padding: 6px 4px;"><span style="font-weight: bold; color: ${color};">${location.count}</span></td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 4px; font-weight: bold;">Density Level:</td>
                            <td style="padding: 6px 4px;">${densityCategory}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 4px; font-weight: bold;">Most Common Type:</td>
                            <td style="padding: 6px 4px;">${mostCommonType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 4px; font-weight: bold;">Busiest Time:</td>
                            <td style="padding: 6px 4px;">${busiestHourText}</td>
                        </tr>
                    </table>
                </div>
            `, {
                maxWidth: 320,
                className: 'call-density-popup',
                closeButton: true,
                autoPan: true
            });
            
            // Add marker to cluster group
            markers.addLayer(marker);
            
            // Log details for the first 5 markers
            if (i < 5) {
                debugLog(`Added marker: ${location.lat}, ${location.lng}, count: ${location.count}, size: ${size}px`);
            }
        }
        
        debugLog(`Added ${locations.length} markers to the map`);
        
        // Fit the map to show all markers
        if (locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            } catch (error) {
                console.error("Error fitting map to data:", error);
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
        
        // Add information about map interaction
        resultsHTML += `
            <div class="hotspot-stat">
                <span>Map Instructions:</span>
                <strong>Click markers for details</strong>
            </div>
        `;
        
        if (sortedTypes.length > 1) {
            // Display a table of call types
            resultsHTML += `
                <div class="hotspot-table">
                    <h4>Call Type Breakdown</h4>
                    <table class="heatmap-table">
                        <thead>
                            <tr>
                                <th>Call Type</th>
                                <th>Count</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            sortedTypes.forEach(([type, count]) => {
                const percentage = ((count / totalCalls) * 100).toFixed(1);
                resultsHTML += `
                    <tr>
                        <td>${type}</td>
                        <td>${count.toLocaleString()}</td>
                        <td>${percentage}%</td>
                    </tr>
                `;
            });
            
            resultsHTML += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        document.getElementById('hotspot-results').innerHTML = resultsHTML;
    }
    
    // Function to check if data is available from the Data Formatter tool
    function checkForFormatterData() {
        const formattedData = sessionStorage.getItem('formattedData');
        const dataSource = sessionStorage.getItem('dataSource');
        const formatterToolId = sessionStorage.getItem('formatterToolId');
        
        debugLog("Checking for data from formatter");
        
        if (formattedData && dataSource === 'formatter' && formatterToolId === 'call-density') {
            debugLog("Found data from Data Formatter tool");
            
            try {
                // Parse the data
                const parsedData = JSON.parse(formattedData);
                
                let dataToProcess;
                if (Array.isArray(parsedData)) {
                    dataToProcess = parsedData;
                } else if (parsedData.data && Array.isArray(parsedData.data)) {
                    dataToProcess = parsedData.data;
                } else {
                    throw new Error("Invalid data format");
                }
                
                // Process the data
                debugLog(`Processing ${dataToProcess.length} records from Data Formatter`);
                
                // Transform data if needed to match the expected format
                originalData = dataToProcess.map(item => {
                    // Debug the raw data format for first few items
                    if (dataToProcess.indexOf(item) === 0) {
                        debugLog(`Raw data sample: ${JSON.stringify(item)}`);
                        
                        // List all available fields in the data for debugging
                        const keys = Object.keys(item);
                        debugLog(`Available fields: ${keys.join(', ')}`);
                        
                        // Check if any keys look like they might contain coordinate data
                        const possibleLatKeys = keys.filter(key => 
                            key.toLowerCase().includes('lat') || 
                            key.toLowerCase() === 'y' || 
                            key.toLowerCase().includes('latitude'));
                            
                        const possibleLngKeys = keys.filter(key => 
                            key.toLowerCase().includes('lon') || 
                            key.toLowerCase().includes('lng') || 
                            key.toLowerCase() === 'x' || 
                            key.toLowerCase().includes('long'));
                            
                        if (possibleLatKeys.length > 0) {
                            debugLog(`Possible latitude fields: ${possibleLatKeys.join(', ')}`);
                            possibleLatKeys.forEach(key => {
                                debugLog(`${key} value: ${item[key]} (${typeof item[key]})`);
                            });
                        }
                        
                        if (possibleLngKeys.length > 0) {
                            debugLog(`Possible longitude fields: ${possibleLngKeys.join(', ')}`);
                            possibleLngKeys.forEach(key => {
                                debugLog(`${key} value: ${item[key]} (${typeof item[key]})`);
                            });
                        }
                    }
                    
                    // Try to extract latitude from different possible properties
                    let lat = null;
                    
                    // Check for case-insensitive property names and normalize them
                    const itemKeys = Object.keys(item);
                    const latitudeKey = itemKeys.find(key => 
                        key.toLowerCase() === 'latitude' || 
                        key.toLowerCase() === 'lat' ||
                        key.toLowerCase() === 'y' ||
                        key.toLowerCase() === 'latitude_wgs84'
                    );
                    
                    if (latitudeKey) {
                        lat = typeof item[latitudeKey] === 'string' ? parseFloat(item[latitudeKey]) : item[latitudeKey];
                        debugLog(`Found latitude in field: ${latitudeKey} = ${lat}`);
                    } else if (item.Latitude !== undefined) {
                        lat = typeof item.Latitude === 'string' ? parseFloat(item.Latitude) : item.Latitude;
                    } else if (item.latitude !== undefined) {
                        lat = typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude;
                    } else if (item.LAT !== undefined) {
                        lat = typeof item.LAT === 'string' ? parseFloat(item.LAT) : item.LAT;
                    } else if (item.lat !== undefined) {
                        lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
                    } else if (item.y !== undefined) {
                        lat = typeof item.y === 'string' ? parseFloat(item.y) : item.y;
                    } else if (item.location && item.location.coordinates && item.location.coordinates[1] !== undefined) {
                        // GeoJSON format: [longitude, latitude]
                        lat = item.location.coordinates[1];
                    }
                    
                    // Try to extract longitude from different possible properties
                    let lng = null;
                    
                    // Check for case-insensitive property names and normalize them
                    const lngKey = itemKeys.find(key => 
                        key.toLowerCase() === 'longitude' || 
                        key.toLowerCase() === 'lng' || 
                        key.toLowerCase() === 'lon' || 
                        key.toLowerCase() === 'long' || 
                        key.toLowerCase() === 'x' ||
                        key.toLowerCase() === 'longitude_wgs84'
                    );
                    
                    if (lngKey) {
                        lng = typeof item[lngKey] === 'string' ? parseFloat(item[lngKey]) : item[lngKey];
                        debugLog(`Found longitude in field: ${lngKey} = ${lng}`);
                    } else if (item.Longitude !== undefined) {
                        lng = typeof item.Longitude === 'string' ? parseFloat(item.Longitude) : item.Longitude;
                    } else if (item.longitude !== undefined) {
                        lng = typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude;
                    } else if (item.LON !== undefined || item.LONG !== undefined) {
                        lng = typeof (item.LON || item.LONG) === 'string' ? parseFloat(item.LON || item.LONG) : (item.LON || item.LONG);
                    } else if (item.lng !== undefined || item.lon !== undefined || item.long !== undefined) {
                        lng = typeof (item.lng || item.lon || item.long) === 'string' ? parseFloat(item.lng || item.lon || item.long) : (item.lng || item.lon || item.long);
                    } else if (item.x !== undefined) {
                        lng = typeof item.x === 'string' ? parseFloat(item.x) : item.x;
                    } else if (item.location && item.location.coordinates && item.location.coordinates[0] !== undefined) {
                        // GeoJSON format: [longitude, latitude]
                        lng = item.location.coordinates[0];
                    }
                    
                    // Handle hour, day of week, etc. if available
                    let hour, dayOfWeek, month;
                    
                    if (item.datetime || item.timestamp || item.date || item.time) {
                        const dateString = item.datetime || item.timestamp || item.date || item.time;
                        try {
                            const date = new Date(dateString);
                            if (!isNaN(date.getTime())) {
                                hour = date.getHours();
                                dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                                month = date.getMonth() + 1; // 1 = January, 12 = December
                            }
                        } catch (e) {
                            console.error("Error parsing date:", e);
                        }
                    }
                    
                    // Check for special case: separate address fields that need geocoding
                    // (We can't actually geocode here, but we can check if this might be the issue)
                    if ((lat === null || isNaN(lat) || !isFinite(lat)) || 
                        (lng === null || isNaN(lng) || !isFinite(lng))) {
                        
                        // Check if we have address fields but no coordinates
                        const hasAddressFields = item.address || item.Address || 
                                              item.LOCATION_ADDR || item.location_address ||
                                              (item.street && (item.city || item.state || item.zip));
                                              
                        if (hasAddressFields && dataToProcess.indexOf(item) < 3) {
                            debugLog(`Item has address fields but no valid coordinates. This data might need geocoding: ${JSON.stringify(item)}`);
                        }
                    }
                    
                    // Special case for Phoenix Fire Department format
                    if ((lat === null || isNaN(lat) || !isFinite(lat)) && 
                        (lng === null || isNaN(lng) || !isFinite(lng))) {
                        
                        // Check for Phoenix FD specific formats where coords are in a single field
                        if (item.coordinates || item.Coordinates || item.COORDINATES) {
                            const coordStr = item.coordinates || item.Coordinates || item.COORDINATES;
                            if (typeof coordStr === 'string') {
                                // Try parsing common formats like "33.4484,-112.0740" or "33.4484 -112.0740"
                                const coordParts = coordStr.split(/[,\s]+/);
                                if (coordParts.length === 2) {
                                    lat = parseFloat(coordParts[0]);
                                    lng = parseFloat(coordParts[1]);
                                    debugLog(`Parsed coordinates from combined field: ${lat}, ${lng}`);
                                }
                            }
                        }
                    }
                    
                    // If there are no valid coordinates, make sure to log it
                    if ((lat === null || isNaN(lat) || !isFinite(lat)) || 
                        (lng === null || isNaN(lng) || !isFinite(lng))) {
                        if (dataToProcess.indexOf(item) < 3) {
                            debugLog(`Invalid or missing coordinates in item: ${JSON.stringify(item)}`);
                        }
                    } else if (dataToProcess.indexOf(item) < 2) {
                        debugLog(`Valid coordinates found: ${lat}, ${lng}`);
                    }
                    
                    // Transform to a standardized format
                    return {
                        ...item,
                        latitude: lat,
                        longitude: lng,
                        hour: item.hour || hour,
                        dayOfWeek: item.dayOfWeek || dayOfWeek,
                        month: item.month || month,
                        // Add a default type if none exists
                        type: item.type || item.callType || item.call_type || item.incident_type || "Unknown"
                    };
                });
                
                // Extract call types and update filter
                callTypes = [...new Set(originalData.map(point => point.type))];
                populateCallTypeFilter(callTypes);
                
                // Apply initial filtering and display on map
                showUploadStatus('Data loaded from Data Formatter', 'success');
                applyFilters();
                
                // Fit map to the data
                fitMapToData(originalData);
            } catch (error) {
                console.error("Error processing data from Data Formatter:", error);
                showUploadStatus(`Error processing data: ${error.message}`, 'error');
            }
        }
    }
    
    // Fit map view to include all data points
    function fitMapToData(data) {
        if (!data || data.length === 0) return;
        
        // Extract valid coordinates
        const validCoords = data
            .filter(point => {
                const lat = parseFloat(point.latitude);
                const lng = parseFloat(point.longitude);
                return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
            })
            .map(point => [parseFloat(point.latitude), parseFloat(point.longitude)]);
        
        if (validCoords.length === 0) return;
        
        // Create bounds and fit map
        try {
            const bounds = L.latLngBounds(validCoords);
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 13
            });
        } catch (error) {
            console.error("Error fitting map to data:", error);
        }
    }
    
    // Export image handlers
    document.getElementById('export-png').addEventListener('click', exportMapImage);
    document.getElementById('export-pdf').addEventListener('click', exportMapPDF);
    
    // Function to export the map as an image
    function exportMapImage() {
        // Show a loading message
        showUploadStatus('Generating PNG image...', 'info');
        
        // Prepare the map for export
        debugLog("Preparing map for export");
        prepareMapForExport();
        
        // Create a function to handle the actual export
        const captureMap = () => {
            // Add a temporary loading indicator overlay
            const loadingOverlay = document.createElement('div');
            loadingOverlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;z-index:1001;';
            loadingOverlay.innerHTML = '<div style="background:white;padding:10px;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,0.2);">Capturing map...</div>';
            document.getElementById('map-container').appendChild(loadingOverlay);
            
            // Trigger full tile reload
            map.eachLayer(layer => {
                if (layer instanceof L.TileLayer) {
                    // Force reload of tiles
                    layer._removeTile = function() {}; // Temporarily disable tile removal
                    layer.redraw();
                    setTimeout(() => {
                        // Restore original function after timeout
                        delete layer._removeTile;
                    }, 1000);
                }
            });
            
            // Wait for next animation frame to ensure DOM is updated
            requestAnimationFrame(() => {
                // Use leaflet-image library if available, otherwise fall back to html2canvas
                if (window.leafletImage) {
                    leafletImage(map, function(err, canvas) {
                        if (err) {
                            console.error("Error with leaflet-image:", err);
                            fallbackToHtml2Canvas();
                            return;
                        }
                        
                        try {
                            // Create download link
                            const link = document.createElement('a');
                            link.download = 'call-density-map.png';
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                            
                            showUploadStatus('PNG image downloaded', 'success');
                            
                            // Remove the loading overlay
                            document.getElementById('map-container').removeChild(loadingOverlay);
                        } catch (error) {
                            console.error("Error exporting PNG:", error);
                            showUploadStatus('Error generating PNG, trying alternate method...', 'error');
                            fallbackToHtml2Canvas();
                        }
                    });
                } else {
                    fallbackToHtml2Canvas();
                }
                
                // Fallback to html2canvas if leaflet-image fails or is not available
                function fallbackToHtml2Canvas() {
                    debugLog("Using html2canvas for export");
                    
                    // Use html2canvas with proper settings for map capture
                    html2canvas(document.getElementById('map-container'), {
                        useCORS: true,              // Allow loading of cross-origin images
                        allowTaint: true,           // Allow images that might taint canvas
                        foreignObjectRendering: false, // Disable FO rendering which can cause issues
                        logging: true,              // Enable logging for debugging
                        scale: 2,                   // Higher scale for better quality
                        backgroundColor: '#FFFFFF', // White background
                        onclone: function(clonedDoc) {
                            // This runs on the cloned document before rendering
                            const mapElem = clonedDoc.getElementById('map');
                            if (mapElem) {
                                // Make map container visible during capture
                                mapElem.style.visibility = 'visible';
                                
                                // Ensure the map container has correct dimensions
                                const mapContainer = clonedDoc.getElementById('map-container');
                                if (mapContainer) {
                                    mapContainer.style.overflow = 'visible';
                                }
                                
                                // Make sure all Leaflet tiles are visible
                                const tiles = clonedDoc.querySelectorAll('.leaflet-tile');
                                tiles.forEach(tile => {
                                    tile.style.visibility = 'visible';
                                    tile.style.opacity = '1';
                                });
                                
                                // Make sure all markers are visible
                                const markers = clonedDoc.querySelectorAll('.leaflet-marker-icon');
                                markers.forEach(marker => {
                                    marker.style.visibility = 'visible';
                                    marker.style.opacity = '1';
                                });
                                
                                // Make sure controls are hidden (they often cause issues)
                                const controls = clonedDoc.querySelectorAll('.leaflet-control-container');
                                controls.forEach(control => {
                                    control.style.display = 'none';
                                });
                            }
                        }
                    }).then(canvas => {
                        try {
                            // Create download link
                            const link = document.createElement('a');
                            link.download = 'call-density-map.png';
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                            
                            showUploadStatus('PNG image downloaded', 'success');
                        } catch (error) {
                            console.error("Error exporting PNG:", error);
                            showUploadStatus('Error generating PNG', 'error');
                        } finally {
                            // Remove the loading overlay
                            if (loadingOverlay.parentNode) {
                                loadingOverlay.parentNode.removeChild(loadingOverlay);
                            }
                        }
                    }).catch(error => {
                        console.error("Error capturing map:", error);
                        showUploadStatus('Error capturing map image', 'error');
                        
                        // Remove the loading overlay
                        if (loadingOverlay.parentNode) {
                            loadingOverlay.parentNode.removeChild(loadingOverlay);
                        }
                    });
                }
            });
        };
        
        // Force a small delay to ensure map is fully loaded before capture
        setTimeout(captureMap, 500);
    }
    
    // Function to export the map as a PDF
    function exportMapPDF() {
        // Show a loading message
        showUploadStatus('Generating PDF...', 'info');
        
        // Prepare the map for export
        debugLog("Preparing map for PDF export");
        prepareMapForExport();
        
        // Ensure the legend is visible and properly positioned
        const legendElem = document.getElementById('legend');
        if (legendElem) {
            legendElem.style.display = 'block';
        }
        
        // Create a function to handle the actual export
        const generatePDF = (imageDataUrl) => {
            try {
                // Convert to PDF using jsPDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('landscape', 'mm', 'a4');
                
                // Create an image element to get dimensions
                const img = new Image();
                img.onload = function() {
                    // Calculate aspect ratio to fit on page
                    const pageWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
                    const pageHeight = pdf.internal.pageSize.getHeight() - 30; // 10mm top margin + 20mm bottom for text
                    const imgWidth = this.width;
                    const imgHeight = this.height;
                    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
                    
                    // Add image to PDF
                    pdf.addImage(this, 'PNG', 10, 10, imgWidth * ratio, imgHeight * ratio);
                    
                    // Get information for the PDF
                    let pdfTitle = 'Call Density Heatmap';
                    let totalCalls = 'N/A';
                    let dateRange = 'N/A';
                    
                    // Try to get call count from the dashboard
                    const hotspotResults = document.getElementById('hotspot-results');
                    if (hotspotResults) {
                        const countElement = hotspotResults.querySelector('.hotspot-stat strong');
                        if (countElement) {
                            totalCalls = countElement.textContent;
                        }
                    }
                    
                    // Add title and metadata section
                    const titleY = imgHeight * ratio + 15;
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(16);
                    pdf.text(pdfTitle, 10, titleY);
                    
                    // Add call information
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(10);
                    pdf.text(`Total Incidents: ${totalCalls}`, 10, titleY + 7);
                    
                    // Add date and time
                    const currentDate = new Date().toLocaleString();
                    pdf.text(`Generated: ${currentDate}`, pageWidth - 50, titleY + 7);
                    
                    // Add a footer with attribution
                    pdf.setFont('helvetica', 'italic');
                    pdf.setFontSize(8);
                    pdf.text('Map data © OpenStreetMap contributors | Generated by FireEMS.ai', 10, pdf.internal.pageSize.getHeight() - 5);
                    
                    // Save the PDF
                    pdf.save('call-density-map.pdf');
                    
                    showUploadStatus('PDF downloaded', 'success');
                };
                img.src = imageDataUrl;
            } catch (error) {
                console.error("Error creating PDF:", error);
                showUploadStatus('Error generating PDF', 'error');
            }
        };
        
        // Function to handle the capture process
        const captureForPDF = () => {
            // Add a temporary loading indicator overlay
            const loadingOverlay = document.createElement('div');
            loadingOverlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;z-index:1001;';
            loadingOverlay.innerHTML = '<div style="background:white;padding:10px;border-radius:5px;box-shadow:0 0 10px rgba(0,0,0,0.2);">Generating PDF...</div>';
            document.getElementById('map-container').appendChild(loadingOverlay);
            
            // Try two capture methods, preferring domtoimage for better quality if available
            const tryDomToImage = typeof domtoimage !== 'undefined';
            
            if (tryDomToImage) {
                // Use dom-to-image for better quality if available
                debugLog("Using dom-to-image for PDF export");
                domtoimage.toPng(document.getElementById('map-container'), {
                    quality: 1,
                    bgcolor: '#fff',
                    scale: 2,
                    style: {
                        'transform': 'scale(1)',
                        'transform-origin': 'top left'
                    }
                })
                .then(function(dataUrl) {
                    generatePDF(dataUrl);
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.parentNode.removeChild(loadingOverlay);
                    }
                })
                .catch(function(error) {
                    console.error('Error with dom-to-image, falling back to html2canvas:', error);
                    useHtml2Canvas();
                });
            } else {
                useHtml2Canvas();
            }
            
            // Fallback to html2canvas
            function useHtml2Canvas() {
                debugLog("Using html2canvas for PDF export");
                html2canvas(document.getElementById('map-container'), {
                    useCORS: true,
                    allowTaint: true,
                    foreignObjectRendering: false,
                    logging: true,
                    scale: 2,
                    backgroundColor: '#FFFFFF',
                    onclone: function(clonedDoc) {
                        const mapElem = clonedDoc.getElementById('map');
                        if (mapElem) {
                            // Ensure high visibility for all map elements
                            mapElem.style.visibility = 'visible';
                            
                            // Ensure the map container has correct dimensions
                            const mapContainer = clonedDoc.getElementById('map-container');
                            if (mapContainer) {
                                mapContainer.style.overflow = 'visible';
                            }
                            
                            // Make sure all Leaflet tiles are visible
                            const tiles = clonedDoc.querySelectorAll('.leaflet-tile');
                            tiles.forEach(tile => {
                                tile.style.visibility = 'visible';
                                tile.style.opacity = '1';
                            });
                            
                            // Make sure all markers are visible
                            const markers = clonedDoc.querySelectorAll('.leaflet-marker-icon, .leaflet-marker-shadow, .call-density-marker');
                            markers.forEach(marker => {
                                marker.style.visibility = 'visible';
                                marker.style.opacity = '1';
                            });
                            
                            // Make sure legend is visible
                            const legend = clonedDoc.querySelector('.legend');
                            if (legend) {
                                legend.style.visibility = 'visible';
                                legend.style.opacity = '1';
                            }
                        }
                    }
                }).then(function(canvas) {
                    generatePDF(canvas.toDataURL('image/png'));
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.parentNode.removeChild(loadingOverlay);
                    }
                }).catch(function(error) {
                    console.error("Error capturing map:", error);
                    showUploadStatus('Error capturing map for PDF', 'error');
                    if (loadingOverlay.parentNode) {
                        loadingOverlay.parentNode.removeChild(loadingOverlay);
                    }
                });
            }
        };
        
        // Ensure map is fully loaded and rendered before capturing
        setTimeout(captureForPDF, 800);
    }
});