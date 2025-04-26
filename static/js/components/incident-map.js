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
    console.log(`Initializing map in container: ${containerId}`);
    
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
    
    // Register this component as loaded
    if (window.registerComponent) {
        window.registerComponent('map');
    }
    
    console.log("Map component initialized successfully");
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
    console.log("Setting location from map:", lat, lng);
    
    // Update form fields
    const latInput = document.getElementById("location-latitude");
    const lngInput = document.getElementById("location-longitude");
    
    if (latInput && lngInput) {
        latInput.value = lat.toFixed(6);
        lngInput.value = lng.toFixed(6);
        console.log("Updated form fields:", latInput.value, lngInput.value);
    } else {
        console.error("Latitude or longitude input field not found");
    }
    
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
    
    // Show loading state
    const locationBtn = document.getElementById('current-location-btn');
    if (locationBtn) {
        locationBtn.disabled = true;
        locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    navigator.geolocation.getCurrentPosition(
        // Success callback
        function(position) {
            // Reset button state
            if (locationBtn) {
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Current Location';
            }
            
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setLocationFromMap(lat, lng);
            showToast("Location updated.", "success");
        },
        // Error callback
        function(error) {
            // Reset button state
            if (locationBtn) {
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Current Location';
            }
            
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
        },
        // Options
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/**
 * Geocode an address to get coordinates
 * Exposed as global function for coordination between modules
 */
// Define a local showToast function if it doesn't exist globally
function localShowToast(message, type) {
    console.log(`Toast message (${type}): ${message}`);
    // Check if global showToast exists
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Fallback alert for critical messages
        if (type === 'error') {
            alert(message);
        }
    }
}

function geocodeAddress() {
    console.log("Map component geocodeAddress function called");
    const address = document.getElementById("location-address").value;
    
    if (!address) {
        localShowToast("Please enter an address to geocode.", "error");
        return;
    }
    
    // Show loading state
    const geocodeBtn = document.getElementById('geocode-btn');
    if (geocodeBtn) {
        geocodeBtn.disabled = true;
        geocodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    localShowToast("Geocoding address...", "info");
    
    // Use Nominatim (OpenStreetMap) geocoding service instead of Google Maps
    // Add a random component to avoid caching issues
    const timestamp = new Date().getTime();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&_=${timestamp}`;
    
    fetch(url, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'FireEMS-Tool/1.0' // Nominatim requires a user agent
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Reset button state
        if (geocodeBtn) {
            geocodeBtn.disabled = false;
            geocodeBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Geocode';
        }
        
        console.log("Nominatim geocode results:", data);
        
        if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            
            console.log("Map component: Geocoding successful. Lat:", lat, "Lng:", lng);
            
            // Update form fields directly
            const latInput = document.getElementById("location-latitude");
            const lngInput = document.getElementById("location-longitude");
            
            if (latInput && lngInput) {
                latInput.value = lat.toFixed(6);
                lngInput.value = lng.toFixed(6);
                console.log("Form fields updated with coordinates:", latInput.value, lngInput.value);
            } else {
                console.error("Could not find latitude or longitude input fields");
            }
            
            // Also use the map update function to add a marker
            try {
                setLocationFromMap(lat, lng);
            } catch (e) {
                console.error("Error updating map:", e);
            }
            
            localShowToast("Address geocoded successfully.", "success");
        } else {
            console.error("Geocoding failed: No results found");
            localShowToast("Failed to geocode address. No results found for this address.", "error");
        }
    })
    .catch(error => {
        console.error("Error in map geocoding:", error);
        if (geocodeBtn) {
            geocodeBtn.disabled = false;
            geocodeBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Geocode';
        }
        localShowToast("Error geocoding address: " + error.message, "error");
    });
}

// Expose function globally for coordination
window.mapGeocode = geocodeAddress;

/**
 * Reverse geocode coordinates to get address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function reverseGeocode(lat, lng) {
    try {
        console.log("Reverse geocoding coordinates:", lat, lng);
        
        // Use Nominatim for reverse geocoding
        const timestamp = new Date().getTime();
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&_=${timestamp}`;
        
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'FireEMS-Tool/1.0' // Nominatim requires a user agent
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Nominatim reverse geocode result:", data);
            
            if (data && data.display_name) {
                // Update address field
                const addressInput = document.getElementById("location-address");
                if (addressInput) {
                    addressInput.value = data.display_name;
                    console.log("Address field updated with:", data.display_name);
                } else {
                    console.error("Could not find address input field");
                }
            } else {
                console.error("Reverse geocoding failed: No results found");
            }
        })
        .catch(error => {
            console.error("Error in reverse geocoding:", error);
        });
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
    }
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
