// Add missing function definitions
/**
 * Open a modal dialog
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        
        // Initialize the export-modal tabs
        if (modalId === 'export-modal') {
            const defaultTab = modal.querySelector('.modal-tab[data-tab="export-basic"]');
            if (defaultTab) {
                // Set the first tab as active
                defaultTab.classList.add('active');
                
                // Show the corresponding panel
                const panel = document.getElementById('export-basic-panel');
                if (panel) {
                    panel.style.display = 'block';
                }
            }
            
            // Hide other panels
            document.getElementById('export-advanced-panel').style.display = 'none';
            document.getElementById('layout-designer-panel').style.display = 'none';
        }
    }
}

/**
 * Close a modal dialog
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Initialize layout designer functionality
 */
function initializeLayoutDesigner() {
    console.log("Initializing layout designer");
    
    // Get layout elements and canvas
    const layoutElements = document.querySelectorAll('.layout-element-item');
    const layoutCanvas = document.getElementById('layout-canvas');
    const paperSheet = document.querySelector('.paper-sheet');
    
    if (!layoutCanvas) {
        console.warn("Layout canvas not found");
        return;
    }
    
    // Orientation change handler
    const orientationSelect = document.getElementById('layout-orientation');
    if (orientationSelect) {
        orientationSelect.addEventListener('change', function() {
            if (paperSheet) {
                if (this.value === 'landscape') {
                    paperSheet.classList.add('landscape');
                    paperSheet.classList.remove('portrait');
                } else {
                    paperSheet.classList.add('portrait');
                    paperSheet.classList.remove('landscape');
                }
            }
        });
    }
    
    // Template selection handler
    const templateItems = document.querySelectorAll('.template-item');
    console.log("Found template items:", templateItems.length);
    if (templateItems.length > 0) {
        templateItems.forEach(item => {
            item.addEventListener('click', function() {
                const templateName = this.getAttribute('data-template');
                console.log("Template clicked:", templateName);
                applyMapTemplate(templateName);
                
                // Highlight selected template
                templateItems.forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    }
}

/**
 * Initialize file uploads
 */
function setupFileUploads() {
    console.log("Setting up file upload handlers...");
    
    // Handle logo file uploads in export modal
    const logoFileInput = document.getElementById('logo-file');
    const logoFileName = document.getElementById('logo-file-name');
    const logoPreview = document.getElementById('logo-preview');
    
    if (logoFileInput) {
        logoFileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const reader = new FileReader();
                
                // Update file name display
                if (logoFileName) {
                    logoFileName.textContent = file.name;
                }
                
                // Create preview
                reader.onload = function(e) {
                    console.log("Logo loaded successfully");
                    
                    // Update preview if it exists
                    if (logoPreview) {
                        logoPreview.innerHTML = `<img src="${e.target.result}" style="max-width:100%;max-height:80px;">`;
                    }
                    
                    // Store the logo data for export
                    window.exportLogoSrc = e.target.result;
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
}

/**
 * Apply a map template to the layout designer
 */
function applyMapTemplate(templateName) {
    console.log("Applying template:", templateName);
    
    // Find the paper sheet element
    const paperSheet = document.getElementById('layout-paper-sheet') || document.querySelector('.paper-sheet');
    
    if (!paperSheet) {
        console.error("Paper sheet element not found");
        return;
    }
    
    // Clear current content
    paperSheet.innerHTML = '';
    
    // Apply template based on name
    if (templateName === 'standard') {
        paperSheet.innerHTML = `
            <div class="layout-element" data-element-type="map" style="left: 5%; top: 15%; width: 90%; height: 65%;">
                <div class="element-handle"></div>
                <div class="map-placeholder">Map Content</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="title" style="left: 5%; top: 5%; width: 90%; height: 8%;">
                <div class="element-handle"></div>
                <h3>Map Title</h3>
                <p>Subtitle text</p>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="legend" style="left: 5%; top: 82%; width: 45%; height: 15%;">
                <div class="element-handle"></div>
                <div class="legend-title">Legend</div>
                <div class="legend-content"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="scale-bar" style="left: 60%; top: 85%; width: 25%; height: 5%;">
                <div class="element-handle"></div>
                <div class="scale-bar-graphic"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="north-arrow" style="left: 85%; top: 85%; width: 8%; height: 10%;">
                <div class="element-handle"></div>
                <i class="fas fa-arrow-up"></i>
                <button class="delete-element">×</button>
            </div>
        `;
    } else if (templateName === 'professional') {
        paperSheet.innerHTML = `
            <div class="layout-element" data-element-type="map" style="left: 5%; top: 15%; width: 65%; height: 70%;">
                <div class="element-handle"></div>
                <div class="map-placeholder">Map Content</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="title" style="left: 5%; top: 5%; width: 90%; height: 8%;">
                <div class="element-handle"></div>
                <h3>Professional Map</h3>
                <p>Department of Geographic Information</p>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="legend" style="left: 72%; top: 15%; width: 23%; height: 40%;">
                <div class="element-handle"></div>
                <div class="legend-title">Legend</div>
                <div class="legend-content"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="text" style="left: 72%; top: 58%; width: 23%; height: 15%;">
                <div class="element-handle"></div>
                <div class="text-content">Notes and comments about the map can go here. Include important information for readers.</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="scale-bar" style="left: 5%; top: 87%; width: 25%; height: 5%;">
                <div class="element-handle"></div>
                <div class="scale-bar-graphic"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="north-arrow" style="left: 35%; top: 85%; width: 8%; height: 10%;">
                <div class="element-handle"></div>
                <i class="fas fa-arrow-up"></i>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="image" style="left: 72%; top: 76%; width: 23%; height: 10%;">
                <div class="element-handle"></div>
                <div class="image-placeholder"><i class="fas fa-image"></i></div>
                <button class="layout-image-upload-btn" title="Select Image"><i class="fas fa-upload"></i></button>
                <button class="delete-element">×</button>
            </div>
        `;
    } else if (templateName === 'presentation') {
        // Set landscape orientation
        paperSheet.classList.add('landscape');
        paperSheet.classList.remove('portrait');
        
        // Update orientation select if it exists
        const orientationSelect = document.getElementById('layout-orientation');
        if (orientationSelect) {
            orientationSelect.value = 'landscape';
        }
        
        paperSheet.innerHTML = `
            <div class="layout-element" data-element-type="map" style="left: 5%; top: 20%; width: 90%; height: 65%;">
                <div class="element-handle"></div>
                <div class="map-placeholder">Map Content</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="title" style="left: 5%; top: 5%; width: 90%; height: 10%;">
                <div class="element-handle"></div>
                <h3>Presentation Map</h3>
                <p>For screen display and presentations</p>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="legend" style="left: 5%; top: 88%; width: 55%; height: 8%;">
                <div class="element-handle"></div>
                <div class="legend-title">Legend</div>
                <div class="legend-content"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="scale-bar" style="left: 63%; top: 88%; width: 20%; height: 4%;">
                <div class="element-handle"></div>
                <div class="scale-bar-graphic"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="north-arrow" style="left: 88%; top: 86%; width: 6%; height: 8%;">
                <div class="element-handle"></div>
                <i class="fas fa-arrow-up"></i>
                <button class="delete-element">×</button>
            </div>
        `;
    } else if (templateName === 'tactical') {
        // Set landscape orientation
        paperSheet.classList.add('landscape');
        paperSheet.classList.remove('portrait');
        
        // Update orientation select if it exists
        const orientationSelect = document.getElementById('layout-orientation');
        if (orientationSelect) {
            orientationSelect.value = 'landscape';
        }
        
        paperSheet.innerHTML = `
            <div class="layout-element" data-element-type="map" style="left: 25%; top: 10%; width: 70%; height: 80%;">
                <div class="element-handle"></div>
                <div class="map-placeholder">Map Content</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="title" style="left: 25%; top: 2%; width: 70%; height: 6%;">
                <div class="element-handle"></div>
                <h3>Tactical Response Map</h3>
                <p>For emergency planning and response</p>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="legend" style="left: 3%; top: 10%; width: 18%; height: 35%;">
                <div class="element-handle"></div>
                <div class="legend-title">Legend</div>
                <div class="legend-content"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="text" style="left: 3%; top: 48%; width: 18%; height: 12%;">
                <div class="element-handle"></div>
                <div class="text-content">Incident Info</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="text" style="left: 3%; top: 63%; width: 18%; height: 12%;">
                <div class="element-handle"></div>
                <div class="text-content">Resources</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="text" style="left: 3%; top: 78%; width: 18%; height: 12%;">
                <div class="element-handle"></div>
                <div class="text-content">Hazards</div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="scale-bar" style="left: 48%; top: 92%; width: 25%; height: 4%;">
                <div class="element-handle"></div>
                <div class="scale-bar-graphic"></div>
                <button class="delete-element">×</button>
            </div>
            <div class="layout-element" data-element-type="north-arrow" style="left: 84%; top: 90%; width: 6%; height: 8%;">
                <div class="element-handle"></div>
                <i class="fas fa-arrow-up"></i>
                <button class="delete-element">×</button>
            </div>
        `;
    }
    
    // Add draggable behavior to the elements
    paperSheet.querySelectorAll('.layout-element').forEach(element => {
        makeElementDraggable(element);
    });
}

/**
 * Make an element draggable
 */
function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    const handle = element.querySelector('.element-handle');
    if (handle) {
        handle.onmousedown = dragMouseDown;
    } else {
        element.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        element.classList.add('active');
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        const container = element.parentElement;
        if (!container) return;
        
        // Get current position
        const currentLeft = element.offsetLeft - pos1;
        const currentTop = element.offsetTop - pos2;
        
        // Calculate percentages
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        const leftPercent = (currentLeft / containerWidth * 100).toFixed(2);
        const topPercent = (currentTop / containerHeight * 100).toFixed(2);
        
        // Set new position
        element.style.left = leftPercent + '%';
        element.style.top = topPercent + '%';
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        element.classList.remove('active');
    }
}

/**
 * Initialize event handlers for export buttons and export confirmation
 */
function initializeExportHandlers() {
    // Basic export buttons
    const exportPngBtn = document.getElementById('export-png');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportDataBtn = document.getElementById('export-data');
    
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', function() {
            openModal('export-modal');
            // Set PNG as selected format
            const formatSelect = document.getElementById('export-format');
            if (formatSelect) formatSelect.value = 'png';
        });
    }
    
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            openModal('export-modal');
            // Set PDF as selected format
            const formatSelect = document.getElementById('export-format');
            if (formatSelect) formatSelect.value = 'pdf';
        });
    }
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            openModal('export-modal');
            // Set GeoJSON as selected format
            const formatSelect = document.getElementById('export-format');
            if (formatSelect) formatSelect.value = 'geojson';
        });
    }
    
    // Export confirmation button handler
    const exportConfirmBtn = document.getElementById('export-confirm');
    if (exportConfirmBtn) {
        exportConfirmBtn.addEventListener('click', function() {
            const formatSelect = document.getElementById('export-format');
            const selectedFormat = formatSelect ? formatSelect.value : 'png';
            
            // Check which tab is active
            const layoutDesignerTab = document.querySelector('.modal-tab[data-tab="layout-designer"].active');
            const advancedTab = document.querySelector('.modal-tab[data-tab="export-advanced"].active');
            
            const isLayoutDesignerActive = !!layoutDesignerTab;
            const isAdvancedActive = !!advancedTab;
            
            console.log("Export confirmation clicked, format:", selectedFormat, 
                       "layout active:", isLayoutDesignerActive, 
                       "advanced active:", isAdvancedActive);
            
            // Gather export settings based on active tab
            let exportSettings = {
                format: selectedFormat,
                activeTab: isLayoutDesignerActive ? 'layout-designer' : 
                          isAdvancedActive ? 'export-advanced' : 'export-basic'
            };
            
            // Add settings from the active tab
            if (isLayoutDesignerActive) {
                exportSettings = {
                    ...exportSettings,
                    layout: captureLayoutConfiguration(),
                    orientation: document.getElementById('layout-orientation').value
                };
                
                // Use print preview for layout exports for now
                showPrintPreview(exportSettings);
            } else if (isAdvancedActive) {
                // Advanced export settings
                exportSettings = {
                    ...exportSettings,
                    colorMode: document.getElementById('color-mode').value,
                    colorProfile: document.getElementById('color-profile').value,
                    customWidth: document.getElementById('print-width').value,
                    customHeight: document.getElementById('print-height').value,
                    units: document.getElementById('print-units').value,
                    bleed: document.getElementById('export-bleed').checked,
                    cropMarks: document.getElementById('export-crop-marks').checked,
                    colorBars: document.getElementById('export-color-bars').checked,
                    registrationMarks: document.getElementById('export-registration-marks').checked,
                    embedICC: document.getElementById('export-icc').checked,
                    tiledPrinting: document.getElementById('export-tile-print').checked
                };
                
                // Check if specific layers were selected
                if (!document.getElementById('export-all-layers').checked) {
                    const layersList = document.getElementById('export-layers-list');
                    if (layersList) {
                        const selectedLayers = Array.from(layersList.querySelectorAll('input[type="checkbox"]:checked'))
                            .map(checkbox => checkbox.value);
                        exportSettings.selectedLayers = selectedLayers;
                    }
                }
                
                // Call export with advanced settings
                exportMapWithSettings(exportSettings);
            } else {
                // Basic export settings
                exportSettings = {
                    ...exportSettings,
                    title: document.getElementById('export-title').value,
                    subtitle: document.getElementById('export-subtitle').value,
                    logo: window.exportLogoSrc,
                    dpi: document.getElementById('export-dpi').value,
                    paperSize: document.getElementById('paper-preset').value,
                    includeLegend: document.getElementById('export-legend').checked,
                    includeScale: document.getElementById('export-scale').checked,
                    includeNorth: document.getElementById('export-north').checked,
                    includeTitle: document.getElementById('export-title-element').checked
                };
                
                // Call export with basic settings
                exportMapWithSettings(exportSettings);
            }
            
            // Close the modal after starting the export
            closeModal('export-modal');
        });
    } else {
        console.error("Export confirm button not found!");
    }
    
    // Cancel button handler
    const exportCancelBtn = document.getElementById('export-cancel');
    if (exportCancelBtn) {
        exportCancelBtn.addEventListener('click', function() {
            closeModal('export-modal');
        });
    }
}

/**
 * Update export format options based on selected tab
 */
function updateExportFormatOptions(activeTabId) {
    const formatSelect = document.getElementById('export-format');
    if (!formatSelect) return;
    
    // Enable/disable options based on tab
    const formatOptions = formatSelect.querySelectorAll('option');
    
    if (activeTabId === 'layout-designer') {
        // Layout designer works best with PDF and high-quality raster formats
        formatOptions.forEach(option => {
            if (['pdf', 'png', 'jpg'].includes(option.value)) {
                option.disabled = false;
            } else if (['svg', 'eps'].includes(option.value)) {
                option.disabled = false;
                option.text = option.value.toUpperCase() + ' (Limited support with layout)';
            } else {
                option.disabled = true;
            }
        });
        
        // Set default to PDF for layout designer
        if (!['pdf', 'png', 'jpg'].includes(formatSelect.value)) {
            formatSelect.value = 'pdf';
        }
    } else if (activeTabId === 'export-advanced') {
        // Advanced tab supports all formats
        formatOptions.forEach(option => {
            option.disabled = false;
            
            // Reset any modified text
            if (option.value === 'svg') {
                option.text = 'SVG Vector';
            } else if (option.value === 'eps') {
                option.text = 'EPS Vector';
            }
        });
    } else {
        // Basic tab - all formats but with simpler options
        formatOptions.forEach(option => {
            option.disabled = false;
            
            // Reset any modified text
            if (option.value === 'svg') {
                option.text = 'SVG Vector';
            } else if (option.value === 'eps') {
                option.text = 'EPS Vector';
            }
        });
    }
}

/**
 * Capture the current layout configuration
 */
function captureLayoutConfiguration() {
    console.log("Capturing layout configuration");
    
    const paperSheet = document.getElementById('layout-paper-sheet') || document.querySelector('.paper-sheet');
    if (!paperSheet) {
        console.error("Paper sheet not found");
        return null;
    }
    
    // Gather layout elements
    const layoutElements = paperSheet.querySelectorAll('.layout-element');
    const elements = Array.from(layoutElements).map(element => {
        // Get basic element info
        const type = element.getAttribute('data-element-type');
        
        // Get element styles
        const styles = {
            left: element.style.left,
            top: element.style.top,
            width: element.style.width,
            height: element.style.height
        };
        
        // Get element content based on type
        let content = '';
        
        if (type === 'title') {
            const titleEl = element.querySelector('h3');
            const subtitleEl = element.querySelector('p');
            content = {
                title: titleEl ? titleEl.textContent : '',
                subtitle: subtitleEl ? subtitleEl.textContent : ''
            };
        } else if (type === 'text') {
            const textEl = element.querySelector('.text-content');
            content = textEl ? textEl.textContent : '';
        } else if (type === 'image') {
            const imgEl = element.querySelector('img');
            if (imgEl && imgEl.src) {
                content = imgEl.src;
            } else if (element.hasAttribute('data-image-src')) {
                content = element.getAttribute('data-image-src');
            }
        }
        
        return {
            type,
            styles,
            content
        };
    });
    
    // Get orientation
    const orientation = paperSheet.classList.contains('landscape') ? 'landscape' : 'portrait';
    
    // Save the config
    const layoutConfig = {
        orientation,
        elements
    };
    
    // Store in window for other functions to access
    window.currentLayoutConfig = layoutConfig;
    
    return layoutConfig;
}

/**
 * Show print preview with the given settings
 */
function showPrintPreview(settings) {
    console.log("Showing print preview with settings:", settings);
    
    // Get the print preview modal
    const previewModal = document.getElementById('print-preview-modal');
    if (!previewModal) {
        console.error("Print preview modal not found");
        alert("Print preview is not available");
        return;
    }
    
    // Show the modal
    previewModal.style.display = 'block';
    
    // Update preview information
    document.getElementById('preview-format').textContent = settings.format.toUpperCase();
    document.getElementById('preview-dpi').textContent = settings.dpi || '96';
    document.getElementById('preview-color-mode').textContent = 
        settings.colorMode || (settings.format === 'pdf' || settings.format === 'svg' ? 'RGB' : 'RGB');
    
    // Set dimensions based on orientation and paper size
    let dimensions = '8.5" × 11"'; // Default Letter size
    if (settings.paperSize === 'a4') {
        dimensions = '210mm × 297mm';
    } else if (settings.paperSize === 'a3') {
        dimensions = '297mm × 420mm';
    } else if (settings.paperSize === 'legal') {
        dimensions = '8.5" × 14"';
    } else if (settings.paperSize === 'tabloid') {
        dimensions = '11" × 17"';
    }
    
    // Swap dimensions if landscape
    if (settings.orientation === 'landscape') {
        const parts = dimensions.split(' × ');
        if (parts.length === 2) {
            dimensions = parts[1] + ' × ' + parts[0];
        }
    }
    
    document.getElementById('preview-dimensions').textContent = dimensions;
    
    // Estimate file size based on format and DPI
    let estimatedSize = '0 KB';
    const dpi = parseInt(settings.dpi) || 96;
    if (settings.format === 'png') {
        // Rough PNG size estimate
        const sizeFactor = dpi / 96;
        estimatedSize = Math.round(500 * sizeFactor * sizeFactor) + ' KB';
    } else if (settings.format === 'jpg') {
        // JPGs are smaller
        const sizeFactor = dpi / 96;
        estimatedSize = Math.round(250 * sizeFactor * sizeFactor) + ' KB';
    } else if (settings.format === 'pdf') {
        // PDFs vary greatly
        estimatedSize = '1-2 MB';
    } else if (settings.format === 'svg') {
        estimatedSize = '100-200 KB';
    } else if (settings.format === 'tiff') {
        // TIFF is uncompressed
        const sizeFactor = dpi / 96;
        estimatedSize = Math.round(2000 * sizeFactor * sizeFactor) + ' KB';
    }
    
    document.getElementById('preview-size').textContent = estimatedSize;
    
    // Handle preview canvas
    const previewCanvas = document.getElementById('preview-canvas');
    if (previewCanvas) {
        // For now, just show a placeholder
        const ctx = previewCanvas.getContext('2d');
        if (ctx) {
            // Clear canvas
            previewCanvas.width = 800;
            previewCanvas.height = 600;
            
            // Fill with white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
            
            // Add preview text
            ctx.fillStyle = '#333333';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Export Preview', previewCanvas.width / 2, 50);
            
            // Add format info
            ctx.font = '18px Arial';
            ctx.fillText(`Format: ${settings.format.toUpperCase()}`, previewCanvas.width / 2, 90);
            ctx.fillText(`Resolution: ${settings.dpi || '96'} DPI`, previewCanvas.width / 2, 120);
            
            // Draw a border
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.strokeRect(50, 150, previewCanvas.width - 100, previewCanvas.height - 200);
            
            // Indicate content area
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(50, 150, previewCanvas.width - 100, previewCanvas.height - 200);
            
            // Draw a preview of the map and elements (simplified)
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(70, 170, previewCanvas.width - 140, previewCanvas.height - 240);
            
            // Add text to indicate map area
            ctx.fillStyle = '#999999';
            ctx.fillText('Map Content', previewCanvas.width / 2, previewCanvas.height / 2);
            
            // If we have layout elements, try to represent them
            if (settings.layout && settings.layout.elements) {
                settings.layout.elements.forEach(element => {
                    // Convert percentage positions to canvas coordinates
                    const left = parseInt(element.styles.left) / 100 * (previewCanvas.width - 100) + 50;
                    const top = parseInt(element.styles.top) / 100 * (previewCanvas.height - 200) + 150;
                    const width = parseInt(element.styles.width) / 100 * (previewCanvas.width - 100);
                    const height = parseInt(element.styles.height) / 100 * (previewCanvas.height - 200);
                    
                    // Draw border for the element
                    ctx.strokeStyle = '#007bff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(left, top, width, height);
                    
                    // If it's a title element, add some text
                    if (element.type === 'title' && element.content) {
                        ctx.fillStyle = '#333333';
                        ctx.font = '14px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(element.content.title || 'Title', left + width / 2, top + 20);
                    }
                });
            }
        }
    }
    
    // Add click handler to close button
    const closeBtn = previewModal.querySelector('.print-preview-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            previewModal.style.display = 'none';
        };
    }
    
    // Export button in preview
    const exportBtn = previewModal.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.onclick = function() {
            previewModal.style.display = 'none';
            exportMapWithSettings(settings);
        };
    }
    
    // Cancel button in preview
    const cancelBtn = previewModal.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            previewModal.style.display = 'none';
        };
    }
}

/**
 * Export the map with the given settings
 */
function exportMapWithSettings(settings) {
    console.log("Exporting map with settings:", settings);
    
    // Get the map element
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error("Map element not found");
        alert("The map element could not be found. Export failed.");
        return;
    }
    
    // Get the Leaflet map instance
    const map = mapElement._leaflet_id ? window.L.Map.getMap(mapElement._leaflet_id) : null;
    if (!map) {
        console.error("Leaflet map instance not found");
        alert("The map is not properly initialized. Export failed.");
        return;
    }
    
    // Handle different format exports
    if (settings.format === 'png' || settings.format === 'jpg') {
        exportRasterImage(map, settings);
    } else if (settings.format === 'pdf') {
        exportPDF(map, settings);
    } else if (settings.format === 'svg') {
        exportSVG(map, settings);
    } else if (settings.format === 'geojson' || settings.format === 'kml') {
        exportGISFormat(map, settings);
    } else {
        // Format not yet implemented
        alert("Export for format " + settings.format + " is coming soon!");
    }
}

/**
 * Export a raster image (PNG/JPG) of the map
 */
function exportRasterImage(map, settings) {
    console.log("Exporting raster image");
    
    // Option to include various elements
    const includeTitle = settings.includeTitle !== false;
    const includeLegend = settings.includeLegend !== false;
    const includeScale = settings.includeScale !== false;
    const includeNorth = settings.includeNorth !== false;
    
    // Get just the map element first
    html2canvas(document.getElementById('map'), {
        useCORS: true,
        allowTaint: true,
        scale: parseInt(settings.dpi) / 96 || 1
    }).then(canvas => {
        // Create a new canvas for the full export
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        
        // Set canvas size based on paper size and orientation
        let width = 816; // Letter width at 96 DPI (8.5" × 96)
        let height = 1056; // Letter height at 96 DPI (11" × 96)
        
        // Adjust for different paper sizes
        if (settings.paperSize === 'a4') {
            width = 794; // 210mm at 96 DPI
            height = 1123; // 297mm at 96 DPI
        } else if (settings.paperSize === 'legal') {
            width = 816; // 8.5" at 96 DPI
            height = 1344; // 14" at 96 DPI
        } else if (settings.paperSize === 'tabloid') {
            width = 1056; // 11" at 96 DPI
            height = 1632; // 17" at 96 DPI
        } else if (settings.paperSize === 'custom' && settings.customWidth && settings.customHeight) {
            // Custom size based on units
            if (settings.units === 'in') {
                width = settings.customWidth * 96;
                height = settings.customHeight * 96;
            } else if (settings.units === 'cm') {
                width = settings.customWidth * 37.8; // 96 DPI / 2.54 cm/in
                height = settings.customHeight * 37.8;
            } else if (settings.units === 'mm') {
                width = settings.customWidth * 3.78; // 96 DPI / 25.4 mm/in
                height = settings.customHeight * 3.78;
            }
        }
        
        // Swap dimensions for landscape orientation
        if (settings.orientation === 'landscape') {
            [width, height] = [height, width];
        }
        
        // Apply DPI scaling
        const dpiScale = parseInt(settings.dpi) / 96 || 1;
        finalCanvas.width = width * dpiScale;
        finalCanvas.height = height * dpiScale;
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        // Apply layout if specified
        if (settings.layout && settings.activeTab === 'layout-designer') {
            applyLayoutToCanvas(ctx, canvas, settings.layout, width, height, dpiScale);
        } else {
            // Calculate map area based on included elements
            let mapTop = 0;
            let mapLeft = 0;
            let mapWidth = width;
            let mapHeight = height;
            
            // Allow for title area if enabled
            if (includeTitle) {
                mapTop += 80; // Title takes about 80px height
                mapHeight -= 80;
            }
            
            // Allow for legend/scale/north if enabled
            if (includeLegend || includeScale || includeNorth) {
                mapHeight -= 100; // Footer elements take about 100px height
            }
            
            // Draw the map to the canvas
            ctx.drawImage(canvas, mapLeft * dpiScale, mapTop * dpiScale, mapWidth * dpiScale, mapHeight * dpiScale);
            
            // Add title if enabled
            if (includeTitle && settings.title) {
                ctx.fillStyle = '#333333';
                ctx.font = (24 * dpiScale) + 'px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(settings.title, finalCanvas.width / 2, 40 * dpiScale);
                
                if (settings.subtitle) {
                    ctx.font = (16 * dpiScale) + 'px Arial';
                    ctx.fillText(settings.subtitle, finalCanvas.width / 2, 65 * dpiScale);
                }
                
                // Add logo if available
                if (settings.logo) {
                    const logo = new Image();
                    logo.onload = function() {
                        const logoHeight = 60 * dpiScale;
                        const logoWidth = (logo.width / logo.height) * logoHeight;
                        ctx.drawImage(logo, 20 * dpiScale, 10 * dpiScale, logoWidth, logoHeight);
                    };
                    logo.src = settings.logo;
                }
            }
            
            // Simple legend if enabled
            if (includeLegend) {
                const legendTop = height - 90;
                ctx.fillStyle = '#f8f9fa';
                ctx.strokeStyle = '#ddd';
                ctx.lineWidth = 1 * dpiScale;
                ctx.fillRect(20 * dpiScale, legendTop * dpiScale, 200 * dpiScale, 80 * dpiScale);
                ctx.strokeRect(20 * dpiScale, legendTop * dpiScale, 200 * dpiScale, 80 * dpiScale);
                
                // Legend title
                ctx.fillStyle = '#333';
                ctx.font = (16 * dpiScale) + 'px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('Legend', 30 * dpiScale, (legendTop + 20) * dpiScale);
                
                // Would normally populate from actual map layers
                ctx.font = (12 * dpiScale) + 'px Arial';
                ctx.fillText('● Fire Stations', 30 * dpiScale, (legendTop + 40) * dpiScale);
                ctx.fillText('▲ Incidents', 30 * dpiScale, (legendTop + 60) * dpiScale);
            }
            
            // Scale bar if enabled
            if (includeScale) {
                const scaleTop = height - 50;
                
                // Draw scale line
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2 * dpiScale;
                ctx.beginPath();
                ctx.moveTo((width / 2 - 100) * dpiScale, scaleTop * dpiScale);
                ctx.lineTo((width / 2 + 100) * dpiScale, scaleTop * dpiScale);
                ctx.stroke();
                
                // Add tick marks
                for (let i = 0; i <= 4; i++) {
                    const x = (width / 2 - 100 + i * 50) * dpiScale;
                    ctx.beginPath();
                    ctx.moveTo(x, (scaleTop - 5) * dpiScale);
                    ctx.lineTo(x, (scaleTop + 5) * dpiScale);
                    ctx.stroke();
                }
                
                // Add labels
                ctx.fillStyle = '#333';
                ctx.font = (12 * dpiScale) + 'px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('0', (width / 2 - 100) * dpiScale, (scaleTop + 20) * dpiScale);
                ctx.fillText('5 miles', (width / 2) * dpiScale, (scaleTop + 20) * dpiScale);
                ctx.fillText('10 miles', (width / 2 + 100) * dpiScale, (scaleTop + 20) * dpiScale);
            }
            
            // North arrow if enabled
            if (includeNorth) {
                const arrowTop = height - 60;
                const arrowLeft = width - 60;
                
                // Draw arrow
                ctx.strokeStyle = '#333';
                ctx.fillStyle = '#333';
                ctx.lineWidth = 2 * dpiScale;
                
                // Arrow shaft
                ctx.beginPath();
                ctx.moveTo(arrowLeft * dpiScale, arrowTop * dpiScale);
                ctx.lineTo(arrowLeft * dpiScale, (arrowTop + 40) * dpiScale);
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.moveTo((arrowLeft - 10) * dpiScale, (arrowTop + 10) * dpiScale);
                ctx.lineTo(arrowLeft * dpiScale, arrowTop * dpiScale);
                ctx.lineTo((arrowLeft + 10) * dpiScale, (arrowTop + 10) * dpiScale);
                ctx.fill();
                
                // Add "N" label
                ctx.font = (14 * dpiScale) + 'px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('N', arrowLeft * dpiScale, (arrowTop - 5) * dpiScale);
            }
        }
        
        // Convert to final format and trigger download
        const imageType = settings.format === 'jpg' ? 'image/jpeg' : 'image/png';
        const fileName = `firemappro_export_${new Date().getTime()}.${settings.format}`;
        
        // Create link for download
        const link = document.createElement('a');
        link.download = fileName;
        link.href = finalCanvas.toDataURL(imageType, 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }).catch(error => {
        console.error("Error generating export:", error);
        alert("There was an error generating the export: " + error.message);
    });
}

/**
 * Export a PDF document of the map
 */
function exportPDF(map, settings) {
    console.log("Exporting PDF");
    
    // Option to include various elements
    const includeTitle = settings.includeTitle !== false;
    const includeLegend = settings.includeLegend !== false;
    const includeScale = settings.includeScale !== false;
    const includeNorth = settings.includeNorth !== false;
    
    // Get just the map element first
    html2canvas(document.getElementById('map'), {
        useCORS: true,
        allowTaint: true,
        scale: parseInt(settings.dpi) / 96 || 1
    }).then(canvas => {
        // Create PDF
        const { jsPDF } = window.jspdf;
        
        // Determine page size (should match paper size from settings)
        let format = 'letter';
        if (settings.paperSize === 'a4') format = 'a4';
        else if (settings.paperSize === 'legal') format = 'legal';
        else if (settings.paperSize === 'tabloid') format = ['11in', '17in'];
        else if (settings.paperSize === 'a3') format = 'a3';
        
        // Create PDF with correct orientation
        const orientation = settings.orientation === 'landscape' ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'pt',
            format: format
        });
        
        // Get PDF dimensions
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Apply layout if specified
        if (settings.layout && settings.activeTab === 'layout-designer') {
            applyLayoutToPDF(pdf, canvas, settings.layout);
        } else {
            // Calculate map area based on included elements
            let mapTop = 36; // Default top margin
            let mapWidth = pdfWidth - 72; // 36pt margins on each side
            let mapHeight = pdfHeight - 72; // 36pt margins on top and bottom
            
            // Allow for title area if enabled
            if (includeTitle) {
                mapTop += 60; // Title takes about 60pt height
                mapHeight -= 60;
            }
            
            // Allow for legend/scale/north if enabled
            if (includeLegend || includeScale || includeNorth) {
                mapHeight -= 80; // Footer elements take about 80pt height
            }
            
            // Calculate aspect ratio to fit in the available area
            const mapRatio = canvas.width / canvas.height;
            const areaRatio = mapWidth / mapHeight;
            
            let finalWidth, finalHeight;
            if (mapRatio > areaRatio) {
                // Map is wider than area, fit by width
                finalWidth = mapWidth;
                finalHeight = mapWidth / mapRatio;
            } else {
                // Map is taller than area, fit by height
                finalHeight = mapHeight;
                finalWidth = mapHeight * mapRatio;
            }
            
            // Center horizontally
            const mapLeft = (pdfWidth - finalWidth) / 2;
            
            // Add map to PDF
            const mapDataUrl = canvas.toDataURL('image/png');
            pdf.addImage(mapDataUrl, 'PNG', mapLeft, mapTop, finalWidth, finalHeight);
            
            // Add title if enabled
            if (includeTitle && settings.title) {
                pdf.setFontSize(18);
                pdf.setTextColor(51, 51, 51);
                pdf.text(settings.title, pdfWidth / 2, 30, { align: 'center' });
                
                if (settings.subtitle) {
                    pdf.setFontSize(12);
                    pdf.text(settings.subtitle, pdfWidth / 2, 50, { align: 'center' });
                }
                
                // Add logo if available
                if (settings.logo) {
                    pdf.addImage(settings.logo, 'PNG', 36, 15, 40, 40);
                }
            }
            
            // Simple legend if enabled
            if (includeLegend) {
                const legendTop = pdfHeight - 100;
                
                // Legend box
                pdf.setFillColor(248, 249, 250);
                pdf.setDrawColor(221, 221, 221);
                pdf.rect(36, legendTop, 180, 70, 'FD');
                
                // Legend title
                pdf.setFontSize(12);
                pdf.setTextColor(51, 51, 51);
                pdf.text('Legend', 46, legendTop + 20);
                
                // Legend items (would normally populate from actual map layers)
                pdf.setFontSize(10);
                pdf.text('● Fire Stations', 46, legendTop + 40);
                pdf.text('▲ Incidents', 46, legendTop + 60);
            }
            
            // Scale bar if enabled
            if (includeScale) {
                const scaleTop = pdfHeight - 50;
                
                // Scale line
                pdf.setDrawColor(51, 51, 51);
                pdf.setLineWidth(1);
                pdf.line(pdfWidth / 2 - 100, scaleTop, pdfWidth / 2 + 100, scaleTop);
                
                // Tick marks
                for (let i = 0; i <= 4; i++) {
                    const x = pdfWidth / 2 - 100 + i * 50;
                    pdf.line(x, scaleTop - 5, x, scaleTop + 5);
                }
                
                // Labels
                pdf.setFontSize(10);
                pdf.text('0', pdfWidth / 2 - 100, scaleTop + 20, { align: 'center' });
                pdf.text('5 miles', pdfWidth / 2, scaleTop + 20, { align: 'center' });
                pdf.text('10 miles', pdfWidth / 2 + 100, scaleTop + 20, { align: 'center' });
            }
            
            // North arrow if enabled
            if (includeNorth) {
                const arrowTop = pdfHeight - 80;
                const arrowLeft = pdfWidth - 50;
                
                // Arrow shaft
                pdf.setDrawColor(51, 51, 51);
                pdf.setLineWidth(1);
                pdf.line(arrowLeft, arrowTop, arrowLeft, arrowTop + 40);
                
                // Arrow head
                pdf.setFillColor(51, 51, 51);
                pdf.triangle(arrowLeft - 6, arrowTop + 8, arrowLeft, arrowTop, arrowLeft + 6, arrowTop + 8, 'F');
                
                // N label
                pdf.setFontSize(12);
                pdf.text('N', arrowLeft, arrowTop - 5, { align: 'center' });
            }
        }
        
        // Save the PDF
        pdf.save(`firemappro_export_${new Date().getTime()}.pdf`);
    }).catch(error => {
        console.error("Error generating PDF export:", error);
        alert("There was an error generating the PDF export: " + error.message);
    });
}

/**
 * Apply a layout configuration to a canvas
 */
function applyLayoutToCanvas(ctx, mapCanvas, layout, width, height, dpiScale) {
    // If we don't have all the necessary data, exit
    if (!ctx || !mapCanvas || !layout || !layout.elements) {
        console.error("Missing required elements for layout");
        return;
    }
    
    console.log("Applying layout to canvas");
    
    // Draw each element
    layout.elements.forEach(element => {
        // Parse percentage values
        const left = parseFloat(element.styles.left) / 100 * width;
        const top = parseFloat(element.styles.top) / 100 * height;
        const elementWidth = parseFloat(element.styles.width) / 100 * width;
        const elementHeight = parseFloat(element.styles.height) / 100 * height;
        
        // Apply DPI scaling
        const scaledLeft = left * dpiScale;
        const scaledTop = top * dpiScale;
        const scaledWidth = elementWidth * dpiScale;
        const scaledHeight = elementHeight * dpiScale;
        
        if (element.type === 'map') {
            // For map elements, add the actual map
            ctx.drawImage(mapCanvas, scaledLeft, scaledTop, scaledWidth, scaledHeight);
        } else if (element.type === 'title') {
            // Title elements
            if (element.content) {
                ctx.fillStyle = '#333333';
                ctx.font = (18 * dpiScale) + 'px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(element.content.title || 'Title', scaledLeft + scaledWidth / 2, scaledTop + 25 * dpiScale);
                
                if (element.content.subtitle) {
                    ctx.font = (12 * dpiScale) + 'px Arial';
                    ctx.fillText(element.content.subtitle, scaledLeft + scaledWidth / 2, scaledTop + 45 * dpiScale);
                }
            }
        } else if (element.type === 'text') {
            // Text elements
            if (element.content) {
                ctx.fillStyle = '#333333';
                ctx.font = (12 * dpiScale) + 'px Arial';
                ctx.textAlign = 'left';
                
                // Wrap text
                const maxWidth = scaledWidth - 20 * dpiScale;
                const lineHeight = 16 * dpiScale;
                let yPos = scaledTop + 20 * dpiScale;
                
                if (typeof element.content === 'string') {
                    const words = element.content.split(' ');
                    let line = '';
                    
                    words.forEach(word => {
                        const testLine = line + word + ' ';
                        const metrics = ctx.measureText(testLine);
                        
                        if (metrics.width > maxWidth && line !== '') {
                            ctx.fillText(line, scaledLeft + 10 * dpiScale, yPos);
                            line = word + ' ';
                            yPos += lineHeight;
                        } else {
                            line = testLine;
                        }
                    });
                    
                    ctx.fillText(line, scaledLeft + 10 * dpiScale, yPos);
                }
            }
        } else if (element.type === 'legend') {
            // Legend elements
            ctx.fillStyle = '#f8f9fa';
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1 * dpiScale;
            ctx.fillRect(scaledLeft, scaledTop, scaledWidth, scaledHeight);
            ctx.strokeRect(scaledLeft, scaledTop, scaledWidth, scaledHeight);
            
            // Legend title
            ctx.fillStyle = '#333';
            ctx.font = (14 * dpiScale) + 'px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Legend', scaledLeft + 10 * dpiScale, scaledTop + 20 * dpiScale);
            
            // Sample legend items
            ctx.font = (12 * dpiScale) + 'px Arial';
            ctx.fillText('● Fire Stations', scaledLeft + 10 * dpiScale, scaledTop + 40 * dpiScale);
            ctx.fillText('▲ Incidents', scaledLeft + 10 * dpiScale, scaledTop + 60 * dpiScale);
            ctx.fillText('■ Response Zones', scaledLeft + 10 * dpiScale, scaledTop + 80 * dpiScale);
        } else if (element.type === 'scale-bar') {
            // Scale bar elements
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2 * dpiScale;
            ctx.beginPath();
            ctx.moveTo(scaledLeft + 10 * dpiScale, scaledTop + scaledHeight / 2);
            ctx.lineTo(scaledLeft + scaledWidth - 10 * dpiScale, scaledTop + scaledHeight / 2);
            ctx.stroke();
            
            // Add tick marks
            const segmentWidth = (scaledWidth - 20 * dpiScale) / 4;
            for (let i = 0; i <= 4; i++) {
                const x = scaledLeft + 10 * dpiScale + i * segmentWidth;
                ctx.beginPath();
                ctx.moveTo(x, scaledTop + scaledHeight / 2 - 5 * dpiScale);
                ctx.lineTo(x, scaledTop + scaledHeight / 2 + 5 * dpiScale);
                ctx.stroke();
            }
            
            // Add labels
            ctx.fillStyle = '#333';
            ctx.font = (10 * dpiScale) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('0', scaledLeft + 10 * dpiScale, scaledTop + scaledHeight / 2 + 15 * dpiScale);
            ctx.fillText('5 miles', scaledLeft + 10 * dpiScale + 2 * segmentWidth, scaledTop + scaledHeight / 2 + 15 * dpiScale);
            ctx.fillText('10 miles', scaledLeft + scaledWidth - 10 * dpiScale, scaledTop + scaledHeight / 2 + 15 * dpiScale);
        } else if (element.type === 'north-arrow') {
            // North arrow elements
            ctx.strokeStyle = '#333';
            ctx.fillStyle = '#333';
            ctx.lineWidth = 2 * dpiScale;
            
            // Calculate center point
            const centerX = scaledLeft + scaledWidth / 2;
            const centerY = scaledTop + scaledHeight / 2;
            
            // Arrow shaft
            const shaftLength = Math.min(scaledWidth, scaledHeight) * 0.6;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - shaftLength / 2);
            ctx.lineTo(centerX, centerY + shaftLength / 2);
            ctx.stroke();
            
            // Arrow head
            const headSize = shaftLength * 0.25;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - shaftLength / 2);
            ctx.lineTo(centerX - headSize / 2, centerY - shaftLength / 2 + headSize);
            ctx.lineTo(centerX + headSize / 2, centerY - shaftLength / 2 + headSize);
            ctx.fill();
            
            // N label
            ctx.font = (12 * dpiScale) + 'px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('N', centerX, centerY - shaftLength / 2 - 5 * dpiScale);
        } else if (element.type === 'image' && element.content) {
            // Image elements with content
            try {
                const img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, scaledLeft, scaledTop, scaledWidth, scaledHeight);
                };
                img.src = element.content;
            } catch (error) {
                console.error("Error loading image:", error);
                // Draw placeholder for image
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(scaledLeft, scaledTop, scaledWidth, scaledHeight);
                ctx.fillStyle = '#999';
                ctx.textAlign = 'center';
                ctx.font = (12 * dpiScale) + 'px Arial';
                ctx.fillText('Image', scaledLeft + scaledWidth / 2, scaledTop + scaledHeight / 2);
            }
        } else if (element.type === 'shape') {
            // Shape elements (simplified for now)
            ctx.fillStyle = '#e0e0e0';
            ctx.strokeStyle = '#999';
            ctx.lineWidth = 1 * dpiScale;
            ctx.fillRect(scaledLeft, scaledTop, scaledWidth, scaledHeight);
            ctx.strokeRect(scaledLeft, scaledTop, scaledWidth, scaledHeight);
        }
    });
}

/**
 * Apply a layout configuration to a PDF
 */
function applyLayoutToPDF(pdf, mapCanvas, layout) {
    console.log("Applying layout to PDF");
    
    // If we don't have all the necessary data, exit
    if (!pdf || !mapCanvas || !layout || !layout.elements) {
        console.error("Missing required elements for PDF layout");
        return;
    }
    
    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Draw each element
    layout.elements.forEach(element => {
        // Parse percentage values
        const left = parseFloat(element.styles.left) / 100 * pdfWidth;
        const top = parseFloat(element.styles.top) / 100 * pdfHeight;
        const elementWidth = parseFloat(element.styles.width) / 100 * pdfWidth;
        const elementHeight = parseFloat(element.styles.height) / 100 * pdfHeight;
        
        if (element.type === 'map') {
            // Add the map
            const mapDataUrl = mapCanvas.toDataURL('image/png');
            pdf.addImage(mapDataUrl, 'PNG', left, top, elementWidth, elementHeight);
        } else if (element.type === 'title') {
            // Title elements
            if (element.content) {
                pdf.setFontSize(16);
                pdf.setTextColor(51, 51, 51);
                pdf.text(element.content.title || 'Title', left + elementWidth / 2, top + 20, { align: 'center' });
                
                if (element.content.subtitle) {
                    pdf.setFontSize(12);
                    pdf.text(element.content.subtitle, left + elementWidth / 2, top + 35, { align: 'center' });
                }
            }
        } else if (element.type === 'text') {
            // Text elements
            if (element.content) {
                pdf.setFontSize(10);
                pdf.setTextColor(51, 51, 51);
                
                // Simplistic text wrapping (would need more complex wrapping for production)
                const maxWidth = elementWidth - 20;
                const lineHeight = 12;
                let yPos = top + 15;
                
                if (typeof element.content === 'string') {
                    const words = element.content.split(' ');
                    let line = '';
                    
                    words.forEach(word => {
                        const testLine = line + word + ' ';
                        const metrics = pdf.getTextWidth(testLine);
                        
                        if (metrics > maxWidth && line !== '') {
                            pdf.text(line, left + 10, yPos);
                            line = word + ' ';
                            yPos += lineHeight;
                        } else {
                            line = testLine;
                        }
                    });
                    
                    pdf.text(line, left + 10, yPos);
                }
            }
        } else if (element.type === 'legend') {
            // Legend elements
            pdf.setFillColor(248, 249, 250);
            pdf.setDrawColor(221, 221, 221);
            pdf.rect(left, top, elementWidth, elementHeight, 'FD');
            
            // Legend title
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text('Legend', left + 10, top + 15);
            
            // Sample legend items
            pdf.setFontSize(10);
            pdf.text('● Fire Stations', left + 10, top + 30);
            pdf.text('▲ Incidents', left + 10, top + 45);
            pdf.text('■ Response Zones', left + 10, top + 60);
        } else if (element.type === 'scale-bar') {
            // Scale bar
            pdf.setDrawColor(51, 51, 51);
            pdf.setLineWidth(1);
            pdf.line(left + 10, top + elementHeight / 2, left + elementWidth - 10, top + elementHeight / 2);
            
            // Tick marks
            const segmentWidth = (elementWidth - 20) / 4;
            for (let i = 0; i <= 4; i++) {
                const x = left + 10 + i * segmentWidth;
                pdf.line(x, top + elementHeight / 2 - 5, x, top + elementHeight / 2 + 5);
            }
            
            // Labels
            pdf.setFontSize(8);
            pdf.text('0', left + 10, top + elementHeight / 2 + 12, { align: 'center' });
            pdf.text('5 miles', left + 10 + 2 * segmentWidth, top + elementHeight / 2 + 12, { align: 'center' });
            pdf.text('10 miles', left + elementWidth - 10, top + elementHeight / 2 + 12, { align: 'center' });
        } else if (element.type === 'north-arrow') {
            // North arrow
            pdf.setFillColor(51, 51, 51);
            pdf.setDrawColor(51, 51, 51);
            pdf.setLineWidth(1);
            
            // Calculate center point
            const centerX = left + elementWidth / 2;
            const centerY = top + elementHeight / 2;
            
            // Arrow shaft
            const shaftLength = Math.min(elementWidth, elementHeight) * 0.6;
            pdf.line(centerX, centerY - shaftLength / 2, centerX, centerY + shaftLength / 2);
            
            // Arrow head
            const headSize = shaftLength * 0.25;
            pdf.triangle(
                centerX - headSize / 2, centerY - shaftLength / 2 + headSize,
                centerX, centerY - shaftLength / 2,
                centerX + headSize / 2, centerY - shaftLength / 2 + headSize,
                'F'
            );
            
            // N label
            pdf.setFontSize(10);
            pdf.text('N', centerX, centerY - shaftLength / 2 - 5, { align: 'center' });
        } else if (element.type === 'image' && element.content) {
            // Image (try-catch in case the image can't be loaded)
            try {
                pdf.addImage(element.content, 'PNG', left, top, elementWidth, elementHeight);
            } catch (error) {
                console.error("Error adding image to PDF:", error);
                
                // Draw placeholder for image
                pdf.setFillColor(240, 240, 240);
                pdf.setDrawColor(153, 153, 153);
                pdf.rect(left, top, elementWidth, elementHeight, 'FD');
                
                pdf.setFontSize(10);
                pdf.setTextColor(153, 153, 153);
                pdf.text('Image', left + elementWidth / 2, top + elementHeight / 2, { align: 'center' });
            }
        } else if (element.type === 'shape') {
            // Shape (simplified for now)
            pdf.setFillColor(224, 224, 224);
            pdf.setDrawColor(153, 153, 153);
            pdf.rect(left, top, elementWidth, elementHeight, 'FD');
        }
    });
}

/**
 * Export SVG format
 */
function exportSVG(map, settings) {
    console.log("SVG export not fully implemented");
    alert("SVG export will be implemented in the next update. Please use PNG or PDF format for now.");
}

/**
 * Export GIS format (GeoJSON, KML)
 */
function exportGISFormat(map, settings) {
    console.log("GIS format export not implemented");
    alert("GIS format export will be implemented in the next update. Please use PNG or PDF format for now.");
}

// Self-executing function to initialize everything when the page loads
(function() {
    console.log("Initializing FireMapPro...");
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM fully loaded, initializing export handlers");
        
        // Initialize export handlers when DOM is loaded
        setTimeout(function() {
            try {
                initializeExportHandlers();
                console.log("Export handlers initialized");
                
                // Set up layout designer when DOM is loaded
                try {
                    initializeLayoutDesigner();
                    console.log("Layout designer initialized");
                } catch (error) {
                    console.error("Error initializing layout designer:", error);
                }
                
                // Set up file uploads
                try {
                    setupFileUploads();
                    console.log("File uploads initialized");
                } catch (error) {
                    console.error("Error setting up file uploads:", error);
                }
            } catch (error) {
                console.error("Error initializing export handlers:", error);
            }
        }, 500);
        
        console.log("FireMapPro initialization complete");
    });
})();