/**
 * Data Formatter Field Mapping Fix (V2)
 * Resolves issues with the React-based field mapping interface
 */

(function() {
  // Logger function that works with or without the appendLog global
  function safeLog(message, type) {
    console.log(`[FieldMappingFix] ${message}`);
    
    // Use appendLog if available, otherwise just console log
    if (window.appendLog && typeof window.appendLog === 'function') {
      window.appendLog(message, type || 'info');
    }
  }

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
      reactComponentPath: '/static/js/react-data-formatter/dist/data-formatter.js'
    },

    // Initialize the fix
    init: function() {
      console.log('[FieldMappingFix] Initializing field mapping fix...');
      
      if (this.state.initialized) {
        console.log('[FieldMappingFix] Already initialized, skipping');
        return;
      }
      
      // Set initialization flag
      this.state.initialized = true;
      
      // Set debug mode if URL parameter present
      this.state.debugMode = new URLSearchParams(window.location.search).has('debug_formatter');
      
      // Directly load the React component file
      this.loadReactComponent();
      
      // Patch the map fields button click handler
      this.patchMapFieldsButton();
      
      // Patch showFormatterPanels
      this.patchShowFormatterPanels();
      
      // Define improved initializeReactComponent function
      this.createInitializeReactComponent();
      
      console.log('[FieldMappingFix] Initialization complete');
    },

    // Load the React component directly
    loadReactComponent: function() {
      const script = document.createElement('script');
      script.src = this.config.reactComponentPath;
      script.onload = () => {
        console.log('[FieldMappingFix] React component loaded successfully');
      };
      script.onerror = () => {
        console.error('[FieldMappingFix] Failed to load React component');
      };
      document.head.appendChild(script);
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
              console.error('[FieldMappingFix] Error unmounting React component:', error);
            }
          }
        }
        
        // Log the action
        safeLog('Field mapping completed. Review the transformed data in the output preview.');
        
        // Call original if it exists and is a function
        if (originalShowPanels && typeof originalShowPanels === 'function') {
          try {
            originalShowPanels();
          } catch (error) {
            console.error('[FieldMappingFix] Error calling original showFormatterPanels:', error);
          }
        }
      };
    },

    // Patch the map fields button for reliability
    patchMapFieldsButton: function() {
      const self = this;
      
      // Run immediately if document is already loaded
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        attachHandler();
      } else {
        // Otherwise wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', attachHandler);
      }
      
      function attachHandler() {
        const mapFieldsBtn = document.querySelector(self.config.mapButtonSelector);
        
        if (!mapFieldsBtn) {
          console.error('[FieldMappingFix] Map fields button not found!');
          return;
        }
        
        console.log('[FieldMappingFix] Found map fields button:', mapFieldsBtn);
        
        // Create new handler - don't replace existing one
        mapFieldsBtn.addEventListener('click', function(event) {
          console.log('[FieldMappingFix] Map fields button clicked');
          
          // Validate required data is available
          if (!window.formatterState || !window.formatterState.fileId) {
            safeLog('Please upload a file first.', 'error');
            return;
          }
          
          if (!window.formatterState.selectedTool) {
            safeLog('Please select a target tool first.', 'error');
            return;
          }
          
          if (!window.formatterState.sourceColumns || window.formatterState.sourceColumns.length === 0) {
            safeLog('No columns detected in the file.', 'error');
            return;
          }
          
          // Get the column mapping container
          const columnMappingContainer = document.querySelector(self.config.containerSelector);
          
          if (!columnMappingContainer) {
            console.error('[FieldMappingFix] Column mapping container not found!');
            safeLog('Error: Column mapping container not found.', 'error');
            return;
          }
          
          console.log('[FieldMappingFix] Found column mapping container:', columnMappingContainer);
          
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
            }, 100); // Small delay to ensure DOM is updated
          } else {
            console.error('[FieldMappingFix] initializeReactComponent function not found!');
            safeLog('Error: Could not initialize field mapping interface.', 'error');
            
            // Create the function if it doesn't exist
            self.createInitializeReactComponent();
            setTimeout(() => {
              window.initializeReactComponent();
            }, 200);
          }
        });
        
        console.log('[FieldMappingFix] Map fields button handler attached');
      }
    },

    // Create improved initializeReactComponent function
    createInitializeReactComponent: function() {
      const self = this;
      
      window.initializeReactComponent = function() {
        console.log('[FieldMappingFix] Initializing React component');
        
        // Get the column mapping container
        const columnMappingContainer = document.querySelector(self.config.containerSelector);
        
        if (!columnMappingContainer || columnMappingContainer.style.display === 'none') {
          console.error('[FieldMappingFix] Column mapping container not found or hidden');
          return false;
        }
        
        console.log('[FieldMappingFix] Column mapping container found:', columnMappingContainer);
        
        // Check if React and DataFormatterUI are loaded
        if (!window.React || !window.ReactDOM || !window.DataFormatterUI) {
          console.error('[FieldMappingFix] Required libraries not loaded:',
            { React: !!window.React, ReactDOM: !!window.ReactDOM, DataFormatterUI: !!window.DataFormatterUI });
          
          // Show error message
          columnMappingContainer.innerHTML = `
            <div class="error-container" style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
              <h3>Error Loading Libraries</h3>
              <p>Could not load required JavaScript libraries for field mapping.</p>
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
        
        console.log('[FieldMappingFix] Component data:', {
          sourceColumnsCount: componentData.sourceColumns.length,
          sampleDataCount: componentData.sampleData.length,
          selectedTool: componentData.selectedTool,
          fileId: componentData.fileId
        });
        
        // Define callback for when mapping is complete
        const onMappingComplete = function(mappings, processingMetadata) {
          console.log('[FieldMappingFix] Mapping complete. Received mappings:', mappings);
          
          // Store properly formatted mappings in global state
          if (window.formatterState) {
            window.formatterState.mappings = mappings;
          }
          
          // Show loading state in output preview
          const outputPreview = document.getElementById('output-preview');
          if (outputPreview) {
            outputPreview.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Transforming data...</p></div>';
          }
          
          // Log the mapping completion
          safeLog(`Field mapping completed. ${Object.keys(mappings).length} fields mapped.`);
          
          // Return to the formatter panels
          window.showFormatterPanels();
        };
        
        // Mount the React component
        try {
          console.log('[FieldMappingFix] Attempting to mount React component...');
          
          // Unmount first if already mounted to avoid React errors
          if (self.state.reactMounted && typeof window.DataFormatterUI.unmount === 'function') {
            window.DataFormatterUI.unmount(columnMappingContainer);
          }
          
          // Mount the component
          window.DataFormatterUI.mount(columnMappingContainer, componentData, onMappingComplete);
          self.state.reactMounted = true;
          
          console.log('[FieldMappingFix] React component mounted successfully');
          return true;
        } catch (error) {
          console.error('[FieldMappingFix] Error mounting DataFormatterUI:', error);
          
          columnMappingContainer.innerHTML = `
            <div class="error-container" style="padding: 20px; background: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
              <h3>Error Loading Field Mapping Interface</h3>
              <p>${error.message}</p>
              <p>Technical details: ${error.stack || 'No stack trace available'}</p>
              <button class="primary-btn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;" onclick="window.showFormatterPanels()">Return to Formatter</button>
            </div>
          `;
          
          safeLog(`Error: Failed to initialize mapping interface - ${error.message}`, 'error');
          
          return false;
        }
      };
    }
  };

  // Initialize the fix
  DataFormatterFieldMappingFix.init();

  // Expose the DataFormatterFieldMappingFix object globally
  window.DataFormatterFieldMappingFix = DataFormatterFieldMappingFix;
})();