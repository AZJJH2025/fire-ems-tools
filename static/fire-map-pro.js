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
            
            // If using layout designer, capture the layout configuration
            if (isLayoutDesignerActive) {
                // Ensure we have the latest layout configuration
                captureLayoutForExport();
            }
            
            // Show print preview for vector formats
            if (['pdf', 'svg', 'eps', 'geopdf'].includes(selectedFormat)) {
                showPrintPreview(isLayoutDesignerActive);
            } else {
                // For raster formats, export directly
                exportMap(selectedFormat, isLayoutDesignerActive);
            }
            
            // Close the modal after export
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
    
    // Register tab change handlers to ensure layout is captured when switching
    const modalTabs = document.querySelectorAll('.modal-tab');
    modalTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // If switching from layout designer, capture the layout
            const currentLayoutDesignerTab = document.querySelector('.modal-tab[data-tab="layout-designer"].active');
            if (currentLayoutDesignerTab && tabId !== 'layout-designer') {
                captureLayoutForExport();
            }
            
            // Update format options based on the selected tab
            updateExportFormatOptions(tabId);
        });
    });
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

// Self-executing function to initialize everything when the page loads
(function() {
    console.log("Initializing FireMapPro...");
    
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize export handlers
        initializeExportHandlers();
        
        // Initialize layout designer when modal opens
        const exportButton = document.getElementById('export-pdf');
        if (exportButton) {
            exportButton.addEventListener('click', function() {
                // Initialize layout designer when export modal opens
                setTimeout(function() {
                    initializeLayoutDesigner();
                    setupFileUploads();
                }, 100);
            });
        }
        
        // Also initialize for PNG export
        const exportPngBtn = document.getElementById('export-png');
        if (exportPngBtn) {
            exportPngBtn.addEventListener('click', function() {
                // Initialize layout designer when export modal opens
                setTimeout(function() {
                    initializeLayoutDesigner();
                    setupFileUploads();
                }, 100);
            });
        }
        
        console.log("FireMapPro initialization complete");
    });
})();