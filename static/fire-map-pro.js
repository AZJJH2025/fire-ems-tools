/**
 * FireMapPro - Advanced interactive map creator for fire department and EMS planning
 * Copyright (c) 2025 FireEMS.ai
 */

// Global variables
let map;
let drawnItems;
let drawControl;
let measurementLayer;
let activeImageOverlay;
let customDataLayers = {};
let searchControl;
let measurementActive = false;

// Initialize the map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing FireMapPro...');
    
    try {
        // Create the map
        initializeMap();
        console.log('Map initialized');
        
        // Set up event listeners
        setupEventListeners();
        console.log('Event listeners set up');
        
        // Initialize tools
        initializeDrawingTools();
        console.log('Drawing tools initialized');
        
        initializeSearchControl();
        console.log('Search control initialized');
        
        // Initialize CSV settings
        initializeCSVSettings();
        console.log('CSV settings initialized');
        
        // Check if buttons have event listeners
        console.log('Checking button event listeners:');
        ['draw-tool', 'search-tool', 'filter-tool', 'export-tool', 'icon-tool', 'clear-map'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`Button ${id} found in DOM`);
                // Add a test click handler to verify event binding
                element.addEventListener('click', function() {
                    console.log(`Button ${id} was clicked`);
                });
            } else {
                console.error(`Button ${id} not found in DOM`);
            }
        });
        
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

/**
 * Initialize the Leaflet map with base layers
 */
function initializeMap() {
    console.log('Initializing FireMapPro map using pattern from Station Overview...');
    
    // Completely rewrite the map initialization using the working pattern from Station Overview
    // Check if Leaflet is available
    if (typeof L !== 'undefined') {
        try {
            console.log('Leaflet library available, creating map');
            
            // Create the street layer first for initial map display
            window.streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            });
            
            // Create map with street layer
            map = L.map('map', {
                zoomControl: true,      // Ensures zoom controls are visible
                scrollWheelZoom: true,  // Enables mouse wheel zoom
                doubleClickZoom: true,  // Enables double click zoom
                dragging: true,         // Enables dragging
                layers: [window.streetLayer]   // Start with the street layer
            }).setView([39.8283, -98.5795], 4);  // Center of the US
            
            console.log('Map created with street layer');
            
            // Note: Satellite and terrain layers will be created on demand when needed
            
            console.log('Map instance created successfully with Street layer');
            
            // Add zoom controls explicitly in top right
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            
            // Add a scale control
            L.control.scale().addTo(map);
            
            // Create a layer for drawn items
            drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);
            
            // Create a layer for measurement tools
            measurementLayer = new L.FeatureGroup();
            map.addLayer(measurementLayer);
            
            // Create a layer for custom icons
            iconLayer = new L.FeatureGroup();
            map.addLayer(iconLayer);
            
            // Set up drawing controls if Leaflet.Draw is available
            if (typeof L.Control.Draw !== 'undefined') {
                console.log('Leaflet.Draw is available, setting up draw controls');
                const drawOptions = {
                    position: 'topright',
                    draw: {
                        polyline: {
                            shapeOptions: {
                                color: '#f357a1',
                                weight: 3
                            }
                        },
                        polygon: {
                            allowIntersection: false,
                            drawError: {
                                color: '#e1e100',
                                message: '<strong>Warning!</strong> Shape cannot intersect itself'
                            },
                            shapeOptions: {
                                color: '#3388ff',
                                weight: 3
                            }
                        },
                        circle: {
                            shapeOptions: {
                                color: '#662d91',
                                fillOpacity: 0.2
                            }
                        },
                        marker: true,
                        rectangle: {
                            shapeOptions: {
                                color: '#ffa500',
                                weight: 2
                            }
                        }
                    },
                    edit: {
                        featureGroup: drawnItems,
                        remove: true
                    }
                };
                
                drawControl = new L.Control.Draw(drawOptions);
                console.log('Draw control created successfully');
                
                // Set up event handlers for drawn items
                map.on(L.Draw.Event.CREATED, function(e) {
                    console.log('Draw event created');
                    
                    // Add the layer to the map
                    const layer = e.layer;
                    drawnItems.addLayer(layer);
                    
                    // If measurement mode is active, display the measurement
                    if (measurementActive) {
                        if (e.layerType === 'polyline') {
                            // For lines, calculate length
                            const length = calculateLength(layer);
                            console.log(`Line measurement: ${length.toFixed(2)} km`);
                            layer.bindPopup(`Length: ${length.toFixed(2)} km`).openPopup();
                        } else if (e.layerType === 'polygon' || e.layerType === 'rectangle') {
                            // For polygons and rectangles, calculate area
                            const area = calculateArea(layer);
                            console.log(`Area measurement: ${area.toFixed(2)} km²`);
                            layer.bindPopup(`Area: ${area.toFixed(2)} km²`).openPopup();
                        } else if (e.layerType === 'circle') {
                            // For circles, calculate radius and area
                            const radius = layer.getRadius() / 1000; // Convert to km
                            const area = Math.PI * radius * radius;
                            console.log(`Circle radius: ${radius.toFixed(2)} km, area: ${area.toFixed(2)} km²`);
                            layer.bindPopup(`Radius: ${radius.toFixed(2)} km<br>Area: ${area.toFixed(2)} km²`).openPopup();
                        }
                    }
                });
            } else {
                console.warn('Leaflet.Draw library not loaded, drawing tools will not be available');
            }
            
            // Initialize measurement-related variables
            measurementActive = false;
            
            // Set up coordinate display
            map.on('mousemove', function(e) {
                const coordElement = document.getElementById('coordinate-values');
                if (coordElement) {
                    coordElement.innerHTML = `Lat: ${e.latlng.lat.toFixed(5)}, Lng: ${e.latlng.lng.toFixed(5)}`;
                }
            });
            
            // Force map to recalculate size using multiple timeouts (ensures it works)
            setTimeout(function() {
                map.invalidateSize(true);
                console.log('Map size invalidated (500ms)');
            }, 500);
            
            setTimeout(function() {
                map.invalidateSize(true);
                console.log('Map size invalidated (1000ms)');
            }, 1000);
            
            setTimeout(function() {
                map.invalidateSize(true);
                console.log('Map size invalidated (2000ms)');
            }, 2000);
            
            console.log('Map initialization complete');
            
            // Make sure the radio buttons reflect the current base layer
            document.querySelector('input[name="base-layer"][value="street"]').checked = true;
            
        } catch (error) {
            console.error('Error creating map:', error);
        }
    } else {
        console.error("Leaflet library not loaded");
        alert("Map library not loaded. Please refresh the page and try again.");
    }
}

/**
 * Set up all event listeners for the UI
 */
function setupEventListeners() {
    // Base layer radio buttons - simplified and improved
    console.log('Setting up base layer radio button listeners');
    
    // Direct and simplified approach with a robust event binding
    function setupMapLayerRadioButtons() {
        // Get all radio buttons and set up their event handlers
        document.querySelectorAll('input[name="base-layer"]').forEach(radio => {
            // Print what we found to help debug
            console.log(`Found radio button: ${radio.id}, value: ${radio.value}`);
            
            // Remove any existing handlers first to avoid duplicates
            radio.removeEventListener('change', handleLayerChange);
            radio.removeEventListener('click', handleLayerChange);
            
            // Add fresh handlers for both events
            radio.addEventListener('change', handleLayerChange);
            radio.addEventListener('click', handleLayerChange);
        });
        
        console.log('Successfully set up all layer radio buttons');
    }
    
    // The actual handler function 
    function handleLayerChange(event) {
        const value = event.target.value;
        console.log(`Layer radio changed: id=${event.target.id}, value=${value}`);
        
        if (value === 'street') {
            setBaseLayer('street');
        } else if (value === 'satellite') {
            setBaseLayer('satellite');
        } else if (value === 'terrain') {
            setBaseLayer('terrain');
        }
    }
    
    // Run the setup
    setupMapLayerRadioButtons();
    
    // Also set a global click detector as a fail-safe backup
    document.addEventListener('click', function(event) {
        // If a radio button with name="base-layer" was clicked
        if (event.target.type === 'radio' && event.target.name === 'base-layer') {
            console.log(`Global detector caught radio button click: ${event.target.id}`);
            handleLayerChange(event);
        }
    });
    
    // Ensure street layer is initially selected
    document.getElementById('street-layer').checked = true;
    
    // Overlay checkboxes
    document.getElementById('stations-layer').addEventListener('change', function() {
        toggleOverlayLayer('stations', this.checked);
    });
    
    document.getElementById('incidents-layer').addEventListener('change', function() {
        toggleOverlayLayer('incidents', this.checked);
    });
    
    document.getElementById('response-layer').addEventListener('change', function() {
        toggleOverlayLayer('response', this.checked);
    });
    
    document.getElementById('population-layer').addEventListener('change', function() {
        toggleOverlayLayer('population', this.checked);
    });
    
    document.getElementById('hydrants-layer').addEventListener('change', function() {
        toggleOverlayLayer('hydrants', this.checked);
    });
    
    // File upload event listeners
    document.getElementById('geojson-upload').addEventListener('change', function(e) {
        handleFileUpload(e.target.files[0], 'geojson');
    });
    
    document.getElementById('csv-upload').addEventListener('change', function(e) {
        handleFileUpload(e.target.files[0], 'csv');
    });
    
    document.getElementById('image-upload').addEventListener('change', function(e) {
        handleFileUpload(e.target.files[0], 'image');
    });
    
    // Tool buttons event listeners
    try {
        let btn = document.getElementById('draw-tool');
        if (!btn) {
            console.error('Draw tool button (with ID draw-tool) not found in DOM');
            return;
        }
        
        btn.addEventListener('click', function() {
            console.log('Draw tool clicked');
            toggleDrawControls();
            toggleToolActive('draw-tool');
        });
        console.log('Draw tool event listener attached successfully');
    } catch (error) {
        console.error('Error attaching draw tool event listener:', error);
    }
    
    try {
        let btn = document.getElementById('search-tool');
        if (!btn) {
            console.error('Search tool button not found in DOM');
        } else {
            btn.addEventListener('click', function() {
                console.log('Search tool clicked');
                togglePanel('search-container');
                toggleToolActive('search-tool');
            });
            console.log('Search tool event listener attached successfully');
        }
    } catch (error) {
        console.error('Error attaching search tool event listener:', error);
    }
    
    try {
        let btn = document.getElementById('filter-tool');
        if (!btn) {
            console.error('Filter tool button not found in DOM');
        } else {
            btn.addEventListener('click', function() {
                console.log('Filter tool clicked');
                togglePanel('filter-container');
                toggleToolActive('filter-tool');
            });
            console.log('Filter tool event listener attached successfully');
        }
    } catch (error) {
        console.error('Error attaching filter tool event listener:', error);
    }
    
    try {
        let btn = document.getElementById('export-tool');
        if (!btn) {
            console.error('Export tool button not found in DOM');
        } else {
            btn.addEventListener('click', function() {
                console.log('Export tool clicked');
                togglePanel('export-container');
                toggleToolActive('export-tool');
            });
            console.log('Export tool event listener attached successfully');
        }
    } catch (error) {
        console.error('Error attaching export tool event listener:', error);
    }
    
    try {
        let btn = document.getElementById('icon-tool');
        if (!btn) {
            console.error('Icon tool button not found in DOM');
        } else {
            btn.addEventListener('click', function() {
                console.log('Icon tool clicked, toggling icon panel');
                togglePanel('icon-container');
                toggleToolActive('icon-tool');
                
                // Initialize drag and drop functionality if it hasn't been set up yet
                if (!window.dragDropInitialized) {
                    console.log('Initializing drag and drop functionality');
                    initializeDragAndDrop();
                    window.dragDropInitialized = true;
                } else {
                    console.log('Drag and drop already initialized');
                }
                
                // Ensure map is properly sized and visible
                setTimeout(function() {
                    if (map) {
                        map.invalidateSize();
                        console.log('Map size invalidated after icon tool click');
                    }
                }, 200);
            });
            console.log('Icon tool event listener attached successfully');
        }
    } catch (error) {
        console.error('Error attaching icon tool event listener:', error);
    }
    
    try {
        let btn = document.getElementById('clear-map');
        if (!btn) {
            console.error('Clear map button not found in DOM');
        } else {
            btn.addEventListener('click', function() {
                console.log('Clear map clicked');
                clearMap();
            });
            console.log('Clear map event listener attached successfully');
        }
    } catch (error) {
        console.error('Error attaching clear map event listener:', error);
    }
    
    // Search functionality
    document.getElementById('search-btn').addEventListener('click', function() {
        searchAddress();
    });
    
    document.getElementById('address-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchAddress();
        }
    });
    
    // Filter functionality
    document.getElementById('apply-filter').addEventListener('click', function() {
        applyFilters();
    });
    
    document.getElementById('reset-filter').addEventListener('click', function() {
        resetFilters();
    });
    
    // Export functionality
    document.getElementById('export-pdf').addEventListener('click', function() {
        exportMap('pdf');
    });
    
    document.getElementById('export-png').addEventListener('click', function() {
        exportMap('png');
    });
    
    document.getElementById('export-geojson').addEventListener('click', function() {
        exportMap('geojson');
    });
    
    // Icon color change
    document.getElementById('icon-color').addEventListener('change', function() {
        // Update the color of the icons in the palette to match selected color
        const selectedColor = this.value;
        document.querySelectorAll('.draggable-icon i').forEach(icon => {
            icon.style.color = selectedColor;
        });
    });
}

/**
 * Initialize Leaflet.Draw tools - completely rewritten for reliability
 */
function initializeDrawingTools() {
    console.log('Initializing drawing tools with direct approach');
    
    try {
        // Safety check for Leaflet.Draw
        if (typeof L === 'undefined') {
            console.error('Leaflet not available');
            return;
        }
        
        if (typeof L.Control.Draw === 'undefined') {
            console.error('Leaflet.Draw not available - script may not be loaded');
            
            // Add the script dynamically as a fallback
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
            script.onload = function() {
                console.log('Leaflet.Draw loaded dynamically');
                setTimeout(setupDrawControls, 500);
            };
            document.head.appendChild(script);
            
            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
            document.head.appendChild(css);
            
            return;
        }
        
        setupDrawControls();
    } catch (error) {
        console.error('Error in drawing tools initialization:', error);
    }
    
    function setupDrawControls() {
        console.log('Setting up draw controls');
        
        // Initialize the drawnItems layer if not already done
        if (!drawnItems) {
            drawnItems = new L.FeatureGroup();
            if (map) {
                map.addLayer(drawnItems);
                console.log('Created and added drawn items layer to map');
            } else {
                console.error('Map not ready for drawn items layer');
                return;
            }
        }
        
        // Initialize measurement layer if not already done
        if (!measurementLayer) {
            measurementLayer = new L.FeatureGroup();
            if (map) {
                map.addLayer(measurementLayer);
                console.log('Created and added measurement layer to map');
            }
        }
        
        // Define draw options
        const drawOptions = {
            position: 'topright',
            draw: {
                polyline: {
                    shapeOptions: {
                        color: '#1976d2',
                        weight: 3
                    },
                    metric: true
                },
                polygon: {
                    allowIntersection: false,
                    drawError: {
                        color: '#e1e100',
                        message: '<strong>Error:</strong> Shape edges cannot cross!'
                    },
                    shapeOptions: {
                        color: '#1976d2',
                        weight: 3
                    }
                },
                circle: {
                    shapeOptions: {
                        color: '#1976d2'
                    },
                    metric: true
                },
                rectangle: {
                    shapeOptions: {
                        color: '#1976d2'
                    }
                },
                marker: {
                    icon: createCustomMarkerIcon('fire-station', '#1976d2')
                }
            },
            edit: {
                featureGroup: drawnItems,
                poly: {
                    allowIntersection: false
                }
            }
        };
        
        // Create the control
        drawControl = new L.Control.Draw(drawOptions);
        console.log('Draw control created successfully');
        
        // Set up event handlers
        map.on(L.Draw.Event.CREATED, function(e) {
            console.log('Draw event created:', e.layerType);
            
            const layer = e.layer;
            
            // Attach type property for filtering
            layer.options.type = e.layerType;
            
            // For measurement display
            if (measurementActive) {
                console.log('Adding to measurement layer - measurement mode active');
                attachMeasurementPopup(layer, e.layerType);
                measurementLayer.addLayer(layer);
                updateMeasurementDisplay(layer, e.layerType);
            } else {
                console.log('Adding to drawn items layer - regular drawing mode');
                // Add popup for regular drawn items
                attachInfoPopup(layer, e.layerType);
                drawnItems.addLayer(layer);
            }
        });
        
        // Edit events
        map.on(L.Draw.Event.EDITED, function(e) {
            console.log('Draw event edited');
            const layers = e.layers;
            layers.eachLayer(function(layer) {
                if (measurementActive && measurementLayer.hasLayer(layer)) {
                    updateMeasurementDisplay(layer, layer.options.type);
                }
            });
        });
        
        // Delete events
        map.on(L.Draw.Event.DELETED, function(e) {
            console.log('Draw event deleted');
            const layers = e.layers;
            let measurementRemoved = false;
            
            layers.eachLayer(function(layer) {
                if (measurementLayer.hasLayer(layer)) {
                    measurementRemoved = true;
                }
            });
            
            if (measurementRemoved && measurementLayer.getLayers().length === 0) {
                hideMeasurementInfo();
            }
        });
    }
    
    console.log('Draw tools initialization complete');
}

/**
 * Initialize search control for geocoding
 */
function initializeSearchControl() {
    // Create a basic geocoding search control
    searchControl = new L.Control.Search({
        url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        propertyLoc: ['lat', 'lon'],
        marker: L.circleMarker([0, 0], {radius: 8}),
        autoCollapse: true,
        autoType: false,
        minLength: 2,
        zoom: 12
    });
    
    // Add to map (but hidden initially)
    map.addControl(searchControl);
    document.querySelector('.leaflet-control-search').style.display = 'none';
}

/**
 * Create a custom marker icon
 * @param {string} type - The type of marker
 * @param {string} color - The color of the marker
 * @returns {L.DivIcon} - The custom icon
 */
function createCustomMarkerIcon(type, color) {
    // Get icon class based on type
    let iconClass = 'fa-map-marker-alt';
    
    switch (type) {
        case 'fire-station':
            iconClass = 'fa-fire-extinguisher';
            break;
        case 'hospital':
            iconClass = 'fa-hospital';
            break;
        case 'ambulance':
            iconClass = 'fa-ambulance';
            break;
        case 'police':
            iconClass = 'fa-shield-alt';
            break;
        case 'hydrant':
            iconClass = 'fa-tint';
            break;
        case 'school':
            iconClass = 'fa-school';
            break;
        case 'building':
            iconClass = 'fa-building';
            break;
        case 'landmark':
            iconClass = 'fa-landmark';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            break;
        case 'biohazard':
            iconClass = 'fa-biohazard';
            break;
        case 'marker':
            iconClass = 'fa-map-marker-alt';
            break;
        case 'target':
            iconClass = 'fa-crosshairs';
            break;
        case 'incident':
            iconClass = 'fa-exclamation-triangle';
            break;
    }
    
    // Create a div icon with centered anchor point for more accurate placement
    return L.divIcon({
        html: `<div class="custom-marker" style="background-color:${color}"><i class="fas ${iconClass}"></i></div>`,
        className: '',
        iconSize: [30, 30],
        // Fix the anchor point to be in the CENTER of the icon (not at the bottom)
        // This makes the icon appear exactly where it was dropped
        iconAnchor: [15, 15],  // Center of the 30x30 icon
        popupAnchor: [0, -15]  // Position popup above the icon
    });
}

/**
 * Set the active base layer - completely rewritten for reliability
 * @param {string} layerName - The name of the layer to set
 */
function setBaseLayer(layerName) {
    console.log(`Direct layer switch to: ${layerName}`);
    
    try {
        // Safety check
        if (!map) {
            console.error('Map not initialized yet');
            return;
        }
        
        // Create base layers on demand if they don't exist
        if (!window.streetLayer) {
            window.streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            });
            console.log('Created street layer');
        }
        
        if (!window.satelliteLayer) {
            window.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Imagery &copy; Esri',
                maxZoom: 19
            });
            console.log('Created satellite layer');
        }
        
        if (!window.terrainLayer) {
            window.terrainLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
                maxZoom: 18
            });
            console.log('Created terrain layer');
        }
        
        // Remove all base layers first
        if (window.streetLayer && map.hasLayer(window.streetLayer)) {
            map.removeLayer(window.streetLayer);
            console.log('Removed street layer');
        }
        
        if (window.satelliteLayer && map.hasLayer(window.satelliteLayer)) {
            map.removeLayer(window.satelliteLayer);
            console.log('Removed satellite layer');
        }
        
        if (window.terrainLayer && map.hasLayer(window.terrainLayer)) {
            map.removeLayer(window.terrainLayer);
            console.log('Removed terrain layer');
        }
        
        // Now add the requested layer
        if (layerName.toLowerCase() === 'street') {
            map.addLayer(window.streetLayer);
            document.getElementById('street-layer').checked = true;
            console.log('Added street layer and set radio button');
        } 
        else if (layerName.toLowerCase() === 'satellite') {
            map.addLayer(window.satelliteLayer);
            document.getElementById('satellite-layer').checked = true;
            console.log('Added satellite layer and set radio button');
        }
        else if (layerName.toLowerCase() === 'terrain') {
            map.addLayer(window.terrainLayer);
            document.getElementById('terrain-layer').checked = true;
            console.log('Added terrain layer and set radio button');
        }
        else {
            console.error(`Unknown layer name: ${layerName}`);
            return;
        }
        
        // Force map redraw
        setTimeout(() => {
            map.invalidateSize(true);
            console.log('Map size invalidated after layer change');
        }, 100);
        
    } catch (error) {
        console.error('Error in setBaseLayer:', error);
        alert('There was an error changing the map layer. Please try again.');
    }
}

/**
 * Toggle an overlay layer
 * @param {string} layerName - The name of the layer to toggle
 * @param {boolean} visible - Whether the layer should be visible
 */
function toggleOverlayLayer(layerName, visible) {
    // If we don't have this layer loaded yet, fetch it
    if (!customDataLayers[layerName]) {
        // In a real implementation, this would fetch data from the server
        fetchOverlayData(layerName);
        return;
    }
    
    // Toggle the layer visibility
    if (visible) {
        map.addLayer(customDataLayers[layerName]);
    } else {
        map.removeLayer(customDataLayers[layerName]);
    }
}

/**
 * Fetch overlay data from the server
 * @param {string} layerName - The name of the layer to fetch
 */
function fetchOverlayData(layerName) {
    // For demo purposes, create some sample data
    const statusElement = document.getElementById('upload-status');
    statusElement.textContent = `Loading ${layerName} data...`;
    statusElement.className = '';
    
    // Simulate an API call with a timeout
    setTimeout(function() {
        let layer;
        
        switch (layerName) {
            case 'stations':
                layer = createSampleStationsLayer();
                break;
            case 'incidents':
                layer = createSampleIncidentsLayer();
                break;
            case 'response':
                layer = createSampleResponseAreasLayer();
                break;
            case 'population':
                layer = createSamplePopulationLayer();
                break;
            case 'hydrants':
                layer = createSampleHydrantsLayer();
                break;
            default:
                statusElement.textContent = `Unknown layer type: ${layerName}`;
                statusElement.className = 'error-message';
                return;
        }
        
        // Store and add the layer
        customDataLayers[layerName] = layer;
        map.addLayer(layer);
        
        // Update status
        statusElement.textContent = `${capitalizeFirstLetter(layerName)} layer loaded successfully.`;
        statusElement.className = 'success-message';
        
        // Ensure the corresponding checkbox is checked
        document.getElementById(`${layerName}-layer`).checked = true;
    }, 1000);
}

/**
 * Handle file uploads
 * @param {File} file - The uploaded file
 * @param {string} type - The type of file ('geojson', 'csv', 'image')
 */
function handleFileUpload(file, type) {
    if (!file) return;
    
    const statusElement = document.getElementById('upload-status');
    statusElement.textContent = `Reading ${file.name}...`;
    statusElement.className = '';
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Save file content for potential reuse (important for CSV preview)
            window.lastFileContent = e.target.result;
            window.lastFileName = file.name;
            window.lastFileType = type;
            
            switch (type) {
                case 'geojson':
                    loadGeoJSON(e.target.result, file.name);
                    break;
                case 'csv':
                    // For CSV files, add a preview step based on user preference
                    const showPreview = document.getElementById('csv-preview-enable') && 
                                       document.getElementById('csv-preview-enable').checked;
                    
                    if (showPreview) {
                        previewCSV(e.target.result, file.name);
                    } else {
                        loadCSV(e.target.result, file.name);
                    }
                    break;
                case 'image':
                    loadImageOverlay(e.target.result, file.name);
                    break;
            }
            
            if (type !== 'csv' || !document.getElementById('csv-preview-enable') || 
                !document.getElementById('csv-preview-enable').checked) {
                statusElement.textContent = `${file.name} loaded successfully.`;
                statusElement.className = 'success-message';
            }
        } catch (error) {
            console.error('Error loading file:', error);
            statusElement.textContent = `Error loading file: ${error.message}`;
            statusElement.className = 'error-message';
        }
    };
    
    reader.onerror = function() {
        statusElement.textContent = 'Error reading file.';
        statusElement.className = 'error-message';
    };
    
    if (type === 'image') {
        reader.readAsDataURL(file);
    } else {
        reader.readAsText(file);
    }
}

/**
 * Preview CSV data in a modal and set up load button
 * @param {string} content - The CSV content
 * @param {string} filename - The name of the file
 */
function previewCSV(content, filename) {
    console.log(`Previewing CSV file: ${filename}`);
    
    // Get coordinate format preference
    const coordFormat = document.getElementById('csv-coord-format') ? 
                        document.getElementById('csv-coord-format').value : 
                        'lat_lng';
    
    // Get header detection preference
    const detectHeaders = document.getElementById('csv-header-detection') ? 
                         document.getElementById('csv-header-detection').checked : 
                         true;
    
    // Parse CSV
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    
    // Find lat/lon columns
    let latIndex = -1;
    let lngIndex = -1;
    
    if (detectHeaders) {
        headers.forEach((header, index) => {
            const headerLower = header.toLowerCase().trim();
            if (headerLower === 'latitude' || headerLower === 'lat' || headerLower === 'y') {
                latIndex = index;
            }
            if (headerLower === 'longitude' || headerLower === 'lon' || headerLower === 'lng' || headerLower === 'x') {
                lngIndex = index;
            }
        });
    } else {
        // Assume the first two columns are coordinates
        latIndex = 0;
        lngIndex = 1;
    }
    
    if (latIndex === -1 || lngIndex === -1) {
        throw new Error('Could not find latitude and longitude columns in CSV.');
    }
    
    // Determine which columns contain which coordinate based on the format setting
    let latDisplay, lngDisplay, latColumnName, lngColumnName;
    if (coordFormat === 'lat_lng') {
        latColumnName = headers[latIndex];
        lngColumnName = headers[lngIndex];
        latDisplay = latIndex;
        lngDisplay = lngIndex;
    } else {
        // In lng_lat format, the columns are swapped
        latColumnName = headers[lngIndex];
        lngColumnName = headers[latIndex];
        latDisplay = lngIndex;
        lngDisplay = latIndex;
    }
    
    // Calculate a few sample coordinates to show preview
    const previewCoords = [];
    for (let i = 1; i < Math.min(4, lines.length); i++) {
        if (!lines[i].trim()) continue;
        const columns = lines[i].split(',');
        
        let lat, lng;
        if (coordFormat === 'lat_lng') {
            lat = parseFloat(columns[latIndex]);
            lng = parseFloat(columns[lngIndex]);
        } else {
            lng = parseFloat(columns[latIndex]);
            lat = parseFloat(columns[lngIndex]);
        }
        
        if (!isNaN(lat) && !isNaN(lng)) {
            previewCoords.push([lat, lng]);
        }
    }
    
    // Create a preview modal
    const previewContainer = document.createElement('div');
    previewContainer.className = 'csv-preview-container';
    previewContainer.innerHTML = `
        <div class="csv-preview-content">
            <h3>Preview CSV: ${filename}</h3>
            <div class="coord-format-info">
                <p>Based on your settings:</p>
                <ul>
                    <li>Latitude will be read from: <strong>${latColumnName}</strong> (column ${latDisplay + 1})</li>
                    <li>Longitude will be read from: <strong>${lngColumnName}</strong> (column ${lngDisplay + 1})</li>
                    <li>Coordinate format: <strong>${coordFormat === 'lat_lng' ? 'Latitude, Longitude' : 'Longitude, Latitude'}</strong></li>
                </ul>
                <p>First few coordinates will appear at: ${previewCoords.map(c => `[${c[0].toFixed(5)}, ${c[1].toFixed(5)}]`).join(', ')}</p>
            </div>
            <div class="csv-preview-table-container">
                <table class="csv-preview-table">
                    <thead>
                        <tr>
                            ${headers.map((header, idx) => {
                                let headerClass = '';
                                let headerPrefix = '';
                                
                                if (coordFormat === 'lat_lng') {
                                    if (idx === latIndex) {
                                        headerClass = 'lat-column';
                                        headerPrefix = '📍 Lat: ';
                                    } else if (idx === lngIndex) {
                                        headerClass = 'lng-column';
                                        headerPrefix = '📍 Lng: ';
                                    }
                                } else {
                                    if (idx === latIndex) {
                                        headerClass = 'lng-column';
                                        headerPrefix = '📍 Lng: ';
                                    } else if (idx === lngIndex) {
                                        headerClass = 'lat-column';
                                        headerPrefix = '📍 Lat: ';
                                    }
                                }
                                
                                return `<th class="${headerClass}">${headerPrefix}${header}</th>`;
                            }).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${lines.slice(1, 6).map(line => {
                            const columns = line.split(',');
                            return `<tr>
                                ${columns.map((column, idx) => {
                                    let cellClass = '';
                                    
                                    if (coordFormat === 'lat_lng') {
                                        if (idx === latIndex) cellClass = 'lat-column';
                                        else if (idx === lngIndex) cellClass = 'lng-column';
                                    } else {
                                        if (idx === latIndex) cellClass = 'lng-column';
                                        else if (idx === lngIndex) cellClass = 'lat-column';
                                    }
                                    
                                    return `<td class="${cellClass}">${column}</td>`;
                                }).join('')}
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div class="coordinate-format-section">
                <div class="format-option">
                    <input type="radio" id="preview-format-lat-lng" name="preview-format" value="lat_lng" ${coordFormat === 'lat_lng' ? 'checked' : ''}>
                    <label for="preview-format-lat-lng">Standard: Latitude, Longitude</label>
                </div>
                <div class="format-option">
                    <input type="radio" id="preview-format-lng-lat" name="preview-format" value="lng_lat" ${coordFormat === 'lng_lat' ? 'checked' : ''}>
                    <label for="preview-format-lng-lat">Reversed: Longitude, Latitude (for Phoenix data)</label>
                </div>
            </div>
            <div class="csv-preview-actions">
                <button id="csv-preview-confirm">Load Data</button>
                <button id="csv-preview-cancel">Cancel</button>
            </div>
        </div>
    `;
    
    // Add styles for the preview
    const previewStyles = document.createElement('style');
    previewStyles.textContent = `
        .csv-preview-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .csv-preview-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            max-width: 90%;
            max-height: 90%;
            overflow: auto;
        }
        .csv-preview-content h3 {
            margin-top: 0;
            color: #1976d2;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .coord-format-info {
            background-color: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            border-left: 4px solid #1976d2;
        }
        .coord-format-info p {
            margin: 5px 0;
        }
        .coord-format-info ul {
            margin: 8px 0;
            padding-left: 25px;
        }
        .csv-preview-table-container {
            max-height: 300px;
            overflow: auto;
            margin: 15px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .csv-preview-table {
            width: 100%;
            border-collapse: collapse;
        }
        .csv-preview-table th, .csv-preview-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .csv-preview-table th {
            background-color: #f2f2f2;
            position: sticky;
            top: 0;
        }
        .lat-column {
            background-color: #e3f2fd;
        }
        .lng-column {
            background-color: #ede7f6;
        }
        .coordinate-format-section {
            margin: 15px 0;
            padding: 12px;
            background-color: #fff3e0;
            border-radius: 6px;
            border: 1px solid #ffe0b2;
        }
        .format-option {
            margin: 8px 0;
            display: flex;
            align-items: center;
        }
        .format-option input {
            margin-right: 8px;
        }
        .csv-preview-actions {
            margin-top: 15px;
            text-align: right;
        }
        .csv-preview-actions button {
            padding: 10px 20px;
            margin-left: 10px;
            cursor: pointer;
            border-radius: 4px;
            font-weight: 500;
        }
        #csv-preview-confirm {
            background-color: #1976d2;
            color: white;
            border: none;
        }
        #csv-preview-confirm:hover {
            background-color: #1565c0;
        }
        #csv-preview-cancel {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            color: #333;
        }
        #csv-preview-cancel:hover {
            background-color: #e5e5e5;
        }
    `;
    
    document.head.appendChild(previewStyles);
    document.body.appendChild(previewContainer);
    
    // Add event listeners for the format radio buttons
    document.getElementById('preview-format-lat-lng').addEventListener('change', function() {
        if (this.checked && document.getElementById('csv-coord-format')) {
            document.getElementById('csv-coord-format').value = 'lat_lng';
        }
    });
    
    document.getElementById('preview-format-lng-lat').addEventListener('change', function() {
        if (this.checked && document.getElementById('csv-coord-format')) {
            document.getElementById('csv-coord-format').value = 'lng_lat';
        }
    });
    
    // Add event listeners for buttons
    document.getElementById('csv-preview-confirm').addEventListener('click', function() {
        console.log('CSV preview confirm button clicked - loading data');
        
        // Update the coordinate format based on the preview selection
        const selectedFormat = document.querySelector('input[name="preview-format"]:checked').value;
        if (document.getElementById('csv-coord-format')) {
            document.getElementById('csv-coord-format').value = selectedFormat;
        }
        
        // Store the selected format for subsequent loading
        localStorage.setItem('csv-coord-format', selectedFormat);
        
        // Remove the preview UI
        document.body.removeChild(previewContainer);
        document.head.removeChild(previewStyles);
        
        // Store content and filename for processing
        const contentToProcess = content;
        const filenameToProcess = filename;
        
        // Show loading status
        const statusElement = document.getElementById('upload-status');
        statusElement.innerHTML = `<div class="success-message">Processing ${filenameToProcess}...</div>`;
        
        // Small delay to ensure UI is updated before processing
        setTimeout(() => {
            // Process the file content directly without showing the preview again
            try {
                console.log(`Processing CSV data from ${filenameToProcess} with format ${selectedFormat}`);
                
                // Process the CSV data directly using our processing function
                const pointsAdded = processCSVWithoutPreview(contentToProcess, filenameToProcess);
                statusElement.textContent = `${filenameToProcess} loaded successfully with ${pointsAdded} points.`;
                statusElement.className = 'success-message';
                
            } catch (error) {
                console.error('Error processing CSV after preview:', error);
                statusElement.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
            }
        }, 100);
    });
    
    document.getElementById('csv-preview-cancel').addEventListener('click', function() {
        document.body.removeChild(previewContainer);
        document.head.removeChild(previewStyles);
        document.getElementById('upload-status').textContent = 'CSV loading cancelled.';
        document.getElementById('upload-status').className = '';
    });
}

/**
 * Process CSV data directly without showing preview
 * @param {string} content - The CSV content
 * @param {string} filename - The name of the file
 * @returns {number} - Number of points added to the map
 */
function processCSVWithoutPreview(content, filename) {
    // Parse CSV
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    
    // Get coordinate format preference
    const csvFormat = document.getElementById('csv-coord-format') ? 
                    document.getElementById('csv-coord-format').value : 
                    'lat_lng';
    
    // Get header detection preference
    const detectHeaders = document.getElementById('csv-header-detection') ? 
                         document.getElementById('csv-header-detection').checked : 
                         true;
    
    // Find lat/lon columns
    let latIndex = -1;
    let lngIndex = -1;
    
    if (detectHeaders) {
        headers.forEach((header, index) => {
            const headerLower = header.toLowerCase().trim();
            if (headerLower === 'latitude' || headerLower === 'lat' || headerLower === 'y') {
                latIndex = index;
            }
            if (headerLower === 'longitude' || headerLower === 'lon' || headerLower === 'lng' || headerLower === 'x') {
                lngIndex = index;
            }
        });
    } else {
        // Assume the first two columns are coordinates
        latIndex = 0;
        lngIndex = 1;
    }
    
    if (latIndex === -1 || lngIndex === -1) {
        throw new Error('Could not find latitude and longitude columns in CSV.');
    }
    
    // Create a layer for the CSV data
    const layerName = filename.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    const markers = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const columns = lines[i].split(',');
        
        // Parse coordinates and ensure they're valid numbers
        let lat, lng;
        
        if (csvFormat === 'lat_lng') {
            lat = parseFloat(columns[latIndex]);
            lng = parseFloat(columns[lngIndex]);
        } else {
            // Order is switched for lng_lat format
            lng = parseFloat(columns[latIndex]);
            lat = parseFloat(columns[lngIndex]);
        }
        
        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Skipping row ${i}: Invalid coordinate values`);
            continue;
        }
        
        // Skip invalid coordinates (common errors in data)
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            console.warn(`Skipping invalid coordinates: ${lat}, ${lng} at line ${i}`);
            continue;
        }
        
        // Create popup content with all data
        let popupContent = '<div class="custom-popup"><table>';
        
        headers.forEach((header, index) => {
            if (columns[index]) {
                popupContent += `<tr><td>${header}:</td><td>${columns[index]}</td></tr>`;
            }
        });
        
        popupContent += '</table></div>';
        
        // Create marker
        const marker = L.circleMarker([lat, lng], {
            radius: 6,
            fillColor: '#d32f2f',
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(popupContent);
        
        markers.push(marker);
    }
    
    // Create a layer group
    const layer = L.layerGroup(markers);
    
    // Add to map and store in custom layers
    customDataLayers[layerName] = layer;
    map.addLayer(layer);
    
    // Create a bounds object and fit map to the markers
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds());
    }
    
    return markers.length;
}

/**
 * Load GeoJSON data
 * @param {string} content - The GeoJSON content
 * @param {string} filename - The name of the file
 */
function loadGeoJSON(content, filename) {
    const data = JSON.parse(content);
    
    // Create layer name based on filename
    const layerName = filename.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // Create a GeoJSON layer
    const layer = L.geoJSON(data, {
        style: function(feature) {
            return {
                color: '#1976d2',
                weight: 3,
                opacity: 0.7,
                fillOpacity: 0.2
            };
        },
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#1976d2',
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                let popupContent = '<div class="custom-popup"><table>';
                
                for (const key in feature.properties) {
                    popupContent += `<tr><td>${key}:</td><td>${feature.properties[key]}</td></tr>`;
                }
                
                popupContent += '</table></div>';
                layer.bindPopup(popupContent);
            }
        }
    });
    
    // Add to map and store in custom layers
    customDataLayers[layerName] = layer;
    map.addLayer(layer);
    
    // Fit map to the layer bounds
    map.fitBounds(layer.getBounds());
}

/**
 * Load CSV data with coordinates
 * @param {string} content - The CSV content
 * @param {string} filename - The name of the file
 */
function loadCSV(content, filename) {
    // Check for preview preference
    const showPreview = document.getElementById('csv-preview-enable') && document.getElementById('csv-preview-enable').checked;
    
    if (showPreview && content.split('\n').length > 5) {
        previewCSV(content, filename);
        return;
    }
    
    // Get coordinate format preference
    const coordFormat = document.getElementById('csv-coord-format') ? 
                        document.getElementById('csv-coord-format').value : 
                        'lat_lng';
    
    // Get header detection preference
    const detectHeaders = document.getElementById('csv-header-detection') ? 
                         document.getElementById('csv-header-detection').checked : 
                         true;
    
    // Parse CSV
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    
    // Find lat/lon columns
    let latIndex = -1;
    let lngIndex = -1;
    
    if (detectHeaders) {
        headers.forEach((header, index) => {
            const headerLower = header.toLowerCase().trim();
            if (headerLower === 'latitude' || headerLower === 'lat' || headerLower === 'y') {
                latIndex = index;
            }
            if (headerLower === 'longitude' || headerLower === 'lon' || headerLower === 'lng' || headerLower === 'x') {
                lngIndex = index;
            }
        });
    } else {
        // Assume the first two columns are coordinates
        latIndex = 0;
        lngIndex = 1;
    }
    
    if (latIndex === -1 || lngIndex === -1) {
        throw new Error('Could not find latitude and longitude columns in CSV.');
    }
    
    // Debug info for CSV loading
    console.log(`CSV Loading - Found lat column at index ${latIndex}, lng column at index ${lngIndex}`);
    console.log(`Using coordinate format: ${coordFormat}`);
    
    // Create a layer for the CSV data
    const layerName = filename.split('.')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
    console.log(`Creating layer: ${layerName} from CSV file`);
    
    // Create markers
    const markers = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const columns = lines[i].split(',');
        
        // Parse coordinates and ensure they're valid numbers
        let lat, lng;
        
        if (coordFormat === 'lat_lng') {
            lat = parseFloat(columns[latIndex]);
            lng = parseFloat(columns[lngIndex]);
        } else {
            // Order is switched for lng_lat format
            lng = parseFloat(columns[latIndex]);
            lat = parseFloat(columns[lngIndex]);
        }
        
        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Skipping row ${i}: Invalid coordinate values`);
            continue;
        }
        
        // Skip invalid coordinates (common errors in data)
        if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            console.warn(`Skipping invalid coordinates: ${lat}, ${lng} at line ${i}`);
            continue;
        }
        
        // Debug specific row if needed
        if (i < 5) {
            console.log(`Row ${i}: lat=${lat}, lng=${lng}`);
        }
        
        // Create popup content with all data
        let popupContent = '<div class="custom-popup"><table>';
        
        headers.forEach((header, index) => {
            if (columns[index]) {
                popupContent += `<tr><td>${header}:</td><td>${columns[index]}</td></tr>`;
            }
        });
        
        popupContent += '</table></div>';
        
        // Create marker with [lat, lng] order for Leaflet (this order is always required by Leaflet)
        const marker = L.circleMarker([lat, lng], {
            radius: 6,
            fillColor: '#d32f2f',
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(popupContent);
        
        markers.push(marker);
    }
    
    // Create a layer group - USING THE EXISTING layerName instead of creating a new constant
    const layer = L.layerGroup(markers);
    
    // Add to map and store in custom layers
    customDataLayers[layerName] = layer;
    map.addLayer(layer);
    
    // Create a bounds object and fit map to the markers
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds());
}

/**
 * Load an image overlay
 * @param {string} content - The image content (data URL)
 * @param {string} filename - The name of the file
 */
function loadImageOverlay(content, filename) {
    // Remove any existing image overlay
    if (activeImageOverlay) {
        map.removeLayer(activeImageOverlay);
    }
    
    // Create an image element to get dimensions
    const img = new Image();
    
    img.onload = function() {
        // Calculate aspect ratio
        const aspectRatio = img.width / img.height;
        
        // Create a default bounding box based on the current map view
        const bounds = map.getBounds();
        const center = bounds.getCenter();
        
        // Calculate new bounds based on aspect ratio
        const defaultWidthInDegrees = 0.05; // Approximately 5km
        const defaultHeightInDegrees = defaultWidthInDegrees / aspectRatio;
        
        const newBounds = [
            [center.lat - defaultHeightInDegrees/2, center.lng - defaultWidthInDegrees/2],
            [center.lat + defaultHeightInDegrees/2, center.lng + defaultWidthInDegrees/2]
        ];
        
        // Create the image overlay
        activeImageOverlay = L.imageOverlay(content, newBounds, {
            opacity: 0.7,
            interactive: true
        }).addTo(map);
        
        // Make the overlay resizable
        makeOverlayResizable(activeImageOverlay);
        
        // Fit map to the overlay bounds
        map.fitBounds(newBounds);
    };
    
    img.src = content;
}

/**
 * Make an image overlay resizable
 * @param {L.ImageOverlay} overlay - The image overlay to make resizable
 */
function makeOverlayResizable(overlay) {
    // Add a popup to explain how to resize
    overlay.bindPopup('<div class="custom-popup"><h4>Image Overlay</h4><p>Click and drag corners to resize or reposition this overlay.</p></div>');
    
    // Create resize handles at the corners
    const bounds = overlay.getBounds();
    const nw = bounds.getNorthWest();
    const ne = bounds.getNorthEast();
    const se = bounds.getSouthEast();
    const sw = bounds.getSouthWest();
    
    // Create draggable markers
    const nwMarker = createResizeHandle(nw);
    const neMarker = createResizeHandle(ne);
    const seMarker = createResizeHandle(se);
    const swMarker = createResizeHandle(sw);
    
    // Create a layergroup for handles
    const handles = L.layerGroup([nwMarker, neMarker, seMarker, swMarker]).addTo(map);
    
    // Handle drag events
    function updateOverlay() {
        const newBounds = L.latLngBounds(
            L.latLng(swMarker.getLatLng().lat, swMarker.getLatLng().lng),
            L.latLng(neMarker.getLatLng().lat, neMarker.getLatLng().lng)
        );
        
        overlay.setBounds(newBounds);
        
        // Update the other markers
        nwMarker.setLatLng(L.latLng(neMarker.getLatLng().lat, swMarker.getLatLng().lng));
        seMarker.setLatLng(L.latLng(swMarker.getLatLng().lat, neMarker.getLatLng().lng));
    }
    
    nwMarker.on('drag', updateOverlay);
    neMarker.on('drag', updateOverlay);
    seMarker.on('drag', updateOverlay);
    swMarker.on('drag', updateOverlay);
    
    // Remove handles when overlay is removed
    overlay.on('remove', function() {
        map.removeLayer(handles);
    });
}

/**
 * Create a draggable handle for resizing overlays
 * @param {L.LatLng} latlng - The position of the handle
 * @returns {L.Marker} - The handle marker
 */
function createResizeHandle(latlng) {
    return L.marker(latlng, {
        icon: L.divIcon({
            html: '<div class="resize-handle"></div>',
            className: '',
            iconSize: [10, 10]
        }),
        draggable: true
    });
}

/**
 * Toggle the drawing controls - rewritten for reliability
 */
function toggleDrawControls() {
    console.log('toggleDrawControls called');
    
    try {
        if (!map) {
            console.error('Map is not initialized yet');
            alert('Map is not ready. Please refresh the page and try again.');
            return;
        }
        
        if (!drawControl) {
            console.error('Draw control is not initialized yet');
            
            // Try to initialize it immediately
            initializeDrawingTools();
            
            // Check again
            if (!drawControl) {
                alert('Drawing tools could not be initialized. Please refresh the page and try again.');
                return;
            }
        }
        
        // Check if draw control is already on the map
        const drawControlExists = document.querySelector('.leaflet-draw');
        
        if (drawControlExists) {
            console.log('Removing draw control');
            map.removeControl(drawControl);
            window.measurementActive = false;
            map.drawControlAdded = false;
            hideMeasurementInfo();
            console.log('Draw control removed successfully');
        } else {
            console.log('Adding draw control to map');
            map.addControl(drawControl);
            map.drawControlAdded = true;
            
            // Show a prompt
            let measurementMode = confirm('Do you want to activate measurement mode?\n\nClick OK to measure distances and areas.\nClick Cancel to draw features on the map.');
            
            window.measurementActive = measurementMode;
            console.log('Measurement mode:', measurementMode);
            
            if (window.measurementActive) {
                showMeasurementInfo();
                console.log('Measurement info shown');
            }
            
            console.log('Draw control added successfully');
        }
    } catch (error) {
        console.error('Error in toggleDrawControls:', error);
        alert('An error occurred while toggling the drawing controls. Please try again.');
    }
}

/**
 * Calculate the length of a polyline in kilometers
 * @param {L.Polyline} polyline - The polyline to measure
 * @returns {number} - The length in kilometers
 */
function calculateLength(polyline) {
    try {
        const latlngs = polyline.getLatLngs();
        let totalLength = 0;
        
        for (let i = 1; i < latlngs.length; i++) {
            totalLength += latlngs[i-1].distanceTo(latlngs[i]);
        }
        
        // Convert from meters to kilometers
        return totalLength / 1000;
    } catch (error) {
        console.error('Error calculating length:', error);
        return 0;
    }
}

/**
 * Calculate the area of a polygon in square kilometers
 * @param {L.Polygon} polygon - The polygon to measure
 * @returns {number} - The area in square kilometers
 */
function calculateArea(polygon) {
    try {
        // Use Leaflet's built-in method if available
        if (polygon.getLatLngs && polygon._mRadius) {
            // It's a circle
            const radius = polygon._mRadius / 1000; // Convert to km
            return Math.PI * radius * radius;
        }
        
        // For polygons
        const latlngs = polygon.getLatLngs()[0];
        
        // Simple approximation for small areas
        let area = 0;
        if (latlngs.length > 2) {
            for (let i = 0; i < latlngs.length; i++) {
                const j = (i + 1) % latlngs.length;
                area += latlngs[i].lng * latlngs[j].lat;
                area -= latlngs[j].lng * latlngs[i].lat;
            }
            area = Math.abs(area) * 0.5 * 111.32 * 111.32; // Rough approximation
        }
        
        return area;
    } catch (error) {
        console.error('Error calculating area:', error);
        return 0;
    }
}

// This duplicate has been removed. See the improved implementation at lines ~2926-3008

/**
 * Attach measurement popup to a layer
 * @param {L.Layer} layer - The layer to attach a popup to
 * @param {string} layerType - The type of layer
 */
function attachMeasurementPopup(layer, layerType) {
    console.log(`Attaching measurement popup to ${layerType}`);
    
    let popupContent = '<div class="custom-popup">';
    
    if (layerType === 'polyline') {
        const length = calculateLength(layer);
        popupContent += `<h4>Distance Measurement</h4>
                         <p>${length.toFixed(2)} km</p>`;
    } 
    else if (layerType === 'polygon' || layerType === 'rectangle') {
        const area = calculateArea(layer);
        popupContent += `<h4>Area Measurement</h4>
                         <p>${area.toFixed(2)} km²</p>`;
    } 
    else if (layerType === 'circle') {
        const radius = layer.getRadius() / 1000; // Convert to km
        const area = Math.PI * radius * radius;
        popupContent += `<h4>Circle Measurement</h4>
                         <p>Radius: ${radius.toFixed(2)} km</p>
                         <p>Area: ${area.toFixed(2)} km²</p>`;
    }
    
    popupContent += '<button class="measurement-remove-btn">Remove</button></div>';
    
    layer.bindPopup(popupContent);
    
    // Add event listener when popup opens
    layer.on('popupopen', function() {
        const btn = document.querySelector('.measurement-remove-btn');
        if (btn) {
            btn.addEventListener('click', function() {
                measurementLayer.removeLayer(layer);
                layer.closePopup();
                
                // Hide measurement info if no measurements left
                if (measurementLayer.getLayers().length === 0) {
                    hideMeasurementInfo();
                }
            });
        }
    });
}

/**
 * Attach info popup to a drawn layer
 * @param {L.Layer} layer - The layer to attach a popup to
 * @param {string} layerType - The type of layer
 */
function attachInfoPopup(layer, layerType) {
    console.log(`Attaching info popup to ${layerType}`);
    
    let title = 'Shape';
    
    if (layerType === 'polyline') title = 'Line';
    else if (layerType === 'polygon') title = 'Polygon';
    else if (layerType === 'rectangle') title = 'Rectangle';
    else if (layerType === 'circle') title = 'Circle';
    else if (layerType === 'marker') title = 'Marker';
    
    const popupContent = `
        <div class="custom-popup">
            <h4>${title}</h4>
            <button class="edit-shape-btn">Edit</button>
            <button class="remove-shape-btn">Remove</button>
        </div>
    `;
    
    layer.bindPopup(popupContent);
    
    // Add event listeners when popup opens
    layer.on('popupopen', function() {
        const editBtn = document.querySelector('.edit-shape-btn');
        const removeBtn = document.querySelector('.remove-shape-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', function() {
                layer.closePopup();
                // Trigger edit mode
                if (drawControl) {
                    new L.EditToolbar.Edit(map, {
                        featureGroup: drawnItems
                    }).enable();
                }
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                drawnItems.removeLayer(layer);
                layer.closePopup();
            });
        }
    });
}

/**
 * Update measurement display with values from layer
 * @param {L.Layer} layer - The layer to measure
 * @param {string} layerType - The type of layer
 */
function updateMeasurementDisplay(layer, layerType) {
    console.log(`Updating measurement display for ${layerType}`);
    
    const distanceElement = document.getElementById('distance-value');
    const areaElement = document.getElementById('area-value');
    
    if (!distanceElement || !areaElement) return;
    
    if (layerType === 'polyline') {
        const length = calculateLength(layer);
        distanceElement.textContent = `${length.toFixed(2)} km`;
        areaElement.textContent = '-';
    } 
    else if (layerType === 'polygon' || layerType === 'rectangle') {
        const area = calculateArea(layer);
        distanceElement.textContent = '-';
        areaElement.textContent = `${area.toFixed(2)} km²`;
    } 
    else if (layerType === 'circle') {
        const radius = layer.getRadius() / 1000; // Convert to km
        const area = Math.PI * radius * radius;
        distanceElement.textContent = `${radius.toFixed(2)} km radius`;
        areaElement.textContent = `${area.toFixed(2)} km²`;
    }
}

/**
 * Toggle visibility of a panel
 * @param {string} panelId - The ID of the panel to toggle
 */
function togglePanel(panelId) {
    console.log(`Toggling panel: ${panelId}`);
    
    try {
        // Get the current visible state of the target panel
        const targetPanel = document.getElementById(panelId);
        if (!targetPanel) {
            console.error(`Panel with ID ${panelId} not found`);
            return;
        }
        
        const isCurrentlyVisible = targetPanel.style.display === 'block';
        
        console.log(`Panel ${panelId} visibility status: ${isCurrentlyVisible ? 'visible' : 'hidden'}`);
        
        // Hide all panels first - check the actual panel IDs from HTML
        document.querySelectorAll('.panel, .tool-panel, .tools-section, #icon-container, #search-container, #filter-container, #export-container')
            .forEach(function(panel) {
                panel.style.display = 'none';
                console.log(`Hidden panel: ${panel.id || 'unnamed panel'}`);
            });
        
        // If the clicked panel was already visible, leave all panels hidden (toggle off)
        // If not, make it visible (toggle on)
        if (!isCurrentlyVisible) {
            targetPanel.style.display = 'block';
            console.log(`Shown panel: ${panelId}`);
        } else {
            console.log(`Keeping panel ${panelId} hidden (was previously visible)`);
        }
        
        // Ensure map is properly sized when panels change
        setTimeout(function() {
            if (map) {
                console.log('Invalidating map size after panel toggle');
                map.invalidateSize(true);
            }
        }, 100);
        
        // Invalidate size again after a longer delay to be sure
        setTimeout(function() {
            if (map) {
                console.log('Invalidating map size after panel toggle (delayed)');
                map.invalidateSize(true);
            }
        }, 500);
    } catch (error) {
        console.error(`Error toggling panel ${panelId}:`, error);
    }
}

/**
 * Toggle the active state of a tool button
 * @param {string} toolId - The ID of the tool button
 */
function toggleToolActive(toolId) {
    console.log(`Toggling active state for tool: ${toolId}`);
    
    try {
        // Remove active class from all tool buttons
        document.querySelectorAll('.tool-btn').forEach(function(btn) {
            btn.classList.remove('active');
            console.log(`Removed active class from ${btn.id}`);
        });
        
        // Add active class to the clicked button
        const activeBtn = document.getElementById(toolId);
        if (activeBtn) {
            activeBtn.classList.add('active');
            console.log(`Added active class to ${toolId}`);
        } else {
            console.error(`Button with ID ${toolId} not found`);
        }
    } catch (error) {
        console.error('Error in toggleToolActive:', error);
    }
}

/**
 * Toggle the visibility of a panel
 * @param {string} panelId - The ID of the panel to toggle
 */
function togglePanel(panelId) {
    console.log(`Toggling panel: ${panelId}`);
    
    try {
        // Hide all panels
        const panels = ['search-container', 'filter-container', 'export-container', 'icon-container'];
        
        for (const id of panels) {
            const panel = document.getElementById(id);
            if (panel) {
                panel.style.display = 'none';
                console.log(`Hidden panel: ${id}`);
            } else {
                console.error(`Panel with ID ${id} not found`);
            }
        }
        
        // Show the selected panel
        const selectedPanel = document.getElementById(panelId);
        if (selectedPanel) {
            selectedPanel.style.display = 'block';
            console.log(`Shown panel: ${panelId}`);
        } else {
            console.error(`Selected panel with ID ${panelId} not found`);
        }
        
        // Fix for map visibility - invalidate size after panel toggle
        setTimeout(function() {
            if (map) {
                map.invalidateSize();
                console.log('Map size invalidated after panel toggle');
            } else {
                console.error('Map is not initialized');
            }
        }, 100);
    } catch (error) {
        console.error('Error in togglePanel:', error);
    }
}

/**
 * Initialize drag and drop functionality for icons
 */
function initializeDragAndDrop() {
    // Create a custom layer group for draggable markers
    if (!window.iconLayer) {
        window.iconLayer = L.layerGroup().addTo(map);
    }
    
    // Get all draggable icon elements
    const draggableIcons = document.querySelectorAll('.draggable-icon');
    
    // Set up drag event listeners for each icon
    draggableIcons.forEach(icon => {
        icon.setAttribute('draggable', 'true');
        
        // Drag start event
        icon.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', icon.getAttribute('data-icon'));
            e.dataTransfer.effectAllowed = 'copy';
            
            // Create a simple ghost image
            const ghostImage = document.createElement('div');
            ghostImage.classList.add('drag-ghost');
            ghostImage.innerHTML = `<i class="${icon.querySelector('i').className}"></i>`;
            ghostImage.style.position = 'absolute';
            ghostImage.style.top = '-1000px';
            document.body.appendChild(ghostImage);
            e.dataTransfer.setDragImage(ghostImage, 20, 20);
            
            // Clean up after drag ends
            setTimeout(() => {
                document.body.removeChild(ghostImage);
            }, 0);
        });
    });
    
    // Set up drag events on the map
    const mapContainer = document.getElementById('map');
    
    // Prevent default to allow drop
    mapContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        mapContainer.classList.add('map-drag-over');
    });
    
    // Handle drag leave
    mapContainer.addEventListener('dragleave', function() {
        mapContainer.classList.remove('map-drag-over');
    });
    
    // Handle drop event
    mapContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        mapContainer.classList.remove('map-drag-over');
        
        try {
            // Get the dragged icon type
            const iconType = e.dataTransfer.getData('text/plain');
            console.log(`Icon type being dropped: ${iconType}`);
            
            // Get the color selection
            const iconColor = document.getElementById('icon-color').value;
            
            // Get the precise coordinates of the drop location - IMPROVED CALCULATION
            const mapRect = mapContainer.getBoundingClientRect();
            
            // Calculate exact pixel position within the map container
            const x = e.clientX - mapRect.left;
            const y = e.clientY - mapRect.top;
            
            console.log(`Drop position in pixels - x: ${x}, y: ${y}`);
            console.log(`Map container dimensions - width: ${mapRect.width}, height: ${mapRect.height}`);
            
            // Make sure the coordinates are within the map bounds
            if (x < 0 || x > mapRect.width || y < 0 || y > mapRect.height) {
                console.warn('Drop position outside map bounds, clamping to edges');
            }
            
            // Convert pixel coordinates to map coordinates using Leaflet's containerPointToLatLng
            const point = L.point(x, y);
            const latlng = map.containerPointToLatLng(point);
            
            console.log(`Converted to map coordinates - lat: ${latlng.lat.toFixed(6)}, lng: ${latlng.lng.toFixed(6)}`);
            
            // Create a marker with the icon at the exact drop location
            createCustomMarker(iconType, latlng, iconColor);
            
            // Show a brief feedback message
            const statusElement = document.getElementById('upload-status');
            if (statusElement) {
                statusElement.innerHTML = `<div class="success-message">Icon placed at ${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}</div>`;
                setTimeout(() => {
                    statusElement.innerHTML = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Error during icon drop handling:', error);
            
            // Show error message to user
            const statusElement = document.getElementById('upload-status');
            if (statusElement) {
                statusElement.innerHTML = `<div class="error-message">Error placing icon: ${error.message}</div>`;
                setTimeout(() => {
                    statusElement.innerHTML = '';
                }, 3000);
            }
        }
    });
}

/**
 * Create a custom marker with the specified icon type at the given location
 * @param {string} iconType - The type of icon to use
 * @param {L.LatLng} latlng - The location to place the marker
 * @param {string} iconColor - The color of the icon
 * @returns {L.Marker} - The created marker
 */
function createCustomMarker(iconType, latlng, iconColor) {
    console.log(`Creating marker of type: ${iconType}, at: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}, color: ${iconColor}`);
    
    // Ensure map and iconLayer exist
    if (!map) {
        console.error('Map is not initialized!');
        return null;
    }
    
    if (!window.iconLayer) {
        console.log('Creating new icon layer');
        window.iconLayer = L.layerGroup().addTo(map);
    }
    
    // Create a custom icon
    const icon = createCustomMarkerIcon(iconType, iconColor);
    
    // Create a marker with the icon at the exact coordinates
    // Use the exact latlng value without any offset
    const markerLatLng = L.latLng(latlng.lat, latlng.lng);
    
    // Create marker with precise positioning
    const marker = L.marker(markerLatLng, {
        icon: icon,
        draggable: true,
        autoPan: true,
        zIndexOffset: 1000  // Ensure it appears on top of other markers
    });
    
    // Add a popup with information about the marker
    let title = 'Custom Marker';
    
    // Set title based on icon type
    switch (iconType) {
        case 'fire-station':
            title = 'Fire Station';
            break;
        case 'hospital':
            title = 'Hospital/Medical Facility';
            break;
        case 'ambulance':
            title = 'Ambulance/EMS Unit';
            break;
        case 'police':
            title = 'Police Station';
            break;
        case 'hydrant':
            title = 'Fire Hydrant';
            break;
        case 'school':
            title = 'School';
            break;
        case 'building':
            title = 'Building';
            break;
        case 'landmark':
            title = 'Critical Facility';
            break;
        case 'warning':
            title = 'Warning Point';
            break;
        case 'biohazard':
            title = 'Hazard Area';
            break;
        case 'marker':
            title = 'Location Marker';
            break;
        case 'target':
            title = 'Target Point';
            break;
    }
    
    const popupContent = `
        <div class="custom-popup">
            <h4>${title}</h4>
            <p>Position: ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}</p>
            <button class="remove-marker-btn">Remove</button>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    
    // Handle popup events
    marker.on('popupopen', function(e) {
        // Add event listener to remove button
        const removeButton = document.querySelector('.remove-marker-btn');
        if (removeButton) {
            removeButton.addEventListener('click', function() {
                window.iconLayer.removeLayer(marker);
                map.closePopup();
            });
        }
    });
    
    // Handle drag events
    marker.on('dragstart', function() {
        marker._icon.classList.add('custom-marker-dragging');
    });
    
    marker.on('dragend', function() {
        marker._icon.classList.remove('custom-marker-dragging');
        
        // Update popup content with new position
        const newLatLng = marker.getLatLng();
        const popupContent = `
            <div class="custom-popup">
                <h4>${title}</h4>
                <p>Position: ${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}</p>
                <button class="remove-marker-btn">Remove</button>
            </div>
        `;
        
        marker.setPopupContent(popupContent);
    });
    
    // Add the marker to the custom layer
    window.iconLayer.addLayer(marker);
    
    // Show brief notification
    const uploadStatus = document.getElementById('upload-status');
    if (uploadStatus) {
        uploadStatus.innerHTML = `<div class="success-message">Added ${title} marker to map</div>`;
        setTimeout(() => {
            uploadStatus.innerHTML = '';
        }, 3000);
    }
    
    return marker;
}

/**
 * Clear the map
 */
function clearMap() {
    // Ask for confirmation
    if (!confirm('Are you sure you want to clear all custom features from the map?')) {
        return;
    }
    
    // Clear drawn items
    drawnItems.clearLayers();
    
    // Clear measurement layer
    measurementLayer.clearLayers();
    hideMeasurementInfo();
    
    // Remove image overlay
    if (activeImageOverlay) {
        map.removeLayer(activeImageOverlay);
        activeImageOverlay = null;
    }
    
    // Clear custom icon layer
    if (window.iconLayer) {
        window.iconLayer.clearLayers();
    }
    
    // Clear any custom data layers
    for (const name in customDataLayers) {
        map.removeLayer(customDataLayers[name]);
        document.getElementById(`${name}-layer`).checked = false;
    }
    
    // Show confirmation
    const statusElement = document.getElementById('upload-status');
    statusElement.textContent = 'Map cleared.';
    statusElement.className = 'success-message';
}

/**
 * Search for an address
 */
function searchAddress() {
    const query = document.getElementById('address-search').value.trim();
    
    if (!query) return;
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '<p>Searching...</p>';
    
    // Make a request to the Nominatim API
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                resultsContainer.innerHTML = '<p>No results found.</p>';
                return;
            }
            
            // Populate results
            resultsContainer.innerHTML = '';
            
            data.slice(0, 5).forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = 'search-result';
                resultElement.innerHTML = `<p>${result.display_name}</p>`;
                
                resultElement.addEventListener('click', function() {
                    // Zoom to the location
                    const lat = parseFloat(result.lat);
                    const lon = parseFloat(result.lon);
                    map.setView([lat, lon], 16);
                    
                    // Add a marker
                    const marker = L.marker([lat, lon], {
                        icon: createCustomMarkerIcon('default', '#d32f2f')
                    }).addTo(drawnItems);
                    
                    marker.bindPopup(`<div class="custom-popup"><h4>Search Result</h4><p>${result.display_name}</p></div>`).openPopup();
                });
                
                resultsContainer.appendChild(resultElement);
            });
        })
        .catch(error => {
            console.error('Error searching for address:', error);
            resultsContainer.innerHTML = '<p>Error searching for address.</p>';
        });
}

/**
 * Apply data filters
 */
function applyFilters() {
    // In a real implementation, this would filter data based on UI selections
    alert('Filters would be applied to active data layers.');
}

/**
 * Reset data filters
 */
function resetFilters() {
    // Reset filter form
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-date-start').value = '';
    document.getElementById('filter-date-end').value = '';
    document.getElementById('filter-priority').value = 'all';
    
    // Show confirmation
    alert('Filters have been reset.');
}

/**
 * Export the map
 * @param {string} format - The export format ('pdf', 'png', 'geojson')
 */
function exportMap(format) {
    const statusElement = document.getElementById('upload-status');
    statusElement.textContent = `Preparing ${format.toUpperCase()} export...`;
    statusElement.className = '';
    
    const mapTitle = document.getElementById('export-title').value || 'FireMapPro Export';
    const includeLegend = document.getElementById('include-legend').checked;
    const includeScale = document.getElementById('include-scale').checked;
    
    try {
        switch (format) {
            case 'pdf':
                exportAsPDF(mapTitle, includeLegend, includeScale);
                break;
                
            case 'png':
                exportAsPNG(mapTitle, includeLegend, includeScale);
                break;
                
            case 'geojson':
                exportAsGeoJSON();
                break;
        }
    } catch (error) {
        console.error(`Error exporting as ${format}:`, error);
        statusElement.textContent = `Error exporting as ${format}: ${error.message}`;
        statusElement.className = 'error-message';
    }
}

/**
 * Export the map as a PDF
 * @param {string} title - The map title
 * @param {boolean} includeLegend - Whether to include the legend
 * @param {boolean} includeScale - Whether to include the scale
 */
function exportAsPDF(title, includeLegend, includeScale) {
    html2canvas(document.getElementById('map'), {
        useCORS: true,
        allowTaint: true,
        logging: false
    }).then(canvas => {
        // Create PDF
        const pdf = new jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'mm'
        });
        
        // Add title
        pdf.setFontSize(24);
        pdf.text(title, 15, 15);
        
        // Add timestamp
        const date = new Date();
        pdf.setFontSize(10);
        pdf.text(`Generated: ${date.toLocaleString()}`, 15, 25);
        
        // Add map image
        const imgData = canvas.toDataURL('image/jpeg', 0.7);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'JPEG', 15, 30, pdfWidth, pdfHeight);
        
        // Add legend if requested
        if (includeLegend) {
            pdf.setFontSize(14);
            pdf.text('Legend', 15, pdfHeight + 40);
            
            // Add sample legend entries
            pdf.setFontSize(10);
            
            // Show active layers
            let yOffset = pdfHeight + 50;
            for (const name in customDataLayers) {
                if (map.hasLayer(customDataLayers[name])) {
                    pdf.text(`• ${capitalizeFirstLetter(name)}`, 20, yOffset);
                    yOffset += 6;
                }
            }
        }
        
        // Add scale if requested
        if (includeScale) {
            const mapCenter = map.getCenter();
            const zoom = map.getZoom();
            
            pdf.setFontSize(10);
            pdf.text(`Center: ${mapCenter.lat.toFixed(5)}, ${mapCenter.lng.toFixed(5)} | Zoom: ${zoom}`, 15, pdf.internal.pageSize.getHeight() - 10);
        }
        
        // Save the PDF
        pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
        
        // Update status
        document.getElementById('upload-status').textContent = 'PDF export complete.';
        document.getElementById('upload-status').className = 'success-message';
    });
}

/**
 * Export the map as a PNG
 * @param {string} title - The map title
 * @param {boolean} includeLegend - Whether to include the legend
 * @param {boolean} includeScale - Whether to include the scale
 */
function exportAsPNG(title, includeLegend, includeScale) {
    // Create a container for the export
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.top = '-9999px';
    exportContainer.style.left = '-9999px';
    exportContainer.style.width = '1200px';
    exportContainer.style.height = '800px';
    exportContainer.style.backgroundColor = 'white';
    exportContainer.style.padding = '20px';
    
    // Add title
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.margin = '0 0 10px 0';
    exportContainer.appendChild(titleElement);
    
    // Add timestamp
    const timestampElement = document.createElement('p');
    timestampElement.textContent = `Generated: ${new Date().toLocaleString()}`;
    timestampElement.style.margin = '0 0 20px 0';
    timestampElement.style.fontSize = '12px';
    exportContainer.appendChild(timestampElement);
    
    // Clone map container
    const mapContainer = document.createElement('div');
    mapContainer.style.width = '1160px';
    mapContainer.style.height = '650px';
    mapContainer.style.border = '1px solid #ddd';
    exportContainer.appendChild(mapContainer);
    
    document.body.appendChild(exportContainer);
    
    // Create a new Leaflet map in the container
    const exportMap = L.map(mapContainer, {
        center: map.getCenter(),
        zoom: map.getZoom(),
        attributionControl: false,
        zoomControl: false
    });
    
    // Add base layer
    for (const name in window.baseLayers) {
        if (map.hasLayer(window.baseLayers[name])) {
            L.tileLayer(window.baseLayers[name]._url, window.baseLayers[name].options).addTo(exportMap);
            break;
        }
    }
    
    // Add other visible layers
    // This is a simplified approach - a complete solution would need to handle all layer types
    for (const name in customDataLayers) {
        if (map.hasLayer(customDataLayers[name])) {
            try {
                const clonedLayer = L.geoJSON(customDataLayers[name].toGeoJSON()).addTo(exportMap);
            } catch (e) {
                console.warn(`Could not clone layer ${name}`, e);
            }
        }
    }
    
    // Add drawn items
    L.geoJSON(drawnItems.toGeoJSON()).addTo(exportMap);
    
    // Add measurement layer
    L.geoJSON(measurementLayer.toGeoJSON()).addTo(exportMap);
    
    // Add legend if requested
    if (includeLegend) {
        const legendElement = document.createElement('div');
        legendElement.style.marginTop = '20px';
        
        const legendTitle = document.createElement('h3');
        legendTitle.textContent = 'Legend';
        legendTitle.style.margin = '0 0 10px 0';
        legendElement.appendChild(legendTitle);
        
        // Add active layers to legend
        const layersList = document.createElement('ul');
        layersList.style.margin = '0';
        layersList.style.padding = '0 0 0 20px';
        
        for (const name in customDataLayers) {
            if (map.hasLayer(customDataLayers[name])) {
                const item = document.createElement('li');
                item.textContent = capitalizeFirstLetter(name);
                layersList.appendChild(item);
            }
        }
        
        legendElement.appendChild(layersList);
        exportContainer.appendChild(legendElement);
    }
    
    // Add scale if requested
    if (includeScale) {
        const scaleElement = document.createElement('div');
        scaleElement.style.marginTop = '10px';
        scaleElement.style.fontSize = '12px';
        
        const mapCenter = map.getCenter();
        const zoom = map.getZoom();
        
        scaleElement.textContent = `Center: ${mapCenter.lat.toFixed(5)}, ${mapCenter.lng.toFixed(5)} | Zoom: ${zoom}`;
        exportContainer.appendChild(scaleElement);
    }
    
    // Wait for tiles to load
    setTimeout(function() {
        // Use html2canvas to capture the export container
        html2canvas(exportContainer, {
            useCORS: true,
            allowTaint: true,
            logging: false
        }).then(canvas => {
            // Create download link
            const link = document.createElement('a');
            link.download = `${title.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Clean up
            document.body.removeChild(exportContainer);
            
            // Update status
            document.getElementById('upload-status').textContent = 'PNG export complete.';
            document.getElementById('upload-status').className = 'success-message';
        });
    }, 1000); // Wait for map to render
}

/**
 * Export the map data as GeoJSON
 */
function exportAsGeoJSON() {
    // Create a GeoJSON collection
    const collection = {
        type: 'FeatureCollection',
        features: []
    };
    
    // Add drawn items
    const drawnFeatures = drawnItems.toGeoJSON().features;
    collection.features = collection.features.concat(drawnFeatures);
    
    // Add measurement items
    const measurementFeatures = measurementLayer.toGeoJSON().features;
    collection.features = collection.features.concat(measurementFeatures);
    
    // Add layers that support GeoJSON export
    for (const name in customDataLayers) {
        if (map.hasLayer(customDataLayers[name])) {
            try {
                const layerFeatures = customDataLayers[name].toGeoJSON().features;
                collection.features = collection.features.concat(layerFeatures);
            } catch (e) {
                console.warn(`Could not export layer ${name} as GeoJSON`, e);
            }
        }
    }
    
    // Create a download link
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(collection, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'fire_map_pro_export.geojson');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    // Update status
    document.getElementById('upload-status').textContent = 'GeoJSON export complete.';
    document.getElementById('upload-status').className = 'success-message';
}

/**
 * Attach a popup with measurement information to a layer
 * @param {L.Layer} layer - The layer to attach the popup to
 * @param {string} type - The type of layer
 */
function attachMeasurementPopup(layer, type) {
    let popupContent = '<div class="custom-popup"><h4>Measurement</h4>';
    
    switch (type) {
        case 'polyline':
            const distanceMiles = calculatePolylineDistance(layer);
            popupContent += `<p>Distance: ${distanceMiles.toFixed(2)} miles</p>`;
            break;
            
        case 'polygon':
        case 'rectangle':
            const areaMiles = calculatePolygonArea(layer);
            popupContent += `<p>Area: ${areaMiles.toFixed(2)} sq miles</p>`;
            break;
            
        case 'circle':
            const radius = layer.getRadius();
            const radiusMiles = radius / METERS_PER_MILE;
            const areaMilesCircle = Math.PI * Math.pow(radiusMiles, 2);
            popupContent += `<p>Radius: ${radiusMiles.toFixed(2)} miles</p>`;
            popupContent += `<p>Area: ${areaMilesCircle.toFixed(2)} sq miles</p>`;
            break;
    }
    
    popupContent += '</div>';
    layer.bindPopup(popupContent);
}

/**
 * Attach an information popup to a layer
 * @param {L.Layer} layer - The layer to attach the popup to
 * @param {string} type - The type of layer
 */
function attachInfoPopup(layer, type) {
    let popupContent = '<div class="custom-popup">';
    
    switch (type) {
        case 'marker':
            popupContent += `<h4>Marker</h4>`;
            const latlng = layer.getLatLng();
            popupContent += `<p>Latitude: ${latlng.lat.toFixed(5)}</p>`;
            popupContent += `<p>Longitude: ${latlng.lng.toFixed(5)}</p>`;
            break;
            
        case 'polyline':
            popupContent += `<h4>Line</h4>`;
            const distanceMiles = calculatePolylineDistance(layer);
            popupContent += `<p>Distance: ${distanceMiles.toFixed(2)} miles</p>`;
            break;
            
        case 'polygon':
        case 'rectangle':
            popupContent += `<h4>Polygon</h4>`;
            const areaMiles = calculatePolygonArea(layer);
            popupContent += `<p>Area: ${areaMiles.toFixed(2)} sq miles</p>`;
            break;
            
        case 'circle':
            popupContent += `<h4>Circle</h4>`;
            const radius = layer.getRadius();
            const radiusMiles = radius / METERS_PER_MILE;
            const areaMilesCircle = Math.PI * Math.pow(radiusMiles, 2);
            popupContent += `<p>Radius: ${radiusMiles.toFixed(2)} miles</p>`;
            popupContent += `<p>Area: ${areaMilesCircle.toFixed(2)} sq miles</p>`;
            break;
    }
    
    popupContent += '<p><small>Click for additional options</small></p>';
    popupContent += '</div>';
    
    layer.bindPopup(popupContent);
}

/**
 * Calculate the distance of a polyline in miles
 * @param {L.Polyline} polyline - The polyline
 * @returns {number} - The distance in miles
 */
function calculatePolylineDistance(polyline) {
    const latlngs = polyline.getLatLngs();
    let distance = 0;
    
    for (let i = 1; i < latlngs.length; i++) {
        distance += latlngs[i-1].distanceTo(latlngs[i]);
    }
    
    // Convert from meters to miles
    return distance / METERS_PER_MILE;
}

/**
 * Calculate the area of a polygon in square miles
 * @param {L.Polygon} polygon - The polygon
 * @returns {number} - The area in square miles
 */
function calculatePolygonArea(polygon) {
    // Convert polygon to GeoJSON
    const geojson = polygon.toGeoJSON();
    
    // Calculate area using Turf.js
    const area = turf.area(geojson);
    
    // Convert from square meters to square miles
    return area / (METERS_PER_MILE * METERS_PER_MILE);
}

/**
 * Update the measurement display with a layer's measurements
 * @param {L.Layer} layer - The layer to measure
 * @param {string} type - The type of layer
 */
function updateMeasurementDisplay(layer, type) {
    try {
        // Make sure the measurement panel is visible
        const infoPanel = document.getElementById('measurement-info');
        if (!infoPanel) {
            console.error('Measurement info panel not found');
            showMeasurementInfo(); // Try to create it
        } else {
            infoPanel.style.display = 'block';
        }

        // Update distance measurement
        if (type === 'polyline') {
            const distanceMiles = calculatePolylineDistance(layer);
            const distanceValue = document.getElementById('distance-value');
            const distanceMeasurement = document.getElementById('distance-measurement');
            
            if (distanceValue) {
                distanceValue.textContent = distanceMiles.toFixed(2);
            }
            
            if (distanceMeasurement) {
                distanceMeasurement.style.display = 'block';
            }
        } else {
            const distanceMeasurement = document.getElementById('distance-measurement');
            if (distanceMeasurement) {
                distanceMeasurement.style.display = 'none';
            }
        }
        
        // Update area measurement
        if (type === 'polygon' || type === 'rectangle' || type === 'circle') {
            let areaMiles;
            
            if (type === 'circle') {
                const radius = layer.getRadius();
                const radiusMiles = radius / METERS_PER_MILE;
                areaMiles = Math.PI * Math.pow(radiusMiles, 2);
            } else {
                areaMiles = calculatePolygonArea(layer);
            }
            
            const areaValue = document.getElementById('area-value');
            const areaMeasurement = document.getElementById('area-measurement');
            
            if (areaValue) {
                areaValue.textContent = areaMiles.toFixed(2);
            }
            
            if (areaMeasurement) {
                areaMeasurement.style.display = 'block';
            }
        } else {
            const areaMeasurement = document.getElementById('area-measurement');
            if (areaMeasurement) {
                areaMeasurement.style.display = 'none';
            }
        }
        
        console.log('Measurement display updated successfully');
    } catch (error) {
        console.error('Error updating measurement display:', error);
    }
}

/**
 * Show the measurement info panel
 */
function showMeasurementInfo() {
    try {
        // First try to get the panel from the map container (which is the expected location)
        let infoDiv = document.querySelector('#map-container #measurement-info');
        
        if (!infoDiv) {
            // Then try to get it from anywhere in the document
            infoDiv = document.getElementById('measurement-info');
        }
        
        if (!infoDiv) {
            console.log('Creating new measurement info panel');
            // Create panel if it doesn't exist
            infoDiv = document.createElement('div');
            infoDiv.id = 'measurement-info';
            infoDiv.className = 'map-overlay-panel';
            infoDiv.innerHTML = `
                <h4>Measurement</h4>
                <div id="distance-measurement">
                    <strong>Distance:</strong> <span id="distance-value">0</span> miles
                </div>
                <div id="area-measurement">
                    <strong>Area:</strong> <span id="area-value">0</span> sq miles
                </div>
                <button id="exit-measurement" class="btn-close">Close</button>
            `;
            
            // Add to map container
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.appendChild(infoDiv);
            } else {
                // Fallback to adding directly to body
                document.body.appendChild(infoDiv);
            }
            
            // Add event listener for exit button
            const exitBtn = infoDiv.querySelector('#exit-measurement');
            if (exitBtn) {
                exitBtn.addEventListener('click', function() {
                    toggleDrawControls();
                });
            }
        }
        
        // Make sure it's visible
        infoDiv.style.display = 'block';
        console.log('Measurement info panel displayed successfully');
        
        return true;
    } catch (error) {
        console.error('Error showing measurement info:', error);
        return false;
    }
}

/**
 * Hide the measurement info panel
 */
function hideMeasurementInfo() {
    try {
        // First try to get the panel from the map container
        let infoDiv = document.querySelector('#map-container #measurement-info');
        
        if (!infoDiv) {
            // Then try to get it from anywhere in the document
            infoDiv = document.getElementById('measurement-info');
        }
        
        if (infoDiv) {
            // Just hide it rather than removing it
            infoDiv.style.display = 'none';
            console.log('Measurement info panel hidden successfully');
            return true;
        } else {
            console.log('No measurement info panel found to hide');
            return false;
        }
    } catch (error) {
        console.error('Error hiding measurement info:', error);
        return false;
    }
}

// Utility functions

/**
 * Create a sample stations layer
 * @returns {L.LayerGroup} - The stations layer
 */
function createSampleStationsLayer() {
    // Sample fire stations data
    const stations = [
        { name: "Station 1", lat: 39.7392, lng: -104.9903, personnel: 12, engines: 2, ambulances: 1 },
        { name: "Station 2", lat: 39.7489, lng: -104.9490, personnel: 8, engines: 1, ambulances: 1 },
        { name: "Station 3", lat: 39.7340, lng: -105.0203, personnel: 15, engines: 2, ambulances: 2 },
        { name: "Station 4", lat: 39.7654, lng: -104.9852, personnel: 10, engines: 1, ambulances: 1 },
        { name: "Station 5", lat: 39.7192, lng: -104.9605, personnel: 8, engines: 1, ambulances: 1 }
    ];
    
    // Create markers for each station
    const markers = stations.map(station => {
        const marker = L.marker([station.lat, station.lng], {
            icon: createCustomMarkerIcon('fire-station', '#d32f2f')
        });
        
        const popupContent = `
            <div class="custom-popup">
                <h4>${station.name}</h4>
                <table>
                    <tr><td>Personnel:</td><td>${station.personnel}</td></tr>
                    <tr><td>Engines:</td><td>${station.engines}</td></tr>
                    <tr><td>Ambulances:</td><td>${station.ambulances}</td></tr>
                    <tr><td>Location:</td><td>${station.lat.toFixed(5)}, ${station.lng.toFixed(5)}</td></tr>
                </table>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        return marker;
    });
    
    return L.layerGroup(markers);
}

/**
 * Create a sample incidents layer
 * @returns {L.LayerGroup} - The incidents layer
 */
function createSampleIncidentsLayer() {
    // Define a center point and generate incidents around it
    const centerLat = 39.7392;
    const centerLng = -104.9903;
    
    // Types of incidents and their colors
    const incidentTypes = [
        { type: 'Fire', color: '#FF0000' },
        { type: 'Medical', color: '#0000FF' },
        { type: 'Traffic', color: '#FFA500' },
        { type: 'Hazmat', color: '#800080' },
        { type: 'Rescue', color: '#008000' }
    ];
    
    // Generate 50 random incidents
    const incidents = [];
    
    for (let i = 0; i < 50; i++) {
        // Random type
        const typeIndex = Math.floor(Math.random() * incidentTypes.length);
        const type = incidentTypes[typeIndex];
        
        // Random location within ~5km of center
        const lat = centerLat + (Math.random() - 0.5) * 0.05;
        const lng = centerLng + (Math.random() - 0.5) * 0.05;
        
        // Random time in the last 30 days
        const days = Math.floor(Math.random() * 30);
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        const date = new Date();
        date.setDate(date.getDate() - days);
        date.setHours(hours, minutes);
        
        incidents.push({
            id: `INC-${i.toString().padStart(4, '0')}`,
            type: type.type,
            color: type.color,
            lat: lat,
            lng: lng,
            date: date,
            priority: Math.random() < 0.3 ? 'High' : (Math.random() < 0.6 ? 'Medium' : 'Low')
        });
    }
    
    // Create markers for each incident
    const markers = incidents.map(incident => {
        const marker = L.circleMarker([incident.lat, incident.lng], {
            radius: 5,
            fillColor: incident.color,
            color: '#FFFFFF',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        const popupContent = `
            <div class="custom-popup">
                <h4>${incident.type} Incident</h4>
                <table>
                    <tr><td>ID:</td><td>${incident.id}</td></tr>
                    <tr><td>Date:</td><td>${incident.date.toLocaleString()}</td></tr>
                    <tr><td>Priority:</td><td>${incident.priority}</td></tr>
                    <tr><td>Location:</td><td>${incident.lat.toFixed(5)}, ${incident.lng.toFixed(5)}</td></tr>
                </table>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        return marker;
    });
    
    return L.layerGroup(markers);
}

/**
 * Create a sample response areas layer
 * @returns {L.LayerGroup} - The response areas layer
 */
function createSampleResponseAreasLayer() {
    // Sample station locations
    const stations = [
        { name: "Station 1", lat: 39.7392, lng: -104.9903 },
        { name: "Station 2", lat: 39.7489, lng: -104.9490 },
        { name: "Station 3", lat: 39.7340, lng: -105.0203 },
        { name: "Station 4", lat: 39.7654, lng: -104.9852 },
        { name: "Station 5", lat: 39.7192, lng: -104.9605 }
    ];
    
    // Create response area polygons
    const areas = stations.map((station, index) => {
        // Create a rough polygon around the station
        const points = [];
        const radius = 0.015; // ~1.5km
        
        for (let angle = 0; angle < 360; angle += 45) {
            const distortion = 0.5 + Math.random(); // Random distortion factor
            const adjustedRadius = radius * distortion;
            
            const lat = station.lat + adjustedRadius * Math.cos(angle * Math.PI / 180);
            const lng = station.lng + adjustedRadius * Math.sin(angle * Math.PI / 180);
            
            points.push([lat, lng]);
        }
        
        // Close the polygon
        points.push(points[0]);
        
        // Choose color based on index
        const colors = ['#FF5252', '#7C4DFF', '#448AFF', '#69F0AE', '#FFD740'];
        const color = colors[index % colors.length];
        
        const polygon = L.polygon(points, {
            color: color,
            weight: 2,
            opacity: 0.7,
            fillOpacity: 0.3
        });
        
        const popupContent = `
            <div class="custom-popup">
                <h4>${station.name} Response Area</h4>
                <table>
                    <tr><td>Station:</td><td>${station.name}</td></tr>
                </table>
            </div>
        `;
        
        polygon.bindPopup(popupContent);
        return polygon;
    });
    
    return L.layerGroup(areas);
}

/**
 * Create a sample population density layer
 * @returns {L.LayerGroup} - The population density layer
 */
function createSamplePopulationLayer() {
    // Create a grid of population density values
    const centerLat = 39.7392;
    const centerLng = -104.9903;
    const gridSize = 0.01; // ~1km
    const gridExtent = 5; // 5x5 grid
    
    const densitySquares = [];
    
    for (let i = -gridExtent; i <= gridExtent; i++) {
        for (let j = -gridExtent; j <= gridExtent; j++) {
            // Calculate center of this grid cell
            const lat = centerLat + i * gridSize;
            const lng = centerLng + j * gridSize;
            
            // Calculate distance from center (0-1 scale)
            const distance = Math.sqrt(i*i + j*j) / (gridExtent * 1.5);
            
            // Population density decreases with distance from center
            // Add some randomness for variation
            const densityBase = 1 - distance;
            const densityVariation = Math.random() * 0.3 - 0.15; // +/- 15%
            const density = Math.max(0, Math.min(1, densityBase + densityVariation));
            
            // Color based on density (green to red)
            let color;
            if (density < 0.2) {
                color = '#E8F5E9'; // Very light green
            } else if (density < 0.4) {
                color = '#A5D6A7'; // Light green
            } else if (density < 0.6) {
                color = '#FFF59D'; // Light yellow
            } else if (density < 0.8) {
                color = '#FFCC80'; // Light orange
            } else {
                color = '#EF9A9A'; // Light red
            }
            
            // Create a rectangle for this grid cell
            const bounds = [
                [lat - gridSize/2, lng - gridSize/2],
                [lat + gridSize/2, lng + gridSize/2]
            ];
            
            const rectangle = L.rectangle(bounds, {
                color: '#666',
                weight: 1,
                opacity: 0.5,
                fillColor: color,
                fillOpacity: 0.6
            });
            
            // Add a popup with density information
            const popupContent = `
                <div class="custom-popup">
                    <h4>Population Density</h4>
                    <p>Relative Density: ${Math.round(density * 100)}%</p>
                </div>
            `;
            
            rectangle.bindPopup(popupContent);
            densitySquares.push(rectangle);
        }
    }
    
    return L.layerGroup(densitySquares);
}

/**
 * Create a sample hydrants layer
 * @returns {L.LayerGroup} - The hydrants layer
 */
function createSampleHydrantsLayer() {
    // Define a center point and generate hydrants around it
    const centerLat = 39.7392;
    const centerLng = -104.9903;
    
    // Generate 100 random hydrants
    const hydrants = [];
    
    for (let i = 0; i < 100; i++) {
        // Random location within ~5km of center
        const lat = centerLat + (Math.random() - 0.5) * 0.05;
        const lng = centerLng + (Math.random() - 0.5) * 0.05;
        
        // Random flow capacity (GPM)
        const flowCapacity = Math.floor(Math.random() * 1000) + 500;
        
        // Random pressure (PSI)
        const pressure = Math.floor(Math.random() * 50) + 50;
        
        // Status (mostly operational, some out of service)
        const status = Math.random() < 0.9 ? 'Operational' : 'Out of Service';
        
        hydrants.push({
            id: `HYD-${i.toString().padStart(4, '0')}`,
            lat: lat,
            lng: lng,
            flowCapacity: flowCapacity,
            pressure: pressure,
            status: status
        });
    }
    
    // Create markers for each hydrant
    const markers = hydrants.map(hydrant => {
        // Color based on status
        const color = hydrant.status === 'Operational' ? '#2196F3' : '#F44336';
        
        const marker = L.circleMarker([hydrant.lat, hydrant.lng], {
            radius: 3,
            fillColor: color,
            color: '#FFFFFF',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        const popupContent = `
            <div class="custom-popup">
                <h4>Fire Hydrant</h4>
                <table>
                    <tr><td>ID:</td><td>${hydrant.id}</td></tr>
                    <tr><td>Flow Capacity:</td><td>${hydrant.flowCapacity} GPM</td></tr>
                    <tr><td>Pressure:</td><td>${hydrant.pressure} PSI</td></tr>
                    <tr><td>Status:</td><td>${hydrant.status}</td></tr>
                </table>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        return marker;
    });
    
    return L.layerGroup(markers);
}

/**
 * Initialize CSV settings and event listeners
 */
function initializeCSVSettings() {
    // Check if the elements exist
    const coordFormatSelect = document.getElementById('csv-coord-format');
    const headerDetectionCheckbox = document.getElementById('csv-header-detection');
    const previewEnableCheckbox = document.getElementById('csv-preview-enable');
    
    if (coordFormatSelect) {
        // Add event listener for format change
        coordFormatSelect.addEventListener('change', function() {
            const formatValue = this.value;
            const infoText = document.querySelector('.info-text');
            
            if (infoText) {
                if (formatValue === 'lng_lat') {
                    infoText.innerHTML = '<i class="fas fa-info-circle"></i> Using "Longitude, Latitude" format for Phoenix data';
                    infoText.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
                    infoText.style.borderLeftColor = '#ff9800';
                } else {
                    infoText.innerHTML = '<i class="fas fa-info-circle"></i> Using standard "Latitude, Longitude" format';
                    infoText.style.backgroundColor = 'rgba(25, 118, 210, 0.05)';
                    infoText.style.borderLeftColor = '#1976d2';
                }
            }
            
            // Store the setting in localStorage for persistence
            localStorage.setItem('csv-coord-format', formatValue);
        });
        
        // Load saved preference if any
        const savedFormat = localStorage.getItem('csv-coord-format');
        if (savedFormat) {
            coordFormatSelect.value = savedFormat;
            // Trigger the change event to update UI
            const event = new Event('change');
            coordFormatSelect.dispatchEvent(event);
        }
    }
    
    // Setup header detection checkbox
    if (headerDetectionCheckbox) {
        headerDetectionCheckbox.addEventListener('change', function() {
            localStorage.setItem('csv-header-detection', this.checked);
        });
        
        const savedHeaderDetection = localStorage.getItem('csv-header-detection');
        if (savedHeaderDetection !== null) {
            headerDetectionCheckbox.checked = savedHeaderDetection === 'true';
        }
    }
    
    // Setup preview checkbox
    if (previewEnableCheckbox) {
        previewEnableCheckbox.addEventListener('change', function() {
            localStorage.setItem('csv-preview-enable', this.checked);
        });
        
        const savedPreviewEnable = localStorage.getItem('csv-preview-enable');
        if (savedPreviewEnable !== null) {
            previewEnableCheckbox.checked = savedPreviewEnable === 'true';
        }
    }
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - The string to capitalize
 * @returns {string} - The capitalized string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Constants
const METERS_PER_MILE = 1609.34;

/**
 * Initialize drag and drop functionality for icons
 */
function initializeDragAndDrop() {
    console.log('Initializing drag and drop functionality with fixed implementation');
    
    try {
        // Initialize icon layer if not already done
        if (!window.iconLayer) {
            window.iconLayer = new L.FeatureGroup();
            if (map) {
                map.addLayer(window.iconLayer);
                console.log('Created and added icon layer to map');
            } else {
                console.error('Map not ready for icon layer');
            }
        }
        
        // Find all icons in the palette
        const icons = document.querySelectorAll('.draggable-icon');
        console.log(`Found ${icons.length} draggable icons`);
        
        if (icons.length === 0) {
            console.warn('No draggable icons found in the DOM');
        }
        
        // Make each icon draggable
        icons.forEach(icon => {
            icon.setAttribute('draggable', 'true');
            icon.style.cursor = 'grab';
            
            // Log what we found to help debug
            console.log(`Making icon draggable: ${icon.dataset.icon || 'unnamed'}`);
            
            // Set up drag start event - remove any existing ones first
            icon.removeEventListener('dragstart', handleDragStart);
            icon.addEventListener('dragstart', handleDragStart);
        });
        
        // Set up the map as a drop target
        const mapElement = document.getElementById('map');
        
        if (!mapElement) {
            console.error('Map element not found in DOM');
            return;
        }
        
        console.log('Setting up map as drop target');
        
        // Remove existing event listeners to avoid duplicates
        mapElement.removeEventListener('dragover', handleDragOver);
        mapElement.removeEventListener('drop', handleDrop);
        
        // Add fresh event listeners
        mapElement.addEventListener('dragover', handleDragOver);
        mapElement.addEventListener('drop', handleDrop);
        
        // Additionally, add a click handler to debug any issues
        mapElement.addEventListener('click', function(e) {
            console.log('Map clicked at:', e.clientX, e.clientY);
            console.log('Map is properly handling events');
        });
        
        console.log('Drag and drop setup complete');
    } catch (error) {
        console.error('Error setting up drag and drop:', error);
    }
    
    // Helper function for drag start
    function handleDragStart(e) {
        const iconType = this.dataset.icon || 'marker';
        const iconColor = this.dataset.color || '#ff0000';
        
        console.log(`Drag started for icon: ${iconType} with color ${iconColor}`);
        
        // Set required data for transfer
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: iconType,
            color: iconColor
        }));
        
        // Set the visual representation during drag
        if (e.dataTransfer.setDragImage) {
            e.dataTransfer.setDragImage(this, 15, 15);
        }
        
        // Required for some browsers
        e.dataTransfer.effectAllowed = 'copy';
    }
    
    // Helper function for drag over
    function handleDragOver(e) {
        // This is required to allow dropping
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }
    
    // Helper function for drop
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('Drop event detected on map');
        
        try {
            // Get transfer data
            const dataString = e.dataTransfer.getData('text/plain');
            console.log('Data received:', dataString);
            
            if (!dataString) {
                console.error('No data received in drop event');
                return;
            }
            
            const data = JSON.parse(dataString);
            
            // Get pixel coordinates
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            console.log(`Drop position in pixels: ${x}, ${y}`);
            
            // Convert to map coordinates
            const point = L.point(x, y);
            const latlng = map.containerPointToLatLng(point);
            console.log(`Drop position in geo coordinates: ${latlng.lat}, ${latlng.lng}`);
            
            // Create marker icon
            const markerIcon = createCustomMarkerIcon(data.type, data.color);
            
            // Add marker to map
            const marker = L.marker(latlng, {
                icon: markerIcon,
                draggable: true
            });
            
            // Add to icon layer and map
            window.iconLayer.addLayer(marker);
            console.log(`Added ${data.type} marker to map at ${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`);
            
            // Create popup content
            const iconTypeFormatted = data.type.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            const popupContent = `
                <div class="custom-popup">
                    <h4>${iconTypeFormatted}</h4>
                    <p>Lat: ${latlng.lat.toFixed(5)}, Lng: ${latlng.lng.toFixed(5)}</p>
                    <button class="remove-marker-btn">Remove</button>
                </div>
            `;
            
            // Bind popup to marker
            marker.bindPopup(popupContent);
            
            // Add remove functionality when popup opens
            marker.on('popupopen', function() {
                const btn = document.querySelector('.remove-marker-btn');
                if (btn) {
                    // Ensure we don't add duplicate listeners
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                    
                    newBtn.addEventListener('click', function() {
                        window.iconLayer.removeLayer(marker);
                        console.log('Marker removed');
                    });
                }
            });
        } catch (error) {
            console.error('Error handling drop event:', error);
            alert('There was an error placing the icon. Please try again.');
        }
    }
}