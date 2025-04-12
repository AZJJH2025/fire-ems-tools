/**
 * FireEMS.ai Emergency Mode Library
 * 
 * This shared library provides emergency mode functionality for FireEMS.ai tools
 * when facing infrastructure challenges like static file loading failures or API outages.
 * 
 * Version: 1.0.0
 * Author: FireEMS.ai Team
 */

// Ensure namespace
window.FireEMS = window.FireEMS || {};

/**
 * Emergency Mode Utilities and Handlers
 */
FireEMS.EmergencyMode = (function() {
  // Configuration
  const config = {
    // Storage keys prefix for localStorage
    storagePrefix: 'emergency_data_',
    
    // Maximum recommended data size (4MB, since most browsers have 5MB limit)
    maxStorageSize: 4 * 1024 * 1024,
    
    // When to show warning about large data (1MB)
    warnSize: 1 * 1024 * 1024,
    
    // Default expiration time for emergency data (24 hours in milliseconds)
    defaultExpiration: 24 * 60 * 60 * 1000,
    
    // Whether to show debug messages in console
    debug: true
  };
  
  /**
   * Log debug messages when debug mode is enabled
   */
  function log(message, data = null) {
    if (config.debug) {
      if (data) {
        console.log(`[Emergency Mode] ${message}`, data);
      } else {
        console.log(`[Emergency Mode] ${message}`);
      }
    }
  }
  
  /**
   * Check if localStorage is available
   */
  function isStorageAvailable() {
    try {
      const testKey = '__test_storage__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Store data for emergency transfer to another tool
   * 
   * @param {Object|Array} data - The data to store
   * @param {Object} options - Storage options
   * @param {number} options.expiration - Expiration time in milliseconds
   * @param {boolean} options.compress - Whether to compress data
   * @returns {string|null} - The generated data ID or null if storage failed
   */
  function storeEmergencyData(data, options = {}) {
    if (!isStorageAvailable()) {
      log('localStorage not available');
      return null;
    }
    
    const opts = {
      expiration: options.expiration || config.defaultExpiration,
      compress: options.compress || false
    };
    
    try {
      // Generate a unique ID
      const dataId = config.storagePrefix + Date.now();
      
      // Prepare the data package with metadata
      const packagedData = {
        data: data,
        metadata: {
          created: Date.now(),
          expires: Date.now() + opts.expiration,
          source: window.location.pathname,
          recordCount: Array.isArray(data) ? data.length : 1
        }
      };
      
      // Serialize data
      const serializedData = JSON.stringify(packagedData);
      const dataSize = new Blob([serializedData]).size;
      
      // Check size
      if (dataSize > config.maxStorageSize) {
        log(`Data too large: ${dataSize} bytes`);
        return null;
      }
      
      // Store data
      localStorage.setItem(dataId, serializedData);
      log(`Data stored with ID ${dataId}, size: ${dataSize} bytes`);
      
      // Show warning for large data
      if (dataSize > config.warnSize) {
        log(`Warning: Large data size (${dataSize} bytes) may cause issues in some browsers`);
      }
      
      return dataId;
      
    } catch (error) {
      log('Error storing emergency data', error);
      return null;
    }
  }
  
  /**
   * Retrieve emergency data by ID
   * 
   * @param {string} dataId - The emergency data ID
   * @param {boolean} autoCleanup - Whether to remove the data after retrieval
   * @returns {Object|null} - The retrieved data or null if not found
   */
  function retrieveEmergencyData(dataId, autoCleanup = false) {
    if (!isStorageAvailable()) {
      log('localStorage not available');
      return null;
    }
    
    try {
      // Retrieve the raw data
      const serializedData = localStorage.getItem(dataId);
      if (!serializedData) {
        log(`No data found with ID ${dataId}`);
        return null;
      }
      
      // Parse the data
      const packagedData = JSON.parse(serializedData);
      
      // Check expiration
      if (packagedData.metadata && packagedData.metadata.expires < Date.now()) {
        log(`Data with ID ${dataId} has expired`);
        localStorage.removeItem(dataId);
        return null;
      }
      
      log(`Retrieved data with ID ${dataId}`, packagedData.metadata);
      
      // Cleanup if requested
      if (autoCleanup) {
        localStorage.removeItem(dataId);
        log(`Removed data with ID ${dataId} after retrieval`);
      }
      
      return packagedData.data;
      
    } catch (error) {
      log('Error retrieving emergency data', error);
      return null;
    }
  }
  
  /**
   * Check for emergency data in URL and show notification
   * 
   * @param {Object} options - Options for processing
   * @param {Function} options.onData - Callback when data is available (receives data object)
   * @param {string} options.queryParam - URL parameter name to check (default: 'emergency_data')
   * @param {string} options.notificationContainer - Selector for container to show notification in
   * @returns {boolean} - Whether emergency data was found and processed
   */
  function checkForEmergencyData(options = {}) {
    const opts = {
      onData: options.onData || null,
      queryParam: options.queryParam || 'emergency_data',
      notificationContainer: options.notificationContainer || '.upload-section, .tool-header, main'
    };
    
    // Get data ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const dataId = urlParams.get(opts.queryParam);
    
    if (!dataId) {
      return false;
    }
    
    log(`Found emergency data ID in URL: ${dataId}`);
    
    // Try to retrieve the data
    const data = retrieveEmergencyData(dataId, false); // Don't auto-cleanup yet
    
    if (!data) {
      showNotification({
        type: 'error',
        title: 'Error Loading Emergency Data',
        message: 'The data could not be found or has expired.',
        container: opts.notificationContainer
      });
      return false;
    }
    
    // Show notification
    const recordCount = Array.isArray(data) ? data.length : 1;
    const notification = showNotification({
      type: 'info',
      title: 'Emergency Data Available',
      message: `${recordCount} record(s) have been transferred in emergency mode.`,
      container: opts.notificationContainer,
      buttons: [
        {
          text: 'Load Data',
          class: 'primary-btn',
          id: 'load-emergency-data',
          callback: function() {
            // Process the data
            if (opts.onData && typeof opts.onData === 'function') {
              opts.onData(data);
            }
            
            // Remove notification
            notification.remove();
            
            // Show success message
            showNotification({
              type: 'success',
              title: 'Data Loaded Successfully',
              message: `${recordCount} record(s) have been processed.`,
              container: opts.notificationContainer,
              autoHide: 5000
            });
            
            // Clean up storage
            localStorage.removeItem(dataId);
          }
        },
        {
          text: 'Dismiss',
          class: 'secondary-btn',
          callback: function() {
            notification.remove();
          }
        }
      ]
    });
    
    return true;
  }
  
  /**
   * Show a notification in the UI
   * 
   * @param {Object} options - Notification options
   * @param {string} options.type - Notification type: 'info', 'success', 'warning', 'error'
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification message
   * @param {string} options.container - Selector for container to add notification to
   * @param {Array} options.buttons - Array of button objects {text, class, id, callback}
   * @param {number} options.autoHide - Auto-hide delay in ms (0 to disable)
   * @returns {HTMLElement} - The notification element
   */
  function showNotification(options) {
    const opts = {
      type: options.type || 'info',
      title: options.title || 'Notification',
      message: options.message || '',
      container: options.container || 'body',
      buttons: options.buttons || [],
      autoHide: options.autoHide || 0
    };
    
    // Map types to styles
    const typeStyles = {
      info: {
        bg: '#e3f2fd',
        border: '#2196f3',
        title: '#0d47a1'
      },
      success: {
        bg: '#e8f5e9',
        border: '#4caf50',
        title: '#2e7d32'
      },
      warning: {
        bg: '#fff3e0',
        border: '#ff9800',
        title: '#e65100'
      },
      error: {
        bg: '#ffebee',
        border: '#f44336',
        title: '#c62828'
      }
    };
    
    const style = typeStyles[opts.type] || typeStyles.info;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `emergency-notification ${opts.type}-notification`;
    notification.style.cssText = `
      background-color: ${style.bg}; 
      border-left: 4px solid ${style.border}; 
      padding: 15px; 
      margin-bottom: 20px; 
      border-radius: 4px;
    `;
    
    // Create content
    let html = `
      <h3 style="margin-top: 0; color: ${style.title};">${opts.title}</h3>
      <p>${opts.message}</p>
    `;
    
    // Add buttons if any
    if (opts.buttons && opts.buttons.length > 0) {
      html += '<div style="margin-top: 15px;">';
      
      opts.buttons.forEach((button, index) => {
        html += `<button id="${button.id || `btn-${index}`}" class="${button.class || 'btn'}" style="margin-right: 10px;">${button.text}</button>`;
      });
      
      html += '</div>';
    }
    
    notification.innerHTML = html;
    
    // Find container and append notification
    const containers = document.querySelectorAll(opts.container);
    if (containers.length > 0) {
      containers[0].prepend(notification);
    } else {
      document.body.prepend(notification);
    }
    
    // Add button event listeners
    if (opts.buttons && opts.buttons.length > 0) {
      opts.buttons.forEach((button, index) => {
        const btnId = button.id || `btn-${index}`;
        const btnElement = notification.querySelector(`#${btnId}`);
        
        if (btnElement && button.callback && typeof button.callback === 'function') {
          btnElement.addEventListener('click', button.callback);
        }
      });
    }
    
    // Auto-hide if specified
    if (opts.autoHide > 0) {
      setTimeout(() => {
        notification.remove();
      }, opts.autoHide);
    }
    
    return notification;
  }
  
  /**
   * Send data to another tool in emergency mode
   * 
   * @param {Object|Array} data - The data to send
   * @param {string} targetTool - The path of the target tool
   * @param {Object} options - Additional options
   * @returns {boolean} - Whether the operation was successful
   */
  function sendToTool(data, targetTool, options = {}) {
    // Store the data and get ID
    const dataId = storeEmergencyData(data, options);
    
    if (!dataId) {
      return false;
    }
    
    // Map tool names to correct routes
    const toolRouteMap = {
      'response-time': 'fire-ems-dashboard',
      'response-time-analyzer': 'fire-ems-dashboard',
      'fire-ems-dashboard': 'fire-ems-dashboard',
      'call-density': 'call-density-heatmap',
      'call-density-heatmap': 'call-density-heatmap',
      'isochrone': 'isochrone-map',
      'isochrone-map': 'isochrone-map',
      'incident-logger': 'incident-logger'
    };
    
    // Get the correct route or use the provided one as fallback
    const targetRoute = toolRouteMap[targetTool] || targetTool;
    
    // Build target URL
    const targetUrl = `/${targetRoute}?emergency_data=${dataId}`;
    
    log(`Redirecting to ${targetUrl}`);
    
    // Navigate to target
    try {
      window.location.href = targetUrl;
      return true;
    } catch (error) {
      log('Error navigating to target tool', error);
      return false;
    }
  }
  
  /**
   * Create downloadable file from data in emergency mode
   * 
   * @param {Object|Array} data - The data to download
   * @param {Object} options - Download options
   * @param {string} options.format - File format: 'csv', 'json', 'excel'
   * @param {string} options.filename - Base filename without extension
   * @returns {boolean} - Whether the operation was successful
   */
  function downloadData(data, options = {}) {
    const opts = {
      format: options.format || 'csv',
      filename: options.filename || 'emergency-data'
    };
    
    try {
      if (!data || (Array.isArray(data) && data.length === 0)) {
        log('No data to download');
        return false;
      }
      
      // Convert data based on format
      let content = '';
      let mimeType = '';
      let extension = '';
      
      if (opts.format === 'json') {
        // JSON format
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else if (opts.format === 'excel') {
        // Fall back to CSV for Excel in emergency mode
        log('Excel format not available in emergency mode, falling back to CSV');
        opts.format = 'csv';
        // Continue to CSV handling
      }
      
      if (opts.format === 'csv') {
        // CSV format - handle both array of objects and other structures
        if (Array.isArray(data) && data.length > 0) {
          // Get headers from first item
          const headers = Object.keys(data[0]);
          content = headers.join(',') + '\n';
          
          // Add each row
          data.forEach(row => {
            const values = headers.map(header => {
              const value = row[header] || '';
              // Handle values with commas by wrapping in quotes
              return value.toString().includes(',') ? `"${value}"` : value;
            });
            content += values.join(',') + '\n';
          });
        } else {
          // Handle non-array data by converting to JSON and then to CSV
          const jsonStr = JSON.stringify(data);
          content = 'data\n' + jsonStr;
        }
        
        mimeType = 'text/csv';
        extension = 'csv';
      }
      
      // Create a Blob and download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${opts.filename}.${extension}`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
      
    } catch (error) {
      log('Error downloading data', error);
      return false;
    }
  }
  
  /**
   * Clean up expired emergency data from localStorage
   */
  function cleanupExpiredData() {
    if (!isStorageAvailable()) {
      return;
    }
    
    try {
      const keysToRemove = [];
      const now = Date.now();
      
      // Find all emergency data keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(config.storagePrefix)) {
          try {
            // Get the data and check expiration
            const serializedData = localStorage.getItem(key);
            if (serializedData) {
              const packagedData = JSON.parse(serializedData);
              if (packagedData.metadata && packagedData.metadata.expires < now) {
                keysToRemove.push(key);
              }
            }
          } catch (e) {
            // If we can't parse it, consider it corrupted and remove
            keysToRemove.push(key);
          }
        }
      }
      
      // Remove expired entries
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        log(`Removed expired emergency data: ${key}`);
      });
      
      return keysToRemove.length;
      
    } catch (error) {
      log('Error cleaning up expired data', error);
      return 0;
    }
  }
  
  /**
   * Initialize emergency mode
   * - Runs on script load
   * - Checks URL for emergency data
   * - Cleans up expired data
   * - Automatically processes emergency data if found and handler provided
   */
  function init(options = {}) {
    log('Initializing emergency mode');
    
    // Clean up expired data
    cleanupExpiredData();
    
    // Check for emergency data in URL
    if (options.autoProcess !== false) {
      checkForEmergencyData(options);
    }
  }
  
  // Auto-initialize when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Public API
  return {
    init: init,
    storeData: storeEmergencyData,
    retrieveData: retrieveEmergencyData,
    sendToTool: sendToTool,
    downloadData: downloadData,
    showNotification: showNotification,
    checkForData: checkForEmergencyData,
    cleanupExpiredData: cleanupExpiredData,
    isStorageAvailable: isStorageAvailable
  };
})();

// Auto-initialize when loaded via script tag
// This line can be commented out if you want manual initialization
document.addEventListener('DOMContentLoaded', function() {
  if (window.FireEMS && window.FireEMS.EmergencyMode) {
    window.FireEMS.EmergencyMode.init();
  }
});