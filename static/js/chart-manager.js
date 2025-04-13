/**
 * FireEMS.ai Chart Manager
 * 
 * This script handles all aspects of Chart.js integration:
 * - Loading the library with fallbacks using FireEMS.ScriptLoader
 * - Common chart configuration
 * - Data utilities for charts
 * - Resilience mechanisms for charts
 *
 * This consolidates functionality previously spread across multiple files
 * to eliminate conflicts and race conditions.
 */

// Create namespace if not already defined
window.FireEMS = window.FireEMS || {};
window.FireEMS.Charts = window.FireEMS.Charts || {};

// Immediately initialize the Chart Manager
(function() {
  'use strict';
  
  // Track loading state
  let chartJsLoading = false;
  let chartJsLoaded = false;
  let loadingPromise = null;
  let readyCallbacks = [];

  /**
   * Chart manager public API
   */
  const ChartManager = {
    /**
     * Load Chart.js with automatic fallbacks and retry logic using FireEMS.ScriptLoader.
     * Returns a promise that resolves when Chart.js is ready.
     */
    loadChartJs: function() {
      console.log('📊 Chart Manager: loadChartJs() called');
      
      // If Chart.js is already loaded, return immediately
      if (typeof Chart !== 'undefined' && Chart.defaults) {
        console.log('📊 Chart Manager: Chart.js already available');
        chartJsLoaded = true;
        return Promise.resolve(Chart);
      }
      
      // Return existing promise if already loading
      if (loadingPromise) {
        console.log('📊 Chart Manager: Using existing loading promise');
        return loadingPromise;
      }
      
      // Check if ScriptLoader is available
      if (!window.FireEMS || !window.FireEMS.ScriptLoader) {
        console.error('📊 Chart Manager: FireEMS.ScriptLoader not available');
        return Promise.reject(new Error('FireEMS.ScriptLoader not available'));
      }
      
      // Create new loading promise using the centralized ScriptLoader
      chartJsLoading = true;
      loadingPromise = FireEMS.ScriptLoader.loadScript({ library: 'chart.js' })
        .then(() => {
          // Verify Chart.js is properly loaded
          if (typeof Chart !== 'undefined' && Chart.defaults) {
            console.log('📊 Chart Manager: Successfully loaded Chart.js');
            chartJsLoaded = true;
            chartJsLoading = false;
            
            // Notify all waiting callbacks
            readyCallbacks.forEach(callback => callback(Chart));
            readyCallbacks = [];
            
            // Dispatch global event
            document.dispatchEvent(new CustomEvent('chartjs:ready', { 
              detail: { chart: Chart } 
            }));
            
            return Chart;
          } else {
            throw new Error('Chart.js failed to initialize properly');
          }
        })
        .catch(error => {
          console.error('📊 Chart Manager: All loading attempts failed', error);
          chartJsLoading = false;
          
          // Notify callbacks with null to indicate failure
          readyCallbacks.forEach(callback => callback(null));
          readyCallbacks = [];
          
          // Return null instead of rejecting to prevent uncaught promise errors
          return null;
        });
      
      return loadingPromise;
    },
    
    /**
     * Register a callback to be executed when Chart.js is ready
     */
    onChartJsReady: function(callback) {
      if (typeof callback !== 'function') return;
      
      if (chartJsLoaded && typeof Chart !== 'undefined') {
        // If already loaded, call immediately
        callback(Chart);
      } else {
        // Otherwise, add to callbacks list
        readyCallbacks.push(callback);
        
        // Start loading if not already loading
        if (!chartJsLoading) {
          this.loadChartJs();
        }
      }
    },
    
    /**
     * Check if Chart.js is currently available
     */
    isChartJsAvailable: function() {
      return typeof Chart !== 'undefined' && !!Chart.defaults;
    },
    
    /**
     * Create a chart with standard configuration
     */
    createChart: function(canvasId, type, data, options = {}) {
      return this.loadChartJs().then(Chart => {
        if (!Chart) {
          console.error(`📊 Chart Manager: Cannot create chart - Chart.js failed to load`);
          return null;
        }
        
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
          console.error(`📊 Chart Manager: Canvas element #${canvasId} not found`);
          return null;
        }
        
        // Apply default options for this chart type
        const defaultOptions = this._getDefaultOptions(type);
        const mergedOptions = this._mergeOptions(defaultOptions, options);
        
        // Create and return the chart
        return new Chart(canvas.getContext('2d'), {
          type: type,
          data: data,
          options: mergedOptions
        });
      });
    },
    
    /**
     * Get default options for specific chart type
     * @private
     */
    _getDefaultOptions: function(type) {
      // Common options for all chart types
      const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            enabled: true
          }
        }
      };
      
      // Type-specific options
      const typeOptions = {
        bar: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        },
        line: {
          tension: 0.3,
          borderWidth: 2
        },
        pie: {
          cutout: '10%'
        },
        doughnut: {
          cutout: '50%'
        }
      };
      
      return this._mergeOptions(commonOptions, typeOptions[type] || {});
    },
    
    /**
     * Merge options objects
     * @private
     */
    _mergeOptions: function(defaults, custom) {
      return { ...defaults, ...custom };
    }
  };
  
  // Expose the Chart Manager to the global scope
  window.FireEMS.Charts = ChartManager;
  
  // Backward compatibility
  window.ensureChartJsLoaded = function() {
    return ChartManager.loadChartJs();
  };
  
  /**
   * Initialize as soon as the window or document is ready
   */
  function initialize() {
    console.log('📊 Chart Manager: Initializing');
    
    // Only preload in emergency mode to avoid conflicts
    const isEmergencyMode = window.location.search.includes('emergency');
    
    if (isEmergencyMode) {
      console.log('📊 Chart Manager: Emergency mode detected, preloading Chart.js');
      ChartManager.loadChartJs();
    } else {
      console.log('📊 Chart Manager: Normal mode, waiting for on-demand loading');
    }
    
    // Add visible indicator in emergency or debug mode
    if (isEmergencyMode || window.location.search.includes('debug')) {
      addVisualIndicator();
    }
  }
  
  function addVisualIndicator() {
    if (document.body) {
      const indicator = document.createElement('div');
      indicator.style.cssText = "position: fixed; bottom: 0; left: 0; background: #2196f3; color: white; " +
                               "padding: 4px 8px; font-size: 11px; z-index: 9999; border-top-right-radius: 4px;";
      indicator.textContent = "📊 Chart Manager Active";
      document.body.appendChild(indicator);
    } else {
      setTimeout(addVisualIndicator, 100);
    }
  }
  
  // Initialize as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();