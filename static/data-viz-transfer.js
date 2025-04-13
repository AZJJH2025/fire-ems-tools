/**
 * Data Visualization Transfer Module
 * This module provides a clean, simple interface for transferring data
 * between the Data Formatter and visualization tools.
 * 
 * Version: 1.0.0
 */

(function() {
  // Create a namespace for our module
  window.DataVizTransfer = {
    // Configuration
    config: {
      debug: true,
      version: '1.0.0',
      storage: {
        method: 'localStorage', // 'localStorage' or 'sessionStorage'
        keyPrefix: 'dataviz_'
      }
    },
    
    // Storage utilities
    storage: {
      /**
       * Store data in the configured storage method
       * @param {string} key - The storage key
       * @param {any} data - The data to store
       * @returns {boolean} - Success status
       */
      set: function(key, data) {
        try {
          const storageMethod = window.DataVizTransfer.config.storage.method === 'sessionStorage' 
            ? sessionStorage 
            : localStorage;
          
          const serialized = JSON.stringify(data);
          storageMethod.setItem(key, serialized);
          
          if (window.DataVizTransfer.config.debug) {
            console.log(`[DataVizTransfer] Stored ${serialized.length} bytes with key: ${key}`);
          }
          
          return true;
        } catch (error) {
          console.error('[DataVizTransfer] Error storing data:', error);
          return false;
        }
      },
      
      /**
       * Retrieve data from the configured storage method
       * @param {string} key - The storage key
       * @returns {any|null} - The retrieved data or null if not found
       */
      get: function(key) {
        try {
          const storageMethod = window.DataVizTransfer.config.storage.method === 'sessionStorage' 
            ? sessionStorage 
            : localStorage;
          
          const data = storageMethod.getItem(key);
          if (!data) return null;
          
          const parsed = JSON.parse(data);
          
          if (window.DataVizTransfer.config.debug) {
            console.log(`[DataVizTransfer] Retrieved data with key: ${key}`);
          }
          
          return parsed;
        } catch (error) {
          console.error('[DataVizTransfer] Error retrieving data:', error);
          return null;
        }
      },
      
      /**
       * Remove data from storage
       * @param {string} key - The storage key
       * @returns {boolean} - Success status
       */
      remove: function(key) {
        try {
          const storageMethod = window.DataVizTransfer.config.storage.method === 'sessionStorage' 
            ? sessionStorage 
            : localStorage;
          
          storageMethod.removeItem(key);
          
          if (window.DataVizTransfer.config.debug) {
            console.log(`[DataVizTransfer] Removed data with key: ${key}`);
          }
          
          return true;
        } catch (error) {
          console.error('[DataVizTransfer] Error removing data:', error);
          return false;
        }
      }
    },
    
    // Formatter functions
    formatter: {
      /**
       * Send data from the Data Formatter to a visualization tool
       * @param {Array} data - The formatted data array
       * @param {string} targetTool - The target visualization tool
       * @returns {boolean} - Success status
       */
      sendToTool: function(data, targetTool) {
        try {
          if (!data || !Array.isArray(data)) {
            console.error('[DataVizTransfer] Invalid data format');
            return false;
          }
          
          if (!targetTool) {
            console.error('[DataVizTransfer] Target tool not specified');
            return false;
          }
          
          // Map target tools to their URLs
          const toolUrls = {
            'response-time': '/fire-ems-dashboard',
            'isochrone': '/isochrone-map',
            'isochrone-stations': '/isochrone-map?mode=stations',
            'isochrone-incidents': '/isochrone-map?mode=incidents',
            'call-density': '/call-density-heatmap',
            'incident-logger': '/incident-logger',
            'coverage-gap': '/coverage-gap-finder',
            'station-overview': '/station-overview',
            'fire-map-pro': '/fire-map-pro'
          };
          
          // Get the target URL
          const targetUrl = toolUrls[targetTool];
          if (!targetUrl) {
            console.error(`[DataVizTransfer] Unknown target tool: ${targetTool}`);
            return false;
          }
          
          // Enhance data with metadata
          const enhancedData = data.map(item => {
            const enhanced = { ...item };
            
            // Add source property
            enhanced._source = 'formatter';
            
            // Ensure coordinates are numeric
            if (enhanced.Latitude !== undefined) enhanced.Latitude = parseFloat(enhanced.Latitude);
            if (enhanced.Longitude !== undefined) enhanced.Longitude = parseFloat(enhanced.Longitude);
            
            // Ensure standard field names exist
            if (!enhanced.Unit && enhanced.UnitID) enhanced.Unit = enhanced.UnitID;
            if (!enhanced.Unit && enhanced['Unit ID']) enhanced.Unit = enhanced['Unit ID'];
            if (!enhanced['Incident ID'] && enhanced.RunNo) enhanced['Incident ID'] = enhanced.RunNo;
            if (!enhanced['Incident ID'] && enhanced['Run No']) enhanced['Incident ID'] = enhanced['Run No'];
            
            // Create Date objects for timestamps
            const dateFields = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'];
            dateFields.forEach(field => {
              if (enhanced[field]) {
                try {
                  const date = new Date(enhanced[field]);
                  if (!isNaN(date.getTime())) {
                    enhanced[`${field}_obj`] = date;
                  }
                } catch (e) {
                  console.warn(`[DataVizTransfer] Failed to create Date object for ${field}:`, e);
                }
              }
            });
            
            return enhanced;
          });
          
          // Generate a unique storage key
          const timestamp = Date.now();
          const storageKey = `${window.DataVizTransfer.config.storage.keyPrefix}${timestamp}`;
          
          // Create metadata object
          const metadata = {
            source: 'formatter',
            tool: targetTool,
            timestamp: new Date().toISOString(),
            recordCount: enhancedData.length,
            version: window.DataVizTransfer.config.version
          };
          
          // Store data with metadata
          const storageData = {
            data: enhancedData,
            metadata: metadata
          };
          
          // Store in the configured storage
          const storageSuccess = window.DataVizTransfer.storage.set(storageKey, storageData);
          if (!storageSuccess) {
            console.error('[DataVizTransfer] Failed to store data');
            return false;
          }
          
          // Store diagnostic information
          const diagnosticData = {
            timestamp: timestamp,
            sourceKey: storageKey,
            targetTool: targetTool,
            recordCount: enhancedData.length,
            version: window.DataVizTransfer.config.version
          };
          
          window.DataVizTransfer.storage.set('dataviz_diagnostic', diagnosticData);
          
          // Build the URL with parameters
          const urlParams = new URLSearchParams();
          urlParams.set('dataviz_source', storageKey);
          urlParams.set('dataviz_tool', targetTool);
          urlParams.set('dataviz_count', enhancedData.length);
          urlParams.set('dataviz_ts', timestamp);
          urlParams.set('dataviz_v', window.DataVizTransfer.config.version);
          
          // Navigate to the target tool
          const targetUrlWithParams = `${targetUrl}?${urlParams.toString()}`;
          if (window.DataVizTransfer.config.debug) {
            console.log(`[DataVizTransfer] Navigating to: ${targetUrlWithParams}`);
          }
          
          window.location.href = targetUrlWithParams;
          return true;
        } catch (error) {
          console.error('[DataVizTransfer] Error sending data to tool:', error);
          return false;
        }
      }
    },
    
    // Visualization tool functions
    visualization: {
      /**
       * Check if the current page has data from the Data Formatter
       * @returns {boolean} - Whether data is available
       */
      hasFormatterData: function() {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          return urlParams.has('dataviz_source');
        } catch (error) {
          console.error('[DataVizTransfer] Error checking for formatter data:', error);
          return false;
        }
      },
      
      /**
       * Get data sent from the Data Formatter
       * @returns {Array|null} - The formatted data array or null if not found
       */
      getFormatterData: function() {
        try {
          // Get parameters from URL
          const urlParams = new URLSearchParams(window.location.search);
          const sourceKey = urlParams.get('dataviz_source');
          
          if (!sourceKey) {
            console.error('[DataVizTransfer] No source key found in URL');
            return null;
          }
          
          // Retrieve data from storage
          const storageData = window.DataVizTransfer.storage.get(sourceKey);
          if (!storageData || !storageData.data) {
            console.error('[DataVizTransfer] No data found with key:', sourceKey);
            return null;
          }
          
          if (window.DataVizTransfer.config.debug) {
            console.log(`[DataVizTransfer] Retrieved ${storageData.data.length} records from key: ${sourceKey}`);
            console.log('[DataVizTransfer] Data metadata:', storageData.metadata);
          }
          
          return storageData.data;
        } catch (error) {
          console.error('[DataVizTransfer] Error getting formatter data:', error);
          return null;
        }
      },
      
      /**
       * Get the complete context of data sent from the formatter
       * @returns {Object|null} - The full data context or null if not found
       */
      getFormatterContext: function() {
        try {
          // Get parameters from URL
          const urlParams = new URLSearchParams(window.location.search);
          const sourceKey = urlParams.get('dataviz_source');
          const tool = urlParams.get('dataviz_tool');
          const count = urlParams.get('dataviz_count');
          const timestamp = urlParams.get('dataviz_ts');
          const version = urlParams.get('dataviz_v');
          
          if (!sourceKey) {
            console.error('[DataVizTransfer] No source key found in URL');
            return null;
          }
          
          // Retrieve data from storage
          const storageData = window.DataVizTransfer.storage.get(sourceKey);
          if (!storageData) {
            console.error('[DataVizTransfer] No data found with key:', sourceKey);
            return null;
          }
          
          // Build the context object
          return {
            data: storageData.data,
            metadata: storageData.metadata,
            urlParams: {
              sourceKey: sourceKey,
              tool: tool,
              count: count,
              timestamp: timestamp,
              version: version
            },
            raw: storageData
          };
        } catch (error) {
          console.error('[DataVizTransfer] Error getting formatter context:', error);
          return null;
        }
      }
    }
  };
  
  // Initialize module
  if (window.DataVizTransfer.config.debug) {
    console.log(`[DataVizTransfer] Module initialized. Version: ${window.DataVizTransfer.config.version}`);
  }
})();