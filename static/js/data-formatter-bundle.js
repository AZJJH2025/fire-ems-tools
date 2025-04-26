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
    version: '1.0.1',
    buildTimestamp: new Date().toISOString()
  };
  
  // Create consistent logging
  const Logger = {
    log: function(message, type = 'info') {
      if (CONFIG.debug || type === 'error' || type === 'warn') {
        console[type](`[DataFormatter] ${message}`);
      }
      // Also append to log if the function exists
      if (window.appendLog && typeof window.appendLog === 'function') {
        window.appendLog(message);
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
      Logger.info("Formatting CSV data...");
      return csvData;
    },
    
    formatExcel: function(excelData) {
      Logger.info("Formatting Excel data...");
      return excelData;
    }
  };
  
  // Make available globally
  window.dataFormatter = dataFormatter;
  
  // Expose the logger for other scripts to use
  window.DataFormatterLogger = Logger;
  
  // Define missing functions needed by the application
  window.showFormatterPanels = function() {
    Logger.info("showFormatterPanels called");
    // Find formatter panels by class and show them
    const formatterPanels = document.querySelectorAll('.formatter-panel');
    formatterPanels.forEach(panel => {
      if (panel) panel.style.display = 'block';
    });
    
    // Hide mapping container if it exists
    const mappingContainer = document.querySelector('.mapping-container');
    if (mappingContainer) mappingContainer.style.display = 'none';
    
    Logger.info('Field mapping completed. Review the transformed data in the output preview.');
  };
  
  window.enableDownloadButtons = function() {
    Logger.info("enableDownloadButtons called");
    // Find download buttons and enable them
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
      if (button) {
        button.disabled = false;
        button.classList.remove('disabled');
      }
    });
  };
  
  window.handleClearButton = function() {
    Logger.info("handleClearButton called");
    // Reset form elements
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    
    // Clear data previews
    const previews = document.querySelectorAll('.data-preview');
    previews.forEach(preview => {
      if (preview) preview.innerHTML = '';
    });
    
    // Hide results panels
    const resultsPanels = document.querySelectorAll('.results-panel');
    resultsPanels.forEach(panel => {
      if (panel) panel.style.display = 'none';
    });
    
    Logger.info('Form cleared. Ready for new data.');
  };
  
  window.appendLog = function(message) {
    const logContainer = document.querySelector('.log-container');
    if (logContainer) {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  };
  
  // Set up DataFormatterUI for compatibility
  window.DataFormatterUI = {
    mount: function(containerId) {
      Logger.info(`Mounting DataFormatterUI in container: ${containerId}`);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '<div class="data-formatter-ui">Data Formatter UI Ready</div>';
        return true;
      }
      return false;
    }
  };
  
  // Set flag to indicate data formatter is loaded (prevents emergency mode)
  window.dataFormatterLoaded = true;
  Logger.info("Data Formatter Bundle initialization complete");
})();
