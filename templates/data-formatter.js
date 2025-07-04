/**
 * Data Formatter JS Module
 * 
 * This module contains handler functions for the data-formatter.html template.
 */

// Exported function to attach the map fields button handler
function attachMapFieldsHandler() {
  console.log("attachMapFieldsHandler bound via data-formatter.js module");
  
  // Find the map fields button
  const mapFieldsBtn = document.getElementById('map-fields-btn');
  if (!mapFieldsBtn) {
    console.error("mapFieldsBtn not found in DOM");
    return;
  }
  
  console.log("mapFieldsBtn found in DOM:", mapFieldsBtn);
  
  // Attach the click handler
  mapFieldsBtn.addEventListener('click', function(e) {
    console.log("Map fields button clicked (module handler)");
    
    // Find the mapping container
    const mappingContainer = document.getElementById('column-mapping-container');
    if (!mappingContainer) {
      console.error("Mapping container not found");
      return;
    }
    
    console.log("Mapping container found:", mappingContainer);
    
    // Show the mapping container and hide other panels
    mappingContainer.style.display = 'block';
    document.querySelectorAll('.formatter-panel').forEach(panel => {
      panel.style.display = 'none';
    });
    
    // Log the current state and status
    console.log("formatter state:", window.formatterState);
    console.log("Data formatter UI available:", !!window.DataFormatterUI);
  });
  
  console.log("Map fields button handler attached successfully");
}

// Attach the handler when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded event fired in data-formatter.js module");
  attachMapFieldsHandler();
});

// Export the function for external use
export { attachMapFieldsHandler };