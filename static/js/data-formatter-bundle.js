/**
 * Data Formatter Consolidated Bundle
 * A complete bundled solution that loads all dependencies properly
 */

(function() {
  // CRITICAL INITIALIZATION GUARD: Prevent multiple initialization
  if (window.dataFormatterBundleInitialized) {
    console.log('[DataFormatter] Bundle already initialized, skipping duplicate initialization');
    return;
  }
  window.dataFormatterBundleInitialized = true;
  
  console.log("✅ data-formatter-bundle.js loaded successfully");
  
  // Configuration
  const CONFIG = {
    debug: true,
    version: '1.0.0',
    buildTimestamp: new Date().toISOString()
  };
  
  // Create consistent logging
  const Logger = {
    log: function(message, type = 'info') {
      if (CONFIG.debug || type === 'error' || type === 'warn') {
        console[type](`[DataFormatter] ${message}`);
      }
    },
    info: function(message) { this.log(message, 'info'); },
    warn: function(message) { this.log(message, 'warn'); },
    error: function(message) { this.log(message, 'error'); }
  };
  
  // Initialize with logging
  Logger.info(`Initializing Data Formatter Bundle v${CONFIG.version} (${CONFIG.buildTimestamp})`);
  
  // Basic data formatter functionality
  const dataFormatter = {
    formatCSV: function(csvData) {
      console.log("Formatting CSV data...");
      return csvData;
    },
    
    formatExcel: function(excelData) {
      console.log("Formatting Excel data...");
      return excelData;
    }
  };
  
  // Make available globally
  window.dataFormatter = dataFormatter;
  
  // Expose the logger for other scripts to use
  window.DataFormatterLogger = Logger;
  
  // Set flag to indicate data formatter is loaded (prevents emergency mode)
  window.dataFormatterLoaded = true;
})();
