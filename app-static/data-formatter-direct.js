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
  window.formatterState = {
    fileId: null,
    sourceColumns: [],
    sampleData: [],
    selectedTool: null,
    mappings: null,
    transformedData: null,
    originalData: null
  };
}

// Notify that we've loaded
console.log("Emergency direct implementation initialized");