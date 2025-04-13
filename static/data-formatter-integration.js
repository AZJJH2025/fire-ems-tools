/**
 * Integration script for the React Data Formatter with Flask backend
 * This script serves as the bridge between the React component and the Flask app
 */

// Create a state management system with persistence
window.FormatterStateManager = {
  // Default initial state
  defaultState: {
    fileId: null,
    sourceColumns: [],
    sampleData: [], // We don't persist this to avoid large localStorage objects
    selectedTool: null,
    mappings: null,
    transformedData: null, // We don't persist this to avoid large localStorage objects
    originalData: null,    // We don't persist this to avoid large localStorage objects
    session: {
      lastUpdated: null,
      sessionId: null,
      persistenceEnabled: true
    }
  },
  
  // Current state (in memory)
  currentState: null,
  
  // Storage key
  storageKey: 'fireEMS_dataFormatter_state',
  
  // Initialize state
  init: function() {
    // Create a unique session ID
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    
    // Try to load saved state
    try {
      const savedState = localStorage.getItem(this.storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        console.log('Loaded saved state from localStorage', parsedState);
        
        // Create new session but keep relevant saved data
        this.currentState = {
          ...this.defaultState,
          fileId: parsedState.fileId,
          sourceColumns: parsedState.sourceColumns || [],
          selectedTool: parsedState.selectedTool,
          mappings: parsedState.mappings,
          session: {
            lastUpdated: new Date().toISOString(),
            sessionId: sessionId,
            persistenceEnabled: true,
            previousSession: parsedState.session
          }
        };
        
        console.log('Restored previous session data');
      } else {
        // Initialize with default state
        this.currentState = {
          ...this.defaultState,
          session: {
            lastUpdated: new Date().toISOString(),
            sessionId: sessionId,
            persistenceEnabled: true
          }
        };
        console.log('No saved state found, initialized with defaults');
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
      // Initialize with default state
      this.currentState = {
        ...this.defaultState,
        session: {
          lastUpdated: new Date().toISOString(),
          sessionId: sessionId,
          persistenceEnabled: true,
          error: error.message
        }
      };
    }
    
    return this.currentState;
  },
  
  // Get current state
  get: function() {
    return this.currentState || this.init();
  },
  
  // Update state (only specified fields)
  update: function(updates) {
    this.currentState = {
      ...this.currentState,
      ...updates,
      session: {
        ...this.currentState.session,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Save to localStorage if persistence is enabled
    if (this.currentState.session.persistenceEnabled) {
      try {
        // Don't persist large data objects
        const stateToSave = {
          ...this.currentState,
          sampleData: [], // Don't save sample data (too large)
          transformedData: null, // Don't save transformed data (too large)
          originalData: null // Don't save original data (too large)
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Error saving state to localStorage:', error);
        // Disable persistence if storage fails (likely quota exceeded)
        this.currentState.session.persistenceEnabled = false;
        this.currentState.session.persistenceError = error.message;
      }
    }
    
    return this.currentState;
  },
  
  // Clear state
  clear: function() {
    localStorage.removeItem(this.storageKey);
    this.currentState = {
      ...this.defaultState,
      session: {
        lastUpdated: new Date().toISOString(),
        sessionId: this.currentState?.session?.sessionId || Date.now().toString(36),
        persistenceEnabled: true
      }
    };
    return this.currentState;
  }
};

// Initialize the state manager
window.FormatterStateManager.init();

// Global object to track file and formatter state (for backward compatibility)
window.formatterState = window.FormatterStateManager.get();

// Create a safer window.DataFormatterTools namespace for integration
window.DataFormatterTools = {
  // Validate if all required DOM elements exist
  validateDOM: function() {
    const requiredElements = [
      'data-file', 'file-name', 'input-format', 'target-tool', 
      'map-fields-btn', 'download-btn', 'send-to-tool-btn',
      'column-mapping-container', 'input-preview', 'output-preview', 
      'log-container'
    ];
    
    const missing = requiredElements.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
      console.error('Missing required DOM elements:', missing);
      return false;
    }
    
    return true;
  },
  
  // Test API formatting functionality
  testAPIFormatting: function() {
    if (window.DataFormatter && window.DataFormatter.api && 
        typeof window.DataFormatter.api.testFormatting === 'function') {
      const testResults = window.DataFormatter.api.testFormatting();
      
      console.log('API Formatting Test Results:', testResults);
      
      if (!testResults.success) {
        console.error('API formatting tests failed - some mappings may not work correctly');
      }
      
      return testResults.success;
    }
    
    console.warn('API formatting tests not available - cannot verify mapping functionality');
    return false;
  },
  
  // Safely initialize the application
  init: function() {
    if (!this.validateDOM()) {
      console.error('Cannot initialize data formatter - missing DOM elements');
      // Add emergency fallback UI
      const mainContainer = document.querySelector('main.container');
      if (mainContainer) {
        mainContainer.innerHTML = `
          <div class="error-container" style="margin: 30px; padding: 20px; background-color: #f8d7da; color: #721c24; border-radius: 5px; text-align: center;">
            <h2><i class="fas fa-exclamation-triangle"></i> Initialization Error</h2>
            <p>The data formatter could not be initialized properly. Some required page elements are missing.</p>
            <p>Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        `;
      }
      return false;
    }
    
    // Test API functionality
    this.testAPIFormatting();
    
    // Initialization successful
    console.log('Data formatter DOM validation successful - ready to initialize');
    return true;
  }
};

document.addEventListener('DOMContentLoaded', function() {
  // Initialize safely
  if (!window.DataFormatterTools.init()) {
    return; // Stop initialization if validation failed
  }
  
  // DOM Elements - now that we know they exist
  const dataFileInput = document.getElementById('data-file');
  const fileNameDisplay = document.getElementById('file-name');
  const inputFormatSelect = document.getElementById('input-format');
  const targetToolSelect = document.getElementById('target-tool');
  const mapFieldsBtn = document.getElementById('map-fields-btn');
  const downloadBtn = document.getElementById('download-btn');
  const sendToToolBtn = document.getElementById('send-to-tool-btn');
  const clearBtn = document.getElementById('clear-btn');
  const columnMappingContainer = document.getElementById('column-mapping-container');
  const inputPreview = document.getElementById('input-preview');
  const outputPreview = document.getElementById('output-preview');
  const logContainer = document.getElementById('log-container');
  
  // Clear button handling
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      // Use FormatterStateManager.clear() to reset state
      window.FormatterStateManager.clear();
      
      // Update reference for backward compatibility
      window.formatterState = window.FormatterStateManager.get();
      
      // Reset file input
      if (dataFileInput) dataFileInput.value = '';
      if (fileNameDisplay) fileNameDisplay.textContent = 'No file selected';
      
      // Clear previews
      if (inputPreview) {
        inputPreview.innerHTML = `
          <div class="placeholder-message">
            <i class="fas fa-arrow-up"></i>
            <p>Upload a file to preview</p>
          </div>
        `;
      }
      
      if (outputPreview) {
        outputPreview.innerHTML = `
          <div class="placeholder-message">
            <i class="fas fa-arrow-left"></i>
            <p>Transform data to preview</p>
          </div>
        `;
      }
      
      // Reset log
      if (logContainer) {
        logContainer.innerHTML = '<p class="log-placeholder">Transformation details will appear here</p>';
      }
      
      // Disable buttons
      if (mapFieldsBtn) mapFieldsBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      if (sendToToolBtn) sendToToolBtn.disabled = true;
      
      // Log the action
      window.appendLog('Form cleared. Ready for new data.');
    });
  }

  // Add log entry to the transformation log
  window.appendLog = function(message, type = 'info') {
    if (!logContainer) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.innerHTML = `<span class="log-time">${timestamp}</span> ${message}`;
    
    // Clear placeholder if present
    const placeholder = logContainer.querySelector('.log-placeholder');
    if (placeholder) {
      logContainer.innerHTML = '';
    }
    
    logContainer.appendChild(logEntry);
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Also log to console for debugging
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // File upload handling
  if (dataFileInput) {
    dataFileInput.addEventListener('change', async function(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Validate file type first
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['csv', 'xlsx', 'xls', 'json', 'xml'];
      
      if (!allowedExtensions.includes(fileExtension)) {
        window.appendLog(`Error: File type .${fileExtension} is not supported. Please upload a CSV, Excel, JSON, or XML file.`, 'error');
        return;
      }
      
      // Update file name display
      if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
      }
      
      // Reset state for new file but keep previous tool selection
      window.FormatterStateManager.update({
        fileId: null,
        sourceColumns: [],
        sampleData: [],
        selectedTool: targetToolSelect ? targetToolSelect.value : null,
        mappings: null,
        transformedData: null,
        originalData: null
      });
      
      // Update reference for backward compatibility
      window.formatterState = window.FormatterStateManager.get();
      
      // Disable buttons until processing is complete
      if (mapFieldsBtn) mapFieldsBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      if (sendToToolBtn) sendToToolBtn.disabled = true;
      
      // Log the file upload
      window.appendLog(`Uploading file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      try {
        // Show loading indicator
        if (inputPreview) {
          inputPreview.innerHTML = `
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <p>Processing file...</p>
            </div>
          `;
        }
        
        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', inputFormatSelect ? inputFormatSelect.value : 'auto');
        
        console.log('Uploading file:', file.name, 'format:', inputFormatSelect ? inputFormatSelect.value : 'auto');
                     
        // Upload file to server
        const response = await fetch('/api/data-formatter/upload', {
          method: 'POST',
          body: formData,
          credentials: 'omit' // Don't include credentials which trigger CSRF protection
        });
        
        if (!response.ok) {
          console.error('Upload response not OK:', response.status, response.statusText);
          // Try to get the error details from the response
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.error || '';
          } catch (e) {
            // Ignore JSON parsing errors
          }
          throw new Error(`Upload failed: ${response.statusText}${errorDetails ? ' - ' + errorDetails : ''}`);
        }
        
        const data = await response.json();
        
        // Debug logging of response
        console.log('File upload response:', {
          success: data.success,
          fileId: data.fileId,
          columnsCount: data.columns ? data.columns.length : 0,
          sampleDataCount: data.sampleData ? data.sampleData.length : 0
        });
        
        // Validate response data
        if (!data.columns || data.columns.length === 0) {
          throw new Error('No columns detected in the uploaded file');
        }
        
        // Store data in formatter state with persistence
        window.FormatterStateManager.update({
          fileId: data.fileId,
          sourceColumns: data.columns,
          sampleData: data.sampleData || [],
          originalData: true // This flag indicates data is available
        });
        
        // Update reference for backward compatibility
        window.formatterState = window.FormatterStateManager.get();
        
        // Update input preview
        if (inputPreview) {
          renderDataPreview(inputPreview, data.sampleData || [], data.columns);
        }
        
        // Enable map fields button only if target tool is selected
        if (mapFieldsBtn) {
          if (window.formatterState.selectedTool) {
            mapFieldsBtn.disabled = false;
          } else {
            window.appendLog('Please select a target tool before mapping fields', 'warning');
          }
        }
        
        window.appendLog(`File processed successfully. ${data.columns.length} columns detected.`);
      } catch (error) {
        console.error('Error processing file:', error);
        window.appendLog(`Error: ${error.message}`, 'error');
        
        // Clear loading indicator
        if (inputPreview) {
          inputPreview.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              <p>${error.message}</p>
              <p>Please try another file or format.</p>
            </div>
          `;
        }
      }
    });
  }

  // Tool selection handling
  if (targetToolSelect) {
    targetToolSelect.addEventListener('change', function() {
      const selectedTool = targetToolSelect.value;
      
      // Update state with persistence
      window.FormatterStateManager.update({
        selectedTool: selectedTool
      });
      
      // Update reference for backward compatibility
      window.formatterState = window.FormatterStateManager.get();
      
      // Log the tool selection
      window.appendLog(`Selected target tool: ${targetToolSelect.options[targetToolSelect.selectedIndex].text}`);
      
      // Enable map fields button if file is already uploaded
      if (mapFieldsBtn && window.formatterState.fileId) {
        mapFieldsBtn.disabled = false;
      }
      
      // Show the appropriate requirements section
      document.querySelectorAll('.tool-requirements').forEach(el => {
        el.style.display = 'none';
      });
      
      const reqSection = document.getElementById(`${selectedTool}-requirements`);
      if (reqSection) {
        reqSection.style.display = 'block';
        
        // Make sure the requirements container is visible
        const reqContainer = document.querySelector('.requirements-content');
        if (reqContainer) {
          reqContainer.style.display = 'block';
        }
      }
    });
  }

  // Map Fields button handling
  if (mapFieldsBtn) {
    mapFieldsBtn.addEventListener('click', function() {
      // Validate required data is available
      if (!window.formatterState.fileId) {
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
      
      // Show column mapping container
      if (columnMappingContainer) {
        columnMappingContainer.style.display = 'block';
        
        // Hide the formatter panels
        document.querySelectorAll('.formatter-panel').forEach(panel => {
          panel.style.display = 'none';
        });
        
        // Clear any previous content
        columnMappingContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Loading field mapping interface...</p></div>';
        
        // Initialize the React component
        initializeReactComponent();
      }
    });
  }

  // Download button handling
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      if (!window.formatterState.transformedData) {
        window.appendLog('No transformed data available to download.', 'error');
        return;
      }
      
      // Get output format
      const outputFormat = document.getElementById('output-format').value || 'csv';
      
      // Create download URL
      const url = `/api/data-formatter/download?fileId=${window.formatterState.fileId}&format=${outputFormat}`;
      
      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `transformed_data.${outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.appendLog(`Downloaded transformed data in ${outputFormat.toUpperCase()} format.`);
    });
  }

  // Send to Tool button handling
  if (sendToToolBtn) {
    sendToToolBtn.addEventListener('click', function() {
      if (!window.formatterState.transformedData || !window.formatterState.selectedTool) {
        window.appendLog('No transformed data or target tool selected.', 'error');
        return;
      }
      
      // Get the transformed data
      const data = window.formatterState.transformedData;
      
      // Create mapping of tool names to paths
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
      
      // Get the target tool route
      const targetTool = window.formatterState.selectedTool;
      const targetUrl = toolUrls[targetTool];
      
      if (!targetUrl) {
        window.appendLog('Unknown target tool selected.', 'error');
        return;
      }
      
      // Log what we're doing
      console.log(`Sending data to ${targetTool} (${targetUrl})`);
      window.appendLog(`Sending data to ${targetTool}...`);
      
      // Log what data we're sending
      console.log('Data being sent:', typeof data, Array.isArray(data) ? `Array with ${data.length} items` : 'Not an array');
      window.appendLog(`Sending ${Array.isArray(data) ? data.length : 0} records to ${targetTool}...`);
      
      // Try using the resilience framework if available
      if (window.FireEMS && window.FireEMS.Core) {
        try {
          console.log('Using FireEMS framework to send data');
          
          // Log the exact state for debugging
          console.log('Framework components availability:', {
            EmergencyMode: !!window.FireEMS.EmergencyMode,
            sendToToolMethod: !!(window.FireEMS.EmergencyMode && typeof window.FireEMS.EmergencyMode.sendToTool === 'function'),
            StateService: !!(window.FireEMS && window.FireEMS.StateService),
            setMethod: !!(window.FireEMS.StateService && typeof window.FireEMS.StateService.set === 'function')
          });
          
          // Use emergency mode if available
          if (window.FireEMS.EmergencyMode && typeof window.FireEMS.EmergencyMode.sendToTool === 'function') {
            console.log('Using EmergencyMode.sendToTool method');
            window.appendLog('Using emergency mode to send data to ' + targetTool);
            
            // Make sure we add a small delay to avoid race conditions with localStorage
            setTimeout(() => {
              const result = window.FireEMS.EmergencyMode.sendToTool(data, targetTool);
              console.log('Emergency mode send result:', result);
            }, 50);
            return; // Exit after successful send
          } 
          
          // Use State service if available
          else if (window.FireEMS.StateService && typeof window.FireEMS.StateService.set === 'function') {
            console.log('Using State service');
            window.FireEMS.State.set('transferredData', data);
            window.location.href = `${targetUrl}?source=formatter`;
            return; // Exit after successful send
          }
          
          // Fall through to direct approach if framework methods weren't found
          console.log('No suitable framework method found, using direct localStorage approach');
        } catch (error) {
          console.error('Error using FireEMS framework:', error);
          // Continue to the direct approach below
        }
      } else {
        console.log('FireEMS framework not available, using direct approach');
      }
      
      // Direct approach using standard formatter flow (NOT emergency mode)
      try {
        // Pre-process data to ensure compatibility with fire-ems-dashboard
        const enhancedData = data.map(item => {
          // Create a new object with enhanced fields
          const enhanced = { ...item };
          
          // Add _source property to indicate data comes from formatter
          enhanced._source = 'formatter';
          
          // Ensure coordinates are numeric
          if (enhanced.Latitude !== undefined) enhanced.Latitude = parseFloat(enhanced.Latitude);
          if (enhanced.Longitude !== undefined) enhanced.Longitude = parseFloat(enhanced.Longitude);
          
          // Ensure standard field names exist if alternate ones are used
          if (!enhanced.Unit && enhanced.UnitID) enhanced.Unit = enhanced.UnitID;
          if (!enhanced.Unit && enhanced['Unit ID']) enhanced.Unit = enhanced['Unit ID'];
          if (!enhanced['Incident ID'] && enhanced.RunNo) enhanced['Incident ID'] = enhanced.RunNo;
          if (!enhanced['Incident ID'] && enhanced['Run No']) enhanced['Incident ID'] = enhanced['Run No'];
          
          return enhanced;
        });
        
        console.log("Enhanced data format for localStorage:", enhancedData[0]);
        
        // Generate unique ID and store data in localStorage
        const timestamp = Date.now();
        const dataId = 'formatter_data_' + timestamp;
        
        // Verify data is properly serializable
        const serializedData = JSON.stringify({
          data: enhancedData,
          metadata: {
            source: 'formatter',
            tool: window.formatterState.selectedTool,
            timestamp: new Date().toISOString(),
            recordCount: enhancedData.length,
            version: "v2.2"
          }
        });
        console.log(`Data serialized successfully, size: ${serializedData.length} bytes`);
        
        // Store in localStorage
        localStorage.setItem(dataId, serializedData);
        
        // Store in sessionStorage as well (direct approach)
        try {
          // Transform data format to match what fire-ems-dashboard.js expects
          const transformedData = data.map(item => {
            // Create a new object with transformed fields
            const transformed = { ...item };
            
            // Add _source property to indicate data comes from formatter
            transformed._source = 'formatter';
            
            // Ensure coordinates are numeric
            if (transformed.Latitude !== undefined) transformed.Latitude = parseFloat(transformed.Latitude);
            if (transformed.Longitude !== undefined) transformed.Longitude = parseFloat(transformed.Longitude);
            
            // Ensure Date objects exist for timestamps
            const dateFields = ['Reported', 'Unit Dispatched', 'Unit Enroute', 'Unit Onscene'];
            dateFields.forEach(field => {
              if (transformed[field]) {
                try {
                  const date = new Date(transformed[field]);
                  if (!isNaN(date.getTime())) {
                    transformed[`${field}_obj`] = date;
                  }
                } catch (e) {
                  console.warn(`Failed to create Date object for ${field}:`, e);
                }
              }
            });
            
            // Ensure standard field names exist if alternate ones are used
            if (!transformed.Unit && transformed.UnitID) transformed.Unit = transformed.UnitID;
            if (!transformed.Unit && transformed['Unit ID']) transformed.Unit = transformed['Unit ID'];
            if (!transformed['Incident ID'] && transformed.RunNo) transformed['Incident ID'] = transformed.RunNo;
            if (!transformed['Incident ID'] && transformed['Run No']) transformed['Incident ID'] = transformed['Run No'];
            
            return transformed;
          });
          
          console.log("Transformed data for fire-ems-dashboard compatibility:", transformedData[0]);
          
          sessionStorage.setItem('formattedData', JSON.stringify(transformedData));
          sessionStorage.setItem('dataSource', 'formatter');
          sessionStorage.setItem('formatterToolId', window.formatterState.selectedTool);
          sessionStorage.setItem('formatterTarget', window.formatterState.selectedTool);
          sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
          console.log("Data stored in sessionStorage as backup with enhanced format compatibility");
        } catch (e) {
          console.warn("Could not store in sessionStorage:", e);
        }
        
        // DISABLE EMERGENCY MODE EXPLICITLY - Do not allow fallback
        window.skipEmergencyMode = true;
        
        // Log diagnostic info to help debug
        console.log(`%c FORMATTER DATA TRANSFER (v2.1) `, 'background: #4CAF50; color: white; font-size: 14px;');
        console.log('📦 Data:', {length: data.length, firstRecord: data[0]});
        console.log('🗄️ Storage:', {dataId, localStorage: true, sessionStorage: true});
        console.log('🎯 Target:', {url: targetUrl, tool: window.formatterState.selectedTool});
        
        // Store diagnostic data in both storages
        const diagnosticData = {
          timestamp: Date.now(),
          dataId: dataId,
          tool: window.formatterState.selectedTool,
          recordCount: data.length,
          urlParams: `from_formatter=true&formatter_data=${dataId}&storage_method=localStorage&t=${timestamp}&records=${data.length}`
        };
        sessionStorage.setItem('formatter_diagnostic', JSON.stringify(diagnosticData));
        localStorage.setItem('formatter_diagnostic', JSON.stringify(diagnosticData));
        
        // Log and redirect using from_formatter (normal flow, NOT emergency)
        console.log(`Stored data with ID: ${dataId}, redirecting to ${targetUrl}?from_formatter=true&formatter_data=${dataId}`);
        window.location.href = `${targetUrl}?from_formatter=true&formatter_data=${dataId}&storage_method=localStorage&t=${timestamp}&records=${data.length}&version=v2.1`;
      } catch (error) {
        console.error('Error storing data in localStorage:', error);
        window.appendLog(`Error sending data: ${error.message}`, 'error');
        
        // As ultimate fallback, try to use the API method
        try {
          window.appendLog('Attempting to use server-side data transfer...', 'warning');
          window.location.href = `${targetUrl}?fileId=${window.formatterState.fileId}`;
        } catch (fallbackError) {
          console.error('All data transfer methods failed:', fallbackError);
          window.appendLog('All data transfer methods failed. Please try again.', 'error');
        }
      }
    });
  }

  // Utility function to render data preview
  function renderDataPreview(container, data, columns) {
    if (!container || !data || !data.length) {
      container.innerHTML = `
        <div class="placeholder-message">
          <i class="fas fa-table"></i>
          <p>No data available for preview</p>
        </div>
      `;
      return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'preview-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    // Show up to 5 rows
    const rowsToShow = Math.min(data.length, 5);
    
    for (let i = 0; i < rowsToShow; i++) {
      const row = document.createElement('tr');
      
      columns.forEach(column => {
        const td = document.createElement('td');
        td.textContent = data[i][column] !== undefined ? data[i][column] : '';
        row.appendChild(td);
      });
      
      tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Initialize the React component
  function initializeReactComponent() {
    // Wait for container to be visible
    if (!columnMappingContainer || columnMappingContainer.style.display === 'none') {
      return;
    }
    
    // Check if libraries are loaded
    if (!window.React || !window.ReactDOM || !window.DataFormatterUI) {
      console.error('Required libraries not loaded:', {
        React: !!window.React,
        ReactDOM: !!window.ReactDOM,
        DataFormatterUI: !!window.DataFormatterUI
      });
      
      columnMappingContainer.innerHTML = `
        <div class="error-container">
          <h3>Error Loading Component</h3>
          <p>Required JavaScript libraries could not be loaded. Please check your network connection and try refreshing the page.</p>
          <button class="primary-btn" onclick="window.showFormatterPanels()">Return to Formatter</button>
        </div>
      `;
      return;
    }
    
    // Validate we have all necessary data
    if (!window.formatterState.sourceColumns || window.formatterState.sourceColumns.length === 0) {
      columnMappingContainer.innerHTML = `
        <div class="error-container">
          <h3>Error: Missing Source Data</h3>
          <p>No columns were detected in the uploaded file. Please check the file format and try again.</p>
          <button class="primary-btn" onclick="window.showFormatterPanels()">Return to Formatter</button>
        </div>
      `;
      return;
    }
    
    if (!window.formatterState.selectedTool) {
      columnMappingContainer.innerHTML = `
        <div class="error-container">
          <h3>Error: No Tool Selected</h3>
          <p>Please select a target tool before mapping columns.</p>
          <button class="primary-btn" onclick="window.showFormatterPanels()">Return to Formatter</button>
        </div>
      `;
      return;
    }
    
    // Verify all required dependencies are available
    console.log('Verifying all required global variables are available:', {
      React: typeof React !== 'undefined',
      ReactDOM: typeof ReactDOM !== 'undefined',
      MaterialUI: typeof MaterialUI !== 'undefined',
      ReactBeautifulDnD: typeof ReactBeautifulDnD !== 'undefined',
      DataFormatterUI: typeof window.DataFormatterUI !== 'undefined',
    });
    
    // If any required dependency is missing, create a fallback
    if (typeof MaterialUI === 'undefined' && typeof MaterialUICore !== 'undefined') {
      window.MaterialUI = MaterialUICore;
      console.log("Using MaterialUICore as MaterialUI");
    }
    
    if (typeof ReactBeautifulDnD === 'undefined') {
      // Try to extract from window
      const dndLib = window['react-beautiful-dnd'];
      if (dndLib) {
        window.ReactBeautifulDnD = dndLib;
        // Also assign it with lowercase d for compatibility
        window.ReactBeautifulDnd = dndLib;
        console.log("Using react-beautiful-dnd as ReactBeautifulDnD");
      } else {
        // Create a stub object
        window.ReactBeautifulDnD = {
          DragDropContext: function() { console.warn("DragDropContext stub called"); return null; },
          Droppable: function() { console.warn("Droppable stub called"); return null; },
          Draggable: function() { console.warn("Draggable stub called"); return null; }
        };
        console.warn("Created ReactBeautifulDnD stub - drag and drop will not function");
      }
    }
    
    // Pass data to React component with careful validation and enhanced debugging
    const componentData = {
      sourceColumns: window.formatterState.sourceColumns || [],
      sampleData: window.formatterState.sampleData || [],
      selectedTool: window.formatterState.selectedTool,
      fileId: window.formatterState.fileId,
      originalData: true  // This is the flag the component is checking for
    };
    
    // Add detailed logging for troubleshooting
    console.log('Initializing React component with data:', JSON.stringify({
      sourceColumnsCount: componentData.sourceColumns.length,
      sourceColumnsPreview: componentData.sourceColumns.slice(0, 3),
      sampleDataCount: componentData.sampleData.length,
      selectedTool: componentData.selectedTool,
      fileId: componentData.fileId,
      originalData: componentData.originalData,
      usingStubDnD: typeof window.ReactBeautifulDnD.DragDropContext === 'function' && 
                   window.ReactBeautifulDnD.DragDropContext.toString().includes('stub')
    }, null, 2));
    
    // Define callback for when mapping is complete
    const onMappingComplete = async (mappings) => {
      // Log the mapping completion
      console.log('Mapping complete. Received mappings:', mappings);
      
      // The mappings should already be formatted correctly by DataFormatterUI
      // But we'll do a quick validation to ensure they're in the right format
      let formattedMappings = mappings;
      
      // Check if mappings are already in the expected format
      const hasCorrectFormat = Object.values(mappings).every(
        mapping => mapping && typeof mapping === 'object' && mapping.sourceId
      );
      
      // If not already correctly formatted, try to use the central formatting function
      if (!hasCorrectFormat && window.DataFormatterUI && window.DataFormatter) {
        console.log('Mappings are not in expected format, using formatter...');
        formattedMappings = window.DataFormatter.api.formatMappingsForAPI(mappings);
      }
      
      console.log('Formatted mappings for API:', formattedMappings);
      
      // Store properly formatted mappings in global state with persistence
      window.FormatterStateManager.update({
        mappings: formattedMappings
      });
      
      // Update reference for backward compatibility
      window.formatterState = window.FormatterStateManager.get();
      
      // Show loading state
      if (outputPreview) {
        outputPreview.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Transforming data...</p></div>';
      }
      
      window.appendLog(`Field mapping completed. ${Object.keys(mappings).length} fields mapped.`);
      
      try {
        // Call the transform API
        console.log('Submitting transform request with:', {
          fileId: window.formatterState.fileId,
          selectedTool: window.formatterState.selectedTool,
          mappingsCount: Object.keys(mappings).length
        });
        
        // Prepare the request payload
        const payload = {
          fileId: window.formatterState.fileId,
          mappings: formattedMappings, // Use the formatted mappings
          tool: window.formatterState.selectedTool,
          options: {
            dateFormat: document.getElementById('date-format')?.value || 'auto',
            compression: document.getElementById('compression')?.value || 'none',
            removeDuplicates: document.getElementById('remove-duplicates')?.checked || false,
            cleanAddresses: document.getElementById('clean-addresses')?.checked || false,
            handleMissing: document.getElementById('handle-missing')?.checked || false,
            missingStrategy: document.getElementById('missing-strategy')?.value || 'remove-rows'
          }
        };
        
        // Log the actual request that's being sent (helpful for debugging)
        console.log('Sending transform request to API with payload:', JSON.stringify(payload, null, 2));
        appendLog(`Sending transformation request to server...`);
        
        const response = await fetch('/api/data-formatter/transform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'omit', // Don't include credentials for CSRF
          body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
          // Try to parse error response as JSON for more details
          let errorMessage = `Transform failed: ${response.statusText}`;
          let errorDetails = '';
          
          try {
            const errorText = await response.text();
            console.error('Transform response not OK:', response.status, response.statusText, errorText);
            
            // Try to parse as JSON to get detailed error
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.error) {
                errorDetails = errorJson.error;
                errorMessage = `Transform failed: ${errorJson.error}`;
                appendLog(`Server error: ${errorJson.error}`, 'error');
              }
            } catch (jsonError) {
              // Not JSON, use raw text
              if (errorText && errorText.length > 0) {
                errorDetails = errorText;
              }
            }
          } catch (readError) {
            console.error('Could not read error response:', readError);
          }
          
          // Log the error for debugging
          console.error('Transform request failed:', {
            status: response.status,
            statusText: response.statusText,
            details: errorDetails
          });
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Transform response received:', {
          success: data.success,
          transformId: data.transformId,
          rowCount: data.rowCount,
          columnCount: data.columnCount,
          errorsCount: data.errors ? data.errors.length : 0
        });
        
        // Store transformed data with persistence
        window.FormatterStateManager.update({
          transformedData: data.preview || []
        });
        
        // Update reference for backward compatibility
        window.formatterState = window.FormatterStateManager.get();
        
        // Update output preview
        if (outputPreview) {
          if (data.preview && data.preview.length > 0) {
            const columns = Object.keys(data.preview[0]);
            renderDataPreview(outputPreview, data.preview, columns);
          } else {
            outputPreview.innerHTML = `
              <div class="placeholder-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>No preview data available</p>
              </div>
            `;
          }
        }
        
        // Enable download buttons
        if (downloadBtn) downloadBtn.disabled = false;
        if (sendToToolBtn) sendToToolBtn.disabled = false;
        
        // Log the transformation
        window.appendLog(`Data transformation successful. ${data.rowCount || 0} rows processed.`);
        
        // Display warnings if any
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach(error => {
            window.appendLog(`Error: ${error}`, 'error');
          });
        }
        
        if (data.missingRequiredFields && data.missingRequiredFields.length > 0) {
          window.appendLog(`Warning: Missing required fields: ${data.missingRequiredFields.join(', ')}`, 'warning');
        }
        
        // Return to the formatter panels
        window.showFormatterPanels();
      } catch (error) {
        console.error('Error transforming data:', error);
        window.appendLog(`Error: ${error.message}`, 'error');
        
        if (outputPreview) {
          // Provide more helpful error information and suggestions for common issues
          let errorHelp = '';
          if (error.message.includes("has no attribute 'get'")) {
            errorHelp = `<p>This may be due to a mapping format issue. Try clearing and re-mapping the fields.</p>`;
          } else if (error.message.includes("INTERNAL SERVER ERROR")) {
            errorHelp = `<p>A server error occurred. The server logs will have more details.</p>
                         <p>Common issues include:</p>
                         <ul>
                           <li>Incompatible data types in source data</li>
                           <li>Missing required fields</li>
                           <li>Server resource constraints</li>
                         </ul>`;
          } else if (error.message.includes("fileId")) {
            errorHelp = `<p>The uploaded file could not be found on the server. Try uploading the file again.</p>`;
          }
          
          outputPreview.innerHTML = `
            <div class="error-message">
              <i class="fas fa-exclamation-triangle"></i>
              <p><strong>Error:</strong> ${error.message}</p>
              ${errorHelp}
              <p>Please check the browser console for more detailed error information.</p>
            </div>
          `;
        }
        
        // Return to the formatter panels
        window.showFormatterPanels();
      }
    };
    
    // Mount the React component
    try {
      window.DataFormatterUI.mount(columnMappingContainer, componentData, onMappingComplete);
      console.log('React component mounted successfully');
    } catch (error) {
      console.error('Error mounting DataFormatterUI:', error);
      
      columnMappingContainer.innerHTML = `
        <div class="error-container">
          <h3>Error Loading Component</h3>
          <p>${error.message}</p>
          <pre>${error.stack}</pre>
          <button class="primary-btn" onclick="window.showFormatterPanels()">Return to Formatter</button>
        </div>
      `;
      
      window.appendLog(`Error: Failed to initialize mapping interface - ${error.message}`, 'error');
    }
  }
  
  // Add global function to show formatter panels
  window.showFormatterPanels = function() {
    // Show formatter panels
    document.querySelectorAll('.formatter-panel').forEach(panel => {
      panel.style.display = 'block';
    });
    
    // Hide mapping container
    if (columnMappingContainer) {
      columnMappingContainer.style.display = 'none';
    }
  };
});