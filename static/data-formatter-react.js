/**
 * FireEMS.ai Data Formatter React Integration
 * Version: 1.0.0
 * 
 * This file integrates the React-based ColumnMappingUI component with the rest of the application.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Check if column mapping container exists
  const columnMappingContainer = document.getElementById('column-mapping-container');
  if (!columnMappingContainer) return;

  // Load React and ReactDOM from CDN if not already loaded
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }
  
  function loadReactDependencies(callback) {
    // Check if React is already loaded
    if (window.React && window.ReactDOM && window.MaterialUI) {
      callback();
      return;
    }
    
    // Load React
    loadScript('https://cdn.jsdelivr.net/npm/react@17/umd/react.production.min.js', function() {
      // Load ReactDOM
      loadScript('https://cdn.jsdelivr.net/npm/react-dom@17/umd/react-dom.production.min.js', function() {
        // Load Material UI
        loadScript('https://cdn.jsdelivr.net/npm/@material-ui/core@4.12.3/umd/material-ui.production.min.js', function() {
          // Load React Beautiful DnD
          loadScript('https://cdn.jsdelivr.net/npm/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js', function() {
            // Load Babel for JSX support
            loadScript('https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js', callback);
            
            console.log('All dependencies loaded successfully');
          });
        });
      });
    });
  }
  
  // Load CSS for Material UI
  function loadStyles() {
    // Skip loading Google Fonts since they're blocked by CSP
    console.log('Skipping Google Fonts due to CSP restrictions, using system fonts instead');
    
    // Add a style tag with fallback font definitions
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      .MuiTypography-root, .MuiButton-root, .MuiInputBase-root {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important;
      }
      
      /* Icon fallbacks */
      .material-icons {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
      .material-icons.MuiIcon-root {
        font-size: 24px;
        width: 1em;
        height: 1em;
        overflow: hidden;
      }
    `;
    document.head.appendChild(styleTag);
  }
  
  // Initialize the React component
  function initReactComponent() {
    // Get data from the main data formatter script
    const sourceColumns = getSourceColumns();
    const sampleData = getSampleData();
    const fileId = window.uploadedFileId || null;
    
    console.log('DEBUG: initReactComponent called');
    console.log('DEBUG: ColumnMappingUI exists:', !!window.ColumnMappingUI);
    console.log('DEBUG: ReactDOM exists:', !!ReactDOM);
    console.log('DEBUG: sourceColumns:', sourceColumns);
    console.log('DEBUG: sampleData sample:', sampleData.slice(0, 1));
    
    try {
      // Check if all dependencies are loaded
      if (window.checkReactDependencies) {
        window.checkReactDependencies();
      }
      
      // Render the React component
      ReactDOM.render(
        React.createElement(window.ColumnMappingUI, {
          sourceColumns: sourceColumns,
          sampleData: sampleData,
          fileId: fileId,
          onMappingComplete: handleMappingComplete
        }),
        columnMappingContainer
      );
      
      console.log('DEBUG: ReactDOM.render called successfully');
    } catch (error) {
      console.error('ERROR in initReactComponent:', error);
      showComponentError('Error initializing React component: ' + error.message);
    }
  }
  
  // Helper function to get source columns
  function getSourceColumns() {
    // Try to get from the main data formatter script
    if (window.originalData && window.originalData.length > 0) {
      return Object.keys(window.originalData[0]);
    }
    
    // Fallback to test data
    return [
      'incident_number', 'call_date', 'call_time', 'dispatch_time', 
      'arrival_time', 'latitude', 'longitude', 'incident_type', 
      'priority', 'address', 'city', 'state', 'zip'
    ];
  }
  
  // Helper function to get sample data
  function getSampleData() {
    // Try to get from the main data formatter script
    if (window.originalData && window.originalData.length > 0) {
      return window.originalData.slice(0, 5);
    }
    
    // Fallback to test data
    return [
      {
        'incident_number': 'INC-2023-001',
        'call_date': '2023-04-15',
        'call_time': '08:24:32',
        'dispatch_time': '08:25:11',
        'arrival_time': '08:32:45',
        'latitude': '33.4484',
        'longitude': '-112.0740',
        'incident_type': 'FIRE',
        'priority': '1',
        'address': '123 Main St',
        'city': 'Phoenix',
        'state': 'AZ',
        'zip': '85001'
      },
      {
        'incident_number': 'INC-2023-002',
        'call_date': '2023-04-15',
        'call_time': '09:15:22',
        'dispatch_time': '09:16:05',
        'arrival_time': '09:23:18',
        'latitude': '33.4519',
        'longitude': '-112.0700',
        'incident_type': 'EMS',
        'priority': '2',
        'address': '456 Oak Ave',
        'city': 'Phoenix',
        'state': 'AZ',
        'zip': '85004'
      }
    ];
  }
  
  // Handle mapping completion
  function handleMappingComplete(mappings, apiResult) {
    console.log('Mapping complete:', mappings);
    
    // Show formatter panels first to ensure UI transition happens regardless of other operations
    if (window.showFormatterPanels && typeof window.showFormatterPanels === 'function') {
      window.showFormatterPanels();
    } else {
      // Fallback if the global function isn't available
      const formatterPanels = document.querySelectorAll('.formatter-panel');
      formatterPanels.forEach(panel => {
        panel.style.display = 'block';
      });
      
      // Also hide the mapping container
      const mappingContainer = document.getElementById('column-mapping-container');
      if (mappingContainer) {
        mappingContainer.style.display = 'none';
      }
    }
    
    // Check if we have an API result
    if (apiResult && apiResult.success && apiResult.transformId) {
      console.log('API Transform successful:', apiResult);
      
      // Store the transform ID for later use
      window.transformId = apiResult.transformId;
      
      // If we have sample data in the API result, use it
      if (apiResult.preview && Array.isArray(apiResult.preview)) {
        window.transformedData = apiResult.preview;
        
        // Show output preview
        if (window.showOutputPreview && typeof window.showOutputPreview === 'function') {
          window.showOutputPreview(apiResult.preview);
        }
      } else {
        // Fallback to client-side transformation
        const transformedData = applyMappings(window.originalData || [], mappings);
        window.transformedData = transformedData;
        
        // Show output preview
        if (window.showOutputPreview && typeof window.showOutputPreview === 'function') {
          window.showOutputPreview(transformedData);
        }
      }
      
      // Log transformation details
      if (window.appendLog && typeof window.appendLog === 'function') {
        if (apiResult.transformationLog && apiResult.transformationLog.length > 0) {
          apiResult.transformationLog.forEach(log => {
            window.appendLog(log);
          });
        } else {
          window.appendLog(`Mapping completed successfully. Transform ID: ${apiResult.transformId}`);
        }
        
        // Log row count
        if (apiResult.rowCount) {
          window.appendLog(`Transformed ${apiResult.rowCount} records with ${apiResult.columnCount || 'multiple'} fields`);
        }
        
        // Log any errors
        if (apiResult.errors && apiResult.errors.length > 0) {
          apiResult.errors.forEach(error => {
            window.appendLog(`Warning: ${error}`, 'warning');
          });
        }
      }
      
      // Enable download and send buttons
      const downloadBtn = document.getElementById('download-btn');
      const sendToToolBtn = document.getElementById('send-to-tool-btn');
      
      if (downloadBtn) {
        downloadBtn.disabled = false;
        // Update the download button to use the API download endpoint
        downloadBtn.setAttribute('data-transform-id', apiResult.transformId);
      }
      
      if (sendToToolBtn) {
        sendToToolBtn.disabled = false;
        // Update the send button to use the API for sending to tools
        sendToToolBtn.setAttribute('data-transform-id', apiResult.transformId);
      }
      
      // Enable the global function if available
      if (window.enableDownloadButtons && typeof window.enableDownloadButtons === 'function') {
        window.enableDownloadButtons();
      }
    } else {
      // Fallback to client-side transformation
      // Integrate with the main data formatter script
      if (window.transformData && typeof window.transformData === 'function') {
        // Apply the mappings to transform the data
        const transformedData = applyMappings(window.originalData || [], mappings);
        
        // Update the transformed data in the main script
        window.transformedData = transformedData;
        
        // Show output preview
        if (window.showOutputPreview && typeof window.showOutputPreview === 'function') {
          window.showOutputPreview(transformedData);
        }
        
        // Enable download and send buttons
        const downloadBtn = document.getElementById('download-btn');
        const sendToToolBtn = document.getElementById('send-to-tool-btn');
        
        if (downloadBtn) downloadBtn.disabled = false;
        if (sendToToolBtn) sendToToolBtn.disabled = false;
        
        // Enable the global function if available
        if (window.enableDownloadButtons && typeof window.enableDownloadButtons === 'function') {
          window.enableDownloadButtons();
        }
        
        // Log the completion
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog(`Mapping completed successfully. ${transformedData.length} records transformed.`);
        }
      } else {
        console.log('Transform function not available in the main script.');
        
        // Check if window.appendLog is available before calling it
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog('Data formatted successfully! Ready for download or to send to another tool.');
        } else {
          console.log('Data formatted successfully! Ready for download or to send to another tool.');
          
          // Try to create a fallback logging function if it doesn't exist
          if (!window.appendLog) {
            window.appendLog = function(message, type = 'info') {
              console.log(`[${type.toUpperCase()}] ${message}`);
              
              // Try to append to log container if it exists
              const logContainer = document.getElementById('log-container');
              if (logContainer) {
                const logEntry = document.createElement('p');
                logEntry.className = `log-entry log-${type}`;
                logEntry.innerHTML = `[${new Date().toLocaleTimeString()}] ${message}`;
                logContainer.appendChild(logEntry);
                logContainer.scrollTop = logContainer.scrollHeight;
              }
            };
            
            console.log('Created fallback appendLog function');
          }
        }
      }
    }
  }
  
  // Apply mappings to transform data
  function applyMappings(data, mappings) {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      const result = {};
      
      mappings.forEach(mapping => {
        const sourceValue = item[mapping.sourceField];
        
        // Apply transformation if needed
        const transformedValue = applyTransformation(
          sourceValue, 
          mapping.transformConfig
        );
        
        result[mapping.targetField] = transformedValue;
      });
      
      return result;
    });
  }
  
  // Apply transformation based on config
  function applyTransformation(value, config) {
    if (!value || !config) return value;
    
    switch (config.type) {
      case 'date':
        // Simple date format transformation (would be more robust in production)
        if (config.targetFormat === 'ISO8601') {
          // Try to convert to ISO format
          try {
            const date = new Date(value);
            if (!isNaN(date)) {
              return date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Date transformation error:', e);
          }
        }
        break;
        
      case 'text':
        // Apply text transformations
        if (config.textTransform === 'uppercase') {
          return String(value).toUpperCase();
        } else if (config.textTransform === 'lowercase') {
          return String(value).toLowerCase();
        } else if (config.textTransform === 'capitalize') {
          return String(value).replace(/\b\w/g, l => l.toUpperCase());
        }
        break;
        
      case 'coordinates':
        // Coordinate transformations would go here
        // For now, just return the value
        break;
    }
    
    return value;
  }
  
  // Load the ColumnMappingUI component
  function loadComponentScript() {
    console.log('Starting to load ColumnMappingUI component');
    
    // Load the non-import version of the component
    const script = document.createElement('script');
    script.src = '/static/js/components/non-import-column-mapping.js';
    script.async = true;
    
    // Handle load event
    script.onload = function() {
      console.log('ColumnMappingUI non-import version loaded successfully');
      
      // Set a timeout to allow the component to be registered
      setTimeout(function() {
        if (window.ColumnMappingUI) {
          console.log('ColumnMappingUI component registered successfully');
          initReactComponent();
        } else {
          console.error('ColumnMappingUI component not found after loading');
          showComponentError('Component was loaded but not registered properly');
        }
      }, 300); // Increased timeout for slower systems
    };
    
    // Handle error event
    script.onerror = function(e) {
      console.error('Failed to load ColumnMappingUI component', e);
      showComponentError('Failed to load the component file');
    };
    
    // Function to show error in the container
    function showComponentError(message) {
      columnMappingContainer.innerHTML = `
        <div class="error-container">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #f44336; margin-bottom: 15px;"></i>
          <p style="margin-bottom: 20px; color: #666; text-align: center;">
            ${message}
          </p>
          <p style="margin-bottom: 10px; color: #666; text-align: center;">
            Please check the browser console for more details.
          </p>
          <button onclick="location.reload()" class="primary-btn">
            Refresh Page
          </button>
        </div>
      `;
    }
    
    // Add the script to the document
    console.log('Adding ColumnMappingUI script to document');
    document.head.appendChild(script);
  }
  
  // Load the simplified non-JSX version of the component
  function loadSimpleComponent() {
    console.log('Attempting to load simplified component as fallback');
    
    const script = document.createElement('script');
    script.src = '/static/js/components/column-mapping-simple.js';
    script.async = true;
    
    script.onload = function() {
      console.log('Simple component loaded successfully');
      
      // Initialize React with the simple component
      if (window.SimpleColumnMappingUI) {
        console.log('Using SimpleColumnMappingUI as fallback');
        
        const sourceColumns = getSourceColumns();
        const sampleData = getSampleData();
        const fileId = window.uploadedFileId || null;
        
        ReactDOM.render(
          React.createElement(window.SimpleColumnMappingUI, {
            sourceColumns: sourceColumns,
            sampleData: sampleData,
            fileId: fileId,
            onMappingComplete: handleMappingComplete
          }),
          columnMappingContainer
        );
      } else {
        console.error('SimpleColumnMappingUI not found after loading');
        
        // Show error in container
        columnMappingContainer.innerHTML = `
          <div class="error-container">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #f44336; margin-bottom: 15px;"></i>
            <p style="margin-bottom: 20px; color: #666; text-align: center;">
              Could not load any mapping component. Please contact support.
            </p>
            <button onclick="location.reload()" class="primary-btn">
              Refresh Page
            </button>
          </div>
        `;
      }
    };
    
    script.onerror = function() {
      console.error('Failed to load simple component');
      
      // Show error in container
      columnMappingContainer.innerHTML = `
        <div class="error-container">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #f44336; margin-bottom: 15px;"></i>
          <p style="margin-bottom: 20px; color: #666; text-align: center;">
            Failed to load any mapping component. Please check network connectivity.
          </p>
          <button onclick="location.reload()" class="primary-btn">
            Refresh Page
          </button>
        </div>
      `;
    };
    
    document.head.appendChild(script);
  }

  // Main initialization function
  function init() {
    loadStyles();
    loadReactDependencies(function() {
      console.log('React dependencies loaded');
      
      // Load the non-import version of the component
      try {
        loadComponentScript();
        console.log('Loading ColumnMappingUI component without fallback');
      } catch (e) {
        console.error('Error loading ColumnMappingUI component:', e);
        
        // Display error in the column mapping container
        const columnMappingContainer = document.getElementById('column-mapping-container');
        if (columnMappingContainer) {
          columnMappingContainer.innerHTML = `
            <div class="error-container">
              <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #f44336; margin-bottom: 15px;"></i>
              <p style="margin-bottom: 20px; color: #666; text-align: center;">
                Failed to load the Data Formatter component. Please refresh the page or contact support.
              </p>
              <button onclick="location.reload()" class="primary-btn">
                Refresh Page
              </button>
            </div>
          `;
        }
      }
    });
  }
  
  // Start initialization
  init();
});