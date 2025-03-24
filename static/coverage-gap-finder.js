/**
 * Coverage Gap Finder JavaScript
 * 
 * This script handles the interactive mapping and analysis tools for identifying
 * underserved areas in emergency response coverage.
 */

// Global variables (for better access from debugging and in direct initialization)
var map; // Leaflet map instance
var drawControl; // Leaflet draw control
var boundaryLayer; // Jurisdiction boundary layer
var stationMarkers = []; // Array of station markers
var stationLayers = []; // Array of station coverage layers
var suggestedStationMarkers = []; // Array of suggested new station markers
var heatmapLayer; // For incident density heatmap
var incidentData = []; // Stored incident data
var stationData = []; // Stored station data
var jurisdictionBoundary; // GeoJSON of jurisdiction boundary
var populationLayer; // Population density layer

// Wrap most functionality in an IIFE to organize the code but expose key functions
(function() {
    
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
     * Note: This may be called directly from the HTML page
     */
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Coverage Gap Finder initialized via auto-load');
        // The initialization is now handled in the HTML to ensure proper loading order
        // initializeMap();
        // setupEventListeners();
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
            console.log(`Call density toggle changed. Checked: ${this.checked}, Incident data length: ${incidentData ? incidentData.length : 0}`);
            if (this.checked) {
                if (incidentData && incidentData.length > 0) {
                    showCallDensity();
                } else {
                    console.warn("No incident data available to display. Please upload incident data first.");
                    alert("No incident data available to display. Please upload incident data first.");
                    // Revert toggle if no data
                    this.checked = false;
                }
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
            document.getElementById('turnoutTimeSelect').value = standard.turnoutTime.toString();
            document.getElementById('customTurnoutGroup').style.display = 'none';
            
            // Update travel speed select - find closest match
            let closestSpeed = 'urban-med'; // Default
            let minDiff = Number.MAX_VALUE;
            
            for (const [key, value] of Object.entries(TRAVEL_SPEEDS)) {
                const diff = Math.abs(value - standard.travelSpeed);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestSpeed = key;
                }
            }
            
            document.getElementById('travelSpeedSelect').value = closestSpeed;
            document.getElementById('customSpeedGroup').style.display = 'none';
        }
    }
    
    /**
     * Uploads and processes incident data from a file
     */
    function uploadIncidentData() {
        const fileInput = document.getElementById('incidentFileInput');
        const statusElement = document.getElementById('incidentUploadStatus');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            statusElement.innerHTML = 'Please select a file first.';
            statusElement.className = 'upload-status error';
            return;
        }
        
        const file = fileInput.files[0];
        console.log(`Processing incident file: ${file.name} (${file.size} bytes)`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Show loading state
        statusElement.innerHTML = 'Uploading and processing file...';
        statusElement.className = 'upload-status loading';
        
        // Send to server for processing
        fetch('/api/incident-data', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log(`Incident upload response status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`Incident data processed, success: ${data.success}, count: ${data.data ? data.data.length : 0}`);
            
            if (data.success) {
                statusElement.innerHTML = `Successfully processed ${data.data.length} incidents.`;
                statusElement.className = 'upload-status success';
                
                // Store the incident data
                incidentData = data.data;
                
                // Log a sample of the data for debugging
                console.log(`Sample incident data (first 2 records):`, 
                    data.data.slice(0, 2));
                
                // Check if we have valid coordinates in the imported data
                const validCoords = data.data.filter(item => 
                    item.latitude && item.longitude && 
                    !isNaN(parseFloat(item.latitude)) && 
                    !isNaN(parseFloat(item.longitude))
                );
                
                console.log(`Incidents with valid coordinates: ${validCoords.length} out of ${data.data.length}`);
                
                // If no valid coordinates found, show a warning alert
                if (validCoords.length === 0) {
                    alert(`WARNING: None of the ${data.data.length} incidents have valid coordinates. Please check your data format.`);
                    statusElement.innerHTML += ` <strong style="color:red;">No valid coordinates found!</strong>`;
                }
                
                // Auto-enable the call density toggle if we have valid data
                if (validCoords.length > 0) {
                    const callDensityToggle = document.getElementById('callDensityToggle');
                    if (!callDensityToggle.checked) {
                        console.log('Auto-enabling call density toggle');
                        callDensityToggle.checked = true;
                    }
                    
                    // Create a direct reference for debugging
                    console.log("Creating direct point array for debugging");
                    const directPoints = [];
                    
                    validCoords.forEach(incident => {
                        const lat = parseFloat(incident.latitude);
                        const lng = parseFloat(incident.longitude);
                        let intensity = 1;
                        
                        // If the incident has a custom intensity, use it
                        if (incident.intensity) {
                            intensity = parseFloat(incident.intensity);
                            if (isNaN(intensity)) intensity = 1;
                        }
                        
                        directPoints.push([lat, lng, intensity]);
                    });
                    
                    console.log(`Created ${directPoints.length} direct points for heatmap`);
                    
                    // Create a direct visualization of the points
                    console.log("Creating direct visualization of incident points");
                    
                    // First try to use the heatmap
                    try {
                        console.log("Attempting to create heatmap layer directly");
                        if (typeof L.heatLayer === 'function' && directPoints.length > 0 && map) {
                            // Remove existing layer if any
                            if (heatmapLayer) {
                                try {
                                    map.removeLayer(heatmapLayer);
                                } catch (e) {
                                    console.warn("Error removing existing layer:", e);
                                }
                                heatmapLayer = null;
                            }
                            
                            // Force map invalidation to ensure proper state
                            map.invalidateSize();
                            
                            // Sample the points if there are too many
                            let testPoints = directPoints;
                            if (directPoints.length > 2000) {
                                testPoints = directPoints.slice(0, 2000);
                                console.log(`Using a sample of ${testPoints.length} points out of ${directPoints.length}`);
                            }
                            
                            // Create the heatmap layer
                            heatmapLayer = L.heatLayer(testPoints, {
                                radius: 25,
                                blur: 15,
                                maxZoom: 17,
                                max: 10, // Adjust this based on intensity distribution
                                gradient: {0.4: 'blue', 0.65: 'lime', 0.85: 'yellow', 1.0: 'red'}
                            });
                            
                            // Add to map
                            heatmapLayer.addTo(map);
                            console.log("Heatmap layer added directly");
                            
                            // Force map update
                            setTimeout(() => {
                                map.invalidateSize();
                                map.panBy([1, 1]); // Tiny pan to force redraw
                                
                                // Update status
                                statusElement.innerHTML += ' <span style="color:green;">(Heatmap displayed)</span>';
                            }, 200);
                        } else {
                            throw new Error("Heatmap functionality not available");
                        }
                    } catch (err) {
                        console.error("Error creating direct heatmap:", err);
                        
                        // If heatmap fails, use our fallback emergency points renderer
                        try {
                            console.log("Falling back to emergency points display");
                            if (typeof window.displayEmergencyPoints === 'function') {
                                // Remove existing layer
                                if (heatmapLayer) {
                                    try {
                                        map.removeLayer(heatmapLayer);
                                    } catch (e) {
                                        console.warn("Error removing existing layer:", e);
                                    }
                                }
                                
                                // Use the fallback function to display emergency points
                                heatmapLayer = window.displayEmergencyPoints(map, directPoints, 1000);
                                
                                // Update status
                                statusElement.innerHTML += ' <span style="color:orange;">(Fallback mode: showing individual points)</span>';
                                
                                console.log("Used fallback emergency points display");
                            } else {
                                console.error("Emergency points fallback not available");
                                alert("Could not display incidents. Please check browser console for errors.");
                            }
                        } catch (fallbackErr) {
                            console.error("Error with fallback display:", fallbackErr);
                        }
                    }
                }
                
                // Update incident coverage calculations if we have stations
                if (stationMarkers.length > 0) {
                    console.log(`Updating coverage calculations with ${stationMarkers.length} stations`);
                    updateCoverageCalculations();
                }
                
                // Show incidents on map if the toggle is checked or we just enabled it
                const callDensityToggle = document.getElementById('callDensityToggle');
                if (callDensityToggle.checked) {
                    console.log('Call density toggle is checked, showing heatmap');
                    setTimeout(() => {
                        // Attempt to show call density with 3 retries
                        const retryShowCallDensity = (retries = 3) => {
                            showCallDensity();
                            
                            // If no heatmap layer was created and we have retries left
                            if (!heatmapLayer && retries > 0) {
                                console.log(`Retrying showCallDensity (${retries} attempts left)`);
                                setTimeout(() => retryShowCallDensity(retries - 1), 300);
                            } else {
                                // Force map invalidation to ensure heatmap displays
                                if (map) {
                                    console.log('Forcing map invalidation');
                                    map.invalidateSize();
                                }
                            }
                        };
                        
                        retryShowCallDensity();
                    }, 200); // Short delay to ensure DOM is ready
                } else {
                    console.log('Call density toggle is not checked, skipping heatmap');
                }
                
                // Verify map is visible
                if (map) {
                    console.log('Map is available, refreshing view');
                    map.invalidateSize();
                } else {
                    console.error('Map is not initialized!');
                }
                
            } else {
                console.error(`Error from server:`, data.error);
                statusElement.innerHTML = `Error: ${data.error}`;
                statusElement.className = 'upload-status error';
            }
        })
        .catch(error => {
            console.error('Error uploading incident data:', error);
            statusElement.innerHTML = 'Error uploading file. Please try again.';
            statusElement.className = 'upload-status error';
        });
    }
    
    /**
     * Uploads and processes station data from a file
     */
    function uploadStationData() {
        const fileInput = document.getElementById('stationFileInput');
        const statusElement = document.getElementById('stationUploadStatus');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            statusElement.innerHTML = 'Please select a file first.';
            statusElement.className = 'upload-status error';
            return;
        }
        
        const file = fileInput.files[0];
        console.log(`Processing station file: ${file.name} (${file.size} bytes)`);
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Show loading state
        statusElement.innerHTML = 'Uploading and processing file...';
        statusElement.className = 'upload-status loading';
        
        // Clear existing stations
        console.log('Clearing existing stations...');
        clearAllStations();
        
        // Send to server for processing
        fetch('/api/station-data', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log(`Station upload response status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`Station data processed, success: ${data.success}, count: ${data.data ? data.data.length : 0}`);
            
            if (data.success) {
                statusElement.innerHTML = `Successfully processed ${data.data.length} stations.`;
                statusElement.className = 'upload-status success';
                
                // Store the station data
                stationData = data.data;
                
                // Log a sample of the data for debugging
                console.log(`Sample station data (first 2 records):`, 
                    data.data.slice(0, 2));
                
                // Check for valid coordinates
                const validStations = data.data.filter(station => 
                    station.latitude && station.longitude && 
                    !isNaN(parseFloat(station.latitude)) && 
                    !isNaN(parseFloat(station.longitude))
                );
                
                console.log(`Stations with valid coordinates: ${validStations.length} out of ${data.data.length}`);
                
                if (validStations.length === 0) {
                    statusElement.innerHTML = 'No valid station coordinates found in file.';
                    statusElement.className = 'upload-status error';
                    return;
                }
                
                // Add stations to map one by one with better error handling
                let successCount = 0;
                let errorCount = 0;
                
                validStations.forEach(station => {
                    try {
                        // Get or generate station name
                        let stationName = station.name || station.station || `Station ${stationMarkers.length + 1}`;
                        
                        // Parse coordinates carefully
                        const lat = parseFloat(station.latitude);
                        const lng = parseFloat(station.longitude);
                        
                        if (isNaN(lat) || isNaN(lng)) {
                            console.warn(`Invalid coordinates for station ${stationName}: ${station.latitude}, ${station.longitude}`);
                            errorCount++;
                            return;
                        }
                        
                        console.log(`Adding station to map: ${stationName} at ${lat}, ${lng}`);
                        
                        // Add to map
                        const marker = addStationMarker(stationName, lat, lng);
                        if (marker) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    } catch (err) {
                        console.error(`Error adding station:`, err);
                        errorCount++;
                    }
                });
                
                console.log(`Station addition complete: ${successCount} added, ${errorCount} errors`);
                
                if (successCount > 0) {
                    // Update status message with detailed info
                    statusElement.innerHTML = `Processed ${data.data.length} stations: ${successCount} added to map, ${errorCount} errors.`;
                    
                    // Update coverage calculations
                    console.log('Updating coverage calculations...');
                    updateCoverageCalculations();
                    
                    // Fit map to markers
                    console.log('Fitting map to markers...');
                    fitMapToMarkers();
                    
                    // Force map update
                    if (map) {
                        map.invalidateSize();
                    }
                } else {
                    statusElement.innerHTML = 'Failed to add any stations to map. Check console for errors.';
                    statusElement.className = 'upload-status error';
                }
            } else {
                console.error(`Error from server:`, data.error);
                statusElement.innerHTML = `Error: ${data.error}`;
                statusElement.className = 'upload-status error';
            }
        })
        .catch(error => {
            console.error('Error uploading station data:', error);
            statusElement.innerHTML = 'Error uploading file. Please try again.';
            statusElement.className = 'upload-status error';
        });
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
        
        // Add a timestamp to avoid caching issues
        const timestamp = new Date().getTime();
        const requestUrl = `/api/geocode?address=${encodeURIComponent(address)}&t=${timestamp}`;
        
        // Use backend API directly to avoid CORS issues
        fetch(requestUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        })
        .then(response => {
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`Server returned status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Reset button state
            geocodeBtn.innerHTML = originalText;
            geocodeBtn.disabled = false;
            
            if (data.success && data.latitude && data.longitude) {
                // Update form fields
                document.getElementById('stationLat').value = data.latitude;
                document.getElementById('stationLng').value = data.longitude;
                console.log("Successfully geocoded address via backend");
                
                // Center map on the geocoded location
                if (map) {
                    map.setView([data.latitude, data.longitude], 14);
                    
                    // Add a temporary marker at the location
                    const tempMarker = L.marker([data.latitude, data.longitude], {
                        opacity: 0.7
                    }).addTo(map);
                    
                    // Add a popup with the address
                    tempMarker.bindPopup(`
                        <strong>Geocoded Location</strong><br>
                        ${data.address || address}<br>
                        <small>${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}</small>
                    `).openPopup();
                    
                    // Remove marker after 5 seconds
                    setTimeout(() => {
                        if (map.hasLayer(tempMarker)) {
                            map.removeLayer(tempMarker);
                        }
                    }, 5000);
                }
            } else {
                alert('Could not find coordinates for this address. Please try a different address or format.');
                console.error('Geocoding error:', data.error || 'Unknown error');
            }
        })
        .catch(err => {
            // Reset button state
            geocodeBtn.innerHTML = originalText;
            geocodeBtn.disabled = false;
            
            console.error('Geocoding error:', err);
            alert('Error geocoding address. Please check your internet connection and try again.');
            
            // Try to log more details about the error
            console.log("Geocoding request failed for URL:", requestUrl);
            console.log("Error details:", err.message || err);
        });
    }
    
    /**
     * Adds a station marker manually from form inputs
     */
    function addStationManually() {
        const stationName = document.getElementById('stationName').value.trim();
        const latitude = parseFloat(document.getElementById('stationLat').value);
        const longitude = parseFloat(document.getElementById('stationLng').value);
        
        if (!stationName) {
            alert('Please enter a station name.');
            return;
        }
        
        if (isNaN(latitude) || isNaN(longitude)) {
            alert('Please enter valid coordinates or use the geocoder.');
            return;
        }
        
        // Add station marker
        addStationMarker(stationName, latitude, longitude);
        
        // Clear form fields
        document.getElementById('stationName').value = '';
        document.getElementById('stationAddress').value = '';
        document.getElementById('stationLat').value = '';
        document.getElementById('stationLng').value = '';
        
        // Update coverage calculations
        updateCoverageCalculations();
    }
    
    /**
     * Adds a station marker to the map
     * @param {string} name - Station name
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    function addStationMarker(name, lat, lng) {
        console.log(`Adding station marker: ${name} at ${lat}, ${lng}`);
        
        // Verify map is initialized
        if (!map) {
            console.error("Map is not initialized. Cannot add marker.");
            alert("Error: Map is not initialized. Please refresh the page.");
            return;
        }
        
        try {
            // Create a marker for the station with a simpler icon first
            const marker = L.marker([lat, lng], {
                title: name,
                draggable: true // Allow stations to be repositioned
            });
            
            // Create the custom icon
            const customIcon = L.divIcon({
                html: `<div class="marker-pin station-marker">${stationMarkers.length + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                className: 'station-div-icon'
            });
            
            // Set the icon
            marker.setIcon(customIcon);
            
            // Add to map
            marker.addTo(map);
            
            // Store station data
            marker.data = {
                name: name,
                latitude: lat,
                longitude: lng,
                coverageArea: null,
                populationCovered: null,
                incidentsCovered: null
            };
            
            // Add popup with station info
            marker.bindPopup(`
                <h3>${name}</h3>
                <p>Latitude: ${lat.toFixed(6)}</p>
                <p>Longitude: ${lng.toFixed(6)}</p>
                <button class="delete-station-btn" data-index="${stationMarkers.length}">Delete Station</button>
            `);
            
            // Handle marker drag end to update coverage
            marker.on('dragend', function() {
                const newLatLng = marker.getLatLng();
                marker.data.latitude = newLatLng.lat;
                marker.data.longitude = newLatLng.lng;
                
                // Update the station's coverage layer
                updateStationCoverage(stationMarkers.indexOf(marker));
                
                // Update the popup content
                marker.setPopupContent(`
                    <h3>${marker.data.name}</h3>
                    <p>Latitude: ${newLatLng.lat.toFixed(6)}</p>
                    <p>Longitude: ${newLatLng.lng.toFixed(6)}</p>
                    <button class="delete-station-btn" data-index="${stationMarkers.indexOf(marker)}">Delete Station</button>
                `);
                
                // Update coverage calculations
                updateCoverageCalculations();
                
                // Update station table
                updateStationTable();
            });
            
            // Add the marker to our array
            stationMarkers.push(marker);
            
            // Create a coverage layer for the station
            const coverageLayer = L.circle([lat, lng], {
                color: DEFAULT_STATION_COLOR,
                fillColor: COVERAGE_COLOR,
                fillOpacity: 0.25,
                radius: 0, // Will be updated later
                weight: 1
            }).addTo(map);
            
            // Store the coverage layer
            stationLayers.push(coverageLayer);
            
            // Update the coverage layer with current settings
            updateStationCoverage(stationMarkers.length - 1);
            
            // Update the station table
            updateStationTable();
            
            // Add event listener to the delete button (for when popup is opened)
            map.on('popupopen', function(e) {
                const deleteBtn = document.querySelector('.delete-station-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', function() {
                        const index = parseInt(deleteBtn.getAttribute('data-index'));
                        deleteStation(index);
                    });
                }
            });
            
            console.log(`Station marker added successfully: ${name} (${lat}, ${lng})`);
            return marker;
        } catch (error) {
            console.error("Error adding station marker:", error);
            alert(`Error adding station marker: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Deletes a station marker and its coverage layer
     * @param {number} index - Index of the station to delete
     */
    function deleteStation(index) {
        if (index < 0 || index >= stationMarkers.length) {
            return;
        }
        
        // Remove the marker and layer from the map
        map.removeLayer(stationMarkers[index]);
        map.removeLayer(stationLayers[index]);
        
        // Remove from arrays
        stationMarkers.splice(index, 1);
        stationLayers.splice(index, 1);
        
        // Update remaining stations' indices
        stationMarkers.forEach((marker, i) => {
            // Update marker icon with new index
            marker.setIcon(L.divIcon({
                html: `<div class="marker-pin station-marker" style="background-color:${DEFAULT_STATION_COLOR};">${i + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                className: 'station-div-icon'
            }));
            
            // Update popup content
            marker.setPopupContent(`
                <h3>${marker.data.name}</h3>
                <p>Latitude: ${marker.data.latitude.toFixed(6)}</p>
                <p>Longitude: ${marker.data.longitude.toFixed(6)}</p>
                <button class="delete-station-btn" data-index="${i}">Delete Station</button>
            `);
        });
        
        // Update coverage calculations
        updateCoverageCalculations();
        
        // Update station table
        updateStationTable();
    }
    
    /**
     * Clears all station markers and coverage layers
     */
    function clearAllStations() {
        // Remove all markers and layers from the map
        stationMarkers.forEach(marker => map.removeLayer(marker));
        stationLayers.forEach(layer => map.removeLayer(layer));
        
        // Clear arrays
        stationMarkers = [];
        stationLayers = [];
        
        // Update coverage calculations
        updateCoverageCalculations();
        
        // Update station table
        updateStationTable();
    }
    
    /**
     * Updates the coverage radius for a station based on current parameters
     * @param {number} index - Index of the station to update
     */
    function updateStationCoverage(index) {
        if (index < 0 || index >= stationMarkers.length) {
            return;
        }
        
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
        
        // Calculate coverage radius in meters
        const radiusInMeters = (travelTime / 60) * travelSpeed * METERS_PER_MILE;
        
        // Get the station and coverage layer
        const marker = stationMarkers[index];
        const coverageLayer = stationLayers[index];
        
        // Update the coverage layer
        coverageLayer.setLatLng([marker.data.latitude, marker.data.longitude]);
        coverageLayer.setRadius(radiusInMeters);
    }
    
    /**
     * Updates the station data table
     */
    function updateStationTable() {
        // Clear the table body
        stationTableBody.innerHTML = '';
        
        // Add a row for each station
        stationMarkers.forEach((marker, index) => {
            const row = document.createElement('tr');
            
            // Create and add cells
            const nameCell = document.createElement('td');
            nameCell.textContent = marker.data.name;
            row.appendChild(nameCell);
            
            const latCell = document.createElement('td');
            latCell.textContent = marker.data.latitude.toFixed(6);
            row.appendChild(latCell);
            
            const lngCell = document.createElement('td');
            lngCell.textContent = marker.data.longitude.toFixed(6);
            row.appendChild(lngCell);
            
            const coverageCell = document.createElement('td');
            coverageCell.textContent = marker.data.coverageArea ? `${marker.data.coverageArea.toFixed(2)} sq mi` : '-';
            row.appendChild(coverageCell);
            
            const popCell = document.createElement('td');
            popCell.textContent = marker.data.populationCovered ? marker.data.populationCovered.toLocaleString() : '-';
            row.appendChild(popCell);
            
            const incidentCell = document.createElement('td');
            incidentCell.textContent = marker.data.incidentsCovered ? marker.data.incidentsCovered.toLocaleString() : '-';
            row.appendChild(incidentCell);
            
            const actionsCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'danger-btn delete-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', function() {
                deleteStation(index);
            });
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);
            
            // Add row to table
            stationTableBody.appendChild(row);
        });
    }
    
    /**
     * Updates coverage calculations based on current stations and boundaries
     */
    function updateCoverageCalculations() {
        // Update each station's coverage layer
        stationMarkers.forEach((marker, index) => {
            updateStationCoverage(index);
        });
        
        // Calculate overall coverage metrics
        calculateCoverageMetrics();
    }
    
    /**
     * Calculates overall coverage metrics
     */
    function calculateCoverageMetrics() {
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
        
        // Calculate travel time and radius
        const travelTime = Math.max(0, responseTime - turnoutTime);
        const radiusInMeters = (travelTime / 60) * travelSpeed * METERS_PER_MILE;
        const radiusInMiles = radiusInMeters / METERS_PER_MILE;
        
        // Calculate coverage area metrics (for now these are simplified metrics)
        if (stationMarkers.length === 0) {
            // No stations, so no coverage
            areaCoverageElement.textContent = '0%';
            populationCoverageElement.textContent = '0%';
            incidentCoverageElement.textContent = '0%';
            avgResponseTimeElement.textContent = 'N/A';
            return;
        }
        
        // For each station, calculate coverage metrics
        let totalBoundaryArea = 0;
        let totalCoveredArea = 0;
        
        // If we have a boundary, calculate its area
        if (jurisdictionBoundary) {
            totalBoundaryArea = turf.area(jurisdictionBoundary) / 1000000; // Convert to square km
            
            // Calculate the covered area (union of all station coverage areas intersected with boundary)
            // This is a simplified approach - ideally we'd use turf.js for proper calculations
            if (stationMarkers.length > 0) {
                // Estimated coverage as a percentage of the total area
                // Simplified - in reality we'd create a GeoJSON of coverage areas and calculate the actual percentage
                const coverage = Math.min(100, stationMarkers.length * 15); // Approximate coverage percentage
                totalCoveredArea = (coverage / 100) * totalBoundaryArea;
            }
        } else {
            // No boundary, use map bounds as a proxy
            const bounds = map.getBounds();
            const northEast = bounds.getNorthEast();
            const southWest = bounds.getSouthWest();
            
            const width = turf.distance(
                turf.point([southWest.lng, southWest.lat]),
                turf.point([northEast.lng, southWest.lat]),
                { units: 'kilometers' }
            );
            
            const height = turf.distance(
                turf.point([southWest.lng, southWest.lat]),
                turf.point([southWest.lng, northEast.lat]),
                { units: 'kilometers' }
            );
            
            totalBoundaryArea = width * height;
            
            // Simplified coverage estimate
            const coverage = Math.min(100, stationMarkers.length * 10); // Approximate coverage percentage
            totalCoveredArea = (coverage / 100) * totalBoundaryArea;
        }
        
        // Calculate percentage of area covered
        const areaCoverage = (totalCoveredArea / totalBoundaryArea) * 100;
        areaCoverageElement.textContent = `${Math.min(100, areaCoverage).toFixed(1)}%`;
        
        // For population coverage
        let populationCoverage;
        if (stationMarkers.length > 0) {
            // Simplified calculation assuming population is proportional to area
            populationCoverage = Math.min(100, stationMarkers.length * 12);
        } else {
            populationCoverage = 0;
        }
        populationCoverageElement.textContent = `${populationCoverage.toFixed(1)}%`;
        
        // For incident coverage
        let incidentsCovered = 0;
        let totalIncidents = incidentData.length;
        
        // Count how many incidents are covered by at least one station
        if (incidentData.length > 0 && stationMarkers.length > 0) {
            incidentData.forEach(incident => {
                // Skip if incident is missing coordinates
                if (!incident.latitude || !incident.longitude) return;
                
                // Check if this incident is covered by any station
                for (const marker of stationMarkers) {
                    const distance = turf.distance(
                        turf.point([incident.longitude, incident.latitude]),
                        turf.point([marker.data.longitude, marker.data.latitude]),
                        { units: 'miles' }
                    );
                    
                    if (distance <= radiusInMiles) {
                        incidentsCovered++;
                        break; // Count each incident only once
                    }
                }
            });
        }
        
        const incidentCoverage = totalIncidents > 0 ? (incidentsCovered / totalIncidents) * 100 : 0;
        incidentCoverageElement.textContent = `${incidentCoverage.toFixed(1)}%`;
        
        // Average response time
        const avgResponseTime = responseTime;
        avgResponseTimeElement.textContent = `${avgResponseTime.toFixed(1)} min`;
        
        // Update each station's coverage metrics
        stationMarkers.forEach((marker, index) => {
            // Calculate coverage area (πr²)
            const areaInSquareMiles = Math.PI * Math.pow(radiusInMiles, 2);
            marker.data.coverageArea = areaInSquareMiles;
            
            // Calculate incidents covered by this station
            let stationIncidentsCovered = 0;
            if (incidentData.length > 0) {
                incidentData.forEach(incident => {
                    // Skip if incident is missing coordinates
                    if (!incident.latitude || !incident.longitude) return;
                    
                    const distance = turf.distance(
                        turf.point([incident.longitude, incident.latitude]),
                        turf.point([marker.data.longitude, marker.data.latitude]),
                        { units: 'miles' }
                    );
                    
                    if (distance <= radiusInMiles) {
                        stationIncidentsCovered++;
                    }
                });
            }
            marker.data.incidentsCovered = stationIncidentsCovered;
            
            // Estimated population covered (simplified)
            // In a real implementation, we'd use census data
            marker.data.populationCovered = Math.round(areaInSquareMiles * 2000); // Assuming 2000 people per square mile
        });
        
        // Update station table with new metrics
        updateStationTable();
    }
    
    /**
     * Calculates coverage based on current parameters
     */
    function calculateCoverage() {
        // Update all station coverage layers with current parameters
        stationMarkers.forEach((marker, index) => {
            updateStationCoverage(index);
        });
        
        // Update coverage metrics
        calculateCoverageMetrics();
        
        // Provide feedback
        alert(`Coverage calculated based on ${stationMarkers.length} stations and current parameters.`);
    }
    
    /**
     * Fits the map to show all station markers
     */
    function fitMapToMarkers() {
        // If we have no markers, do nothing
        if (stationMarkers.length === 0 && suggestedStationMarkers.length === 0) {
            return;
        }
        
        // Create a bounds object
        const bounds = L.latLngBounds();
        
        // Add all station markers to bounds
        stationMarkers.forEach(marker => {
            bounds.extend(marker.getLatLng());
        });
        
        // Add suggested station markers if any
        suggestedStationMarkers.forEach(marker => {
            bounds.extend(marker.getLatLng());
        });
        
        // Fit the map to the bounds with some padding
        map.fitBounds(bounds.pad(0.2));
    }
    
    /**
     * Loads a boundary from GeoJSON data
     * @param {Object} geoJSON - GeoJSON data
     */
    function loadBoundaryFromGeoJSON(geoJSON) {
        // Clear existing boundary
        boundaryLayer.clearLayers();
        
        // Create and add the new boundary
        const layer = L.geoJSON(geoJSON, {
            style: {
                color: '#3388ff',
                weight: 3,
                opacity: 0.7,
                fillOpacity: 0.1
            }
        });
        
        // Add to boundary layer
        layer.eachLayer(l => boundaryLayer.addLayer(l));
        
        // Store the boundary as GeoJSON
        jurisdictionBoundary = geoJSON;
        
        // Fit map to boundary
        map.fitBounds(layer.getBounds());
        
        // Update coverage calculations
        updateCoverageCalculations();
    }
    
    /**
     * Shows population density as a heatmap
     */
    function showPopulationDensity() {
        // In a real implementation, this would load population density data
        // For this demo, we'll create a simple grid-based heatmap
        
        // Remove existing layer if any
        if (populationLayer) {
            map.removeLayer(populationLayer);
        }
        
        // Get map bounds
        const bounds = map.getBounds();
        const south = bounds.getSouth();
        const west = bounds.getWest();
        const north = bounds.getNorth();
        const east = bounds.getEast();
        
        const latRange = north - south;
        const lngRange = east - west;
        
        // Create a grid of population points
        const points = [];
        const gridSize = 20; // 20x20 grid
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const lat = south + (latRange * (i / gridSize)) + (latRange / (2 * gridSize));
                const lng = west + (lngRange * (j / gridSize)) + (lngRange / (2 * gridSize));
                
                // Create a point with intensity based on distance from center
                // (center of map has higher population density)
                const centerLat = south + (latRange / 2);
                const centerLng = west + (lngRange / 2);
                
                // Distance from center (0-1 scale)
                const distance = Math.sqrt(
                    Math.pow((lat - centerLat) / latRange, 2) + 
                    Math.pow((lng - centerLng) / lngRange, 2)
                );
                
                // Intensity decreases with distance from center
                // (higher near center, lower at edges)
                const intensity = Math.max(0.3, 1 - distance);
                
                points.push([lat, lng, intensity]);
            }
        }
        
        // Create a heatmap layer with the points
        populationLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            gradient: {0.4: 'blue', 0.65: 'lime', 0.85: 'yellow', 1.0: 'red'}
        }).addTo(map);
    }
    
    /**
     * Hides population density layer
     */
    function hidePopulationDensity() {
        if (populationLayer) {
            map.removeLayer(populationLayer);
            populationLayer = null;
        }
    }
    
    /**
     * Shows call density as a heatmap
     */
    function showCallDensity() {
        console.log("Starting showCallDensity function...");
        
        // Remove existing layer if any
        if (heatmapLayer) {
            console.log("Removing existing heatmap layer");
            try {
                map.removeLayer(heatmapLayer);
            } catch (e) {
                console.warn("Error removing existing heatmap layer:", e);
            }
            heatmapLayer = null;
        }
        
        // If no incident data, do nothing
        if (!incidentData || incidentData.length === 0) {
            console.warn("No incident data available for heatmap");
            return;
        }
        
        console.log(`Creating heatmap with ${incidentData.length} incidents`);
        
        // Create an array of points for the heatmap
        const points = [];
        let validCount = 0;
        
        // Add each incident as a point
        incidentData.forEach(incident => {
            // Skip if incident is missing coordinates
            if (!incident.latitude || !incident.longitude) {
                return;
            }
            
            try {
                // Parse coordinates as floats and verify they're valid numbers
                const lat = parseFloat(incident.latitude);
                const lng = parseFloat(incident.longitude);
                
                if (isNaN(lat) || isNaN(lng)) {
                    console.warn(`Invalid coordinates: ${incident.latitude}, ${incident.longitude}`);
                    return;
                }
                
                // Additional validity check - coords must be in reasonable range
                if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                    console.warn(`Coordinates out of range: ${lat}, ${lng}`);
                    return;
                }
                
                // Default intensity is 1, but can be adjusted based on incident type or other factors
                let intensity = 1;
                
                // If the incident has a custom intensity, use it
                if (incident.intensity) {
                    intensity = parseFloat(incident.intensity);
                    if (isNaN(intensity)) intensity = 1;
                }
                
                points.push([lat, lng, intensity]);
                validCount++;
            } catch (err) {
                console.error("Error processing incident for heatmap:", err);
            }
        });
        
        console.log(`Prepared ${validCount} valid points for heatmap`);
        
        // Check if we have any valid points
        if (points.length === 0) {
            console.warn("No valid points for heatmap");
            alert("No valid incident coordinates found for heatmap. Please check your data format.");
            return;
        }
        
        // Verify Leaflet.heat is available
        if (typeof L.heatLayer !== 'function') {
            console.error("L.heatLayer is not a function. Leaflet.heat plugin may not be loaded correctly");
            
            // Try to reload the Leaflet.heat plugin as a fallback
            console.log("Attempting to reload Leaflet.heat plugin...");
            
            const script = document.createElement('script');
            script.src = "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
            script.onload = function() {
                console.log("Leaflet.heat plugin loaded dynamically");
                
                // Retry creating heatmap after script loads
                setTimeout(function() {
                    if (typeof L.heatLayer === 'function') {
                        createHeatmapLayer(points);
                    } else {
                        alert("Error: Heatmap functionality not available after reload. Please refresh the page and try again.");
                    }
                }, 500);
            };
            
            script.onerror = function() {
                alert("Error: Failed to load heatmap plugin. Please refresh the page and try again.");
            };
            
            document.head.appendChild(script);
            return;
        }
        
        // Create the heatmap layer
        createHeatmapLayer(points);
        
        function createHeatmapLayer(dataPoints) {
            try {
                // Create heat layer with clear options
                console.log("Creating Leaflet.heat layer with", dataPoints.length, "points");
                
                // If we have too many points, use a smaller sample for better performance
                let pointsToUse = dataPoints;
                if (dataPoints.length > 2000) {
                    console.log(`Using a sample of 2000 points from ${dataPoints.length} total points for better performance`);
                    pointsToUse = dataPoints.slice(0, 2000);
                }
                
                heatmapLayer = L.heatLayer(pointsToUse, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 17,
                    gradient: {0.4: 'blue', 0.65: 'lime', 0.85: 'yellow', 1.0: 'red'}
                });
                
                // Add to map
                console.log("Adding heatmap layer to map");
                heatmapLayer.addTo(map);
                
                // Ensure the map is updated after adding the layer
                map.invalidateSize();
                
                console.log("Heatmap layer added successfully");
            } catch (err) {
                console.error("Error creating heatmap layer:", err);
                
                // Try our dedicated emergency points fallback
                try {
                    console.log("Using dedicated emergency points fallback");
                    
                    if (typeof window.displayEmergencyPoints === 'function') {
                        console.log("Found displayEmergencyPoints function");
                        // Use the specialized fallback function
                        heatmapLayer = window.displayEmergencyPoints(map, dataPoints, 1000);
                        console.log("Emergency points display layer created");
                        
                        // Ensure the map is updated
                        setTimeout(() => {
                            if (map) {
                                map.invalidateSize();
                                map.panBy([1, 1]); // Tiny pan to force redraw
                            }
                        }, 200);
                        
                        // Inform the user
                        alert("Heatmap could not be created. Showing sample incidents as individual points instead.");
                    } else {
                        console.error("Emergency points display function not available");
                        
                        // Fallback to simple markers
                        console.log("Falling back to simple markers");
                        heatmapLayer = L.layerGroup();
                        
                        // Use a small sample to avoid overwhelming the map
                        const sampleSize = Math.min(dataPoints.length, 300);
                        console.log(`Using ${sampleSize} marker points as fallback`);
                        
                        for (let i = 0; i < sampleSize; i++) {
                            const point = dataPoints[i];
                            const circle = L.circleMarker([point[0], point[1]], {
                                radius: 5,
                                color: 'red',
                                fillColor: '#f03',
                                fillOpacity: 0.5,
                                className: 'incident-point'
                            });
                            
                            heatmapLayer.addLayer(circle);
                        }
                        
                        heatmapLayer.addTo(map);
                        console.log("Simple marker fallback layer added");
                        
                        // Alert the user
                        alert("Heatmap could not be created. Showing a sample of incidents as markers instead.");
                    }
                } catch (markerErr) {
                    console.error("Error creating fallback markers:", markerErr);
                    alert("Error displaying incidents. Please check console for details.");
                }
            }
        }
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
                areaScore = 5;
                
                // Population score - simplified approach
                // In a real implementation, we'd use census data
                // For this demo, we'll assume higher population in the center
                const centerLat = searchBounds.getSouth() + (latDistance / 2);
                const centerLng = searchBounds.getWest() + (lngDistance / 2);
                
                // Distance from center (0-1 scale)
                const centerDistance = Math.sqrt(
                    Math.pow((lat - centerLat) / latDistance, 2) + 
                    Math.pow((lng - centerLng) / lngDistance, 2)
                );
                
                // Population score decreases with distance from center
                populationScore = 10 * (1 - centerDistance);
                
                // Incident score - based on nearby uncovered incidents with distance weighting
                if (uncoveredIncidents.length > 0) {
                    // Count incidents within coverage radius with distance weighting
                    let nearbyIncidents = 0;
                    let weightedIncidentValue = 0;
                    
                    uncoveredIncidents.forEach(incident => {
                        const distance = turf.distance(
                            turf.point([lng, lat]),
                            turf.point([incident.longitude, incident.latitude]),
                            {units: 'miles'}
                        );
                        
                        if (distance <= radiusInMiles) {
                            nearbyIncidents++;
                            
                            // Apply distance weighting: closer incidents count more
                            // At distance=0, weight=1, at distance=radiusInMiles, weight=0.25
                            const weight = 1 - (0.75 * distance / radiusInMiles);
                            weightedIncidentValue += weight;
                        }
                    });
                    
                    // Scale incident score based on number of covered incidents and their proximity
                    // This prioritizes locations that cover more incidents more centrally
                    if (nearbyIncidents > 0) {
                        const avgValue = weightedIncidentValue / nearbyIncidents;
                        
                        // Base score on number of covered incidents
                        const countFactor = Math.min(1, nearbyIncidents / 10); // Saturates at 10 incidents
                        
                        // Combine count and weighted value for final score
                        // This balances between covering many incidents and being central to them
                        incidentScore = 20 * countFactor * avgValue;
                    }
                }
                
                // Calculate total score based on optimization target
                let totalScore;
                switch(target) {
                    case 'population':
                        totalScore = populationScore * 2 + incidentScore * 0.5 + areaScore * 0.5;
                        break;
                    case 'area':
                        totalScore = populationScore * 0.5 + incidentScore * 0.5 + areaScore * 2;
                        break;
                    case 'incidents':
                        totalScore = populationScore * 0.5 + incidentScore * 2 + areaScore * 0.5;
                        break;
                    case 'balanced':
                    default:
                        totalScore = populationScore + incidentScore + areaScore;
                        break;
                }
                
                // Add to suggested locations
                suggestedLocations.push({
                    lat: lat,
                    lng: lng,
                    score: totalScore,
                    populationScore: populationScore,
                    incidentScore: incidentScore,
                    areaScore: areaScore
                });
            }
        }
        
        // Sort by score (highest first)
        suggestedLocations.sort((a, b) => b.score - a.score);
        
        // Better algorithm: select locations iteratively to ensure distribution
        const topLocations = [];
        const MIN_STATION_DISTANCE = radiusInMiles * 1.5; // Minimum distance between stations (in miles)
        
        console.log(`Using minimum distance between stations of ${MIN_STATION_DISTANCE.toFixed(2)} miles`);
        
        // Function to check if a location is too close to existing stations and selections
        const isTooClose = (location) => {
            // Check distance to existing stations
            for (const station of stationMarkers) {
                const distance = turf.distance(
                    turf.point([location.lng, location.lat]),
                    turf.point([station.data.longitude, station.data.latitude]),
                    {units: 'miles'}
                );
                
                if (distance < MIN_STATION_DISTANCE) {
                    return true;
                }
            }
            
            // Check distance to already selected locations
            for (const selected of topLocations) {
                const distance = turf.distance(
                    turf.point([location.lng, location.lat]),
                    turf.point([selected.lng, selected.lat]),
                    {units: 'miles'}
                );
                
                if (distance < MIN_STATION_DISTANCE) {
                    return true;
                }
            }
            
            return false;
        };
        
        // Select locations one by one, ensuring minimum distance
        let candidateIndex = 0;
        let attemptsLeft = 1000; // Safety limit to prevent infinite loops
        
        while (topLocations.length < stationsToAdd && candidateIndex < suggestedLocations.length && attemptsLeft > 0) {
            const candidate = suggestedLocations[candidateIndex];
            
            if (!isTooClose(candidate)) {
                // This location is far enough from other stations, add it
                topLocations.push(candidate);
                console.log(`Selected station location ${topLocations.length} with score ${candidate.score.toFixed(1)}`);
            }
            
            candidateIndex++;
            attemptsLeft--;
            
            // If we've gone through all candidates once but still need more stations,
            // reduce the minimum distance requirement by 10% and start over
            if (candidateIndex >= suggestedLocations.length && topLocations.length < stationsToAdd) {
                console.log(`Only found ${topLocations.length} of ${stationsToAdd} stations, reducing distance requirement`);
                MIN_STATION_DISTANCE *= 0.9;
                candidateIndex = 0;
            }
        }
        
        console.log(`Selected ${topLocations.length} station locations out of ${stationsToAdd} requested`);
        
        // If we couldn't find enough stations with the spacing algorithm, fall back to the top scores
        if (topLocations.length < stationsToAdd) {
            console.log(`Falling back to score-based selection for remaining ${stationsToAdd - topLocations.length} stations`);
            
            // Find the locations not already selected
            const remainingLocations = suggestedLocations.filter(loc => {
                return !topLocations.some(selected => 
                    selected.lat === loc.lat && selected.lng === loc.lng
                );
            });
            
            // Add as many as needed to reach the requested number
            const additionalNeeded = stationsToAdd - topLocations.length;
            const additionalLocations = remainingLocations.slice(0, additionalNeeded);
            
            topLocations.push(...additionalLocations);
        }
        
        // Add markers for suggested locations
        topLocations.forEach((location, index) => {
            const marker = L.marker([location.lat, location.lng], {
                icon: L.divIcon({
                    html: `<div class="marker-pin suggested-marker" style="background-color:${SUGGESTED_STATION_COLOR};">S${index+1}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15],
                    className: 'suggested-div-icon'
                })
            }).addTo(map);
            
            marker.bindPopup(`
                <h3>Suggested Station ${index+1}</h3>
                <p>Latitude: ${location.lat.toFixed(6)}</p>
                <p>Longitude: ${location.lng.toFixed(6)}</p>
                <p>Score: ${location.score.toFixed(1)}</p>
                <p>Incidents covered: ${Math.round(location.incidentScore * 2)}</p>
            `);
            
            suggestedStationMarkers.push(marker);
            
            // Also add a circle showing the coverage
            const coverageCircle = L.circle([location.lat, location.lng], {
                color: SUGGESTED_STATION_COLOR,
                fillColor: SUGGESTED_STATION_COLOR,
                fillOpacity: 0.15,
                weight: 1,
                radius: radiusInMeters
            }).addTo(map);
            
            suggestedStationMarkers.push(coverageCircle);
        });
        
        // Fit map to include suggested stations
        fitMapToMarkers();
        
        // Show optimization results
        const optimizationResults = document.getElementById('optimizationResults');
        const metricsList = document.getElementById('optimizationMetrics');
        
        // Use existing coverage metrics as baseline
        const currentAreaCoverage = parseFloat(areaCoverageElement.textContent);
        const currentPopulationCoverage = parseFloat(populationCoverageElement.textContent);
        const currentIncidentCoverage = parseFloat(incidentCoverageElement.textContent);
        
        // Estimate new coverage (simplified)
        const newAreaCoverage = Math.min(100, currentAreaCoverage + (stationsToAdd * 10)).toFixed(1);
        const newPopulationCoverage = Math.min(100, currentPopulationCoverage + (stationsToAdd * 10)).toFixed(1);
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
     * Clears suggested station markers
     */
    function clearSuggestedStations() {
        suggestedStationMarkers.forEach(marker => map.removeLayer(marker));
        suggestedStationMarkers = [];
        
        // Hide optimization results
        document.getElementById('optimizationResults').style.display = 'none';
    }
    
    /**
     * Exports the current map view as a PDF
     */
    function exportAsPDF() {
        // Show loading message with more specific information
        alert('Preparing PDF export... This may take up to 10-15 seconds. Please wait.');
        
        // Force map to update before capture
        map.invalidateSize();
        
        try {
            // Ensure jsPDF is properly loaded - with more detailed error reporting
            if (typeof window.jspdf === 'undefined') {
                console.error("jsPDF global object is undefined");
                alert("PDF export library not loaded. Please try again later or use the Data export option.");
                return;
            }
            
            if (typeof window.jspdf.jsPDF !== 'function') {
                console.error("jsPDF constructor is not available", window.jspdf);
                alert("PDF export library not initialized correctly. Please try again later or use the Data export option.");
                return;
            }

            // Create a progress indicator
            const progressIndicator = document.createElement('div');
            progressIndicator.style.position = 'fixed';
            progressIndicator.style.top = '10px';
            progressIndicator.style.right = '10px';
            progressIndicator.style.backgroundColor = '#333';
            progressIndicator.style.color = 'white';
            progressIndicator.style.padding = '10px';
            progressIndicator.style.borderRadius = '5px';
            progressIndicator.style.zIndex = '9999';
            progressIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            progressIndicator.textContent = 'Preparing PDF...';
            document.body.appendChild(progressIndicator);
            
            // Create a new jsPDF instance
            const pdf = new window.jspdf.jsPDF('landscape');
            
            progressIndicator.textContent = 'Adding PDF content...';
            
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
            
            progressIndicator.textContent = 'Capturing map...';
            
            // Export the map as an image with improved error handling
            captureMapToCanvas()
                .then(canvas => {
                    progressIndicator.textContent = 'Processing map image...';
                    
                    if (canvas) {
                        // Calculate dimensions to fit the PDF
                        const imgWidth = 260;
                        const imgHeight = 150;
                        
                        try {
                            // Use a try-catch for the data URL conversion specifically
                            const imgData = canvas.toDataURL('image/png');
                            pdf.addImage(imgData, 'PNG', 15, 65, imgWidth, imgHeight);
                            progressIndicator.textContent = 'Map added to PDF...';
                        } catch (error) {
                            console.error("Error converting canvas to data URL:", error);
                            pdf.text('Map image could not be added due to a technical issue.', 15, 100);
                            pdf.text('Please use the Export Image option separately.', 15, 110);
                            progressIndicator.textContent = 'Map capture failed...';
                        }
                    } else {
                        pdf.text('Map image could not be generated. Please use the Export Image option separately.', 15, 100);
                        progressIndicator.textContent = 'Map capture failed...';
                    }
                    
                    // Continue with the rest of the PDF generation
                    progressIndicator.textContent = 'Adding station information...';
                    
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
                    
                    // Add station data
                    if (stationMarkers.length === 0) {
                        pdf.text('No stations have been added yet.', 14, y);
                    } else {
                        stationMarkers.forEach(station => {
                            try {
                                const stationName = station.data.name.length > 15 ? 
                                    station.data.name.substring(0, 12) + '...' : 
                                    station.data.name;
                                
                                pdf.text(stationName || 'Unnamed', 14, y);
                                pdf.text(station.data.latitude ? station.data.latitude.toFixed(6).toString() : 'N/A', 50, y);
                                pdf.text(station.data.longitude ? station.data.longitude.toFixed(6).toString() : 'N/A', 90, y);
                                pdf.text(station.data.coverageArea ? `${station.data.coverageArea.toFixed(2)} sq mi` : 'N/A', 130, y);
                                pdf.text(station.data.populationCovered ? station.data.populationCovered.toString() : 'N/A', 170, y);
                                pdf.text(station.data.incidentsCovered ? station.data.incidentsCovered.toString() : 'N/A', 210, y);
                                y += 7;
                                
                                // Add page if running out of space
                                if (y > 180) {
                                    pdf.addPage();
                                    y = 15;
                                }
                            } catch (stationErr) {
                                console.error("Error adding station to PDF:", stationErr);
                                // Continue with next station
                            }
                        });
                    }
                    
                    progressIndicator.textContent = 'Saving PDF...';
                    
                    // Add incident statistics if available
                    if (incidentData && incidentData.length > 0) {
                        pdf.addPage();
                        pdf.setFontSize(16);
                        pdf.text('Incident Data Summary', 14, 15);
                        
                        pdf.setFontSize(12);
                        pdf.text(`Total Incidents: ${incidentData.length}`, 14, 25);
                        
                        const validCoords = incidentData.filter(item => 
                            item.latitude && item.longitude && 
                            !isNaN(parseFloat(item.latitude)) && 
                            !isNaN(parseFloat(item.longitude))
                        );
                        
                        pdf.text(`Incidents with Valid Coordinates: ${validCoords.length}`, 14, 35);
                        pdf.text(`Covered Incidents: ${document.getElementById('incidentCoverage').textContent}`, 14, 45);
                    }
                    
                    // Save the PDF with a more specific filename including date
                    const datePart = new Date().toISOString().slice(0, 10);
                    pdf.save(`coverage-analysis-${datePart}.pdf`);
                    
                    // Remove progress indicator
                    document.body.removeChild(progressIndicator);
                    
                    // Alert success
                    alert('PDF exported successfully!');
                })
                .catch(error => {
                    console.error("Error in map capture for PDF:", error);
                    alert("There was an error capturing the map for PDF export. Please try again or use the Data export option.");
                    
                    // Remove progress indicator even if there's an error
                    document.body.removeChild(progressIndicator);
                });
                
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Error generating PDF. Please try again or use the Export Data export option.");
        }
    }
    
    /**
     * Helper function to capture the map to a canvas
     * @returns {Promise<HTMLCanvasElement>} Promise resolving to canvas or null if failed
     */
    function captureMapToCanvas() {
        return new Promise((resolve, reject) => {
            try {
                // Ensure html2canvas is loaded
                if (typeof html2canvas !== 'function') {
                    console.error("html2canvas is not loaded");
                    reject(new Error("Map capture library not loaded"));
                    return;
                }
                
                // Get a reference to the map container
                const mapContainer = map.getContainer();
                
                // Helper function to safely check if an element has a specific class
                const hasClass = (element, className) => {
                    if (!element || !className) return false;
                    
                    // Handle both string and DOMTokenList className types
                    if (typeof element.className === 'string') {
                        return element.className.split(' ').indexOf(className) !== -1;
                    } else if (element.classList && typeof element.classList.contains === 'function') {
                        return element.classList.contains(className);
                    } else {
                        // Fallback for other cases
                        try {
                            const classStr = String(element.className);
                            return classStr.split(' ').indexOf(className) !== -1;
                        } catch (e) {
                            console.warn("Could not check class", e);
                            return false;
                        }
                    }
                };
                
                // Use html2canvas with proper configuration
                html2canvas(mapContainer, {
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    scale: 1,
                    backgroundColor: null,
                    ignoreElements: function(element) {
                        // Skip certain elements that might cause issues
                        const skippableClasses = ['leaflet-control-attribution', 'leaflet-control-scale'];
                        
                        // Check if the element has any of the skippable classes
                        return skippableClasses.some(className => hasClass(element, className));
                    }
                })
                .then(canvas => {
                    resolve(canvas);
                })
                .catch(err => {
                    console.error("Error in html2canvas:", err);
                    reject(err);
                });
            } catch (err) {
                console.error("Error setting up map capture:", err);
                reject(err);
            }
        });
    }
    
    /**
     * Exports the current map view as an image
     */
    function exportAsImage() {
        // Show loading message with better information
        alert('Preparing image export... This may take up to 10 seconds. Please wait.');
        
        // Force map to update before capture
        map.invalidateSize();
        
        // Create a progress indicator
        const progressIndicator = document.createElement('div');
        progressIndicator.style.position = 'fixed';
        progressIndicator.style.top = '10px';
        progressIndicator.style.right = '10px';
        progressIndicator.style.backgroundColor = '#333';
        progressIndicator.style.color = 'white';
        progressIndicator.style.padding = '10px';
        progressIndicator.style.borderRadius = '5px';
        progressIndicator.style.zIndex = '9999';
        progressIndicator.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        progressIndicator.textContent = 'Capturing map...';
        document.body.appendChild(progressIndicator);
        
        try {
            captureMapToCanvas()
                .then(canvas => {
                    progressIndicator.textContent = 'Processing image...';
                    
                    if (!canvas) {
                        throw new Error("Failed to create canvas");
                    }
                    
                    try {
                        // Attempt to create an image with a timestamp in the name
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
                        const filename = `coverage-map-${timestamp}.png`;
                        
                        // Convert canvas to data URL - handle potential errors
                        progressIndicator.textContent = 'Converting image...';
                        const dataUrl = canvas.toDataURL('image/png');
                        
                        // Create and trigger download
                        progressIndicator.textContent = 'Creating download...';
                        const link = document.createElement('a');
                        link.download = filename;
                        link.href = dataUrl;
                        document.body.appendChild(link);
                        
                        // Short delay before click to ensure browser has processed the data URL
                        setTimeout(() => {
                            link.click();
                            document.body.removeChild(link);
                            
                            // Remove progress indicator
                            document.body.removeChild(progressIndicator);
                            
                            // Show success message
                            alert('Image exported successfully!');
                        }, 200);
                    } catch (error) {
                        console.error("Error creating download link:", error);
                        alert("Error generating image. Please try taking a screenshot instead.");
                        document.body.removeChild(progressIndicator);
                    }
                })
                .catch(err => {
                    console.error("Error in map capture for image export:", err);
                    alert("Error generating image. Please try taking a screenshot instead.");
                    document.body.removeChild(progressIndicator);
                });
        } catch (err) {
            console.error("Error in exportAsImage:", err);
            alert("Error generating image. Please try taking a screenshot instead.");
            document.body.removeChild(progressIndicator);
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
    // Expose the initialization functions globally
    window.initializeMap = initializeMap;
    window.setupEventListeners = setupEventListeners;
})();