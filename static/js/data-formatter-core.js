/**
 * Data Formatter Core
 * Core initialization and state management for the Data Formatter
 * 
 * This script provides a robust foundation for the Data Formatter, ensuring:
 * - Proper state initialization before any component loads
 * - Consistent handling of large files like Data1G.csv
 * - Reliable detection of emergency mode conditions
 * - Safe fallback to emergency mode when needed
 * - Consistent state management throughout the application lifecycle
 */

(function() {
  'use strict';

  // Core namespace
  window.FireEMS = window.FireEMS || {};
  window.FireEMS.DataFormatter = window.FireEMS.DataFormatter || {};
  
  // Create StateManager first - this is the single source of truth
  const StateManager = {
    // Internal state storage with defaults
    _state: {
      // Application state
      initialized: false,
      mode: 'loading', // 'loading', 'normal', 'emergency'
      loadingErrors: [],
      componentStatus: {}, // Track which components have loaded

      // File metadata
      fileId: null,
      fileName: null,
      fileSize: 0,
      fileType: null,
      isLargeFile: false,
      isDataIG: false,

      // Processing state
      sourceColumns: [],
      sampleData: [],
      selectedTool: null,
      mappings: null,
      transformedData: null,
      originalData: null,

      // Configuration
      previewSizes: {
        default: 25,     // Default preview size for regular files
        large: 100       // Preview size for large files like Data1G.csv
      },
      processingLimits: {
        default: 100,    // Default processing limit for regular files
        large: 1000      // Processing limit for large files
      },
      
      // URLs and paths
      staticPaths: {
        normal: '/static/',
        emergency: '/app-static/'
      }
    },

    // Public getters
    get: function(key) {
      if (key) {
        return this._state[key];
      }
      // Return a copy of state, not the reference
      return JSON.parse(JSON.stringify(this._state));
    },

    // Controlled setter to maintain state consistency
    set: function(key, value) {
      // Special handling for certain keys
      if (key === 'fileName') {
        this._state.fileName = value;
        // Update Data1G detection whenever filename changes
        this.detectLargeFile(value);
        
        // Store filename in sessionStorage for persistence
        try {
          sessionStorage.setItem('currentFileName', value);
          localStorage.setItem('currentFileName', value);
        } catch (e) {
          console.warn('Could not store filename in storage:', e);
        }
      } 
      else if (key === 'fileSize') {
        this._state.fileSize = value;
        // Update large file detection based on size
        if (value > 1000000) { // 1MB
          this._state.isLargeFile = true;
        }
      }
      else if (key === 'mode') {
        if (['loading', 'normal', 'emergency'].includes(value)) {
          const oldMode = this._state.mode;
          this._state.mode = value;
          this.logModeChange(oldMode, value);
          
          // Dispatch mode change event
          this.dispatchEvent('modeChange', { oldMode, newMode: value });
        } else {
          console.error('Invalid mode:', value);
        }
      }
      else {
        // Standard key setting
        this._state[key] = value;
      }

      // Dispatch a state change event
      this.dispatchEvent('stateChange', { key, value });
      
      return this;
    },

    // Handle multiple properties at once
    setMultiple: function(obj) {
      if (!obj || typeof obj !== 'object') return this;
      
      Object.entries(obj).forEach(([key, value]) => {
        this.set(key, value);
      });
      
      return this;
    },

    // File-specific methods
    detectLargeFile: function(filename) {
      if (!filename) return;
      
      const lcFilename = (filename || '').toLowerCase();
      const isDataIG = lcFilename.includes('data1g');
      
      this._state.isDataIG = isDataIG;
      this._state.isLargeFile = isDataIG || this._state.fileSize > 1000000;
      
      // Log detection for debugging
      console.log(`[StateManager] File detection: "${filename}" - isDataIG: ${isDataIG}, isLargeFile: ${this._state.isLargeFile}`);
    },

    // Get the current processing limit based on file characteristics
    getProcessingLimit: function() {
      return this._state.isLargeFile ? 
        this._state.processingLimits.large : 
        this._state.processingLimits.default;
    },

    // Get the current preview size based on file characteristics
    getPreviewSize: function() {
      return this._state.isLargeFile ? 
        this._state.previewSizes.large : 
        this._state.previewSizes.default;
    },

    // Custom events system
    _eventListeners: {},
    
    addEventListener: function(event, callback) {
      if (!this._eventListeners[event]) {
        this._eventListeners[event] = [];
      }
      this._eventListeners[event].push(callback);
      return this;
    },
    
    dispatchEvent: function(event, data) {
      if (!this._eventListeners[event]) return;
      
      this._eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in ${event} event listener:`, e);
        }
      });
    },

    // Diagnostic methods
    getStatus: function() {
      return {
        initialized: this._state.initialized,
        mode: this._state.mode,
        isLargeFile: this._state.isLargeFile,
        isDataIG: this._state.isDataIG,
        fileName: this._state.fileName,
        fileSize: this._state.fileSize,
        componentStatus: this._state.componentStatus
      };
    },

    logModeChange: function(oldMode, newMode) {
      console.log(`[StateManager] Mode changed: ${oldMode} -> ${newMode}`);
      
      // Add a visual indicator for users
      if (newMode === 'emergency') {
        this.showModeIndicator('emergency');
      } else if (newMode === 'normal') {
        this.showModeIndicator('normal');
      }
    },

    showModeIndicator: function(mode) {
      // CRITICAL FIX: Only try to create indicator if DOM is ready
      if (document.readyState === 'loading') {
        console.log('[StateManager] DOM not ready, deferring mode indicator creation');
        // Schedule to run again when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
          this.showModeIndicator(mode);
        });
        return;
      }
      
      // Create or update a visual indicator in the UI
      let indicator = document.getElementById('mode-indicator');
      
      if (!indicator) {
        try {
          indicator = document.createElement('div');
          indicator.id = 'mode-indicator';
          indicator.style.position = 'fixed';
          indicator.style.top = '10px';
          indicator.style.right = '10px';
          indicator.style.padding = '5px 10px';
          indicator.style.borderRadius = '4px';
          indicator.style.fontSize = '12px';
          indicator.style.fontWeight = 'bold';
          indicator.style.zIndex = '9999';
          
          // Check if body exists before appending
          if (document.body) {
            document.body.appendChild(indicator);
          } else {
            console.warn('[StateManager] document.body not available, mode indicator creation deferred');
            return;
          }
        } catch (e) {
          console.warn('[StateManager] Error creating mode indicator:', e);
          return;
        }
      }
      
      if (mode === 'emergency') {
        indicator.style.backgroundColor = '#ffcc00';
        indicator.style.color = '#333';
        indicator.textContent = 'Emergency Mode';
      } else {
        indicator.style.backgroundColor = '#4caf50';
        indicator.style.color = 'white';
        indicator.textContent = 'Normal Mode';
      }
      
      // Hide after 5 seconds
      setTimeout(() => {
        indicator.style.opacity = '0.7';
      }, 5000);
    },

    // Initialize state from multiple sources
    initialize: function() {
      // Check URL parameters for forced modes
      const urlParams = new URLSearchParams(window.location.search);
      const forceNormal = urlParams.get('force_normal') === 'true';
      const forceEmergency = urlParams.get('force_emergency') === 'true';
      
      if (forceNormal) {
        this.set('mode', 'normal');
      } else if (forceEmergency) {
        this.set('mode', 'emergency');
      }
      
      // Try to recover file info from session/localStorage
      const fileName = sessionStorage.getItem('currentFileName') || 
                      localStorage.getItem('currentFileName');
                
      if (fileName) {
        this.set('fileName', fileName);
      }
      
      // Mark as initialized
      this._state.initialized = true;
      
      // Log initialization
      console.log('[StateManager] State initialized:', this.getStatus());
      
      return this;
    }
  };
  
  // ComponentLoader manages script loading with proper dependency tracking
  const ComponentLoader = {
    _registry: {},
    _loadAttempts: {},
    
    // Register a component with its dependencies
    register: function(name, options = {}) {
      this._registry[name] = {
        loaded: false,
        url: options.url || null,
        fallbackUrl: options.fallbackUrl || null,
        emergencyUrl: options.emergencyUrl || null,
        dependencies: options.dependencies || [],
        callback: options.callback || null,
        critical: !!options.critical
      };
      return this;
    },
    
    // Mark a component as loaded
    markLoaded: function(name) {
      if (!this._registry[name]) {
        console.warn(`[ComponentLoader] Trying to mark unknown component "${name}" as loaded`);
        return this;
      }
      
      this._registry[name].loaded = true;
      StateManager.set(`componentStatus.${name}`, true);
      
      // Check if any components depending on this one can now be loaded
      this._checkDependentComponents();
      
      return this;
    },
    
    // Check if all critical components are loaded
    allCriticalLoaded: function() {
      return Object.entries(this._registry)
        .filter(([_, config]) => config.critical)
        .every(([_, config]) => config.loaded);
    },
    
    // Check and load any components whose dependencies are now satisfied
    _checkDependentComponents: function() {
      Object.entries(this._registry).forEach(([name, config]) => {
        if (!config.loaded && this._areDependenciesSatisfied(name)) {
          this.load(name);
        }
      });
    },
    
    // Check if all dependencies for a component are loaded
    _areDependenciesSatisfied: function(name) {
      const dependencies = this._registry[name]?.dependencies || [];
      
      return dependencies.every(depName => {
        return this._registry[depName] && this._registry[depName].loaded;
      });
    },
    
    // Load a component
    load: function(name) {
      if (!this._registry[name]) {
        console.error(`[ComponentLoader] Unknown component: ${name}`);
        return Promise.reject(new Error(`Unknown component: ${name}`));
      }
      
      const config = this._registry[name];
      
      // Don't reload if already loaded
      if (config.loaded) {
        return Promise.resolve(true);
      }
      
      // Don't attempt to load if dependencies aren't satisfied
      if (!this._areDependenciesSatisfied(name)) {
        console.log(`[ComponentLoader] Not loading ${name} yet - dependencies not satisfied`);
        return Promise.reject(new Error(`Dependencies not satisfied for ${name}`));
      }
      
      // Track load attempts
      this._loadAttempts[name] = (this._loadAttempts[name] || 0) + 1;
      
      // Determine which URL to use based on the current mode
      let url = config.url;
      
      if (StateManager.get('mode') === 'emergency' && config.emergencyUrl) {
        url = config.emergencyUrl;
      }
      
      // If this is a retry and we have a fallback URL, use that
      if (this._loadAttempts[name] > 1 && config.fallbackUrl) {
        url = config.fallbackUrl;
      }
      
      // If no URL, this might be a virtual component or bundle
      if (!url) {
        if (config.callback) {
          try {
            config.callback();
            this.markLoaded(name);
            return Promise.resolve(true);
          } catch (error) {
            console.error(`[ComponentLoader] Error executing callback for ${name}:`, error);
            return Promise.reject(error);
          }
        } else {
          console.warn(`[ComponentLoader] No URL or callback for component: ${name}`);
          return Promise.resolve(false);
        }
      }
      
      // CRITICAL FIX: If DOM not ready, defer loading until DOM is ready
      if (document.readyState === 'loading') {
        console.log(`[ComponentLoader] DOM not ready, deferring load of ${name}`);
        return new Promise((resolve, reject) => {
          document.addEventListener('DOMContentLoaded', () => {
            console.log(`[ComponentLoader] DOM ready, loading deferred component ${name}`);
            this.load(name).then(resolve).catch(reject);
          });
        });
      }
      
      // CRITICAL FIX: Check if we can add script to document
      if (!document.head && !document.body) {
        console.warn(`[ComponentLoader] Cannot load script ${name} - DOM not initialized`);
        
        // Schedule a retry
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log(`[ComponentLoader] Retrying load of ${name} after delay`);
            this.load(name).then(resolve).catch(reject);
          }, 500);
        });
      }
      
      // Load the script
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        
        script.onload = () => {
          console.log(`[ComponentLoader] Loaded: ${name} from ${url}`);
          this.markLoaded(name);
          
          if (config.callback) {
            try {
              config.callback();
            } catch (error) {
              console.error(`[ComponentLoader] Error executing callback for ${name}:`, error);
            }
          }
          
          resolve(true);
        };
        
        script.onerror = (error) => {
          console.warn(`[ComponentLoader] Failed to load: ${name} from ${url}`);
          
          // Try the emergency URL as a last resort if available
          if (config.emergencyUrl && url !== config.emergencyUrl) {
            console.log(`[ComponentLoader] Attempting emergency URL for ${name}: ${config.emergencyUrl}`);
            
            const emergencyScript = document.createElement('script');
            emergencyScript.src = config.emergencyUrl;
            
            emergencyScript.onload = () => {
              console.log(`[ComponentLoader] Loaded ${name} from emergency URL: ${config.emergencyUrl}`);
              this.markLoaded(name);
              
              if (config.callback) {
                try {
                  config.callback();
                } catch (error) {
                  console.error(`[ComponentLoader] Error executing callback for ${name}:`, error);
                }
              }
              
              resolve(true);
            };
            
            emergencyScript.onerror = () => {
              console.error(`[ComponentLoader] All load attempts failed for ${name}`);
              StateManager.set(`componentStatus.${name}`, false);
              StateManager._state.loadingErrors.push(`Failed to load ${name}`);
              
              // If this is a critical component, switch to emergency mode
              if (config.critical && StateManager.get('mode') !== 'emergency') {
                console.error(`[ComponentLoader] Critical component ${name} failed to load, switching to emergency mode`);
                StateManager.set('mode', 'emergency');
              }
              
              reject(new Error(`All load attempts failed for ${name}`));
            };
            
            // CRITICAL FIX: Use document.head if body not available
            const parent = document.body || document.head;
            if (parent) {
              parent.appendChild(emergencyScript);
            } else {
              console.error(`[ComponentLoader] Cannot append script - both document.body and document.head are null`);
              reject(new Error('DOM not initialized enough to load scripts'));
            }
          } else {
            StateManager.set(`componentStatus.${name}`, false);
            StateManager._state.loadingErrors.push(`Failed to load ${name}`);
            
            // If this is a critical component, switch to emergency mode
            if (config.critical && StateManager.get('mode') !== 'emergency') {
              console.error(`[ComponentLoader] Critical component ${name} failed to load, switching to emergency mode`);
              StateManager.set('mode', 'emergency');
            }
            
            reject(error);
          }
        };
        
        // CRITICAL FIX: Use document.head if body not available
        const parent = document.body || document.head;
        if (parent) {
          parent.appendChild(script);
        } else {
          console.error(`[ComponentLoader] Cannot append script - both document.body and document.head are null`);
          reject(new Error('DOM not initialized enough to load scripts'));
        }
      });
    },
    
    // Load multiple components
    loadMultiple: function(names) {
      return Promise.allSettled(names.map(name => this.load(name)));
    },
    
    // Load all registered components
    loadAll: function() {
      const components = Object.keys(this._registry);
      return this.loadMultiple(components);
    }
  };
  
  // EventManager handles global events and provides a central event delegation system
  const EventManager = {
    // Store all event handlers by event type
    handlers: {},
    
    // Store elements with events and their actual DOM listeners
    elements: {},
    
    // Flag indicating if the system is initialized
    initialized: false,
    
    // Register a handler for a specific event type
    on: function(eventType, handler) {
      if (!this.handlers[eventType]) {
        this.handlers[eventType] = [];
      }
      
      this.handlers[eventType].push(handler);
      return this;
    },
    
    // Remove a handler
    off: function(eventType, handler) {
      if (!this.handlers[eventType]) return this;
      
      if (handler) {
        this.handlers[eventType] = this.handlers[eventType].filter(h => h !== handler);
      } else {
        // Remove all handlers for this event type
        delete this.handlers[eventType];
      }
      
      return this;
    },
    
    // Remove all handlers and detach DOM listeners
    reset: function() {
      // Remove all DOM event listeners
      Object.entries(this.elements).forEach(([key, elem]) => {
        const element = document.getElementById(elem.elementId);
        if (element && element._eventManager_listener) {
          element.removeEventListener(elem.eventType, element._eventManager_listener);
          delete element._eventManager_listener;
        }
      });
      
      // Clear our handler registry
      this.handlers = {};
      this.elements = {};
      this.initialized = false;
      
      console.log('[EventManager] Reset completed - all handlers removed');
      return this;
    },
    
    // Attach event listener to an element and manage through event delegation
    attach: function(elementId, eventType, mode = 'any') {
      // Skip if already listening on this element
      const key = `${elementId}:${eventType}`;
      if (this.elements[key]) return this;
      
      // Store the element in our registry
      this.elements[key] = { elementId, eventType, mode };
      
      // CRITICAL FIX: If DOM not ready, defer attaching event listener
      if (document.readyState === 'loading') {
        console.log(`[EventManager] DOM not ready, deferring event attachment for ${elementId}`);
        document.addEventListener('DOMContentLoaded', () => {
          this.attach(elementId, eventType, mode);
        });
        return this;
      }
      
      // Set up actual browser event listener
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`[EventManager] Element not found: ${elementId}`);
        
        // CRITICAL FIX: Add retry mechanism for elements that might be created dynamically
        setTimeout(() => {
          const retryElement = document.getElementById(elementId);
          if (retryElement) {
            console.log(`[EventManager] Element ${elementId} found on retry, attaching event listener`);
            this._attachToElement(retryElement, eventType, mode);
          } else {
            console.warn(`[EventManager] Element ${elementId} still not found after retry`);
          }
        }, 500); // Retry after 500ms
        
        return this;
      }
      
      return this._attachToElement(element, eventType, mode);
    },
    
    // Helper method to attach event listener to an element
    _attachToElement: function(element, eventType, mode = 'any') {
      if (!element) {
        console.warn('[EventManager] Cannot attach to null element');
        return this;
      }
      
      const elementId = element.id;
      
      // Prevent multiple listeners on the same element
      if (element._eventManager_listener) {
        console.warn(`[EventManager] Element ${elementId} already has a listener attached`);
        element.removeEventListener(eventType, element._eventManager_listener);
      }
      
      // Create a handler function that will process events through our delegation system
      const handler = (event) => {
        // Check if we're in emergency mode first - this is a critical performance optimization
        const currentMode = StateManager.get('mode');
        
        // Log what's happening - helps debug event delegation issues
        console.log(`[EventManager] Processing ${eventType} event on ${elementId} (current mode: ${currentMode})`);
        
        // Get all handlers for this event type
        const handlers = this.handlers[eventType] || [];
        
        // Check for large file special case for file inputs
        const isLargeFileEvent = element && element.id === 'data-file' && 
                               event && event.target && event.target.files && 
                               event.target.files[0];
                               
        let isKnownLargeFile = false;
        let isVeryLargeFile = false;
        
        if (isLargeFileEvent) {
          const file = event.target.files[0];
          
          // Check filename for known large files
          isKnownLargeFile = file.name && (
            file.name.toLowerCase().includes('data1g') || 
            file.name.toLowerCase().includes('large') ||
            file.name.toLowerCase().includes('big')
          );
          
          // Check file size
          isVeryLargeFile = file.size > 10000000; // 10MB
          
          // Log large file detection
          if (isKnownLargeFile || isVeryLargeFile) {
            console.log(`%c[EventManager] LARGE FILE DETECTED: ${file.name} (${Math.round(file.size/1024/1024)}MB)`, 
                        'color: orange; font-weight: bold');
          }
        }
        
        // Find handlers that should execute in the current mode
        const eligibleHandlers = handlers.filter(handler => {
          // Base condition - handler works in current mode or any mode
          const modeMatches = handler.mode === 'any' || handler.mode === currentMode;
          
          // CRITICAL FIX: Special case for large files - include emergency handlers
          const shouldUseEmergencyHandler = (isKnownLargeFile || isVeryLargeFile) && handler.mode === 'emergency';
          if (isLargeFileEvent && shouldUseEmergencyHandler) {
            return true;
          }
          
          return modeMatches;
        });
        
        // Sort handlers by priority (high numbers first)
        // CRITICAL FIX: For large files, boost priority of emergency handlers
        eligibleHandlers.sort((a, b) => {
          // If this is a large file and we have emergency handlers, consider giving them priority
          if (isLargeFileEvent && (isKnownLargeFile || isVeryLargeFile)) {
            // For very large files or known problematic ones, emergency handlers get top priority
            if ((isKnownLargeFile || isVeryLargeFile) && 
                a.mode === 'emergency' && b.mode !== 'emergency') return -1;
            if ((isKnownLargeFile || isVeryLargeFile) && 
                a.mode !== 'emergency' && b.mode === 'emergency') return 1;
          }
          
          // Normal priority sorting
          return (b.priority || 0) - (a.priority || 0);
        });
        
        // Log eligible handlers - helps debug event delegation issues
        console.log(`[EventManager] Found ${eligibleHandlers.length} eligible handlers`);
        if (eligibleHandlers.length > 0) {
          console.log(`[EventManager] Handlers:`, eligibleHandlers.map(h => `${h.name} (mode: ${h.mode}, priority: ${h.priority || 0})`));
        }
        
        // Execute handlers in priority order
        for (const handler of eligibleHandlers) {
          try {
            // If handler returns true, it "handled" the event so stop propagation
            const result = handler.callback(event, element);
            if (result === true) {
              console.log(`[EventManager] Event handled by ${handler.name} (stopping propagation)`);
              break;
            }
          } catch (error) {
            console.error(`[EventManager] Error in handler ${handler.name}:`, error);
          }
        }
      };
      
      // Store handler reference on the element so we can remove it later
      element._eventManager_listener = handler;
      
      // Add the actual event listener
      element.addEventListener(eventType, handler);
      
      console.log(`[EventManager] Attached listener to ${elementId} for ${eventType} events`);
      return this;
    },
    
    // Register a handler with mode and priority
    register: function(eventType, handler) {
      // Handler must be an object with at least a callback function
      if (!handler || typeof handler.callback !== 'function') {
        console.error('[EventManager] Invalid handler object:', handler);
        return this;
      }
      
      // Set defaults if missing
      handler.mode = handler.mode || 'any';
      handler.priority = handler.priority || 0;
      handler.name = handler.name || 'anonymous';
      
      // Register the handler
      this.on(eventType, handler);
      console.log(`[EventManager] Registered ${handler.name} for ${eventType} events (mode: ${handler.mode}, priority: ${handler.priority})`);
      
      return this;
    },
    
    // Initialize the event system
    initialize: function() {
      console.log('[EventManager] Initializing event delegation system');
      
      // Listen for mode changes to update handler eligibility
      StateManager.addEventListener('modeChange', (data) => {
        console.log(`[EventManager] Mode changed from ${data.oldMode} to ${data.newMode}, updating handler eligibility`);
      });
      
      return this;
    }
  };
  
  // FileManager handles file processing consistently
  const FileManager = {
    // Constants
    DEFAULT_PREVIEW_SIZE: 25,
    LARGE_FILE_PREVIEW_SIZE: 100,
    DEFAULT_PROCESSING_LIMIT: 100,
    LARGE_FILE_PROCESSING_LIMIT: 1000,
    
    // Process a file and update state
    processFile: function(file) {
      if (!file) {
        console.error('[FileManager] No file provided');
        return;
      }
      
      // Update state with file metadata
      StateManager.setMultiple({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Log file details
      console.log(`[FileManager] Processing file: ${file.name} (${Math.round(file.size / 1024)} KB)`);
      
      // Determine file type and process accordingly
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Use the appropriate processor based on file type
      if (fileExtension === 'csv') {
        this.processCSV(file);
      } else if (['xls', 'xlsx'].includes(fileExtension)) {
        this.processExcel(file);
      } else if (fileExtension === 'json') {
        this.processJSON(file);
      } else {
        console.warn(`[FileManager] Unsupported file extension: ${fileExtension}, attempting CSV processing`);
        this.processCSV(file);
      }
      
      // Update UI with filename
      const fileNameDisplay = document.getElementById('file-name');
      if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
      }
      
      // Enable the mapping button
      const mapFieldsBtn = document.getElementById('map-fields-btn');
      if (mapFieldsBtn) {
        mapFieldsBtn.disabled = false;
      }
      
      // Add to processing log
      this.addLogEntry(`File loaded: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
    },
    
    // Process CSV files
    processCSV: function(file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          if (headers.length === 0) {
            this.handleError('No columns detected in CSV file');
            return;
          }
          
          // Store column headers in state
          StateManager.set('sourceColumns', headers);
          
          // Determine processing limit based on file characteristics
          const isLargeFile = StateManager.get('isLargeFile');
          const maxRows = isLargeFile ? this.LARGE_FILE_PROCESSING_LIMIT : this.DEFAULT_PROCESSING_LIMIT;
          
          console.log(`[FileManager] Processing ${maxRows} rows from ${file.name} (large file: ${isLargeFile})`);
          
          // Process data rows
          const sampleData = [];
          
          for (let i = 1; i < Math.min(lines.length, maxRows + 1); i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',');
              const row = {};
              
              headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
              });
              
              sampleData.push(row);
            }
          }
          
          // Update state with sample data
          StateManager.set('sampleData', sampleData);
          StateManager.set('originalData', true);
          
          // Update preview
          this.updatePreview(headers, sampleData);
          
          // Log success
          this.addLogEntry(`CSV processed with ${headers.length} columns and ${sampleData.length} rows.${isLargeFile ? ' <b>(Enhanced processing for large file)</b>' : ''}`, 'info');
        } catch (error) {
          this.handleError(`Error processing CSV: ${error.message}`);
          console.error('[FileManager] CSV processing error:', error);
        }
      };
      
      reader.onerror = () => {
        this.handleError('Error reading file');
      };
      
      reader.readAsText(file);
    },
    
    // Process Excel files
    processExcel: function(file) {
      // Check if XLSX.js is available
      if (!window.XLSX) {
        this.handleError('Excel processing requires XLSX.js library which is not available');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            this.handleError('No data found in Excel file');
            return;
          }
          
          // Extract headers from first row
          const headers = jsonData[0].map(h => h ? h.toString().trim() : '');
          
          // Update state with column headers
          StateManager.set('sourceColumns', headers);
          
          // Determine processing limit based on file characteristics
          const isLargeFile = StateManager.get('isLargeFile');
          const maxRows = isLargeFile ? this.LARGE_FILE_PROCESSING_LIMIT : this.DEFAULT_PROCESSING_LIMIT;
          
          console.log(`[FileManager] Processing ${maxRows} rows from Excel ${file.name} (large file: ${isLargeFile})`);
          
          // Process data rows
          const sampleData = [];
          
          for (let i = 1; i < Math.min(jsonData.length, maxRows + 1); i++) {
            if (jsonData[i].length > 0) {
              const row = {};
              
              headers.forEach((header, index) => {
                row[header] = index < jsonData[i].length ? jsonData[i][index] : '';
              });
              
              sampleData.push(row);
            }
          }
          
          // Update state with sample data
          StateManager.set('sampleData', sampleData);
          StateManager.set('originalData', true);
          
          // Update preview
          this.updatePreview(headers, sampleData);
          
          // Log success
          this.addLogEntry(`Excel file processed with ${headers.length} columns and ${sampleData.length} rows.${isLargeFile ? ' <b>(Enhanced processing for large file)</b>' : ''}`, 'info');
        } catch (error) {
          this.handleError(`Error processing Excel file: ${error.message}`);
          console.error('[FileManager] Excel processing error:', error);
        }
      };
      
      reader.onerror = () => {
        this.handleError('Error reading Excel file');
      };
      
      reader.readAsArrayBuffer(file);
    },
    
    // Process JSON files
    processJSON: function(file) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonText = e.target.result;
          const jsonData = JSON.parse(jsonText);
          
          // Handle array of objects
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            // Check if first item is an object
            if (typeof jsonData[0] === 'object' && jsonData[0] !== null) {
              // Extract headers from first object
              const headers = Object.keys(jsonData[0]);
              
              // Update state with column headers
              StateManager.set('sourceColumns', headers);
              
              // Determine processing limit based on file characteristics
              const isLargeFile = StateManager.get('isLargeFile');
              const maxRows = isLargeFile ? this.LARGE_FILE_PROCESSING_LIMIT : this.DEFAULT_PROCESSING_LIMIT;
              
              console.log(`[FileManager] Processing ${maxRows} rows from JSON ${file.name} (large file: ${isLargeFile})`);
              
              // Use data directly, limiting to max rows
              const sampleData = jsonData.slice(0, maxRows);
              
              // Update state with sample data
              StateManager.set('sampleData', sampleData);
              StateManager.set('originalData', true);
              
              // Update preview
              this.updatePreview(headers, sampleData);
              
              // Log success
              this.addLogEntry(`JSON file processed with ${headers.length} columns and ${sampleData.length} rows.${isLargeFile ? ' <b>(Enhanced processing for large file)</b>' : ''}`, 'info');
            } else {
              this.handleError('JSON data must be an array of objects');
            }
          } else {
            this.handleError('JSON data must be an array of objects');
          }
        } catch (error) {
          this.handleError(`Error processing JSON: ${error.message}`);
          console.error('[FileManager] JSON processing error:', error);
        }
      };
      
      reader.onerror = () => {
        this.handleError('Error reading JSON file');
      };
      
      reader.readAsText(file);
    },
    
    // Handle processing errors
    handleError: function(message) {
      // Show error in preview
      const previewContainer = document.getElementById('input-preview');
      if (previewContainer) {
        previewContainer.innerHTML = `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
          </div>
        `;
      }
      
      // Add to log
      this.addLogEntry(message, 'error');
    },
    
    // Update preview with processed data
    updatePreview: function(headers, rows) {
      const previewContainer = document.getElementById('input-preview');
      if (!previewContainer) return;
      
      // Determine preview size based on file characteristics
      const isLargeFile = StateManager.get('isLargeFile');
      const previewSize = isLargeFile ? this.LARGE_FILE_PREVIEW_SIZE : this.DEFAULT_PREVIEW_SIZE;
      const rowsToShow = Math.min(rows.length, previewSize);
      
      console.log(`[FileManager] Showing preview with ${rowsToShow} rows (large file: ${isLargeFile})`);
      
      // Generate preview HTML
      let html = '<table class="preview-table"><thead><tr>';
      
      // Add headers
      headers.forEach(header => {
        html += `<th>${header}</th>`;
      });
      
      html += '</tr></thead><tbody>';
      
      // Add rows
      for (let i = 0; i < rowsToShow; i++) {
        html += '<tr>';
        headers.forEach(header => {
          html += `<td>${rows[i][header] !== undefined ? rows[i][header] : ''}</td>`;
        });
        html += '</tr>';
      }
      
      html += '</tbody></table>';
      
      // If not showing all rows, add a message
      if (rowsToShow < rows.length) {
        html += `
          <div class="preview-message" style="margin-top: 10px; font-style: italic;">
            Showing ${rowsToShow} of ${rows.length} total records. Complete dataset will be processed.
          </div>
        `;
      }
      
      previewContainer.innerHTML = html;
    },
    
    // Add entry to the transformation log
    addLogEntry: function(message, type = 'info') {
      const logContainer = document.getElementById('log-container');
      if (!logContainer) return;
      
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = `log-entry log-${type}`;
      logEntry.innerHTML = `
        <span class="log-time">${timestamp}</span> 
        ${message}
      `;
      
      // Remove placeholder if present
      const placeholder = logContainer.querySelector('.log-placeholder');
      if (placeholder) {
        logContainer.innerHTML = '';
      }
      
      logContainer.appendChild(logEntry);
    },
    
    // Create sample output after mapping
    createSampleOutput: function() {
      const sampleData = StateManager.get('sampleData');
      const mappings = StateManager.get('mappings');
      
      if (!sampleData || !mappings) {
        console.error('[FileManager] Missing data or mappings for output generation');
        return;
      }
      
      console.log(`[FileManager] Generating output from ${sampleData.length} records`);
      
      // Transform data based on mappings
      const transformedData = sampleData.map(row => {
        const transformed = {};
        
        // Apply each mapping
        Object.entries(mappings).forEach(([targetField, mapping]) => {
          const sourceColumn = mapping.sourceId || mapping;
          transformed[targetField] = row[sourceColumn] || '';
        });
        
        return transformed;
      });
      
      // Update state
      StateManager.set('transformedData', transformedData);
      
      // Update output preview
      this.updateOutputPreview(transformedData, mappings);
      
      // Enable download and send buttons
      const downloadBtn = document.getElementById('download-btn');
      const sendToToolBtn = document.getElementById('send-to-tool-btn');
      
      if (downloadBtn) downloadBtn.disabled = false;
      if (sendToToolBtn) sendToToolBtn.disabled = false;
      
      // Log action
      const isLargeFile = StateManager.get('isLargeFile');
      const previewSize = isLargeFile ? this.LARGE_FILE_PREVIEW_SIZE : this.DEFAULT_PREVIEW_SIZE;
      const rowsToShow = Math.min(transformedData.length, previewSize);
      
      this.addLogEntry(`Data transformation complete. Preview shows ${rowsToShow} of ${transformedData.length} total record(s).${isLargeFile ? ' <b>(Using enhanced preview for large files)</b>' : ''}`, 'info');
    },
    
    // Update output preview
    updateOutputPreview: function(transformedData, mappings) {
      const outputPreview = document.getElementById('output-preview');
      if (!outputPreview) return;
      
      // Determine preview size
      const isLargeFile = StateManager.get('isLargeFile');
      const previewSize = isLargeFile ? this.LARGE_FILE_PREVIEW_SIZE : this.DEFAULT_PREVIEW_SIZE;
      const rowsToShow = Math.min(transformedData.length, previewSize);
      
      // Generate preview HTML
      let html = '<table class="preview-table"><thead><tr>';
      
      // Add headers from mappings
      const headers = Object.keys(mappings);
      headers.forEach(header => {
        html += `<th>${header}</th>`;
      });
      
      html += '</tr></thead><tbody>';
      
      // Add rows
      for (let i = 0; i < rowsToShow; i++) {
        html += '<tr>';
        headers.forEach(header => {
          html += `<td>${transformedData[i][header] || ''}</td>`;
        });
        html += '</tr>';
      }
      
      html += '</tbody></table>';
      
      // If not showing all rows, add a message
      if (rowsToShow < transformedData.length) {
        html += `
          <div class="preview-message" style="margin-top: 10px; font-style: italic;">
            Showing ${rowsToShow} of ${transformedData.length} total records. Complete dataset will be processed.
          </div>
        `;
      }
      
      outputPreview.innerHTML = html;
    },
    
    // Initialize the file manager
    initialize: function() {
      console.log('[FileManager] Initializing');
      
      // Register as the primary file processor (high priority, works in any mode)
      EventManager.register('change', {
        name: 'FileManager.processFile',
        callback: (event, element) => {
          if (element.id === 'data-file' && event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            
            // CRITICAL FIX: Check for large files and use appropriate processing
            const isVeryLargeFile = file && file.size && file.size > 10000000; // 10MB
            const isKnownLargeFile = file && file.name && (
              file.name.toLowerCase().includes('data1g') || 
              file.name.toLowerCase().includes('large') ||
              file.name.toLowerCase().includes('big')
            );
            
            if (isKnownLargeFile || isVeryLargeFile) {
              console.log('[FileManager] Detected large file, setting enhanced processing mode');
              
              // Store size for future reference
              try {
                sessionStorage.setItem('lastFileSize', file.size.toString());
              } catch(e) {
                console.warn('Could not store file size', e);
              }
              
              // Always mark as large file
              StateManager.set('isLargeFile', true);
              
              // For extremely large files or known problematic ones, use emergency mode
              if (isKnownLargeFile || file.size > 50000000) { // 50MB threshold for emergency mode
                console.log('[FileManager] File is extremely large, forcing emergency mode');
                StateManager.set('mode', 'emergency');
                
                // Let emergency handler process this file
                return false;
              }
            }
            
            this.processFile(file);
            return true; // Signal that we've handled the event
          }
          return false;
        },
        mode: 'any',
        priority: 100 // High priority to handle before emergency mode
      });
      
      // Register for map fields button click
      EventManager.register('click', {
        name: 'FileManager.showFieldMapping',
        callback: (event, element) => {
          if (element.id === 'map-fields-btn') {
            console.log('[FileManager] Map fields button clicked');
            // Continue with normal map fields functionality
            return false; // Allow other handlers to run too
          }
          return false;
        },
        mode: 'normal',
        priority: 50
      });
      
      return this;
    }
  };
  
  // DiagnosticManager helps identify and resolve issues
  const DiagnosticManager = {
    startTime: Date.now(),
    loadTimes: {},
    errors: [],
    
    // Start timing a specific operation
    startTimer: function(operation) {
      this.loadTimes[operation] = {
        start: Date.now()
      };
      return this;
    },
    
    // End timing for an operation
    endTimer: function(operation, success) {
      if (this.loadTimes[operation]) {
        this.loadTimes[operation].end = Date.now();
        this.loadTimes[operation].duration = this.loadTimes[operation].end - this.loadTimes[operation].start;
        this.loadTimes[operation].success = success;
      }
      return this;
    },
    
    // Log an error
    logError: function(source, error) {
      this.errors.push({
        time: Date.now(),
        source,
        error: error.toString(),
        stack: error.stack
      });
      
      console.error(`[DiagnosticManager] Error in ${source}:`, error);
      return this;
    },
    
    // Get diagnostic report
    getReport: function() {
      return {
        totalTime: Date.now() - this.startTime,
        loadTimes: this.loadTimes,
        errors: this.errors,
        stateStatus: StateManager.getStatus(),
        components: ComponentLoader._registry,
        browser: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookiesEnabled: navigator.cookieEnabled
        }
      };
    },
    
    // Send diagnostics to server
    sendReport: function() {
      const report = this.getReport();
      console.log('[DiagnosticManager] Diagnostic report:', report);
      
      // In a real implementation, send to server
      // fetch('/api/diagnostics', {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify(report)
      // }).catch(e => console.error('Failed to send diagnostics:', e));
      
      return report;
    }
  };
  
  // BootManager coordinates the startup sequence
  const BootManager = {
    _initialized: false,
    
    // Bootstrap the entire application
    initialize: function() {
      if (this._initialized) return;
      this._initialized = true;
      
      DiagnosticManager.startTimer('bootProcess');
      
      // CRITICAL FIX: Check if we're initializing before DOM is ready
      const isDOMReady = document.readyState !== 'loading';
      console.log(`[BootManager] Initializing (DOM ready: ${isDOMReady})`);
      
      // Initialize state first - this is always safe to do
      StateManager.initialize();
      
      // Initialize event system
      EventManager.initialize();
      
      // Register required components
      this.registerComponents();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // CRITICAL FIX: For early initialization, defer DOM-dependent operations
      const completeDOMDependentInit = () => {
        // Initialize file management first so it can handle events
        FileManager.initialize();
        
        // Set up DOM event delegation after file manager is ready
        this.setupDOMEvents();
        
        // Begin loading components after event system is ready
        this.loadInitialComponents();
        
        // Create global formatterState for backward compatibility with existing code
        this.setupLegacyCompatibility();
        
        console.log('[BootManager] DOM-dependent initialization complete');
      };
      
      // Set up timeout check for emergency mode - do this immediately
      this.setupEmergencyCheck();
      
      // For DOM-dependent operations, check if we need to wait
      if (isDOMReady) {
        // DOM is already ready, proceed immediately
        completeDOMDependentInit();
      } else {
        // Defer DOM-dependent initialization until DOM is ready
        console.log('[BootManager] Deferring DOM-dependent initialization until DOM is ready');
        document.addEventListener('DOMContentLoaded', () => {
          console.log('[BootManager] DOM is now ready, completing initialization');
          completeDOMDependentInit();
        });
      }
      
      DiagnosticManager.endTimer('bootProcess', true);
      console.log('[BootManager] Initial initialization phase complete');
    },
    
    // Register all the components we need
    registerComponents: function() {
      // Core libraries
      ComponentLoader.register('coreLibrary', {
        url: '/static/js/fireems-framework.js',
        fallbackUrl: '/app-static/js/fireems-framework.js',
        critical: true
      });
      
      // Main formatter bundle
      ComponentLoader.register('formatterBundle', {
        url: '/static/data-formatter-bundle.js?v=1.0.2',
        fallbackUrl: '/direct-static/data-formatter-bundle.js',
        emergencyUrl: '/app-static/data-formatter-direct.js',
        dependencies: ['coreLibrary'],
        critical: true,
        callback: function() {
          console.log('[FormatterBundle] Main bundle loaded, setting dataFormatterLoaded flag');
          window.dataFormatterLoaded = true;
        }
      });
      
      // Emergency mode libraries
      ComponentLoader.register('emergencyMode', {
        url: '/static/js/emergency-scripts/emergency-mode-library.js',
        fallbackUrl: '/app-static/js/emergency-mode.js',
        dependencies: ['coreLibrary'],
        critical: false
      });
      
      // Integration libraries for different tools
      ComponentLoader.register('formatterIntegration', {
        url: '/static/data-formatter-integration.js',
        fallbackUrl: '/app-static/data-formatter-integration.js',
        dependencies: ['formatterBundle'],
        critical: false
      });
      
      // Extra utilities and fixes
      ComponentLoader.register('formatterFixes', {
        url: '/static/data-formatter-fix.js',
        fallbackUrl: '/app-static/data-formatter-fix.js',
        dependencies: ['formatterBundle'],
        critical: false
      });
    },
    
    // Set up event listeners for state changes
    setupEventListeners: function() {
      // Listen for mode changes
      StateManager.addEventListener('modeChange', function(data) {
        console.log(`[EventListener] Mode changed from ${data.oldMode} to ${data.newMode}`);
        
        if (data.newMode === 'emergency') {
          // Load emergency components
          ComponentLoader.load('emergencyMode');
          ComponentLoader.load('formatterFixes');
        }
      });
    },
    
    // Set up DOM event delegation
    setupDOMEvents: function() {
      // Handle DOM not ready yet - wait until DOM is loaded
      const setupEvents = () => {
        // Check for large files from session/localStorage
        const currentFileName = sessionStorage.getItem('currentFileName') || 
                              localStorage.getItem('currentFileName');
        const fileSize = parseInt(sessionStorage.getItem('lastFileSize') || '0', 10);
        
        // CRITICAL FIX: Check if this is a large file that should use enhanced processing
        const isKnownLargeFile = (currentFileName && (
          currentFileName.toLowerCase().includes('data1g') || 
          currentFileName.toLowerCase().includes('large') ||
          currentFileName.toLowerCase().includes('big')
        ));
        const isLargeBySize = fileSize > 1000000; // 1MB
        
        if (isKnownLargeFile || isLargeBySize) {
          console.log(`[BootManager] Detected large file from storage, using enhanced processing`);
          StateManager.set('isLargeFile', true);
          
          // Only force emergency mode for extremely large files or known problematic files
          if (isKnownLargeFile || fileSize > 10000000) { // 10MB
            console.log(`[BootManager] File is extremely large, forcing emergency mode`);
            StateManager.set('mode', 'emergency');
          }
        }
        // Otherwise, set normal mode if we're still in loading
        else if (StateManager.get('mode') === 'loading') {
          StateManager.set('mode', 'normal');
        }
        
        // File input change event
        EventManager.attach('data-file', 'change');
        
        // Map fields button click
        EventManager.attach('map-fields-btn', 'click');
        
        // Download button click
        EventManager.attach('download-btn', 'click');
        
        // Send to tool button click
        EventManager.attach('send-to-tool-btn', 'click');
        
        console.log('[BootManager] Event delegation system initialized in', StateManager.get('mode'), 'mode');
      };
      
      // Check if DOM is ready
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setupEvents();
      } else {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', setupEvents);
      }
    },
    
    // Load the initial set of components
    loadInitialComponents: function() {
      // Start by loading the core library
      ComponentLoader.load('coreLibrary')
        .then(() => {
          // Once core is loaded, load the main bundle
          return ComponentLoader.load('formatterBundle');
        })
        .then(() => {
          // Once main bundle is loaded, try to load integration
          return ComponentLoader.load('formatterIntegration');
        })
        .catch(error => {
          console.error('[BootManager] Error loading initial components:', error);
          
          // If we can't load critical components, switch to emergency mode
          if (!ComponentLoader.allCriticalLoaded()) {
            StateManager.set('mode', 'emergency');
          }
        });
    },
    
    // Set up emergency mode check
    setupEmergencyCheck: function() {
      // Check after 3 seconds if components are loaded properly
      setTimeout(() => {
        // If dataFormatterLoaded flag is not set, switch to emergency mode
        if (!window.dataFormatterLoaded && StateManager.get('mode') !== 'emergency') {
          console.warn('[BootManager] dataFormatterLoaded flag not set after timeout, switching to emergency mode');
          StateManager.set('mode', 'emergency');
        }
      }, 3000);
    },
    
    // Set up legacy compatibility
    setupLegacyCompatibility: function() {
      // Create global formatterState for backward compatibility
      window.formatterState = {
        fileId: null,
        fileName: StateManager.get('fileName'),
        fileSize: StateManager.get('fileSize'),
        sourceColumns: [],
        sampleData: [],
        selectedTool: null,
        mappings: null,
        transformedData: null,
        originalData: null,
        
        // The critical field that was missing in the original implementation
        originalFileName: StateManager.get('fileName'),
        
        // Add convenience methods
        isLargeFile: function(filename) {
          const fileToCheck = filename || this.originalFileName || '';
          const isDataIG = fileToCheck.toLowerCase().includes('data1g');
          return isDataIG || (this.fileSize > 1000000);
        },
        
        getProcessingLimit: function() {
          return this.isLargeFile() ? 1000 : 100;
        },
        
        getPreviewSize: function() {
          return this.isLargeFile() ? 100 : 25;
        }
      };
      
      // Set up proxy to sync changes between StateManager and global formatterState
      StateManager.addEventListener('stateChange', function(data) {
        if (data.key === 'fileName') {
          window.formatterState.fileName = data.value;
          window.formatterState.originalFileName = data.value;
        } else if (data.key === 'fileSize') {
          window.formatterState.fileSize = data.value;
        } else if (data.key === 'sourceColumns') {
          window.formatterState.sourceColumns = data.value;
        } else if (data.key === 'sampleData') {
          window.formatterState.sampleData = data.value;
        } else if (data.key === 'mappings') {
          window.formatterState.mappings = data.value;
        } else if (data.key === 'transformedData') {
          window.formatterState.transformedData = data.value;
        } else if (data.key === 'originalData') {
          window.formatterState.originalData = data.value;
        }
      });
      
      // Hook into the legacy `createSampleOutput` function if called
      window.createSampleOutput = function() {
        console.log('[LegacyCompat] createSampleOutput called, delegating to FileManager');
        FileManager.createSampleOutput();
      };
    }
  };
  
  // Expose the public API
  window.FireEMS.DataFormatter = {
    // Core modules
    StateManager: StateManager,
    ComponentLoader: ComponentLoader,
    EventManager: EventManager,
    FileManager: FileManager,
    DiagnosticManager: DiagnosticManager,
    
    // Convenience methods
    getState: function(key) {
      return StateManager.get(key);
    },
    
    setState: function(key, value) {
      return StateManager.set(key, value);
    },
    
    isEmergencyMode: function() {
      return StateManager.get('mode') === 'emergency';
    },
    
    isLargeFile: function() {
      return StateManager.get('isLargeFile');
    },
    
    getDiagnostics: function() {
      return DiagnosticManager.getReport();
    },
    
    // Direct access to process a file - allowing outside callers to use our system
    processFile: function(file) {
      return FileManager.processFile(file);
    },
    
    // Used to check if this library is loaded
    isLoaded: true
  };
  
  // Initialize the system
  BootManager.initialize();
  
  // Log that we're ready
  console.log('[DataFormatter] Core library initialized and ready');
})();