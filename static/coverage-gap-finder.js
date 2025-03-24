/**
 * Coverage Gap Finder JavaScript
 * 
 * This script handles the interactive mapping and analysis tools for identifying
 * underserved areas in emergency response coverage.
 */

// Wrap everything in an IIFE to avoid global scope pollution
(function() {
    // Global variables
    let map; // Leaflet map instance
    let drawControl; // Leaflet draw control
    let boundaryLayer; // Jurisdiction boundary layer
    let stationMarkers = []; // Array of station markers
    let stationLayers = []; // Array of station coverage layers
    let suggestedStationMarkers = []; // Array of suggested new station markers
    let heatmapLayer; // For incident density heatmap
    let incidentData = []; // Stored incident data
    let stationData = []; // Stored station data
    let jurisdictionBoundary; // GeoJSON of jurisdiction boundary
    let populationLayer; // Population density layer
    
    // DOM References
    const mapElement = document.getElementById('coverageMap');
    const areaCoverageElement = document.getElementById('areaCoverage');
    const populationCoverageElement = document.getElementById('populationCoverage');
    const incidentCoverageElement = document.getElementById('incidentCoverage');
    const avgResponseTimeElement = document.getElementById('avgResponseTime');
    const stationTableBody = document.querySelector('#stationTable tbody');
    
    // Constants for calculations
    const METERS_PER_MILE = 1609.34;
    const DEFAULT_STATION_COLOR = '#0000FF'; // Blue
    const SUGGESTED_STATION_COLOR = '#FFA500'; // Orange
    const COVERAGE_COLOR = 'rgba(0, 128, 0, 0.5)'; // Semi-transparent green
    const GAP_COLOR = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
    
    // NFPA Standard parameters
    const STANDARDS = {
        'nfpa1710': {
            responseTime: 4,
            turnoutTime: 1.0,
            travelSpeed: 25
        },
        'nfpa1720-urban': {
            responseTime: 9,
            turnoutTime: 1.0,
            travelSpeed: 25
        },
        'nfpa1720-suburban': {
            responseTime: 10,
            turnoutTime: 1.0, 
            travelSpeed: 35
        },
        'nfpa1720-rural': {
            responseTime: 14,
            turnoutTime: 1.0,
            travelSpeed: 45
        },
        'nfpa1720-remote': {
            responseTime: 16+4, // 4 minutes of response tolerance added
            turnoutTime: 1.0,
            travelSpeed: 45
        }
    };
    
    // Travel speeds in miles per hour
    const TRAVEL_SPEEDS = {
        'urban-slow': 20,
        'urban-med': 25,
        'urban-fast': 30,
        'suburban': 35,
        'rural': 45,
        'highway': 55
    };
    
    /**
     * Initializes the application once the DOM is loaded
     */
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Coverage Gap Finder initialized');
        initializeMap();
        setupEventListeners();
    });
    
    /**
     * Initializes the Leaflet map
     */
    function initializeMap() {
        // Create map centered on Phoenix by default
        map = L.map('coverageMap', {
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            dragging: true
        }).setView([33.4484, -112.0740], 10);
        
        // Add base OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Initialize the draw control for boundary drawing
        initializeDrawControl();
        
        // Add a click handler to the map for adding stations
        map.on('click', function(e) {
            // Only add station if stationName field is populated
            const stationNameInput = document.getElementById('stationName');
            if (stationNameInput.value.trim() !== '') {
                document.getElementById('stationLat').value = e.latlng.lat.toFixed(6);
                document.getElementById('stationLng').value = e.latlng.lng.toFixed(6);
            }
        });
        
        // Force map to recalculate size after its container becomes visible
        setTimeout(function() {
            map.invalidateSize();
        }, 500);
    }
    
    /**
     * Initializes the Leaflet Draw control for creating boundaries
     */
    function initializeDrawControl() {
        // Create a feature group for storing drawn items
        boundaryLayer = new L.FeatureGroup();
        map.addLayer(boundaryLayer);
        
        // Initialize the draw control and add it to the map
        drawControl = new L.Control.Draw({
            draw: {
                polyline: false,
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polygon: {
                    allowIntersection: false,
                    drawError: {
                        color: '#e1e100',
                        message: '<strong>Error:</strong> Polygon edges cannot cross!'
                    },
                    shapeOptions: {
                        color: '#3388ff',
                        weight: 3
                    }
                }
            },
            edit: {
                featureGroup: boundaryLayer,
                remove: true,
                edit: true
            }
        });
        
        // Handle drawing complete event
        map.on(L.Draw.Event.CREATED, function (e) {
            boundaryLayer.clearLayers(); // Clear previous boundary
            const layer = e.layer;
            boundaryLayer.addLayer(layer);
            
            // Store the boundary as GeoJSON
            jurisdictionBoundary = layer.toGeoJSON();
            
            // Update coverage calculations
            updateCoverageCalculations();
        });
        
        // Handle edited event
        map.on(L.Draw.Event.EDITED, function (e) {
            const layers = e.layers;
            layers.eachLayer(function (layer) {
                // Update the boundary if it's edited
                if (boundaryLayer.hasLayer(layer)) {
                    jurisdictionBoundary = layer.toGeoJSON();
                    updateCoverageCalculations();
                }
            });
        });
        
        // Handle deleted event
        map.on(L.Draw.Event.DELETED, function (e) {
            jurisdictionBoundary = null; // Clear boundary data
            updateCoverageCalculations();
        });
    }
    
    /**
     * Sets up all event listeners for UI interactions
     */
    function setupEventListeners() {
        // File upload event listeners
        document.getElementById('uploadIncidentBtn').addEventListener('click', uploadIncidentData);
        document.getElementById('uploadStationBtn').addEventListener('click', uploadStationData);
        
        // Manual station entry
        document.getElementById('addStationBtn').addEventListener('click', addStationManually);
        document.getElementById('clearStationsBtn').addEventListener('click', clearAllStations);
        document.getElementById('geocodeAddressBtn').addEventListener('click', geocodeStationAddress);
        
        // Coverage parameters
        document.getElementById('standardSelect').addEventListener('change', updateStandardParameters);
        document.getElementById('travelSpeedSelect').addEventListener('change', function() {
            // Show/hide custom speed input based on selection
            if (this.value === 'custom') {
                document.getElementById('customSpeedGroup').style.display = 'block';
            } else {
                document.getElementById('customSpeedGroup').style.display = 'none';
            }
        });
        
        document.getElementById('turnoutTimeSelect').addEventListener('change', function() {
            // Show/hide custom turnout time input based on selection
            if (this.value === 'custom') {
                document.getElementById('customTurnoutGroup').style.display = 'block';
            } else {
                document.getElementById('customTurnoutGroup').style.display = 'none';
            }
        });
        
        // Toggle switches
        document.getElementById('populationDensityToggle').addEventListener('change', function() {
            // Toggle population density layer visibility
            if (this.checked) {
                showPopulationDensity();
            } else {
                hidePopulationDensity();
            }
        });
        
        document.getElementById('callDensityToggle').addEventListener('change', function() {
            // Toggle call density heatmap visibility
            if (this.checked && incidentData.length > 0) {
                showCallDensity();
            } else {
                hideCallDensity();
            }
        });
        
        // Action buttons
        document.getElementById('calculateBtn').addEventListener('click', calculateCoverage);
        document.getElementById('optimizeBtn').addEventListener('click', suggestNewLocations);
        document.getElementById('applyOptimizationBtn').addEventListener('click', applyOptimizationSuggestions);
        
        // Boundary tools
        document.getElementById('drawBoundaryBtn').addEventListener('click', function() {
            // Toggle the draw control
            if (!map.drawControlAdded) {
                map.addControl(drawControl);
                map.drawControlAdded = true;
                // Activate the polygon drawing handler
                new L.Draw.Polygon(map).enable();
            } else {
                map.removeControl(drawControl);
                map.drawControlAdded = false;
            }
        });
        
        document.getElementById('uploadBoundaryBtn').addEventListener('click', function() {
            // Create a hidden file input element to trigger the file dialog
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.geojson, .json, .kml';
            fileInput.style.display = 'none';
            
            // Handle file selection
            fileInput.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = function(event) {
                        try {
                            const geoData = JSON.parse(event.target.result);
                            loadBoundaryFromGeoJSON(geoData);
                        } catch (err) {
                            console.error('Error parsing GeoJSON:', err);
                            alert('Invalid GeoJSON file. Please ensure the file contains valid GeoJSON.');
                        }
                    };
                    
                    reader.readAsText(file);
                }
            });
            
            // Trigger the file dialog
            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
        
        document.getElementById('clearBoundaryBtn').addEventListener('click', function() {
            boundaryLayer.clearLayers();
            jurisdictionBoundary = null;
            updateCoverageCalculations();
        });
        
        // Export buttons
        document.getElementById('exportPdfBtn').addEventListener('click', exportAsPDF);
        document.getElementById('exportImageBtn').addEventListener('click', exportAsImage);
        document.getElementById('exportDataBtn').addEventListener('click', exportData);
    }
    
    /**
     * Updates the input fields based on selected NFPA standard
     */
    function updateStandardParameters() {
        const selectedStandard = document.getElementById('standardSelect').value;
        
        if (selectedStandard !== 'custom' && STANDARDS[selectedStandard]) {
            const standard = STANDARDS[selectedStandard];
            
            // Update the form fields with the standard values
            document.getElementById('responseTimeTarget').value = standard.responseTime;
            
            // Update turnout time select
            const turnoutSelect = document.getElementById('turnoutTimeSelect');
            if (standard.turnoutTime === 0.5) turnoutSelect.value = '0.5';
            else if (standard.turnoutTime === 1.0) turnoutSelect.value = '1.0';
            else if (standard.turnoutTime === 1.5) turnoutSelect.value = '1.5';
            else if (standard.turnoutTime === 2.0) turnoutSelect.value = '2.0';
            else {
                turnoutSelect.value = 'custom';
                document.getElementById('customTurnoutGroup').style.display = 'block';
                document.getElementById('customTurnout').value = standard.turnoutTime;
            }
            
            // Update travel speed select
            const speedSelect = document.getElementById('travelSpeedSelect');
            for (const [key, value] of Object.entries(TRAVEL_SPEEDS)) {
                if (value === standard.travelSpeed) {
                    speedSelect.value = key;
                    document.getElementById('customSpeedGroup').style.display = 'none';
                    break;
                }
            }
            
            // If speed doesn't match predefined values, set custom
            if (!Object.values(TRAVEL_SPEEDS).includes(standard.travelSpeed)) {
                speedSelect.value = 'custom';
                document.getElementById('customSpeedGroup').style.display = 'block';
                document.getElementById('customSpeed').value = standard.travelSpeed;
            }
        }
    }
    
    /**
     * Handles incident data file upload
     */
    function uploadIncidentData() {
        const fileInput = document.getElementById('incidentFileInput');
        const file = fileInput.files[0];
        const statusElement = document.getElementById('incidentUploadStatus');
        
        if (!file) {
            statusElement.textContent = 'Please select a file first.';
            statusElement.style.color = 'red';
            return;
        }
        
        // Check file extension
        const extension = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(extension)) {
            statusElement.textContent = 'Invalid file type. Please upload CSV or Excel file.';
            statusElement.style.color = 'red';
            return;
        }
        
        // Show loading message
        statusElement.textContent = 'Uploading and processing file...';
        statusElement.style.color = '#3498db';
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Send file to server
        fetch('/api/incident-data', {
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
            // Check if data was processed successfully
            if (data.success) {
                incidentData = data.data;
                
                // Update status
                statusElement.textContent = `Loaded ${incidentData.length} incident records.`;
                statusElement.style.color = 'green';
                
                // Enable call density toggle if we have incidents
                document.getElementById('callDensityToggle').disabled = false;
                
                // Update coverage calculations
                updateIncidentCoverage();
                
                // Display call density if the toggle is checked
                if (document.getElementById('callDensityToggle').checked) {
                    showCallDensity();
                }
            } else {
                statusElement.textContent = `Error: ${data.error}`;
                statusElement.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error uploading incidents:', error);
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.style.color = 'red';
            
            // For testing/development - generate mock data locally
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                console.log('Generating mock incident data for local testing');
                generateMockIncidentData();
                
                statusElement.textContent = `Generated ${incidentData.length} mock incident records for testing.`;
                statusElement.style.color = 'green';
                
                // Update coverage calculations
                updateIncidentCoverage();
                
                // Display call density if the toggle is checked
                if (document.getElementById('callDensityToggle').checked) {
                    showCallDensity();
                }
            }
        });
    }
    
    /**
     * Handles station data file upload
     */
    function uploadStationData() {
        const fileInput = document.getElementById('stationFileInput');
        const file = fileInput.files[0];
        const statusElement = document.getElementById('stationUploadStatus');
        
        if (!file) {
            statusElement.textContent = 'Please select a file first.';
            statusElement.style.color = 'red';
            return;
        }
        
        // Check file extension
        const extension = file.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(extension)) {
            statusElement.textContent = 'Invalid file type. Please upload CSV or Excel file.';
            statusElement.style.color = 'red';
            return;
        }
        
        // Show loading message
        statusElement.textContent = 'Uploading and processing file...';
        statusElement.style.color = '#3498db';
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Send file to server
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
            // Check if data was processed successfully
            if (data.success) {
                // Clear existing stations
                clearAllStations();
                
                // Process station data
                stationData = data.data;
                processStationData(stationData);
                
                // Update status
                statusElement.textContent = `Loaded ${stationData.length} station records.`;
                statusElement.style.color = 'green';
                
                // Update coverage calculations
                calculateCoverage();
            } else {
                statusElement.textContent = `Error: ${data.error}`;
                statusElement.style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error uploading stations:', error);
            statusElement.textContent = `Error: ${error.message}`;
            statusElement.style.color = 'red';
            
            // For testing/development - generate mock data locally
            if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                console.log('Generating mock station data for local testing');
                generateMockStationData();
                
                statusElement.textContent = `Generated ${stationMarkers.length} mock stations for testing.`;
                statusElement.style.color = 'green';
                
                // Update coverage calculations
                calculateCoverage();
            }
        });
    }
    
    /**
     * Processes station data and adds markers to the map
     */
    function processStationData(data) {
        // Loop through the station data and add markers
        data.forEach(station => {
            // Check if we have valid coordinates
            if (!station.latitude || !station.longitude) return;
            
            // Get station name
            const stationName = station.name || station.station || `Station ${stationData.indexOf(station) + 1}`;
            
            addStationMarker(
                stationName,
                parseFloat(station.latitude),
                parseFloat(station.longitude)
            );
        });
        
        // Fit map to show all stations
        if (stationMarkers.length > 0) {
            fitMapToMarkers();
        }
        
        // Update table
        updateStationTable();
    }
    
    /**
     * Geocodes an address and updates the latitude and longitude fields
     */
    function geocodeStationAddress() {
        const addressInput = document.getElementById('stationAddress');
        const address = addressInput.value.trim();
        
        if (!address) {
            alert('Please enter an address to geocode.');
            return;
        }
        
        // Show loading state
        const geocodeBtn = document.getElementById('geocodeAddressBtn');
        const originalText = geocodeBtn.innerHTML;
        geocodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Geocoding...';
        geocodeBtn.disabled = true;
        
        // Use direct Nominatim API
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        
        fetch(url, {
            headers: {
                'User-Agent': 'FireEMS.ai Coverage Gap Finder Tool'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Reset button state
            geocodeBtn.innerHTML = originalText;
            geocodeBtn.disabled = false;
            
            if (data && data.length > 0) {
                document.getElementById('stationLat').value = data[0].lat;
                document.getElementById('stationLng').value = data[0].lon;
                console.log("Successfully geocoded address");
            } else {
                alert('Could not find coordinates for this address.');
            }
        })
        .catch(err => {
            // Reset button state
            geocodeBtn.innerHTML = originalText;
            geocodeBtn.disabled = false;
            
            console.error('Geocoding error:', err);
            
            // Try our backend API as fallback
            fetch(`/api/geocode?address=${encodeURIComponent(address)}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.latitude && data.longitude) {
                    // Update the form fields
                    document.getElementById('stationLat').value = data.latitude;
                    document.getElementById('stationLng').value = data.longitude;
                    console.log("Successfully geocoded address via backend API");
                } else {
                    alert(`Could not geocode address: ${data.error || 'Unknown error'}`);
                }
            })
            .catch(error => {
                console.error('Backend geocoding error:', error);
                alert('Geocoding failed. Please enter coordinates manually.');
            });
        });
    }
    
    /**
     * Adds a station marker manually from form inputs
     */
    function addStationManually() {
        const nameInput = document.getElementById('stationName');
        const addressInput = document.getElementById('stationAddress');
        const latInput = document.getElementById('stationLat');
        const lngInput = document.getElementById('stationLng');
        
        const name = nameInput.value.trim();
        const address = addressInput.value.trim();
        const lat = parseFloat(latInput.value);
        const lng = parseFloat(lngInput.value);
        
        // Validate inputs
        if (!name) {
            alert('Please enter a station name.');
            return;
        }
        
        if (isNaN(lat) || isNaN(lng)) {
            alert('Please enter valid latitude and longitude values.');
            return;
        }
        
        // Add the marker
        const stationIndex = addStationMarker(name, lat, lng);
        
        // Store address if provided
        if (address && stationIndex >= 0) {
            stationMarkers[stationIndex].data.address = address;
        }
        
        // Clear the form
        nameInput.value = '';
        addressInput.value = '';
        latInput.value = '';
        lngInput.value = '';
        
        // Update coverage calculations
        calculateCoverage();
        
        // Update table
        updateStationTable();
    }
    
    /**
     * Adds a station marker to the map
     * @param {string} name - Station name
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    function addStationMarker(name, lat, lng) {
        // Create a station object
        const station = {
            name: name,
            latitude: lat,
            longitude: lng,
            coverageArea: 0,
            populationCovered: 0,
            incidentsCovered: 0
        };
        
        // Create a marker for the station
        const marker = L.marker([lat, lng], {
            title: name,
            icon: L.divIcon({
                className: 'station-marker',
                html: `<div style="background-color: ${DEFAULT_STATION_COLOR}; border-radius: 50%; width: 12px; height: 12px;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            })
        }).addTo(map);
        
        // Add popup with station information
        marker.bindPopup(`
            <strong>${name}</strong><br>
            ${station.address ? `Address: ${station.address}<br>` : ''}
            Latitude: ${lat.toFixed(6)}<br>
            Longitude: ${lng.toFixed(6)}
        `);
        
        // Store marker and station data
        stationMarkers.push({
            marker: marker,
            data: station
        });
        
        // Return the index of the added station
        return stationMarkers.length - 1;
    }
    
    /**
     * Clears all existing stations from the map
     */
    function clearAllStations() {
        // Remove all station markers from the map
        stationMarkers.forEach(station => {
            map.removeLayer(station.marker);
        });
        
        // Clear the markers array
        stationMarkers = [];
        
        // Clear all station coverage layers
        stationLayers.forEach(layer => {
            map.removeLayer(layer);
        });
        
        // Clear the layers array
        stationLayers = [];
        
        // Clear suggested stations
        clearSuggestedStations();
        
        // Update station table
        updateStationTable();
    }
    
    /**
     * Clears all suggested station locations
     */
    function clearSuggestedStations() {
        // Remove all suggested station markers from the map
        suggestedStationMarkers.forEach(marker => {
            map.removeLayer(marker);
        });
        
        // Clear the array
        suggestedStationMarkers = [];
        
        // Hide optimization results
        document.getElementById('optimizationResults').style.display = 'none';
    }
    
    /**
     * Updates the station table with current station data
     */
    function updateStationTable() {
        // Clear existing table rows
        stationTableBody.innerHTML = '';
        
        // Add a row for each station
        stationMarkers.forEach((station, index) => {
            const row = document.createElement('tr');
            
            // Format values for display
            const areaFormatted = station.data.coverageArea ? 
                `${station.data.coverageArea.toFixed(2)} sq mi` : 
                'Not calculated';
            
            const populationFormatted = station.data.populationCovered ? 
                station.data.populationCovered.toLocaleString() : 
                'Not calculated';
            
            const incidentsFormatted = station.data.incidentsCovered ? 
                station.data.incidentsCovered.toLocaleString() : 
                'Not calculated';
            
            // Create address tooltip if available
            const addressTooltip = station.data.address ? 
                `title="${station.data.address}"` : 
                '';
            
            // Add address icon if available
            const addressIcon = station.data.address ? 
                `<i class="fas fa-map-marker-alt" title="${station.data.address}"></i> ` : 
                '';
            
            row.innerHTML = `
                <td>${addressIcon}${station.data.name}</td>
                <td>${station.data.latitude.toFixed(6)}</td>
                <td>${station.data.longitude.toFixed(6)}</td>
                <td>${areaFormatted}</td>
                <td>${populationFormatted}</td>
                <td>${incidentsFormatted}</td>
                <td>
                    <button class="action-btn delete-btn" data-index="${index}" title="Delete station">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="action-btn pan-btn" data-index="${index}" title="Center on map">
                        <i class="fas fa-crosshairs"></i>
                    </button>
                </td>
            `;
            
            // Add event listeners for action buttons
            row.querySelector('.delete-btn').addEventListener('click', function() {
                deleteStation(index);
            });
            
            row.querySelector('.pan-btn').addEventListener('click', function() {
                panToStation(index);
            });
            
            stationTableBody.appendChild(row);
        });
    }
    
    /**
     * Deletes a station by index
     * @param {number} index - Index of the station to delete
     */
    function deleteStation(index) {
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete ${stationMarkers[index].data.name}?`)) {
            return;
        }
        
        // Remove the marker from the map
        map.removeLayer(stationMarkers[index].marker);
        
        // Remove the coverage layer if it exists
        if (stationLayers[index]) {
            map.removeLayer(stationLayers[index]);
            stationLayers[index] = null;
        }
        
        // Remove station from array
        stationMarkers.splice(index, 1);
        
        // Realign layers array with markers
        stationLayers = stationLayers.filter((_, i) => i !== index);
        
        // Clear suggested stations
        clearSuggestedStations();
        
        // Update coverage calculations
        calculateCoverage();
        
        // Update table
        updateStationTable();
    }
    
    /**
     * Centers the map on a specific station
     * @param {number} index - Index of the station to pan to
     */
    function panToStation(index) {
        const station = stationMarkers[index];
        map.setView([station.data.latitude, station.data.longitude], 14);
        station.marker.openPopup();
    }
    
    /**
     * Fits the map view to show all station markers
     */
    function fitMapToMarkers() {
        // Create bounds object
        const bounds = L.latLngBounds();
        
        // Add all station markers to bounds
        stationMarkers.forEach(station => {
            bounds.extend([station.data.latitude, station.data.longitude]);
        });
        
        // Add suggested stations if they exist
        suggestedStationMarkers.forEach(marker => {
            bounds.extend(marker.getLatLng());
        });
        
        // Only fit bounds if we have markers
        if (bounds.isValid()) {
            // Fit the map to the bounds with some padding
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 13
            });
        }
    }
    
    /**
     * Calculates the coverage for all stations and updates the map
     */
    function calculateCoverage() {
        // Clear previous coverage layers
        stationLayers.forEach(layer => {
            if (layer) map.removeLayer(layer);
        });
        stationLayers = [];
        
        // If no stations, show message and return
        if (stationMarkers.length === 0) {
            updateCoverageStats('0%', '0%', '0%', '0:00');
            return;
        }
        
        // Get coverage parameters
        const responseTime = parseFloat(document.getElementById('responseTimeTarget').value);
        
        // Get turnout time
        let turnoutTime;
        const turnoutSelect = document.getElementById('turnoutTimeSelect').value;
        if (turnoutSelect === 'custom') {
            turnoutTime = parseFloat(document.getElementById('customTurnout').value);
        } else {
            turnoutTime = parseFloat(turnoutSelect);
        }
        
        // Get travel speed
        let travelSpeed;
        const speedSelect = document.getElementById('travelSpeedSelect').value;
        if (speedSelect === 'custom') {
            travelSpeed = parseFloat(document.getElementById('customSpeed').value);
        } else {
            travelSpeed = TRAVEL_SPEEDS[speedSelect];
        }
        
        // Calculate travel time (response time minus turnout time)
        const travelTime = Math.max(0, responseTime - turnoutTime);
        
        // Calculate coverage radius in meters
        // Formula: radius = travel time (hours) * speed (mph) * meters per mile
        const radiusInMeters = (travelTime / 60) * travelSpeed * METERS_PER_MILE;
        
        // Create coverage circles for each station
        stationMarkers.forEach((station, index) => {
            const lat = station.data.latitude;
            const lng = station.data.longitude;
            
            // Create a circle layer
            const coverageLayer = L.circle([lat, lng], {
                radius: radiusInMeters,
                color: '#3388ff',
                fillColor: COVERAGE_COLOR,
                fillOpacity: 0.5,
                weight: 1
            }).addTo(map);
            
            // Store the layer
            stationLayers[index] = coverageLayer;
            
            // Calculate area covered (πr²) in square miles
            station.data.coverageArea = (Math.PI * Math.pow(radiusInMeters / METERS_PER_MILE, 2)).toFixed(2);
        });
        
        // Update coverage statistics
        updateCoverageCalculations();
    }
    
    /**
     * Updates coverage statistics based on current configuration
     */
    function updateCoverageCalculations() {
        // Placeholder calculations until we have real data
        // These would be calculated based on actual coverage analysis
        
        if (stationMarkers.length === 0) {
            updateCoverageStats('0%', '0%', '0%', '0:00');
            return;
        }
        
        // Calculate total jurisdiction area
        let totalArea = 0;
        let coveredArea = 0;
        
        if (jurisdictionBoundary) {
            // If we have a boundary, calculate its area in square miles
            totalArea = turf.area(jurisdictionBoundary) / (METERS_PER_MILE * METERS_PER_MILE);
            
            // For covered area, we would use turf.js to find the intersection
            // between the boundary and all coverage circles
            // This is a simplified placeholder calculation
            const totalCoverageArea = stationMarkers.reduce((sum, station) => {
                return sum + parseFloat(station.data.coverageArea || 0);
            }, 0);
            
            // Adjust for overlapping coverage (simplified approach)
            coveredArea = Math.min(totalArea, totalCoverageArea * 0.7);
        } else {
            // Without a boundary, use station coverage areas with overlap adjustment
            const totalCoverageArea = stationMarkers.reduce((sum, station) => {
                return sum + parseFloat(station.data.coverageArea || 0);
            }, 0);
            
            // Adjust for overlapping coverage (simplified approach)
            coveredArea = totalCoverageArea * 0.7;
            totalArea = coveredArea * 1.5; // Estimate total area
        }
        
        // Calculate area coverage percentage
        const areaCoveragePercent = totalArea > 0 ? Math.min(100, (coveredArea / totalArea * 100).toFixed(1)) : 0;
        
        // Update population and incident coverage
        updatePopulationCoverage();
        updateIncidentCoverage();
        
        // Calculate estimated average response time (simplified)
        const avgResponseTime = calculateAverageResponseTime();
        
        // Update the display
        updateCoverageStats(
            `${areaCoveragePercent}%`,
            document.getElementById('populationCoverage').textContent,
            document.getElementById('incidentCoverage').textContent,
            avgResponseTime
        );
    }
    
    /**
     * Updates population coverage statistics
     */
    function updatePopulationCoverage() {
        // Placeholder for population coverage calculation
        // In a real implementation, this would:
        // 1. Use census data or uploaded population density data
        // 2. Calculate intersection between coverage areas and population density
        
        // For now, we'll use a simplified estimate
        let populationCoveragePercent = "0%";
        
        if (stationMarkers.length > 0) {
            // Simplified calculation
            populationCoveragePercent = Math.min(95, 70 + Math.floor(stationMarkers.length * 2.5)) + "%";
            
            // Update station population covered values
            stationMarkers.forEach(station => {
                // Placeholder calculation
                station.data.populationCovered = Math.floor(25000 * (parseFloat(station.data.coverageArea) / 50));
            });
        }
        
        // Update the display
        document.getElementById('populationCoverage').textContent = populationCoveragePercent;
    }
    
    /**
     * Updates incident coverage statistics
     */
    function updateIncidentCoverage() {
        // If no incident data or no stations, show 0%
        if (incidentData.length === 0 || stationMarkers.length === 0) {
            document.getElementById('incidentCoverage').textContent = '0%';
            return;
        }
        
        // Get coverage parameters
        const responseTime = parseFloat(document.getElementById('responseTimeTarget').value);
        
        // Get turnout time
        let turnoutTime;
        const turnoutSelect = document.getElementById('turnoutTimeSelect').value;
        if (turnoutSelect === 'custom') {
            turnoutTime = parseFloat(document.getElementById('customTurnout').value);
        } else {
            turnoutTime = parseFloat(turnoutSelect);
        }
        
        // Get travel speed
        let travelSpeed;
        const speedSelect = document.getElementById('travelSpeedSelect').value;
        if (speedSelect === 'custom') {
            travelSpeed = parseFloat(document.getElementById('customSpeed').value);
        } else {
            travelSpeed = TRAVEL_SPEEDS[speedSelect];
        }
        
        // Calculate travel time (response time minus turnout time)
        const travelTime = Math.max(0, responseTime - turnoutTime);
        
        // Calculate coverage radius in miles
        const radiusInMiles = (travelTime / 60) * travelSpeed;
        
        // Count covered incidents
        let coveredIncidents = 0;
        
        // For each incident, check if it's within range of any station
        incidentData.forEach(incident => {
            // Skip if missing coordinates
            if (!incident.latitude || !incident.longitude) return;
            
            const incidentPoint = [parseFloat(incident.longitude), parseFloat(incident.latitude)];
            
            // Check against each station
            for (const station of stationMarkers) {
                const stationPoint = [station.data.longitude, station.data.latitude];
                const distance = turf.distance(
                    turf.point(stationPoint), 
                    turf.point(incidentPoint), 
                    {units: 'miles'}
                );
                
                if (distance <= radiusInMiles) {
                    coveredIncidents++;
                    break; // Count each incident only once
                }
            }
        });
        
        // Calculate coverage percentage
        const coveragePercent = Math.min(100, Math.round((coveredIncidents / incidentData.length) * 100));
        
        // Update station incident covered values
        stationMarkers.forEach(station => {
            let stationCoveredIncidents = 0;
            
            // Count incidents within this station's radius
            incidentData.forEach(incident => {
                // Skip if missing coordinates
                if (!incident.latitude || !incident.longitude) return;
                
                const incidentPoint = [parseFloat(incident.longitude), parseFloat(incident.latitude)];
                const stationPoint = [station.data.longitude, station.data.latitude];
                const distance = turf.distance(
                    turf.point(stationPoint), 
                    turf.point(incidentPoint), 
                    {units: 'miles'}
                );
                
                if (distance <= radiusInMiles) {
                    stationCoveredIncidents++;
                }
            });
            
            station.data.incidentsCovered = stationCoveredIncidents;
        });
        
        // Update the display
        document.getElementById('incidentCoverage').textContent = `${coveragePercent}%`;
    }
    
    /**
     * Calculates an estimated average response time
     * @returns {string} Formatted response time (MM:SS)
     */
    function calculateAverageResponseTime() {
        if (stationMarkers.length === 0) return '0:00';
        
        // Get current parameters
        const turnoutSelect = document.getElementById('turnoutTimeSelect').value;
        const turnoutTime = turnoutSelect === 'custom' ? 
            parseFloat(document.getElementById('customTurnout').value) : 
            parseFloat(turnoutSelect);
            
        // For simplicity, we'll just use the turnout time plus an average travel time
        // In a real implementation, this would use actual incident and station data
        // to calculate more accurate estimates
        
        // Simplified average travel time based on current coverage
        const areaCoverage = parseFloat(document.getElementById('areaCoverage').textContent);
        const avgTravelTime = (10 - Math.min(8, stationMarkers.length * 0.6)) * (100 - areaCoverage) / 100;
        
        // Total response time in minutes
        const totalTime = turnoutTime + avgTravelTime;
        
        // Format as MM:SS
        const minutes = Math.floor(totalTime);
        const seconds = Math.round((totalTime - minutes) * 60);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Updates the coverage statistics display
     * @param {string} area - Area coverage percentage
     * @param {string} population - Population coverage percentage
     * @param {string} incidents - Incident coverage percentage
     * @param {string} time - Average response time (MM:SS)
     */
    function updateCoverageStats(area, population, incidents, time) {
        areaCoverageElement.textContent = area;
        populationCoverageElement.textContent = population;
        incidentCoverageElement.textContent = incidents;
        avgResponseTimeElement.textContent = time;
        
        // Also update station table
        updateStationTable();
    }
    
    /**
     * Loads a boundary from GeoJSON data
     * @param {Object} geoData - GeoJSON data
     */
    function loadBoundaryFromGeoJSON(geoData) {
        // Clear existing boundary
        boundaryLayer.clearLayers();
        
        try {
            // Convert the GeoJSON to a Leaflet layer
            const geoJSONLayer = L.geoJSON(geoData, {
                style: {
                    color: '#3388ff',
                    weight: 3,
                    fillOpacity: 0.1
                }
            });
            
            // Add to boundary layer
            geoJSONLayer.eachLayer(layer => {
                boundaryLayer.addLayer(layer);
            });
            
            // Store boundary data
            jurisdictionBoundary = geoData;
            
            // Fit map to boundary
            map.fitBounds(geoJSONLayer.getBounds(), {
                padding: [50, 50]
            });
            
            // Update coverage calculations
            updateCoverageCalculations();
        } catch (error) {
            console.error('Error loading GeoJSON:', error);
            alert('Error loading boundary. Please check the file format.');
        }
    }
    
    /**
     * Displays population density on the map (if available)
     */
    function showPopulationDensity() {
        // This would normally load real population density data
        // For this demo, we'll just create a placeholder gradient
        
        // Remove existing layer if it exists
        if (populationLayer) {
            map.removeLayer(populationLayer);
        }
        
        // Create a simple population density gradient
        // In a real implementation, this would use actual census or demographic data
        
        // Get current map bounds
        const bounds = map.getBounds();
        const center = bounds.getCenter();
        const radius = bounds.getNorthWest().distanceTo(bounds.getSouthEast()) / 5;
        
        // Create gradient using a series of circles with decreasing opacity
        populationLayer = L.layerGroup().addTo(map);
        
        for (let i = 5; i > 0; i--) {
            L.circle(center, {
                radius: radius * i / 5,
                color: 'purple',
                fillColor: 'purple',
                fillOpacity: 0.1 * (6 - i),
                weight: 0,
                interactive: false
            }).addTo(populationLayer);
        }
    }
    
    /**
     * Hides the population density layer
     */
    function hidePopulationDensity() {
        if (populationLayer) {
            map.removeLayer(populationLayer);
            populationLayer = null;
        }
    }
    
    /**
     * Shows call density heatmap
     */
    function showCallDensity() {
        // Make sure the heatmap library is available
        if (typeof L.heatLayer !== 'function') {
            console.warn('Leaflet.heat plugin not available. Add <script src="https://unpkg.com/leaflet.heat"></script> to use this feature.');
            return;
        }
        
        // Remove existing layer if it exists
        if (heatmapLayer) {
            map.removeLayer(heatmapLayer);
        }
        
        // If no incident data, display warning and return
        if (!incidentData || incidentData.length === 0) {
            console.warn('No incident data available for heatmap.');
            return;
        }
        
        // Extract incident points with intensity
        const points = incidentData
            .filter(incident => incident.latitude && incident.longitude)
            .map(incident => {
                return [
                    parseFloat(incident.latitude),
                    parseFloat(incident.longitude),
                    1 // Base intensity
                ];
            });
        
        // Create heat layer
        heatmapLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {0.4: 'blue', 0.65: 'lime', 0.85: 'yellow', 1.0: 'red'}
        }).addTo(map);
    }
    
    /**
     * Hides call density heatmap
     */
    function hideCallDensity() {
        if (heatmapLayer) {
            map.removeLayer(heatmapLayer);
            heatmapLayer = null;
        }
    }
    
    /**
     * Suggests optimal locations for new stations
     */
    function suggestNewLocations() {
        // Clear previous suggestions
        clearSuggestedStations();
        
        // Get number of stations to suggest
        const stationsToAdd = parseInt(document.getElementById('stationsToAdd').value);
        if (isNaN(stationsToAdd) || stationsToAdd < 1) {
            alert('Please enter a valid number of stations to add.');
            return;
        }
        
        // Get optimization target
        const target = document.getElementById('optimizationTarget').value;
        
        // In a real implementation, this would run a sophisticated algorithm
        // that takes into account:
        // 1. Existing coverage areas
        // 2. Population density
        // 3. Incident density
        // 4. Road network
        // 5. Jurisdiction boundaries
        // 6. Travel times
        
        // For this demo, we'll use a simplified approach to find gaps
        
        // Get coverage parameters
        const responseTime = parseFloat(document.getElementById('responseTimeTarget').value);
        let turnoutTime;
        const turnoutSelect = document.getElementById('turnoutTimeSelect').value;
        if (turnoutSelect === 'custom') {
            turnoutTime = parseFloat(document.getElementById('customTurnout').value);
        } else {
            turnoutTime = parseFloat(turnoutSelect);
        }
        
        let travelSpeed;
        const speedSelect = document.getElementById('travelSpeedSelect').value;
        if (speedSelect === 'custom') {
            travelSpeed = parseFloat(document.getElementById('customSpeed').value);
        } else {
            travelSpeed = TRAVEL_SPEEDS[speedSelect];
        }
        
        // Calculate travel time (response time minus turnout time)
        const travelTime = Math.max(0, responseTime - turnoutTime);
        
        // Calculate coverage radius in meters and miles
        const radiusInMeters = (travelTime / 60) * travelSpeed * METERS_PER_MILE;
        const radiusInMiles = radiusInMeters / METERS_PER_MILE;
        
        // Create a grid of potential station locations
        const suggestedLocations = [];
        
        // Define search area (use jurisdiction boundary or map bounds)
        let searchBounds;
        if (jurisdictionBoundary) {
            const bounds = L.geoJSON(jurisdictionBoundary).getBounds();
            searchBounds = bounds;
        } else {
            searchBounds = map.getBounds();
        }
        
        // Get grid dimensions - make grid finer for better placement
        const gridCellSize = radiusInMeters / 4; // Smaller cells for more precision
        const lngDistance = searchBounds.getEast() - searchBounds.getWest();
        const latDistance = searchBounds.getNorth() - searchBounds.getSouth();
        
        // Convert meters to rough lat/lng differences
        // This is a simplification - in reality, the conversion varies by latitude
        const metersPerLng = 111320 * Math.cos(searchBounds.getCenter().lat * Math.PI / 180);
        const metersPerLat = 110540;
        
        const lngStep = gridCellSize / metersPerLng;
        const latStep = gridCellSize / metersPerLat;
        
        const lngSteps = Math.floor(lngDistance / lngStep);
        const latSteps = Math.floor(latDistance / latStep);
        
        console.log(`Creating grid with ${latSteps}x${lngSteps} cells for optimization`);
        
        // Find uncovered incidents first for efficiency
        const uncoveredIncidents = [];
        if (incidentData.length > 0) {
            incidentData.forEach((incident, idx) => {
                // Skip if missing coordinates
                if (!incident.latitude || !incident.longitude) return;
                
                const incidentPoint = [parseFloat(incident.longitude), parseFloat(incident.latitude)];
                
                // Check if this incident is already covered by existing stations
                let alreadyCovered = false;
                for (const station of stationMarkers) {
                    const stationPoint = [station.data.longitude, station.data.latitude];
                    const distanceToStation = turf.distance(
                        turf.point(stationPoint), 
                        turf.point(incidentPoint), 
                        {units: 'miles'}
                    );
                    
                    if (distanceToStation <= radiusInMiles) {
                        alreadyCovered = true;
                        break;
                    }
                }
                
                if (!alreadyCovered) {
                    uncoveredIncidents.push({
                        index: idx,
                        longitude: parseFloat(incident.longitude),
                        latitude: parseFloat(incident.latitude),
                        point: incidentPoint
                    });
                }
            });
            
            console.log(`Found ${uncoveredIncidents.length} uncovered incidents out of ${incidentData.length} total`);
        }
        
        // If we have a lot of uncovered incidents, center our search on them
        if (uncoveredIncidents.length > 20) {
            // Focus the search on areas with uncovered incidents
            const incidentBounds = L.latLngBounds();
            
            // Add all uncovered incident locations to bounds
            uncoveredIncidents.forEach(incident => {
                incidentBounds.extend([incident.latitude, incident.longitude]);
            });
            
            // Expand bounds slightly
            const expandedBounds = incidentBounds.pad(0.2);
            
            // Use this as our search area if it's valid
            if (expandedBounds.isValid()) {
                searchBounds = expandedBounds;
                console.log("Using incident-focused search bounds");
            }
        }
        
        // For each grid cell, calculate a score
        for (let i = 0; i < latSteps; i++) {
            for (let j = 0; j < lngSteps; j++) {
                const lat = searchBounds.getSouth() + (i * latStep) + (latStep / 2);
                const lng = searchBounds.getWest() + (j * lngStep) + (lngStep / 2);
                
                // Skip if point is outside jurisdiction boundary
                if (jurisdictionBoundary) {
                    const point = turf.point([lng, lat]);
                    if (!turf.booleanPointInPolygon(point, jurisdictionBoundary)) {
                        continue;
                    }
                }
                
                // Check if point is already covered by existing stations
                let covered = false;
                for (const station of stationMarkers) {
                    const distance = turf.distance(
                        turf.point([lng, lat]),
                        turf.point([station.data.longitude, station.data.latitude]),
                        {units: 'miles'}
                    );
                    
                    if (distance < radiusInMiles) {
                        covered = true;
                        break;
                    }
                }
                
                // Skip if already covered
                if (covered) continue;
                
                // Calculate scores based on different criteria
                let populationScore = 0;
                let incidentScore = 0;
                let areaScore = 0;
                
                // Area score - simplified approach
                // Higher score for uncovered areas
                areaScore = 1;
                
                // Population score - in a real implementation, 
                // would use actual population density data
                // For now, give higher scores to locations closer to center
                const distanceToCenter = turf.distance(
                    turf.point([lng, lat]),
                    turf.point([searchBounds.getCenter().lng, searchBounds.getCenter().lat]),
                    {units: 'miles'}
                );
                const maxDistance = Math.max(lngDistance, latDistance) * 69 / 2; // rough miles conversion
                populationScore = 1 - (distanceToCenter / maxDistance);
                
                // If we have incidents, prioritize locations near uncovered incidents
                if (uncoveredIncidents.length > 0) {
                    const locationPoint = turf.point([lng, lat]);
                    let totalWeight = 0;
                    let coveredIncidents = 0;
                    
                    uncoveredIncidents.forEach(incident => {
                        const distance = turf.distance(
                            locationPoint, 
                            turf.point(incident.point), 
                            {units: 'miles'}
                        );
                        
                        // Check if this location would cover this incident
                        if (distance <= radiusInMiles) {
                            // Weight by inverse distance - closer incidents get higher weight
                            const weight = 1 - (distance / radiusInMiles);
                            totalWeight += weight;
                            coveredIncidents++;
                        }
                    });
                    
                    // Score based on number of incidents covered and their proximity
                    if (coveredIncidents > 0) {
                        // Average weight times percentage of total uncovered incidents
                        incidentScore = (totalWeight / coveredIncidents) * 
                                        (coveredIncidents / uncoveredIncidents.length);
                        
                        // Boost score if covering many incidents
                        if (coveredIncidents > uncoveredIncidents.length * 0.2) {
                            incidentScore *= 1.5;
                        }
                    }
                }
                
                // Calculate combined score based on target
                let score;
                switch (target) {
                    case 'population':
                        score = populationScore * 0.8 + incidentScore * 0.1 + areaScore * 0.1;
                        break;
                    case 'area':
                        score = areaScore * 0.8 + populationScore * 0.1 + incidentScore * 0.1;
                        break;
                    case 'incidents':
                        score = incidentScore * 0.8 + populationScore * 0.1 + areaScore * 0.1;
                        break;
                    case 'balanced':
                    default:
                        score = populationScore * 0.4 + incidentScore * 0.4 + areaScore * 0.2;
                }
                
                // Skip locations with very low scores
                if (score < 0.1) continue;
                
                // Add to potential locations
                suggestedLocations.push({
                    lat: lat,
                    lng: lng,
                    score: score,
                    populationScore: populationScore,
                    incidentScore: incidentScore,
                    areaScore: areaScore
                });
            }
        }
        
        // Sort locations by score (highest first)
        suggestedLocations.sort((a, b) => b.score - a.score);
        
        // Take the top N locations
        const topLocations = suggestedLocations.slice(0, stationsToAdd);
        
        // Add markers for suggested locations
        topLocations.forEach((location, index) => {
            const marker = L.marker([location.lat, location.lng], {
                title: `Suggested Station ${index + 1}`,
                icon: L.divIcon({
                    className: 'suggested-station-marker',
                    html: `<div style="background-color: ${SUGGESTED_STATION_COLOR}; border-radius: 50%; width: 12px; height: 12px;"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                }),
                draggable: true // Allow dragging for adjustment
            }).addTo(map);
            
            // Add popup with information
            marker.bindPopup(`
                <strong>Suggested Station ${index + 1}</strong><br>
                Latitude: ${location.lat.toFixed(6)}<br>
                Longitude: ${location.lng.toFixed(6)}<br>
                <hr>
                <strong>Coverage Score:</strong> ${Math.round(location.score * 100)}%<br>
                Population Impact: ${Math.round(location.populationScore * 100)}%<br>
                Incident Coverage: ${Math.round(location.incidentScore * 100)}%<br>
                Area Coverage: ${Math.round(location.areaScore * 100)}%
            `);
            
            // Add coverage circle
            const circle = L.circle([location.lat, location.lng], {
                radius: radiusInMeters,
                color: '#FFA500',
                fillColor: 'rgba(255, 165, 0, 0.3)',
                fillOpacity: 0.3,
                weight: 1,
                dashArray: '5,5'
            }).addTo(map);
            
            // Store marker and circle
            suggestedStationMarkers.push(marker);
            suggestedStationMarkers.push(circle);
        });
        
        // Show results metrics
        const optimizationResults = document.getElementById('optimizationResults');
        const metricsList = document.getElementById('optimizationMetrics');
        
        // Calculate estimated improvements
        const currentAreaCoverage = parseFloat(document.getElementById('areaCoverage').textContent);
        const currentPopulationCoverage = parseFloat(document.getElementById('populationCoverage').textContent);
        const currentIncidentCoverage = parseFloat(document.getElementById('incidentCoverage').textContent);
        
        // Estimate new coverages (simplified)
        const newAreaCoverage = Math.min(100, currentAreaCoverage + (stationsToAdd * 7)).toFixed(1);
        const newPopulationCoverage = Math.min(100, currentPopulationCoverage + (stationsToAdd * 5)).toFixed(1);
        const newIncidentCoverage = Math.min(100, currentIncidentCoverage + (stationsToAdd * 8)).toFixed(1);
        
        metricsList.innerHTML = `
            <p><strong>Suggested New Stations:</strong> ${stationsToAdd}</p>
            <p><strong>Estimated Coverage Improvements:</strong></p>
            <p>Area Coverage: ${currentAreaCoverage}% → ${newAreaCoverage}%</p>
            <p>Population Coverage: ${currentPopulationCoverage}% → ${newPopulationCoverage}%</p>
            <p>Incident Coverage: ${currentIncidentCoverage}% → ${newIncidentCoverage}%</p>
        `;
        
        optimizationResults.style.display = 'block';
        
        // Fit map to include all existing and suggested stations
        fitMapToMarkers();
    }
    
    /**
     * Applies the optimization suggestions by adding suggested stations
     */
    function applyOptimizationSuggestions() {
        // For each suggested station, add a permanent station marker
        suggestedStationMarkers.forEach((marker, index) => {
            // Only process markers, not circles (every other item)
            if (index % 2 === 0) {
                const latlng = marker.getLatLng();
                const name = `Station ${stationMarkers.length + (index / 2) + 1}`;
                
                // Add a permanent station marker
                addStationMarker(name, latlng.lat, latlng.lng);
            }
        });
        
        // Clear suggested stations
        clearSuggestedStations();
        
        // Recalculate coverage
        calculateCoverage();
        
        // Update station table
        updateStationTable();
    }
    
    /**
     * Exports the current map view as a PDF
     */
    function exportAsPDF() {
        // Show loading message
        alert('Preparing PDF export... This may take a moment.');
        
        // Force map to update
        map.invalidateSize();
        
        try {
            // Create a new jsPDF instance
            const pdf = new jspdf.jsPDF('landscape');
            
            // Add title
            pdf.setFontSize(18);
            pdf.text('Fire/EMS Coverage Analysis', 14, 15);
            
            // Add timestamp
            pdf.setFontSize(10);
            pdf.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);
            
            // Add coverage statistics
            pdf.setFontSize(12);
            pdf.text('Coverage Statistics:', 14, 30);
            pdf.text(`Area Coverage: ${document.getElementById('areaCoverage').textContent}`, 14, 36);
            pdf.text(`Population Coverage: ${document.getElementById('populationCoverage').textContent}`, 14, 42);
            pdf.text(`Incident Coverage: ${document.getElementById('incidentCoverage').textContent}`, 14, 48);
            pdf.text(`Average Response Time: ${document.getElementById('avgResponseTime').textContent}`, 14, 54);
            
            // Create a data URL of the map by using Leaflet's built-in methods
            const mapImageURL = createMapImageURL();
            
            // Add map image if available, otherwise add placeholder text
            if (mapImageURL) {
                // Calculate dimensions to fit the PDF
                const imgWidth = 260;
                const imgHeight = 150;
                pdf.addImage(mapImageURL, 'PNG', 15, 65, imgWidth, imgHeight);
            } else {
                pdf.text('Map image could not be generated. Please use the Export Image option separately.', 15, 100);
            }
            
            // Add station information
            pdf.addPage();
            pdf.setFontSize(16);
            pdf.text('Station Information', 14, 15);
            
            // Add station table
            pdf.setFontSize(10);
            let y = 25;
            pdf.text('Name', 14, y);
            pdf.text('Latitude', 50, y);
            pdf.text('Longitude', 90, y);
            pdf.text('Coverage Area', 130, y);
            pdf.text('Population', 170, y);
            pdf.text('Incidents', 210, y);
            
            y += 2;
            pdf.line(14, y, 280, y);
            y += 5;
            
            stationMarkers.forEach(station => {
                const stationName = station.data.name.length > 15 ? 
                    station.data.name.substring(0, 12) + '...' : 
                    station.data.name;
                
                pdf.text(stationName, 14, y);
                pdf.text(station.data.latitude.toFixed(6), 50, y);
                pdf.text(station.data.longitude.toFixed(6), 90, y);
                pdf.text(station.data.coverageArea ? `${station.data.coverageArea} sq mi` : 'N/A', 130, y);
                pdf.text(station.data.populationCovered ? station.data.populationCovered.toString() : 'N/A', 170, y);
                pdf.text(station.data.incidentsCovered ? station.data.incidentsCovered.toString() : 'N/A', 210, y);
                y += 7;
                
                // Add page if running out of space
                if (y > 180) {
                    pdf.addPage();
                    y = 15;
                }
            });
            
            // Save the PDF
            pdf.save('coverage-analysis.pdf');
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Error generating PDF. Please try again or use the Export Data option.");
        }
    }
    
    /**
     * Helper function to create a data URL of the current map
     * @returns {string} Data URL of map image or null if failed
     */
    function createMapImageURL() {
        try {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            const size = map.getSize();
            canvas.width = size.x;
            canvas.height = size.y;
            
            // Use Leaflet's built-in methods to render the map to canvas
            map.render();
            
            // Try to get a screenshot using map._container
            if (map._container) {
                // Draw base map layer
                const mapContainer = map._container;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(mapContainer, 0, 0);
                
                // Return data URL
                return canvas.toDataURL('image/png');
            }
            
            return null;
        } catch (err) {
            console.error("Error creating map image:", err);
            return null;
        }
    }
    
    /**
     * Exports the current map view as an image
     */
    function exportAsImage() {
        // Show loading message
        alert('Preparing image export... This may take a moment.');
        
        try {
            // Create download link for the current map view
            const mapImageURL = createMapImageURL();
            
            if (mapImageURL) {
                // Create and trigger download
                const link = document.createElement('a');
                link.download = 'coverage-map.png';
                link.href = mapImageURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // Manual approach - take a screenshot of the viewport area
                const mapElement = document.getElementById('coverageMap');
                
                // Use HTML2Canvas with more options
                html2canvas(mapElement, {
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    foreignObjectRendering: true
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'coverage-map.png';
                    link.href = canvas.toDataURL('image/png');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }).catch(err => {
                    console.error("Error generating image:", err);
                    alert("Error generating image. Please use browser's screenshot feature instead.");
                });
            }
        } catch (err) {
            console.error("Error in exportAsImage:", err);
            alert("Error generating image. Please use browser's screenshot feature instead.");
        }
    }
    
    /**
     * Exports the station data as CSV
     */
    function exportData() {
        // Prepare CSV content
        let csv = 'Name,Latitude,Longitude,Coverage Area (sq mi),Population Covered,Incidents Covered\n';
        
        stationMarkers.forEach(station => {
            csv += `"${station.data.name}",` +
                `${station.data.latitude.toFixed(6)},` +
                `${station.data.longitude.toFixed(6)},` +
                `${station.data.coverageArea || ''},` +
                `${station.data.populationCovered || ''},` +
                `${station.data.incidentsCovered || ''}\n`;
        });
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'station-data.csv');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    /**
     * Generates mock incident data for local testing
     */
    function generateMockIncidentData() {
        // Get map bounds
        const bounds = map.getBounds();
        const south = bounds.getSouth();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const east = bounds.getEast();
        
        const latRange = north - south;
        const lngRange = east - west;
        
        // Generate 500 random incidents within the bounds
        incidentData = [];
        
        for (let i = 0; i < 500; i++) {
            // Random coordinates within bounds
            const lat = south + (Math.random() * latRange);
            const lng = west + (Math.random() * lngRange);
            
            // Create a mock incident
            incidentData.push({
                id: `INC-${i.toString().padStart(5, '0')}`,
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
                // Add more incident data as needed
                timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                type: ['EMS', 'Fire', 'Hazmat', 'Rescue', 'Service'][Math.floor(Math.random() * 5)]
            });
        }
    }
    
    /**
     * Generates mock station data for local testing
     */
    function generateMockStationData() {
        // Clear existing stations
        clearAllStations();
        
        // Generate 5 sample stations
        const sampleStations = [
            { name: 'Station 1', lat: 33.4484, lng: -112.0740 },
            { name: 'Station 2', lat: 33.4956, lng: -112.0737 },
            { name: 'Station 3', lat: 33.4512, lng: -112.1242 },
            { name: 'Station 4', lat: 33.3874, lng: -112.0623 },
            { name: 'Station 5', lat: 33.4854, lng: -112.0245 }
        ];
        
        // Add stations to map
        sampleStations.forEach(station => {
            addStationMarker(station.name, station.lat, station.lng);
        });
        
        // Fit map to stations
        fitMapToMarkers();
    }
})();