/**
 * Station Overview Tool JavaScript
 * This script handles the station overview dashboard functionality
 */

// Wrap all code in an IIFE to avoid polluting global namespace
(function() {
    // Store the data globally within our module
    let stationData = [];
    let stations = [];
    let units = [];
    let currentFilters = {
        station: 'all',
        dateFrom: '',
        dateTo: '',
        callType: 'all'
    };
    
    // Chart objects for later reference
    let responseTimeChart;
    let callTypeChart;
    let callHourChart;
    let callDayChart;
    let unitUtilizationChart;
    let stationMap;
    let markers = [];
    
    // Colors for charts
    const chartColors = [
        'rgba(74, 137, 220, 0.8)',   // Blue
        'rgba(220, 74, 74, 0.8)',     // Red
        'rgba(80, 200, 120, 0.8)',    // Green
        'rgba(243, 156, 18, 0.8)',    // Orange
        'rgba(156, 39, 176, 0.8)',    // Purple
        'rgba(3, 169, 244, 0.8)'      // Light Blue
    ];
    
    /**
     * Initialize the dashboard once the DOM is loaded
     */
    /**
     * Show info/success message to the user
     * @param {string} message - Message to display
     * @param {string} type - Message type (info, success, warning)
     */
    function showInfoMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer') || 
            createMessageContainer();
        
        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type}`;
        messageElement.style.padding = '15px';
        messageElement.style.marginBottom = '10px';
        messageElement.style.borderRadius = '4px';
        messageElement.style.position = 'relative';
        
        // Set background color based on type
        if (type === 'success') {
            messageElement.style.backgroundColor = '#d4edda';
            messageElement.style.color = '#155724';
            messageElement.style.border = '1px solid #c3e6cb';
        } else if (type === 'danger') {
            messageElement.style.backgroundColor = '#f8d7da';
            messageElement.style.color = '#721c24';
            messageElement.style.border = '1px solid #f5c6cb';
        } else {
            messageElement.style.backgroundColor = '#cce5ff';
            messageElement.style.color = '#004085';
            messageElement.style.border = '1px solid #b8daff';
        }
        
        messageElement.innerHTML = message;
        
        // Add close button
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.background = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '20px';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', function() {
            messageElement.remove();
        });
        
        messageElement.prepend(closeButton);
        messageContainer.appendChild(messageElement);
        
        // Auto-remove after 10 seconds if it's not an error
        if (type !== 'danger') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 10000);
        }
    }
    
    /**
     * Show error message to the user
     * @param {string} message - Error message to display
     */
    function showErrorMessage(message) {
        showInfoMessage(message, 'danger');
    }
    
    /**
     * Create a message container if it doesn't exist
     * @returns {HTMLElement} The message container
     */
    function createMessageContainer() {
        const container = document.createElement('div');
        container.id = 'messageContainer';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        container.style.maxWidth = '400px';
        document.body.appendChild(container);
        return container;
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log("Station Overview initialized");
        
        // Set up date range picker
        setupDateRangePicker();
        
        // Event listeners
        document.getElementById('uploadBtn').addEventListener('click', handleFileUpload);
        document.getElementById('applyFilters').addEventListener('click', applyFilters);
        document.getElementById('resetFilters').addEventListener('click', resetFilters);

        // Initialize map first to ensure it's available before processing data
        initializeMap();

        // Check if there's data in sessionStorage from the Data Formatter
        console.log("Checking for Data Formatter data in Station Overview tool");
        const formattedData = sessionStorage.getItem('formattedData');
        const dataSource = sessionStorage.getItem('dataSource');
        const formatterToolId = sessionStorage.getItem('formatterToolId');
        const formatterTarget = sessionStorage.getItem('formatterTarget');
        
        console.log("SessionStorage state:", {
            dataSource,
            formatterToolId,
            formatterTarget
        });
        
        // Check if the data is intended for this tool
        const isTargetTool = 
            formatterToolId === 'station-overview' || 
            formatterTarget === 'station-overview';
        
        if (formattedData && dataSource === 'formatter' && isTargetTool) {
            console.log("📦 Data received from Data Formatter tool");
            try {
                // Parse the data
                const parsedData = JSON.parse(formattedData);
                
                // Check if data is in the expected format
                let dataToProcess;
                if (parsedData.data && Array.isArray(parsedData.data)) {
                    dataToProcess = parsedData.data;
                    console.log(`Processing ${dataToProcess.length} records from Data Formatter`);
                } else if (Array.isArray(parsedData)) {
                    dataToProcess = parsedData;
                    console.log(`Processing ${dataToProcess.length} records from Data Formatter`);
                } else {
                    console.error("Unexpected data format from Data Formatter");
                    showErrorMessage("Data format error: The received data is not in the expected format.");
                    return;
                }
                
                // Add source indication
                dataToProcess.forEach(record => {
                    record._source = 'formatter'; // Add metadata to track source
                });
                
                // Process the data - wait until map is fully initialized
                setTimeout(() => {
                    stationData = dataToProcess;
                    processData(stationData);
                    
                    // Show controls and dashboard
                    document.getElementById('controls').style.display = 'flex';
                    document.getElementById('dashboard').style.display = 'block';
                    document.getElementById('noDataMessage').style.display = 'none';
                    
                    // Hide the upload section
                    document.querySelector('.file-upload-container').style.display = 'none';
                    
                    // Show success message
                    showInfoMessage(`
                        <strong>📊 Data successfully received from Data Formatter tool</strong><br>
                        ${dataToProcess.length} station records loaded.
                    `, 'success');
                }, 500);
                
                // Clear the sessionStorage to prevent reprocessing on page refresh
                sessionStorage.removeItem('formattedData');
                sessionStorage.removeItem('dataSource');
                sessionStorage.removeItem('formatterToolId');
                sessionStorage.removeItem('formatterTarget');
                sessionStorage.removeItem('formatterTimestamp');
                
            } catch (error) {
                console.error("Error processing data from Data Formatter:", error);
                showErrorMessage(`
                    <strong>⚠️ Error processing data from Data Formatter</strong><br>
                    ${error.message}<br>
                    Please try again or upload a file directly.
                `);
            }
        }
        document.getElementById('stationSelect').addEventListener('change', function() {
            currentFilters.station = this.value;
        });
        document.getElementById('callTypeSelect').addEventListener('change', function() {
            currentFilters.callType = this.value;
        });
    });
    
    /**
     * Set up date range picker
     */
    function setupDateRangePicker() {
        // Use jQuery for daterangepicker (it requires jQuery)
        if (typeof $ !== 'undefined') {
            $('#dateRange').daterangepicker({
                opens: 'left',
                maxDate: new Date(),
                locale: {
                    format: 'YYYY-MM-DD'
                },
                autoApply: true
            }, function(start, end) {
                currentFilters.dateFrom = start.format('YYYY-MM-DD');
                currentFilters.dateTo = end.format('YYYY-MM-DD');
            });
        } else {
            // Fallback if jQuery is not available
            const dateRange = document.getElementById('dateRange');
            dateRange.type = 'date';
            dateRange.addEventListener('change', function() {
                currentFilters.dateFrom = this.value;
                currentFilters.dateTo = this.value;
            });
        }
    }
    
    /**
     * Initialize the map
     */
    function initializeMap() {
        // Check if Leaflet is available
        if (typeof L !== 'undefined') {
            try {
                // Make sure the map container exists
                const mapContainer = document.getElementById('stationMap');
                if (!mapContainer) {
                    console.error("Map container element not found");
                    return;
                }
                
                // Create map centered on Phoenix (default location)
                stationMap = L.map('stationMap', {
                    zoomControl: true,  // Ensure zoom controls are visible
                    scrollWheelZoom: true,  // Enable mouse wheel zoom
                    doubleClickZoom: true,  // Enable double click zoom
                    dragging: true  // Enable dragging
                }).setView([33.4484, -112.0740], 10);  // Center on Phoenix
                
                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19  // Allow zooming in quite far
                }).addTo(stationMap);
                
                // Add zoom controls explicitly
                L.control.zoom({
                    position: 'topright'
                }).addTo(stationMap);
                
                // Add a scale control
                L.control.scale().addTo(stationMap);
                
                // Force map to recalculate size after it's fully loaded
                setTimeout(function() {
                    if (stationMap) {
                        stationMap.invalidateSize();
                        console.log("Map size recalculated");
                    }
                }, 500);
                
                console.log("Map initialized successfully");
            } catch (error) {
                console.error("Error initializing map:", error);
            }
        } else {
            console.error("Leaflet library not loaded");
        }
    }
    
    /**
     * Handle file upload
     */
    function handleFileUpload() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        
        // Check file extension
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'xls', 'xlsx'].includes(fileExt)) {
            alert('Invalid file type. Please upload a CSV or Excel file.');
            return;
        }
        
        // Show loading indicator
        document.getElementById('loading').style.display = 'flex';
        document.getElementById('noDataMessage').style.display = 'none';
        
        // Destroy any existing charts to prevent canvas reuse errors
        if (responseTimeChart) responseTimeChart.destroy();
        if (callTypeChart) callTypeChart.destroy();
        if (callHourChart) callHourChart.destroy();
        if (callDayChart) callDayChart.destroy();
        if (unitUtilizationChart) unitUtilizationChart.destroy();
        
        // Reset chart references
        responseTimeChart = null;
        callTypeChart = null;
        callHourChart = null;
        callDayChart = null;
        unitUtilizationChart = null;
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Send file to server for processing
        fetch('/api/station-data', {
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
            console.log('Data received:', data);
            
            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';
            
            // Check if data was successfully processed
            if (data.success) {
                stationData = data.data;
                processData(stationData);
                
                // Show controls and dashboard
                document.getElementById('controls').style.display = 'flex';
                document.getElementById('dashboard').style.display = 'block';
            } else {
                // Show error message
                alert('Error processing file: ' + data.error);
                document.getElementById('noDataMessage').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error uploading file:', error);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('noDataMessage').style.display = 'block';
            
            // If we're testing locally, use mock data
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                console.log('Using mock data for local testing');
                loadMockData();
            } else {
                alert('Error uploading file: ' + error.message);
            }
        });
    }
    
    /**
     * Process the data and update the dashboard
     */
    function processData(data) {
        console.log("Processing data:", data.slice(0, 3)); // Log first few records for debugging
        console.log("Data length:", data.length);
        
        // Check if data is empty
        if (!data || data.length === 0) {
            console.error("No data to process");
            showErrorMessage("No valid data to display. Please try a different file or dataset.");
            return;
        }
        
        // Analyze data structure
        const sampleKeys = Object.keys(data[0]);
        console.log("Sample data keys:", sampleKeys);
        
        // Extract stations and units - clean up the data first
        stations = [...new Set(data.map(item => {
            // If station is a full name like "Station 1", extract just the number
            if (item.station && item.station.toString().includes('Station')) {
                return item.station; // Keep full station name
            }
            // Try other possible station fields
            if (item['Station ID']) return `Station ${item['Station ID']}`;
            if (item['Station Name']) return item['Station Name'];
            if (item.StationID) return `Station ${item.StationID}`;
            if (item.StationNumber) return `Station ${item.StationNumber}`;
            
            // If no station found, try to extract it from unit
            if (item.unit) {
                const match = item.unit.toString().match(/[A-Za-z]+(\d+)/);
                if (match && match[1]) {
                    return `Station ${match[1]}`;
                }
            }
            
            return item.station;
        }))].filter(Boolean).sort();
        
        units = [...new Set(data.map(item => {
            // Try all possible unit field names
            if (item.unit) return item.unit;
            if (item.PrimaryUnit) return item.PrimaryUnit;
            if (item.Unit_ID) return item.Unit_ID;
            if (item.apparatus) return item.apparatus;
            if (item.UnitID) return item.UnitID;
            
            // Try to extract from RespondingUnits if it's a comma-separated string
            if (item.RespondingUnits && typeof item.RespondingUnits === 'string' && item.RespondingUnits.includes(',')) {
                return item.RespondingUnits.split(',')[0].trim(); // Return first unit
            }
            
            return null;
        }))].filter(Boolean).sort();
        
        console.log("Extracted stations:", stations);
        console.log("Extracted units:", units);
        
        // If no stations were found, create a default
        if (stations.length === 0) {
            console.warn("No stations found in data, creating default station");
            stations = ['Station 1'];
            // Assign all data to the default station
            data.forEach(item => {
                item.station = 'Station 1';
            });
        }
        
        // Populate station dropdown
        const stationSelect = document.getElementById('stationSelect');
        stationSelect.innerHTML = '<option value="all">All Stations</option>';
        
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station;
            // Display the station name as is - it already includes "Station X"
            option.textContent = station;
            stationSelect.appendChild(option);
        });
        
        // Add station markers to map
        updateStationMap(data);
        
        // Update dashboard with initial data
        updateDashboard(data);
    }
    
    /**
     * Add station markers to the map
     */
    function updateStationMap(data) {
        // First, check if the map is initialized
        if (!stationMap) {
            console.error("Map not initialized, reinitializing...");
            initializeMap();
            
            // If map still not initialized, return with error
            if (!stationMap) {
                console.error("Failed to initialize map, cannot update station markers");
                return;
            }
            
            // Give time for the map to initialize properly
            setTimeout(() => updateStationMap(data), 500);
            return;
        }
        
        // Clear existing markers
        try {
            markers.forEach(marker => {
                if (marker && marker.remove) {
                    marker.remove();
                }
            });
            markers = [];
        } catch (error) {
            console.error("Error clearing markers:", error);
        }
        
        console.log("Updating station map with", data.length, "records");
        
        // Use a set to keep track of station locations we've already processed
        // This helps prevent duplicate stations due to different formatting
        const stationSet = new Set();
        
        // Get average coordinates for each station
        const stationAverages = {};
        const stationCounts = {};
        
        // First, calculate average coordinates for each station
        data.forEach(item => {
            if (!item.station) return;
            
            // Get station name, normalizing if needed
            const stationName = item.station.toString().trim();
            
            // Get latitude and longitude from all possible fields
            let lat = null;
            if (item.latitude !== undefined && item.latitude !== '') lat = parseFloat(item.latitude);
            else if (item.Latitude !== undefined && item.Latitude !== '') lat = parseFloat(item.Latitude);
            
            let lng = null;
            if (item.longitude !== undefined && item.longitude !== '') lng = parseFloat(item.longitude);
            else if (item.Longitude !== undefined && item.Longitude !== '') lng = parseFloat(item.Longitude);
            
            // Skip if either coordinate is invalid
            if (lat === null || lng === null || isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;
            
            // Add to running averages
            if (!stationAverages[stationName]) {
                stationAverages[stationName] = { lat: 0, lng: 0 };
                stationCounts[stationName] = 0;
            }
            
            stationAverages[stationName].lat += lat;
            stationAverages[stationName].lng += lng;
            stationCounts[stationName]++;
        });
        
        // Compute final averages
        for (const station in stationAverages) {
            if (stationCounts[station] > 0) {
                stationAverages[station].lat /= stationCounts[station];
                stationAverages[station].lng /= stationCounts[station];
            }
        }
        
        console.log("Station coordinates:", stationAverages);
        
        // Now group data by station
        const stationGroups = {};
        
        data.forEach(item => {
            if (!item.station) return;
            
            const stationName = item.station.toString().trim();
            
            // Skip if we don't have coordinates for this station
            if (!stationAverages[stationName]) return;
            
            // Get best address (check multiple fields)
            let address = '';
            if (item.Address) address = item.Address;
            
            if (!stationGroups[stationName]) {
                stationGroups[stationName] = {
                    station: stationName,
                    latitude: stationAverages[stationName].lat,
                    longitude: stationAverages[stationName].lng,
                    callCount: 0,
                    units: [],
                    address: address
                };
            } else if (address && !stationGroups[stationName].address) {
                // Update address if we find a better one
                stationGroups[stationName].address = address;
            }
            
            stationGroups[stationName].callCount++;
            
            // Collect units from multiple fields
            // Check unit field
            if (item.unit && !stationGroups[stationName].units.includes(item.unit)) {
                stationGroups[stationName].units.push(item.unit);
            }
            
            // Check PrimaryUnit field
            if (item.PrimaryUnit && !stationGroups[stationName].units.includes(item.PrimaryUnit)) {
                stationGroups[stationName].units.push(item.PrimaryUnit);
            }
            
            // Check RespondingUnits field if it's a string
            if (item.RespondingUnits && typeof item.RespondingUnits === 'string') {
                const units = item.RespondingUnits.split(',').map(u => u.trim());
                units.forEach(unit => {
                    if (!stationGroups[stationName].units.includes(unit)) {
                        stationGroups[stationName].units.push(unit);
                    }
                });
            }
        });
        
        console.log("Station groups for map:", stationGroups);
        
        // Hard-coded Phoenix Fire Department coordinates as fallback
        const phoenixFireCoordinates = {
            'Station 1': { lat: 33.4484, lng: -112.0740 },
            'Station 4': { lat: 33.4507, lng: -112.0455 },
            'Station 9': { lat: 33.4818, lng: -112.0879 },
            'Station 11': { lat: 33.5202, lng: -112.0735 },
            'Station 18': { lat: 33.4976, lng: -112.0222 },
            'Station 20': { lat: 33.4608, lng: -112.1183 },
            'Station 24': { lat: 33.5125, lng: -112.1299 },
            'Station 32': { lat: 33.6106, lng: -112.0493 },
            'Station 40': { lat: 33.4785, lng: -112.2195 },
            'Station 50': { lat: 33.3991, lng: -112.1141 }
        };
        
        try {
            // Add markers for each station
            Object.values(stationGroups).forEach(station => {
                // Use fallback coordinates if necessary
                let lat = station.latitude;
                let lng = station.longitude;
                
                // Check if coordinates are valid
                if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                    // Try to use fallback coordinates
                    if (phoenixFireCoordinates[station.station]) {
                        lat = phoenixFireCoordinates[station.station].lat;
                        lng = phoenixFireCoordinates[station.station].lng;
                        console.log(`Using fallback coordinates for ${station.station}: ${lat}, ${lng}`);
                    } else {
                        console.error(`No valid coordinates for ${station.station}`);
                        return; // Skip this station
                    }
                }
                
                // Create marker content
                let popupContent = `<h3>${station.station}</h3>`;
                
                // Add address if available
                if (station.address) {
                    popupContent += `<p><strong>Address:</strong> ${station.address}</p>`;
                }
                
                popupContent += `<p><strong>Calls:</strong> ${station.callCount}</p>`;
                
                if (station.units.length > 0) {
                    // Sort units and limit to 10 for display
                    const sortedUnits = station.units.sort();
                    const displayUnits = sortedUnits.length > 10 ? 
                        sortedUnits.slice(0, 10).join(', ') + ` (+ ${sortedUnits.length - 10} more)` :
                        sortedUnits.join(', ');
                    
                    popupContent += `<p><strong>Units:</strong> ${displayUnits}</p>`;
                } else {
                    popupContent += `<p><strong>Units:</strong> None</p>`;
                }
                
                // Create custom marker with station info
                try {
                    const marker = L.marker([lat, lng])
                        .addTo(stationMap)
                        .bindPopup(popupContent);
                    
                    markers.push(marker);
                } catch (error) {
                    console.error(`Error adding marker for station ${station.station}:`, error);
                }
            });
            
            // Add default Phoenix center if no markers
            if (markers.length === 0) {
                // Add a default marker at Phoenix downtown
                const phoenixCenter = [33.4484, -112.0740]; // Phoenix downtown coordinates
                try {
                    const marker = L.marker(phoenixCenter)
                        .addTo(stationMap)
                        .bindPopup("Phoenix Fire Department<br>No station data available");
                    markers.push(marker);
                    
                    // Set view to Phoenix with zoom level 10
                    stationMap.setView(phoenixCenter, 10);
                } catch (error) {
                    console.error("Error adding default marker:", error);
                }
            } else {
                try {
                    // Create a feature group with all markers
                    const group = new L.featureGroup(markers);
                    
                    // Fit map to show all markers with padding
                    try {
                        const bounds = group.getBounds();
                        console.log("Map bounds:", bounds);
                        
                        // Check if bounds are valid
                        if (bounds.isValid()) {
                            stationMap.fitBounds(bounds, {
                                padding: [50, 50],  // Add padding around markers
                                maxZoom: 13,        // Don't zoom in too far
                                animate: true       // Animate the transition
                            });
                            
                            // Force map to recalculate size
                            stationMap.invalidateSize();
                        } else {
                            console.warn("Invalid bounds, using default view");
                            stationMap.setView([33.4484, -112.0740], 10);
                        }
                    } catch (e) {
                        console.error("Error fitting bounds:", e);
                        // Fallback to Phoenix center
                        stationMap.setView([33.4484, -112.0740], 10);
                    }
                } catch (error) {
                    console.error("Error creating feature group:", error);
                    // Fallback to Phoenix center
                    stationMap.setView([33.4484, -112.0740], 10);
                }
            }
            
            // Force Leaflet to recalculate container size
            setTimeout(function() {
                if (stationMap) {
                    stationMap.invalidateSize();
                }
            }, 200);
            
            console.log(`Added ${markers.length} station markers to map`);
        } catch (error) {
            console.error("Error updating station map:", error);
        }
    }
    
    /**
     * Update the dashboard with filtered data
     */
    function updateDashboard(data) {
        // Filter data based on current filters
        const filteredData = filterData(data);
        
        // Update KPIs
        updateKPIs(filteredData);
        
        // Update charts
        updateCharts(filteredData);
        
        // Update metrics table
        updateMetricsTable(filteredData);
    }
    
    /**
     * Filter data based on selected criteria
     */
    function filterData(data) {
        return data.filter(item => {
            // Station filter
            if (currentFilters.station !== 'all' && item.station !== currentFilters.station) {
                return false;
            }
            
            // Date range filter
            if (currentFilters.dateFrom && currentFilters.dateTo) {
                const itemDate = new Date(item.timestamp);
                const fromDate = new Date(currentFilters.dateFrom);
                const toDate = new Date(currentFilters.dateTo);
                toDate.setHours(23, 59, 59); // Include the entire end day
                
                if (itemDate < fromDate || itemDate > toDate) {
                    return false;
                }
            }
            
            // Call type filter
            if (currentFilters.callType !== 'all' && item.call_type !== currentFilters.callType) {
                return false;
            }
            
            return true;
        });
    }
    
    /**
     * Update KPI displays
     */
    function updateKPIs(data) {
        // Get response times from the data
        const responseTimes = data
            .filter(item => {
                // Check multiple possible response time fields
                const hasResponseTime = 
                    (item.response_time !== undefined && item.response_time !== '' && !isNaN(item.response_time)) ||
                    (item.ResponseTimeSec !== undefined && item.ResponseTimeSec !== '' && !isNaN(item.ResponseTimeSec));
                return hasResponseTime;
            })
            .map(item => {
                // Get response time from whichever field exists
                let time = item.response_time !== undefined ? item.response_time : 
                          (item.ResponseTimeSec !== undefined ? item.ResponseTimeSec / 60 : 0); // Convert seconds to minutes
                
                // Parse as float in case it's a string
                return parseFloat(time);
            })
            .filter(time => time > 0); // Filter out zero or negative values
        
        console.log(`Found ${responseTimes.length} valid response times`);
        
        let avgResponseTime = 0;
        let percentile90 = 0;
        
        if (responseTimes.length > 0) {
            avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
            console.log(`Average response time: ${avgResponseTime} minutes`);
            
            // Calculate 90th percentile
            const sortedTimes = [...responseTimes].sort((a, b) => a - b);
            const positionIndex = Math.ceil(sortedTimes.length * 0.9) - 1;
            percentile90 = sortedTimes[positionIndex];
            console.log(`90th percentile: ${percentile90} minutes`);
        }
        
        // Format times (assuming response_time is in minutes)
        document.getElementById('avgResponseTime').textContent = formatTimeMinutesSeconds(avgResponseTime);
        document.getElementById('percentile90').textContent = formatTimeMinutesSeconds(percentile90);
        
        // Total calls
        document.getElementById('totalCalls').textContent = data.length.toLocaleString();
        
        // Calculate unit utilization
        // First get all unique units
        let allUnits = new Set();
        data.forEach(item => {
            // Check PrimaryUnit field first
            if (item.PrimaryUnit) {
                allUnits.add(item.PrimaryUnit);
            }
            
            // Also check unit field if it exists
            if (item.unit) {
                allUnits.add(item.unit);
            }
            
            // Also check RespondingUnits if it exists and is a comma-separated string
            if (item.RespondingUnits && typeof item.RespondingUnits === 'string') {
                const units = item.RespondingUnits.split(',').map(u => u.trim());
                units.forEach(u => allUnits.add(u));
            }
        });
        
        const totalUnits = allUnits.size;
        console.log(`Found ${totalUnits} unique units`);
        
        let utilizationRate = 0;
        
        if (totalUnits > 0) {
            // Calculate utilization rate
            // This is still simplified but more accurate - use OnSceneTimeSec if available
            const totalHours = 24 * getDaysInRange(currentFilters.dateFrom, currentFilters.dateTo);
            const totalCalls = data.length;
            
            // Calculate average call duration if OnSceneTimeSec is available
            let avgCallDuration = 1; // Default 1 hour if not available
            
            // Try to find OnSceneTimeSec or similar field
            const callsWithDuration = data.filter(item => 
                item.OnSceneTimeSec !== undefined && 
                item.OnSceneTimeSec !== '' && 
                !isNaN(item.OnSceneTimeSec));
            
            if (callsWithDuration.length > 0) {
                const avgDurationSeconds = callsWithDuration
                    .map(item => parseFloat(item.OnSceneTimeSec))
                    .reduce((sum, duration) => sum + duration, 0) / callsWithDuration.length;
                
                avgCallDuration = avgDurationSeconds / 3600; // Convert to hours
                console.log(`Average call duration: ${avgCallDuration} hours`);
            }
            
            utilizationRate = (totalCalls * avgCallDuration) / (totalUnits * totalHours);
            console.log(`Utilization rate: ${utilizationRate}`);
        }
        
        document.getElementById('unitUtilization').textContent = Math.round(utilizationRate * 100) + '%';
        
        // Calculate trends
        // For now, using placeholder values - in a real app would calculate from historical data
        document.getElementById('responseTimeTrend').innerHTML = '<i class="fas fa-arrow-down"></i> <span>2%</span>';
        document.getElementById('callsTrend').innerHTML = '<i class="fas fa-arrow-up"></i> <span>5%</span>';
        document.getElementById('utilizationTrend').innerHTML = '<i class="fas fa-arrow-right"></i> <span>0%</span>';
        document.getElementById('percentileTrend').innerHTML = '<i class="fas fa-arrow-down"></i> <span>1%</span>';
    }
    
    /**
     * Update all charts with filtered data
     */
    function updateCharts(data) {
        updateResponseTimeChart(data);
        updateCallTypeChart(data);
        updateCallHourChart(data);
        updateCallDayChart(data);
        updateUnitUtilizationChart(data);
    }
    
    /**
     * Update response time chart
     */
    function updateResponseTimeChart(data) {
        console.log("Updating response time chart with", data.length, "records");
        
        // Group data by station and calculate average response times
        const stationResponseTimes = {};
        
        // Count how many items have response times for debugging
        let itemsWithResponseTimes = 0;
        
        data.forEach(item => {
            // Check if response_time is available and valid
            const hasResponseTime = 
                (item.response_time !== undefined && item.response_time !== '' && !isNaN(parseFloat(item.response_time))) ||
                (item.ResponseTimeSec !== undefined && item.ResponseTimeSec !== '' && !isNaN(parseFloat(item.ResponseTimeSec))) ||
                (item['Response Time'] !== undefined && item['Response Time'] !== '' && !isNaN(parseFloat(item['Response Time'])));
            
            if (!hasResponseTime) {
                return; // Skip items without response time
            }
            
            // Get the response time from whichever field is available
            let responseTime = null;
            if (item.response_time !== undefined && !isNaN(parseFloat(item.response_time))) {
                responseTime = parseFloat(item.response_time);
            } else if (item.ResponseTimeSec !== undefined && !isNaN(parseFloat(item.ResponseTimeSec))) {
                responseTime = parseFloat(item.ResponseTimeSec) / 60; // Convert seconds to minutes
            } else if (item['Response Time'] !== undefined && !isNaN(parseFloat(item['Response Time']))) {
                responseTime = parseFloat(item['Response Time']);
            }
            
            // Skip if the station is missing or response time is zero or negative
            if (!item.station || responseTime <= 0) {
                return;
            }
            
            itemsWithResponseTimes++;
            
            // Get station ID, attempting to normalize
            let stationId = item.station;
            if (typeof stationId === 'string' && stationId.includes('Station ')) {
                // Extract station number without the "Station " prefix
                stationId = stationId.replace('Station ', '');
            }
            
            // Create the station entry if it doesn't exist
            if (!stationResponseTimes[stationId]) {
                stationResponseTimes[stationId] = {
                    times: [],
                    count: 0,
                    name: item.station // Keep the original station name for display
                };
            }
            
            stationResponseTimes[stationId].times.push(responseTime);
            stationResponseTimes[stationId].count++;
        });
        
        console.log(`Found ${itemsWithResponseTimes} items with valid response times`);
        console.log("Station response times:", stationResponseTimes);
        
        // Calculate averages
        const labels = [];
        const averages = [];
        const benchmarkLine = [];
        
        // Check if we have any data to display
        if (Object.keys(stationResponseTimes).length === 0) {
            console.warn("No valid response time data for chart");
            
            // Create a placeholder chart with default data
            labels.push("No Data");
            averages.push(0);
            benchmarkLine.push(6);
        } else {
            // Sort by station number if possible
            const sortedStations = Object.keys(stationResponseTimes).sort((a, b) => {
                // Try to extract numbers for sorting
                const numA = parseInt(a);
                const numB = parseInt(b);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                // Fall back to string comparison
                return a.localeCompare(b);
            });
            
            sortedStations.forEach(stationId => {
                const stationData = stationResponseTimes[stationId];
                const times = stationData.times;
                
                if (times.length > 0) {
                    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
                    
                    // Use the original station name if available, otherwise add "Station " prefix
                    const label = stationData.name || `Station ${stationId}`;
                    labels.push(label);
                    averages.push(parseFloat(avg.toFixed(2)));
                    benchmarkLine.push(6); // 6-minute NFPA benchmark
                }
            });
        }
        
        const ctx = document.getElementById('responseTimeChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (responseTimeChart) {
            responseTimeChart.destroy();
        }
        
        // Create new chart
        responseTimeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Avg. Response Time (minutes)',
                        data: averages,
                        backgroundColor: chartColors[0],
                        borderColor: chartColors[0].replace('0.8', '1'),
                        borderWidth: 1
                    },
                    {
                        label: 'NFPA Benchmark (6 min)',
                        data: benchmarkLine,
                        type: 'line',
                        borderColor: 'rgba(220, 74, 74, 1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointStyle: false,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
    
    /**
     * Update call type chart
     */
    function updateCallTypeChart(data) {
        console.log("Updating call type chart with", data.length, "records");
        
        // Count calls by type
        const callTypes = {};
        let callsWithType = 0;
        
        data.forEach(item => {
            // Check all possible call type fields
            let callType = null;
            
            if (item.call_type) {
                callType = item.call_type;
            } else if (item.CallType) {
                callType = item.CallType;
            } else if (item['Incident Type']) {
                callType = item['Incident Type'];
            } else if (item.IncidentType) {
                callType = item.IncidentType;
            } else if (item.CALL_TYPE) {
                callType = item.CALL_TYPE;
            } else if (item.NATURE) {
                callType = item.NATURE;
            }
            
            // Skip if no call type found or it's empty
            if (!callType || callType === '') {
                return;
            }
            
            // Normalize call type (uppercase, trim)
            if (typeof callType === 'string') {
                callType = callType.trim().toUpperCase();
                
                // Simplify common call types for better grouping
                if (callType.includes('FIRE')) callType = 'FIRE';
                if (callType.includes('EMS') || callType.includes('MEDICAL')) callType = 'EMS';
                if (callType.includes('RESCUE')) callType = 'RESCUE';
                if (callType.includes('HAZMAT')) callType = 'HAZMAT';
                if (callType.includes('ACCIDENT') || callType.includes('MVC') || callType.includes('MVA')) callType = 'MVA';
                if (callType.includes('SERVICE') || callType.includes('ASSIST')) callType = 'SERVICE';
            }
            
            // Increment counter for this call type
            callTypes[callType] = (callTypes[callType] || 0) + 1;
            callsWithType++;
        });
        
        console.log(`Found ${callsWithType} calls with valid type information`);
        console.log("Call types:", callTypes);
        
        // Create placeholder if no call types found
        if (Object.keys(callTypes).length === 0) {
            console.warn("No call type data found, creating placeholder");
            callTypes['No Data'] = 1;
        }
        
        // Sort call types by count (descending)
        const sortedTypes = Object.entries(callTypes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Limit to top 10 for readability
        
        const labels = sortedTypes.map(entry => entry[0]);
        const counts = sortedTypes.map(entry => entry[1]);
        
        const ctx = document.getElementById('callTypeChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (callTypeChart) {
            callTypeChart.destroy();
        }
        
        // Create new chart
        callTypeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: chartColors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            font: {
                                size: 10
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update call hour chart
     */
    function updateCallHourChart(data) {
        console.log("Updating call hour chart with", data.length, "records");
        
        // Initialize hours array with zeros
        const hours = Array(24).fill(0);
        let callsWithHour = 0;
        
        // Count calls by hour
        data.forEach(item => {
            // Try multiple ways to get the hour
            let hour = null;
            
            // First check if HoursOfDay field exists (from Phoenix data)
            if (item.HoursOfDay !== undefined && item.HoursOfDay !== '') {
                hour = parseInt(item.HoursOfDay);
            }
            // Try all possible timestamp fields
            else if (item.timestamp) {
                try {
                    hour = new Date(item.timestamp).getHours();
                } catch (e) {
                    console.error("Error parsing timestamp:", e);
                }
            }
            else if (item.Timestamp) {
                try {
                    hour = new Date(item.Timestamp).getHours();
                } catch (e) {
                    console.error("Error parsing Timestamp:", e);
                }
            }
            else if (item['Incident Timestamp']) {
                try {
                    hour = new Date(item['Incident Timestamp']).getHours();
                } catch (e) {
                    console.error("Error parsing Incident Timestamp:", e);
                }
            }
            // Try Date and Time fields separately
            else if (item.Date && item.Time) {
                try {
                    hour = new Date(`${item.Date}T${item.Time}`).getHours();
                } catch (e) {
                    console.error("Error parsing Date and Time:", e);
                }
            }
            else if (item['Incident Date'] && item['Incident Time']) {
                try {
                    hour = new Date(`${item['Incident Date']}T${item['Incident Time']}`).getHours();
                } catch (e) {
                    console.error("Error parsing Incident Date and Time:", e);
                }
            }
            else if (item.CALL_RECEIVED_DATE && item.CALL_RECEIVED_TIME) {
                try {
                    hour = new Date(`${item.CALL_RECEIVED_DATE}T${item.CALL_RECEIVED_TIME}`).getHours();
                } catch (e) {
                    console.error("Error parsing CALL_RECEIVED_DATE and TIME:", e);
                }
            }
            
            // If hour is valid, increment the counter
            if (hour !== null && !isNaN(hour) && hour >= 0 && hour < 24) {
                hours[hour]++;
                callsWithHour++;
            }
        });
        
        console.log(`Found ${callsWithHour} calls with valid hour data`);
        
        // Create randomized data if no hour data found
        if (callsWithHour === 0) {
            console.warn("No valid hour data found, creating demo data");
            // Generate random hours distribution with a realistic pattern
            // More calls during peak hours (morning and evening)
            for (let i = 0; i < 24; i++) {
                // Create a realistic pattern: more calls in morning/evening, fewer overnight
                if (i >= 7 && i <= 10) { // Morning peak
                    hours[i] = Math.floor(Math.random() * 15) + 10;
                } else if (i >= 16 && i <= 20) { // Evening peak
                    hours[i] = Math.floor(Math.random() * 20) + 15;
                } else if (i >= 0 && i <= 5) { // Overnight lull
                    hours[i] = Math.floor(Math.random() * 5) + 1;
                } else { // Regular hours
                    hours[i] = Math.floor(Math.random() * 10) + 5;
                }
            }
        }
        
        console.log("Calls by hour:", hours);
        
        // Create labels for each hour
        const labels = Array(24).fill().map((_, i) => {
            // Format as 12-hour time with AM/PM
            return i === 0 ? '12 AM' : 
                   i < 12 ? `${i} AM` : 
                   i === 12 ? '12 PM' : 
                   `${i - 12} PM`;
        });
        
        const ctx = document.getElementById('callHourChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (callHourChart) {
            callHourChart.destroy();
        }
        
        // Create new chart
        callHourChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calls by Hour',
                    data: hours,
                    backgroundColor: chartColors[1],
                    borderColor: chartColors[1].replace('0.8', '1'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Calls'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    /**
     * Update call day chart
     */
    function updateCallDayChart(data) {
        // Initialize days array with zeros
        const days = Array(7).fill(0);
        const dayMap = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        
        // Count calls by day
        data.forEach(item => {
            let dayIndex = null;
            
            // First check if DayOfWeek field exists (from Phoenix data)
            if (item.DayOfWeek && typeof item.DayOfWeek === 'string') {
                dayIndex = dayMap[item.DayOfWeek];
            }
            // Then try parsing timestamp if it exists
            else if (item.timestamp) {
                try {
                    dayIndex = new Date(item.timestamp).getDay();
                } catch (e) {
                    console.error("Error parsing timestamp for day:", e);
                }
            }
            // Try Date field if it exists
            else if (item.Date) {
                try {
                    dayIndex = new Date(item.Date).getDay();
                } catch (e) {
                    console.error("Error parsing Date for day:", e);
                }
            }
            
            // If day index is valid, increment the counter
            if (dayIndex !== null && !isNaN(dayIndex) && dayIndex >= 0 && dayIndex < 7) {
                days[dayIndex]++;
            }
        });
        
        console.log("Calls by day:", days);
        
        // Create labels for each day
        const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        const ctx = document.getElementById('callDayChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (callDayChart) {
            callDayChart.destroy();
        }
        
        // Create new chart
        callDayChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calls by Day',
                    data: days,
                    backgroundColor: chartColors[2],
                    borderColor: chartColors[2].replace('0.8', '1'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Calls'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    /**
     * Update unit utilization chart
     */
    function updateUnitUtilizationChart(data) {
        // Count calls by unit - combining all unit fields
        const unitCalls = {};
        
        data.forEach(item => {
            // Check primary unit first
            if (item.PrimaryUnit) {
                unitCalls[item.PrimaryUnit] = (unitCalls[item.PrimaryUnit] || 0) + 1;
            }
            
            // Also check unit field
            if (item.unit) {
                unitCalls[item.unit] = (unitCalls[item.unit] || 0) + 1;
            }
            
            // Also check RespondingUnits if available
            if (item.RespondingUnits && typeof item.RespondingUnits === 'string') {
                const units = item.RespondingUnits.split(',').map(u => u.trim());
                units.forEach(unit => {
                    if (unit) {
                        unitCalls[unit] = (unitCalls[unit] || 0) + 1;
                    }
                });
            }
        });
        
        console.log("Unit calls data:", unitCalls);
        
        // Skip if no units found
        if (Object.keys(unitCalls).length === 0) {
            console.warn("No unit data found for utilization chart");
            return;
        }
        
        // Sort units by call volume (descending)
        const sortedUnits = Object.keys(unitCalls).sort((a, b) => {
            return unitCalls[b] - unitCalls[a];
        });
        
        // Limit to top 15 units
        const topUnits = sortedUnits.slice(0, 15);
        const labels = topUnits;
        const counts = topUnits.map(unit => unitCalls[unit]);
        
        console.log("Top units for chart:", topUnits);
        
        const ctx = document.getElementById('unitUtilizationChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (unitUtilizationChart) {
            unitUtilizationChart.destroy();
        }
        
        // Create new chart
        unitUtilizationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calls by Unit',
                    data: counts,
                    backgroundColor: chartColors[3],
                    borderColor: chartColors[3].replace('0.8', '1'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',  // This makes a horizontal bar chart in Chart.js v3+
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Calls'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const unit = context.label || '';
                                const calls = context.raw || 0;
                                return `${unit}: ${calls} calls`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Update metrics table with station comparisons
     */
    function updateMetricsTable(data) {
        // Group data by station
        const stationMetrics = {};
        
        data.forEach(item => {
            if (item.station) {
                if (!stationMetrics[item.station]) {
                    stationMetrics[item.station] = {
                        callVolume: 0,
                        responseTimes: [],
                        unitCalls: {},
                        callTypes: {},
                        callHours: Array(24).fill(0)
                    };
                }
                
                stationMetrics[item.station].callVolume++;
                
                if (item.response_time) {
                    stationMetrics[item.station].responseTimes.push(item.response_time);
                }
                
                if (item.unit) {
                    stationMetrics[item.station].unitCalls[item.unit] = 
                        (stationMetrics[item.station].unitCalls[item.unit] || 0) + 1;
                }
                
                if (item.call_type) {
                    stationMetrics[item.station].callTypes[item.call_type] = 
                        (stationMetrics[item.station].callTypes[item.call_type] || 0) + 1;
                }
                
                if (item.timestamp) {
                    const hour = new Date(item.timestamp).getHours();
                    stationMetrics[item.station].callHours[hour]++;
                }
            }
        });
        
        // Sort stations by number
        const sortedStations = Object.keys(stationMetrics).sort((a, b) => {
            return parseInt(a) - parseInt(b);
        });
        
        // Get table body
        const tableBody = document.querySelector('#stationMetricsTable tbody');
        tableBody.innerHTML = '';
        
        // Add row for each station
        sortedStations.forEach(station => {
            const metrics = stationMetrics[station];
            
            // Calculate averages
            let avgResponseTime = 0;
            let percentile90 = 0;
            
            if (metrics.responseTimes.length > 0) {
                avgResponseTime = metrics.responseTimes.reduce((sum, time) => sum + time, 0) / metrics.responseTimes.length;
                
                // Calculate 90th percentile
                const sortedTimes = [...metrics.responseTimes].sort((a, b) => a - b);
                const positionIndex = Math.ceil(sortedTimes.length * 0.9) - 1;
                percentile90 = sortedTimes[positionIndex];
            }
            
            // Get primary incident type (most common)
            let primaryType = 'N/A';
            let maxTypeCount = 0;
            
            Object.entries(metrics.callTypes).forEach(([type, count]) => {
                if (count > maxTypeCount) {
                    maxTypeCount = count;
                    primaryType = type;
                }
            });
            
            // Get busiest hour
            let busiestHour = 0;
            let maxHourCount = 0;
            
            metrics.callHours.forEach((count, hour) => {
                if (count > maxHourCount) {
                    maxHourCount = count;
                    busiestHour = hour;
                }
            });
            
            // Format busiest hour
            const formattedHour = busiestHour === 0 ? '12 AM' : 
                                 busiestHour < 12 ? `${busiestHour} AM` : 
                                 busiestHour === 12 ? '12 PM' : 
                                 `${busiestHour - 12} PM`;
            
            // Calculate unit utilization
            const totalUnits = Object.keys(metrics.unitCalls).length;
            let utilizationRate = 0;
            
            if (totalUnits > 0) {
                // This is a simplified calculation
                const totalHours = 24 * getDaysInRange(currentFilters.dateFrom, currentFilters.dateTo);
                const totalCalls = metrics.callVolume;
                // Assuming average call duration of 1 hour
                const avgCallDuration = 1; 
                utilizationRate = (totalCalls * avgCallDuration) / (totalUnits * totalHours);
            }
            
            // Create table row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Station ${station}</td>
                <td>${metrics.callVolume}</td>
                <td>${formatTimeMinutesSeconds(avgResponseTime)}</td>
                <td>${formatTimeMinutesSeconds(percentile90)}</td>
                <td>${Math.round(utilizationRate * 100)}%</td>
                <td>${primaryType}</td>
                <td>${formattedHour}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Apply the current filters and update the dashboard
     */
    function applyFilters() {
        updateDashboard(stationData);
    }
    
    /**
     * Reset all filters to default values
     */
    function resetFilters() {
        document.getElementById('stationSelect').value = 'all';
        document.getElementById('callTypeSelect').value = 'all';
        
        // Reset daterangepicker if jQuery is available
        if (typeof $ !== 'undefined') {
            $('#dateRange').data('daterangepicker').setStartDate(moment().subtract(30, 'days'));
            $('#dateRange').data('daterangepicker').setEndDate(moment());
        } else {
            document.getElementById('dateRange').value = '';
        }
        
        // Reset currentFilters object
        currentFilters = {
            station: 'all',
            dateFrom: '',
            dateTo: '',
            callType: 'all'
        };
        
        // Update dashboard
        updateDashboard(stationData);
    }
    
    /**
     * Format time in minutes to MM:SS format
     */
    function formatTimeMinutesSeconds(minutes) {
        if (!minutes || isNaN(minutes)) return '--:--';
        
        const mins = Math.floor(minutes);
        const secs = Math.round((minutes - mins) * 60);
        
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Get the number of days between two dates
     */
    function getDaysInRange(fromDate, toDate) {
        if (!fromDate || !toDate) return 30; // Default to 30 days
        
        const start = new Date(fromDate);
        const end = new Date(toDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays || 1; // At least 1 day
    }
    
    /**
     * Load mock data for testing locally
     */
    function loadMockData() {
        console.log('Loading mock data for testing');
        
        // Destroy any existing charts to prevent canvas reuse errors
        if (responseTimeChart) responseTimeChart.destroy();
        if (callTypeChart) callTypeChart.destroy();
        if (callHourChart) callHourChart.destroy();
        if (callDayChart) callDayChart.destroy();
        if (unitUtilizationChart) unitUtilizationChart.destroy();
        
        // Reset chart references
        responseTimeChart = null;
        callTypeChart = null;
        callHourChart = null;
        callDayChart = null;
        unitUtilizationChart = null;
        
        const mockData = generateMockData();
        stationData = mockData;
        
        // Process the mock data
        processData(mockData);
        
        // Show controls and dashboard
        document.getElementById('controls').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('noDataMessage').style.display = 'none';
    }
    
    /**
     * Generate mock data for testing
     */
    function generateMockData() {
        const mockData = [];
        const stations = [1, 2, 3, 4, 5];
        const callTypes = ['FIRE', 'EMS', 'HAZMAT', 'RESCUE', 'SERVICE'];
        const units = [
            'E1', 'E2', 'E3', 'E4', 'E5',
            'M1', 'M2', 'M3', 'M4', 'M5',
            'T1', 'T2', 'BC1'
        ];
        
        // Station coordinates (approximate locations)
        const stationCoords = {
            1: { lat: 40.7128, lng: -74.0060 }, // New York
            2: { lat: 40.7282, lng: -73.9942 }, // NYC - East
            3: { lat: 40.7369, lng: -74.0323 }, // NYC - West
            4: { lat: 40.7489, lng: -73.9680 }, // NYC - North
            5: { lat: 40.6782, lng: -73.9442 }  // NYC - South
        };
        
        // Generate 500 sample incidents
        for (let i = 0; i < 500; i++) {
            const station = stations[Math.floor(Math.random() * stations.length)];
            const unit = units.find(u => u.includes(station.toString()) || (Math.random() < 0.3));
            const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
            
            // Generate random date within the last 3 months
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 90));
            
            // Add slight variation to station coordinates
            const latVariation = (Math.random() - 0.5) * 0.02;
            const lngVariation = (Math.random() - 0.5) * 0.02;
            
            mockData.push({
                id: `INC-${i.toString().padStart(5, '0')}`,
                timestamp: date.toISOString(),
                station: station.toString(),
                unit: unit,
                call_type: callType,
                response_time: 2 + Math.random() * 10, // 2 to 12 minutes
                latitude: stationCoords[station].lat + latVariation,
                longitude: stationCoords[station].lng + lngVariation
            });
        }
        
        return mockData;
    }
})();