/**
 * Integration script for the React Data Formatter with Flask backend
 * This script serves as the bridge between the React component and the Flask app
 */

// Global object to track file and formatter state
window.formatterState = {
  fileId: null,
  sourceColumns: [],
  sampleData: [],
  selectedTool: null,
  mappings: null,
  transformedData: null,
  originalData: null
};

document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const dataFileInput = document.getElementById('data-file');
  const fileNameDisplay = document.getElementById('file-name');
  const inputFormatSelect = document.getElementById('input-format');
  const targetToolSelect = document.getElementById('target-tool');
  const mapFieldsBtn = document.getElementById('map-fields-btn');
  const downloadBtn = document.getElementById('download-btn');
  const sendToToolBtn = document.getElementById('send-to-tool-btn');
  const columnMappingContainer = document.getElementById('column-mapping-container');
  const inputPreview = document.getElementById('input-preview');
  const outputPreview = document.getElementById('output-preview');
  const logContainer = document.getElementById('log-container');

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
  };

  // File upload handling
  if (dataFileInput) {
    dataFileInput.addEventListener('change', async function(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Update file name display
      if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
      }
      
      // Reset state for new file
      window.formatterState = {
        ...window.formatterState,
        fileId: null,
        mappings: null,
        transformedData: null
      };
      
      // Disable buttons until processing is complete
      if (mapFieldsBtn) mapFieldsBtn.disabled = true;
      if (downloadBtn) downloadBtn.disabled = true;
      if (sendToToolBtn) sendToToolBtn.disabled = true;
      
      // Log the file upload
      window.appendLog(`Uploading file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      
      try {
        // Create FormData object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', inputFormatSelect ? inputFormatSelect.value : 'auto');
        
        // Upload file to server
        const response = await fetch('/api/data-formatter/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Store data in formatter state
        window.formatterState.fileId = data.fileId;
        window.formatterState.sourceColumns = data.columns;
        window.formatterState.sampleData = data.sampleData;
        window.formatterState.originalData = data.originalData;
        
        // Update input preview
        if (inputPreview) {
          renderDataPreview(inputPreview, data.sampleData, data.columns);
        }
        
        // Enable map fields button
        if (mapFieldsBtn) mapFieldsBtn.disabled = false;
        
        window.appendLog(`File processed successfully. ${data.columns.length} columns detected.`);
      } catch (error) {
        console.error('Error processing file:', error);
        window.appendLog(`Error: ${error.message}`, 'error');
      }
    });
  }

  // Tool selection handling
  if (targetToolSelect) {
    targetToolSelect.addEventListener('change', function() {
      const selectedTool = targetToolSelect.value;
      window.formatterState.selectedTool = selectedTool;
      
      // Log the tool selection
      window.appendLog(`Selected target tool: ${targetToolSelect.options[targetToolSelect.selectedIndex].text}`);
      
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
      if (!window.formatterState.fileId || !window.formatterState.selectedTool) {
        window.appendLog('Please upload a file and select a target tool first.', 'error');
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
      
      // Redirect to the selected tool with the file ID
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
      
      const targetUrl = toolUrls[window.formatterState.selectedTool];
      if (targetUrl) {
        window.location.href = `${targetUrl}?fileId=${window.formatterState.fileId}`;
      } else {
        window.appendLog('Unknown target tool selected.', 'error');
      }
    });
  }

  // Utility function to render data preview
  function renderDataPreview(container, data, columns) {
    if (!container || !data || !data.length) {
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
        td.textContent = data[i][column] || '';
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
          <p>Required JavaScript libraries could not be loaded. Please try refreshing the page.</p>
        </div>
      `;
      return;
    }
    
    // Pass data to React component
    const componentData = {
      sourceColumns: window.formatterState.sourceColumns,
      sampleData: window.formatterState.sampleData,
      selectedTool: window.formatterState.selectedTool,
      fileId: window.formatterState.fileId
    };
    
    // Define callback for when mapping is complete
    const onMappingComplete = async (mappings) => {
      // Store mappings
      window.formatterState.mappings = mappings;
      
      // Show loading state
      if (outputPreview) {
        outputPreview.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Transforming data...</p></div>';
      }
      
      // Log the mapping
      window.appendLog(`Field mapping completed. ${Object.keys(mappings).length} fields mapped.`);
      
      try {
        // Call the transform API
        const response = await fetch('/api/data-formatter/transform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileId: window.formatterState.fileId,
            mappings: mappings,
            tool: window.formatterState.selectedTool,
            options: {
              dateFormat: document.getElementById('date-format')?.value || 'auto',
              compression: document.getElementById('compression')?.value || 'none',
              removeDuplicates: document.getElementById('remove-duplicates')?.checked || false,
              cleanAddresses: document.getElementById('clean-addresses')?.checked || false,
              handleMissing: document.getElementById('handle-missing')?.checked || false,
              missingStrategy: document.getElementById('missing-strategy')?.value || 'remove-rows'
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`Transform failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Store transformed data
        window.formatterState.transformedData = data.transformedData;
        
        // Update output preview
        if (outputPreview) {
          renderDataPreview(outputPreview, data.transformedData, data.columns);
        }
        
        // Enable download buttons
        if (downloadBtn) downloadBtn.disabled = false;
        if (sendToToolBtn) sendToToolBtn.disabled = false;
        
        // Log the transformation
        window.appendLog(`Data transformation successful. ${data.transformedData.length} rows processed.`);
        
        // Display warnings if any
        if (data.warnings && data.warnings.length > 0) {
          data.warnings.forEach(warning => {
            window.appendLog(`Warning: ${warning}`, 'warning');
          });
        }
        
        // Return to the formatter panels
        window.showFormatterPanels();
      } catch (error) {
        console.error('Error transforming data:', error);
        window.appendLog(`Error: ${error.message}`, 'error');
        
        // Return to the formatter panels with error state
        window.showFormatterPanels();
      }
    };
    
    // Mount the React component
    window.DataFormatterUI.mount(columnMappingContainer, componentData, onMappingComplete);
  }
});