// Isochrone Map Generator for FireEMS.ai
document.addEventListener('DOMContentLoaded', function() {
    console.log('Isochrone Map Generator initialized');
    
    // Initialize map
    const map = L.map('isochrone-map').setView([37.7749, -122.4194], 12); // Default to San Francisco
    
    // Add OpenStreetMap tile layer (default)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Define other tile layers
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    
    const terrainLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd'
    });
    
    // Variables to store state
    let stationMarker = null;
    let isochrones = [];
    let isPlacingStation = false;
    
    // Event listeners
    document.getElementById('map-style').addEventListener('change', function(e) {
        const style = e.target.value;
        
        // Remove all layers first
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
    
    document.getElementById('geocode-button').addEventListener('click', geocodeAddress);
    
    document.getElementById('generate-button').addEventListener('click', generateIsochrones);
    
    document.getElementById('reset-button').addEventListener('click', resetMap);
    
    document.getElementById('export-button').addEventListener('click', exportMap);
    
    // Helper functions
    function placeStationMarker(lat, lng) {
        // Remove existing marker if any
        if (stationMarker) {
            map.removeLayer(stationMarker);
        }
        
        // Create a new marker
        const stationIcon = L.divIcon({
            className: 'station-marker',
            html: '<i class="fas fa-fire-station"></i>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        stationMarker = L.marker([lat, lng], {
            draggable: true,
            icon: stationIcon
        }).addTo(map);
        
        // Update coordinates display
        updateCoordinatesDisplay(lat, lng);
        
        // Add event listener for marker drag end
        stationMarker.on('dragend', function(e) {
            const marker = e.target;
            const position = marker.getLatLng();
            updateCoordinatesDisplay(position.lat, position.lng);
        });
    }
    
    function updateCoordinatesDisplay(lat, lng) {
        document.getElementById('station-lat').textContent = lat.toFixed(6);
        document.getElementById('station-lng').textContent = lng.toFixed(6);
    }
    
    function geocodeAddress() {
        const address = document.getElementById('station-address').value;
        
        if (!address) {
            alert('Please enter an address');
            return;
        }
        
        // In a real application, this would make a request to a geocoding service
        // For this demonstration, we'll simulate a geocoding response
        console.log(`Geocoding address: ${address}`);
        
        // Simulate geocoding delay
        document.getElementById('geocode-button').textContent = 'Searching...';
        document.getElementById('geocode-button').disabled = true;
        
        setTimeout(() => {
            // Random coordinates (for demonstration)
            const lat = 37.7749 + (Math.random() - 0.5) * 0.05;
            const lng = -122.4194 + (Math.random() - 0.5) * 0.05;
            
            placeStationMarker(lat, lng);
            map.setView([lat, lng], 14);
            
            document.getElementById('geocode-button').textContent = 'Find Address';
            document.getElementById('geocode-button').disabled = false;
        }, 1000);
    }
    
    function generateIsochrones() {
        if (!stationMarker) {
            alert('Please place a station on the map first');
            return;
        }
        
        // Clear existing isochrones
        isochrones.forEach(layer => map.removeLayer(layer));
        isochrones = [];
        
        // Get selected time intervals
        const timeIntervals = Array.from(document.querySelectorAll('input[name="time-interval"]:checked'))
            .map(input => parseInt(input.value));
        
        if (timeIntervals.length === 0) {
            alert('Please select at least one time interval');
            return;
        }
        
        // Get vehicle type and time of day
        const vehicleType = document.getElementById('vehicle-type').value;
        const timeOfDay = document.getElementById('time-of-day').value;
        
        console.log(`Generating isochrones for ${vehicleType} at ${timeOfDay} for intervals: ${timeIntervals.join(', ')}`);
        
        // Show loading state
        document.getElementById('generate-button').textContent = 'Generating...';
        document.getElementById('generate-button').disabled = true;
        
        setTimeout(() => {
            // Get station position
            const stationPos = stationMarker.getLatLng();
            
            // In a real application, these would be calculated using a routing service
            // For this demonstration, we'll create simplified isochrones as concentric circles
            
            // Define colors for different time intervals
            const colors = {
                4: '#1a9641',  // Green
                8: '#a6d96a',  // Light green
                12: '#ffffbf', // Yellow
            };
            
            // Different speeds based on time of day and vehicle type
            let speedFactor = 1;
            
            if (timeOfDay === 'peak') {
                speedFactor = 0.7; // Slower in rush hour
            } else if (timeOfDay === 'overnight') {
                speedFactor = 1.3; // Faster at night
            }
            
            if (vehicleType === 'ambulance') {
                speedFactor *= 1.1; // Ambulances slightly faster
            } else if (vehicleType === 'ladder') {
                speedFactor *= 0.9; // Ladder trucks slightly slower
            }
            
            // Create isochrones
            timeIntervals.sort((a, b) => b - a); // Sort in descending order to draw largest first
            
            timeIntervals.forEach(minutes => {
                // Convert minutes to meters (rough estimate - 1 minute ≈ 800 meters)
                // Adjust by speed factor
                const radius = minutes * 800 * speedFactor;
                
                const isochrone = L.circle(stationPos, {
                    radius: radius,
                    color: colors[minutes] || '#fdae61', // Default to orange if color not defined
                    fillColor: colors[minutes] || '#fdae61',
                    fillOpacity: 0.2,
                    weight: 2
                }).addTo(map);
                
                isochrone.bindTooltip(`${minutes} minute response time`);
                isochrones.push(isochrone);
            });
            
            // Update coverage analysis
            updateCoverageAnalysis(timeIntervals, stationPos, speedFactor);
            
            document.getElementById('generate-button').textContent = 'Generate Isochrone Map';
            document.getElementById('generate-button').disabled = false;
            
            // Fit map to show all isochrones
            const bounds = L.latLngBounds([stationPos]);
            bounds.extend([stationPos.lat + 0.1, stationPos.lng + 0.1]);
            bounds.extend([stationPos.lat - 0.1, stationPos.lng - 0.1]);
            map.fitBounds(bounds);
        }, 1500);
    }
    
    function updateCoverageAnalysis(timeIntervals, stationPos, speedFactor) {
        // These would be calculated using actual data in a real application
        // Here we're using simulated data
        
        // Area coverage
        const largestInterval = Math.max(...timeIntervals);
        const coverageRadius = largestInterval * 800 * speedFactor;
        const areaCoveredKm2 = Math.PI * Math.pow(coverageRadius / 1000, 2).toFixed(2);
        
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
                    const intervalAreaKm2 = Math.PI * Math.pow(intervalRadius / 1000, 2).toFixed(2);
                    const color = document.querySelector(`.legend-color[style*="background-color: ${getColorForMinutes(minutes)}"]`);
                    const colorStyle = color ? color.getAttribute('style') : '';
                    
                    return `
                        <div class="coverage-item">
                            <span class="legend-color" ${colorStyle}></span>
                            <span class="coverage-label">${minutes} min:</span>
                            <span class="coverage-value">${intervalAreaKm2} km²</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        document.getElementById('area-coverage').innerHTML = areaCoverageHtml;
        
        // Population coverage (simulated)
        const totalPopulation = 250000; // Example: total population in service area
        const populationCoverage = {};
        
        timeIntervals.forEach(minutes => {
            // Simulate population coverage based on time interval
            // In reality, this would be calculated using actual population density data
            if (minutes === 4) {
                populationCoverage[minutes] = Math.floor(totalPopulation * 0.25); // 25% within 4 min
            } else if (minutes === 8) {
                populationCoverage[minutes] = Math.floor(totalPopulation * 0.60); // 60% within 8 min
            } else {
                populationCoverage[minutes] = Math.floor(totalPopulation * 0.85); // 85% within 12 min
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
                    const color = document.querySelector(`.legend-color[style*="background-color: ${getColorForMinutes(minutes)}"]`);
                    const colorStyle = color ? color.getAttribute('style') : '';
                    
                    return `
                        <div class="coverage-item">
                            <span class="legend-color" ${colorStyle}></span>
                            <span class="coverage-label">${minutes} min:</span>
                            <span class="coverage-value">${covered.toLocaleString()} (${percentage}%)</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="coverage-note">
                <p>Based on estimated population density</p>
            </div>
        `;
        
        document.getElementById('population-coverage').innerHTML = populationCoverageHtml;
        
        // Critical facilities (simulated)
        const facilitiesCoverageHtml = `
            <div class="facilities-list">
                <div class="facility-item">
                    <span class="facility-icon school"></span>
                    <span class="facility-name">Schools</span>
                    <span class="facility-coverage">5 of 8 within 8 minutes</span>
                </div>
                <div class="facility-item">
                    <span class="facility-icon hospital"></span>
                    <span class="facility-name">Hospitals</span>
                    <span class="facility-coverage">2 of 3 within 8 minutes</span>
                </div>
                <div class="facility-item">
                    <span class="facility-icon nursing"></span>
                    <span class="facility-name">Nursing Homes</span>
                    <span class="facility-coverage">3 of 6 within 8 minutes</span>
                </div>
                <div class="facility-item">
                    <span class="facility-icon government"></span>
                    <span class="facility-name">Government Buildings</span>
                    <span class="facility-coverage">4 of 5 within 8 minutes</span>
                </div>
            </div>
            <div class="coverage-note">
                <p>Enable "Show Critical Facilities" to view on map</p>
            </div>
        `;
        
        document.getElementById('facilities-coverage').innerHTML = facilitiesCoverageHtml;
    }
    
    function getColorForMinutes(minutes) {
        if (minutes <= 4) return '#1a9641';
        if (minutes <= 8) return '#a6d96a';
        if (minutes <= 12) return '#ffffbf';
        return '#fdae61';
    }
    
    function resetMap() {
        // Remove station marker
        if (stationMarker) {
            map.removeLayer(stationMarker);
            stationMarker = null;
        }
        
        // Clear isochrones
        isochrones.forEach(layer => map.removeLayer(layer));
        isochrones = [];
        
        // Reset coordinates display
        document.getElementById('station-lat').textContent = '--';
        document.getElementById('station-lng').textContent = '--';
        
        // Reset address input
        document.getElementById('station-address').value = '';
        
        // Reset results
        document.getElementById('area-coverage').innerHTML = '<p>Generate a map to see coverage statistics</p>';
        document.getElementById('population-coverage').innerHTML = '<p>Generate a map to see population coverage</p>';
        document.getElementById('facilities-coverage').innerHTML = '<p>Generate a map to see facilities coverage</p>';
        
        // Reset view
        map.setView([37.7749, -122.4194], 12);
    }
    
    function exportMap() {
        alert('This feature would export the map as an image or PDF.\n\nIn a production version, this would include:\n- The map with isochrones\n- Coverage statistics\n- Time and date of generation\n- Selected parameters');
    }
    
    // Add CSS for custom markers
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
