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
                
                console.log("Emergency map initialization successful");
                
                // Stop checking once map is initialized
                clearInterval(checkMap);
            } catch (error) {
                console.error("Error initializing map:", error);
            }
        } else if (mapElement && mapElement._leaflet_id) {
            // Map is already initialized
            console.log("Map already initialized");
            clearInterval(checkMap);
        }
    }, 1000);
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
        
        // Monitor for draggable elements to make them draggable
        document.addEventListener('DOMNodeInserted', function(event) {
            if (event.target && event.target.classList && event.target.classList.contains('layout-element')) {
                if (typeof makeElementDraggable === 'function') {
                    try {
                        makeElementDraggable(event.target);
                    } catch (error) {
                        console.warn("Could not make element draggable:", error);
                    }
                }
            }
        });
        
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