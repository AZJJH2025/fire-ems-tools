/**
 * FireMapPro fixes to ensure export functionality works properly with the Layout Designer
 */

// Store original functions to avoid conflicts
let originalInitFunctions = {};

/**
 * Safely enhance a function without breaking existing functionality
 */
function safelyEnhanceFunction(objectContext, functionName, enhancer) {
    // Store original function if it exists
    if (typeof objectContext[functionName] === 'function') {
        originalInitFunctions[functionName] = objectContext[functionName];
        
        // Replace with enhanced version
        objectContext[functionName] = function() {
            // Call original function first
            const result = originalInitFunctions[functionName].apply(this, arguments);
            
            // Then call enhancer
            try {
                enhancer.apply(this, arguments);
            } catch (error) {
                console.error(`Error in enhanced ${functionName}:`, error);
            }
            
            return result;
        };
        
        console.log(`Successfully enhanced ${functionName}`);
    } else {
        console.warn(`Function ${functionName} not found, creating new function`);
        objectContext[functionName] = enhancer;
    }
}

/**
 * Setup layout element image upload capabilities
 */
function setupLayoutImageUploads() {
    console.log("Setting up layout image upload handlers");
    
    // Add delegate event listener for layout image upload buttons
    document.addEventListener('click', function(event) {
        // Check if target is an upload button or inside one
        const uploadBtn = event.target.closest('.layout-image-upload-btn');
        if (!uploadBtn) return;
        
        // Find the parent layout element
        const layoutElement = uploadBtn.closest('.layout-element');
        if (!layoutElement || layoutElement.getAttribute('data-element-type') !== 'image') return;
        
        // Create a hidden file input if it doesn't exist
        let fileInput = document.getElementById('layout-element-image-uploader');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'layout-element-image-uploader';
            fileInput.style.display = 'none';
            fileInput.accept = 'image/*';
            document.body.appendChild(fileInput);
            
            // Add change event listener to the file input
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const file = this.files[0];
                    const reader = new FileReader();
                    
                    // Get the currently active layout element
                    const activeElement = document.querySelector('.layout-element.active');
                    if (!activeElement || activeElement.getAttribute('data-element-type') !== 'image') {
                        console.warn("No active image element found for upload");
                        return;
                    }
                    
                    // Read file and update image
                    reader.onload = function(e) {
                        // Find placeholder or create image
                        let imgContainer = activeElement.querySelector('.image-placeholder');
                        if (imgContainer) {
                            // Clear placeholder
                            imgContainer.innerHTML = '';
                        } else {
                            // Create container if it doesn't exist
                            imgContainer = document.createElement('div');
                            imgContainer.className = 'image-placeholder';
                            activeElement.appendChild(imgContainer);
                        }
                        
                        // Create image element
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.objectFit = 'contain';
                        imgContainer.appendChild(img);
                        
                        // Store image src as data attribute for export
                        activeElement.setAttribute('data-image-src', e.target.result);
                        
                        console.log("Image uploaded to layout element");
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
        }
        
        // Set currently clicked element as active
        document.querySelectorAll('.layout-element').forEach(el => el.classList.remove('active'));
        layoutElement.classList.add('active');
        
        // Trigger file select
        fileInput.click();
    });
}

/**
 * Enhance image handling in layout designer
 */
function enhanceLayoutImageHandling() {
    // Create safe capture function that won't break existing code
    if (typeof window.captureLayoutForExport === 'function') {
        console.log("Enhancing captureLayoutForExport function");
        
        // Store original function
        const originalCaptureLayout = window.captureLayoutForExport;
        
        // Replace with enhanced version
        window.captureLayoutForExport = function() {
            console.log("Enhanced layout capture running...");
            
            try {
                // Call original function first
                const result = originalCaptureLayout.apply(this, arguments);
                
                // Additional enhancement: ensure images are properly captured
                const layoutConfig = window.currentLayoutConfig;
                if (layoutConfig && layoutConfig.elements) {
                    let updated = false;
                    
                    layoutConfig.elements.forEach(element => {
                        if (element.type === 'image' && !element.content) {
                            // Find the actual element in DOM by position
                            const paperSheet = document.getElementById('layout-paper-sheet') || 
                                              document.querySelector('.paper-sheet');
                            
                            if (paperSheet) {
                                const domElements = paperSheet.querySelectorAll('.layout-element[data-element-type="image"]');
                                
                                // Try to find matching element
                                domElements.forEach(domEl => {
                                    const styles = {
                                        left: domEl.style.left,
                                        top: domEl.style.top,
                                        width: domEl.style.width,
                                        height: domEl.style.height
                                    };
                                    
                                    // Check if positions match approximately
                                    if (styles.left === element.styles.left && 
                                        styles.top === element.styles.top) {
                                        
                                        // Get image source from DOM element
                                        const img = domEl.querySelector('img');
                                        if (img && img.src) {
                                            console.log("Found image source from DOM element");
                                            element.content = img.src;
                                            updated = true;
                                        } else if (domEl.hasAttribute('data-image-src')) {
                                            element.content = domEl.getAttribute('data-image-src');
                                            updated = true;
                                        }
                                    }
                                });
                            }
                        }
                    });
                    
                    if (updated) {
                        console.log("Updated layout config with image sources");
                    }
                }
                
                return result;
            } catch (error) {
                console.error("Error in enhanced captureLayoutForExport:", error);
                // Fall back to original if enhancement fails
                return originalCaptureLayout.apply(this, arguments);
            }
        };
    }
    
    // Fix tab handling
    setTimeout(function() {
        const basicTab = document.querySelector('.modal-tab[data-tab="export-basic"]');
        const advancedTab = document.querySelector('.modal-tab[data-tab="export-advanced"]');
        const layoutTab = document.querySelector('.modal-tab[data-tab="layout-designer"]');
        
        // Only attach if elements exist and don't have listeners already
        if (basicTab && !basicTab._enhanced) {
            basicTab._enhanced = true;
            basicTab.addEventListener('click', function() {
                document.querySelector('#export-basic-panel').style.display = 'block';
                document.querySelector('#export-advanced-panel').style.display = 'none';
                document.querySelector('#layout-designer-panel').style.display = 'none';
                
                document.querySelector('.modal-tab[data-tab="export-basic"]').classList.add('active');
                document.querySelector('.modal-tab[data-tab="export-advanced"]').classList.remove('active');
                document.querySelector('.modal-tab[data-tab="layout-designer"]').classList.remove('active');
            });
        }
        
        if (advancedTab && !advancedTab._enhanced) {
            advancedTab._enhanced = true;
            advancedTab.addEventListener('click', function() {
                document.querySelector('#export-basic-panel').style.display = 'none';
                document.querySelector('#export-advanced-panel').style.display = 'block';
                document.querySelector('#layout-designer-panel').style.display = 'none';
                
                document.querySelector('.modal-tab[data-tab="export-basic"]').classList.remove('active');
                document.querySelector('.modal-tab[data-tab="export-advanced"]').classList.add('active');
                document.querySelector('.modal-tab[data-tab="layout-designer"]').classList.remove('active');
            });
        }
        
        if (layoutTab && !layoutTab._enhanced) {
            layoutTab._enhanced = true;
            layoutTab.addEventListener('click', function() {
                document.querySelector('#export-basic-panel').style.display = 'none';
                document.querySelector('#export-advanced-panel').style.display = 'none';
                document.querySelector('#layout-designer-panel').style.display = 'block';
                
                document.querySelector('.modal-tab[data-tab="export-basic"]').classList.remove('active');
                document.querySelector('.modal-tab[data-tab="export-advanced"]').classList.remove('active');
                document.querySelector('.modal-tab[data-tab="layout-designer"]').classList.add('active');
                
                // Initialize layout designer when switching to this tab
                if (typeof initializeLayoutDesigner === 'function') {
                    try {
                        initializeLayoutDesigner();
                    } catch (error) {
                        console.warn("Could not initialize layout designer:", error);
                    }
                }
            });
        }
    }, 1000); // Give time for the DOM to be ready
}

/**
 * Make sure map initialization is not affected
 */
function ensureMapWorks() {
    // Check if map is initialized
    const checkMap = setInterval(function() {
        const mapElement = document.getElementById('map');
        
        if (mapElement && !mapElement._leaflet_id && typeof L !== 'undefined') {
            console.log("Map not initialized, initializing now");
            
            try {
                // Initialize map with standard options
                const map = L.map('map', {
                    center: [39.8283, -98.5795], // Center of the US
                    zoom: 5,
                    zoomControl: true,
                    maxZoom: 18
                });
                
                // Add default tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // Store map instance globally to make it accessible to other functions
                window.map = map;
                
                // Create a custom property on L.map to access the instance
                L.map.instance = map;
                
                console.log("Emergency map initialization successful");
                
                // Setup draggable icons once the map is ready
                setupDraggableIcons(map);
                
                // Stop checking once map is initialized
                clearInterval(checkMap);
            } catch (error) {
                console.error("Error initializing map:", error);
            }
        } else if (mapElement && mapElement._leaflet_id) {
            // Map is already initialized - get its instance
            try {
                // Try to get map from Leaflet's internal container
                if (!window.map) {
                    // Get map instance from Leaflet - handle different Leaflet versions
                    const mapId = mapElement._leaflet_id;
                    
                    // Try multiple approaches to get the map instance
                    try {
                        // Method 1: Using getMap (some Leaflet versions)
                        if (L.map && typeof L.map.getMap === 'function') {
                            window.map = L.map.getMap(mapId);
                        }
                        // Method 2: Check for _map property (common in many versions)
                        else if (mapElement._map) {
                            window.map = mapElement._map;
                        }
                        // Method 3: Check for map in leaflet's internal structure 
                        else if (mapElement._leaflet) {
                            window.map = Object.values(mapElement._leaflet).find(obj => obj && obj._zoom !== undefined);
                        }
                        // Method 4: Check global L.maps object if it exists
                        else if (L.maps && L.maps[mapId]) {
                            window.map = L.maps[mapId];
                        }
                        // Method 5: Last resort - look for map-like objects attached to mapElement
                        else {
                            for (const key in mapElement) {
                                if (key.startsWith('_') && 
                                    typeof mapElement[key] === 'object' && 
                                    mapElement[key] !== null && 
                                    ('_zoom' in mapElement[key] || 'getCenter' in mapElement[key])) {
                                    window.map = mapElement[key];
                                    break;
                                }
                            }
                        }
                    } catch (err) {
                        console.warn("Error getting map instance with standard methods:", err);
                    }
                    
                    if (window.map) {
                        L.map.instance = window.map;
                        setupDraggableIcons(window.map);
                    }
                }
            } catch (e) {
                console.error("Error accessing map instance:", e);
            }
            
            console.log("Map already initialized");
            clearInterval(checkMap);
        }
    }, 1000);
}

/**
 * Setup drag and drop functionality for map icons
 */
function setupDraggableIcons(map) {
    if (!map) return;
    
    const draggableIcons = document.querySelectorAll('.draggable-icon');
    
    draggableIcons.forEach(icon => {
        if (icon._hasDragListeners) return; // Skip if already set up
        
        icon.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-icon'));
            this.classList.add('dragging');
        });
        
        icon.addEventListener('dragend', function(e) {
            this.classList.remove('dragging');
        });
        
        icon._hasDragListeners = true;
    });
    
    // Setup the map as a drop target
    const mapContainer = document.getElementById('map');
    if (mapContainer && !mapContainer._hasDropListeners) {
        mapContainer.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drop-hover');
        });
        
        mapContainer.addEventListener('dragleave', function(e) {
            this.classList.remove('drop-hover');
        });
        
        mapContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drop-hover');
            
            const iconType = e.dataTransfer.getData('text/plain');
            if (!iconType) return;
            
            // Get the map coordinates where the icon was dropped
            const rect = mapContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Convert pixel coordinates to map coordinates
            const point = L.point(x, y);
            const latlng = map.containerPointToLatLng(point);
            
            // Create and add a marker for the icon
            const marker = L.marker(latlng, {
                icon: L.divIcon({
                    className: 'custom-marker map-icon',
                    html: `<i class="fas ${iconType}"></i>`,
                    iconSize: [30, 30]
                }),
                draggable: true
            }).addTo(map);
            
            // Add popup with icon info
            marker.bindPopup(`<div class="icon-popup">
                <h4>Icon Marker</h4>
                <button class="delete-icon" onclick="this.closest('.leaflet-popup').marker.remove()">Remove</button>
            </div>`);
            
            // Store marker reference in popup for easy deletion
            marker.on('popupopen', function(e) {
                e.popup.marker = marker;
            });
            
            console.log("Added icon marker at", latlng);
        });
        
        mapContainer._hasDropListeners = true;
    }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("FireMapPro fixes initializing");
    
    // Wait to ensure all libraries are loaded
    setTimeout(function() {
        enhanceLayoutImageHandling();
        ensureMapWorks();
        setupLayoutImageUploads();
        
        // Remove any potential deprecated DOMNodeInserted event listeners
        // This is a safety measure in case any libraries are using them
        
        // Remove jQuery-based event listeners if jQuery is present
        if (window.jQuery) {
            try {
                // For jQuery-based event handlers
                jQuery(document).off('DOMNodeInserted');
                jQuery('*').off('DOMNodeInserted');
                console.log("Removed any jQuery DOMNodeInserted listeners");
            } catch (e) {
                console.warn("Error removing jQuery event listeners:", e);
            }
        }
        
        // Special handling for direct DOM event listeners
        try {
            // Create a patch for addEventListener to prevent future DOMNodeInserted listeners
            const originalAddEventListener = EventTarget.prototype.addEventListener;
            EventTarget.prototype.addEventListener = function(type, listener, options) {
                if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved' || type === 'DOMAttrModified' ||
                    type === 'DOMSubtreeModified' || type === 'DOMCharacterDataModified') {
                    console.warn(`Prevented deprecated mutation event: ${type}`);
                    
                    // Instead of adding the deprecated listener, suggest using MutationObserver
                    console.info("Use MutationObserver instead of deprecated DOM mutation events");
                    
                    // Don't add the event listener
                    return;
                }
                
                // For all other event types, proceed normally
                return originalAddEventListener.call(this, type, listener, options);
            };
            console.log("Patched addEventListener to prevent deprecated mutation events");
        } catch (e) {
            console.warn("Error patching addEventListener:", e);
        }
        
        // Monitor for draggable elements using MutationObserver (modern approach)
        const layoutObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    Array.from(mutation.addedNodes).forEach(function(node) {
                        if (node.classList && node.classList.contains('layout-element')) {
                            if (typeof makeElementDraggable === 'function') {
                                try {
                                    setTimeout(function() {
                                        makeElementDraggable(node);
                                    }, 0);
                                } catch (error) {
                                    console.warn("Could not make element draggable:", error);
                                }
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document or layout container
        const layoutContainer = document.querySelector('.layout-canvas') || document.body;
        layoutObserver.observe(layoutContainer, { childList: true, subtree: true });
        
        // Monitor for map container and initialize if needed
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    Array.from(mutation.addedNodes).forEach(function(node) {
                        if (node.id === 'map' || (node.querySelector && node.querySelector('#map'))) {
                            ensureMapWorks();
                        }
                        
                        // Check for layout designer panel becoming visible
                        if (node.id === 'layout-designer-panel' || 
                            (node.classList && node.classList.contains('layout-designer-container'))) {
                            console.log("Layout designer panel detected, initializing");
                            if (typeof initializeLayoutDesigner === 'function') {
                                try {
                                    setTimeout(initializeLayoutDesigner, 100);
                                } catch (error) {
                                    console.warn("Could not initialize layout designer:", error);
                                }
                            }
                        }
                    });
                }
            });
        });
        
        // Start observing the document body
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log("FireMapPro fixes applied");
    }, 1000);
});