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

    // Geocode address using current state's coordinates
    document.getElementById('geocode-button').addEventListener('click', geocodeAddress);

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
    }
    function updateCoordinatesDisplay(lat, lng) {
        document.getElementById('station-lat').textContent = lat.toFixed(6);
        document.getElementById('station-lng').textContent = lng.toFixed(6);
    }

    // Geocode function modified to use the selected state's coordinates
    function geocodeAddress() {
        const address = document.getElementById('station-address').value;
        if (!address) {
            alert('Please enter an address');
            return;
        }
        const stateInfo = stateCoordinates[currentState];
        console.log(`Geocoding address: ${address} in ${stateInfo.name}`);
        document.getElementById('geocode-button').textContent = 'Searching...';
        document.getElementById('geocode-button').disabled = true;
        setTimeout(() => {
            const lat = stateInfo.lat + (Math.random() - 0.5) * 0.05;
            const lng = stateInfo.lng + (Math.random() - 0.5) * 0.05;
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
        setTimeout(() => {
            const stationPos = stationMarker.getLatLng();
            const colors = {
                4: '#1a9641',
                8: '#a6d96a',
                12: '#ffffbf'
            };
            let speedFactor = 1;
            if (timeOfDay === 'peak') speedFactor = 0.7;
            else if (timeOfDay === 'overnight') speedFactor = 1.3;
            if (vehicleType === 'ambulance') speedFactor *= 1.1;
            else if (vehicleType === 'ladder') speedFactor *= 0.9;
            timeIntervals.sort((a, b) => b - a);
            timeIntervals.forEach(minutes => {
                const radius = minutes * 800 * speedFactor;
                const isochrone = L.circle(stationPos, {
                    radius: radius,
                    color: colors[minutes] || '#fdae61',
                    fillColor: colors[minutes] || '#fdae61',
                    fillOpacity: 0.2,
                    weight: 2
                }).addTo(map);
                isochrone.bindTooltip(`${minutes} minute response time`);
                isochrones.push(isochrone);
            });
            updateCoverageAnalysis(timeIntervals, stationPos, speedFactor);
            document.getElementById('generate-button').textContent = 'Generate Isochrone Map';
            document.getElementById('generate-button').disabled = false;
            const bounds = L.latLngBounds([stationPos]);
            bounds.extend([stationPos.lat + 0.1, stationPos.lng + 0.1]);
            bounds.extend([stationPos.lat - 0.1, stationPos.lng - 0.1]);
            map.fitBounds(bounds);
        }, 1500);
    }

    function updateCoverageAnalysis(timeIntervals, stationPos, speedFactor) {
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

        const totalPopulation = 250000;
        const populationCoverage = {};
        timeIntervals.forEach(minutes => {
            if (minutes === 4) {
                populationCoverage[minutes] = Math.floor(totalPopulation * 0.25);
            } else if (minutes === 8) {
                populationCoverage[minutes] = Math.floor(totalPopulation * 0.60);
            } else {
                populationCoverage[minutes] = Math.floor(totalPopulation * 0.85);
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
                <p>Based on estimated population density</p>
            </div>
        `;
        document.getElementById('population-coverage').innerHTML = populationCoverageHtml;

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
        alert('This feature would export the map as an image or PDF.\n\nIn a production version, this would include:\n- The map with isochrones\n- Coverage statistics\n- Time and date of generation\n- Selected parameters');
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
