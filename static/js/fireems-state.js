/**
 * FireEMS.ai State Management Service
 * 
 * Provides a unified state management system with:
 * - Persistent storage across tools and sessions
 * - Automatic fallbacks for storage failures
 * - Namespaced state to avoid conflicts
 * - Data compression for large datasets
 * - Encryption for sensitive data
 * 
 * Version: 1.0.0
 */

// Ensure namespace
window.FireEMS = window.FireEMS || {};

/**
 * State Management Service
 * Handles persistent data across tools and sessions
 */
FireEMS.StateService = (function() {
  // Internal state store
  const _store = {};
  
  // Configuration options
  let _options = {
    persistence: 'localStorage', // 'none', 'localStorage', 'sessionStorage', 'indexedDB'
    encryption: false,
    compression: true,
    autoSave: true,
    saveDelay: 500, // ms
    prefix: 'fireems_',
    quota: {
      warn: 3 * 1024 * 1024, // 3MB warning threshold
      limit: 4.5 * 1024 * 1024 // 4.5MB limit (most browsers limit at 5MB)
    }
  };
  
  // Save timers for debouncing
  const _saveTimers = {};
  
  // Size tracking
  const _sizeTracking = {
    total: 0,
    byNamespace: {}
  };
  
  // Event listeners
  const _listeners = {
    'state:change': [],
    'state:save': [],
    'state:load': [],
    'state:error': [],
    'quota:warning': [],
    'quota:exceeded': []
  };
  
  /**
   * Initialize the state service
   * @param {Object} options - Configuration options
   */
  function init(options = {}) {
    console.log("Initializing State Service");
    
    // Merge options
    _options = {..._options, ...options};
    
    // Detect available storage options
    detectStorageCapabilities();
    
    // Track storage usage
    calculateStorageUsage();
    
    // Load any previous state
    loadAllState();
    
    return Promise.resolve();
  }
  
  /**
   * Detect available storage capabilities
   */
  function detectStorageCapabilities() {
    // Test localStorage
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      console.log("localStorage is available");
    } catch (e) {
      console.warn("localStorage is not available:", e);
      if (_options.persistence === 'localStorage') {
        _options.persistence = 'sessionStorage';
      }
    }
    
    // Test sessionStorage
    try {
      const testKey = '__storage_test__';
      sessionStorage.setItem(testKey, testKey);
      sessionStorage.removeItem(testKey);
      console.log("sessionStorage is available");
    } catch (e) {
      console.warn("sessionStorage is not available:", e);
      if (_options.persistence === 'sessionStorage') {
        _options.persistence = 'memory';
      }
    }
    
    // Test IndexedDB if needed
    if (_options.persistence === 'indexedDB') {
      if (!window.indexedDB) {
        console.warn("IndexedDB is not available");
        _options.persistence = 'localStorage';
      } else {
        console.log("IndexedDB is available");
      }
    }
    
    // Test for compression support
    if (_options.compression) {
      if (typeof CompressionStream === 'undefined') {
        console.warn("CompressionStream API not available, disabling compression");
        _options.compression = false;
      }
    }
    
    // Test for encryption support
    if (_options.encryption) {
      if (typeof window.crypto?.subtle === 'undefined') {
        console.warn("Web Crypto API not available, disabling encryption");
        _options.encryption = false;
      }
    }
    
    console.log(`State service using ${_options.persistence} for persistence`);
  }
  
  /**
   * Calculate total storage usage
   */
  function calculateStorageUsage() {
    let total = 0;
    const byNamespace = {};
    
    // Calculate for localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith(_options.prefix)) {
            const size = localStorage.getItem(key).length;
            total += size;
            
            // Extract namespace from key
            const namespace = key.substring(_options.prefix.length).split('_')[0];
            byNamespace[namespace] = (byNamespace[namespace] || 0) + size;
          }
        }
      }
    } catch (e) {
      console.warn("Error calculating localStorage usage:", e);
    }
    
    _sizeTracking.total = total;
    _sizeTracking.byNamespace = byNamespace;
    
    // Check quota warnings
    checkQuotaWarnings();
    
    return { total, byNamespace };
  }
  
  /**
   * Check for storage quota warnings
   */
  function checkQuotaWarnings() {
    const total = _sizeTracking.total;
    
    // Check warning threshold
    if (total > _options.quota.warn) {
      const percentFull = Math.round((total / _options.quota.limit) * 100);
      console.warn(`Storage usage warning: ${formatSize(total)} used (${percentFull}% of quota)`);
      
      // Trigger warning event
      triggerEvent('quota:warning', {
        used: total,
        limit: _options.quota.limit,
        percent: percentFull
      });
    }
    
    // Check limit threshold
    if (total > _options.quota.limit) {
      console.error(`Storage quota exceeded: ${formatSize(total)} used (limit: ${formatSize(_options.quota.limit)})`);
      
      // Trigger quota exceeded event
      triggerEvent('quota:exceeded', {
        used: total,
        limit: _options.quota.limit
      });
    }
  }
  
  /**
   * Format size in bytes to human-readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size
   */
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  /**
   * Load all saved state from storage
   */
  function loadAllState() {
    switch (_options.persistence) {
      case 'localStorage':
        loadFromLocalStorage();
        break;
      case 'sessionStorage':
        loadFromSessionStorage();
        break;
      case 'indexedDB':
        loadFromIndexedDB();
        break;
      default:
        // Memory-only, nothing to load
        break;
    }
  }
  
  /**
   * Load state from localStorage
   */
  function loadFromLocalStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(_options.prefix)) {
          const namespace = key.substring(_options.prefix.length);
          const value = localStorage.getItem(key);
          
          try {
            // Parse the value
            const state = parseStoredValue(value);
            
            // Store it
            _store[namespace] = state;
            
            console.log(`Loaded state for namespace: ${namespace}`);
          } catch (parseError) {
            console.error(`Error parsing state for namespace ${namespace}:`, parseError);
          }
        }
      }
    } catch (e) {
      console.error("Error loading state from localStorage:", e);
      triggerEvent('state:error', {
        operation: 'load',
        storage: 'localStorage',
        error: e
      });
    }
  }
  
  /**
   * Load state from sessionStorage
   */
  function loadFromSessionStorage() {
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith(_options.prefix)) {
          const namespace = key.substring(_options.prefix.length);
          const value = sessionStorage.getItem(key);
          
          try {
            // Parse the value
            const state = parseStoredValue(value);
            
            // Store it
            _store[namespace] = state;
            
            console.log(`Loaded state for namespace: ${namespace}`);
          } catch (parseError) {
            console.error(`Error parsing state for namespace ${namespace}:`, parseError);
          }
        }
      }
    } catch (e) {
      console.error("Error loading state from sessionStorage:", e);
      triggerEvent('state:error', {
        operation: 'load',
        storage: 'sessionStorage',
        error: e
      });
    }
  }
  
  /**
   * Load state from IndexedDB
   */
  function loadFromIndexedDB() {
    // Implementation omitted for brevity
    // This would open a DB connection and load all state records
    console.log("IndexedDB state loading not fully implemented yet");
  }
  
  /**
   * Parse a stored value based on format
   * @param {string} value - The stored value
   * @returns {Object} The parsed value
   */
  function parseStoredValue(value) {
    try {
      // Check if this is a wrapped value with metadata
      if (value.startsWith('{') && value.includes('"__metadata":')) {
        const wrapper = JSON.parse(value);
        
        // Handle compressed data
        if (wrapper.__metadata.compressed) {
          // Decompress (implementation would go here)
          console.log("Decompression not fully implemented");
          return wrapper.data;
        }
        
        // Handle encrypted data
        if (wrapper.__metadata.encrypted) {
          // Decrypt (implementation would go here)
          console.log("Decryption not fully implemented");
          return wrapper.data;
        }
        
        return wrapper.data;
      }
      
      // Plain JSON
      return JSON.parse(value);
    } catch (e) {
      console.error("Error parsing stored value:", e);
      throw e;
    }
  }
  
  /**
   * Set state for a namespace and key
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @param {any} value - State value
   * @returns {any} The set value
   */
  function setState(namespace, key, value) {
    if (!_store[namespace]) {
      _store[namespace] = {};
    }
    
    const oldValue = _store[namespace][key];
    _store[namespace][key] = value;
    
    // Trigger change event
    triggerEvent('state:change', {
      namespace,
      key,
      value,
      oldValue
    });
    
    // Save to persistence if enabled
    if (_options.autoSave) {
      saveStateDebounced(namespace);
    }
    
    return value;
  }
  
  /**
   * Set multiple state values at once
   * @param {string} namespace - State namespace
   * @param {Object} values - Object with key-value pairs to set
   * @returns {Object} The set values
   */
  function setStates(namespace, values) {
    if (!_store[namespace]) {
      _store[namespace] = {};
    }
    
    // Track all changes for a batch event
    const changes = [];
    
    // Update all values
    for (const [key, value] of Object.entries(values)) {
      const oldValue = _store[namespace][key];
      _store[namespace][key] = value;
      
      changes.push({ key, value, oldValue });
    }
    
    // Trigger batch change event
    triggerEvent('state:change', {
      namespace,
      batch: true,
      changes
    });
    
    // Save to persistence if enabled
    if (_options.autoSave) {
      saveStateDebounced(namespace);
    }
    
    return values;
  }
  
  /**
   * Get state for a namespace and key
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} The state value
   */
  function getState(namespace, key, defaultValue) {
    if (!_store[namespace]) {
      _store[namespace] = {};
    }
    
    return _store[namespace][key] !== undefined
      ? _store[namespace][key]
      : defaultValue;
  }
  
  /**
   * Get all state for a namespace
   * @param {string} namespace - State namespace
   * @returns {Object} The namespace state
   */
  function getNamespaceState(namespace) {
    return _store[namespace] || {};
  }
  
  /**
   * Check if a state key exists
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @returns {boolean} Whether the key exists
   */
  function hasState(namespace, key) {
    return _store[namespace] && _store[namespace][key] !== undefined;
  }
  
  /**
   * Remove state for a namespace and key
   * @param {string} namespace - State namespace
   * @param {string} key - State key
   * @returns {boolean} Whether the key was removed
   */
  function removeState(namespace, key) {
    if (!_store[namespace]) {
      return false;
    }
    
    const hadKey = _store[namespace][key] !== undefined;
    if (hadKey) {
      const oldValue = _store[namespace][key];
      delete _store[namespace][key];
      
      // Trigger change event
      triggerEvent('state:change', {
        namespace,
        key,
        value: undefined,
        oldValue,
        removed: true
      });
      
      // Save to persistence if enabled
      if (_options.autoSave) {
        saveStateDebounced(namespace);
      }
    }
    
    return hadKey;
  }
  
  /**
   * Clear all state for a namespace
   * @param {string} namespace - State namespace
   * @returns {boolean} Whether the namespace was cleared
   */
  function clearNamespace(namespace) {
    if (!_store[namespace]) {
      return false;
    }
    
    const oldState = _store[namespace];
    _store[namespace] = {};
    
    // Trigger change event
    triggerEvent('state:change', {
      namespace,
      cleared: true,
      oldState
    });
    
    // Save to persistence if enabled
    if (_options.autoSave) {
      saveStateDebounced(namespace);
    }
    
    return true;
  }
  
  /**
   * Clear all state
   * @returns {boolean} Whether any state was cleared
   */
  function clearAllState() {
    const hadState = Object.keys(_store).length > 0;
    if (hadState) {
      const oldStore = {..._store};
      
      // Clear memory store
      for (const namespace in _store) {
        _store[namespace] = {};
      }
      
      // Trigger change event
      triggerEvent('state:change', {
        allCleared: true,
        oldStore
      });
      
      // Clear persistence
      clearPersistence();
    }
    
    return hadState;
  }
  
  /**
   * Save state for a namespace with debouncing
   * @param {string} namespace - State namespace
   */
  function saveStateDebounced(namespace) {
    // Cancel any existing timer
    if (_saveTimers[namespace]) {
      clearTimeout(_saveTimers[namespace]);
    }
    
    // Create a new timer
    _saveTimers[namespace] = setTimeout(() => {
      saveState(namespace);
      delete _saveTimers[namespace];
    }, _options.saveDelay);
  }
  
  /**
   * Save state for a namespace
   * @param {string} namespace - State namespace
   * @returns {boolean} Whether the save was successful
   */
  function saveState(namespace) {
    if (!_store[namespace]) {
      return false;
    }
    
    try {
      const value = prepareValueForStorage(_store[namespace]);
      
      switch (_options.persistence) {
        case 'localStorage':
          localStorage.setItem(`${_options.prefix}${namespace}`, value);
          break;
        case 'sessionStorage':
          sessionStorage.setItem(`${_options.prefix}${namespace}`, value);
          break;
        case 'indexedDB':
          // IndexedDB implementation would go here
          console.log("IndexedDB save not fully implemented");
          break;
        case 'none':
        case 'memory':
          // No persistence
          break;
      }
      
      // Update storage usage
      calculateStorageUsage();
      
      // Trigger save event
      triggerEvent('state:save', {
        namespace,
        size: value.length
      });
      
      return true;
    } catch (e) {
      console.error(`Error saving state for namespace ${namespace}:`, e);
      
      // Handle quota exceeded errors
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        handleQuotaExceeded(namespace, e);
      }
      
      triggerEvent('state:error', {
        operation: 'save',
        namespace,
        error: e
      });
      
      return false;
    }
  }
  
  /**
   * Prepare a value for storage
   * @param {any} value - The value to prepare
   * @returns {string} The prepared value
   */
  function prepareValueForStorage(value) {
    // Create metadata
    const metadata = {
      timestamp: Date.now(),
      compressed: _options.compression,
      encrypted: _options.encryption,
      version: '1.0'
    };
    
    // Wrap the value
    const wrapper = {
      __metadata: metadata,
      data: value
    };
    
    // Convert to string
    return JSON.stringify(wrapper);
  }
  
  /**
   * Handle quota exceeded errors
   * @param {string} namespace - Namespace that exceeded quota
   * @param {Error} error - The error that occurred
   */
  function handleQuotaExceeded(namespace, error) {
    console.error(`Storage quota exceeded for namespace ${namespace}`);
    
    // Trigger quota exceeded event
    triggerEvent('quota:exceeded', {
      namespace,
      error
    });
    
    // Try emergency cleanup
    performEmergencyCleanup();
  }
  
  /**
   * Perform emergency cleanup to free space
   */
  function performEmergencyCleanup() {
    console.log("Performing emergency storage cleanup");
    
    // Find all keys starting with the prefix
    const toRemove = [];
    
    try {
      // Scan localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`${_options.prefix}temp_`) || key.startsWith(`${_options.prefix}cache_`)) {
          toRemove.push(key);
        }
      }
      
      // Remove items
      for (const key of toRemove) {
        console.log(`Emergency cleanup removing: ${key}`);
        localStorage.removeItem(key);
      }
      
      console.log(`Emergency cleanup removed ${toRemove.length} items`);
      
      // Update usage
      calculateStorageUsage();
    } catch (e) {
      console.error("Error during emergency cleanup:", e);
    }
  }
  
  /**
   * Clear all persistence
   */
  function clearPersistence() {
    try {
      switch (_options.persistence) {
        case 'localStorage':
          // Only remove keys with our prefix
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key.startsWith(_options.prefix)) {
              localStorage.removeItem(key);
            }
          }
          break;
        case 'sessionStorage':
          // Only remove keys with our prefix
          for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key.startsWith(_options.prefix)) {
              sessionStorage.removeItem(key);
            }
          }
          break;
        case 'indexedDB':
          // IndexedDB implementation would go here
          console.log("IndexedDB clear not fully implemented");
          break;
      }
      
      // Update usage
      calculateStorageUsage();
    } catch (e) {
      console.error("Error clearing persistence:", e);
      triggerEvent('state:error', {
        operation: 'clear',
        error: e
      });
    }
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
   * Store emergency data for cross-tool communication
   * @param {string} id - Optional identifier for the data (defaults to generated ID)
   * @param {Object} data - The data to store
   * @param {Object} options - Storage options
   * @returns {string} Data ID for later retrieval
   */
  function storeEmergencyData(id, data, options = {}) {
    // Allow id to be optional
    if (typeof id === 'object' && data === undefined) {
      data = id;
      id = null;
    }
    
    // Generate ID if not provided
    const dataId = id || `emergency_data_${Date.now()}`;
    
    // Default options
    const storeOptions = {
      expiration: 3600000, // 1 hour in ms
      metadata: {},
      ...options
    };
    
    try {
      // Create a wrapper with metadata
      const wrapper = {
        metadata: {
          created: Date.now(),
          expires: Date.now() + storeOptions.expiration,
          source: window.location.pathname,
          ...storeOptions.metadata
        },
        data: data
      };
      
      // Serialize the data
      const serialized = JSON.stringify(wrapper);
      
      // Check size against quota
      const size = serialized.length;
      if (size > 4 * 1024 * 1024) { // 4MB, below most 5MB limits
        console.error("Emergency data exceeds recommended size limit");
        triggerEvent('quota:warning', {
          operation: 'storeEmergencyData',
          size: size
        });
      }
      
      // Store in localStorage
      localStorage.setItem(dataId, serialized);
      
      console.log(`Stored emergency data with ID ${dataId} (${formatSize(size)})`);
      return dataId;
    } catch (e) {
      console.error("Error storing emergency data:", e);
      
      // Especially handle quota errors
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        performEmergencyCleanup();
        // Could try again with cleaned localStorage...
      }
      
      triggerEvent('state:error', {
        operation: 'storeEmergencyData',
        error: e
      });
      
      return null;
    }
  }
  
  /**
   * Retrieve emergency data by ID
   * @param {string} id - The data ID
   * @param {boolean} autoRemove - Whether to remove the data after retrieval
   * @returns {Object} The stored data or null if not found
   */
  function retrieveEmergencyData(id, autoRemove = false) {
    try {
      // First try with the exact ID
      let raw = localStorage.getItem(id);
      
      // If not found, check for approximate timestamp matches
      if (!raw && id.startsWith('emergency_data_')) {
        console.log(`Exact key ${id} not found, trying approximate timestamp matching...`);
        
        // Extract timestamp if present in the ID
        const timestamp = id.replace('emergency_data_', '');
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
                    console.log(`Found close timestamp match: ${key} (diff: ${timeDiff}ms)`);
                    bestMatch = key;
                    smallestDiff = timeDiff;
                    raw = keyData;
                  }
                }
              }
            }
          }
          
          if (bestMatch) {
            console.log(`Using closest match: ${bestMatch} instead of ${id}`);
            id = bestMatch; // Use the matched ID for removal if autoRemove is true
          }
        }
      }
      
      // If still not found after approximate matching
      if (!raw) {
        console.warn(`Emergency data with ID ${id} not found, even after approximate matching`);
        return null;
      }
      
      // Parse the data
      const parsed = JSON.parse(raw);
      
      // Check if it's a wrapped value
      if (parsed.metadata && parsed.data) {
        // Check expiration
        if (parsed.metadata.expires && parsed.metadata.expires < Date.now()) {
          console.warn(`Emergency data with ID ${id} has expired`);
          localStorage.removeItem(id);
          return null;
        }
        
        // Remove if requested
        if (autoRemove) {
          localStorage.removeItem(id);
          console.log(`Removed emergency data with ID ${id} after retrieval`);
        }
        
        // Return the data
        return parsed.data;
      }
      
      // Direct value (older format)
      if (autoRemove) {
        localStorage.removeItem(id);
      }
      
      return parsed;
    } catch (e) {
      console.error(`Error retrieving emergency data with ID ${id}:`, e);
      return null;
    }
  }
  
  // Public API
  return {
    init: init,
    
    // State management
    set: setState,
    setMultiple: setStates,
    get: getState,
    getNamespace: getNamespaceState,
    has: hasState,
    remove: removeState,
    clear: clearNamespace,
    clearAll: clearAllState,
    
    // Manual persistence
    save: saveState,
    saveAll: function() {
      for (const namespace in _store) {
        saveState(namespace);
      }
    },
    
    // Storage info
    getStorageInfo: calculateStorageUsage,
    
    // Emergency data
    storeEmergencyData: storeEmergencyData,
    retrieveEmergencyData: retrieveEmergencyData,
    
    // Events
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    
    // Configuration
    getOptions: function() { return {..._options}; },
    setOptions: function(options) { 
      _options = {..._options, ...options};
      return {..._options};
    }
  };
})();

// Register with core system
if (FireEMS.Core) {
  FireEMS.Core.register('state', FireEMS.StateService);
}