/**
 * Data Formatter Direct Integration
 * 
 * This is a simplified version of the data formatter that works
 * without requiring the React integration.
 */

(function() {
  console.log("Data Formatter Direct Integration loaded");
  
  // Global formatter state
  window.formatterState = window.formatterState || {
    sourceData: null,
    transformedData: null,
    mappings: {},
    sourceFields: [],
    targetFields: []
  };
  
  // Initialize when document is ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing direct data formatter integration");
    
    // Set up basic UI integration
    setupEventListeners();
  });
  
  function setupEventListeners() {
    // This is a minimal implementation just to prevent errors
    // The real functionality will be provided by data-formatter-bundle.js
    console.log("Setting up minimal event listeners for direct integration");
  }
})();