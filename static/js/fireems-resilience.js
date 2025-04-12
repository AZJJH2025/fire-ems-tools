/**
 * FireEMS.ai Resilience Framework
 * 
 * Provides comprehensive resilience capabilities including:
 * - Automatic detection of service disruptions
 * - Fallback implementations for core services
 * - Emergency mode operation
 * - Offline functionality
 * 
 * Version: 1.0.0
 */

// Ensure namespace
window.FireEMS = window.FireEMS || {};

/**
 * Resilience Service
 * Handles all aspects of application resilience
 */
FireEMS.ResilienceService = (function() {
  // Track health check results
  let _healthStatus = {
    staticFiles: { healthy: true, lastCheck: 0 },
    api: { healthy: true, lastCheck: 0 },
    storage: { healthy: true, lastCheck: 0 },
    rendering: { healthy: true, lastCheck: 0 }
  };
  
  // Health check interval (ms)
  const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  
  // Status history for detecting patterns
  const STATUS_HISTORY_LENGTH = 5;
  const _healthHistory = {
    staticFiles: [],
    api: [],
    storage: [],
    rendering: []
  };
  
  // Emergency resources - key assets needed in emergency mode
  const EMERGENCY_RESOURCES = [
    { type: 'script', url: '/static/js/emergency-mode.js', fallbackUrl: '/app-static/js/emergency-mode.js' },
    { type: 'style', url: '/static/emergency.css', fallbackUrl: '/app-static/emergency.css', optional: true }
  ];
  
  // Service fallbacks for emergency mode
  const _fallbacks = {};
  
  /**
   * Start monitoring system health
   */
  function startHealthMonitoring() {
    console.log("Starting health monitoring");
    
    // Initial health check
    performHealthCheck();
    
    // Setup periodic checks
    setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);
    
    // Setup event listeners
    setupErrorListeners();
  }
  
  /**
   * Perform comprehensive health check
   */
  function performHealthCheck() {
    checkStaticFileHealth();
    checkApiHealth();
    checkStorageHealth();
    checkRenderingHealth();
    
    // Evaluate overall health status
    evaluateHealthStatus();
  }
  
  /**
   * Setup global error listeners
   */
  function setupErrorListeners() {
    // Listen for script loading errors
    window.addEventListener('error', function(event) {
      // Only handle resource loading errors
      if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
        console.warn("Resource loading error:", event);
        
        if (event.target.tagName === 'SCRIPT') {
          _healthStatus.staticFiles.healthy = false;
          _healthHistory.staticFiles.push(false);
          _healthHistory.staticFiles = _healthHistory.staticFiles.slice(-STATUS_HISTORY_LENGTH);
        }
        
        // Trigger health evaluation
        evaluateHealthStatus();
      }
    }, true); // Capture phase to catch all errors
    
    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      console.warn("Unhandled promise rejection:", event.reason);
      
      // Check if it's likely an API error
      if (event.reason && (
          event.reason.name === 'TypeError' || 
          (event.reason.message && event.reason.message.includes('fetch')))) {
        _healthStatus.api.healthy = false;
        _healthHistory.api.push(false);
        _healthHistory.api = _healthHistory.api.slice(-STATUS_HISTORY_LENGTH);
        
        // Trigger health evaluation
        evaluateHealthStatus();
      }
    });
  }
  
  /**
   * Check static file serving health
   */
  function checkStaticFileHealth() {
    const testUrl = `/static/health-check.txt?_=${Date.now()}`;
    const startTime = Date.now();
    
    fetch(testUrl)
      .then(response => {
        const healthy = response.ok;
        const responseTime = Date.now() - startTime;
        
        _healthStatus.staticFiles = {
          healthy: healthy,
          lastCheck: Date.now(),
          responseTime: responseTime
        };
        
        _healthHistory.staticFiles.push(healthy);
        _healthHistory.staticFiles = _healthHistory.staticFiles.slice(-STATUS_HISTORY_LENGTH);
        
        if (!healthy) {
          console.warn(`Static file health check failed: ${response.status}`);
        }
      })
      .catch(error => {
        console.warn(`Static file health check error: ${error.message}`);
        
        _healthStatus.staticFiles = {
          healthy: false,
          lastCheck: Date.now(),
          error: error.message
        };
        
        _healthHistory.staticFiles.push(false);
        _healthHistory.staticFiles = _healthHistory.staticFiles.slice(-STATUS_HISTORY_LENGTH);
      })
      .finally(() => {
        // Always evaluate health after check completes
        evaluateHealthStatus();
      });
  }
  
  /**
   * Check API health
   */
  function checkApiHealth() {
    const testUrl = `/api/health-check?_=${Date.now()}`;
    const startTime = Date.now();
    
    fetch(testUrl)
      .then(response => {
        const healthy = response.ok;
        const responseTime = Date.now() - startTime;
        
        _healthStatus.api = {
          healthy: healthy,
          lastCheck: Date.now(),
          responseTime: responseTime
        };
        
        _healthHistory.api.push(healthy);
        _healthHistory.api = _healthHistory.api.slice(-STATUS_HISTORY_LENGTH);
        
        if (!healthy) {
          console.warn(`API health check failed: ${response.status}`);
        }
      })
      .catch(error => {
        // Avoid marking as unhealthy for networks that block OPTIONS preflight
        // if this is a CORS error, since our emergency mode doesn't need API
        const isCorsError = error.message && (
          error.message.includes('CORS') || 
          error.message.includes('Origin')
        );
        
        if (!isCorsError) {
          console.warn(`API health check error: ${error.message}`);
          
          _healthStatus.api = {
            healthy: false,
            lastCheck: Date.now(),
            error: error.message
          };
          
          _healthHistory.api.push(false);
          _healthHistory.api = _healthHistory.api.slice(-STATUS_HISTORY_LENGTH);
        }
      })
      .finally(() => {
        // Always evaluate health after check completes
        evaluateHealthStatus();
      });
  }
  
  /**
   * Check storage health
   */
  function checkStorageHealth() {
    try {
      // Test localStorage
      const testKey = '__health_check__';
      const testValue = Date.now().toString();
      
      // Try to write
      localStorage.setItem(testKey, testValue);
      
      // Try to read back
      const readValue = localStorage.getItem(testKey);
      
      // Verify value
      const healthy = readValue === testValue;
      
      // Clean up
      localStorage.removeItem(testKey);
      
      _healthStatus.storage = {
        healthy: healthy,
        lastCheck: Date.now()
      };
      
      _healthHistory.storage.push(healthy);
      _healthHistory.storage = _healthHistory.storage.slice(-STATUS_HISTORY_LENGTH);
      
      if (!healthy) {
        console.warn('Storage health check failed: value mismatch');
      }
    } catch (error) {
      console.warn(`Storage health check error: ${error.message}`);
      
      _healthStatus.storage = {
        healthy: false,
        lastCheck: Date.now(),
        error: error.message
      };
      
      _healthHistory.storage.push(false);
      _healthHistory.storage = _healthHistory.storage.slice(-STATUS_HISTORY_LENGTH);
    }
    
    // Always evaluate health after check completes
    evaluateHealthStatus();
  }
  
  /**
   * Check rendering health
   */
  function checkRenderingHealth() {
    try {
      // Create a test element
      const testEl = document.createElement('div');
      testEl.style.cssText = 'position:absolute;width:10px;height:10px;left:-9999px;';
      testEl.textContent = 'Test';
      
      // Add to DOM
      document.body.appendChild(testEl);
      
      // Force layout and check rendering
      const rect = testEl.getBoundingClientRect();
      const healthy = rect.width === 10 && rect.height === 10;
      
      // Clean up
      document.body.removeChild(testEl);
      
      _healthStatus.rendering = {
        healthy: healthy,
        lastCheck: Date.now()
      };
      
      _healthHistory.rendering.push(healthy);
      _healthHistory.rendering = _healthHistory.rendering.slice(-STATUS_HISTORY_LENGTH);
      
      if (!healthy) {
        console.warn('Rendering health check failed: element did not render correctly');
      }
    } catch (error) {
      console.warn(`Rendering health check error: ${error.message}`);
      
      _healthStatus.rendering = {
        healthy: false,
        lastCheck: Date.now(),
        error: error.message
      };
      
      _healthHistory.rendering.push(false);
      _healthHistory.rendering = _healthHistory.rendering.slice(-STATUS_HISTORY_LENGTH);
    }
    
    // Always evaluate health after check completes
    evaluateHealthStatus();
  }
  
  /**
   * Evaluate overall health status and adjust mode if needed
   */
  function evaluateHealthStatus() {
    // Get current capabilities based on health checks
    const capabilities = {
      apiAccess: _healthStatus.api.healthy,
      staticFileAccess: _healthStatus.staticFiles.healthy,
      dataStorage: _healthStatus.storage.healthy,
      rendering: _healthStatus.rendering.healthy
    };
    
    // Get current mode
    const currentMode = FireEMS.Core.getMode();
    
    // Determine appropriate mode based on capabilities
    let newMode = currentMode.mode;
    
    if (!capabilities.apiAccess && !capabilities.staticFileAccess) {
      newMode = 'offline';
    } else if (!capabilities.staticFileAccess) {
      newMode = 'emergency';
    } else if (!capabilities.apiAccess) {
      newMode = 'degraded';
    } else if (capabilities.apiAccess && 
               capabilities.staticFileAccess && 
               capabilities.dataStorage && 
               capabilities.rendering) {
      newMode = 'normal';
    }
    
    // Check if mode needs to change
    if (newMode !== currentMode.mode) {
      console.log(`Health evaluation: switching mode from ${currentMode.mode} to ${newMode}`);
      
      // Enter the new mode
      enterMode(newMode, capabilities);
    }
  }
  
  /**
   * Enter a specific operation mode
   * @param {string} mode - Mode to enter
   * @param {Object} capabilities - System capabilities
   */
  function enterMode(mode, capabilities) {
    // Set the mode at the core level
    FireEMS.Core.setMode(mode, capabilities);
    
    // Apply mode-specific actions
    switch(mode) {
      case 'offline':
        enableOfflineFeatures();
        break;
        
      case 'emergency':
        enableEmergencyFeatures();
        break;
        
      case 'degraded':
        enableDegradedFeatures();
        break;
        
      case 'normal':
      default:
        // Restore normal operation
        restoreNormalOperation();
        break;
    }
  }
  
  /**
   * Enable offline mode features
   */
  function enableOfflineFeatures() {
    console.log("Enabling offline mode features");
    
    // Add offline indicator
    addOfflineIndicator();
    
    // Enable emergency features (superset)
    enableEmergencyFeatures();
    
    // Disable network-dependent UI elements
    disableNetworkFeatures();
  }
  
  /**
   * Enable emergency mode features
   */
  function enableEmergencyFeatures() {
    console.log("Enabling emergency mode features");
    
    // Add emergency mode indicator
    addEmergencyModeIndicator();
    
    // Load emergency resources
    loadEmergencyResources();
    
    // Setup emergency data handlers
    setupEmergencyDataHandlers();
  }
  
  /**
   * Enable degraded mode features
   */
  function enableDegradedFeatures() {
    console.log("Enabling degraded mode features");
    
    // Add degraded mode indicator
    addDegradedModeIndicator();
    
    // Setup appropriate warning messages
    setupDegradedWarnings();
  }
  
  /**
   * Restore normal operation
   */
  function restoreNormalOperation() {
    console.log("Restoring normal operation");
    
    // Remove any mode indicators
    removeStatusIndicators();
  }
  
  /**
   * Add offline mode indicator
   */
  function addOfflineIndicator() {
    // Remove any existing indicators first
    removeStatusIndicators();
    
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.className = 'status-indicator offline-indicator';
    indicator.innerHTML = `
      <div class="indicator-icon">
        <i class="fas fa-wifi"></i>
      </div>
      <div class="indicator-message">
        <strong>Offline Mode</strong>
        <span>You are currently working offline</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }
  
  /**
   * Add emergency mode indicator
   */
  function addEmergencyModeIndicator() {
    // Remove any existing indicators first
    removeStatusIndicators();
    
    const indicator = document.createElement('div');
    indicator.id = 'emergency-indicator';
    indicator.className = 'status-indicator emergency-indicator';
    indicator.innerHTML = `
      <div class="indicator-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="indicator-message">
        <strong>Emergency Mode</strong>
        <span>Using emergency fallback systems</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }
  
  /**
   * Add degraded mode indicator
   */
  function addDegradedModeIndicator() {
    // Remove any existing indicators first
    removeStatusIndicators();
    
    const indicator = document.createElement('div');
    indicator.id = 'degraded-indicator';
    indicator.className = 'status-indicator degraded-indicator';
    indicator.innerHTML = `
      <div class="indicator-icon">
        <i class="fas fa-exclamation-circle"></i>
      </div>
      <div class="indicator-message">
        <strong>Degraded Mode</strong>
        <span>Some features may be unavailable</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }
  
  /**
   * Remove all status indicators
   */
  function removeStatusIndicators() {
    ['offline-indicator', 'emergency-indicator', 'degraded-indicator'].forEach(id => {
      const indicator = document.getElementById(id);
      if (indicator) {
        indicator.parentNode.removeChild(indicator);
      }
    });
  }
  
  /**
   * Disable network-dependent features
   */
  function disableNetworkFeatures() {
    // Find and disable network-dependent UI elements
    document.querySelectorAll('[data-requires-network]').forEach(el => {
      el.disabled = true;
      el.classList.add('network-disabled');
      
      // Add tooltip explaining why it's disabled
      el.setAttribute('title', 'This feature requires network connectivity');
    });
  }
  
  /**
   * Setup warnings for degraded mode
   */
  function setupDegradedWarnings() {
    // Add warnings to degraded features
    document.querySelectorAll('[data-degraded-warning]').forEach(el => {
      const warning = el.getAttribute('data-degraded-warning');
      
      // Add visual indicator
      const indicator = document.createElement('div');
      indicator.className = 'degraded-feature-indicator';
      indicator.innerHTML = `<i class="fas fa-exclamation-circle"></i>`;
      indicator.title = warning || 'This feature may not work correctly in degraded mode';
      
      el.appendChild(indicator);
    });
  }
  
  /**
   * Load emergency resources needed for fallback operation
   */
  function loadEmergencyResources() {
    console.log("Loading emergency resources");
    
    EMERGENCY_RESOURCES.forEach(resource => {
      if (resource.type === 'script') {
        loadScript(resource.url, resource.fallbackUrl);
      } else if (resource.type === 'style') {
        loadStylesheet(resource.url, resource.fallbackUrl);
      }
    });
  }
  
  /**
   * Load a script with fallback
   * @param {string} url - Primary URL
   * @param {string} fallbackUrl - Fallback URL
   * @returns {Promise} Promise that resolves when script is loaded
   */
  function loadScript(url, fallbackUrl) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      
      script.onload = function() {
        console.log(`Successfully loaded script: ${url}`);
        resolve();
      };
      
      script.onerror = function() {
        console.warn(`Failed to load script from ${url}, trying fallback...`);
        
        if (fallbackUrl) {
          const fallbackScript = document.createElement('script');
          fallbackScript.src = fallbackUrl;
          
          fallbackScript.onload = function() {
            console.log(`Successfully loaded fallback script: ${fallbackUrl}`);
            resolve();
          };
          
          fallbackScript.onerror = function() {
            console.error(`Both script loading attempts failed for ${url}`);
            reject(new Error(`Failed to load script from ${url} and ${fallbackUrl}`));
          };
          
          document.body.appendChild(fallbackScript);
        } else {
          reject(new Error(`Failed to load script from ${url} and no fallback provided`));
        }
      };
      
      document.body.appendChild(script);
    });
  }
  
  /**
   * Load a stylesheet with fallback
   * @param {string} url - Primary URL
   * @param {string} fallbackUrl - Fallback URL
   * @returns {Promise} Promise that resolves when stylesheet is loaded
   */
  function loadStylesheet(url, fallbackUrl) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      
      link.onload = function() {
        console.log(`Successfully loaded stylesheet: ${url}`);
        resolve();
      };
      
      link.onerror = function() {
        console.warn(`Failed to load stylesheet from ${url}, trying fallback...`);
        
        if (fallbackUrl) {
          const fallbackLink = document.createElement('link');
          fallbackLink.rel = 'stylesheet';
          fallbackLink.href = fallbackUrl;
          
          fallbackLink.onload = function() {
            console.log(`Successfully loaded fallback stylesheet: ${fallbackUrl}`);
            resolve();
          };
          
          fallbackLink.onerror = function() {
            console.error(`Both stylesheet loading attempts failed for ${url}`);
            // Not rejecting since stylesheets are often optional
            resolve();
          };
          
          document.head.appendChild(fallbackLink);
        } else {
          // Not rejecting since stylesheets are often optional
          resolve();
        }
      };
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Setup emergency data handlers
   */
  function setupEmergencyDataHandlers() {
    // Check URL parameters for emergency data
    const urlParams = new URLSearchParams(window.location.search);
    const emergencyDataId = urlParams.get('emergency_data');
    
    if (emergencyDataId) {
      console.log("Emergency data detected in URL:", emergencyDataId);
      
      // Try to retrieve emergency data from storage
      const emergencyData = retrieveEmergencyData(emergencyDataId);
      
      // If data found, process it
      if (emergencyData) {
        processEmergencyData(emergencyData, emergencyDataId);
      } else {
        console.error("Emergency data not found in storage:", emergencyDataId);
        
        // Show error message
        showEmergencyDataError(`Emergency data (${emergencyDataId}) not found or has expired`);
      }
    }
  }
  
  /**
   * Retrieve emergency data from storage
   * @param {string} dataId - Storage key for the emergency data
   * @returns {Object|null} Retrieved data or null if not found
   */
  function retrieveEmergencyData(dataId) {
    try {
      // Try to get data from localStorage
      const rawData = localStorage.getItem(dataId);
      if (!rawData) return null;
      
      // Parse the data
      const parsedData = JSON.parse(rawData);
      
      // Check if this is a wrapped data object with metadata
      let data = parsedData;
      if (parsedData.metadata && parsedData.data) {
        data = parsedData.data;
        
        // Check if data is expired
        const now = Date.now();
        if (parsedData.metadata.expires && parsedData.metadata.expires < now) {
          console.warn("Emergency data has expired:", dataId);
          return null;
        }
      }
      
      console.log("Successfully retrieved emergency data:", dataId);
      return data;
    } catch (error) {
      console.error("Error retrieving emergency data:", error);
      return null;
    }
  }
  
  /**
   * Process retrieved emergency data
   * @param {Object} data - The emergency data
   * @param {string} dataId - The data ID for cleanup
   */
  function processEmergencyData(data, dataId) {
    // Show notification about available data
    showEmergencyDataNotification(data, dataId);
    
    // If we have a data processor, register it
    if (typeof window.processEmergencyData === 'function') {
      _fallbacks.dataProcessor = window.processEmergencyData;
    }
  }
  
  /**
   * Show notification about available emergency data
   * @param {Object} data - The emergency data
   * @param {string} dataId - The data ID for cleanup
   */
  function showEmergencyDataNotification(data, dataId) {
    // Try to find a suitable container
    const container = document.querySelector('.upload-section') || 
                      document.querySelector('.tool-header') || 
                      document.querySelector('main') ||
                      document.body;
    
    if (!container) return;
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'emergency-data-notification';
    notification.innerHTML = `
      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #0d47a1;">Emergency Data Available</h3>
        <p>Data has been transferred to this tool in emergency mode.</p>
        <p><strong>${Array.isArray(data) ? data.length : 'Unknown'}</strong> records are available.</p>
        <div style="margin-top: 10px;">
          <button id="load-emergency-data" class="primary-btn">
            <i class="fas fa-download"></i> Load Data
          </button>
          <button id="inspect-data" class="secondary-btn" style="margin-left: 10px;">
            Inspect Data
          </button>
          <button id="dismiss-emergency-data" class="text-btn" style="margin-left: 10px;">
            Dismiss
          </button>
        </div>
      </div>
    `;
    
    // Insert at beginning of container
    container.insertBefore(notification, container.firstChild);
    
    // Add event handlers
    const loadBtn = document.getElementById('load-emergency-data');
    if (loadBtn) {
      loadBtn.addEventListener('click', function() {
        // Find and execute the appropriate data processor
        let processor = null;
        
        // Try registered processor first
        if (_fallbacks.dataProcessor) {
          processor = _fallbacks.dataProcessor;
        } 
        // Then try direct function
        else if (typeof window.processEmergencyData === 'function') {
          processor = window.processEmergencyData;
        }
        // Try the main data processor
        else if (typeof window.processData === 'function') {
          processor = function(data) {
            window.processData({
              data: data,
              source: 'emergency',
              rows: Array.isArray(data) ? data.length : 'Unknown'
            });
          };
        }
        
        if (processor) {
          try {
            processor(data);
            
            // On success, remove notification
            notification.remove();
            
            // Clean up storage
            localStorage.removeItem(dataId);
            
            // Show success message
            showSuccessMessage('Data loaded successfully!');
          } catch (error) {
            console.error("Error processing emergency data:", error);
            showEmergencyDataError(`Error processing data: ${error.message}`);
          }
        } else {
          showEmergencyDataError('No suitable data processor found for this tool');
        }
      });
    }
    
    const inspectBtn = document.getElementById('inspect-data');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', function() {
        console.log("Emergency data inspection:", data);
        alert("Data inspection logged to console. Check developer tools.");
      });
    }
    
    const dismissBtn = document.getElementById('dismiss-emergency-data');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function() {
        notification.remove();
      });
    }
  }
  
  /**
   * Show error message for emergency data
   * @param {string} message - Error message
   */
  function showEmergencyDataError(message) {
    // Try to find a suitable container
    const container = document.querySelector('.upload-section') || 
                      document.querySelector('.tool-header') || 
                      document.querySelector('main') ||
                      document.body;
    
    if (!container) return;
    
    // Create error message
    const errorEl = document.createElement('div');
    errorEl.className = 'emergency-error-message';
    errorEl.innerHTML = `
      <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #c62828;">Error Loading Emergency Data</h3>
        <p>${message}</p>
        <p>Please try uploading your data file directly.</p>
        <button class="close-btn" style="background: none; border: none; color: #c62828; cursor: pointer; margin-top: 10px;">Dismiss</button>
      </div>
    `;
    
    // Insert at beginning of container
    container.insertBefore(errorEl, container.firstChild);
    
    // Add event handler for close button
    const closeBtn = errorEl.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        errorEl.remove();
      });
    }
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove();
      }
    }, 10000);
  }
  
  /**
   * Show success message
   * @param {string} message - Success message
   */
  function showSuccessMessage(message) {
    // Try to find a suitable container
    const container = document.querySelector('.upload-section') || 
                      document.querySelector('.tool-header') || 
                      document.querySelector('main') ||
                      document.body;
    
    if (!container) return;
    
    // Create success message
    const successEl = document.createElement('div');
    successEl.className = 'emergency-success-message';
    successEl.innerHTML = `
      <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #2e7d32;">Success</h3>
        <p>${message}</p>
      </div>
    `;
    
    // Insert at beginning of container
    container.insertBefore(successEl, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (successEl.parentNode) {
        successEl.remove();
      }
    }, 5000);
  }
  
  /**
   * Register a fallback implementation for a service
   * @param {string} serviceName - Service name
   * @param {Object} implementation - Fallback implementation
   */
  function registerFallback(serviceName, implementation) {
    _fallbacks[serviceName] = implementation;
  }
  
  /**
   * Get a fallback implementation for a service
   * @param {string} serviceName - Service name
   * @returns {Object} Fallback implementation
   */
  function getFallback(serviceName) {
    return _fallbacks[serviceName] || null;
  }
  
  /**
   * Initialize the resilience service
   */
  function init() {
    console.log("Initializing Resilience Service");
    
    // Register emergency data processor if available in window
    if (typeof window.processEmergencyData === 'function') {
      registerFallback('dataProcessor', window.processEmergencyData);
    }
    
    // Start health monitoring
    startHealthMonitoring();
    
    // Check if already in emergency mode
    const currentMode = FireEMS.Core.getMode();
    if (currentMode.mode === 'emergency' || currentMode.mode === 'offline') {
      console.log(`Already in ${currentMode.mode} mode, applying features`);
      enterMode(currentMode.mode, currentMode.capabilities);
    }
    
    return Promise.resolve();
  }
  
  // Public API
  return {
    init: init,
    registerFallback: registerFallback,
    getFallback: getFallback,
    enterMode: enterMode,
    getHealthStatus: function() { return _healthStatus; },
    performHealthCheck: performHealthCheck
  };
})();

// Register with core system
if (FireEMS.Core) {
  FireEMS.Core.register('resilience', FireEMS.ResilienceService);
}