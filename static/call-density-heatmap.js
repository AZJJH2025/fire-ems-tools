document.addEventListener('DOMContentLoaded', function() {
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
        
        if (data.length === 0) {
            document.getElementById('hotspot-results').innerHTML = 
                '<p>No data points match the current filters</p>';
            return;
        }
        
        // Log the first few points to help debug
        console.log("Sample data points:", data.slice(0, 5));
        
        // Format data for heatmap (lat, lng, intensity)
        const heatData = [];
        
        for (const point of data) {
            // Validate coordinates
            const lat = parseFloat(point.latitude);
            const lng = parseFloat(point.longitude);
            
            // Log coordinates for debugging
            console.log("Processing point:", {
                original: { lat: point.latitude, lng: point.longitude },
                parsed: { lat, lng },
                address: point.address || point['Full Address'] || "No address"
            });
            
            // Skip invalid coordinates
            if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
                console.warn('Invalid coordinates:', point);
                continue;
            }
            
            // Check if coordinates seem reasonable
            if (lat > -90 && lat < 90 && lng > -180 && lng < 180) {
                console.log("Coordinates appear to be in valid range");
            } else {
                console.warn("Coordinates outside normal range:", { lat, lng });
            }
            
            // Use provided intensity or default to 1
            let intensity = 1;
            if (point.intensity !== undefined) {
                const parsedIntensity = parseFloat(point.intensity);
                if (!isNaN(parsedIntensity) && isFinite(parsedIntensity)) {
                    intensity = parsedIntensity;
                }
            }
            
            // Use swapped coordinates to see if that fixes the location issue
            // Note: Normally [lat, lng] is correct, but if your locations are showing in wrong places,
            // try [lng, lat] instead
            heatData.push([lng, lat, intensity]); // SWAPPED COORDINATES 
            
            // If the above doesn't work, comment it out and uncomment this original version:
            // heatData.push([lat, lng, intensity]); // NORMAL COORDINATES
        }
        
        if (heatData.length === 0) {
            document.getElementById('hotspot-results').innerHTML = 
                '<p>No valid data points to display heatmap</p>';
            return;
        }
        
        // Wait a moment to ensure the map is ready
        setTimeout(() => {
            try {
                // Make sure map is visible and has proper dimensions
                map.invalidateSize();
                
                // Create and add the heat layer
                heatLayer = L.heatLayer(heatData, {
                    radius: 25,
                    blur: 15, 
                    maxZoom: 17,
                    gradient: {
                        0.1: 'rgba(0, 0, 255, 0.1)',
                        0.4: 'rgba(0, 0, 255, 0.4)',
                        0.7: 'rgba(0, 0, 255, 0.7)',
                        0.9: 'rgba(255, 0, 0, 0.7)'
                    }
                }).addTo(map);
            } catch (error) {
                console.error('Error creating heatmap:', error);
                document.getElementById('hotspot-results').innerHTML = 
                    `<p>Error creating heatmap: ${error.message}</p>`;
            }
        }, 300); // Small delay to ensure map is ready
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
});
