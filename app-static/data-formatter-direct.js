/**
 * Emergency Direct Implementation
 * This is a minimal implementation of essential data formatter functionality
 * that doesn't depend on any external libraries.
 */

console.log("Emergency data-formatter-direct.js loaded successfully");

// Set flag to indicate we're in direct mode
window.isEmergencyMode = true;
window.emergencyModeType = 'direct';

// Initialize basic state if not already done
if (!window.formatterState) {
  // Get filename from storage for consistent Data1G.csv detection
  const filename = sessionStorage.getItem('currentFileName') || localStorage.getItem('currentFileName') || '';
  
  window.formatterState = {
    fileId: null,
    sourceColumns: [],
    sampleData: [],
    selectedTool: null,
    mappings: null,
    transformedData: null,
    originalData: null,
    originalFileName: filename // Initialize with filename from storage
  };
  
  if (filename) {
    console.log(`Initialized formatterState with filename: ${filename}`);
  }
}

// Notify that we've loaded
console.log("Emergency direct implementation initialized");