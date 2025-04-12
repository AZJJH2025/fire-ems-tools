/**
 * FireEMS.ai Core Framework
 * 
 * This is the foundation of the FireEMS.ai application architecture,
 * providing service registration, discovery, and lifecycle management.
 * 
 * Version: 1.0.0
 */

// Ensure namespace
window.FireEMS = window.FireEMS || {};

/**
 * Core Services Architecture
 * Provides service registration, discovery, and dependency injection
 */
FireEMS.Core = (function() {
  // Private service registry
  const _services = {};
  
  // Service status tracking
  const _serviceStatus = {};
  
  // Event listeners
  const _listeners = {
    'service:registered': [],
    'service:ready': [],
    'service:failed': [],
    'mode:changed': []
  };
  
  /**
   * Register a service with the system
   * @param {string} name - Service name
   * @param {Object} implementation - Service implementation
   * @param {Array} dependencies - Optional list of service dependencies
   * @returns {Object} The registered service
   */
  function registerService(name, implementation, dependencies = []) {
    if (_services[name]) {
      console.warn(`Service '${name}' is already registered, overwriting previous implementation`);
    }
    
    _services[name] = implementation;
    _serviceStatus[name] = {
      registered: true,
      initialized: false,
      ready: false,
      failed: false,
      dependencies: dependencies,
      error: null
    };
    
    // Log registration
    console.log(`Service registered: ${name}`);
    
    // Trigger event
    triggerEvent('service:registered', {
      name: name,
      dependencies: dependencies
    });
    
    // If service has an init method, call it once dependencies are ready
    if (typeof implementation.init === 'function') {
      initializeServiceWhenReady(name);
    } else {
      // Mark as ready immediately if no init function
      markServiceReady(name);
    }
    
    return implementation;
  }
  
  /**
   * Initialize a service once all its dependencies are ready
   * @param {string} name - Service name
   */
  function initializeServiceWhenReady(name) {
    const status = _serviceStatus[name];
    
    // Check if all dependencies are ready
    const depsReady = status.dependencies.every(depName => {
      return _serviceStatus[depName] && _serviceStatus[depName].ready;
    });
    
    if (depsReady) {
      // All dependencies ready, initialize the service
      try {
        // Get dependency implementations
        const deps = status.dependencies.map(depName => _services[depName]);
        
        // Mark as initializing
        status.initialized = true;
        
        // Call the init function with dependencies
        const result = _services[name].init(...deps);
        
        // Handle promises
        if (result instanceof Promise) {
          result
            .then(() => markServiceReady(name))
            .catch(error => markServiceFailed(name, error));
        } else {
          // Synchronous initialization
          markServiceReady(name);
        }
      } catch (error) {
        markServiceFailed(name, error);
      }
    } else {
      // Dependencies not ready, setup listeners
      status.dependencies.forEach(depName => {
        if (!_serviceStatus[depName] || !_serviceStatus[depName].ready) {
          // Add one-time listener for this dependency
          addEventListener('service:ready', function waitForDep(event) {
            if (event.detail.name === depName) {
              // Remove this listener
              _listeners['service:ready'] = _listeners['service:ready'].filter(
                listener => listener !== waitForDep
              );
              
              // Try initialization again
              initializeServiceWhenReady(name);
            }
          });
        }
      });
    }
  }
  
  /**
   * Mark a service as ready
   * @param {string} name - Service name
   */
  function markServiceReady(name) {
    if (!_serviceStatus[name]) return;
    
    _serviceStatus[name].ready = true;
    console.log(`Service ready: ${name}`);
    
    // Trigger event
    triggerEvent('service:ready', { name: name });
  }
  
  /**
   * Mark a service as failed
   * @param {string} name - Service name
   * @param {Error} error - Error that caused the failure
   */
  function markServiceFailed(name, error) {
    if (!_serviceStatus[name]) return;
    
    _serviceStatus[name].failed = true;
    _serviceStatus[name].error = error;
    console.error(`Service '${name}' failed to initialize:`, error);
    
    // Trigger event
    triggerEvent('service:failed', {
      name: name,
      error: error
    });
  }
  
  /**
   * Get a service with optional fallback
   * @param {string} name - Service name
   * @param {boolean} useFallback - Whether to use fallbacks for missing services
   * @returns {Object} The requested service or fallback
   */
  function getService(name, useFallback = true) {
    const service = _services[name];
    if (!service && useFallback) {
      console.warn(`Service '${name}' not found, using fallback`);
      return getFallbackService(name);
    }
    return service;
  }
  
  /**
   * Check if a service is ready
   * @param {string} name - Service name
   * @returns {boolean} Whether the service is ready
   */
  function isServiceReady(name) {
    return _serviceStatus[name] && _serviceStatus[name].ready;
  }
  
  /**
   * Create appropriate fallbacks for missing services
   * @param {string} name - Service name
   * @returns {Object} Fallback service implementation
   */
  function getFallbackService(name) {
    // First check if we have a resilience service with fallbacks
    if (_services.resilience && _services.resilience.getFallback) {
      const fallback = _services.resilience.getFallback(name);
      if (fallback) return fallback;
    }
    
    // Otherwise create a basic empty implementation
    return {
      __fallback: true,
      name: `${name}-fallback`
    };
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  function addEventListener(event, callback) {
    if (!_listeners[event]) {
      _listeners[event] = [];
    }
    _listeners[event].push(callback);
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback to remove
   */
  function removeEventListener(event, callback) {
    if (_listeners[event]) {
      _listeners[event] = _listeners[event].filter(
        listener => listener !== callback
      );
    }
  }
  
  /**
   * Trigger an event
   * @param {string} event - Event name
   * @param {Object} detail - Event details
   */
  function triggerEvent(event, detail = {}) {
    if (_listeners[event]) {
      _listeners[event].forEach(callback => {
        try {
          callback({ type: event, detail: detail });
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }
  
  /**
   * Set the application operation mode
   * @param {string} mode - Operation mode ('normal', 'degraded', 'emergency', 'offline')
   * @param {Object} capabilities - Capability flags for the current mode
   */
  function setMode(mode, capabilities = {}) {
    console.log(`Setting application mode: ${mode}`);
    
    // Store the mode and capabilities
    FireEMS.mode = mode;
    FireEMS.capabilities = capabilities;
    
    // Trigger mode changed event
    triggerEvent('mode:changed', {
      mode: mode,
      capabilities: capabilities
    });
    
    // Update HTML classes for CSS targeting
    document.documentElement.className = document.documentElement.className
      .replace(/\bmode-\S+/g, '')
      .trim();
    document.documentElement.classList.add(`mode-${mode}`);
    
    return { mode, capabilities };
  }
  
  /**
   * Get current application mode
   * @returns {Object} Current mode and capabilities
   */
  function getMode() {
    return {
      mode: FireEMS.mode || 'normal',
      capabilities: FireEMS.capabilities || {}
    };
  }
  
  // Detect initial operation mode based on environment
  function detectInitialMode() {
    // Default to normal mode
    let mode = 'normal';
    const capabilities = {
      apiAccess: true,
      staticFileAccess: true,
      dataStorage: true,
      rendering: true
    };
    
    // Check for localStorage support
    try {
      const testKey = '__test_storage__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
    } catch (e) {
      capabilities.dataStorage = false;
      mode = 'degraded';
    }
    
    // Check if we're in IFRAME (might limit capabilities)
    if (window.self !== window.top) {
      capabilities.fullScreen = false;
    }
    
    // Check if we came here with emergency parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('emergency_mode') || urlParams.has('emergency_data')) {
      mode = 'emergency';
      console.log("Emergency mode detected from URL parameters");
    }
    
    // Check for offline mode
    if (!navigator.onLine) {
      mode = 'offline';
      capabilities.apiAccess = false;
    }
    
    // Set the initial mode
    setMode(mode, capabilities);
    
    return { mode, capabilities };
  }
  
  // Initialize the core system
  function init() {
    console.log("FireEMS Core initializing...");
    
    // Detect initial mode
    const { mode, capabilities } = detectInitialMode();
    
    // Setup network status listener
    window.addEventListener('online', function() {
      const currentMode = getMode();
      if (currentMode.mode === 'offline') {
        // Update capabilities
        const newCapabilities = {...currentMode.capabilities, apiAccess: true};
        // Upgrade mode if possible
        setMode('degraded', newCapabilities);
      }
    });
    
    window.addEventListener('offline', function() {
      const currentMode = getMode();
      // Update capabilities
      const newCapabilities = {...currentMode.capabilities, apiAccess: false};
      // Downgrade mode
      setMode('offline', newCapabilities);
    });
    
    // Add emergency data detection
    if (mode === 'emergency') {
      console.log("Initializing in emergency mode");
    }
    
    console.log("FireEMS Core initialized in " + mode + " mode");
    return Promise.resolve();
  }
  
  // Public API
  return {
    // Service management
    register: registerService,
    get: getService,
    isReady: isServiceReady,
    
    // Event system
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    
    // Mode management
    setMode: setMode,
    getMode: getMode,
    
    // Initialization
    init: init
  };
})();

// Auto-initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize core
  FireEMS.Core.init().then(() => {
    console.log("FireEMS Core ready");
  });
});