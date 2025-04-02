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
    let markers = null;
    
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
        
        // Update the map display
        updateMapDisplay(filteredData);
        
        // Update the hotspot analysis
        updateHotspotAnalysis(filteredData);
    }

    // Function to update the map display with clustered markers
    function updateMapDisplay(data) {
        debugLog(`Updating map with ${data.length} data points`);
        
        // SIMPLE TEST: Add a marker at the center of the map
        // This tests if ANY markers can be shown on the map
        const testMarker = L.marker([39.8283, -98.5795], {
            title: "TEST MARKER"
        }).addTo(map);
        testMarker.bindPopup("<b>Test Marker</b><br>This is a test marker.").openPopup();
        debugLog("Added test marker to the map");
        
        // If we have no data, show a message and return
        if (data.length === 0) {
            document.getElementById('hotspot-results').innerHTML = 
                '<p>No data points match the current filters</p>';
            return;
        }
        
        // Clean up any existing markers
        if (markers) {
            map.removeLayer(markers);
            markers = null;
        }
        
        // Process the data to get counts by location
        const locationCounts = processLocationData(data);
        const locations = Object.values(locationCounts);
        debugLog(`Aggregated to ${locations.length} unique locations`);
        
        // Find the maximum count for scaling
        const maxCount = Math.max(...locations.map(loc => loc.count));
        debugLog(`Maximum count at any location: ${maxCount}`);
        
        // Create a regular layer group first instead of cluster group
        // This is to verify markers work at all before trying clustering
        debugLog("Creating basic marker layer group");
        const basicMarkers = L.layerGroup();
        
        // Add markers for each location to the basic layer group
        for (let i = 0; i < locations.length; i++) {
            const location = locations[i];
            
            // Color based on count
            const intensity = location.count / maxCount;
            let fillColor;
            
            if (intensity < 0.25) {
                fillColor = '#a6cee3'; // Light blue for Low
            } else if (intensity < 0.5) {
                fillColor = '#6495ed'; // Medium blue for Medium
            } else if (intensity < 0.8) {
                fillColor = '#1f4eb0'; // Dark blue for High
            } else {
                fillColor = '#d73027'; // Red for Critical
            }
            
            // Create a simple circle marker
            const circle = L.circleMarker([location.lat, location.lng], {
                radius: 10,
                fillColor: fillColor,
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
            
            // Add popup content
            circle.bindPopup(`
                <div style="min-width: 150px;">
                    <h4 style="margin-top: 0;">Call Density</h4>
                    <p><b>Count:</b> ${location.count}</p>
                </div>
            `);
            
            // Add to layer group
            basicMarkers.addLayer(circle);
            
            // Log for first few markers to make sure they're being created
            if (i < 5) {
                debugLog(`Added marker at ${location.lat}, ${location.lng} with count ${location.count}`);
            }
        }
        
        // Add the basic markers to the map
        basicMarkers.addTo(map);
        debugLog(`Added ${locations.length} markers to the map`);
        
        // Now try to initialize clustering if the simple markers appear
        try {
            debugLog("Initializing marker clustering");
            
            // Create a marker cluster group with custom settings
            markers = L.markerClusterGroup({
                maxClusterRadius: 80,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: function(cluster) {
                    const childCount = cluster.getChildCount();
                    
                    // Determine the class based on the count
                    let className, size;
                    if (childCount < 10) {
                        className = 'cluster-small';
                        size = 40;
                    } else if (childCount < 50) {
                        className = 'cluster-medium';
                        size = 50;
                    } else if (childCount < 200) {
                        className = 'cluster-large';
                        size = 60;
                    } else {
                        className = 'cluster-xlarge';
                        size = 70;
                    }
                    
                    // Create marker with count
                    return new L.DivIcon({
                        html: '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><span>' + childCount + '</span></div>',
                        className: 'marker-cluster custom-cluster ' + className,
                        iconSize: new L.Point(size, size)
                    });
                }
            });
            
            // Add the same markers to the cluster group
            map.removeLayer(basicMarkers); // Remove basic markers first
            
            // Re-create markers for the cluster group
            locations.forEach(location => {
                // Color based on count
                const intensity = location.count / maxCount;
                let color;
                
                if (intensity < 0.25) {
                    color = '#a6cee3'; // Light blue for Low
                } else if (intensity < 0.5) {
                    color = '#6495ed'; // Medium blue for Medium
                } else if (intensity < 0.8) {
                    color = '#1f4eb0'; // Dark blue for High
                } else {
                    color = '#d73027'; // Red for Critical
                }
                
                // Determine category for display
                let densityCategory = "Low";
                if (intensity >= 0.8) {
                    densityCategory = "Critical";
                } else if (intensity >= 0.5) {
                    densityCategory = "High";
                } else if (intensity >= 0.25) {
                    densityCategory = "Medium";
                }
                
                // Create the marker
                const marker = L.circleMarker([location.lat, location.lng], {
                    radius: 10 + (intensity * 20), // Scale size by intensity
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
                
                // Add popup
                marker.bindPopup(createPopupContent(location, densityCategory));
                
                // Add to cluster group
                markers.addLayer(marker);
            });
            
            // Add the clustered markers to the map
            map.addLayer(markers);
            debugLog("Added clustered markers to the map");
        } catch (error) {
            console.error("Error creating clusters:", error);
            // Keep the basic markers if clustering fails
        }
        
        // Fit map to show all markers
        if (locations.length > 0) {
            try {
                const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 13
                });
                debugLog("Fit map bounds to markers");
            } catch (error) {
                console.error("Error fitting map to markers:", error);
            }
        }
    }
    
    // Process and aggregate location data
    function processLocationData(data) {
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
        
        return locationCounts;
    }
    
    // Create popup content for a location
    function createPopupContent(location, densityCategory) {
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
        
        // Create popup HTML
        return `
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
        `;
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
        
        // Add instructions for interacting with the map
        resultsHTML += `
            <div class="hotspot-stat">
                <span>Interactive Map:</span>
                <strong>Zoom in/out to see detailed clusters</strong>
            </div>
            <div style="font-size: 0.9em; margin-top: 8px;">
                <p>• Click on clusters to zoom in and see individual points</p>
                <p>• Click on points to see detailed call information</p>
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
        
        console.log("Checking formatter data:", {
            hasData: !!formattedData,
            dataSource,
            formatterToolId
        });
        
        if (formattedData && dataSource === 'formatter' && formatterToolId === 'call-density') {
            console.log("Found data from Data Formatter tool");
            
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
                console.log(`Processing ${dataToProcess.length} records from Data Formatter`);
                
                // Transform data if needed to match the expected format
                originalData = dataToProcess.map(item => {
                    // Try to convert string coordinates to numbers if needed
                    const lat = typeof item.latitude === 'string' ? parseFloat(item.latitude) : item.latitude;
                    const lng = typeof item.longitude === 'string' ? parseFloat(item.longitude) : item.longitude;
                    
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
                    
                    return {
                        ...item,
                        latitude: lat,
                        longitude: lng,
                        hour: item.hour || hour,
                        dayOfWeek: item.dayOfWeek || dayOfWeek,
                        month: item.month || month
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
        
        // Use html2canvas to capture the map
        html2canvas(document.getElementById('map-container')).then(canvas => {
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
            }
        });
    }
    
    // Function to export the map as a PDF
    function exportMapPDF() {
        // Show a loading message
        showUploadStatus('Generating PDF...', 'info');
        
        // Use html2canvas to capture the map
        html2canvas(document.getElementById('map-container')).then(canvas => {
            try {
                // Convert to PDF using jsPDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('landscape', 'mm', 'a4');
                
                // Calculate aspect ratio
                const imgData = canvas.toDataURL('image/png');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
                
                // Add image to PDF
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
                
                // Add title and legend
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                pdf.text('Call Density Heatmap', 10, imgHeight * ratio + 10);
                
                // Save the PDF
                pdf.save('call-density-map.pdf');
                
                showUploadStatus('PDF downloaded', 'success');
            } catch (error) {
                console.error("Error exporting PDF:", error);
                showUploadStatus('Error generating PDF', 'error');
            }
        });
    }
    
    // Add debug message
    console.log("Call Density Heatmap initialized with cluster support");
});