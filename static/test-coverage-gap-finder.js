/**
 * Test script for the Coverage Gap Finder
 * This file contains functions for testing the station suggestion algorithm
 */

function testStationSuggestion() {
    // Clear any existing suggested stations
    clearSuggestedStations();
    
    // Set up test data
    const testData = {
        stations: [
            { name: "Test Station 1", lat: 33.4500, lng: -112.0730 },
            { name: "Test Station 2", lat: 33.5500, lng: -112.0700 },
            { name: "Test Station 3", lat: 33.3500, lng: -112.0700 }
        ],
        incidents: [
            // Create a cluster of incidents away from existing stations
            { lat: 33.4800, lng: -112.1200 },
            { lat: 33.4810, lng: -112.1210 },
            { lat: 33.4820, lng: -112.1220 },
            { lat: 33.4815, lng: -112.1215 },
            { lat: 33.4805, lng: -112.1205 },
            
            // Another cluster of incidents
            { lat: 33.3800, lng: -111.9800 },
            { lat: 33.3810, lng: -111.9810 },
            { lat: 33.3820, lng: -111.9820 },
            { lat: 33.3815, lng: -111.9815 },
            { lat: 33.3805, lng: -111.9805 },
            
            // Third cluster of incidents
            { lat: 33.5100, lng: -112.0200 },
            { lat: 33.5110, lng: -112.0210 },
            { lat: 33.5120, lng: -112.0220 },
            { lat: 33.5115, lng: -112.0215 },
            { lat: 33.5105, lng: -112.0205 }
        ]
    };
    
    // Clear existing data
    stationMarkers.forEach(marker => map.removeLayer(marker));
    stationLayers.forEach(layer => map.removeLayer(layer));
    stationMarkers = [];
    stationLayers = [];
    
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
    
    // Add test stations
    testData.stations.forEach(station => {
        addStationMarker(station.name, station.lat, station.lng);
    });
    
    // Add test incidents to the map as a heatmap
    const heatmapPoints = testData.incidents.map(incident => [incident.lat, incident.lng, 1]);
    incidentData = testData.incidents.map(incident => ({
        latitude: incident.lat,
        longitude: incident.lng
    }));
    
    // Create heatmap
    if (typeof L.heatLayer === 'function') {
        heatmapLayer = L.heatLayer(heatmapPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 5,
            gradient: {0.4: 'blue', 0.65: 'lime', 0.85: 'yellow', 1.0: 'red'}
        }).addTo(map);
    }
    
    // Fit map to include all test data
    const bounds = new L.LatLngBounds();
    testData.stations.forEach(station => bounds.extend([station.lat, station.lng]));
    testData.incidents.forEach(incident => bounds.extend([incident.lat, incident.lng]));
    map.fitBounds(bounds);
    
    // Update UI to match test setup
    document.getElementById('stationsToAdd').value = 3;
    document.getElementById('responseTimeTarget').value = 4;
    document.getElementById('turnoutTimeSelect').value = "1.0";
    document.getElementById('travelSpeedSelect').value = "urban-med";
    
    // Generate a simple boundary around all points
    const allPoints = [
        ...testData.stations.map(station => [station.lat, station.lng]),
        ...testData.incidents.map(incident => [incident.lat, incident.lng])
    ];
    
    // Calculate the boundary
    const minLat = Math.min(...allPoints.map(p => p[0])) - 0.1;
    const maxLat = Math.max(...allPoints.map(p => p[0])) + 0.1;
    const minLng = Math.min(...allPoints.map(p => p[1])) - 0.1;
    const maxLng = Math.max(...allPoints.map(p => p[1])) + 0.1;
    
    // Create a polygon for the boundary
    const boundaryCoords = [
        [minLat, minLng],
        [minLat, maxLng],
        [maxLat, maxLng],
        [maxLat, minLng],
        [minLat, minLng]
    ];
    
    // Create GeoJSON for the boundary
    jurisdictionBoundary = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",
            coordinates: [boundaryCoords.map(coord => [coord[1], coord[0]])]
        }
    };
    
    // Clear existing boundary
    boundaryLayer.clearLayers();
    
    // Add boundary to map
    L.geoJSON(jurisdictionBoundary, {
        style: {
            color: '#3388ff',
            weight: 3,
            opacity: 0.7,
            fillOpacity: 0.1
        }
    }).addTo(boundaryLayer);
    
    // Run station suggestion algorithm
    suggestNewLocations();
    
    console.log("Test completed! Check the suggested stations and their distribution.");
}

// This function can be called from the browser console to run the test
window.runStationSuggestionTest = testStationSuggestion;

// Log instructions when the script loads
console.log("Coverage Gap Finder test script loaded.");
console.log("To run the station suggestion algorithm test, open your browser console and type: runStationSuggestionTest()");