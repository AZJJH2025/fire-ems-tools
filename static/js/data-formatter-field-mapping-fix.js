/**
 * Data Formatter Field Mapping Fix
 * Resolves issues with the React-based field mapping interface that appears when clicking "Map Fields"
 * 
 * This script resolves several potential issues:
 * 1. React component mounting/unmounting issues
 * 2. Missing required dependencies for the field mapping interface
 * 3. Incorrect data passing between components
 * 4. Improper display toggle handling
 */

(function() {
  // Create a robust initialization system
  const DataFormatterFieldMappingFix = {
    // Track initialization state
    state: {
      initialized: false,
      reactMounted: false,
      scriptLoadAttempts: 0,
      debugMode: false,
      isReactLoading: false
    },

    // Configuration
    config: {
      containerSelector: '#column-mapping-container',
      mapButtonSelector: '#map-fields-btn',
      requiredGlobals: ['React', 'ReactDOM', 'DataFormatterUI', 'MaterialUI'],
      fallbackUrls: {
        'React': [
          '/static/js/react.production.min.js',
          'https://unpkg.com/react@17/umd/react.production.min.js'
        ],
        'ReactDOM': [
          '/static/js/react-dom.production.min.js',
          'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js'
        ],
        'MaterialUI': [
          '/static/js/material-ui.production.min.js',
          'https://unpkg.com/@material-ui/core@4.12.4/umd/material-ui.production.min.js'
        ],
        'ReactBeautifulDnD': [
          '/static/js/react-beautiful-dnd.min.js',
          'https://unpkg.com/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js'
        ]
      }
    },

    // Initialize the fix
    init: function() {
      console.log('[DataFormatterFieldMappingFix] Initializing...');
      
      if (this.state.initialized) {
        console.log('[DataFormatterFieldMappingFix] Already initialized, skipping');
        return;
      }
      
      // Set initialization flag
      this.state.initialized = true;
      
      // Set debug mode if URL parameter present
      this.state.debugMode = new URLSearchParams(window.location.search).has('debug_formatter');
      
      // Wrap window.showFormatterPanels to ensure it's reliable
      this.patchShowFormatterPanels();
      
      // Patch the map fields button click handler
      this.patchMapFieldsButton();
      
      // Create better initializeReactComponent function
      this.createInitializeReactComponent();
      
      // Ensure we have all required dependencies
      this.checkDependencies();
      
      console.log('[DataFormatterFieldMappingFix] Initialization complete');
    },

    // Patch the showFormatterPanels function for reliability
    patchShowFormatterPanels: function() {
      const originalShowPanels = window.showFormatterPanels;
      
      window.showFormatterPanels = function() {
        // Show formatter panels
        const formatterPanels = document.querySelectorAll('.formatter-panel');
        formatterPanels.forEach(panel => {
          panel.style.display = 'block';
        });
        
        // Hide mapping container
        const mappingContainer = document.getElementById('column-mapping-container');
        if (mappingContainer) {
          mappingContainer.style.display = 'none';
          
          // Properly unmount React component if it was mounted
          if (window.DataFormatterUI && typeof window.DataFormatterUI.unmount === 'function') {
            try {
              window.DataFormatterUI.unmount(mappingContainer);
              DataFormatterFieldMappingFix.state.reactMounted = false;
            } catch (error) {
              console.error('[DataFormatterFieldMappingFix] Error unmounting React component:', error);
            }
          }
        }
        
        // Log the action
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog('Field mapping completed. Review the transformed data in the output preview.');
        }
        
        // Call original if it exists and is a function
        if (originalShowPanels && typeof originalShowPanels === 'function') {
          try {
            originalShowPanels();
          } catch (error) {
            console.error('[DataFormatterFieldMappingFix] Error calling original showFormatterPanels:', error);
          }
        }
      };
    },

    // Patch the map fields button for reliability
    patchMapFieldsButton: function() {
      const self = this;
      document.addEventListener('DOMContentLoaded', function() {
        const mapFieldsBtn = document.querySelector(self.config.mapButtonSelector);
        
        if (!mapFieldsBtn) {
          console.error('[DataFormatterFieldMappingFix] Map fields button not found!');
          return;
        }
        
        // Store original click handler if it exists
        const originalClick = mapFieldsBtn.onclick;
        
        // Add new click handler
        mapFieldsBtn.onclick = function(event) {
          console.log('[DataFormatterFieldMappingFix] Map fields button clicked');
          
          // Validate required data is available
          if (!window.formatterState || !window.formatterState.fileId) {
            window.appendLog('Please upload a file first.', 'error');
            return;
          }
          
          if (!window.formatterState.selectedTool) {
            window.appendLog('Please select a target tool first.', 'error');
            return;
          }
          
          if (!window.formatterState.sourceColumns || window.formatterState.sourceColumns.length === 0) {
            window.appendLog('No columns detected in the file.', 'error');
            return;
          }
          
          // Get the column mapping container
          const columnMappingContainer = document.querySelector(self.config.containerSelector);
          
          if (!columnMappingContainer) {
            console.error('[DataFormatterFieldMappingFix] Column mapping container not found!');
            window.appendLog('Error: Column mapping container not found.', 'error');
            return;
          }
          
          // Show column mapping container
          columnMappingContainer.style.display = 'block';
          
          // Hide the formatter panels
          document.querySelectorAll('.formatter-panel').forEach(panel => {
            panel.style.display = 'none';
          });
          
          // Clear any previous content
          columnMappingContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading field mapping interface...</p></div>';
          
          // Initialize the React component
          if (typeof window.initializeReactComponent === 'function') {
            setTimeout(() => {
              window.initializeReactComponent();
            }, 50); // Small delay to ensure DOM is updated
          } else {
            console.error('[DataFormatterFieldMappingFix] initializeReactComponent function not found!');
            window.appendLog('Error: Could not initialize field mapping interface.', 'error');
            
            // Create the function if it doesn't exist
            self.createInitializeReactComponent();
            setTimeout(() => {
              window.initializeReactComponent();
            }, 100);
          }
          
          // Only call original if it exists and isn't our new handler
          if (originalClick && originalClick !== mapFieldsBtn.onclick) {
            try {
              originalClick.call(this, event);
            } catch (error) {
              console.error('[DataFormatterFieldMappingFix] Error calling original map fields click handler:', error);
            }
          }
        };
        
        console.log('[DataFormatterFieldMappingFix] Map fields button patched');
      });
    },

    // Create improved initializeReactComponent function
    createInitializeReactComponent: function() {
      const self = this;
      
      window.initializeReactComponent = function() {
        console.log('[DataFormatterFieldMappingFix] Initializing React component');
        
        // Get the column mapping container
        const columnMappingContainer = document.querySelector(self.config.containerSelector);
        
        if (!columnMappingContainer || columnMappingContainer.style.display === 'none') {
          console.error('[DataFormatterFieldMappingFix] Column mapping container not found or hidden');
          return false;
        }
        
        // Check if all required libraries are loaded
        const missingLibraries = self.config.requiredGlobals.filter(name => !window[name]);
        
        if (missingLibraries.length > 0) {
          console.error('[DataFormatterFieldMappingFix] Missing required libraries:', missingLibraries);
          
          // Avoid loading libraries repeatedly if already in progress
          if (self.state.isReactLoading) {
            console.log('[DataFormatterFieldMappingFix] Library loading already in progress, waiting...');
            return false;
          }
          
          // Try to load missing libraries
          if (self.state.scriptLoadAttempts < 2) {
            self.state.scriptLoadAttempts++;
            self.state.isReactLoading = true;
            
            self.loadMissingDependencies(missingLibraries, function() {
              // Reset loading flag
              self.state.isReactLoading = false;
              
              // Retry initialization after loading libraries
              window.initializeReactComponent();
            });
            return false;
          }
          
          // Show error message if we've already tried to load libraries
          columnMappingContainer.innerHTML = `
            <div class="error-container" style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
              <h3>Error Loading Libraries</h3>
              <p>Could not load required JavaScript libraries: ${missingLibraries.join(', ')}</p>
              <p>Please check your network connection and try refreshing the page.</p>
              <button class="primary-btn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;" onclick="window.showFormatterPanels()">Return to Formatter</button>
            </div>
          `;
          return false;
        }
        
        // Validate we have all necessary data
        if (!window.formatterState || !window.formatterState.sourceColumns || window.formatterState.sourceColumns.length === 0) {
          columnMappingContainer.innerHTML = `
            <div class="error-container" style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
              <h3>Error: Missing Source Data</h3>
              <p>No columns were detected in the uploaded file. Please check the file format and try again.</p>
              <button class="primary-btn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;" onclick="window.showFormatterPanels()">Return to Formatter</button>
            </div>
          `;
          return false;
        }
        
        if (!window.formatterState.selectedTool) {
          columnMappingContainer.innerHTML = `
            <div class="error-container" style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
              <h3>Error: No Tool Selected</h3>
              <p>Please select a target tool before mapping columns.</p>
              <button class="primary-btn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;" onclick="window.showFormatterPanels()">Return to Formatter</button>
            </div>
          `;
          return false;
        }
        
        // Pass data to React component
        const componentData = {
          sourceColumns: window.formatterState.sourceColumns || [],
          sampleData: window.formatterState.sampleData || [],
          selectedTool: window.formatterState.selectedTool,
          fileId: window.formatterState.fileId
        };
        
        // Define callback for when mapping is complete
        const onMappingComplete = function(mappings, processingMetadata) {
          console.log('[DataFormatterFieldMappingFix] Mapping complete. Received mappings:', mappings);
          
          // The mappings should already be formatted correctly by DataFormatterUI
          let formattedMappings = mappings;
          
          // Check if mappings need to be formatted for API
          if (window.DataFormatter && window.DataFormatter.api && 
              typeof window.DataFormatter.api.formatMappingsForAPI === 'function') {
            formattedMappings = window.DataFormatter.api.formatMappingsForAPI(mappings);
          }
          
          // Store properly formatted mappings in global state
          if (window.FormatterStateManager && typeof window.FormatterStateManager.update === 'function') {
            window.FormatterStateManager.update({
              mappings: formattedMappings
            });
          } else if (window.formatterState) {
            window.formatterState.mappings = formattedMappings;
          }
          
          // Make sure formatterState is updated
          window.formatterState = window.FormatterStateManager ? 
            window.FormatterStateManager.get() : window.formatterState;
          
          // Show loading state in output preview
          const outputPreview = document.getElementById('output-preview');
          if (outputPreview) {
            outputPreview.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Transforming data...</p></div>';
          }
          
          // Log the mapping completion
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Field mapping completed. ${Object.keys(mappings).length} fields mapped.`);
          }
          
          // Return to the formatter panels
          window.showFormatterPanels();
          
          // If server-side transform function exists and has been patched by integration script
          // it will be called from there
        };
        
        // Mount the React component
        try {
          console.log('[DataFormatterFieldMappingFix] Mounting React component with data:', {
            sourceColumnsCount: componentData.sourceColumns.length,
            sampleDataCount: componentData.sampleData.length,
            selectedTool: componentData.selectedTool,
            fileId: componentData.fileId
          });
          
          // Unmount first if already mounted to avoid React errors
          if (self.state.reactMounted && typeof window.DataFormatterUI.unmount === 'function') {
            window.DataFormatterUI.unmount(columnMappingContainer);
          }
          
          // Mount the component
          window.DataFormatterUI.mount(columnMappingContainer, componentData, onMappingComplete);
          self.state.reactMounted = true;
          
          console.log('[DataFormatterFieldMappingFix] React component mounted successfully');
          return true;
        } catch (error) {
          console.error('[DataFormatterFieldMappingFix] Error mounting DataFormatterUI:', error);
          
          columnMappingContainer.innerHTML = `
            <div class="error-container" style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
              <h3>Error Loading Component</h3>
              <p>${error.message}</p>
              <button class="primary-btn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;" onclick="window.showFormatterPanels()">Return to Formatter</button>
            </div>
          `;
          
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Error: Failed to initialize mapping interface - ${error.message}`, 'error');
          }
          
          return false;
        }
      };
    },

    // Check for required dependencies
    checkDependencies: function() {
      const missingLibraries = this.config.requiredGlobals.filter(name => !window[name]);
      
      if (missingLibraries.length > 0) {
        console.warn('[DataFormatterFieldMappingFix] Missing required libraries:', missingLibraries);
        this.loadMissingDependencies(missingLibraries);
      } else {
        console.log('[DataFormatterFieldMappingFix] All required libraries are loaded');
      }
    },

    // Load missing dependencies
    loadMissingDependencies: function(missingLibraries, callback) {
      console.log('[DataFormatterFieldMappingFix] Loading missing libraries:', missingLibraries);
      
      const promises = [];
      
      missingLibraries.forEach(libName => {
        if (this.config.fallbackUrls[libName]) {
          const promise = this.loadScript(this.config.fallbackUrls[libName][0], {
            fallbackUrls: this.config.fallbackUrls[libName].slice(1)
          });
          promises.push(promise);
        }
      });
      
      // Wait for all scripts to load
      Promise.all(promises)
        .then(() => {
          console.log('[DataFormatterFieldMappingFix] All missing libraries loaded successfully');
          if (callback && typeof callback === 'function') {
            callback();
          }
        })
        .catch(error => {
          console.error('[DataFormatterFieldMappingFix] Error loading libraries:', error);
        });
    },

    // Load a script with fallbacks
    loadScript: function(url, options = {}) {
      // Default options
      const opts = Object.assign({
        async: true,
        fallbackUrls: [],
        timeout: 5000 // 5 second timeout
      }, options);
      
      return new Promise((resolve, reject) => {
        console.log('[DataFormatterFieldMappingFix] Loading script:', url);
        
        const script = document.createElement('script');
        script.src = url;
        script.async = opts.async;
        
        // Set timeout for script loading
        const timeoutId = setTimeout(() => {
          console.warn('[DataFormatterFieldMappingFix] Script load timeout for', url);
          tryNextFallback(0);
        }, opts.timeout);
        
        script.onload = () => {
          clearTimeout(timeoutId);
          console.log('[DataFormatterFieldMappingFix] Successfully loaded:', url);
          resolve(url);
        };
        
        script.onerror = () => {
          clearTimeout(timeoutId);
          console.warn('[DataFormatterFieldMappingFix] Failed to load:', url);
          tryNextFallback(0);
        };
        
        document.head.appendChild(script);
        
        // Function to try fallback URLs
        const tryNextFallback = (index) => {
          if (index >= opts.fallbackUrls.length) {
            reject(new Error(`Failed to load script: ${url}`));
            return;
          }
          
          const fallbackUrl = opts.fallbackUrls[index];
          console.log('[DataFormatterFieldMappingFix] Trying fallback:', fallbackUrl);
          
          const fallbackScript = document.createElement('script');
          fallbackScript.src = fallbackUrl;
          fallbackScript.async = opts.async;
          
          fallbackScript.onload = () => {
            clearTimeout(timeoutId);
            console.log('[DataFormatterFieldMappingFix] Successfully loaded fallback:', fallbackUrl);
            resolve(fallbackUrl);
          };
          
          fallbackScript.onerror = () => {
            console.warn('[DataFormatterFieldMappingFix] Fallback failed:', fallbackUrl);
            tryNextFallback(index + 1);
          };
          
          document.head.appendChild(fallbackScript);
        };
      });
    }
  };

  // Initialize the fix
  DataFormatterFieldMappingFix.init();

  // Expose the DataFormatterFieldMappingFix object globally
  window.DataFormatterFieldMappingFix = DataFormatterFieldMappingFix;
})();