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
      // First try with the exact ID
      let serializedData = localStorage.getItem(dataId);
      let actualDataId = dataId;
      
      // If not found, try timestamp matching for emergency_data_XXX ids
      if (!serializedData && dataId.startsWith('emergency_data_')) {
        log(`Exact key ${dataId} not found, trying approximate timestamp matching...`);
        
        // Extract timestamp if present in the ID
        const timestamp = dataId.replace('emergency_data_', '');
        if (!isNaN(parseInt(timestamp))) {
          const targetTime = parseInt(timestamp);
          
          // Look for emergency data with similar timestamps (within 100ms)
          let bestMatch = null;
          let smallestDiff = Infinity;
          
          // Scan all localStorage keys
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('emergency_data_')) {
              const keyTimestamp = key.replace('emergency_data_', '');
              if (!isNaN(parseInt(keyTimestamp))) {
                const keyTime = parseInt(keyTimestamp);
                const timeDiff = Math.abs(keyTime - targetTime);
                
                // If within 100ms and better than previous matches
                if (timeDiff < 100 && timeDiff < smallestDiff) {
                  const keyData = localStorage.getItem(key);
                  if (keyData) {
                    log(`Found close timestamp match: ${key} (diff: ${timeDiff}ms)`);
                    bestMatch = key;
                    smallestDiff = timeDiff;
                    serializedData = keyData;
                  }
                }
              }
            }
          }
          
          if (bestMatch) {
            log(`Using closest match: ${bestMatch} instead of ${dataId}`);
            actualDataId = bestMatch; // Use the matched ID for removal if autoCleanup is true
          }
        }
      }
      
      // If still not found after approximate matching
      if (!serializedData) {
        log(`No data found with ID ${dataId}, even after approximate matching`);
        return null;
      }
      
      // Parse the data
      const packagedData = JSON.parse(serializedData);
      
      // Check expiration
      if (packagedData.metadata && packagedData.metadata.expires < Date.now()) {
        log(`Data with ID ${actualDataId} has expired`);
        localStorage.removeItem(actualDataId);
        return null;
      }
      
      log(`Retrieved data with ID ${actualDataId}`, packagedData.metadata);
      
      // Cleanup if requested
      if (autoCleanup) {
        localStorage.removeItem(actualDataId);
        log(`Removed data with ID ${actualDataId} after retrieval`);
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
    // CRITICAL FIX: Verify what we're passing is actual data, not already a dataId
    // This prevents the direct passing of objects that would serialize to [object Object]
    let queryParam;
    
    if (typeof data === 'string' && data.startsWith('emergency_data_')) {
      log('Detected dataId passed directly to sendToTool - using it directly', 'warning');
      queryParam = data; // Use the passed string directly as the ID
    } else {
      // Normal flow - store the data and get ID
      queryParam = storeEmergencyData(data, options);
      
      if (!queryParam) {
        log('Failed to store emergency data', 'error');
        return false;
      }
    }
    
    // Normalize the target tool ID to handle different formats
    // Strip any special characters and standardize separators
    const normalizedTargetTool = (targetTool || '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Comprehensive mapping of tool identifiers to their actual routes
    // This handles various tool naming conventions across the app
    const toolRouteMap = {
      // Response Time Analyzer variations
      'response-time': 'fire-ems-dashboard',
      'response-time-analyzer': 'fire-ems-dashboard',
      'responsetimeanalyzer': 'fire-ems-dashboard',
      'response-time-analysis': 'fire-ems-dashboard',
      'responsetime': 'fire-ems-dashboard',
      'fire-ems-dashboard': 'fire-ems-dashboard',
      'fireemsdashboard': 'fire-ems-dashboard',
      'rta': 'fire-ems-dashboard',
      
      // Call Density variations
      'call-density': 'call-density-heatmap',
      'call-density-heatmap': 'call-density-heatmap',
      'calldensity': 'call-density-heatmap',
      'calldensityheatmap': 'call-density-heatmap',
      'heatmap': 'call-density-heatmap',
      'density': 'call-density-heatmap',
      
      // Isochrone map variations
      'isochrone': 'isochrone-map',
      'isochrone-map': 'isochrone-map',
      'isochronemap': 'isochrone-map',
      'isochrones': 'isochrone-map',
      'iso': 'isochrone-map',
      
      // Incident logger variations
      'incident-logger': 'incident-logger',
      'incidentlogger': 'incident-logger',
      'logger': 'incident-logger',
      'incidents': 'incident-logger',
      
      // Other tools
      'coverage-gap-finder': 'coverage-gap-finder',
      'coverage': 'coverage-gap-finder',
      'gaps': 'coverage-gap-finder',
      'station-overview': 'station-overview',
      'stations': 'station-overview',
      'fire-map-pro': 'fire-map-pro',
      'map': 'fire-map-pro',
      'firemappro': 'fire-map-pro'
    };
    
    // Normalize underscore variations too (handle both - and _)
    Object.keys(toolRouteMap).forEach(key => {
      const underscoreKey = key.replace(/-/g, '_');
      if (!toolRouteMap[underscoreKey]) {
        toolRouteMap[underscoreKey] = toolRouteMap[key];
      }
    });
    
    // Log all operations for debugging
    log(`Original target tool: ${targetTool}`, 'info');
    log(`Normalized target tool: ${normalizedTargetTool}`, 'info');
    
    // Get the correct route, first try exact match, then try normalized
    let targetRoute = toolRouteMap[targetTool] || // Try direct match first
                     toolRouteMap[normalizedTargetTool] || // Try normalized
                     targetTool; // Fallback to the original value
    
    // Ensure target route has no leading slash (we'll add it later)
    targetRoute = targetRoute.replace(/^\//, '');
    
    log(`Mapped to route: ${targetRoute}`, 'info');
    
    // Generate a timestamp to prevent caching issues
    const timestamp = Date.now();
    
    // Build target URL with careful formatting
    // CRITICAL FIX: Uses window.location.origin to ensure absolute path
    const origin = window.location.origin || '';
    
    // Make sure the route doesn't have extra slashes when composed
    const normalizedRoute = targetRoute.replace(/^\/+/, ''); // Remove leading slashes
    
    // Compose the URL with proper formatting
    // CRITICAL FIX: Ensure the data ID is properly URI encoded to prevent [object Object] issues
    // CRITICAL FIX: Use queryParam (which contains the stored data ID) not dataId (which could be null)
    const targetUrl = `${origin}/${normalizedRoute}?emergency_data=${encodeURIComponent(queryParam)}&t=${timestamp}&source=emergency_mode`;
    
    log(`Redirecting to: ${targetUrl}`, 'info');
    
    // Try to store the data in multiple storage mechanisms for redundancy
    try {
      // Store data ID in sessionStorage as a backup
      sessionStorage.setItem('last_emergency_data_id', dataId);
      sessionStorage.setItem('last_emergency_target', targetRoute);
      sessionStorage.setItem('last_emergency_timestamp', timestamp.toString());
      
      // Store a backup copy of the data with a standard key as well
      const backupDataId = 'emergency_data_latest';
      const serializedBackup = localStorage.getItem(dataId);
      
      if (serializedBackup) {
        localStorage.setItem(backupDataId, serializedBackup);
        sessionStorage.setItem(backupDataId, serializedBackup);
        log(`Created backup copies with key: ${backupDataId}`, 'info');
      }
      
      // Store diagnostic information
      const diagnosticInfo = JSON.stringify({
        dataId: dataId,
        targetTool: targetTool,
        normalizedTool: normalizedTargetTool,
        targetRoute: targetRoute,
        targetUrl: targetUrl,
        timestamp: timestamp,
        origin: origin,
        recordCount: Array.isArray(data) ? data.length : 1
      });
      
      sessionStorage.setItem('emergency_diagnostic', diagnosticInfo);
      log('Stored diagnostic information', 'info');
      
    } catch (e) {
      log('Warning: Could not create all backup copies', 'warning');
      // Continue anyway - this is just extra redundancy
    }
    
    // Navigate to target with error handling
    try {
      // For debugging on production, add a small delay to see logs
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 200);
      return true;
    } catch (error) {
      log('Error navigating to target tool: ' + error.message, 'error');
      
      // Last resort fallback: try direct navigation without parameters
      try {
        // Make sure we still normalize the route path
        const fallbackRoute = normalizedRoute;
        const fallbackUrl = `${origin}/${fallbackRoute}?emergency_fallback=true&t=${timestamp}&source=emergency_fallback`;
        
        log(`Attempting direct navigation fallback: ${fallbackUrl}`, 'warning');
        setTimeout(() => {
          window.location.href = fallbackUrl;
        }, 200);
      } catch (e) {
        // If that fails too, show an alert
        alert('Failed to navigate to ' + targetRoute + '. Error: ' + error.message);
      }
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