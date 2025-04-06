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
let searchControl;
let customDataLayers = {};
let measurementActive = false;
let currentBaseLayer = 'street';
let hotspotLayer = null;
let bufferLayer = null;
let toastTimeout = null;

// Base layers
const baseLayers = {
    street: null,
    satellite: null,
    terrain: null
};

// Initialize the map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing FireMapPro...');
    
    // Create the map
    initializeMap();
    
    // Initialize all controls and tools
    setupEventListeners();
    initializeLayerControls();
    initializeTools();
    initializeImportHandlers();
    initializeExportHandlers();
    initializeModals();
    initializeSymbolDragging();
    
    // Default to street layer
    setBaseLayer('street');
});

/**
 * Initialize the Leaflet map
 */
function initializeMap() {
    try {
        // Create map centered on US by default
        map = L.map('map', {
            center: [39.8283, -98.5795], // Center of US
            zoom: 4,
            zoomControl: true,
            attributionControl: true
        });
        
        // Create base layers
        baseLayers.street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        });
        
        baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Imagery &copy; Esri',
            maxZoom: 19
        });
        
        baseLayers.terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
            maxZoom: 18
        });
        
        // Add the default base layer
        baseLayers.street.addTo(map);
        
        // Initialize drawn items and tooltip layers
        drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);
        
        measurementLayer = new L.FeatureGroup();
        map.addLayer(measurementLayer);
        
        // Add coordinate display
        map.on('mousemove', function(e) {
            const lat = e.latlng.lat.toFixed(5);
            const lng = e.latlng.lng.toFixed(5);
            document.getElementById('mouse-position').innerText = `Coordinates: ${lat}, ${lng}`;
        });
        
        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

/**
 * Set up event listeners for all buttons and controls
 */
function setupEventListeners() {
    // Base layer radio buttons
    const baseLayerRadios = document.querySelectorAll('input[name="base-layer"]');
    baseLayerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            setBaseLayer(this.value);
        });
    });
    
    // Map tools buttons
    document.getElementById('draw-tool').addEventListener('click', toggleDrawControls);
    document.getElementById('measure-tool').addEventListener('click', toggleMeasurement);
    document.getElementById('clear-tool').addEventListener('click', clearMap);
    
    // Layer checkboxes
    document.getElementById('stations-layer').addEventListener('change', toggleStationsLayer);
    document.getElementById('incidents-layer').addEventListener('change', toggleIncidentsLayer);
    document.getElementById('response-zones-layer').addEventListener('change', toggleResponseZonesLayer);
    document.getElementById('hydrants-layer').addEventListener('change', toggleHydrantsLayer);
    document.getElementById('hospitals-layer').addEventListener('change', toggleHospitalsLayer);
    
    // Analysis tools
    document.getElementById('hotspot-analysis').addEventListener('click', showHotspotModal);
    document.getElementById('distance-analysis').addEventListener('click', toggleDistanceAnalysis);
    document.getElementById('buffer-tool').addEventListener('click', showBufferModal);
    
    // Map controls
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    document.getElementById('home-btn').addEventListener('click', resetMapView);
    document.getElementById('title-toggle-btn').addEventListener('click', toggleMapTitle);
    document.getElementById('edit-title-btn').addEventListener('click', showMapTitleModal);
    
    // Export buttons
    document.getElementById('export-png').addEventListener('click', exportPNG);
    document.getElementById('export-pdf').addEventListener('click', function() {
        showExportModal('pdf');
    });
    document.getElementById('export-data').addEventListener('click', function() {
        showExportModal('data');
    });
    
    // Map title modal
    document.getElementById('map-title-apply').addEventListener('click', applyMapTitle);
    document.getElementById('map-title-cancel').addEventListener('click', function() {
        closeModal('map-title-modal');
    });
    
    // Logo upload handlers
    document.getElementById('map-logo-file').addEventListener('change', handleLogoUpload);
    document.getElementById('logo-file').addEventListener('change', handleExportLogoUpload);
    
    console.log('Event listeners set up successfully');
}

/**
 * Switch the base layer
 */
function setBaseLayer(layerName) {
    // Remove all existing base layers
    for (const [name, layer] of Object.entries(baseLayers)) {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    }
    
    // Add the selected base layer
    map.addLayer(baseLayers[layerName]);
    currentBaseLayer = layerName;
    
    // Update radio button
    document.getElementById(`${layerName}-layer`).checked = true;
    
    console.log(`Base layer changed to ${layerName}`);
}

/**
 * Initialize layer controls
 */
function initializeLayerControls() {
    // Create predefined layers
    customDataLayers.stations = createStationsLayer();
    customDataLayers.incidents = createIncidentsLayer();
    customDataLayers.responseZones = createResponseZonesLayer();
    customDataLayers.hydrants = createHydrantsLayer();
    customDataLayers.hospitals = createHospitalsLayer();
    
    // Add stations layer by default (checkbox is checked by default)
    if (document.getElementById('stations-layer').checked) {
        map.addLayer(customDataLayers.stations);
    }
    
    console.log('Layer controls initialized');
}

/**
 * Initialize map tools 
 */
function initializeTools() {
    // Initialize drawing controls
    drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#1976d2',
                    weight: 3
                }
            },
            polygon: {
                allowIntersection: false,
                shapeOptions: {
                    color: '#1976d2',
                    weight: 2
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#1976d2',
                    weight: 2
                }
            },
            circle: {
                shapeOptions: {
                    color: '#1976d2',
                    weight: 2
                }
            },
            marker: true
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    
    // Add draw events
    map.on(L.Draw.Event.CREATED, function(event) {
        const layer = event.layer;
        
        if (layer instanceof L.Marker) {
            // If it's a marker, add popup with ability to edit properties
            layer.bindPopup(createMarkerPopup(layer));
        }
        
        drawnItems.addLayer(layer);
    });
    
    // Initialize search box
    searchControl = new L.Control.Search({
        layer: L.layerGroup([customDataLayers.stations, customDataLayers.hospitals]),
        initial: false,
        propertyName: 'name',
        marker: {
            icon: new L.Icon.Default(),
            circle: {
                radius: 20,
                weight: 3,
                color: '#1976d2',
                opacity: 0.8,
                fill: true,
                fillColor: '#1976d2',
                fillOpacity: 0.1
            }
        },
        moveToLocation: function(latlng, title, map) {
            map.setView(latlng, 14);
        }
    });
    map.addControl(searchControl);
    
    console.log('Map tools initialized');
}

/**
 * Toggle drawing controls
 */
function toggleDrawControls() {
    const drawButton = document.getElementById('draw-tool');
    
    if (!map.drawControlsVisible) {
        map.addControl(drawControl);
        map.drawControlsVisible = true;
        drawButton.classList.add('active');
    } else {
        map.removeControl(drawControl);
        map.drawControlsVisible = false;
        drawButton.classList.remove('active');
    }
}

/**
 * Toggle measurement tool
 */
function toggleMeasurement() {
    const measureButton = document.getElementById('measure-tool');
    
    if (!measurementActive) {
        // Activate measurement
        measureButton.classList.add('active');
        measurementActive = true;
        
        // Create measurement control
        map.measureControl = new L.Control.Measure({
            position: 'topright',
            primaryLengthUnit: 'miles',
            secondaryLengthUnit: 'feet',
            primaryAreaUnit: 'acres',
            secondaryAreaUnit: 'sqfeet',
            activeColor: '#1976d2',
            completedColor: '#d32f2f'
        });
        map.addControl(map.measureControl);
        map.measureControl.handler.enable();
    } else {
        // Deactivate measurement
        measureButton.classList.remove('active');
        measurementActive = false;
        
        if (map.measureControl) {
            map.measureControl.handler.disable();
            map.removeControl(map.measureControl);
        }
    }
}

/**
 * Clear all layers from the map
 */
function clearMap() {
    // Clear drawn items
    drawnItems.clearLayers();
    
    // Clear measurement layers
    measurementLayer.clearLayers();
    
    // Clear hotspot layer if it exists
    if (hotspotLayer && map.hasLayer(hotspotLayer)) {
        map.removeLayer(hotspotLayer);
        hotspotLayer = null;
    }
    
    // Clear buffer layer if it exists
    if (bufferLayer && map.hasLayer(bufferLayer)) {
        map.removeLayer(bufferLayer);
        bufferLayer = null;
    }
    
    console.log('Map cleared');
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    const container = document.querySelector('.firemappro-container');
    
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

/**
 * Reset map view to default
 */
function resetMapView() {
    map.setView([39.8283, -98.5795], 4);
}

/**
 * Create a layer for fire stations
 */
function createStationsLayer() {
    const stationsLayer = L.layerGroup();
    
    // Sample data for fire stations
    const stations = [
        { name: "Station 1", lat: 39.9612, lng: -82.9988, type: "Fire", equipment: "Engine, Ladder" },
        { name: "Station 2", lat: 40.0203, lng: -83.0430, type: "Fire/EMS", equipment: "Engine, Medic" },
        { name: "Station 3", lat: 39.9851, lng: -82.8794, type: "Fire", equipment: "Engine" },
        { name: "Station 4", lat: 39.9099, lng: -82.9376, type: "Fire/EMS", equipment: "Engine, Medic, Ladder" }
    ];
    
    stations.forEach(station => {
        const marker = L.marker([station.lat, station.lng], {
            icon: createCustomIcon('fa-building', '#d32f2f')
        }).bindPopup(
            `<div class="custom-popup">
                <h4>${station.name}</h4>
                <table>
                    <tr><td>Type:</td><td>${station.type}</td></tr>
                    <tr><td>Equipment:</td><td>${station.equipment}</td></tr>
                    <tr><td>Location:</td><td>${station.lat.toFixed(5)}, ${station.lng.toFixed(5)}</td></tr>
                </table>
            </div>`
        );
        marker.properties = station;
        stationsLayer.addLayer(marker);
    });
    
    return stationsLayer;
}

/**
 * Create a layer for incidents
 */
function createIncidentsLayer() {
    const incidentsLayer = L.layerGroup();
    
    // Sample data for incidents
    const incidents = [
        { name: "Medical Call", lat: 39.9712, lng: -83.0088, type: "EMS", date: "2025-03-01" },
        { name: "Structure Fire", lat: 40.0103, lng: -83.0330, type: "Fire", date: "2025-03-02" },
        { name: "Vehicle Accident", lat: 39.9751, lng: -82.8694, type: "Rescue", date: "2025-03-03" },
        { name: "Medical Emergency", lat: 39.9199, lng: -82.9276, type: "EMS", date: "2025-03-04" }
    ];
    
    incidents.forEach(incident => {
        let iconName, iconColor;
        
        switch(incident.type) {
            case "Fire":
                iconName = 'fa-fire';
                iconColor = '#d32f2f';
                break;
            case "EMS":
                iconName = 'fa-ambulance';
                iconColor = '#2196f3';
                break;
            case "Rescue":
                iconName = 'fa-car-crash';
                iconColor = '#ff9800';
                break;
            default:
                iconName = 'fa-exclamation-triangle';
                iconColor = '#607d8b';
        }
        
        const marker = L.marker([incident.lat, incident.lng], {
            icon: createCustomIcon(iconName, iconColor)
        }).bindPopup(
            `<div class="custom-popup">
                <h4>${incident.name}</h4>
                <table>
                    <tr><td>Type:</td><td>${incident.type}</td></tr>
                    <tr><td>Date:</td><td>${incident.date}</td></tr>
                    <tr><td>Location:</td><td>${incident.lat.toFixed(5)}, ${incident.lng.toFixed(5)}</td></tr>
                </table>
            </div>`
        );
        marker.properties = incident;
        incidentsLayer.addLayer(marker);
    });
    
    return incidentsLayer;
}

/**
 * Create a layer for response zones
 */
function createResponseZonesLayer() {
    const responseZonesLayer = L.layerGroup();
    
    // Sample data for response zones
    const zones = [
        {
            name: "Zone 1",
            color: "#d32f2f",
            coordinates: [
                [39.9812, -83.0188],
                [39.9812, -82.9788],
                [39.9412, -82.9788],
                [39.9412, -83.0188]
            ]
        },
        {
            name: "Zone 2",
            color: "#1976d2",
            coordinates: [
                [40.0303, -83.0530],
                [40.0303, -83.0130],
                [39.9903, -83.0130],
                [39.9903, -83.0530]
            ]
        },
        {
            name: "Zone 3",
            color: "#4caf50",
            coordinates: [
                [39.9951, -82.8894],
                [39.9951, -82.8494],
                [39.9551, -82.8494],
                [39.9551, -82.8894]
            ]
        }
    ];
    
    zones.forEach(zone => {
        const polygon = L.polygon(zone.coordinates, {
            color: zone.color,
            fillOpacity: 0.3,
            weight: 2
        }).bindPopup(
            `<div class="custom-popup">
                <h4>${zone.name}</h4>
                <p>Response Zone</p>
            </div>`
        );
        polygon.properties = zone;
        responseZonesLayer.addLayer(polygon);
    });
    
    return responseZonesLayer;
}

/**
 * Create a layer for hydrants
 */
function createHydrantsLayer() {
    const hydrantsLayer = L.layerGroup();
    
    // Sample data for hydrants
    const hydrants = [
        { name: "Hydrant 101", lat: 39.9632, lng: -83.0008, flow: "1000 GPM", pressure: "60 PSI" },
        { name: "Hydrant 102", lat: 40.0213, lng: -83.0450, flow: "800 GPM", pressure: "55 PSI" },
        { name: "Hydrant 103", lat: 39.9871, lng: -82.8814, flow: "1200 GPM", pressure: "65 PSI" },
        { name: "Hydrant 104", lat: 39.9119, lng: -82.9396, flow: "900 GPM", pressure: "58 PSI" }
    ];
    
    hydrants.forEach(hydrant => {
        const marker = L.marker([hydrant.lat, hydrant.lng], {
            icon: createCustomIcon('fa-fire-extinguisher', '#1976d2')
        }).bindPopup(
            `<div class="custom-popup">
                <h4>${hydrant.name}</h4>
                <table>
                    <tr><td>Flow Rate:</td><td>${hydrant.flow}</td></tr>
                    <tr><td>Pressure:</td><td>${hydrant.pressure}</td></tr>
                    <tr><td>Location:</td><td>${hydrant.lat.toFixed(5)}, ${hydrant.lng.toFixed(5)}</td></tr>
                </table>
            </div>`
        );
        marker.properties = hydrant;
        hydrantsLayer.addLayer(marker);
    });
    
    return hydrantsLayer;
}

/**
 * Create a layer for hospitals
 */
function createHospitalsLayer() {
    const hospitalsLayer = L.layerGroup();
    
    // Sample data for hospitals
    const hospitals = [
        { name: "City Hospital", lat: 39.9742, lng: -83.0108, type: "Level 1 Trauma", beds: 450 },
        { name: "Community Medical Center", lat: 40.0233, lng: -83.0480, type: "Level 2 Trauma", beds: 320 },
        { name: "East Regional Hospital", lat: 39.9891, lng: -82.8844, type: "Level 3 Trauma", beds: 280 },
        { name: "South Medical Center", lat: 39.9139, lng: -82.9416, type: "Level 2 Trauma", beds: 350 }
    ];
    
    hospitals.forEach(hospital => {
        const marker = L.marker([hospital.lat, hospital.lng], {
            icon: createCustomIcon('fa-hospital', '#4caf50')
        }).bindPopup(
            `<div class="custom-popup">
                <h4>${hospital.name}</h4>
                <table>
                    <tr><td>Type:</td><td>${hospital.type}</td></tr>
                    <tr><td>Beds:</td><td>${hospital.beds}</td></tr>
                    <tr><td>Location:</td><td>${hospital.lat.toFixed(5)}, ${hospital.lng.toFixed(5)}</td></tr>
                </table>
            </div>`
        );
        marker.properties = hospital;
        hospitalsLayer.addLayer(marker);
    });
    
    return hospitalsLayer;
}

/**
 * Create a custom icon
 */
function createCustomIcon(iconName, color, size = 'medium') {
    // Set icon size based on parameter
    let iconSize, fontSize;
    switch(size) {
        case 'small':
            iconSize = 24;
            fontSize = 14;
            break;
        case 'large':
            iconSize = 36;
            fontSize = 18;
            break;
        case 'medium':
        default:
            iconSize = 30;
            fontSize = 16;
    }
    
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: ${iconSize}px; height: ${iconSize}px;" class="custom-marker">
                <i class="fas ${iconName}" style="font-size: ${fontSize}px;"></i>
               </div>`,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize/2, iconSize/2]
    });
}

/**
 * Create marker popup with edit/remove options
 */
function createMarkerPopup(marker) {
    return `
        <div class="marker-popup">
            <h4>Marker</h4>
            <p>Position: ${marker.getLatLng().lat.toFixed(5)}, ${marker.getLatLng().lng.toFixed(5)}</p>
            <button class="remove-marker-btn">Remove Marker</button>
        </div>
    `;
}

/**
 * Toggle stations layer
 */
function toggleStationsLayer() {
    const checked = document.getElementById('stations-layer').checked;
    if (checked) {
        map.addLayer(customDataLayers.stations);
    } else {
        map.removeLayer(customDataLayers.stations);
    }
}

/**
 * Toggle incidents layer
 */
function toggleIncidentsLayer() {
    const checked = document.getElementById('incidents-layer').checked;
    if (checked) {
        map.addLayer(customDataLayers.incidents);
    } else {
        map.removeLayer(customDataLayers.incidents);
    }
}

/**
 * Toggle response zones layer
 */
function toggleResponseZonesLayer() {
    const checked = document.getElementById('response-zones-layer').checked;
    if (checked) {
        map.addLayer(customDataLayers.responseZones);
    } else {
        map.removeLayer(customDataLayers.responseZones);
    }
}

/**
 * Toggle hydrants layer
 */
function toggleHydrantsLayer() {
    const checked = document.getElementById('hydrants-layer').checked;
    if (checked) {
        map.addLayer(customDataLayers.hydrants);
    } else {
        map.removeLayer(customDataLayers.hydrants);
    }
}

/**
 * Toggle hospitals layer
 */
function toggleHospitalsLayer() {
    const checked = document.getElementById('hospitals-layer').checked;
    if (checked) {
        map.addLayer(customDataLayers.hospitals);
    } else {
        map.removeLayer(customDataLayers.hospitals);
    }
}

/**
 * Initialize import handlers
 */
function initializeImportHandlers() {
    // CSV Import
    document.getElementById('csv-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const csvData = e.target.result;
                // Show CSV mapping modal and populate column selectors
                showCSVMappingModal(csvData);
            };
            reader.readAsText(file);
        }
    });
    
    // KML/GPX Import
    document.getElementById('kml-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const kmlData = e.target.result;
                importKML(kmlData);
            };
            reader.readAsText(file);
        }
    });
    
    // GeoJSON Import
    document.getElementById('geojson-import').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const geojsonData = JSON.parse(e.target.result);
                    importGeoJSON(geojsonData);
                } catch (error) {
                    alert('Error parsing GeoJSON file. Please check the file format.');
                    console.error('Error parsing GeoJSON:', error);
                }
            };
            reader.readAsText(file);
        }
    });
}

/**
 * Initialize export handlers
 */
function initializeExportHandlers() {
    // Set up export modal buttons
    document.getElementById('export-confirm').addEventListener('click', function() {
        const format = document.getElementById('export-format').value;
        
        switch(format) {
            case 'png':
                exportPNG();
                break;
            case 'pdf':
                exportPDF();
                break;
            case 'geojson':
                exportGeoJSON();
                break;
            case 'kml':
                exportKML();
                break;
        }
        
        closeModal('export-modal');
    });
    
    document.getElementById('export-cancel').addEventListener('click', function() {
        closeModal('export-modal');
    });
}

/**
 * Initialize modal event handlers
 */
function initializeModals() {
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Buffer modal
    document.getElementById('buffer-apply').addEventListener('click', applyBuffer);
    document.getElementById('buffer-cancel').addEventListener('click', function() {
        closeModal('buffer-modal');
    });
    
    // Hotspot modal
    document.getElementById('hotspot-apply').addEventListener('click', generateHotspot);
    document.getElementById('hotspot-cancel').addEventListener('click', function() {
        closeModal('hotspot-modal');
    });
    
    // CSV mapping modal
    document.getElementById('csv-import-confirm').addEventListener('click', importCSV);
    document.getElementById('csv-cancel').addEventListener('click', function() {
        closeModal('csv-mapping-modal');
    });
    
    // When user clicks outside a modal, close it
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

/**
 * Initialize symbol dragging
 */
function initializeSymbolDragging() {
    const draggableIcons = document.querySelectorAll('.draggable-icon');
    
    draggableIcons.forEach(icon => {
        icon.addEventListener('dragstart', function(e) {
            // Store the icon data in the drag event
            const iconName = this.dataset.icon;
            e.dataTransfer.setData('text/plain', iconName);
            
            // Add dragging class for visual effect
            this.classList.add('dragging');
        });
        
        icon.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // Set up the map as a drop target
    const mapElement = document.getElementById('map');
    
    mapElement.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drop-hover');
    });
    
    mapElement.addEventListener('dragleave', function() {
        this.classList.remove('drop-hover');
    });
    
    mapElement.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drop-hover');
        
        // Get the icon data
        const iconName = e.dataTransfer.getData('text/plain');
        
        // Get the drop position relative to the map
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to lat/lng
        const point = L.point(x, y);
        const latlng = map.containerPointToLatLng(point);
        
        // Get the selected color and size
        const colorSelector = document.getElementById('icon-color');
        const sizeSelector = document.getElementById('icon-size');
        const iconColor = colorSelector ? colorSelector.value : '#d32f2f';
        const iconSize = sizeSelector ? sizeSelector.value : 'medium';
        
        // Create a marker at that position
        const marker = L.marker(latlng, {
            icon: createCustomIcon(iconName, iconColor, iconSize),
            draggable: true
        }).addTo(drawnItems);
        
        // Add a popup
        marker.bindPopup(createMarkerPopup(marker));
        
        // Add click handler for the remove button
        marker.on('popupopen', function() {
            const removeBtn = document.querySelector('.remove-marker-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    drawnItems.removeLayer(marker);
                });
            }
        });
    });
}

/**
 * Show export modal
 */
function showExportModal(defaultFormat) {
    const modal = document.getElementById('export-modal');
    
    // Set default format
    document.getElementById('export-format').value = defaultFormat;
    
    // Show the modal
    modal.style.display = 'flex';
}

/**
 * Show buffer modal
 */
function showBufferModal() {
    const modal = document.getElementById('buffer-modal');
    modal.style.display = 'flex';
}

/**
 * Show hotspot modal
 */
function showHotspotModal() {
    const modal = document.getElementById('hotspot-modal');
    modal.style.display = 'flex';
}

/**
 * Show CSV mapping modal
 */
function showCSVMappingModal(csvData) {
    const modal = document.getElementById('csv-mapping-modal');
    
    // Parse CSV to get header row (or first row)
    const lines = csvData.split('\n');
    const firstRow = lines[0].split(',');
    
    // Populate column selectors
    const selectors = [
        'csv-lat-column',
        'csv-lng-column',
        'csv-name-column',
        'csv-category-column'
    ];
    
    selectors.forEach(selectorId => {
        const select = document.getElementById(selectorId);
        // Clear existing options
        select.innerHTML = '';
        
        // Add options for each column
        firstRow.forEach((col, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text = col.trim();
            select.appendChild(option);
        });
        
        // Add null option for optional fields
        if (selectorId === 'csv-name-column' || selectorId === 'csv-category-column') {
            const nullOption = document.createElement('option');
            nullOption.value = '';
            nullOption.text = '-- None --';
            select.insertBefore(nullOption, select.firstChild);
        }
    });
    
    // Try to auto-select columns
    autoSelectCSVColumns(firstRow);
    
    // Store CSV data for later use
    modal.dataset.csvData = csvData;
    
    // Show the modal
    modal.style.display = 'flex';
}

/**
 * Auto-select appropriate CSV columns based on column names
 */
function autoSelectCSVColumns(headers) {
    const latitudeNames = ['lat', 'latitude', 'y', 'ylat'];
    const longitudeNames = ['lng', 'lon', 'longitude', 'x', 'xlong'];
    const nameNames = ['name', 'title', 'label', 'id', 'identifier'];
    const categoryNames = ['category', 'type', 'class', 'classification'];
    
    // Normalize headers
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    
    // Find latitude column
    const latSelect = document.getElementById('csv-lat-column');
    const latIndex = findBestMatch(normalizedHeaders, latitudeNames);
    if (latIndex !== -1) {
        latSelect.value = latIndex;
    }
    
    // Find longitude column
    const lngSelect = document.getElementById('csv-lng-column');
    const lngIndex = findBestMatch(normalizedHeaders, longitudeNames);
    if (lngIndex !== -1) {
        lngSelect.value = lngIndex;
    }
    
    // Find name column
    const nameSelect = document.getElementById('csv-name-column');
    const nameIndex = findBestMatch(normalizedHeaders, nameNames);
    if (nameIndex !== -1) {
        nameSelect.value = nameIndex;
    }
    
    // Find category column
    const categorySelect = document.getElementById('csv-category-column');
    const categoryIndex = findBestMatch(normalizedHeaders, categoryNames);
    if (categoryIndex !== -1) {
        categorySelect.value = categoryIndex;
    }
}

/**
 * Find the best matching column
 */
function findBestMatch(headers, possibleNames) {
    for (const header of headers) {
        for (const name of possibleNames) {
            if (header.includes(name)) {
                return headers.indexOf(header);
            }
        }
    }
    return -1;
}

/**
 * Close a modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

/**
 * Apply buffer to selected layers or points
 */
function applyBuffer() {
    const distance = parseFloat(document.getElementById('buffer-distance').value);
    const layerType = document.getElementById('buffer-layers').value;
    
    if (isNaN(distance) || distance <= 0) {
        alert('Please enter a valid buffer distance');
        return;
    }
    
    // Convert miles to meters (Leaflet uses meters)
    const bufferRadiusMeters = distance * 1609.34;
    
    // Create a feature group for the buffers
    bufferLayer = L.featureGroup();
    
    let targetLayers = [];
    
    switch(layerType) {
        case 'all':
            Object.values(customDataLayers).forEach(layer => {
                if (map.hasLayer(layer)) {
                    targetLayers.push(layer);
                }
            });
            break;
        case 'stations':
            if (map.hasLayer(customDataLayers.stations)) {
                targetLayers.push(customDataLayers.stations);
            }
            break;
        case 'hydrants':
            if (map.hasLayer(customDataLayers.hydrants)) {
                targetLayers.push(customDataLayers.hydrants);
            }
            break;
        case 'hospitals':
            if (map.hasLayer(customDataLayers.hospitals)) {
                targetLayers.push(customDataLayers.hospitals);
            }
            break;
        case 'selection':
            targetLayers.push(drawnItems);
            break;
    }
    
    // Process each target layer
    targetLayers.forEach(targetLayer => {
        targetLayer.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                // Create buffer for marker
                const circle = L.circle(layer.getLatLng(), {
                    radius: bufferRadiusMeters,
                    color: '#1976d2',
                    fillColor: '#1976d2',
                    fillOpacity: 0.2,
                    weight: 2
                });
                
                // Create popup
                let popupContent = `<div class="custom-popup">
                    <h4>Buffer Zone (${distance} miles)</h4>`;
                
                if (layer.properties && layer.properties.name) {
                    popupContent += `<p>Around: ${layer.properties.name}</p>`;
                }
                
                popupContent += '</div>';
                
                circle.bindPopup(popupContent);
                bufferLayer.addLayer(circle);
            }
        });
    });
    
    // Add the buffer layer to the map
    map.addLayer(bufferLayer);
    
    // Fit bounds if needed
    if (bufferLayer.getLayers().length > 0) {
        map.fitBounds(bufferLayer.getBounds());
    }
    
    // Close the modal
    closeModal('buffer-modal');
}

/**
 * Generate hotspot heatmap
 */
function generateHotspot() {
    const layerType = document.getElementById('hotspot-layer').value;
    const radius = parseInt(document.getElementById('hotspot-radius').value) * 1609.34; // Convert miles to meters
    const intensity = document.getElementById('hotspot-intensity').value;
    
    // Set intensity values
    let intensityValue = 0.5;
    switch(intensity) {
        case 'low':
            intensityValue = 0.3;
            break;
        case 'medium':
            intensityValue = 0.5;
            break;
        case 'high':
            intensityValue = 0.8;
            break;
    }
    
    // Get points based on layer type
    let points = [];
    
    if (layerType === 'incidents' && map.hasLayer(customDataLayers.incidents)) {
        customDataLayers.incidents.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                points.push([layer.getLatLng().lat, layer.getLatLng().lng]);
            }
        });
    } else if (layerType === 'custom') {
        drawnItems.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                points.push([layer.getLatLng().lat, layer.getLatLng().lng]);
            }
        });
    }
    
    // Remove existing hotspot layer if it exists
    if (hotspotLayer && map.hasLayer(hotspotLayer)) {
        map.removeLayer(hotspotLayer);
    }
    
    // Create hotspot layer with will-read-frequently attribute to improve performance
    const canvas = document.createElement('canvas');
    canvas.setAttribute('willReadFrequently', 'true');
    
    hotspotLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'},
        minOpacity: intensityValue,
        canvas: canvas
    }).addTo(map);
    
    // Fit bounds
    if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds);
    }
    
    // Close the modal
    closeModal('hotspot-modal');
}

/**
 * Toggle distance analysis
 */
function toggleDistanceAnalysis() {
    try {
        if (!map.distanceAnalysisMode) {
            // Enable distance analysis mode
            map.distanceAnalysisMode = true;
            document.getElementById('distance-analysis').classList.add('active-tool');
            showToast("Distance Analysis Mode: Click on map to set points", "info");
            
            // Create a new layer for distance analysis
            if (!map.distanceLayer) {
                map.distanceLayer = L.layerGroup().addTo(map);
            } else {
                map.distanceLayer.clearLayers();
            }
            
            // Initialize points array
            map.distancePoints = [];
            
            // Add click handler to map
            map.on('click', handleDistanceAnalysisClick);
            
            // Show the distance panel
            const panel = document.getElementById('distance-panel');
            if (!panel) {
                // Create panel if it doesn't exist
                const panel = document.createElement('div');
                panel.id = 'distance-panel';
                panel.className = 'control-panel';
                panel.innerHTML = `
                    <div class="panel-header">
                        <h3>Distance Analysis</h3>
                        <button class="close-btn" onclick="toggleDistanceAnalysis()">×</button>
                    </div>
                    <div class="panel-content">
                        <div id="distance-results">
                            <p>Click on the map to place points.</p>
                            <p>Total distance: <span id="total-distance">0</span> mi</p>
                        </div>
                        <div class="panel-actions">
                            <button id="clear-distance-btn" class="btn btn-sm" onclick="clearDistanceAnalysis()">Clear</button>
                            <button id="finish-distance-btn" class="btn btn-sm" onclick="finishDistanceAnalysis()">Finish</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(panel);
            } else {
                panel.style.display = 'block';
            }
        } else {
            // Disable distance analysis mode
            map.distanceAnalysisMode = false;
            document.getElementById('distance-analysis').classList.remove('active-tool');
            
            // Remove click handler
            map.off('click', handleDistanceAnalysisClick);
            
            // Hide the distance panel
            const panel = document.getElementById('distance-panel');
            if (panel) {
                panel.style.display = 'none';
            }
            
            // Remove the distance layer
            if (map.distanceLayer) {
                map.removeLayer(map.distanceLayer);
                map.distanceLayer = null;
            }
            
            map.distancePoints = [];
        }
    } catch (e) {
        console.error("Error in distance analysis:", e);
        showToast("Error in distance analysis tool", "error");
    }
}

/**
 * Handle map clicks in distance analysis mode
 */
function handleDistanceAnalysisClick(e) {
    try {
        const latlng = e.latlng;
        
        // Add point to array
        map.distancePoints.push(latlng);
        
        // Add marker at click location
        const marker = L.marker(latlng, {
            icon: L.divIcon({
                className: 'distance-marker',
                html: '<div class="distance-point">' + map.distancePoints.length + '</div>',
                iconSize: [20, 20]
            })
        }).addTo(map.distanceLayer);
        
        // If we have at least 2 points, draw a line
        if (map.distancePoints.length > 1) {
            const startPoint = map.distancePoints[map.distancePoints.length - 2];
            const endPoint = latlng;
            
            // Calculate distance between these two points
            const distance = startPoint.distanceTo(endPoint) / 1609.34; // Convert meters to miles
            
            // Draw line between points
            const line = L.polyline([startPoint, endPoint], {
                color: '#3388ff',
                weight: 4,
                opacity: 0.7,
                dashArray: '5, 10'
            }).addTo(map.distanceLayer);
            
            // Add distance label
            const midPoint = L.latLng(
                (startPoint.lat + endPoint.lat) / 2,
                (startPoint.lng + endPoint.lng) / 2
            );
            
            L.marker(midPoint, {
                icon: L.divIcon({
                    className: 'distance-label',
                    html: '<div class="distance-text">' + distance.toFixed(2) + ' mi</div>',
                    iconSize: [80, 20],
                    iconAnchor: [40, 10]
                })
            }).addTo(map.distanceLayer);
        }
        
        // Update total distance
        updateTotalDistance();
    } catch (e) {
        console.error("Error handling distance analysis click:", e);
    }
}

/**
 * Calculate and display total distance
 */
function updateTotalDistance() {
    if (!map.distancePoints || map.distancePoints.length < 2) {
        document.getElementById('total-distance').textContent = '0';
        return;
    }
    
    let totalDistance = 0;
    for (let i = 1; i < map.distancePoints.length; i++) {
        const segment = map.distancePoints[i-1].distanceTo(map.distancePoints[i]);
        totalDistance += segment;
    }
    
    // Convert to miles and round to 2 decimal places
    const miles = (totalDistance / 1609.34).toFixed(2);
    document.getElementById('total-distance').textContent = miles;
}

/**
 * Clear all distance analysis points and lines
 */
function clearDistanceAnalysis() {
    if (map.distanceLayer) {
        map.distanceLayer.clearLayers();
    }
    map.distancePoints = [];
    updateTotalDistance();
}

/**
 * Finish distance analysis by connecting back to start
 */
function finishDistanceAnalysis() {
    if (map.distancePoints && map.distancePoints.length > 2) {
        // Connect last point to first point
        const startPoint = map.distancePoints[0];
        const endPoint = map.distancePoints[map.distancePoints.length - 1];
        
        // Calculate distance
        const distance = endPoint.distanceTo(startPoint) / 1609.34;
        
        // Draw line
        const line = L.polyline([endPoint, startPoint], {
            color: '#3388ff',
            weight: 4,
            opacity: 0.7,
            dashArray: '5, 10'
        }).addTo(map.distanceLayer);
        
        // Add distance label
        const midPoint = L.latLng(
            (startPoint.lat + endPoint.lat) / 2,
            (startPoint.lng + endPoint.lng) / 2
        );
        
        L.marker(midPoint, {
            icon: L.divIcon({
                className: 'distance-label',
                html: '<div class="distance-text">' + distance.toFixed(2) + ' mi</div>',
                iconSize: [80, 20],
                iconAnchor: [40, 10]
            })
        }).addTo(map.distanceLayer);
        
        // Add closing point to array
        map.distancePoints.push(startPoint);
        
        // Update total
        updateTotalDistance();
    } else {
        showToast("Need at least 3 points to close the path", "warning");
    }
}

/**
 * Import CSV data
 */
function importCSV() {
    const modal = document.getElementById('csv-mapping-modal');
    const csvData = modal.dataset.csvData;
    
    // Get column mapping
    const latColumn = parseInt(document.getElementById('csv-lat-column').value);
    const lngColumn = parseInt(document.getElementById('csv-lng-column').value);
    const nameColumn = document.getElementById('csv-name-column').value !== '' 
        ? parseInt(document.getElementById('csv-name-column').value) 
        : null;
    const categoryColumn = document.getElementById('csv-category-column').value !== '' 
        ? parseInt(document.getElementById('csv-category-column').value) 
        : null;
    
    const iconStyle = document.getElementById('csv-icon-style').value;
    const hasHeaders = document.getElementById('csv-first-row-header').checked;
    
    // Parse CSV
    const lines = csvData.split('\n');
    const startRow = hasHeaders ? 1 : 0;
    
    // Create layer group for CSV data
    const csvLayer = L.layerGroup();
    
    // Create markers for each data point
    for (let i = startRow; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        
        // Get coordinates
        const lat = parseFloat(columns[latColumn]);
        const lng = parseFloat(columns[lngColumn]);
        
        // Skip invalid coordinates
        if (isNaN(lat) || isNaN(lng)) continue;
        
        // Get name and category
        const name = nameColumn !== null ? columns[nameColumn] : `Point ${i}`;
        const category = categoryColumn !== null ? columns[categoryColumn] : 'CSV Data';
        
        // Determine icon
        let marker;
        if (iconStyle === 'circle') {
            marker = L.circleMarker([lat, lng], {
                radius: 8,
                fillColor: '#1976d2',
                color: '#1976d2',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            });
        } else if (iconStyle === 'marker') {
            marker = L.marker([lat, lng]);
        } else {
            // Custom icon
            marker = L.marker([lat, lng], {
                icon: createCustomIcon('fa-map-pin', '#1976d2')
            });
        }
        
        // Create popup
        let popupContent = `<div class="custom-popup">
            <h4>${name}</h4>
            <table>
                <tr><td>Category:</td><td>${category}</td></tr>
                <tr><td>Location:</td><td>${lat.toFixed(5)}, ${lng.toFixed(5)}</td></tr>
            </table>
        </div>`;
        
        // Add custom fields
        for (let j = 0; j < columns.length; j++) {
            if (j !== latColumn && j !== lngColumn && j !== nameColumn && j !== categoryColumn) {
                const fieldName = hasHeaders ? lines[0].split(',')[j] : `Field ${j+1}`;
                popupContent = popupContent.replace('</table>', `<tr><td>${fieldName}:</td><td>${columns[j]}</td></tr></table>`);
            }
        }
        
        marker.bindPopup(popupContent);
        
        // Store properties for searching
        marker.properties = {
            name: name,
            category: category,
            lat: lat,
            lng: lng
        };
        
        csvLayer.addLayer(marker);
    }
    
    // Add to custom data layers
    customDataLayers.csv = csvLayer;
    
    // Add to map
    map.addLayer(csvLayer);
    
    // Fit bounds
    if (csvLayer.getLayers().length > 0) {
        map.fitBounds(csvLayer.getBounds());
    }
    
    // Close the modal
    closeModal('csv-mapping-modal');
}

/**
 * Import KML data
 */
function importKML(kmlData) {
    try {
        showToast("Processing KML file...", "info");
        
        // Create a new parser
        const parser = new DOMParser();
        
        // Parse the KML data
        const kmlDoc = parser.parseFromString(kmlData, "text/xml");
        
        // Check for parse errors
        if (kmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("Invalid KML file");
        }
        
        // Create a layer group for the imported KML
        const kmlLayer = L.layerGroup();
        
        // Process placemarks
        const placemarks = kmlDoc.getElementsByTagName("Placemark");
        let count = {
            points: 0,
            lines: 0,
            polygons: 0
        };
        
        for (let i = 0; i < placemarks.length; i++) {
            const placemark = placemarks[i];
            
            // Get name and description
            const name = placemark.getElementsByTagName("name")[0]?.textContent || "Imported feature";
            const description = placemark.getElementsByTagName("description")[0]?.textContent || "";
            
            // Check for Point geometry
            const point = placemark.getElementsByTagName("Point")[0];
            if (point) {
                const coordinates = point.getElementsByTagName("coordinates")[0].textContent.trim();
                const [lng, lat] = coordinates.split(",").map(parseFloat);
                
                if (!isNaN(lat) && !isNaN(lng)) {
                    // Create marker
                    const marker = L.marker([lat, lng], {
                        title: name
                    });
                    
                    // Add popup if there's a description
                    if (description) {
                        marker.bindPopup(`<strong>${name}</strong><br>${description}`);
                    }
                    
                    // Add to layer
                    marker.addTo(kmlLayer);
                    count.points++;
                }
                continue;
            }
            
            // Check for LineString geometry
            const lineString = placemark.getElementsByTagName("LineString")[0];
            if (lineString) {
                const coordinates = lineString.getElementsByTagName("coordinates")[0].textContent.trim();
                const points = coordinates.split(/\s+/).map(coord => {
                    const [lng, lat] = coord.split(",").map(parseFloat);
                    return [lat, lng];
                }).filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
                
                if (points.length >= 2) {
                    // Create polyline
                    const polyline = L.polyline(points, {
                        color: '#3388ff',
                        weight: 3
                    });
                    
                    // Add popup if there's a name or description
                    if (name || description) {
                        polyline.bindPopup(`<strong>${name}</strong><br>${description}`);
                    }
                    
                    // Add to layer
                    polyline.addTo(kmlLayer);
                    count.lines++;
                }
                continue;
            }
            
            // Check for Polygon geometry
            const polygon = placemark.getElementsByTagName("Polygon")[0];
            if (polygon) {
                // Get outer boundary coordinates
                const outerBoundary = polygon.getElementsByTagName("outerBoundaryIs")[0];
                if (outerBoundary) {
                    const linearRing = outerBoundary.getElementsByTagName("LinearRing")[0];
                    if (linearRing) {
                        const coordinates = linearRing.getElementsByTagName("coordinates")[0].textContent.trim();
                        const points = coordinates.split(/\s+/).map(coord => {
                            const [lng, lat] = coord.split(",").map(parseFloat);
                            return [lat, lng];
                        }).filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
                        
                        if (points.length >= 3) {
                            // Create polygon
                            const polygonObj = L.polygon(points, {
                                color: '#3388ff',
                                weight: 2,
                                fillColor: '#3388ff',
                                fillOpacity: 0.2
                            });
                            
                            // Add popup if there's a name or description
                            if (name || description) {
                                polygonObj.bindPopup(`<strong>${name}</strong><br>${description}`);
                            }
                            
                            // Add to layer
                            polygonObj.addTo(kmlLayer);
                            count.polygons++;
                        }
                    }
                }
                continue;
            }
        }
        
        // Process folders
        const folders = kmlDoc.getElementsByTagName("Folder");
        for (let i = 0; i < folders.length; i++) {
            const folder = folders[i];
            const folderName = folder.getElementsByTagName("name")[0]?.textContent || "Imported folder";
            
            // Create a layer name for the customer data layers object
            const layerName = 'kml_' + folderName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            
            // Process placemarks in this folder
            const folderPlacemarks = folder.getElementsByTagName("Placemark");
            
            if (folderPlacemarks.length > 0) {
                // Create a layer group for this folder
                const folderLayer = L.layerGroup();
                
                for (let j = 0; j < folderPlacemarks.length; j++) {
                    const placemark = folderPlacemarks[j];
                    
                    // Get name and description
                    const name = placemark.getElementsByTagName("name")[0]?.textContent || "Imported feature";
                    const description = placemark.getElementsByTagName("description")[0]?.textContent || "";
                    
                    // Check for Point geometry
                    const point = placemark.getElementsByTagName("Point")[0];
                    if (point) {
                        const coordinates = point.getElementsByTagName("coordinates")[0].textContent.trim();
                        const [lng, lat] = coordinates.split(",").map(parseFloat);
                        
                        if (!isNaN(lat) && !isNaN(lng)) {
                            // Create marker
                            const marker = L.marker([lat, lng], {
                                title: name
                            });
                            
                            // Add popup if there's a description
                            if (description) {
                                marker.bindPopup(`<strong>${name}</strong><br>${description}`);
                            }
                            
                            // Add to folder layer
                            marker.addTo(folderLayer);
                            count.points++;
                        }
                    }
                }
                
                // Add this folder as a custom data layer
                if (folderLayer.getLayers().length > 0) {
                    // Add folder layer to custom data layers
                    customDataLayers[folderName] = folderLayer;
                    
                    // Add to map and control
                    folderLayer.addTo(map);
                    
                    // Add to layer control if it exists
                    if (layerControl) {
                        layerControl.addOverlay(folderLayer, folderName);
                    }
                }
            }
        }
        
        // If there are features that aren't in folders, add them to the map
        if (kmlLayer.getLayers().length > 0) {
            // Add to map
            kmlLayer.addTo(map);
            
            // Add to custom data layers
            const layerName = "KML Import";
            customDataLayers[layerName] = kmlLayer;
            
            // Add to layer control if it exists
            if (layerControl) {
                layerControl.addOverlay(kmlLayer, layerName);
            }
        }
        
        // Show success message
        const totalCount = count.points + count.lines + count.polygons;
        let message = `Imported ${totalCount} feature${totalCount !== 1 ? 's' : ''}`;
        if (count.points > 0) message += `, ${count.points} point${count.points !== 1 ? 's' : ''}`;
        if (count.lines > 0) message += `, ${count.lines} line${count.lines !== 1 ? 's' : ''}`;
        if (count.polygons > 0) message += `, ${count.polygons} polygon${count.polygons !== 1 ? 's' : ''}`;
        
        showToast(message, "success");
        
        // Fit map to imported data if there are features
        if (totalCount > 0) {
            // Collect all layers
            const allLayers = [];
            for (const layerName in customDataLayers) {
                if (layerName.startsWith("KML Import") || layerName.startsWith("kml_")) {
                    customDataLayers[layerName].eachLayer(layer => {
                        allLayers.push(layer);
                    });
                }
            }
            
            // Create a feature group and fit bounds
            if (allLayers.length > 0) {
                const group = L.featureGroup(allLayers);
                map.fitBounds(group.getBounds());
            }
        }
    } catch (e) {
        console.error("Error importing KML:", e);
        showToast("Error importing KML file: " + e.message, "error");
    }
}

/**
 * Import GeoJSON data
 */
function importGeoJSON(geojsonData) {
    // Create layer group for GeoJSON data
    const geojsonLayer = L.geoJSON(geojsonData, {
        style: {
            color: '#1976d2',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        },
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng);
        },
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                let popupContent = '<div class="custom-popup">';
                
                if (feature.properties.name) {
                    popupContent += `<h4>${feature.properties.name}</h4>`;
                } else {
                    popupContent += '<h4>Feature</h4>';
                }
                
                popupContent += '<table>';
                
                for (const key in feature.properties) {
                    popupContent += `<tr><td>${key}:</td><td>${feature.properties[key]}</td></tr>`;
                }
                
                popupContent += '</table></div>';
                
                layer.bindPopup(popupContent);
            }
        }
    });
    
    // Add to custom data layers
    customDataLayers.geojson = geojsonLayer;
    
    // Add to map
    map.addLayer(geojsonLayer);
    
    // Fit bounds
    map.fitBounds(geojsonLayer.getBounds());
}

/**
 * Export map as PNG
 */
function exportPNG() {
    try {
        // Show loading indicator
        showToast("Generating PNG...", "info");
        
        // Get export options from modal
        const mapTitle = document.getElementById('export-title').value || 'Fire Department Map';
        const dpiValue = document.getElementById('export-dpi').value;
        const includeLegend = document.getElementById('export-legend').checked;
        const includeScale = document.getElementById('export-scale').checked;
        const includeNorth = document.getElementById('export-north').checked;
        
        // Calculate scale for higher DPI exports
        const dpi = parseInt(dpiValue);
        const scale = dpi / 96;
        
        // Create a temporary container to hold the map for exporting
        const exportContainer = document.createElement('div');
        exportContainer.className = 'export-container';
        exportContainer.style.width = map.getContainer().offsetWidth + 'px';
        exportContainer.style.height = map.getContainer().offsetHeight + 'px';
        exportContainer.style.position = 'absolute';
        exportContainer.style.top = '-9999px';
        exportContainer.style.left = '-9999px';
        exportContainer.style.backgroundColor = 'white';
        document.body.appendChild(exportContainer);
        
        // Create a new container for just the map content
        const mapContentContainer = document.createElement('div');
        mapContentContainer.style.width = '100%';
        mapContentContainer.style.height = '100%';
        mapContentContainer.style.overflow = 'hidden';
        mapContentContainer.style.position = 'relative';
        exportContainer.appendChild(mapContentContainer);
        
        // Get the map canvas elements - these contain the actual map without UI elements
        const mapCanvas = map.getContainer().querySelector('.leaflet-map-pane');
        if (mapCanvas) {
            // Clone just the map content, not the controls
            const mapCanvasClone = mapCanvas.cloneNode(true);
            mapContentContainer.appendChild(mapCanvasClone);
        } else {
            // Fallback to cloning the whole map if we can't find just the map pane
            const clonedMap = map.getContainer().cloneNode(true);
            
            // Remove UI elements from clone
            const uiElements = clonedMap.querySelectorAll(
                '.leaflet-control-container, .leaflet-top, .leaflet-bottom, ' +
                '.map-controls, .coords-display, .navbar, .tool-header'
            );
            uiElements.forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            
            mapContentContainer.appendChild(clonedMap);
        }
        
        // Add title banner
        const titleBanner = document.createElement('div');
        titleBanner.style.position = 'absolute';
        titleBanner.style.top = '10px';
        titleBanner.style.left = '10px';
        titleBanner.style.padding = '5px 15px';
        titleBanner.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        titleBanner.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        titleBanner.style.borderRadius = '4px';
        titleBanner.style.zIndex = '1000';
        
        const titleElement = document.createElement('h2');
        titleElement.style.margin = '0';
        titleElement.style.padding = '0';
        titleElement.style.fontSize = '18px';
        titleElement.style.fontWeight = 'bold';
        titleElement.style.color = '#d32f2f';
        titleElement.textContent = mapTitle;
        
        const subtitleElement = document.createElement('p');
        subtitleElement.style.margin = '2px 0 0 0';
        subtitleElement.style.padding = '0';
        subtitleElement.style.fontSize = '11px';
        subtitleElement.style.color = '#666';
        subtitleElement.textContent = 'Generated on ' + new Date().toLocaleDateString();
        
        titleBanner.appendChild(titleElement);
        titleBanner.appendChild(subtitleElement);
        exportContainer.appendChild(titleBanner);
        
        // Add north arrow if selected
        if (includeNorth) {
            const northArrow = document.createElement('div');
            northArrow.style.position = 'absolute';
            northArrow.style.top = '10px';
            northArrow.style.right = '10px';
            northArrow.style.width = '40px';
            northArrow.style.height = '40px';
            northArrow.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            northArrow.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            northArrow.style.borderRadius = '50%';
            northArrow.style.display = 'flex';
            northArrow.style.alignItems = 'center';
            northArrow.style.justifyContent = 'center';
            northArrow.style.zIndex = '1000';
            northArrow.innerHTML = '<i class="fas fa-arrow-up" style="color: #d32f2f; font-size: 18px;"></i>';
            
            const northLabel = document.createElement('div');
            northLabel.style.position = 'absolute';
            northLabel.style.bottom = '-6px';
            northLabel.style.left = '0';
            northLabel.style.right = '0';
            northLabel.style.textAlign = 'center';
            northLabel.style.fontSize = '10px';
            northLabel.style.fontWeight = 'bold';
            northLabel.textContent = 'N';
            
            northArrow.appendChild(northLabel);
            exportContainer.appendChild(northArrow);
        }
        
        // Add scale bar if selected
        if (includeScale) {
            const scaleBar = document.createElement('div');
            scaleBar.style.position = 'absolute';
            scaleBar.style.bottom = '10px';
            scaleBar.style.right = '10px';
            scaleBar.style.padding = '5px 10px';
            scaleBar.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            scaleBar.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            scaleBar.style.borderRadius = '4px';
            scaleBar.style.fontSize = '11px';
            scaleBar.style.zIndex = '1000';
            
            // Calculate scale based on current zoom
            const zoom = map.getZoom();
            const scale = Math.round(40075 / Math.pow(2, zoom + 8)) / 1000; // Approx. scale in km
            scaleBar.innerHTML = `
                <div style="width: 100px; height: 5px; border-bottom: 2px solid #333; border-left: 2px solid #333; border-right: 2px solid #333; margin-bottom: 3px;"></div>
                <div style="font-size: 10px; text-align: center;">~${scale} km</div>
            `;
            
            exportContainer.appendChild(scaleBar);
        }
        
        // Add legend if selected
        if (includeLegend) {
            const legend = document.createElement('div');
            legend.style.position = 'absolute';
            legend.style.bottom = '10px';
            legend.style.left = '10px';
            legend.style.padding = '10px';
            legend.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            legend.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            legend.style.borderRadius = '4px';
            legend.style.fontSize = '12px';
            legend.style.zIndex = '1000';
            legend.style.minWidth = '150px';
            
            // Add legend title
            const legendTitle = document.createElement('h4');
            legendTitle.style.margin = '0 0 5px 0';
            legendTitle.style.padding = '0';
            legendTitle.style.fontSize = '13px';
            legendTitle.style.fontWeight = 'bold';
            legendTitle.textContent = 'Legend';
            legend.appendChild(legendTitle);
            
            // Add visible layers to legend
            const legendItems = document.createElement('div');
            
            if (map.hasLayer(customDataLayers.stations)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #d32f2f; margin-right: 5px;"></div>
                        <span>Fire Stations</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.incidents)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #2196f3; margin-right: 5px;"></div>
                        <span>Incidents</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.responseZones)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 8px; background: rgba(25, 118, 210, 0.3); border: 1px solid #1976d2; margin-right: 5px;"></div>
                        <span>Response Zones</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.hydrants)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #1976d2; margin-right: 5px;"></div>
                        <span>Hydrants</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.hospitals)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #4caf50; margin-right: 5px;"></div>
                        <span>Hospitals</span>
                    </div>
                `;
            }
            
            legend.appendChild(legendItems);
            exportContainer.appendChild(legend);
        }
        
        // Use html2canvas to capture the map with added elements
        html2canvas(exportContainer, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: 'white',
            scale: scale,
            width: exportContainer.offsetWidth,
            height: exportContainer.offsetHeight
        }).then(function(canvas) {
            // Create download link
            const link = document.createElement('a');
            link.download = mapTitle.replace(/\s+/g, '_') + '_' + Date.now() + '.png';
            link.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            document.body.removeChild(exportContainer);
            showToast("PNG export complete!", "success");
            
            // Close modal
            closeModal('export-modal');
        }).catch(function(error) {
            console.error("PNG export failed:", error);
            document.body.removeChild(exportContainer);
            showToast("PNG export failed", "error");
        });
    } catch (e) {
        console.error("Error in PNG export:", e);
        showToast("Error generating PNG", "error");
    }
}

/**
 * Export map as PDF
 */
function exportPDF() {
    try {
        // Show loading indicator
        showToast("Generating PDF...", "info");
        
        // Get export options from modal
        const mapTitle = document.getElementById('export-title').value || 'Fire Department Map';
        const dpiValue = document.getElementById('export-dpi').value;
        const includeLegend = document.getElementById('export-legend').checked;
        const includeScale = document.getElementById('export-scale').checked;
        const includeNorth = document.getElementById('export-north').checked;
        
        // Calculate scale for higher DPI exports
        const dpi = parseInt(dpiValue);
        const scale = dpi / 96;
        
        // Create a temporary container to hold the map for exporting
        const exportContainer = document.createElement('div');
        exportContainer.className = 'export-container';
        exportContainer.style.width = map.getContainer().offsetWidth + 'px';
        exportContainer.style.height = map.getContainer().offsetHeight + 'px';
        exportContainer.style.position = 'absolute';
        exportContainer.style.top = '-9999px';
        exportContainer.style.left = '-9999px';
        exportContainer.style.backgroundColor = 'white';
        document.body.appendChild(exportContainer);
        
        // Create a new container for just the map content
        const mapContentContainer = document.createElement('div');
        mapContentContainer.style.width = '100%';
        mapContentContainer.style.height = '100%';
        mapContentContainer.style.overflow = 'hidden';
        mapContentContainer.style.position = 'relative';
        exportContainer.appendChild(mapContentContainer);
        
        // Get the map canvas elements - these contain the actual map without UI elements
        const mapCanvas = map.getContainer().querySelector('.leaflet-map-pane');
        if (mapCanvas) {
            // Clone just the map content, not the controls
            const mapCanvasClone = mapCanvas.cloneNode(true);
            mapContentContainer.appendChild(mapCanvasClone);
        } else {
            // Fallback to cloning the whole map if we can't find just the map pane
            const clonedMap = map.getContainer().cloneNode(true);
            
            // Remove UI elements from clone
            const uiElements = clonedMap.querySelectorAll(
                '.leaflet-control-container, .leaflet-top, .leaflet-bottom, ' +
                '.map-controls, .coords-display, .navbar, .tool-header'
            );
            uiElements.forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            
            mapContentContainer.appendChild(clonedMap);
        }
        
        // Add title banner
        const titleBanner = document.createElement('div');
        titleBanner.style.position = 'absolute';
        titleBanner.style.top = '10px';
        titleBanner.style.left = '10px';
        titleBanner.style.padding = '5px 15px';
        titleBanner.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        titleBanner.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        titleBanner.style.borderRadius = '4px';
        titleBanner.style.zIndex = '1000';
        
        const titleElement = document.createElement('h2');
        titleElement.style.margin = '0';
        titleElement.style.padding = '0';
        titleElement.style.fontSize = '18px';
        titleElement.style.fontWeight = 'bold';
        titleElement.style.color = '#d32f2f';
        titleElement.textContent = mapTitle;
        
        const subtitleElement = document.createElement('p');
        subtitleElement.style.margin = '2px 0 0 0';
        subtitleElement.style.padding = '0';
        subtitleElement.style.fontSize = '11px';
        subtitleElement.style.color = '#666';
        subtitleElement.textContent = 'Generated on ' + new Date().toLocaleDateString();
        
        titleBanner.appendChild(titleElement);
        titleBanner.appendChild(subtitleElement);
        exportContainer.appendChild(titleBanner);
        
        // Add export elements (north arrow, scale, legend) - same as in PNG export
        if (includeNorth) {
            const northArrow = document.createElement('div');
            northArrow.style.position = 'absolute';
            northArrow.style.top = '10px';
            northArrow.style.right = '10px';
            northArrow.style.width = '40px';
            northArrow.style.height = '40px';
            northArrow.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            northArrow.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            northArrow.style.borderRadius = '50%';
            northArrow.style.display = 'flex';
            northArrow.style.alignItems = 'center';
            northArrow.style.justifyContent = 'center';
            northArrow.style.zIndex = '1000';
            northArrow.innerHTML = '<i class="fas fa-arrow-up" style="color: #d32f2f; font-size: 18px;"></i>';
            
            const northLabel = document.createElement('div');
            northLabel.style.position = 'absolute';
            northLabel.style.bottom = '-6px';
            northLabel.style.left = '0';
            northLabel.style.right = '0';
            northLabel.style.textAlign = 'center';
            northLabel.style.fontSize = '10px';
            northLabel.style.fontWeight = 'bold';
            northLabel.textContent = 'N';
            
            northArrow.appendChild(northLabel);
            exportContainer.appendChild(northArrow);
        }
        
        if (includeScale) {
            const scaleBar = document.createElement('div');
            scaleBar.style.position = 'absolute';
            scaleBar.style.bottom = '10px';
            scaleBar.style.right = '10px';
            scaleBar.style.padding = '5px 10px';
            scaleBar.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            scaleBar.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            scaleBar.style.borderRadius = '4px';
            scaleBar.style.fontSize = '11px';
            scaleBar.style.zIndex = '1000';
            
            // Calculate scale based on current zoom
            const zoom = map.getZoom();
            const mapScale = Math.round(40075 / Math.pow(2, zoom + 8)) / 1000; // Approx. scale in km
            scaleBar.innerHTML = `
                <div style="width: 100px; height: 5px; border-bottom: 2px solid #333; border-left: 2px solid #333; border-right: 2px solid #333; margin-bottom: 3px;"></div>
                <div style="font-size: 10px; text-align: center;">~${mapScale} km</div>
            `;
            
            exportContainer.appendChild(scaleBar);
        }
        
        if (includeLegend) {
            const legend = document.createElement('div');
            legend.style.position = 'absolute';
            legend.style.bottom = '10px';
            legend.style.left = '10px';
            legend.style.padding = '10px';
            legend.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            legend.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            legend.style.borderRadius = '4px';
            legend.style.fontSize = '12px';
            legend.style.zIndex = '1000';
            legend.style.minWidth = '150px';
            
            // Add legend title
            const legendTitle = document.createElement('h4');
            legendTitle.style.margin = '0 0 5px 0';
            legendTitle.style.padding = '0';
            legendTitle.style.fontSize = '13px';
            legendTitle.style.fontWeight = 'bold';
            legendTitle.textContent = 'Legend';
            legend.appendChild(legendTitle);
            
            // Add visible layers to legend
            const legendItems = document.createElement('div');
            
            if (map.hasLayer(customDataLayers.stations)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #d32f2f; margin-right: 5px;"></div>
                        <span>Fire Stations</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.incidents)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #2196f3; margin-right: 5px;"></div>
                        <span>Incidents</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.responseZones)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 8px; background: rgba(25, 118, 210, 0.3); border: 1px solid #1976d2; margin-right: 5px;"></div>
                        <span>Response Zones</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.hydrants)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #1976d2; margin-right: 5px;"></div>
                        <span>Hydrants</span>
                    </div>
                `;
            }
            
            if (map.hasLayer(customDataLayers.hospitals)) {
                legendItems.innerHTML += `
                    <div style="display: flex; align-items: center; margin-bottom: 3px;">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #4caf50; margin-right: 5px;"></div>
                        <span>Hospitals</span>
                    </div>
                `;
            }
            
            legend.appendChild(legendItems);
            exportContainer.appendChild(legend);
        }
        
        // Capture the map with html2canvas
        html2canvas(exportContainer, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: 'white',
            scale: scale
        }).then(function(canvas) {
            // Convert canvas to image
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            
            // Calculate PDF orientation and size
            const width = canvas.width;
            const height = canvas.height;
            const orientation = width > height ? 'landscape' : 'portrait';
            let pdfWidth, pdfHeight;
            
            if (orientation === 'landscape') {
                pdfWidth = 297; // A4 landscape width in mm
                pdfHeight = 210; // A4 landscape height in mm
            } else {
                pdfWidth = 210; // A4 portrait width in mm
                pdfHeight = 297; // A4 portrait height in mm
            }
            
            // Create PDF with correct constructor based on context
            const pdf = (typeof jspdf === 'object' && jspdf.jsPDF) ? 
                new jspdf.jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]) : 
                new jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]);
            
            // Calculate image dimensions to fit PDF
            const aspectRatio = width / height;
            const imgWidth = pdfWidth - 20; // 10mm margin on each side
            const imgHeight = imgWidth / aspectRatio;
            
            // Add image to PDF
            pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
            
            // Add metadata in footer
            pdf.setFontSize(8);
            const center = map.getCenter();
            pdf.setTextColor(100, 100, 100);
            const footerText = `Generated by FireMapPro | Map Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} | Zoom: ${map.getZoom()} | Date: ${new Date().toLocaleDateString()}`;
            pdf.text(footerText, 10, pdfHeight - 5);
            
            // Add department logo watermark if available
            // This would be replaced with actual logo in production
            pdf.setFontSize(20);
            pdf.setTextColor(220, 220, 220);
            pdf.text("FireEMS.ai", pdfWidth - 50, pdfHeight - 10);
            
            // Add PDF metadata
            pdf.setProperties({
                title: mapTitle,
                subject: 'Fire Department Map',
                author: 'FireEMS.ai',
                keywords: 'fire, ems, map, emergency services',
                creator: 'FireMapPro'
            });
            
            // Save PDF
            pdf.save(mapTitle.replace(/\s+/g, '_') + '_' + Date.now() + '.pdf');
            showToast("PDF export complete!", "success");
            
            // Close modal
            closeModal('export-modal');
            
            // Clean up
            document.body.removeChild(exportContainer);
        }).catch(function(error) {
            console.error("PDF export failed:", error);
            document.body.removeChild(exportContainer);
            showToast("PDF export failed: " + error.message, "error");
        });
    } catch (e) {
        console.error("Error in PDF export:", e);
        showToast("Error generating PDF: " + e.message, "error");
    }
}

/**
 * Export data as GeoJSON
 */
function exportGeoJSON() {
    // Create GeoJSON object
    const geojsonData = {
        type: 'FeatureCollection',
        features: []
    };
    
    // Add drawn items
    drawnItems.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
            const feature = {
                type: 'Feature',
                properties: layer.properties || {},
                geometry: {
                    type: 'Point',
                    coordinates: [layer.getLatLng().lng, layer.getLatLng().lat]
                }
            };
            geojsonData.features.push(feature);
        } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
            const latlngs = layer.getLatLngs();
            const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
            
            const feature = {
                type: 'Feature',
                properties: layer.properties || {},
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                }
            };
            geojsonData.features.push(feature);
        } else if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs()[0];
            const coordinates = latlngs.map(latlng => [latlng.lng, latlng.lat]);
            coordinates.push(coordinates[0]); // Close the polygon
            
            const feature = {
                type: 'Feature',
                properties: layer.properties || {},
                geometry: {
                    type: 'Polygon',
                    coordinates: [coordinates]
                }
            };
            geojsonData.features.push(feature);
        }
    });
    
    // Convert to string
    const geojsonString = JSON.stringify(geojsonData, null, 2);
    
    // Create download link
    const blob = new Blob([geojsonString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'firemappro_export.geojson';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Export data as KML
 */
function exportKML() {
    try {
        showToast("Generating KML...", "info");
        
        // Initialize KML document
        const kmlDoc = document.implementation.createDocument('', '', null);
        
        // Create the KML root element
        const kmlRoot = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'kml');
        kmlDoc.appendChild(kmlRoot);
        
        // Create Document element
        const documentEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Document');
        kmlRoot.appendChild(documentEl);
        
        // Add name and description
        const nameEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'name');
        nameEl.textContent = 'FireMapPro Export';
        documentEl.appendChild(nameEl);
        
        const descriptionEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'description');
        descriptionEl.textContent = 'Created on ' + new Date().toLocaleString();
        documentEl.appendChild(descriptionEl);
        
        // Add styles
        const markerStyleEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Style');
        markerStyleEl.setAttribute('id', 'markerStyle');
        const markerIconStyleEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'IconStyle');
        const markerIconEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Icon');
        const markerHrefEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'href');
        markerHrefEl.textContent = 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png';
        markerIconEl.appendChild(markerHrefEl);
        markerIconStyleEl.appendChild(markerIconEl);
        markerStyleEl.appendChild(markerIconStyleEl);
        documentEl.appendChild(markerStyleEl);
        
        const lineStyleEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Style');
        lineStyleEl.setAttribute('id', 'lineStyle');
        const lineLineStyleEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'LineStyle');
        const lineColorEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'color');
        lineColorEl.textContent = 'ff0000ff';
        const lineWidthEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'width');
        lineWidthEl.textContent = '3';
        lineLineStyleEl.appendChild(lineColorEl);
        lineLineStyleEl.appendChild(lineWidthEl);
        lineStyleEl.appendChild(lineLineStyleEl);
        documentEl.appendChild(lineStyleEl);
        
        const polygonStyleEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Style');
        polygonStyleEl.setAttribute('id', 'polygonStyle');
        const polygonLineStyleEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'LineStyle');
        const polygonLineColorEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'color');
        polygonLineColorEl.textContent = 'ff0000ff';
        const polygonLineWidthEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'width');
        polygonLineWidthEl.textContent = '2';
        polygonLineStyleEl.appendChild(polygonLineColorEl);
        polygonLineStyleEl.appendChild(polygonLineWidthEl);
        polygonStyleEl.appendChild(polygonLineStyleEl);
        
        const polyStyleEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'PolyStyle');
        const polyColorEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'color');
        polyColorEl.textContent = '7f0000ff';
        polyStyleEl.appendChild(polyColorEl);
        polygonStyleEl.appendChild(polyStyleEl);
        documentEl.appendChild(polygonStyleEl);
        
        // Process drawn items
        let drawnFeatures = 0;
        drawnItems.eachLayer(function(layer) {
            drawnFeatures++;
            
            if (layer instanceof L.Marker) {
                // Process marker
                const latlng = layer.getLatLng();
                
                const placemarkEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Placemark');
                
                const nameEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'name');
                nameEl.textContent = 'Marker ' + drawnFeatures;
                placemarkEl.appendChild(nameEl);
                
                const styleUrlEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'styleUrl');
                styleUrlEl.textContent = '#markerStyle';
                placemarkEl.appendChild(styleUrlEl);
                
                if (layer.options.title) {
                    const descriptionEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'description');
                    descriptionEl.textContent = layer.options.title;
                    placemarkEl.appendChild(descriptionEl);
                }
                
                const pointEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Point');
                const coordsEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'coordinates');
                coordsEl.textContent = latlng.lng + ',' + latlng.lat + ',0';
                pointEl.appendChild(coordsEl);
                placemarkEl.appendChild(pointEl);
                
                documentEl.appendChild(placemarkEl);
            } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                // Process polyline
                const placemarkEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Placemark');
                
                const nameEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'name');
                nameEl.textContent = 'Line ' + drawnFeatures;
                placemarkEl.appendChild(nameEl);
                
                const styleUrlEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'styleUrl');
                styleUrlEl.textContent = '#lineStyle';
                placemarkEl.appendChild(styleUrlEl);
                
                const lineStringEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'LineString');
                const coordsEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'coordinates');
                
                // Add coordinates
                let coordsText = '';
                const latlngs = layer.getLatLngs();
                for (let i = 0; i < latlngs.length; i++) {
                    coordsText += latlngs[i].lng + ',' + latlngs[i].lat + ',0 ';
                }
                coordsEl.textContent = coordsText.trim();
                
                lineStringEl.appendChild(coordsEl);
                placemarkEl.appendChild(lineStringEl);
                documentEl.appendChild(placemarkEl);
            } else if (layer instanceof L.Polygon) {
                // Process polygon
                const placemarkEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Placemark');
                
                const nameEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'name');
                nameEl.textContent = 'Polygon ' + drawnFeatures;
                placemarkEl.appendChild(nameEl);
                
                const styleUrlEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'styleUrl');
                styleUrlEl.textContent = '#polygonStyle';
                placemarkEl.appendChild(styleUrlEl);
                
                const polygonEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Polygon');
                const outerBoundaryEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'outerBoundaryIs');
                const linearRingEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'LinearRing');
                const coordsEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'coordinates');
                
                // Add coordinates
                let coordsText = '';
                const latlngs = layer.getLatLngs()[0];
                for (let i = 0; i < latlngs.length; i++) {
                    coordsText += latlngs[i].lng + ',' + latlngs[i].lat + ',0 ';
                }
                // Close the polygon by repeating the first point
                if (latlngs.length > 0) {
                    coordsText += latlngs[0].lng + ',' + latlngs[0].lat + ',0';
                }
                
                coordsEl.textContent = coordsText.trim();
                linearRingEl.appendChild(coordsEl);
                outerBoundaryEl.appendChild(linearRingEl);
                polygonEl.appendChild(outerBoundaryEl);
                placemarkEl.appendChild(polygonEl);
                documentEl.appendChild(placemarkEl);
            }
        });
        
        // Process data layers
        for (const layerName in customDataLayers) {
            if (map.hasLayer(customDataLayers[layerName])) {
                // Create a folder for this layer
                const folderEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Folder');
                const folderNameEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'name');
                folderNameEl.textContent = layerName;
                folderEl.appendChild(folderNameEl);
                
                customDataLayers[layerName].eachLayer(function(layer) {
                    if (layer instanceof L.Marker) {
                        const latlng = layer.getLatLng();
                        const popupContent = layer._popup ? layer._popup.getContent() : '';
                        
                        const placemarkEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Placemark');
                        
                        const nameEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'name');
                        nameEl.textContent = layerName + ' Item';
                        placemarkEl.appendChild(nameEl);
                        
                        if (popupContent) {
                            const descriptionEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'description');
                            descriptionEl.textContent = popupContent;
                            placemarkEl.appendChild(descriptionEl);
                        }
                        
                        const pointEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'Point');
                        const coordsEl = kmlDoc.createElementNS('http://www.opengis.net/kml/2.2', 'coordinates');
                        coordsEl.textContent = latlng.lng + ',' + latlng.lat + ',0';
                        pointEl.appendChild(coordsEl);
                        placemarkEl.appendChild(pointEl);
                        
                        folderEl.appendChild(placemarkEl);
                    }
                });
                
                documentEl.appendChild(folderEl);
            }
        }
        
        // Serialize the KML document to string
        const serializer = new XMLSerializer();
        const kmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + 
                          serializer.serializeToString(kmlRoot);
        
        // Create download link
        const blob = new Blob([kmlString], {type: 'application/vnd.google-earth.kml+xml'});
        const link = document.createElement('a');
        link.download = 'firemap_export_' + Date.now() + '.kml';
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("KML export complete!", "success");
    } catch (e) {
        console.error("Error in KML export:", e);
        showToast("Error generating KML", "error");
    }
}

/**
 * Helper function to escape XML special characters
 */
function escapeXml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Display a toast notification
 */
function showToast(message, type = 'info') {
    // Clear any existing toast timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = message;
    
    // Style the toast
    toast.style.backgroundColor = type === 'error' ? '#f44336' : 
                                 type === 'success' ? '#4CAF50' : 
                                 type === 'warning' ? '#ff9800' : '#2196F3';
    toast.style.color = 'white';
    toast.style.padding = '12px 16px';
    toast.style.borderRadius = '4px';
    toast.style.marginTop = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.minWidth = '250px';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    
    // Add the toast to the container
    toastContainer.appendChild(toast);
    
    // Make the toast visible with a fade effect
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Set a timeout to remove the toast
    toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toastContainer.removeChild(toast);
            }
            
            // Remove container if empty
            if (toastContainer.children.length === 0) {
                document.body.removeChild(toastContainer);
            }
        }, 300);
    }, 3000);
}

/**
 * Create marker popup with edit/remove options
 */
function createMarkerPopup(marker) {
    const popupContent = document.createElement('div');
    popupContent.className = 'custom-popup';
    
    // Create title field
    const titleField = document.createElement('input');
    titleField.type = 'text';
    titleField.value = marker.options.title || 'Marker';
    titleField.className = 'popup-title-field';
    titleField.style.width = '100%';
    titleField.style.marginBottom = '10px';
    titleField.style.padding = '4px';
    titleField.style.border = '1px solid #ccc';
    titleField.style.borderRadius = '3px';
    
    // Create color selector
    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Icon Color:';
    colorLabel.style.display = 'block';
    colorLabel.style.marginBottom = '3px';
    colorLabel.style.fontSize = '12px';
    
    const colorSelector = document.createElement('select');
    colorSelector.className = 'popup-color-selector';
    colorSelector.style.width = '100%';
    colorSelector.style.marginBottom = '10px';
    colorSelector.style.padding = '4px';
    colorSelector.style.border = '1px solid #ccc';
    colorSelector.style.borderRadius = '3px';
    
    // Add color options
    const colorOptions = [
        {value: '#d32f2f', label: 'Red'},
        {value: '#1976d2', label: 'Blue'},
        {value: '#4caf50', label: 'Green'},
        {value: '#ff9800', label: 'Orange'},
        {value: '#9c27b0', label: 'Purple'},
        {value: '#607d8b', label: 'Gray'},
        {value: '#000000', label: 'Black'},
        {value: '#e91e63', label: 'Pink'},
        {value: '#ffeb3b', label: 'Yellow'},
        {value: '#009688', label: 'Teal'},
        {value: '#795548', label: 'Brown'},
        {value: '#ffffff', label: 'White'}
    ];
    
    // Get current marker color
    let currentColor = '#d32f2f';
    if (marker.options.icon && marker.options.icon.options.html) {
        const htmlContent = marker.options.icon.options.html;
        const match = htmlContent.match(/background-color:\s*([^;]+)/);
        if (match && match[1]) {
            currentColor = match[1].trim();
        }
    }
    
    colorOptions.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        if (option.value === currentColor) {
            optionEl.selected = true;
        }
        colorSelector.appendChild(optionEl);
    });
    
    // Create size selector
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Icon Size:';
    sizeLabel.style.display = 'block';
    sizeLabel.style.marginBottom = '3px';
    sizeLabel.style.fontSize = '12px';
    
    const sizeSelector = document.createElement('select');
    sizeSelector.className = 'popup-size-selector';
    sizeSelector.style.width = '100%';
    sizeSelector.style.marginBottom = '10px';
    sizeSelector.style.padding = '4px';
    sizeSelector.style.border = '1px solid #ccc';
    sizeSelector.style.borderRadius = '3px';
    
    // Add size options
    const sizeOptions = [
        {value: 'small', label: 'Small'},
        {value: 'medium', label: 'Medium'},
        {value: 'large', label: 'Large'}
    ];
    
    // Try to get current marker size
    let currentSize = 'medium';
    if (marker.options.icon && marker.options.icon.options.iconSize) {
        const iconSize = marker.options.icon.options.iconSize[0];
        if (iconSize <= 24) currentSize = 'small';
        else if (iconSize >= 36) currentSize = 'large';
    }
    
    sizeOptions.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = option.value;
        optionEl.textContent = option.label;
        if (option.value === currentSize) {
            optionEl.selected = true;
        }
        sizeSelector.appendChild(optionEl);
    });
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'popup-save-btn';
    saveBtn.style.marginRight = '5px';
    saveBtn.style.padding = '3px 10px';
    saveBtn.style.backgroundColor = '#4caf50';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '3px';
    saveBtn.style.cursor = 'pointer';
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-marker-btn';
    removeBtn.style.padding = '3px 10px';
    removeBtn.style.backgroundColor = '#f44336';
    removeBtn.style.color = 'white';
    removeBtn.style.border = 'none';
    removeBtn.style.borderRadius = '3px';
    removeBtn.style.cursor = 'pointer';
    
    // Add elements to popup
    popupContent.appendChild(titleField);
    
    // Add color selector
    popupContent.appendChild(colorLabel);
    popupContent.appendChild(colorSelector);
    
    // Add size selector
    popupContent.appendChild(sizeLabel);
    popupContent.appendChild(sizeSelector);
    
    // Add coordinates display
    const coordinates = document.createElement('p');
    coordinates.style.fontSize = '11px';
    coordinates.style.color = '#666';
    coordinates.style.margin = '10px 0 5px 0';
    coordinates.textContent = `Coordinates: ${marker.getLatLng().lat.toFixed(5)}, ${marker.getLatLng().lng.toFixed(5)}`;
    popupContent.appendChild(coordinates);
    
    // Add buttons
    const buttonDiv = document.createElement('div');
    buttonDiv.style.marginTop = '10px';
    buttonDiv.style.display = 'flex';
    buttonDiv.style.justifyContent = 'space-between';
    buttonDiv.appendChild(saveBtn);
    buttonDiv.appendChild(removeBtn);
    popupContent.appendChild(buttonDiv);
    
    // Save icon data for reference
    let iconName = 'fa-map-marker';
    if (marker.options.icon && marker.options.icon.options.html) {
        const match = marker.options.icon.options.html.match(/fa-[a-z-]+/);
        if (match && match[0]) {
            iconName = match[0];
        }
    }
    
    // Add event handlers
    saveBtn.addEventListener('click', function() {
        marker.options.title = titleField.value;
        
        // Update marker icon
        const newColor = colorSelector.value;
        const newSize = sizeSelector.value;
        
        // Get the icon name from the original marker
        const newIcon = createCustomIcon(iconName, newColor, newSize);
        marker.setIcon(newIcon);
        
        marker.closePopup();
    });
    
    return popupContent;
}

/**
 * Toggle map title visibility
 */
function toggleMapTitle() {
    const titleContainer = document.getElementById('map-title-container');
    titleContainer.classList.toggle('hidden');
    
    if (!titleContainer.classList.contains('hidden') && 
        !document.getElementById('map-title').textContent.trim()) {
        // If showing title but it's empty, show modal
        showMapTitleModal();
    }
}

/**
 * Show map title edit modal
 */
function showMapTitleModal() {
    const modal = document.getElementById('map-title-modal');
    
    // Populate the form with current values
    document.getElementById('map-title-input').value = document.getElementById('map-title').textContent;
    document.getElementById('map-subtitle-input').value = document.getElementById('map-subtitle').textContent;
    
    // Show the modal
    modal.style.display = 'flex';
}

/**
 * Apply map title changes
 */
function applyMapTitle() {
    const title = document.getElementById('map-title-input').value;
    const subtitle = document.getElementById('map-subtitle-input').value;
    const position = document.getElementById('map-title-position').value;
    
    // Update the title elements
    document.getElementById('map-title').textContent = title;
    document.getElementById('map-subtitle').textContent = subtitle;
    
    // Update position
    const titleContainer = document.getElementById('map-title-container');
    titleContainer.className = 'map-title-container';
    
    if (position === 'topleft') {
        titleContainer.style.left = '10px';
        titleContainer.style.transform = 'none';
    } else if (position === 'topright') {
        titleContainer.style.left = 'auto';
        titleContainer.style.right = '10px';
        titleContainer.style.transform = 'none';
    } else { // top center
        titleContainer.style.left = '50%';
        titleContainer.style.right = 'auto';
        titleContainer.style.transform = 'translateX(-50%)';
    }
    
    // Show the title
    titleContainer.classList.remove('hidden');
    
    // Close the modal
    closeModal('map-title-modal');
}

/**
 * Handle logo file upload for map title
 */
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Display file name
    document.getElementById('map-logo-file-name').textContent = file.name;
    
    // Read the file and preview it
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoPreview = document.getElementById('map-logo-preview');
        logoPreview.style.backgroundImage = `url(${e.target.result})`;
        
        // Also set it on the map
        const mapLogo = document.getElementById('map-logo');
        mapLogo.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(file);
}

/**
 * Handle logo file upload for export
 */
function handleExportLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Display file name
    document.getElementById('logo-file-name').textContent = file.name;
    
    // Read the file and preview it
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoPreview = document.getElementById('logo-preview');
        logoPreview.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(file);
}