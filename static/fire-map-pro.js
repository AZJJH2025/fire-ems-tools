/**
 * Add title properties to the properties panel
 */
function addTitleProperties(propertiesPanel, element) {
    const titleElement = element.querySelector('h3');
    const subtitleElement = element.querySelector('p');
    
    const titleText = titleElement ? titleElement.textContent : 'Map Title';
    const subtitleText = subtitleElement ? subtitleElement.textContent : 'Subtitle text';
    
    propertiesPanel.innerHTML += `
        <div class="property-group">
            <h5>Title Properties</h5>
            <div class="property-row">
                <label>Title Text:</label>
                <div class="property-input">
                    <input type="text" name="title-text" value="${titleText}">
                </div>
            </div>
            <div class="property-row">
                <label>Subtitle Text:</label>
                <div class="property-input">
                    <input type="text" name="subtitle-text" value="${subtitleText}">
                </div>
            </div>
            <div class="property-row">
                <label>Font:</label>
                <div class="property-input">
                    <select name="title-font">
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

/**
 * Add text properties to the properties panel
 */
function addTextProperties(propertiesPanel, element) {
    const textElement = element.querySelector('.text-content');
    const textContent = textElement ? textElement.textContent : 'Text content goes here';
    
    propertiesPanel.innerHTML += `
        <div class="property-group">
            <h5>Text Properties</h5>
            <div class="property-row">
                <label>Text Content:</label>
                <div class="property-input">
                    <textarea name="text-content" rows="4">${textContent}</textarea>
                </div>
            </div>
            <div class="property-row">
                <label>Font:</label>
                <div class="property-input">
                    <select name="text-font">
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

/**
 * Add map properties to the properties panel
 */
function addMapProperties(propertiesPanel, element) {
    propertiesPanel.innerHTML += `
        <div class="property-group">
            <h5>Map Properties</h5>
            <div class="property-row">
                <label>Map Content:</label>
                <div class="property-input">
                    <select name="map-content">
                        <option value="current">Current Map View</option>
                        <option value="full">Full Map Extent</option>
                        <option value="stations">Stations Only</option>
                    </select>
                </div>
            </div>
            <div class="property-row">
                <label>Border Width:</label>
                <div class="property-input">
                    <input type="number" name="map-border-width" min="0" max="10" value="1"> px
                </div>
            </div>
        </div>
    `;
}

/**
 * Add legend properties to the properties panel
 */
function addLegendProperties(propertiesPanel, element) {
    const titleElement = element.querySelector('.legend-title');
    const titleText = titleElement ? titleElement.textContent : 'Legend';
    
    propertiesPanel.innerHTML += `
        <div class="property-group">
            <h5>Legend Properties</h5>
            <div class="property-row">
                <label>Legend Title:</label>
                <div class="property-input">
                    <input type="text" name="legend-title" value="${titleText}">
                </div>
            </div>
            <div class="property-row">
                <label>Layers:</label>
                <div class="property-input">
                    <div class="checkbox-group">
                        <div>
                            <input type="checkbox" id="legend-stations" name="legend-layers" value="stations" checked>
                            <label for="legend-stations">Fire Stations</label>
                        </div>
                        <div>
                            <input type="checkbox" id="legend-incidents" name="legend-layers" value="incidents" checked>
                            <label for="legend-incidents">Incidents</label>
                        </div>
                        <div>
                            <input type="checkbox" id="legend-zones" name="legend-layers" value="zones" checked>
                            <label for="legend-zones">Response Zones</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Add image properties to the properties panel
 */
function addImageProperties(propertiesPanel, element) {
    propertiesPanel.innerHTML += `
        <div class="property-group">
            <h5>Image Properties</h5>
            <div class="property-row">
                <label>Image:</label>
                <div class="property-input">
                    <button name="select-image" class="property-button">Choose Image</button>
                </div>
            </div>
            <div class="property-row">
                <label>Scale:</label>
                <div class="property-input">
                    <select name="image-scale">
                        <option value="contain">Fit</option>
                        <option value="cover">Fill</option>
                        <option value="stretch">Stretch</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

/**
 * Add shape properties to the properties panel
 */
function addShapeProperties(propertiesPanel, element) {
    propertiesPanel.innerHTML += `
        <div class="property-group">
            <h5>Shape Properties</h5>
            <div class="property-row">
                <label>Shape Type:</label>
                <div class="property-input">
                    <select name="shape-type">
                        <option value="rectangle">Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="line">Line</option>
                        <option value="arrow">Arrow</option>
                    </select>
                </div>
            </div>
            <div class="property-row">
                <label>Fill Color:</label>
                <div class="property-input">
                    <input type="color" name="shape-fill" value="#ffffff">
                </div>
            </div>
            <div class="property-row">
                <label>Border Color:</label>
                <div class="property-input">
                    <input type="color" name="shape-border" value="#000000">
                </div>
            </div>
        </div>
    `;
}

/**
 * Add event listeners for title property changes
 */
function addTitlePropertyListeners(propertiesPanel, element) {
    const titleTextInput = propertiesPanel.querySelector('input[name="title-text"]');
    const subtitleTextInput = propertiesPanel.querySelector('input[name="subtitle-text"]');
    const fontSelect = propertiesPanel.querySelector('select[name="title-font"]');
    
    if (titleTextInput) {
        titleTextInput.addEventListener('change', function() {
            const titleElement = element.querySelector('h3');
            if (titleElement) {
                titleElement.textContent = this.value;
            }
        });
    }
    
    if (subtitleTextInput) {
        subtitleTextInput.addEventListener('change', function() {
            const subtitleElement = element.querySelector('p');
            if (subtitleElement) {
                subtitleElement.textContent = this.value;
            }
        });
    }
    
    if (fontSelect) {
        fontSelect.addEventListener('change', function() {
            element.style.fontFamily = this.value;
        });
    }
}

/**
 * Add event listeners for text property changes
 */
function addTextPropertyListeners(propertiesPanel, element) {
    const textContentInput = propertiesPanel.querySelector('textarea[name="text-content"]');
    const fontSelect = propertiesPanel.querySelector('select[name="text-font"]');
    
    if (textContentInput) {
        textContentInput.addEventListener('change', function() {
            const textElement = element.querySelector('.text-content');
            if (textElement) {
                textElement.textContent = this.value;
            }
        });
    }
    
    if (fontSelect) {
        fontSelect.addEventListener('change', function() {
            element.style.fontFamily = this.value;
        });
    }
}

/**
 * Add event listeners for map property changes
 */
function addMapPropertyListeners(propertiesPanel, element) {
    const borderWidthInput = propertiesPanel.querySelector('input[name="map-border-width"]');
    
    if (borderWidthInput) {
        borderWidthInput.addEventListener('change', function() {
            element.style.borderWidth = this.value + 'px';
        });
    }
}

/**
 * Add event listeners for legend property changes
 */
function addLegendPropertyListeners(propertiesPanel, element) {
    const legendTitleInput = propertiesPanel.querySelector('input[name="legend-title"]');
    
    if (legendTitleInput) {
        legendTitleInput.addEventListener('change', function() {
            const titleElement = element.querySelector('.legend-title');
            if (titleElement) {
                titleElement.textContent = this.value;
            }
        });
    }
}

/**
 * Add event listeners for image property changes
 */
function addImagePropertyListeners(propertiesPanel, element) {
    const selectImageButton = propertiesPanel.querySelector('button[name="select-image"]');
    const scaleSelect = propertiesPanel.querySelector('select[name="image-scale"]');
    
    if (selectImageButton) {
        selectImageButton.addEventListener('click', function() {
            // Simulated image selection
            const imagePlaceholder = element.querySelector('.image-placeholder');
            if (imagePlaceholder) {
                imagePlaceholder.innerHTML = '<i class="fas fa-image"></i><span>Image Selected</span>';
            }
        });
    }
    
    if (scaleSelect) {
        scaleSelect.addEventListener('change', function() {
            const imgElement = element.querySelector('img');
            if (imgElement) {
                imgElement.style.objectFit = this.value;
            }
        });
    }
}

/**
 * Add event listeners for shape property changes
 */
function addShapePropertyListeners(propertiesPanel, element) {
    const shapeTypeSelect = propertiesPanel.querySelector('select[name="shape-type"]');
    const fillColorInput = propertiesPanel.querySelector('input[name="shape-fill"]');
    const borderColorInput = propertiesPanel.querySelector('input[name="shape-border"]');
    
    if (shapeTypeSelect) {
        shapeTypeSelect.addEventListener('change', function() {
            const shapePlaceholder = element.querySelector('.shape-placeholder');
            if (shapePlaceholder) {
                shapePlaceholder.setAttribute('data-shape', this.value);
                
                // Update visual appearance based on shape type
                if (this.value === 'circle') {
                    shapePlaceholder.style.borderRadius = '50%';
                } else if (this.value === 'rectangle') {
                    shapePlaceholder.style.borderRadius = '0';
                }
            }
        });
    }
    
    if (fillColorInput) {
        fillColorInput.addEventListener('change', function() {
            const shapePlaceholder = element.querySelector('.shape-placeholder');
            if (shapePlaceholder) {
                shapePlaceholder.style.backgroundColor = this.value;
            }
        });
    }
    
    if (borderColorInput) {
        borderColorInput.addEventListener('change', function() {
            const shapePlaceholder = element.querySelector('.shape-placeholder');
            if (shapePlaceholder) {
                shapePlaceholder.style.borderColor = this.value;
            }
        });
    }
}

/**
 * Initialize modals and their event handlers
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
    const bufferApplyBtn = document.getElementById('buffer-apply');
    if (bufferApplyBtn) {
        bufferApplyBtn.addEventListener('click', applyBuffer);
    }
    
    const bufferCancelBtn = document.getElementById('buffer-cancel');
    if (bufferCancelBtn) {
        bufferCancelBtn.addEventListener('click', function() {
            closeModal('buffer-modal');
        });
    }
    
    // Hotspot modal
    const hotspotApplyBtn = document.getElementById('hotspot-apply');
    if (hotspotApplyBtn) {
        hotspotApplyBtn.addEventListener('click', generateHotspot);
    }
    
    const hotspotCancelBtn = document.getElementById('hotspot-cancel');
    if (hotspotCancelBtn) {
        hotspotCancelBtn.addEventListener('click', function() {
            closeModal('hotspot-modal');
        });
    }
    
    // CSV mapping modal
    const csvImportBtn = document.getElementById('csv-import-confirm');
    if (csvImportBtn) {
        csvImportBtn.addEventListener('click', importCSV);
    }
    
    const csvCancelBtn = document.getElementById('csv-cancel');
    if (csvCancelBtn) {
        csvCancelBtn.addEventListener('click', function() {
            closeModal('csv-mapping-modal');
        });
    }
    
    // When user clicks outside a modal, close it
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Initialize export buttons
    const exportPngBtn = document.getElementById('export-png');
    if (exportPngBtn) {
        exportPngBtn.addEventListener('click', function() {
            openModal('export-modal');
            // Set focus to Basic tab
            const basicTab = document.querySelector('[data-tab="export-basic"]');
            if (basicTab) basicTab.click();
        });
    }
    
    const exportPdfBtn = document.getElementById('export-pdf');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            openModal('export-modal');
            // Set focus to Advanced tab
            const advancedTab = document.querySelector('[data-tab="export-advanced"]');
            if (advancedTab) advancedTab.click();
        });
    }
    
    // Export confirmation button
    const exportConfirmBtn = document.getElementById('export-confirm');
    if (exportConfirmBtn) {
        exportConfirmBtn.addEventListener('click', function() {
            const formatSelect = document.getElementById('export-format');
            const selectedFormat = formatSelect ? formatSelect.value : 'png';
            
            // Show print preview for vector formats
            if (['pdf', 'svg', 'eps', 'geopdf'].includes(selectedFormat)) {
                showPrintPreview();
            } else {
                // For raster formats, export directly
                exportMap(selectedFormat);
            }
        });
    }
    
    // Initialize export modal tabs
    initializeExportModalTabs();
    
    // Initialize print preview modal
    initializePrintPreview();
    
    // Initialize layout designer drag and drop
    initializeLayoutDesigner();
}

/**
 * Shows the print preview modal with current export settings
 */
function showPrintPreview() {
    const previewModal = document.getElementById('print-preview-modal');
    if (!previewModal) return;
    
    // Update preview info from export settings
    updatePrintPreviewInfo();
    
    // Display the modal
    previewModal.style.display = 'block';
    
    // Render the preview
    renderPrintPreview();
}

/**
 * Updates the print preview information panel
 */
function updatePrintPreviewInfo() {
    const formatSelect = document.getElementById('export-format');
    const dpiSelect = document.getElementById('export-dpi');
    const colorModeSelect = document.getElementById('color-mode');
    const paperPreset = document.getElementById('paper-preset');
    
    const previewFormat = document.getElementById('preview-format');
    const previewDpi = document.getElementById('preview-dpi');
    const previewColorMode = document.getElementById('preview-color-mode');
    const previewDimensions = document.getElementById('preview-dimensions');
    
    if (formatSelect && previewFormat) {
        previewFormat.textContent = formatSelect.options[formatSelect.selectedIndex].text;
    }
    
    if (dpiSelect && previewDpi) {
        previewDpi.textContent = dpiSelect.value;
    }
    
    if (colorModeSelect && previewColorMode) {
        previewColorMode.textContent = colorModeSelect.value.toUpperCase();
    }
    
    if (paperPreset && previewDimensions) {
        const dimensions = getPaperDimensions(paperPreset.value);
        previewDimensions.textContent = dimensions;
    }
    
    // Estimate file size
    estimateFileSize();
}

/**
 * Gets the dimensions string for a paper preset
 */
function getPaperDimensions(preset) {
    const dimensions = {
        'letter': '8.5" × 11"',
        'legal': '8.5" × 14"',
        'tabloid': '11" × 17"',
        'a4': '210mm × 297mm',
        'a3': '297mm × 420mm',
        'a2': '420mm × 594mm',
        'a1': '594mm × 841mm',
        'a0': '841mm × 1189mm',
        'custom': 'Custom'
    };
    
    return dimensions[preset] || 'Custom';
}

/**
 * Estimates file size based on format, dimensions and resolution
 */
function estimateFileSize() {
    const previewSize = document.getElementById('preview-size');
    if (!previewSize) return;
    
    const formatSelect = document.getElementById('export-format');
    const dpiSelect = document.getElementById('export-dpi');
    const paperPreset = document.getElementById('paper-preset');
    
    if (!formatSelect || !dpiSelect || !paperPreset) {
        previewSize.textContent = 'Unknown';
        return;
    }
    
    const format = formatSelect.value;
    const dpi = parseInt(dpiSelect.value);
    const preset = paperPreset.value;
    
    // Very rough size estimate based on format and resolution
    let size = 0;
    
    // Get dimensions in inches
    let width = 8.5;
    let height = 11;
    
    switch (preset) {
        case 'letter': width = 8.5; height = 11; break;
        case 'legal': width = 8.5; height = 14; break;
        case 'tabloid': width = 11; height = 17; break;
        case 'a4': width = 8.27; height = 11.69; break;
        case 'a3': width = 11.69; height = 16.54; break;
        case 'a2': width = 16.54; height = 23.39; break;
        case 'a1': width = 23.39; height = 33.11; break;
        case 'a0': width = 33.11; height = 46.81; break;
        case 'custom':
            const widthInput = document.getElementById('print-width');
            const heightInput = document.getElementById('print-height');
            const unitsSelect = document.getElementById('print-units');
            
            if (widthInput && heightInput && unitsSelect) {
                width = parseFloat(widthInput.value);
                height = parseFloat(heightInput.value);
                
                // Convert to inches if needed
                if (unitsSelect.value === 'cm') {
                    width /= 2.54;
                    height /= 2.54;
                } else if (unitsSelect.value === 'mm') {
                    width /= 25.4;
                    height /= 25.4;
                }
            }
            break;
    }
    
    // Calculate pixel dimensions
    const pixelWidth = Math.round(width * dpi);
    const pixelHeight = Math.round(height * dpi);
    const pixelCount = pixelWidth * pixelHeight;
    
    // Estimate size based on format
    if (['png', 'tiff'].includes(format)) {
        // Assume 4 bytes per pixel (RGBA)
        size = pixelCount * 4;
    } else if (format === 'jpg') {
        // Assume 10:1 compression ratio
        size = pixelCount * 4 / 10;
    } else if (['pdf', 'svg', 'eps'].includes(format)) {
        // Vector formats are typically smaller
        size = pixelCount / 20;
    } else if (['geojson', 'kml'].includes(format)) {
        // Depends on complexity of data
        size = 100 * 1024; // Placeholder
    }
    
    // Convert to appropriate unit
    if (size < 1024) {
        previewSize.textContent = `${size.toFixed(0)} B`;
    } else if (size < 1024 * 1024) {
        previewSize.textContent = `${(size / 1024).toFixed(1)} KB`;
    } else {
        previewSize.textContent = `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
}

/**
 * Renders the print preview based on current settings
 */
function renderPrintPreview() {
    const previewCanvas = document.getElementById('preview-canvas');
    if (!previewCanvas) return;
    
    const ctx = previewCanvas.getContext('2d');
    if (!ctx) return;
    
    // Get current map canvas
    const map = document.getElementById('map');
    if (!map) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // Set canvas dimensions
    previewCanvas.width = map.clientWidth;
    previewCanvas.height = map.clientHeight;
    
    // Draw content from map
    html2canvas(map).then(function(canvas) {
        // Draw map canvas to preview canvas
        ctx.drawImage(canvas, 0, 0);
        
        // Add crop marks if selected
        const showCropMarks = document.getElementById('export-crop-marks');
        if (showCropMarks && showCropMarks.checked) {
            drawCropMarks(ctx, previewCanvas.width, previewCanvas.height);
        }
        
        // Add color bars if selected
        const showColorBars = document.getElementById('export-color-bars');
        if (showColorBars && showColorBars.checked) {
            drawColorBars(ctx, previewCanvas.width, previewCanvas.height);
        }
        
        // Apply CMYK preview if selected
        const viewMode = document.getElementById('preview-view-mode');
        if (viewMode && viewMode.value === 'cmyk-preview') {
            applyCMYKPreview(ctx, previewCanvas.width, previewCanvas.height);
        }
    });
}

/**
 * Initialize export modal tab functionality
 */
function initializeExportModalTabs() {
    console.log("Initializing export modal tabs");
    
    // Get tab buttons
    const tabButtons = document.querySelectorAll('.modal-tab');
    if (!tabButtons || tabButtons.length === 0) {
        console.warn("No modal tabs found");
        return;
    }
    
    // Add click event to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab panels
            const tabPanels = document.querySelectorAll('.tab-panel');
            tabPanels.forEach(panel => {
                panel.style.display = 'none';
            });
            
            // Show selected tab panel
            const tabName = this.getAttribute('data-tab');
            const selectedPanel = document.getElementById(tabName + '-panel');
            if (selectedPanel) {
                selectedPanel.style.display = 'block';
            }
        });
    });
    
    // Paper size preset handler
    const paperPreset = document.getElementById('paper-preset');
    if (paperPreset) {
        paperPreset.addEventListener('change', function() {
            const customSizeDiv = document.getElementById('print-size-custom');
            if (customSizeDiv) {
                if (this.value === 'custom') {
                    customSizeDiv.style.display = 'block';
                } else {
                    customSizeDiv.style.display = 'none';
                }
            }
        });
    }
    
    // Tiled printing toggle
    const tilePrintCheckbox = document.getElementById('export-tile-print');
    if (tilePrintCheckbox) {
        tilePrintCheckbox.addEventListener('change', function() {
            const tileOptions = document.getElementById('tile-options');
            if (tileOptions) {
                tileOptions.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Color mode change handler
    const colorMode = document.getElementById('color-mode');
    if (colorMode) {
        colorMode.addEventListener('change', function() {
            const colorProfile = document.getElementById('color-profile');
            if (colorProfile) {
                // Update profile options based on color mode
                if (this.value === 'cmyk') {
                    // Replace RGB profiles with CMYK ones
                    updateColorProfiles(colorProfile, true);
                } else {
                    // Replace CMYK profiles with RGB ones
                    updateColorProfiles(colorProfile, false);
                }
            }
        });
    }
    
    // Initialize layer list for export
    populateExportLayers();
    
    // Set up export all layers checkbox
    const exportAllLayers = document.getElementById('export-all-layers');
    if (exportAllLayers) {
        exportAllLayers.addEventListener('change', function() {
            const layerList = document.getElementById('export-layers-list');
            if (layerList) {
                const checkboxes = layerList.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.disabled = this.checked;
                    if (this.checked) {
                        checkbox.checked = true;
                    }
                });
            }
        });
    }
}

/**
 * Updates color profile dropdown options based on color mode
 */
function updateColorProfiles(selectElement, isCMYK) {
    if (!selectElement) return;
    
    // Clear current options
    selectElement.innerHTML = '';
    
    // Add appropriate options
    if (isCMYK) {
        addOption(selectElement, 'cmyk-swop', 'CMYK SWOP (U.S.)');
        addOption(selectElement, 'cmyk-fogra', 'CMYK FOGRA39 (Europe)');
        addOption(selectElement, 'cmyk-toyo', 'CMYK Toyo (Japan)');
        addOption(selectElement, 'cmyk-jmpa', 'CMYK JMPA (Japan)');
    } else {
        addOption(selectElement, 'srgb', 'sRGB (Default)');
        addOption(selectElement, 'adobergb', 'Adobe RGB');
        addOption(selectElement, 'display-p3', 'Display P3');
        addOption(selectElement, 'prophoto', 'ProPhoto RGB');
    }
    
    // Add custom option
    addOption(selectElement, 'custom', 'Custom Profile...');
}

/**
 * Helper function to add an option to a select element
 */
function addOption(selectElement, value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    selectElement.appendChild(option);
}

/**
 * Populates the layer list for export options
 */
function populateExportLayers() {
    const layersList = document.getElementById('export-layers-list');
    if (!layersList) return;
    
    // Clear current list
    layersList.innerHTML = '';
    
    // Get all available layers
    const layerCheckboxes = document.querySelectorAll('.layer-item input[type="checkbox"]');
    layerCheckboxes.forEach(checkbox => {
        const label = checkbox.nextElementSibling;
        if (label) {
            const layerName = label.textContent;
            
            const layerItem = document.createElement('div');
            layerItem.className = 'export-layer-item';
            
            const layerCheckbox = document.createElement('input');
            layerCheckbox.type = 'checkbox';
            layerCheckbox.checked = checkbox.checked;
            layerCheckbox.id = 'export-' + checkbox.id;
            
            const layerLabel = document.createElement('label');
            layerLabel.textContent = layerName;
            layerLabel.setAttribute('for', layerCheckbox.id);
            
            layerItem.appendChild(layerCheckbox);
            layerItem.appendChild(layerLabel);
            
            layersList.appendChild(layerItem);
        }
    });
}

/**
 * Initialize print preview functionality
 */
function initializePrintPreview() {
    console.log("Initializing print preview");
    
    // Get print preview modal
    const previewModal = document.getElementById('print-preview-modal');
    if (!previewModal) {
        console.warn("Print preview modal not found");
        return;
    }
    
    // Close button handler
    const closeButton = previewModal.querySelector('.print-preview-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            previewModal.style.display = 'none';
        });
    }
    
    // Cancel button handler
    const cancelButton = previewModal.querySelector('.cancel-btn');
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            previewModal.style.display = 'none';
        });
    }
    
    // Export button handler
    const exportButton = previewModal.querySelector('.export-btn');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            const formatSelect = document.getElementById('export-format');
            if (formatSelect) {
                exportMap(formatSelect.value);
            }
            previewModal.style.display = 'none';
        });
    }
    
    // Print button handler
    const printButton = document.getElementById('print-direct-btn');
    if (printButton) {
        printButton.addEventListener('click', function() {
            printMap();
        });
    }
    
    // Show tiles button handler
    const showTilesButton = document.getElementById('show-tiles-btn');
    if (showTilesButton) {
        showTilesButton.addEventListener('click', function() {
            toggleTileOverlay();
        });
    }
    
    // View mode change handler
    const viewModeSelect = document.getElementById('preview-view-mode');
    if (viewModeSelect) {
        viewModeSelect.addEventListener('change', function() {
            renderPrintPreview();
            
            // Show/hide crop marks based on selection
            const cropMarksContainer = document.getElementById('crop-marks-container');
            if (cropMarksContainer) {
                cropMarksContainer.style.display = 
                    (this.value === 'print-marks') ? 'block' : 'none';
            }
        });
    }
    
    // Zoom level change handler
    const zoomSelect = document.getElementById('preview-zoom');
    if (zoomSelect) {
        zoomSelect.addEventListener('change', function() {
            const canvasContainer = document.querySelector('.print-preview-canvas-container');
            const canvas = document.getElementById('preview-canvas');
            
            if (!canvasContainer || !canvas) return;
            
            if (this.value === 'fit') {
                canvas.style.transform = 'none';
                canvas.style.maxWidth = '100%';
                canvas.style.maxHeight = '100%';
            } else {
                const zoomLevel = parseInt(this.value) / 100;
                canvas.style.transform = `scale(${zoomLevel})`;
                canvas.style.transformOrigin = 'top left';
                canvas.style.maxWidth = 'none';
                canvas.style.maxHeight = 'none';
            }
        });
    }
}

/**
 * Toggle tile overlay for large format printing
 */
function toggleTileOverlay() {
    const overlay = document.getElementById('preview-overlay');
    if (!overlay) return;
    
    if (overlay.classList.contains('show-tiles')) {
        overlay.classList.remove('show-tiles');
        overlay.innerHTML = '';
    } else {
        overlay.classList.add('show-tiles');
        
        // Get tile size and overlap from settings
        const tileSize = document.getElementById('tile-size');
        const tileOverlap = document.getElementById('tile-overlap');
        
        let width = 8.5; // inches, default letter width
        let height = 11; // inches, default letter height
        let overlap = 0.5; // inches, default overlap
        
        if (tileSize && tileSize.value === 'a4') {
            width = 8.27; // inches
            height = 11.69; // inches
        }
        
        if (tileOverlap) {
            overlap = parseFloat(tileOverlap.value);
        }
        
        // Get preview canvas dimensions
        const canvas = document.getElementById('preview-canvas');
        if (!canvas) return;
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Get DPI setting
        const dpiSelect = document.getElementById('export-dpi');
        const dpi = dpiSelect ? parseFloat(dpiSelect.value) : 96;
        
        // Calculate tile size in pixels
        const tileWidthPx = width * dpi;
        const tileHeightPx = height * dpi;
        const overlapPx = overlap * dpi;
        
        // Calculate number of tiles needed
        const tilesX = Math.ceil(canvasWidth / (tileWidthPx - overlapPx));
        const tilesY = Math.ceil(canvasHeight / (tileHeightPx - overlapPx));
        
        // Create tile grid
        for (let y = 0; y < tilesY; y++) {
            for (let x = 0; x < tilesX; x++) {
                const tile = document.createElement('div');
                tile.className = 'print-tile';
                
                // Position tile
                const left = x * (tileWidthPx - overlapPx);
                const top = y * (tileHeightPx - overlapPx);
                
                tile.style.left = `${left}px`;
                tile.style.top = `${top}px`;
                tile.style.width = `${tileWidthPx}px`;
                tile.style.height = `${tileHeightPx}px`;
                
                // Add tile label
                const label = document.createElement('div');
                label.className = 'tile-label';
                label.textContent = `Tile ${x+1}-${y+1}`;
                tile.appendChild(label);
                
                overlay.appendChild(tile);
            }
        }
    }
}

/**
 * Export map to the selected format
 */
function exportMap(format) {
    // Get export settings
    const title = document.getElementById('export-title');
    const subtitle = document.getElementById('export-subtitle');
    const dpiSelect = document.getElementById('export-dpi');
    
    const exportTitle = title ? title.value : 'Map Export';
    const exportSubtitle = subtitle ? subtitle.value : '';
    const dpi = dpiSelect ? parseInt(dpiSelect.value) : 96;
    
    // Get the map element
    const map = document.getElementById('map');
    if (!map) return;
    
    // Export based on format
    if (format === 'png' || format === 'jpg' || format === 'tiff') {
        exportRaster(map, format, exportTitle, dpi);
    } else if (format === 'pdf' || format === 'eps') {
        exportPDF(map, exportTitle, exportSubtitle, dpi);
    } else if (format === 'svg') {
        exportSVG(map, exportTitle, exportSubtitle);
    } else if (format === 'geojson' || format === 'kml') {
        exportData(format);
    }
}

/**
 * Export map as raster image (PNG/JPG/TIFF)
 */
function exportRaster(mapElement, format, title, dpi) {
    const scale = dpi / 96; // Standard screen DPI is 96
    
    const options = {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
    };
    
    html2canvas(mapElement, options).then(function(canvas) {
        // Get file extension
        const extension = format.toLowerCase();
        
        // Convert canvas to data URL
        let dataURL;
        
        if (extension === 'jpg' || extension === 'jpeg') {
            dataURL = canvas.toDataURL('image/jpeg', 0.9);
        } else if (extension === 'tiff') {
            // Note: browsers don't natively support TIFF export
            alert('TIFF export requires server processing.');
            return;
        } else {
            // Default to PNG
            dataURL = canvas.toDataURL('image/png');
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

/**
 * Export map as PDF
 */
function exportPDF(mapElement, title, subtitle, dpi) {
    const scale = dpi / 96; // Standard screen DPI is 96
    
    html2canvas(mapElement, { scale: scale, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' }).then(function(canvas) {
        const imgData = canvas.toDataURL('image/png');
        
        // Get PDF orientation and size
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
        
        // Initialize PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        // Add title and subtitle if provided
        if (title) {
            pdf.setFontSize(24);
            pdf.text(title, 40, 30);
        }
        
        if (subtitle) {
            pdf.setFontSize(16);
            pdf.text(subtitle, 40, 50);
        }
        
        // Save PDF
        pdf.save(`${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    });
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
            console.log("Setting up click handler for template:", item.getAttribute('data-template'));
            item.addEventListener('click', function() {
                const templateName = this.getAttribute('data-template');
                console.log("Template clicked:", templateName);
                applyTemplate(templateName);
                
                // Highlight selected template
                templateItems.forEach(t => t.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
    } else {
        console.warn("No template items found to attach click handlers!");
    }
    
    // Initialize drag and drop
    if (layoutElements) {
        layoutElements.forEach(element => {
            element.addEventListener('dragstart', handleDragStart);
        });
    }
    
    if (layoutCanvas) {
        layoutCanvas.addEventListener('dragover', handleDragOver);
        layoutCanvas.addEventListener('drop', handleDrop);
        layoutCanvas.addEventListener('click', handleCanvasClick);
    }
    
    // Initialize paper sheet
    if (paperSheet) {
        // Set default to portrait
        paperSheet.classList.add('portrait');
    }
}

/**
 * Apply a predefined template to the layout
 */
function applyTemplate(templateName) {
    console.log("Applying template:", templateName);
    
    // Try to find the paper sheet by ID first (more specific), then by class
    const paperSheet = document.getElementById('layout-paper-sheet') || document.querySelector('.paper-sheet');
    console.log("Paper sheet element:", paperSheet);
    
    if (!paperSheet) {
        console.error("Paper sheet element not found!");
        alert("Error: Could not find the layout paper sheet element. Please refresh the page and try again.");
        return;
    }
    
    // Clear current layout
    console.log("Clearing paper sheet, current content:", paperSheet.children.length, "elements");
    paperSheet.innerHTML = '';
    
    // Apply selected template
    console.log("Selecting template implementation for:", templateName);
    switch (templateName) {
        case 'standard':
            createStandardTemplate(paperSheet);
            break;
        case 'professional':
            createProfessionalTemplate(paperSheet);
            break;
        case 'presentation':
            createPresentationTemplate(paperSheet);
            break;
        case 'tactical':
            createTacticalTemplate(paperSheet);
            break;
    }
    
    // Update orientation based on template
    const orientationSelect = document.getElementById('layout-orientation');
    if (orientationSelect) {
        if (templateName === 'presentation' || templateName === 'tactical') {
            orientationSelect.value = 'landscape';
            paperSheet.classList.add('landscape');
            paperSheet.classList.remove('portrait');
        } else {
            orientationSelect.value = 'portrait';
            paperSheet.classList.add('portrait');
            paperSheet.classList.remove('landscape');
        }
    }
}

/**
 * Create standard template with basic layout
 */
function createStandardTemplate(container) {
    // Add map frame
    const mapFrame = createLayoutElement('map', {
        left: '5%',
        top: '15%',
        width: '90%',
        height: '65%'
    });
    
    // Add title
    const title = createLayoutElement('title', {
        left: '5%',
        top: '5%',
        width: '90%',
        height: '8%'
    });
    
    // Add legend
    const legend = createLayoutElement('legend', {
        left: '5%',
        top: '82%',
        width: '45%',
        height: '15%'
    });
    
    // Add scale bar
    const scaleBar = createLayoutElement('scale-bar', {
        left: '60%',
        top: '85%',
        width: '25%',
        height: '5%'
    });
    
    // Add north arrow
    const northArrow = createLayoutElement('north-arrow', {
        left: '85%',
        top: '85%',
        width: '8%',
        height: '10%'
    });
    
    container.appendChild(mapFrame);
    container.appendChild(title);
    container.appendChild(legend);
    container.appendChild(scaleBar);
    container.appendChild(northArrow);
}

/**
 * Create professional template with more layout elements
 */
function createProfessionalTemplate(container) {
    // Add map frame
    const mapFrame = createLayoutElement('map', {
        left: '5%',
        top: '15%',
        width: '65%',
        height: '70%'
    });
    
    // Add title
    const title = createLayoutElement('title', {
        left: '5%',
        top: '5%',
        width: '90%',
        height: '8%'
    });
    
    // Add legend
    const legend = createLayoutElement('legend', {
        left: '72%',
        top: '15%',
        width: '23%',
        height: '40%'
    });
    
    // Add text box
    const textBox = createLayoutElement('text', {
        left: '72%',
        top: '58%',
        width: '23%',
        height: '15%'
    });
    
    // Add scale bar
    const scaleBar = createLayoutElement('scale-bar', {
        left: '5%',
        top: '87%',
        width: '25%',
        height: '5%'
    });
    
    // Add north arrow
    const northArrow = createLayoutElement('north-arrow', {
        left: '35%',
        top: '85%',
        width: '8%',
        height: '10%'
    });
    
    // Add image (logo)
    const logo = createLayoutElement('image', {
        left: '72%',
        top: '76%',
        width: '23%',
        height: '10%'
    });
    
    container.appendChild(mapFrame);
    container.appendChild(title);
    container.appendChild(legend);
    container.appendChild(textBox);
    container.appendChild(scaleBar);
    container.appendChild(northArrow);
    container.appendChild(logo);
}

/**
 * Create a presentation template optimized for landscape orientation
 */
function createPresentationTemplate(container) {
    // Add map frame
    const mapFrame = createLayoutElement('map', {
        left: '5%',
        top: '20%',
        width: '90%',
        height: '65%'
    });
    
    // Add title
    const title = createLayoutElement('title', {
        left: '5%',
        top: '5%',
        width: '90%',
        height: '10%'
    });
    
    // Add legend
    const legend = createLayoutElement('legend', {
        left: '5%',
        top: '88%',
        width: '55%',
        height: '8%'
    });
    
    // Add scale bar
    const scaleBar = createLayoutElement('scale-bar', {
        left: '63%',
        top: '88%',
        width: '20%',
        height: '4%'
    });
    
    // Add north arrow
    const northArrow = createLayoutElement('north-arrow', {
        left: '88%',
        top: '86%',
        width: '6%',
        height: '8%'
    });
    
    container.appendChild(mapFrame);
    container.appendChild(title);
    container.appendChild(legend);
    container.appendChild(scaleBar);
    container.appendChild(northArrow);
}

/**
 * Create a tactical template optimized for emergency response
 */
function createTacticalTemplate(container) {
    // Add map frame
    const mapFrame = createLayoutElement('map', {
        left: '25%',
        top: '10%',
        width: '70%',
        height: '80%'
    });
    
    // Add title
    const title = createLayoutElement('title', {
        left: '25%',
        top: '2%',
        width: '70%',
        height: '6%'
    });
    
    // Add legend
    const legend = createLayoutElement('legend', {
        left: '3%',
        top: '10%',
        width: '18%',
        height: '35%'
    });
    
    // Add scale bar
    const scaleBar = createLayoutElement('scale-bar', {
        left: '48%',
        top: '92%',
        width: '25%',
        height: '4%'
    });
    
    // Add north arrow
    const northArrow = createLayoutElement('north-arrow', {
        left: '84%',
        top: '90%',
        width: '6%',
        height: '8%'
    });
    
    // Add text boxes for tactical information
    const infoBox1 = createLayoutElement('text', {
        left: '3%',
        top: '48%',
        width: '18%',
        height: '12%',
        content: 'Incident Info'
    });
    
    const infoBox2 = createLayoutElement('text', {
        left: '3%',
        top: '63%',
        width: '18%',
        height: '12%',
        content: 'Resources'
    });
    
    const infoBox3 = createLayoutElement('text', {
        left: '3%',
        top: '78%',
        width: '18%',
        height: '12%',
        content: 'Hazards'
    });
    
    container.appendChild(mapFrame);
    container.appendChild(title);
    container.appendChild(legend);
    container.appendChild(scaleBar);
    container.appendChild(northArrow);
    container.appendChild(infoBox1);
    container.appendChild(infoBox2);
    container.appendChild(infoBox3);
}

/**
 * Fix for template application - direct function to apply a template
 * Add this to window object so it can be called from HTML
 */
window.applyMapTemplate = function(templateName) {
    console.log("Directly applying template:", templateName);
    applyTemplate(templateName);
};

/**
 * Create a layout element with specified styles
 */
function createLayoutElement(type, styles) {
    const element = document.createElement('div');
    element.className = `layout-element layout-${type}`;
    element.setAttribute('data-element-type', type);
    
    // Set position and size
    Object.keys(styles).forEach(key => {
        if (key !== 'content') {
            element.style[key] = styles[key];
        }
    });
    
    // Add content based on type
    if (type === 'title') {
        element.innerHTML = '<h3>Map Title</h3><p>Subtitle text</p>';
    } else if (type === 'text' && styles.content) {
        element.innerHTML = `<div class="text-content">${styles.content}</div>`;
    } else if (type === 'text') {
        element.innerHTML = '<div class="text-content">Text content goes here</div>';
    } else if (type === 'legend') {
        element.innerHTML = '<div class="legend-title">Legend</div><div class="legend-content"></div>';
    } else if (type === 'map') {
        element.innerHTML = '<div class="map-placeholder">Map Content</div>';
    } else if (type === 'north-arrow') {
        element.innerHTML = '<i class="fas fa-arrow-up"></i>';
    } else if (type === 'scale-bar') {
        element.innerHTML = '<div class="scale-bar-graphic"></div>';
    } else if (type === 'image') {
        element.innerHTML = '<div class="image-placeholder"><i class="fas fa-image"></i></div>';
    } else if (type === 'shape') {
        element.innerHTML = '<div class="shape-placeholder"></div>';
    }
    
    // Add handle for dragging
    const handle = document.createElement('div');
    handle.className = 'element-handle';
    element.appendChild(handle);
    
    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-element';
    deleteBtn.innerHTML = '×';
    deleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        element.remove();
        
        // Clear properties panel when element is deleted
        const propertiesPanel = document.getElementById('element-properties');
        if (propertiesPanel) {
            propertiesPanel.innerHTML = '<p class="no-selection-message">Select an element to edit its properties</p>';
        }
    });
    
    element.appendChild(deleteBtn);
    
    // Make the element draggable within the canvas
    makeElementDraggable(element);
    
    return element;
}

/**
 * Make an element draggable within its container
 */
function makeElementDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    const handle = element.querySelector('.element-handle');
    if (handle) {
        // If handle exists, use it for dragging
        handle.onmousedown = dragMouseDown;
    } else {
        // Otherwise, use the element itself
        element.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
        e.preventDefault();
        // Get the mouse cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // Call function whenever the cursor moves
        document.onmousemove = elementDrag;
        
        // Add active class
        element.classList.add('active');
    }
    
    function elementDrag(e) {
        e.preventDefault();
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Set the element's new position
        const container = element.parentElement;
        
        // Get current position as pixels
        const currentLeft = element.offsetLeft - pos1;
        const currentTop = element.offsetTop - pos2;
        
        // Calculate percentages
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        const leftPercent = (currentLeft / containerWidth * 100).toFixed(2);
        const topPercent = (currentTop / containerHeight * 100).toFixed(2);
        
        // Set new position as percentages for responsive layout
        element.style.left = leftPercent + '%';
        element.style.top = topPercent + '%';
        
        // Update properties panel if this element is selected
        updateElementPositionProperties(element);
    }
    
    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/**
 * Update position properties in the properties panel
 */
function updateElementPositionProperties(element) {
    const propertiesPanel = document.getElementById('element-properties');
    if (!propertiesPanel) return;
    
    // Check if this element is currently selected
    const selectedElement = document.querySelector('.layout-element.selected');
    if (selectedElement !== element) return;
    
    // Update position inputs
    const leftInput = propertiesPanel.querySelector('input[name="element-left"]');
    const topInput = propertiesPanel.querySelector('input[name="element-top"]');
    
    if (leftInput) {
        leftInput.value = parseFloat(element.style.left);
    }
    
    if (topInput) {
        topInput.value = parseFloat(element.style.top);
    }
}

/**
 * Handle drag start of elements from toolbox
 */
function handleDragStart(e) {
    const elementType = this.getAttribute('data-element');
    e.dataTransfer.setData('text/plain', elementType);
}

/**
 * Handle drag over canvas
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

/**
 * Handle drop on canvas
 */
function handleDrop(e) {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('text/plain');
    
    // Get drop position
    const canvas = document.querySelector('.paper-sheet');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const left = ((e.clientX - rect.left) / rect.width * 100).toFixed(2);
    const top = ((e.clientY - rect.top) / rect.height * 100).toFixed(2);
    
    // Create layout element with default size
    const element = createLayoutElement(elementType, {
        left: left + '%',
        top: top + '%',
        width: '20%',
        height: '10%'
    });
    
    // Add to canvas
    canvas.appendChild(element);
    
    // Select the new element
    handleElementSelection(element);
}

/**
 * Handle click on canvas or elements
 */
function handleCanvasClick(e) {
    // Check if an element was clicked
    const element = e.target.closest('.layout-element');
    
    // Deselect all elements
    const elements = document.querySelectorAll('.layout-element');
    elements.forEach(el => el.classList.remove('selected'));
    
    // Clear properties panel
    const propertiesPanel = document.getElementById('element-properties');
    if (propertiesPanel) {
        propertiesPanel.innerHTML = '<p class="no-selection-message">Select an element to edit its properties</p>';
    }
    
    // If an element was clicked, select it
    if (element) {
        handleElementSelection(element);
    }
}

/**
 * Handle element selection
 */
function handleElementSelection(element) {
    // Deselect all elements
    const elements = document.querySelectorAll('.layout-element');
    elements.forEach(el => el.classList.remove('selected'));
    
    // Select this element
    element.classList.add('selected');
    
    // Show properties for this element
    showElementProperties(element);
}

/**
 * Show element properties in the properties panel
 */
function showElementProperties(element) {
    const propertiesPanel = document.getElementById('element-properties');
    if (!propertiesPanel) return;
    
    // Get element type and current styles
    const elementType = element.getAttribute('data-element-type');
    const styles = {
        left: parseFloat(element.style.left),
        top: parseFloat(element.style.top),
        width: parseFloat(element.style.width),
        height: parseFloat(element.style.height)
    };
    
    // Clear current properties
    propertiesPanel.innerHTML = '';
    
    // Add common properties
    propertiesPanel.innerHTML += `
        <div class="property-group">
            <h5>Position & Size</h5>
            <div class="property-row">
                <label>Left:</label>
                <div class="property-input">
                    <input type="number" name="element-left" value="${styles.left}" min="0" max="100" step="0.1"> %
                </div>
            </div>
            <div class="property-row">
                <label>Top:</label>
                <div class="property-input">
                    <input type="number" name="element-top" value="${styles.top}" min="0" max="100" step="0.1"> %
                </div>
            </div>
            <div class="property-row">
                <label>Width:</label>
                <div class="property-input">
                    <input type="number" name="element-width" value="${styles.width}" min="1" max="100" step="0.1"> %
                </div>
            </div>
            <div class="property-row">
                <label>Height:</label>
                <div class="property-input">
                    <input type="number" name="element-height" value="${styles.height}" min="1" max="100" step="0.1"> %
                </div>
            </div>
        </div>
    `;
    
    // Add element-specific properties
    if (elementType === 'title') {
        addTitleProperties(propertiesPanel, element);
    } else if (elementType === 'text') {
        addTextProperties(propertiesPanel, element);
    } else if (elementType === 'map') {
        addMapProperties(propertiesPanel, element);
    } else if (elementType === 'legend') {
        addLegendProperties(propertiesPanel, element);
    } else if (elementType === 'image') {
        addImageProperties(propertiesPanel, element);
    } else if (elementType === 'shape') {
        addShapeProperties(propertiesPanel, element);
    }
    
    // Add event listeners for property changes
    addPropertyChangeListeners(propertiesPanel, element);
}

/**
 * Add event listeners for property changes
 */
function addPropertyChangeListeners(propertiesPanel, element) {
    // Position and size properties
    const leftInput = propertiesPanel.querySelector('input[name="element-left"]');
    const topInput = propertiesPanel.querySelector('input[name="element-top"]');
    const widthInput = propertiesPanel.querySelector('input[name="element-width"]');
    const heightInput = propertiesPanel.querySelector('input[name="element-height"]');
    
    if (leftInput) {
        leftInput.addEventListener('change', function() {
            element.style.left = this.value + '%';
        });
    }
    
    if (topInput) {
        topInput.addEventListener('change', function() {
            element.style.top = this.value + '%';
        });
    }
    
    if (widthInput) {
        widthInput.addEventListener('change', function() {
            element.style.width = this.value + '%';
        });
    }
    
    if (heightInput) {
        heightInput.addEventListener('change', function() {
            element.style.height = this.value + '%';
        });
    }
    
    // Element-specific properties
    const elementType = element.getAttribute('data-element-type');
    
    if (elementType === 'title') {
        addTitlePropertyListeners(propertiesPanel, element);
    } else if (elementType === 'text') {
        addTextPropertyListeners(propertiesPanel, element);
    } else if (elementType === 'map') {
        addMapPropertyListeners(propertiesPanel, element);
    } else if (elementType === 'legend') {
        addLegendPropertyListeners(propertiesPanel, element);
    } else if (elementType === 'image') {
        addImagePropertyListeners(propertiesPanel, element);
    } else if (elementType === 'shape') {
        addShapePropertyListeners(propertiesPanel, element);
    }
}

/**
 * Draw crop marks on print preview canvas
 */
function drawCropMarks(ctx, width, height) {
    const markLength = 20;
    const offset = 5;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.5;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(offset, offset + markLength);
    ctx.lineTo(offset, offset);
    ctx.lineTo(offset + markLength, offset);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - offset - markLength, offset);
    ctx.lineTo(width - offset, offset);
    ctx.lineTo(width - offset, offset + markLength);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(offset, height - offset - markLength);
    ctx.lineTo(offset, height - offset);
    ctx.lineTo(offset + markLength, height - offset);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - offset - markLength, height - offset);
    ctx.lineTo(width - offset, height - offset);
    ctx.lineTo(width - offset, height - offset - markLength);
    ctx.stroke();
}

/**
 * Draw color bars on print preview canvas
 */
function drawColorBars(ctx, width, height) {
    const barHeight = 15;
    const barWidth = 30;
    const offset = 30;
    
    // Create color bars
    const colors = [
        '#000000', // Black
        '#FFFFFF', // White
        '#FF0000', // Red
        '#00FF00', // Green
        '#0000FF', // Blue
        '#00FFFF', // Cyan
        '#FF00FF', // Magenta
        '#FFFF00', // Yellow
        '#777777'  // Gray
    ];
    
    // Draw color bars at bottom of page
    let x = offset;
    colors.forEach(color => {
        ctx.fillStyle = color;
        ctx.fillRect(x, height - offset - barHeight, barWidth, barHeight);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, height - offset - barHeight, barWidth, barHeight);
        x += barWidth + 5;
    });
    
    // Add CMYK gradient bar
    const gradientWidth = 200;
    const gradientX = width - offset - gradientWidth;
    
    // Create gradient for grayscale
    const gradient = ctx.createLinearGradient(gradientX, 0, gradientX + gradientWidth, 0);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#FFFFFF');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(gradientX, height - offset - barHeight, gradientWidth, barHeight);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(gradientX, height - offset - barHeight, gradientWidth, barHeight);
}

/**
 * Apply CMYK preview effect to canvas (simulated)
 */
function applyCMYKPreview(ctx, width, height) {
    // This is a simplified simulation of CMYK preview
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // Get RGB values
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Simulate CMYK conversion effect
        // This doesn't actually convert to CMYK, just gives a visual approximation
        const k = Math.min(1 - r/255, 1 - g/255, 1 - b/255);
        const c = (1 - r/255 - k) / (1 - k) || 0;
        const m = (1 - g/255 - k) / (1 - k) || 0;
        const y = (1 - b/255 - k) / (1 - k) || 0;
        
        // Convert back to RGB for display with a more muted appearance
        data[i] = Math.round(255 * (1 - c) * (1 - k));
        data[i + 1] = Math.round(255 * (1 - m) * (1 - k));
        data[i + 2] = Math.round(255 * (1 - y) * (1 - k));
    }
    
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Export map as SVG
 */
function exportSVG(mapElement, title, subtitle) {
    // Create SVG document
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    
    // Set dimensions
    const width = mapElement.clientWidth;
    const height = mapElement.clientHeight;
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    
    // Add title and background
    const background = document.createElementNS(svgNS, "rect");
    background.setAttribute("width", width);
    background.setAttribute("height", height);
    background.setAttribute("fill", "#ffffff");
    svg.appendChild(background);
    
    // Convert map to SVG elements
    convertLeafletToSVG(svg, mapElement);
    
    // Add title and subtitle if provided
    if (title) {
        const titleElement = document.createElementNS(svgNS, "text");
        titleElement.setAttribute("x", 40);
        titleElement.setAttribute("y", 30);
        titleElement.setAttribute("font-size", "24px");
        titleElement.setAttribute("font-family", "Arial, sans-serif");
        titleElement.textContent = title;
        svg.appendChild(titleElement);
    }
    
    if (subtitle) {
        const subtitleElement = document.createElementNS(svgNS, "text");
        subtitleElement.setAttribute("x", 40);
        subtitleElement.setAttribute("y", 50);
        subtitleElement.setAttribute("font-size", "16px");
        subtitleElement.setAttribute("font-family", "Arial, sans-serif");
        subtitleElement.textContent = subtitle;
        svg.appendChild(subtitleElement);
    }
    
    // Serialize SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    
    // Create download link
    const blob = new Blob([svgString], {type: "image/svg+xml"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Convert Leaflet map to SVG elements
 */
function convertLeafletToSVG(svg, mapElement) {
    // This is a placeholder implementation
    // Full conversion requires access to Leaflet's internal layers
    
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Add a note that this is a simplified conversion
    const noteElement = document.createElementNS(svgNS, "text");
    noteElement.setAttribute("x", mapElement.clientWidth / 2);
    noteElement.setAttribute("y", 20);
    noteElement.setAttribute("text-anchor", "middle");
    noteElement.setAttribute("font-size", "12px");
    noteElement.setAttribute("font-family", "Arial, sans-serif");
    noteElement.textContent = "Note: This is a vector representation of the map";
    svg.appendChild(noteElement);
    
    // Create a group for map elements
    const mapGroup = document.createElementNS(svgNS, "g");
    svg.appendChild(mapGroup);
    
    // Get map layers from Leaflet
    // In a real implementation, we would iterate through Leaflet's layers
    // and convert each one to appropriate SVG elements
    
    // For this simplified version, we'll just capture the visible map as an image
    // and embed it in the SVG
    html2canvas(mapElement).then(function(canvas) {
        const imgData = canvas.toDataURL("image/png");
        const img = document.createElementNS(svgNS, "image");
        img.setAttribute("width", mapElement.clientWidth);
        img.setAttribute("height", mapElement.clientHeight);
        img.setAttribute("x", 0);
        img.setAttribute("y", 0);
        img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imgData);
        mapGroup.appendChild(img);
    });
}

/**
 * Export map data in GeoJSON or KML format
 */
function exportData(format) {
    // Get current map data
    // In a real implementation, we would extract data from Leaflet layers
    
    alert(`Exporting data in ${format.toUpperCase()} format is not fully implemented in this prototype.`);
    
    // For a full implementation, we would:
    // 1. Extract GeoJSON from relevant Leaflet layers
    // 2. Convert to the requested format if necessary (e.g., KML)
    // 3. Create a download link
}

/**
 * Print the map directly to the printer
 */
function printMap() {
    const previewCanvas = document.getElementById('preview-canvas');
    if (!previewCanvas) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Popup blocked. Please allow popups for printing.");
        return;
    }
    
    // Create print content
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Map</title>
            <style>
                body { margin: 0; padding: 0; }
                img { max-width: 100%; height: auto; }
                @media print {
                    body { margin: 0; padding: 0; }
                }
            </style>
        </head>
        <body>
            <img src="${previewCanvas.toDataURL('image/png')}" alt="Map">
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        window.close();
                    }, 200);
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

/**
 * Opens a modal by ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Force display:flex style instead of simply setting to block
        modal.style.cssText = 'display: flex !important;';
        
        console.log(`Opening modal: ${modalId}`);
        
        // Make sure default tab is selected for modals with tabs
        if (modalId === 'export-modal') {
            const defaultTab = modal.querySelector('.modal-tab');
            if (defaultTab) {
                defaultTab.click();
            }
            
            // Initialize the export-modal tabs
            document.querySelectorAll('.modal-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    const tabId = this.getAttribute('data-tab');
                    console.log(`Clicked tab: ${tabId}`);
                    
                    // Remove active class from all tabs and hide all panels
                    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
                    
                    // Add active class to clicked tab and show its panel
                    this.classList.add('active');
                    const panel = document.getElementById(tabId + '-panel');
                    if (panel) {
                        panel.style.display = 'block';
                        console.log(`Showing panel: ${tabId}-panel`);
                    } else {
                        console.warn(`Panel not found: ${tabId}-panel`);
                    }
                });
            });
            
            // Force the basic tab to be active initially
            const basicTab = document.querySelector('[data-tab="export-basic"]');
            if (basicTab) {
                setTimeout(() => {
                    basicTab.click();
                }, 50);
            }
        }
    }
}

/**
 * Closes a modal by ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Initialize the map and base layers
 */
function initMap() {
    try {
        console.log("Initializing map...");
        
        // Debug log for troubleshooting layer issues
        console.log("Setting up map layers...");
        
        // Create the map
        const map = L.map('map', {
            center: [39.8283, -98.5795], // Center of the USA
            zoom: 4,
            zoomControl: false, // We'll add custom zoom control
            attributionControl: true
        });
        
        // Add base layers
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        
        const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            maxZoom: 17
        });
        
        // Add layer controls to switch between base maps
        const baseLayers = {
            "Street Map": streetLayer,
            "Satellite Imagery": satelliteLayer,
            "Terrain Map": terrainLayer
        };
        
        // Store the map in a global variable for access in other functions
        window.firemapMap = map;
        window.firemapLayers = baseLayers;
        
        // Set up base layer radio buttons
        const streetLayerRadio = document.getElementById('street-layer');
        if (streetLayerRadio) {
            streetLayerRadio.addEventListener('change', function() {
                if (this.checked) {
                    map.removeLayer(satelliteLayer);
                    map.removeLayer(terrainLayer);
                    map.addLayer(streetLayer);
                }
            });
        }
        
        const satelliteLayerRadio = document.getElementById('satellite-layer');
        if (satelliteLayerRadio) {
            satelliteLayerRadio.addEventListener('change', function() {
                if (this.checked) {
                    map.removeLayer(streetLayer);
                    map.removeLayer(terrainLayer);
                    map.addLayer(satelliteLayer);
                }
            });
        }
        
        const terrainLayerRadio = document.getElementById('terrain-layer');
        if (terrainLayerRadio) {
            terrainLayerRadio.addEventListener('change', function() {
                if (this.checked) {
                    console.log("Switching to terrain layer");
                    // First remove other layers to avoid visual conflicts
                    if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
                    if (map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
                    
                    // Then add terrain layer if not already added
                    if (!map.hasLayer(terrainLayer)) {
                        map.addLayer(terrainLayer);
                        console.log("Terrain layer added");
                    }
                }
            });
        }
        
        // Add zoom controls
        L.control.zoom({
            position: 'bottomright'
        }).addTo(map);
        
        // Add scale control
        L.control.scale({
            position: 'bottomleft',
            imperial: true,
            metric: true
        }).addTo(map);
        
        // Use a simple distance measuring tool instead of L.Control.Measure
        // This avoids the Content Security Policy issue
        
        try {
            // Create a custom measure button
            const measureButton = L.easyButton({
                states: [{
                    stateName: 'inactive',
                    icon: 'fa-ruler',
                    title: 'Measure distance',
                    onClick: function(btn, map) {
                        startMeasuring(map);
                        btn.state('active');
                    }
                }, {
                    stateName: 'active',
                    icon: 'fa-times',
                    title: 'Stop measuring',
                    onClick: function(btn, map) {
                        stopMeasuring(map);
                        btn.state('inactive');
                    }
                }]
            });
            
            measureButton.addTo(map);
            
            // Store for later reference
            window.firemapMeasureButton = measureButton;
            
            console.log("Custom measure tool initialized successfully");
        } catch (measureError) {
            console.warn("Error initializing custom measure tool:", measureError);
            // Continue without the measure tool
        }
        
        // Track mouse position
        map.on('mousemove', function(e) {
            const mousePosition = document.getElementById('mouse-position');
            if (mousePosition) {
                const lat = e.latlng.lat.toFixed(5);
                const lng = e.latlng.lng.toFixed(5);
                mousePosition.textContent = `Coordinates: ${lat}, ${lng}`;
            }
        });
        
        // Initialize draw tools
        initializeDrawTools(map);
        
        console.log("Map initialized successfully");
        return true;
    } catch (error) {
        console.error("Error initializing map:", error);
        return false;
    }
}

/**
 * Start measuring distances on the map
 */
function startMeasuring(map) {
    if (!map) return;
    
    // Create layer for the measurement line
    const measureLayer = window.measureLayer = new L.FeatureGroup().addTo(map);
    
    // Create a polyline for the measurement
    const measureLine = window.measureLine = L.polyline([], {
        color: '#ff7800',
        weight: 3,
        opacity: 0.8,
        dashArray: '5, 10',
        lineCap: 'round'
    }).addTo(measureLayer);
    
    // Array to store measurement points
    const points = window.measurePoints = [];
    
    // Add markers for each point
    const markers = window.measureMarkers = [];
    
    // Add total distance label
    const distanceLabel = window.distanceLabel = L.DomUtil.create('div', 'measure-distance-label');
    distanceLabel.style.position = 'absolute';
    distanceLabel.style.bottom = '20px';
    distanceLabel.style.left = '50%';
    distanceLabel.style.transform = 'translateX(-50%)';
    distanceLabel.style.backgroundColor = 'white';
    distanceLabel.style.padding = '5px 10px';
    distanceLabel.style.borderRadius = '4px';
    distanceLabel.style.border = '2px solid #ff7800';
    distanceLabel.style.fontWeight = 'bold';
    distanceLabel.style.zIndex = '1000';
    distanceLabel.innerHTML = 'Click on the map to start measuring';
    document.querySelector('.map-container').appendChild(distanceLabel);
    
    // Set cursor for measurement mode
    map.getContainer().style.cursor = 'crosshair';
    
    // Click handler for adding points
    const clickHandler = function(e) {
        // Add point to array
        points.push(e.latlng);
        
        // Add marker at the clicked point
        const marker = L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'measure-point',
                html: `<div style="width: 10px; height: 10px; background-color: #ff7800; border-radius: 50%; border: 2px solid white;"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            })
        }).addTo(measureLayer);
        
        markers.push(marker);
        
        // Update the polyline
        measureLine.setLatLngs(points);
        
        // Calculate total distance
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
            totalDistance += points[i-1].distanceTo(points[i]);
        }
        
        // Convert to appropriate units and update label
        if (totalDistance > 1000) {
            // Convert to miles if > 1000m
            const miles = totalDistance / 1609.34;
            distanceLabel.innerHTML = `Distance: ${miles.toFixed(2)} miles`;
        } else {
            // Convert to feet
            const feet = totalDistance * 3.28084;
            distanceLabel.innerHTML = `Distance: ${feet.toFixed(0)} feet`;
        }
    };
    
    // Store the click handler for later removal
    window.measureClickHandler = clickHandler;
    
    // Add the click handler to the map
    map.on('click', clickHandler);
    
    // Also show current measurement as a tooltip while moving
    const mouseMoveHandler = function(e) {
        if (points.length > 0) {
            const lastPoint = points[points.length - 1];
            const tempLine = [lastPoint, e.latlng];
            
            // Calculate distance for this segment
            const segmentDistance = lastPoint.distanceTo(e.latlng);
            
            // Create tooltip text
            let tooltipText;
            if (segmentDistance > 1000) {
                const miles = segmentDistance / 1609.34;
                tooltipText = `${miles.toFixed(2)} miles`;
            } else {
                const feet = segmentDistance * 3.28084;
                tooltipText = `${feet.toFixed(0)} feet`;
            }
            
            // Update or create the tooltip
            if (!window.measureTooltip) {
                window.measureTooltip = L.tooltip({
                    permanent: true,
                    direction: 'right',
                    className: 'measure-tooltip'
                }).setLatLng(e.latlng).setContent(tooltipText).addTo(map);
            } else {
                window.measureTooltip.setLatLng(e.latlng).setContent(tooltipText);
            }
        }
    };
    
    // Store the mousemove handler for later removal
    window.measureMouseMoveHandler = mouseMoveHandler;
    
    // Add the mousemove handler to the map
    map.on('mousemove', mouseMoveHandler);
    
    // Create info message
    const infoMsg = L.DomUtil.create('div', 'measure-info');
    infoMsg.style.position = 'absolute';
    infoMsg.style.top = '70px';
    infoMsg.style.left = '50%';
    infoMsg.style.transform = 'translateX(-50%)';
    infoMsg.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    infoMsg.style.padding = '5px 10px';
    infoMsg.style.borderRadius = '4px';
    infoMsg.style.zIndex = '1000';
    infoMsg.innerHTML = 'Click to add points, click the X button to finish';
    document.querySelector('.map-container').appendChild(infoMsg);
    window.measureInfoMsg = infoMsg;
}

/**
 * Stop measuring and clean up
 */
function stopMeasuring(map) {
    if (!map) return;
    
    // Remove event handlers
    if (window.measureClickHandler) {
        map.off('click', window.measureClickHandler);
    }
    
    if (window.measureMouseMoveHandler) {
        map.off('mousemove', window.measureMouseMoveHandler);
    }
    
    // Remove measurement layer
    if (window.measureLayer) {
        map.removeLayer(window.measureLayer);
    }
    
    // Remove tooltip
    if (window.measureTooltip) {
        map.removeLayer(window.measureTooltip);
    }
    
    // Remove distance label
    if (window.distanceLabel && window.distanceLabel.parentNode) {
        window.distanceLabel.parentNode.removeChild(window.distanceLabel);
    }
    
    // Remove info message
    if (window.measureInfoMsg && window.measureInfoMsg.parentNode) {
        window.measureInfoMsg.parentNode.removeChild(window.measureInfoMsg);
    }
    
    // Reset cursor
    map.getContainer().style.cursor = '';
    
    // Clean up global variables
    window.measurePoints = null;
    window.measureMarkers = null;
    window.measureLine = null;
    window.measureLayer = null;
    window.measureTooltip = null;
    window.measureClickHandler = null;
    window.measureMouseMoveHandler = null;
    window.distanceLabel = null;
    window.measureInfoMsg = null;
}

/**
 * Initialize drag and drop for map symbols
 */
function initializeMapSymbolsDragDrop() {
    console.log("Initializing map symbols drag and drop...");
    
    // Get all draggable icons
    const draggableIcons = document.querySelectorAll('.draggable-icon');
    console.log(`Found ${draggableIcons.length} draggable icons`);
    
    // Add drag start event listener to each icon
    draggableIcons.forEach(icon => {
        icon.addEventListener('dragstart', function(e) {
            const iconType = this.getAttribute('data-icon');
            console.log("Drag started for icon:", iconType);
            e.dataTransfer.setData('text/plain', iconType);
            e.dataTransfer.effectAllowed = 'copy';
        });
        
        // Make sure the icon is actually draggable
        icon.setAttribute('draggable', 'true');
    });
    
    // Add drag over and drop events to the map
    const mapElement = document.getElementById('map');
    if (mapElement) {
        // Allow dropping on the map
        mapElement.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });
        
        // Handle the drop event
        mapElement.addEventListener('drop', function(e) {
            e.preventDefault();
            
            // Get the icon type from the data transfer
            const iconType = e.dataTransfer.getData('text/plain');
            if (!iconType) {
                console.warn("No icon type in data transfer");
                return;
            }
            
            console.log("Icon dropped on map:", iconType);
            
            // Get the drop coordinates
            const map = window.firemapMap;
            if (!map) {
                console.error("Map not initialized");
                return;
            }
            
            // Convert the screen coordinates to map coordinates
            const point = map.containerPointToLatLng(
                L.point(e.clientX - mapElement.getBoundingClientRect().left,
                       e.clientY - mapElement.getBoundingClientRect().top)
            );
            
            // Create a marker at the drop point with an icon
            addMapSymbol(iconType, point);
        });
        console.log("Map drop handlers initialized");
    } else {
        console.error("Map element not found");
    }
}

/**
 * Add a symbol to the map
 */
function addMapSymbol(iconType, latlng) {
    const map = window.firemapMap;
    if (!map) return;
    
    // Get the selected color and size
    const colorSelect = document.getElementById('icon-color');
    const sizeSelect = document.getElementById('icon-size');
    
    const color = colorSelect ? colorSelect.value : '#d32f2f';
    const size = sizeSelect ? sizeSelect.value : 'medium';
    
    // Determine icon size based on selected size
    let iconSize;
    switch (size) {
        case 'small':
            iconSize = [24, 24];
            break;
        case 'large':
            iconSize = [40, 40];
            break;
        case 'medium':
        default:
            iconSize = [32, 32];
            break;
    }
    
    // Create a div icon with Font Awesome
    const divIcon = L.divIcon({
        html: `<i class="fas ${iconType}" style="color: ${color};"></i>`,
        iconSize: iconSize,
        className: `map-icon map-icon-${size}`
    });
    
    // Add the marker to the map
    const marker = L.marker(latlng, {
        icon: divIcon,
        draggable: true
    }).addTo(map);
    
    // Add a popup with the icon information
    const iconName = document.querySelector(`.draggable-icon[data-icon="${iconType}"] span`);
    const name = iconName ? iconName.textContent : 'Map Symbol';
    
    marker.bindPopup(`
        <div class="icon-popup">
            <h4>${name}</h4>
            <button class="delete-icon">Delete</button>
        </div>
    `);
    
    // Add event listener for the delete button
    marker.on('popupopen', function() {
        const deleteBtn = document.querySelector('.delete-icon');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                map.removeLayer(marker);
            });
        }
    });
    
    return marker;
}

// Initialize everything when the document is loaded
/**
 * Initialize draw tools
 */
function initializeDrawTools(map) {
    if (!map) return;
    
    // Create draw control
    const drawControl = new L.Control.Draw({
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
                    color: '#1976d2'
                }
            },
            circle: {
                shapeOptions: {
                    color: '#1976d2'
                }
            },
            rectangle: {
                shapeOptions: {
                    color: '#1976d2'
                }
            },
            marker: true
        },
        edit: {
            featureGroup: new L.FeatureGroup(),
            remove: true
        }
    });
    
    // Create a layer for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Store for later reference
    window.firemapDrawnItems = drawnItems;
    
    // Add the draw control to the map
    map.addControl(drawControl);
    
    // Handle events when items are drawn
    map.on(L.Draw.Event.CREATED, function(event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        // Make the layer draggable
        if (layer instanceof L.Marker) {
            layer.options.draggable = true;
            layer.dragging.enable();
        }
        
        // Add popup for items
        layer.bindPopup(`
            <div class="draw-item-popup">
                <button class="delete-item">Delete</button>
            </div>
        `);
        
        // Add event handler for delete button
        layer.on('popupopen', function() {
            const deleteBtn = document.querySelector('.delete-item');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function() {
                    drawnItems.removeLayer(layer);
                });
            }
        });
    });
    
    // Connect the draw tool button
    const drawToolBtn = document.getElementById('draw-tool');
    if (drawToolBtn) {
        drawToolBtn.addEventListener('click', function() {
            // Toggle draw controls visibility
            const drawContainer = document.querySelector('.leaflet-draw');
            if (drawContainer) {
                if (drawContainer.style.display === 'none') {
                    drawContainer.style.display = 'block';
                    drawToolBtn.classList.add('active');
                } else {
                    drawContainer.style.display = 'none';
                    drawToolBtn.classList.remove('active');
                }
            }
        });
    }
    
    // Connect measure tool button
    const measureToolBtn = document.getElementById('measure-tool');
    if (measureToolBtn) {
        measureToolBtn.addEventListener('click', function() {
            // Find the measure button and click it
            if (window.firemapMeasureButton) {
                // Get current state
                const isActive = measureToolBtn.classList.contains('active');
                
                if (!isActive) {
                    // Activate measure tool
                    window.firemapMeasureButton.state('active');
                    measureToolBtn.classList.add('active');
                } else {
                    // Deactivate measure tool
                    window.firemapMeasureButton.state('inactive');
                    measureToolBtn.classList.remove('active');
                }
            }
        });
    }
    
    // Connect clear tool button
    const clearToolBtn = document.getElementById('clear-tool');
    if (clearToolBtn) {
        clearToolBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all map annotations?')) {
                // Clear drawn items
                drawnItems.clearLayers();
                
                // Stop measuring if active
                if (window.firemapMeasureButton && window.firemapMeasureButton.options.state === 'active') {
                    window.firemapMeasureButton.state('inactive');
                    const measureToolBtn = document.getElementById('measure-tool');
                    if (measureToolBtn) {
                        measureToolBtn.classList.remove('active');
                    }
                }
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM content loaded, initializing FireMapPro");
    
    // Initialize map
    initMap();
    
    // Initialize export buttons
    const exportPngBtn = document.getElementById('export-png');
    if (exportPngBtn) {
        console.log("Found export-png button, adding event listener");
        exportPngBtn.addEventListener('click', function() {
            console.log("Export PNG button clicked");
            openModal('export-modal');
            // Set focus to Basic tab
            const basicTab = document.querySelector('[data-tab="export-basic"]');
            if (basicTab) {
                console.log("Clicking Basic tab");
                basicTab.click();
            } else {
                console.log("Basic tab not found");
            }
        });
    } else {
        console.log("Export PNG button not found");
    }
    
    const exportPdfBtn = document.getElementById('export-pdf');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            openModal('export-modal');
            // Set focus to Advanced tab
            const advancedTab = document.querySelector('[data-tab="export-advanced"]');
            if (advancedTab) advancedTab.click();
        });
    }
    
    const exportDataBtn = document.getElementById('export-data');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            const format = 'geojson'; // Default format
            exportData(format);
        });
    }
    
    // Export confirmation button
    const exportConfirmBtn = document.getElementById('export-confirm');
    if (exportConfirmBtn) {
        exportConfirmBtn.addEventListener('click', function() {
            const formatSelect = document.getElementById('export-format');
            const selectedFormat = formatSelect ? formatSelect.value : 'png';
            
            // Show print preview for vector formats
            if (['pdf', 'svg', 'eps', 'geopdf'].includes(selectedFormat)) {
                showPrintPreview();
            } else {
                // For raster formats, export directly
                exportMap(selectedFormat);
            }
        });
    }
    
    // Initialize export modal tabs
    initializeExportModalTabs();
    
    // Initialize print preview modal
    initializePrintPreview();
    
    // Initialize layout designer drag and drop
    initializeLayoutDesigner();
    
    // Close modals when clicking the close button
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close the print preview modal when clicking the close button
    const printPreviewClose = document.querySelector('.print-preview-close');
    if (printPreviewClose) {
        printPreviewClose.addEventListener('click', function() {
            const modal = document.getElementById('print-preview-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Handle modal tab clicks
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and hide all panels
            document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
            
            // Add active class to clicked tab and show its panel
            this.classList.add('active');
            const panel = document.getElementById(tabId + '-panel');
            if (panel) {
                panel.style.display = 'block';
            }
        });
    });
    
    // Initialize map symbols drag and drop after a short delay
    // This allows the DOM to fully initialize
    setTimeout(function() {
        initializeMapSymbolsDragDrop();
    }, 500);
});