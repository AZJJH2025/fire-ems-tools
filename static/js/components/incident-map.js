/**
 * FireEMS.ai Incident Logger - Map Component
 * 
 * This component handles map-related functionality for the Incident Logger.
 */

// Map instance and marker globals
let map = null;
let marker = null;
let defaultLocation = [33.4484, -112.0740]; // Phoenix, AZ

/**
 * Get color based on density value
 * @param {number} value - The density value
 * @returns {string} - Color code
 */
function getDensityColor(value) {
    // Using FireEMS.ai map visualization colors
    if (value < 0.25) {
        return '#a6cee3'; // Low density (light blue)
    } else if (value < 0.5) {
        return '#6495ed'; // Medium density (medium blue)
    } else if (value < 0.75) {
        return '#1f4eb0'; // High density (dark blue)
    } else {
        return '#d73027'; // Critical density (red)
    }
}

/**
 * Initialize the map in the specified container
 * @param {string} containerId - The ID of the map container element
 */
function initializeMap(containerId) {
    // If map already exists, destroy it first
    if (map) {
        map.remove();
        map = null;
    }
    
    // Create map with default location
    map = L.map(containerId).setView(defaultLocation, 13);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add click event to map for setting location
    map.on('click', function(e) {
        setLocationFromMap(e.latlng.lat, e.latlng.lng);
    });
    
    // Force map to recalculate its size
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

/**
 * Update the map based on the current form values
 */
function updateMap() {
    if (!map) return;
    
    // Get coordinate values from form
    const lat = document.getElementById("location-latitude").value;
    const lng = document.getElementById("location-longitude").value;
    
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        // Update map view
        map.setView([lat, lng], 15);
        
        // Update or create marker
        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng]).addTo(map);
        }
    } else {
        // No valid coordinates, remove marker if it exists
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }
    
    // Force map to recalculate its size
    map.invalidateSize();
}

/**
 * Set location coordinates from map click
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function setLocationFromMap(lat, lng) {
    // Update form fields
    document.getElementById("location-latitude").value = lat.toFixed(6);
    document.getElementById("location-longitude").value = lng.toFixed(6);
    
    // Update or create marker
    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }
    
    // Attempt reverse geocoding to get address
    reverseGeocode(lat, lng);
}

/**
 * Get user's current location
 */
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showToast("Geolocation is not supported by your browser.", "error");
        return;
    }
    
    showToast("Getting your current location...", "info");
    
    navigator.geolocation.getCurrentPosition(
        // Success callback
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setLocationFromMap(lat, lng);
            showToast("Location updated.", "success");
        },
        // Error callback
        function(error) {
            let errorMessage = "Unable to retrieve your location.";
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Location access was denied.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Location request timed out.";
                    break;
            }
            
            showToast(errorMessage, "error");
        }
    );
}

/**
 * Geocode an address to get coordinates
 */
function geocodeAddress() {
    const address = document.getElementById("location-address").value;
    
    if (!address) {
        showToast("Please enter an address to geocode.", "error");
        return;
    }
    
    showToast("Geocoding address...", "info");
    
    // Use Nominatim for geocoding (rate limits apply)
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                
                setLocationFromMap(lat, lng);
                showToast("Address geocoded successfully.", "success");
            } else {
                showToast("No results found for this address.", "warning");
            }
        })
        .catch(error => {
            console.error("Geocoding error:", error);
            showToast("Error geocoding address. Please try again.", "error");
        });
}

/**
 * Reverse geocode coordinates to get address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function reverseGeocode(lat, lng) {
    // Use Nominatim for reverse geocoding (rate limits apply)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                document.getElementById("location-address").value = data.display_name;
            }
        })
        .catch(error => {
            console.error("Reverse geocoding error:", error);
        });
}

/**
 * Load location from incident data
 * @param {Object} incident - The incident data object
 */
function loadLocationFromIncident(incident) {
    if (!incident || !incident.location) return;
    
    // Set address
    if (incident.location.address) {
        document.getElementById("location-address").value = incident.location.address;
    }
    
    // Set coordinates
    if (incident.location.latitude && incident.location.longitude) {
        document.getElementById("location-latitude").value = incident.location.latitude;
        document.getElementById("location-longitude").value = incident.location.longitude;
    }
    
    // Set notes
    if (incident.location.notes) {
        document.getElementById("location-notes").value = incident.location.notes;
    }
    
    // Update map
    updateMap();
}
