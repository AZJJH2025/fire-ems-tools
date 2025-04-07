/**
 * FireMapPro fixes to ensure export functionality works properly with the Layout Designer
 */

/**
 * Enhance image handling in layout designer
 */
function enhanceLayoutImageHandling() {
    // Improve layout element image capture in the captureLayoutForExport function
    const originalCaptureLayout = window.captureLayoutForExport;
    
    if (typeof originalCaptureLayout === 'function') {
        window.captureLayoutForExport = function() {
            console.log("Enhanced layout capture running...");
            
            // Find the paper sheet and all layout elements
            const paperSheet = document.getElementById('layout-paper-sheet') || document.querySelector('.paper-sheet');
            if (!paperSheet) {
                console.error("Could not find paper sheet for layout capture");
                return false;
            }
            
            // Store the layout configuration for use in export
            const layoutElements = paperSheet.querySelectorAll('.layout-element');
            console.log(`Found ${layoutElements.length} layout elements to capture`);
            
            // Create an object describing the current layout
            const layoutConfig = {
                elements: [],
                orientation: paperSheet.classList.contains('landscape') ? 'landscape' : 'portrait'
            };
            
            // Capture each element's position, size, type and content
            layoutElements.forEach(element => {
                const elementType = element.getAttribute('data-element-type');
                
                // Get element position and size
                const styles = {
                    left: element.style.left,
                    top: element.style.top,
                    width: element.style.width, 
                    height: element.style.height
                };
                
                // Capture additional data depending on element type
                let content = null;
                if (elementType === 'title') {
                    const title = element.querySelector('h3');
                    const subtitle = element.querySelector('p');
                    content = {
                        title: title ? title.textContent : 'Map Title',
                        subtitle: subtitle ? subtitle.textContent : ''
                    };
                } else if (elementType === 'text') {
                    const textContent = element.querySelector('.text-content');
                    content = textContent ? textContent.textContent : '';
                } else if (elementType === 'image') {
                    // Get the image source if present
                    const img = element.querySelector('img');
                    content = img ? img.src : null;
                    
                    // Check for data attribute if img not found
                    if (!content && element.hasAttribute('data-image-src')) {
                        content = element.getAttribute('data-image-src');
                    }
                    
                    console.log("Enhanced image capture:", elementType, content ? "Image found" : "No image");
                }
                
                // Add to config
                layoutConfig.elements.push({
                    type: elementType,
                    styles,
                    content
                });
            });
            
            // Store the layout configuration for use in export functions
            window.currentLayoutConfig = layoutConfig;
            console.log("Layout captured successfully:", layoutConfig);
            return true;
        };
    }
    
    // Enhance the export modal with tabs functionality
    document.querySelector('.modal-tab[data-tab="export-basic"]')?.addEventListener('click', function() {
        document.querySelector('#export-basic-panel').style.display = 'block';
        document.querySelector('#export-advanced-panel').style.display = 'none';
        document.querySelector('#layout-designer-panel').style.display = 'none';
        
        document.querySelector('.modal-tab[data-tab="export-basic"]').classList.add('active');
        document.querySelector('.modal-tab[data-tab="export-advanced"]').classList.remove('active');
        document.querySelector('.modal-tab[data-tab="layout-designer"]').classList.remove('active');
    });
    
    document.querySelector('.modal-tab[data-tab="export-advanced"]')?.addEventListener('click', function() {
        document.querySelector('#export-basic-panel').style.display = 'none';
        document.querySelector('#export-advanced-panel').style.display = 'block';
        document.querySelector('#layout-designer-panel').style.display = 'none';
        
        document.querySelector('.modal-tab[data-tab="export-basic"]').classList.remove('active');
        document.querySelector('.modal-tab[data-tab="export-advanced"]').classList.add('active');
        document.querySelector('.modal-tab[data-tab="layout-designer"]').classList.remove('active');
    });
    
    document.querySelector('.modal-tab[data-tab="layout-designer"]')?.addEventListener('click', function() {
        document.querySelector('#export-basic-panel').style.display = 'none';
        document.querySelector('#export-advanced-panel').style.display = 'none';
        document.querySelector('#layout-designer-panel').style.display = 'block';
        
        document.querySelector('.modal-tab[data-tab="export-basic"]').classList.remove('active');
        document.querySelector('.modal-tab[data-tab="export-advanced"]').classList.remove('active');
        document.querySelector('.modal-tab[data-tab="layout-designer"]').classList.add('active');
        
        // Initialize layout designer when switching to this tab
        initializeLayoutDesigner();
    });
    
    // Enhanced export button handler
    const exportConfirmBtn = document.getElementById('export-confirm');
    if (exportConfirmBtn) {
        exportConfirmBtn.addEventListener('click', function() {
            const formatSelect = document.getElementById('export-format');
            const selectedFormat = formatSelect ? formatSelect.value : 'png';
            
            // Check which tab is active
            const layoutDesignerTab = document.querySelector('.modal-tab[data-tab="layout-designer"].active');
            const isLayoutDesignerActive = !!layoutDesignerTab;
            
            console.log("Export confirmation clicked, format:", selectedFormat, 
                      "layout active:", isLayoutDesignerActive);
            
            // If using layout designer, capture the layout configuration
            if (isLayoutDesignerActive) {
                captureLayoutForExport();
            }
            
            // Vector formats go to preview
            if (['pdf', 'svg', 'eps'].includes(selectedFormat)) {
                console.log("Showing print preview with layout:", isLayoutDesignerActive);
                if (typeof showPrintPreview === 'function') {
                    showPrintPreview(isLayoutDesignerActive);
                } else {
                    console.error("showPrintPreview function not available");
                    alert("Preview not available. Export will continue directly.");
                    exportMap(selectedFormat, isLayoutDesignerActive);
                }
            } else {
                // For raster formats, export directly
                console.log("Exporting directly with format:", selectedFormat, "layout:", isLayoutDesignerActive);
                exportMap(selectedFormat, isLayoutDesignerActive);
            }
            
            // Close the export modal
            document.getElementById('export-modal').style.display = 'none';
        });
    }
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("FireMapPro fixes initializing");
    setTimeout(enhanceLayoutImageHandling, 500);
});