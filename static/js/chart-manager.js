/**
 * FireEMS.ai Chart Manager Service
 * 
 * A comprehensive service for managing Chart.js instances throughout their lifecycle.
 * This service addresses the critical "Canvas is already in use" errors that can occur
 * with Chart.js when canvas elements are reused, particularly during mode switching
 * or when charts need to be recreated during emergency operations.
 * 
 * Features:
 * - Centralized management of all Chart.js instances
 * - Canvas element regeneration to prevent reuse errors
 * - Memory leak prevention through proper cleanup
 * - Support for resilience framework integration
 * - Automatic cleanup during page navigation
 * - Integration with FireEMS Core framework when available
 * 
 * Version: 1.1.0
 */
window.FireEMS = window.FireEMS || {};

FireEMS.ChartManager = (function() {
  // Store all chart instances with metadata
  const _charts = {};
  
  // Configuration
  const _config = {
    debug: false,
    retainCanvasAttributes: true,
    preserveDataAttributes: true,
    autoRegisterWithCore: true
  };
  
  /**
   * Log debug messages when debug mode is enabled
   */
  function _log(message, data = null) {
    if (_config.debug) {
      if (data) {
        console.log(`[ChartManager] ${message}`, data);
      } else {
        console.log(`[ChartManager] ${message}`);
      }
    }
  }
  
  /**
   * Create or update a Chart.js instance with enhanced error prevention
   * 
   * @param {string} id - Canvas element ID
   * @param {string} type - Chart type
   * @param {Object} data - Chart data
   * @param {Object} options - Chart options
   * @returns {Chart} Chart instance
   */
  function createChart(id, type, data, options) {
    _log(`Creating chart '${id}' of type '${type}'`);
    
    // Clean up existing chart if it exists
    destroyChart(id);
    
    // Get canvas element
    let canvas = document.getElementById(id);
    if (!canvas) {
      console.error(`Canvas with ID ${id} not found`);
      return null;
    }
    
    try {
      // Store original dimensions and attributes
      const originalWidth = canvas.width || canvas.clientWidth;
      const originalHeight = canvas.height || canvas.clientHeight;
      const originalAttributes = {};
      
      // If configured to retain attributes, collect them
      if (_config.retainCanvasAttributes) {
        for (let i = 0; i < canvas.attributes.length; i++) {
          const attr = canvas.attributes[i];
          if (attr.name !== 'id' && attr.name !== 'width' && attr.name !== 'height') {
            originalAttributes[attr.name] = attr.value;
          }
        }
      }
      
      // Collect data attributes if configured
      const dataAttributes = {};
      if (_config.preserveDataAttributes) {
        for (let i = 0; i < canvas.attributes.length; i++) {
          const attr = canvas.attributes[i];
          if (attr.name.startsWith('data-')) {
            dataAttributes[attr.name] = attr.value;
          }
        }
      }
      
      // Create a fresh canvas to prevent reuse issues
      const parent = canvas.parentNode;
      const newCanvas = document.createElement('canvas');
      
      // Set basic properties
      newCanvas.id = id;
      newCanvas.width = originalWidth || 300;
      newCanvas.height = originalHeight || 150;
      
      // Copy class name
      if (canvas.className) {
        newCanvas.className = canvas.className;
      }
      
      // Apply saved attributes
      if (_config.retainCanvasAttributes) {
        Object.keys(originalAttributes).forEach(attrName => {
          newCanvas.setAttribute(attrName, originalAttributes[attrName]);
        });
      }
      
      // Apply data attributes
      if (_config.preserveDataAttributes) {
        Object.keys(dataAttributes).forEach(attrName => {
          newCanvas.setAttribute(attrName, dataAttributes[attrName]);
        });
      }
      
      // Add a timestamp marker for debugging
      newCanvas.setAttribute('data-chart-created', new Date().toISOString());
      
      // Replace old canvas with new one
      if (parent) {
        parent.replaceChild(newCanvas, canvas);
        canvas = newCanvas;
      } else {
        console.warn(`Canvas ${id} has no parent, creating chart on original canvas`);
      }
      
      // Make sure we have the Chart class available
      if (typeof Chart === 'undefined') {
        console.error('Chart.js library not found. Ensure it is loaded before using ChartManager.');
        return null;
      }
      
      // Create new chart with error handling
      _charts[id] = {
        instance: new Chart(canvas, {
          type: type,
          data: JSON.parse(JSON.stringify(data)), // Deep copy to prevent reference issues
          options: options
        }),
        metadata: {
          type: type,
          created: new Date(),
          lastUpdated: new Date()
        }
      };
      
      _log(`Chart '${id}' created successfully`);
      return _charts[id].instance;
      
    } catch (error) {
      console.error(`Error creating chart '${id}':`, error);
      
      // Emergency fallback - try to create on plain canvas with minimal config
      try {
        _log(`Attempting fallback creation for '${id}'`);
        
        // Create a completely new canvas element
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.id = `${id}_fallback`;
        fallbackCanvas.width = 300;
        fallbackCanvas.height = 150;
        fallbackCanvas.style.width = '100%';
        fallbackCanvas.style.height = 'auto';
        
        // Add to DOM near the original if possible
        const parent = canvas.parentNode;
        if (parent) {
          parent.appendChild(fallbackCanvas);
          
          // Try simpler chart creation
          const minimalOptions = {
            responsive: true,
            maintainAspectRatio: true
          };
          
          _charts[id] = {
            instance: new Chart(fallbackCanvas, {
              type: type,
              data: data,
              options: minimalOptions
            }),
            metadata: {
              type: type,
              created: new Date(),
              lastUpdated: new Date(),
              isFallback: true
            }
          };
          
          console.warn(`Created fallback chart for '${id}'`);
          return _charts[id].instance;
        }
      } catch (fallbackError) {
        console.error(`Fallback chart creation also failed:`, fallbackError);
        return null;
      }
    }
  }

  /**
   * Update an existing chart without recreating it
   * 
   * @param {string} id - Canvas element ID
   * @param {Object} data - New chart data
   * @param {Object} options - New chart options (optional)
   * @returns {Chart} Updated chart instance
   */
  function updateChart(id, data, options = null) {
    _log(`Updating chart '${id}'`);
    
    if (!_charts[id] || !_charts[id].instance) {
      console.warn(`Chart '${id}' doesn't exist, creating it instead`);
      return null; // Can't update a non-existent chart
    }
    
    try {
      const chart = _charts[id].instance;
      
      // Update data property by property to maintain reactivity
      Object.keys(data).forEach(key => {
        chart.data[key] = data[key];
      });
      
      // Update options if provided
      if (options) {
        chart.options = {...chart.options, ...options};
      }
      
      // Update metadata
      _charts[id].metadata.lastUpdated = new Date();
      
      // Apply changes
      chart.update();
      
      _log(`Chart '${id}' updated successfully`);
      return chart;
      
    } catch (error) {
      console.error(`Error updating chart '${id}':`, error);
      
      // Try to recreate the chart as a fallback
      try {
        _log(`Error in update, attempting to recreate chart '${id}'`);
        const chartType = _charts[id].metadata.type;
        return createChart(id, chartType, data, options || _charts[id].instance.options);
      } catch (recreateError) {
        console.error(`Failed to recreate chart after update error:`, recreateError);
        return null;
      }
    }
  }

  /**
   * Destroy a specific chart instance with enhanced cleanup
   * 
   * @param {string} id - Canvas element ID
   * @returns {boolean} Whether the operation was successful
   */
  function destroyChart(id) {
    _log(`Destroying chart '${id}'`);
    
    if (!_charts[id]) {
      return false; // Nothing to destroy
    }
    
    try {
      // Get the chart instance
      const chart = _charts[id].instance;
      
      // Check if it's a valid Chart.js instance
      if (chart && typeof chart.destroy === 'function') {
        // Call Chart.js destroy method
        chart.destroy();
        
        // Remove from our registry
        delete _charts[id];
        
        _log(`Chart '${id}' destroyed successfully`);
        return true;
      } else {
        _log(`No valid Chart.js instance found for '${id}'`);
        
        // Clean up our registry anyway
        delete _charts[id];
        return false;
      }
      
    } catch (error) {
      console.error(`Error destroying chart '${id}':`, error);
      
      // Force cleanup even if destruction fails
      delete _charts[id];
      
      // Try to clean up the canvas
      try {
        const canvas = document.getElementById(id);
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext('2d');
          if (ctx && typeof ctx.clearRect === 'function') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            _log(`Cleared canvas for '${id}'`);
          }
        }
      } catch (canvasError) {
        console.warn(`Error clearing canvas for '${id}':`, canvasError);
      }
      
      return false;
    }
  }

  /**
   * Destroy all chart instances with complete cleanup
   * 
   * @returns {number} Number of charts destroyed
   */
  function destroyAllCharts() {
    _log(`Destroying all charts`);
    
    let count = 0;
    const chartIds = Object.keys(_charts);
    
    chartIds.forEach(id => {
      if (destroyChart(id)) {
        count++;
      }
    });
    
    _log(`Destroyed ${count} charts`);
    return count;
  }

  /**
   * Get a chart instance
   * 
   * @param {string} id - Canvas element ID
   * @returns {Chart} Chart instance or null if not found
   */
  function getChart(id) {
    return _charts[id] ? _charts[id].instance : null;
  }

  /**
   * Get all chart instances
   * 
   * @returns {Object} Object with chart instances as values
   */
  function getAllCharts() {
    const result = {};
    Object.keys(_charts).forEach(id => {
      result[id] = _charts[id].instance;
    });
    return result;
  }
  
  /**
   * Get metadata for a specific chart
   * 
   * @param {string} id - Canvas element ID
   * @returns {Object} Chart metadata or null if not found
   */
  function getChartMetadata(id) {
    return _charts[id] ? _charts[id].metadata : null;
  }
  
  /**
   * Configure the Chart Manager
   * 
   * @param {Object} config - Configuration options
   * @returns {Object} Current configuration
   */
  function configure(config = {}) {
    Object.assign(_config, config);
    _log(`Configuration updated`, _config);
    return {..._config};
  }
  
  /**
   * Check if a chart with the given ID exists
   * 
   * @param {string} id - Canvas element ID
   * @returns {boolean} Whether the chart exists
   */
  function chartExists(id) {
    return !!_charts[id];
  }
  
  /**
   * Register this service with FireEMS Core if available
   */
  function registerWithCore() {
    if (window.FireEMS && window.FireEMS.Core && typeof window.FireEMS.Core.register === 'function') {
      window.FireEMS.Core.register('ChartManager', FireEMS.ChartManager);
      _log('Registered with FireEMS Core');
    }
  }
  
  /**
   * Initialize the Chart Manager
   */
  function init() {
    _log('Initializing ChartManager');
    
    // Setup cleanup on page unload
    window.addEventListener('beforeunload', destroyAllCharts);
    
    // Listen for emergency mode activation if resilience framework is available
    if (window.FireEMS && window.FireEMS.Core) {
      window.FireEMS.Core.addEventListener('mode:changed', function(event) {
        if (event.detail.mode === 'emergency') {
          _log('Emergency mode detected, performing chart cleanup');
          destroyAllCharts();
        }
      });
    }
    
    // Auto-register with Core if configured
    if (_config.autoRegisterWithCore) {
      setTimeout(registerWithCore, 0);
    }
    
    return true;
  }

  // Initialize the service
  init();

  // Public API
  return {
    create: createChart,
    update: updateChart,
    destroy: destroyChart,
    destroyAll: destroyAllCharts,
    get: getChart,
    getAll: getAllCharts,
    exists: chartExists,
    getMetadata: getChartMetadata,
    configure: configure,
    registerWithCore: registerWithCore
  };
})();