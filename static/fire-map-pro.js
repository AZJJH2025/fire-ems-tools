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
        
        baseLayers.terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>',
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
    
    // Export buttons
    document.getElementById('export-png').addEventListener('click', exportPNG);
    document.getElementById('export-pdf').addEventListener('click', function() {
        showExportModal('pdf');
    });
    document.getElementById('export-data').addEventListener('click', function() {
        showExportModal('data');
    });
    
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
function createCustomIcon(iconName, color) {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color};" class="custom-marker">
                <i class="fas ${iconName}"></i>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
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
        
        // Create a marker at that position
        const marker = L.marker(latlng, {
            icon: createCustomIcon(iconName, '#d32f2f'),
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
    
    // Create hotspot layer
    hotspotLayer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'},
        minOpacity: intensityValue
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
    alert('Distance analysis tool coming soon!');
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
    // Simple KML parser
    alert('KML import coming soon!');
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
    alert('PNG export coming soon!');
}

/**
 * Export map as PDF
 */
function exportPDF() {
    alert('PDF export coming soon!');
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
    alert('KML export coming soon!');
}