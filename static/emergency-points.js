/**
 * Direct implementation for displaying emergency incident points on a map
 * This is a fallback for when the heatmap doesn't work
 */

function displayEmergencyPoints(map, points, maxPoints = 1000) {
    console.log("displayEmergencyPoints called with", points.length, "points");
    
    // Create a layer group for the points
    const pointsLayer = L.layerGroup();
    
    // Determine how many points to show (use a sample for large datasets)
    const pointsToShow = points.length > maxPoints ? 
        points.slice(0, maxPoints) : points;
    
    console.log(`Displaying ${pointsToShow.length} emergency points on map`);
    
    // Add each point to the layer
    pointsToShow.forEach((point, index) => {
        try {
            // Extract lat/lng from point array [lat, lng, intensity]
            const lat = point[0];
            const lng = point[1];
            
            // Create a circle marker
            const marker = L.circleMarker([lat, lng], {
                radius: 4,
                fillColor: '#ff0000',
                color: '#900',
                weight: 1,
                opacity: 0.7,
                fillOpacity: 0.7,
                className: 'incident-point'
            });
            
            // Add to layer group
            pointsLayer.addLayer(marker);
            
            // Only add popups to a small subset to avoid memory issues
            if (index % 50 === 0) {
                marker.bindPopup(`Emergency Incident<br>Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            }
        } catch(e) {
            console.error("Error adding point:", e);
        }
    });
    
    // Add layer to map
    pointsLayer.addTo(map);
    console.log("Emergency points layer added to map");
    
    return pointsLayer;
}

// Export the function
window.displayEmergencyPoints = displayEmergencyPoints;