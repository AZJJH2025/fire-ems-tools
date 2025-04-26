/**
 * This script generates random incident data for testing the Coverage Gap Finder
 * It creates a realistic pattern of incidents with multiple clusters in different areas
 */

function generateRandomIncidents(count = 200, centerLat = 33.4500, centerLng = -112.0730, radiusMiles = 10) {
    const incidents = [];
    
    // Create several clusters of incidents
    const clusters = [
        { center: [centerLat, centerLng], weight: 0.3, radius: radiusMiles * 0.3 },
        { center: [centerLat + 0.1, centerLng - 0.1], weight: 0.15, radius: radiusMiles * 0.2 },
        { center: [centerLat - 0.1, centerLng + 0.1], weight: 0.15, radius: radiusMiles * 0.25 },
        { center: [centerLat + 0.2, centerLng + 0.15], weight: 0.1, radius: radiusMiles * 0.15 },
        { center: [centerLat - 0.15, centerLng - 0.2], weight: 0.1, radius: radiusMiles * 0.2 },
    ];
    
    // Rest are random within the general area
    const randomWeight = 1 - clusters.reduce((sum, cluster) => sum + cluster.weight, 0);
    
    // Convert miles to approximate lat/lng degrees
    const latDegPerMile = 1/69;
    const lngDegPerMile = 1/54.6; // Approximate for this latitude
    
    const incidentTypes = ['Medical', 'Fire', 'Traffic', 'Hazmat', 'Rescue'];
    const priorities = ['High', 'Medium', 'Low'];
    
    // Generate incidents for each cluster
    for (let i = 0; i < count; i++) {
        // Determine which cluster this incident belongs to (or if it's random)
        let randomValue = Math.random();
        let runningTotal = 0;
        let chosenCluster = null;
        
        for (const cluster of clusters) {
            runningTotal += cluster.weight;
            if (randomValue < runningTotal) {
                chosenCluster = cluster;
                break;
            }
        }
        
        let lat, lng;
        
        if (chosenCluster) {
            // Generate a point in this cluster
            const r = cluster.radius * Math.sqrt(Math.random()); // Square root for uniform distribution
            const theta = Math.random() * 2 * Math.PI;
            
            // Convert polar to cartesian coordinates
            const offsetLat = r * Math.cos(theta) * latDegPerMile;
            const offsetLng = r * Math.sin(theta) * lngDegPerMile;
            
            lat = chosenCluster.center[0] + offsetLat;
            lng = chosenCluster.center[1] + offsetLng;
        } else {
            // Generate a random point in the general area
            const r = radiusMiles * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            
            const offsetLat = r * Math.cos(theta) * latDegPerMile;
            const offsetLng = r * Math.sin(theta) * lngDegPerMile;
            
            lat = centerLat + offsetLat;
            lng = centerLng + offsetLng;
        }
        
        // Create the incident object
        const incident = {
            incident_id: `TEST${i.toString().padStart(4, '0')}`,
            incident_type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
            latitude: lat,
            longitude: lng,
            timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 90 days
            priority: priorities[Math.floor(Math.random() * priorities.length)]
        };
        
        incidents.push(incident);
    }
    
    return incidents;
}

function downloadIncidentsAsCSV(incidents) {
    // Convert incidents to CSV
    let csv = 'incident_id,incident_type,latitude,longitude,timestamp,priority\n';
    
    incidents.forEach(incident => {
        csv += `${incident.incident_id},${incident.incident_type},${incident.latitude},${incident.longitude},${incident.timestamp},${incident.priority}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'test_incidents.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Expose these functions to the window object so they can be called from the console
window.generateTestIncidents = function(count = 200) {
    const incidents = generateRandomIncidents(count);
    console.log(`Generated ${incidents.length} test incidents`);
    return incidents;
};

window.downloadTestIncidents = function(count = 200) {
    const incidents = generateRandomIncidents(count);
    downloadIncidentsAsCSV(incidents);
    console.log(`Downloaded ${incidents.length} test incidents as CSV`);
};

// Log instructions when the script loads
console.log("Test incident data generator loaded. To use:");
console.log("1. Open the browser console");
console.log("2. Type: window.downloadTestIncidents(200) to generate and download 200 test incidents");
console.log("3. Upload the downloaded CSV file to test the Coverage Gap Finder");