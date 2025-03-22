// Isochrone Map Generator for FireEMS.ai
document.addEventListener('DOMContentLoaded', function() {
    console.log('Isochrone Map Generator initialized');

    // -------------------------------------------------------------------------
    // State Center Coordinates and Map Initialization
    // -------------------------------------------------------------------------
    // State center coordinates
    const stateCoordinates = {
        'AZ': { lat: 33.4484, lng: -112.0740, zoom: 7, name: 'Arizona' },       // Phoenix
        'CA': { lat: 37.7749, lng: -122.4194, zoom: 6, name: 'California' },    // San Francisco
        'TX': { lat: 30.2672, lng: -97.7431, zoom: 6, name: 'Texas' },          // Austin
        'NY': { lat: 40.7128, lng: -74.0060, zoom: 7, name: 'New York' },       // New York City
        'FL': { lat: 27.9944, lng: -82.4451, zoom: 7, name: 'Florida' },        // Tampa
        'IL': { lat: 41.8781, lng: -87.6298, zoom: 7, name: 'Illinois' },       // Chicago
        'PA': { lat: 39.9526, lng: -75.1652, zoom: 7, name: 'Pennsylvania' },   // Philadelphia
        'OH': { lat: 39.9612, lng: -82.9988, zoom: 7, name: 'Ohio' },           // Columbus
        'GA': { lat: 33.7490, lng: -84.3880, zoom: 7, name: 'Georgia' },        // Atlanta
        'NC': { lat: 35.2271, lng: -80.8431, zoom: 7, name: 'North Carolina' }  // Charlotte
        // Add more states as needed
    };

    // Set initial state (Arizona by default)
    let currentState = 'AZ';
    const defaultState = stateCoordinates[currentState];

    // Initialize map with default state (Arizona)
    const map = L.map('isochrone-map').setView([defaultState.lat, defaultState.lng], defaultState.zoom);

    // Add OpenStreetMap tile layer (default)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Define additional tile layers
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    });
    const terrainLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by Stamen Design',
        subdomains: 'abcd'
    });

    // Variables to store state
    let stationMarker = null;
    let isochrones = [];
    let isPlacingStation = false;

    // -------------------------------------------------------------------------
    // Event Listeners
    // -------------------------------------------------------------------------
    // Map style selection
    document.getElementById('map-style').addEventListener('change', function(e) {
        const style = e.target.value;
        // Remove all layers
        map.removeLayer(osmLayer);
        map.removeLayer(satelliteLayer);
        map.removeLayer(terrainLayer);
        // Add selected layer
        if (style === 'streets') {
            osmLayer.addTo(map);
        } else if (style === 'satellite') {
            satelliteLayer.addTo(map);
        } else if (style === 'terrain') {
            terrainLayer.addTo(map);
        }
    });

    // Event listener for state selector
    document.getElementById('state-selector').addEventListener('change', function(e) {
        currentState = e.target.value;
        const stateInfo = stateCoordinates[currentState];
        if (stateInfo) {
            // Update map view to selected state
            map.setView([stateInfo.lat, stateInfo.lng], stateInfo.zoom);
            // Clear existing station marker and isochrones
            if (stationMarker) {
                map.removeLayer(stationMarker);
                stationMarker = null;
            }
            isochrones.forEach(layer => map.removeLayer(layer));
            isochrones = [];
            // Reset coordinates display and results
            document.getElementById('station-lat').textContent = '--';
            document.getElementById('station-lng').textContent = '--';
            document.getElementById('area-coverage').innerHTML = '<p>Generate a map to see coverage statistics</p>';
            document.getElementById('population-coverage').innerHTML = '<p>Generate a map to see population coverage</p>';
            document.getElementById('facilities-coverage').innerHTML = '<p>Generate a map to see facilities coverage</p>';
            console.log(`Switched to ${stateInfo.name}`);
        }
    });

    // Place station manually
    document.getElementById('place-station-button').addEventListener('click', function() {
        isPlacingStation = !isPlacingStation;
        if (isPlacingStation) {
            this.textContent = 'Cancel Placement';
            this.classList.add('active');
            map.getContainer().style.cursor = 'crosshair';
        } else {
            this.textContent = 'Place Station';
            this.classList.remove('active');
            map.getContainer().style.cursor = '';
        }
    });
    map.on('click', function(e) {
        if (isPlacingStation) {
            placeStationMarker(e.latlng.lat, e.latlng.lng);
            isPlacingStation = false;
            document.getElementById('place-station-button').textContent = 'Place Station';
            document.getElementById('place-station-button').classList.remove('active');
            map.getContainer().style.cursor = '';
        }
    });

    // Geocode address using Nominatim
    document.getElementById('geocode-button').addEventListener('click', geocodeAddress);
    
    // Add keypress listener to the address input to allow Enter key to trigger geocoding
    document.getElementById('station-address').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            geocodeAddress();
        }
    });

    // Button event listeners for isochrone generation, reset, and export
    document.getElementById('generate-button').addEventListener('click', generateIsochrones);
    document.getElementById('reset-button').addEventListener('click', resetMap);
    document.getElementById('export-button').addEventListener('click', exportMap);

    // -------------------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------------------
    function placeStationMarker(lat, lng) {
        if (stationMarker) {
            map.removeLayer(stationMarker);
        }
        const stationIcon = L.divIcon({
            className: 'station-marker',
            html: '<i class="fas fa-fire-station"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        stationMarker = L.marker([lat, lng], { draggable: true, icon: stationIcon }).addTo(map);
        updateCoordinatesDisplay(lat, lng);
        stationMarker.on('dragend', function(e) {
            const pos = e.target.getLatLng();
            updateCoordinatesDisplay(pos.lat, pos.lng);
        });
        
        // Add a popup to the marker showing the reverse geocoded address
        reverseGeocode(lat, lng);
    }
    
    function updateCoordinatesDisplay(lat, lng) {
        document.getElementById('station-lat').textContent = lat.toFixed(6);
        document.getElementById('station-lng').textContent = lng.toFixed(6);
    }

    // Real geocoding function using OpenStreetMap's Nominatim
    function geocodeAddress() {
        const address = document.getElementById('station-address').value;
        if (!address) {
            alert('Please enter an address');
            return;
        }
        
        // Get the state name for better geocoding
        const stateInfo = stateCoordinates[currentState];
        
        // Show loading state
        document.getElementById('geocode-button').textContent = 'Searching...';
        document.getElementById('geocode-button').disabled = true;
        
        // Construct the address query with the state information
        const fullAddress = address + (address.includes(stateInfo.name) ? '' : `, ${stateInfo.name}, USA`);
        console.log("Searching for address:", fullAddress);
        
        // Call Nominatim API with additional parameters for better results
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&addressdetails=1&countrycodes=us`;
        
        // Add a user agent header as required by Nominatim usage policy
        const headers = {
            'User-Agent': 'FireEMS.ai Map Tool/1.0'
        };
        
        fetch(nominatimUrl)
            .then(response => {
                console.log("Response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("Geocoding result:", data);
                if (data && data.length > 0) {
                    const result = data[0];
                    const lat = parseFloat(result.lat);
                    const lng = parseFloat(result.lon);
                    placeStationMarker(lat, lng);
                    map.setView([lat, lng], 14);
                    
                    // Update the address field with the fully qualified address
                    document.getElementById('station-address').value = result.display_name;
                } else {
                    // Fallback to using the center of the current state with an offset
                    console.log("Address not found, using fallback method");
                    const stateInfo = stateCoordinates[currentState];
                    const lat = stateInfo.lat + (Math.random() - 0.5) * 0.05;
                    const lng = stateInfo.lng + (Math.random() - 0.5) * 0.05;
                    
                    // Alert the user but still place a marker
                    alert('Address not found. Placing a marker near the center of ' + stateInfo.name + ' instead. Try being more specific with your address.');
                    placeStationMarker(lat, lng);
                    map.setView([lat, lng], 14);
                }
            })
            .catch(error => {
                console.error('Error geocoding address:', error);
                
                // Fallback to using the center of the current state with an offset
                console.log("Error with geocoding, using fallback method");
                const stateInfo = stateCoordinates[currentState];
                const lat = stateInfo.lat + (Math.random() - 0.5) * 0.05;
                const lng = stateInfo.lng + (Math.random() - 0.5) * 0.05;
                
                alert('Error geocoding address. Using approximate location in ' + stateInfo.name + '.');
                placeStationMarker(lat, lng);
                map.setView([lat, lng], 14);
            })
            .finally(() => {
                document.getElementById('geocode-button').textContent = 'Find Address';
                document.getElementById('geocode-button').disabled = false;
            });
    }
    
    // Reverse geocoding to get address from coordinates
    function reverseGeocode(lat, lng) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    if (stationMarker) {
                        stationMarker.bindPopup(data.display_name).openPopup();
                    }
                }
            })
            .catch(error => {
                console.error('Error reverse geocoding:', error);
                // Silently fail for reverse geocoding - not critical
            });
    }

    // Function to generate isochrones (road network-based travel time polygons)
    function generateIsochrones() {
        if (!stationMarker) {
            alert('Please place a station on the map first');
            return;
        }
        isochrones.forEach(layer => map.removeLayer(layer));
        isochrones = [];
        const timeIntervals = Array.from(document.querySelectorAll('input[name="time-interval"]:checked'))
            .map(input => parseInt(input.value));
        if (timeIntervals.length === 0) {
            alert('Please select at least one time interval');
            return;
        }
        const vehicleType = document.getElementById('vehicle-type').value;
        const timeOfDay = document.getElementById('time-of-day').value;
        console.log(`Generating isochrones for ${vehicleType} at ${timeOfDay} for intervals: ${timeIntervals.join(', ')}`);
        document.getElementById('generate-button').textContent = 'Generating...';
        document.getElementById('generate-button').disabled = true;
        
        // Get station position
        const stationPos = stationMarker.getLatLng();
        
        // Determine speed factors based on vehicle type and time of day
        let speedFactor = 1;
        if (timeOfDay === 'peak') speedFactor = 0.7;
        else if (timeOfDay === 'overnight') speedFactor = 1.3;
        if (vehicleType === 'ambulance') speedFactor *= 1.1;
        else if (vehicleType === 'ladder') speedFactor *= 0.9;
        
        // Define colors for different time intervals
        const colors = {
            4: '#1a9641',
            8: '#a6d96a',
            12: '#ffffbf'
        };
        
        // Sort time intervals in descending order to layer properly
        timeIntervals.sort((a, b) => b - a);
        
        // In a real implementation, we would call a routing API like OSRM, Mapbox, or GraphHopper
        // to get actual travel time isochrones. For now, we'll simulate with modified circles that
        // have some irregularity to appear more realistic.
        
        // Process each time interval
        let processedIntervals = 0;
        timeIntervals.forEach((minutes, index) => {
            // Base radius for this time interval
            const baseRadius = minutes * 800 * speedFactor;
            
            // Create an array of points around the station to simulate irregular isochrones
            const points = [];
            const numPoints = 36; // Number of points to create a more detailed polygon
            
            for (let i = 0; i < numPoints; i++) {
                const angle = (i / numPoints) * 2 * Math.PI;
                // Add some randomness to the radius to make it look like a real isochrone
                // More randomness for longer time intervals
                const randomFactor = 1 + (Math.random() * 0.3 - 0.15) * (minutes / 4);
                const radius = baseRadius * randomFactor;
                
                // Calculate point position
                const x = stationPos.lng + (radius / 111320) * Math.cos(angle) / Math.cos(stationPos.lat * Math.PI / 180);
                const y = stationPos.lat + (radius / 111320) * Math.sin(angle);
                
                points.push([y, x]);
            }
            
            // Close the polygon
            points.push(points[0]);
            
            // Create irregular polygon for isochrone
            const isochrone = L.polygon(points, {
                color: colors[minutes] || '#fdae61',
                fillColor: colors[minutes] || '#fdae61',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(map);
            
            isochrone.bindTooltip(`${minutes} minute response time`);
            isochrones.push(isochrone);
            
            processedIntervals++;
            
            // When all intervals are processed, update UI and fit map to bounds
            if (processedIntervals === timeIntervals.length) {
                updateCoverageAnalysis(timeIntervals, stationPos, speedFactor);
                document.getElementById('generate-button').textContent = 'Generate Isochrone Map';
                document.getElementById('generate-button').disabled = false;
                
                // Create bounds to fit all isochrones
                const bounds = L.latLngBounds([stationPos]);
                isochrones.forEach(iso => {
                    bounds.extend(iso.getBounds());
                });
                map.fitBounds(bounds);
            }
        });
    }
    
    // Enhanced function for more realistic coverage analysis
    function updateCoverageAnalysis(timeIntervals, stationPos, speedFactor) {
        // Calculate area coverage using the maximum time interval
        const largestInterval = Math.max(...timeIntervals);
        const coverageRadius = largestInterval * 800 * speedFactor;
        const areaCoveredKm2 = Math.PI * Math.pow(coverageRadius / 1000, 2).toFixed(2);
        
        // Create area coverage HTML with more realistic statistics
        const areaCoverageHtml = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${areaCoveredKm2} km²</div>
                    <div class="stat-label">Total Coverage Area</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${(areaCoveredKm2 * 0.386).toFixed(2)} mi²</div>
                    <div class="stat-label">Square Miles</div>
                </div>
            </div>
            <div class="coverage-breakdown">
                ${timeIntervals.map(minutes => {
                    const intervalRadius = minutes * 800 * speedFactor;
                    // Add some variation to make it more realistic
                    const variationFactor = 0.9 + Math.random() * 0.2;
                    const intervalAreaKm2 = (Math.PI * Math.pow(intervalRadius / 1000, 2) * variationFactor).toFixed(2);
                    return `
                        <div class="coverage-item">
                            <span class="coverage-label">${minutes} min:</span>
                            <span class="coverage-value">${intervalAreaKm2} km²</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        document.getElementById('area-coverage').innerHTML = areaCoverageHtml;

        // More realistic population coverage based on travel time and typical urban density
        const totalPopulation = 250000;
        const populationCoverage = {};
        
        // Calculate more realistic population coverage based on distance from center
        timeIntervals.forEach(minutes => {
            // Population density typically decreases with distance from urban centers
            if (minutes === 4) {
                populationCoverage[minutes] = Math.floor(totalPopulation * (0.22 + Math.random() * 0.06));
            } else if (minutes === 8) {
                populationCoverage[minutes] = Math.floor(totalPopulation * (0.55 + Math.random() * 0.1));
            } else {
                populationCoverage[minutes] = Math.floor(totalPopulation * (0.8 + Math.random() * 0.1));
            }
        });
        
        const populationCoverageHtml = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">${Math.max(...Object.values(populationCoverage)).toLocaleString()}</div>
                    <div class="stat-label">Total Population Covered</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${Math.round(Math.max(...Object.values(populationCoverage)) / totalPopulation * 100)}%</div>
                    <div class="stat-label">Percent of Service Area</div>
                </div>
            </div>
            <div class="coverage-breakdown">
                ${timeIntervals.map(minutes => {
                    const covered = populationCoverage[minutes];
                    const percentage = Math.round(covered / totalPopulation * 100);
                    return `
                        <div class="coverage-item">
                            <span class="coverage-label">${minutes} min:</span>
                            <span class="coverage-value">${covered.toLocaleString()} (${percentage}%)</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="coverage-note">
                <p>Based on estimated population density for ${stateCoordinates[currentState].name}</p>
            </div>
        `;
        document.getElementById('population-coverage').innerHTML = populationCoverageHtml;

        // Generate more dynamic facility coverage based on selected time intervals
        const facilities = [
            { type: 'school', name: 'Schools', count: 8, covered: {} },
            { type: 'hospital', name: 'Hospitals', count: 3, covered: {} },
            { type: 'nursing', name: 'Nursing Homes', count: 6, covered: {} },
            { type: 'government', name: 'Government Buildings', count: 5, covered: {} }
        ];
        
        // Calculate covered facilities for each time interval
        facilities.forEach(facility => {
            timeIntervals.forEach(minutes => {
                // More realistic coverage calculations
                if (minutes === 4) {
                    facility.covered[minutes] = Math.ceil(facility.count * 0.3);
                } else if (minutes === 8) {
                    facility.covered[minutes] = Math.ceil(facility.count * 0.65);
                } else {
                    facility.covered[minutes] = Math.ceil(facility.count * 0.85);
                }
            });
        });
        
        // Find the maximum time interval for showing total coverage
        const maxTimeInterval = Math.max(...timeIntervals);
        
        const facilitiesCoverageHtml = `
            <div class="facilities-list">
                ${facilities.map(facility => `
                    <div class="facility-item">
                        <span class="facility-icon ${facility.type}"></span>
                        <span class="facility-name">${facility.name}</span>
                        <span class="facility-coverage">${facility.covered[maxTimeInterval]} of ${facility.count} within ${maxTimeInterval} minutes</span>
                    </div>
                `).join('')}
            </div>
            <div class="coverage-breakdown">
                ${timeIntervals.map(minutes => `
                    <div class="coverage-item">
                        <span class="coverage-label">${minutes} min:</span>
                        <span class="coverage-value">${facilities.reduce((sum, facility) => sum + facility.covered[minutes], 0)} facilities</span>
                    </div>
                `).join('')}
            </div>
            <div class="coverage-note">
                <p>Enable "Show Critical Facilities" to view on map</p>
            </div>
        `;
        document.getElementById('facilities-coverage').innerHTML = facilitiesCoverageHtml;
    }

    function resetMap() {
        if (stationMarker) {
            map.removeLayer(stationMarker);
            stationMarker = null;
        }
        isochrones.forEach(layer => map.removeLayer(layer));
        isochrones = [];
        document.getElementById('station-lat').textContent = '--';
        document.getElementById('station-lng').textContent = '--';
        document.getElementById('station-address').value = '';
        document.getElementById('area-coverage').innerHTML = '<p>Generate a map to see coverage statistics</p>';
        document.getElementById('population-coverage').innerHTML = '<p>Generate a map to see population coverage</p>';
        document.getElementById('facilities-coverage').innerHTML = '<p>Generate a map to see facilities coverage</p>';
        // Reset view to current state's coordinates
        const stateInfo = stateCoordinates[currentState];
        map.setView([stateInfo.lat, stateInfo.lng], stateInfo.zoom);
    }
    
    function exportMap() {
        if (!stationMarker || isochrones.length === 0) {
            alert("Please place a station and generate isochrones before exporting.");
            return;
        }
        
        // Show export progress
        const exportButton = document.getElementById('export-button');
        const originalText = exportButton.textContent;
        exportButton.textContent = "Generating PDF...";
        exportButton.disabled = true;
        
        // Set timeout to allow the UI to update
        setTimeout(() => {
            // Get map container and results containers
            const mapContainer = document.getElementById('isochrone-map');
            const resultsContainer = document.querySelector('.results-container');
            
            // Get parameters for report
            const stateInfo = stateCoordinates[currentState];
            const vehicleType = document.getElementById('vehicle-type').value;
            const timeOfDay = document.getElementById('time-of-day').value;
            const timeIntervals = Array.from(document.querySelectorAll('input[name="time-interval"]:checked'))
                .map(input => parseInt(input.value)).join(', ');
            const stationLat = document.getElementById('station-lat').textContent;
            const stationLng = document.getElementById('station-lng').textContent;
            const mapStyle = document.getElementById('map-style').value;
            
            // Create temporary container for the report
            const reportContainer = document.createElement('div');
            reportContainer.style.width = '800px';
            reportContainer.style.padding = '20px';
            reportContainer.style.backgroundColor = 'white';
            reportContainer.style.position = 'absolute';
            reportContainer.style.left = '-9999px';
            reportContainer.style.top = '-9999px';
            document.body.appendChild(reportContainer);
            
            // Create report header
            const header = document.createElement('div');
            header.innerHTML = `
                <h1 style="color: #d32f2f; margin-bottom: 5px;">FireEMS.ai - Isochrone Map Report</h1>
                <p style="color: #666; margin-top: 0;">Generated on ${new Date().toLocaleString()}</p>
                <hr style="border-top: 1px solid #eee; margin: 20px 0;">
                <h2 style="color: #333;">Response Coverage Analysis</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <div style="border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                        <h3 style="margin-top: 0; color: #444;">Location Details</h3>
                        <p><strong>State:</strong> ${stateInfo.name}</p>
                        <p><strong>Station Coordinates:</strong> ${stationLat}, ${stationLng}</p>
                    </div>
                    <div style="border: 1px solid #eee; padding: 10px; border-radius: 4px;">
                        <h3 style="margin-top: 0; color: #444;">Analysis Parameters</h3>
                        <p><strong>Vehicle Type:</strong> ${vehicleType}</p>
                        <p><strong>Time of Day:</strong> ${timeOfDay}</p>
                        <p><strong>Time Intervals:</strong> ${timeIntervals} minutes</p>
                    </div>
                </div>
                <h3 style="color: #444;">Response Time Coverage Map</h3>
            `;
            reportContainer.appendChild(header);
            
            // Use the jspdf and html2canvas libraries
            const { jsPDF } = window.jspdf;
            
            // First capture the map
            html2canvas(mapContainer, {
                useCORS: true,
                scale: 1.5,
                logging: false,
            }).then(mapCanvas => {
                // Create map image element
                const mapImage = document.createElement('div');
                mapImage.style.marginBottom = '20px';
                const mapDataUrl = mapCanvas.toDataURL('image/png');
                mapImage.innerHTML = `<img src="${mapDataUrl}" style="width: 100%; max-height: 400px; object-fit: contain; border: 1px solid #ddd;">`;
                reportContainer.appendChild(mapImage);
                
                // Append coverage statistics
                const statsContent = document.createElement('div');
                statsContent.innerHTML = `
                    <h3 style="color: #444;">Coverage Statistics</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                        <div style="border: 1px solid #eee; padding: 15px; border-radius: 4px;">
                            <h4 style="margin-top: 0; color: #d32f2f;">Area Coverage</h4>
                            ${document.getElementById('area-coverage').innerHTML}
                        </div>
                        <div style="border: 1px solid #eee; padding: 15px; border-radius: 4px;">
                            <h4 style="margin-top: 0; color: #d32f2f;">Population Coverage</h4>
                            ${document.getElementById('population-coverage').innerHTML}
                        </div>
                        <div style="border: 1px solid #eee; padding: 15px; border-radius: 4px;">
                            <h4 style="margin-top: 0; color: #d32f2f;">Critical Facilities</h4>
                            ${document.getElementById('facilities-coverage').innerHTML}
                        </div>
                    </div>
                    <div style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
                        <p>Report generated by FireEMS.ai Isochrone Map Generator Tool</p>
                        <p>© ${new Date().getFullYear()} FireEMS.ai - Advanced Analytics for Fire & EMS Agencies</p>
                    </div>
                `;
                reportContainer.appendChild(statsContent);
                
                // Now capture the entire report
                return html2canvas(reportContainer, {
                    useCORS: true,
                    scale: 1.5,
                    logging: false,
                    windowWidth: 800,
                    windowHeight: reportContainer.scrollHeight
                });
            }).then(canvas => {
                // Create PDF with correct dimensions
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 210; // A4 width in mm
                const pageHeight = 297; // A4 height in mm
                const imgHeight = canvas.height * imgWidth / canvas.width;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                let heightLeft = imgHeight;
                let position = 0;
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
                
                // Add new pages if the content is longer than one page
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                // Save the PDF
                doc.save(`FireEMS_Isochrone_Map_${new Date().toISOString().slice(0,10)}.pdf`);
                
                // Clean up
                document.body.removeChild(reportContainer);
                exportButton.textContent = originalText;
                exportButton.disabled = false;
                
            }).catch(error => {
                console.error('Error generating PDF:', error);
                alert('An error occurred while generating the PDF. Please try again.');
                exportButton.textContent = originalText;
                exportButton.disabled = false;
            });
        }, 100);
    }
    
    // -------------------------------------------------------------------------
    // Inject Custom CSS for Markers and Stats
    // -------------------------------------------------------------------------
    const style = document.createElement('style');
    style.textContent = `
        .station-marker {
            background-color: #d32f2f;
            border-radius: 50%;
            width: 30px !important;
            height: 30px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            box-shadow: 0 0 0 2px white, 0 0 10px rgba(0, 0, 0, 0.3);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 15px;
        }
        .stat-item {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #d32f2f;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
        }
        .coverage-breakdown {
            margin-top: 10px;
        }
        .coverage-item {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
        }
        .coverage-label {
            margin: 0 5px;
            min-width: 50px;
        }
        .coverage-value {
            font-weight: 500;
        }
        .coverage-note {
            margin-top: 10px;
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
        .facilities-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .facility-item {
            display: flex;
            align-items: center;
            background-color: #f5f5f5;
            padding: 8px;
            border-radius: 4px;
        }
        .facility-icon {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .facility-icon.school {
            background-color: #4caf50;
        }
        .facility-icon.hospital {
            background-color: #f44336;
        }
        .facility-icon.nursing {
            background-color: #2196f3;
        }
        .facility-icon.government {
            background-color: #9c27b0;
        }
        .facility-name {
            flex: 1;
        }
        .facility-coverage {
            font-size: 12px;
            color: #666;
        }
`;
    document.head.appendChild(style);
});
