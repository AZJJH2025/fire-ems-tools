/**
 * Visualization script for the station suggestion algorithm
 * This shows how the algorithm is scoring potential locations
 */

// Create a visualization of the algorithm's scoring process
function visualizeAlgorithmScoring() {
    // Clear any previous visualization
    if (window.scoringVisualization) {
        map.removeLayer(window.scoringVisualization);
    }
    
    // Get coverage parameters from the UI
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
    const METERS_PER_MILE = 1609.34;
    const radiusInMeters = (travelTime / 60) * travelSpeed * METERS_PER_MILE;
    const radiusInMiles = radiusInMeters / METERS_PER_MILE;
    
    // Generate a grid of points to visualize
    const gridPoints = [];
    const mapBounds = map.getBounds();
    const south = mapBounds.getSouth();
    const north = mapBounds.getNorth();
    const west = mapBounds.getWest();
    const east = mapBounds.getEast();
    
    // Calculate grid cell size - about 100 cells across the visible map
    const gridSize = (east - west) / 25;
    
    // Generate grid points
    for (let lat = south; lat <= north; lat += gridSize) {
        for (let lng = west; lng <= east; lng += gridSize) {
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
            let areaScore = 5; // Base area score
            
            // Population score - simplified approach
            // In a real implementation, we'd use census data
            // For this demo, we'll assume higher population in the center
            const centerLat = (south + north) / 2;
            const centerLng = (west + east) / 2;
            
            // Distance from center (0-1 scale)
            const centerDistance = Math.sqrt(
                Math.pow((lat - centerLat) / (north - south), 2) + 
                Math.pow((lng - centerLng) / (east - west), 2)
            );
            
            // Population score decreases with distance from center
            populationScore = 10 * (1 - centerDistance);
            
            // Incident score - based on nearby uncovered incidents
            if (incidentData && incidentData.length > 0) {
                // Count incidents within coverage radius with distance weighting
                let nearbyIncidents = 0;
                let weightedIncidentValue = 0;
                
                incidentData.forEach(incident => {
                    if (!incident.latitude || !incident.longitude) return;
                    
                    const incidentLat = parseFloat(incident.latitude);
                    const incidentLng = parseFloat(incident.longitude);
                    
                    if (isNaN(incidentLat) || isNaN(incidentLng)) return;
                    
                    // Skip if this incident is already covered by existing stations
                    let alreadyCovered = false;
                    for (const station of stationMarkers) {
                        const stationLat = station.data.latitude;
                        const stationLng = station.data.longitude;
                        const distanceToStation = turf.distance(
                            turf.point([incidentLng, incidentLat]), 
                            turf.point([stationLng, stationLat]), 
                            {units: 'miles'}
                        );
                        
                        if (distanceToStation <= radiusInMiles) {
                            alreadyCovered = true;
                            break;
                        }
                    }
                    
                    if (alreadyCovered) return;
                    
                    const distance = turf.distance(
                        turf.point([lng, lat]),
                        turf.point([incidentLng, incidentLat]),
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
                if (nearbyIncidents > 0) {
                    const avgValue = weightedIncidentValue / nearbyIncidents;
                    
                    // Base score on number of covered incidents
                    const countFactor = Math.min(1, nearbyIncidents / 10); // Saturates at 10 incidents
                    
                    // Combine count and weighted value for final score
                    incidentScore = 20 * countFactor * avgValue;
                }
            }
            
            // Get selected optimization target
            const target = document.getElementById('optimizationTarget').value;
            
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
            
            // Create a score point
            gridPoints.push({
                lat: lat,
                lng: lng,
                score: totalScore,
                populationScore: populationScore,
                incidentScore: incidentScore,
                areaScore: areaScore
            });
        }
    }
    
    // Color function to map score to color
    function getColor(score) {
        // Normalize score to 0-1 range
        // Find max score
        const maxScore = Math.max(...gridPoints.map(p => p.score));
        const normalizedScore = score / maxScore;
        
        // Color scale: blue (low) -> green -> yellow -> red (high)
        if (normalizedScore < 0.25) {
            return `rgb(0, 0, ${Math.round(255 * (1 - normalizedScore * 4))})`;
        } else if (normalizedScore < 0.5) {
            return `rgb(0, ${Math.round(255 * ((normalizedScore - 0.25) * 4))}, 255)`;
        } else if (normalizedScore < 0.75) {
            return `rgb(${Math.round(255 * ((normalizedScore - 0.5) * 4))}, 255, 0)`;
        } else {
            return `rgb(255, ${Math.round(255 * (1 - (normalizedScore - 0.75) * 4))}, 0)`;
        }
    }
    
    // Create a GeoJSON feature collection for visualization
    const features = gridPoints.map(point => {
        return {
            type: 'Feature',
            properties: {
                score: point.score,
                color: getColor(point.score),
                populationScore: point.populationScore,
                incidentScore: point.incidentScore,
                areaScore: point.areaScore
            },
            geometry: {
                type: 'Point',
                coordinates: [point.lng, point.lat]
            }
        };
    });
    
    // Create the layer and add to map
    window.scoringVisualization = L.geoJSON({
        type: 'FeatureCollection',
        features: features
    }, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 5,
                fillColor: feature.properties.color,
                color: 'white',
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup(`
                <strong>Score: ${feature.properties.score.toFixed(1)}</strong><br>
                Population: ${feature.properties.populationScore.toFixed(1)}<br>
                Incidents: ${feature.properties.incidentScore.toFixed(1)}<br>
                Area: ${feature.properties.areaScore.toFixed(1)}
            `);
        }
    }).addTo(map);
    
    // Add a legend
    if (window.scoringLegend) {
        map.removeControl(window.scoringLegend);
    }
    
    window.scoringLegend = L.control({position: 'bottomright'});
    
    window.scoringLegend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.border = '1px solid #ccc';
        
        div.innerHTML = `
            <h4 style="margin-top: 0; margin-bottom: 8px;">Score Legend</h4>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <div style="width: 20px; height: 20px; background-color: rgb(0, 0, 255); margin-right: 5px;"></div>
                <span>Low</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <div style="width: 20px; height: 20px; background-color: rgb(0, 255, 0); margin-right: 5px;"></div>
                <span>Medium</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <div style="width: 20px; height: 20px; background-color: rgb(255, 255, 0); margin-right: 5px;"></div>
                <span>High</span>
            </div>
            <div style="display: flex; align-items: center;">
                <div style="width: 20px; height: 20px; background-color: rgb(255, 0, 0); margin-right: 5px;"></div>
                <span>Very High</span>
            </div>
            <p style="margin-top: 8px; margin-bottom: 0; font-size: 0.8em;">
                Based on: ${document.getElementById('optimizationTarget').options[document.getElementById('optimizationTarget').selectedIndex].text}
            </p>
        `;
        
        return div;
    };
    
    window.scoringLegend.addTo(map);
    
    console.log(`Visualization created with ${gridPoints.length} points`);
}

// Function to toggle the visualization on/off
function toggleAlgorithmVisualization() {
    if (window.scoringVisualization) {
        map.removeLayer(window.scoringVisualization);
        window.scoringVisualization = null;
        
        if (window.scoringLegend) {
            map.removeControl(window.scoringLegend);
            window.scoringLegend = null;
        }
        
        return false;
    } else {
        visualizeAlgorithmScoring();
        return true;
    }
}

// This function can be called from the browser console
window.visualizeAlgorithmScoring = visualizeAlgorithmScoring;
window.toggleAlgorithmVisualization = toggleAlgorithmVisualization;

console.log("Algorithm visualization script loaded.");
console.log("To visualize the scoring algorithm, open your browser console and type: visualizeAlgorithmScoring()");