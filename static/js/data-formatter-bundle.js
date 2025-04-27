/**
 * Data Formatter Consolidated Bundle
 * A complete bundled solution that loads all dependencies properly
 */

(function() {
  // CRITICAL INITIALIZATION GUARD: Prevent multiple initialization
  if (window.dataFormatterBundleInitialized) {
    console.log('[DataFormatter] Bundle already initialized, skipping duplicate initialization');
    return;
  }
  window.dataFormatterBundleInitialized = true;
  
  console.log("✅ data-formatter-bundle.js loaded successfully");
  
  // Initialize formatter state if it doesn't exist
  if (!window.formatterState) {
    window.formatterState = {
      initialized: true,
      sourceColumns: [],
      sampleData: [],
      transformedData: [],
      mappings: {},
      metadata: {},
      fileId: 'file-' + Date.now()
    };
  }
  
  // Configuration
  const CONFIG = {
    debug: true,
    version: '1.0.1',
    buildTimestamp: new Date().toISOString()
  };
  
  // Create consistent logging
  const Logger = {
    log: function(message, type = 'info') {
      if (CONFIG.debug || type === 'error' || type === 'warn') {
        console[type](`[DataFormatter] ${message}`);
      }
      // Also append to log if the function exists
      if (window.appendLog && typeof window.appendLog === 'function') {
        window.appendLog(message);
      }
    },
    info: function(message) { this.log(message, 'info'); },
    warn: function(message) { this.log(message, 'warn'); },
    error: function(message) { this.log(message, 'error'); }
  };
  
  // Initialize with logging
  Logger.info(`Initializing Data Formatter Bundle v${CONFIG.version} (${CONFIG.buildTimestamp})`);
  
  // Basic data formatter functionality
  const dataFormatter = {
    formatCSV: function(csvData) {
      Logger.info("Formatting CSV data...");
      return csvData;
    },
    
    formatExcel: function(excelData) {
      Logger.info("Formatting Excel data...");
      return excelData;
    },
    
    transformData: function(sourceData, mappings, toolId) {
      Logger.info(`Transforming data for ${toolId} with ${Object.keys(mappings).length} field mappings`);
      
      // Validate inputs
      if (!Array.isArray(sourceData) || sourceData.length === 0) {
        Logger.error("No source data provided for transformation");
        return [];
      }
      
      if (!mappings || Object.keys(mappings).length === 0) {
        Logger.error("No field mappings provided for transformation");
        return sourceData;
      }
      
      // Transform each row according to the mappings
      const transformedData = sourceData.map(row => {
        const newRow = {};
        
        // Apply each field mapping
        Object.keys(mappings).forEach(targetField => {
          const sourceField = mappings[targetField];
          
          // Skip if mapping is empty
          if (!sourceField) return;
          
          // Copy data from source field to target field
          newRow[targetField] = row[sourceField];
          
          // Special handling for specific field types
          if (targetField.includes('date') || targetField.includes('time')) {
            // Try to parse dates/times (but keep original if parsing fails)
            try {
              const dateValue = new Date(newRow[targetField]);
              if (!isNaN(dateValue.getTime())) {
                // Store both raw and parsed versions for flexibility
                newRow[`${targetField}_parsed`] = dateValue;
              }
            } catch (e) {
              Logger.warn(`Could not parse date/time field ${targetField}: ${e.message}`);
            }
          }
          
          // Convert latitude/longitude to numbers if possible
          if (targetField === 'latitude' || targetField === 'longitude') {
            const numValue = parseFloat(newRow[targetField]);
            if (!isNaN(numValue)) {
              newRow[targetField] = numValue;
            }
          }
        });
        
        return newRow;
      });
      
      Logger.info(`Transformed ${transformedData.length} rows of data`);
      return transformedData;
    }
  };
  
  // Make available globally
  window.dataFormatter = dataFormatter;
  
  // Expose the logger for other scripts to use
  window.DataFormatterLogger = Logger;
  
  // Function to process and display CSV data in the file input preview
  window.processFileData = function(fileData, fileType) {
    Logger.info(`Processing file data (${fileData.length} chars) of type ${fileType}`);
    
    let parsedData = [];
    let columns = [];
    
    // Parse data based on file type
    if (fileType === 'csv') {
      // Simple CSV parsing (a more robust parser could be used in production)
      const lines = fileData.split(/\r?\n/);
      if (lines.length > 0) {
        // Extract headers from first line
        columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
        
        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          
          // Simple parsing (doesn't handle quoted values with commas properly)
          const values = line.split(',');
          const row = {};
          
          // Create object with column names as keys
          columns.forEach((column, index) => {
            row[column] = values[index] !== undefined ? values[index].trim().replace(/"/g, '') : '';
          });
          
          parsedData.push(row);
        }
      }
    } else if (fileType === 'json') {
      try {
        // Parse JSON data
        parsedData = JSON.parse(fileData);
        
        // Extract columns from first object if array
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          columns = Object.keys(parsedData[0]);
        } else {
          Logger.error("Invalid JSON data format - expected array of objects");
          return false;
        }
      } catch (e) {
        Logger.error(`Failed to parse JSON data: ${e.message}`);
        return false;
      }
    } else {
      Logger.error(`Unsupported file type: ${fileType}`);
      return false;
    }
    
    // Update formatter state with parsed data
    window.formatterState.sourceColumns = columns;
    window.formatterState.sampleData = parsedData;
    window.formatterState.fileId = 'file-' + Date.now();
    
    // Update the input preview
    updateInputPreview(parsedData, columns);
    
    // Enable the map fields button
    const mapFieldsBtn = document.getElementById('map-fields-btn');
    if (mapFieldsBtn) {
      mapFieldsBtn.disabled = false;
      mapFieldsBtn.classList.remove('disabled');
    }
    
    Logger.info(`Successfully processed ${parsedData.length} rows with ${columns.length} columns`);
    return true;
  };
  
  // Helper function to update input preview
  function updateInputPreview(data, columns) {
    const previewContainer = document.getElementById('input-preview');
    if (!previewContainer) {
      Logger.error("Input preview container not found");
      return;
    }
    
    // Clear previous content
    previewContainer.innerHTML = '';
    
    // Create table for preview (show up to 25 rows for performance)
    const previewRows = data.slice(0, 25);
    const table = document.createElement('table');
    table.className = 'table table-striped preview-table';
    
    // Create header row with column names
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body with data rows
    const tbody = document.createElement('tbody');
    
    previewRows.forEach(row => {
      const tr = document.createElement('tr');
      
      columns.forEach(column => {
        const td = document.createElement('td');
        const value = row[column];
        
        if (value === null || value === undefined) {
          td.textContent = '';
          td.className = 'empty-cell';
        } else {
          td.textContent = String(value);
        }
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    previewContainer.appendChild(table);
    
    // Add record count info
    const recordCount = document.createElement('div');
    recordCount.className = 'record-count';
    recordCount.textContent = `Showing ${previewRows.length} of ${data.length} records`;
    previewContainer.appendChild(recordCount);
  }
  
  // Define missing functions needed by the application
  window.showFormatterPanels = function() {
    Logger.info("showFormatterPanels called");
    // Find formatter panels by class and show them
    const formatterPanels = document.querySelectorAll('.formatter-panel');
    formatterPanels.forEach(panel => {
      if (panel) panel.style.display = 'block';
    });
    
    // Hide mapping container if it exists
    const mappingContainer = document.querySelector('.mapping-container');
    if (mappingContainer) mappingContainer.style.display = 'none';
    
    Logger.info('Field mapping completed. Review the transformed data in the output preview.');
  };
  
  window.enableDownloadButtons = function() {
    Logger.info("enableDownloadButtons called");
    
    // Find download buttons by both ID and class
    const downloadButtons = document.querySelectorAll('.download-btn');
    const downloadBtn = document.getElementById('download-btn');
    const sendToToolBtn = document.getElementById('send-to-tool-btn');
    
    // Add specific buttons to our list
    const allButtons = [...downloadButtons];
    if (downloadBtn && !allButtons.includes(downloadBtn)) {
      allButtons.push(downloadBtn);
    }
    if (sendToToolBtn && !allButtons.includes(sendToToolBtn)) {
      allButtons.push(sendToToolBtn);
    }
    
    // Enable all buttons
    allButtons.forEach(button => {
      if (button) {
        Logger.info(`Enabling button: ${button.id || 'unnamed'}`);
        button.disabled = false;
        button.classList.remove('disabled');
        
        // Add active class for styling
        if (!button.classList.contains('active')) {
          button.classList.add('active');
        }
        
        // Add event listeners for download functionality
        if (button.id === 'download-btn' && !button.getAttribute('data-listener-added')) {
          button.setAttribute('data-listener-added', 'true');
          button.addEventListener('click', function(e) {
            e.preventDefault();
            const format = this.getAttribute('data-format') || 'csv';
            window.downloadTransformedData(format);
          });
        }
        
        // Add event listener for send-to-tool button
        if (button.id === 'send-to-tool-btn' && !button.getAttribute('data-listener-added')) {
          button.setAttribute('data-listener-added', 'true');
          button.addEventListener('click', function(e) {
            e.preventDefault();
            Logger.info("Send to tool button clicked");
            
            // Get the selected tool from metadata
            const toolId = window.formatterState?.metadata?.selectedTool || 'response-time';
            
            // Map tool IDs to their respective paths
            const toolPaths = {
              'response-time': '/fire-ems-dashboard',
              'call-density': '/call-density-heatmap',
              'isochrone': '/isochrone-map',
              'station-overview': '/station-overview',
              'incident-logger': '/incident-logger',
              'coverage-gap': '/coverage-gap-finder'
            };
            
            const toolPath = toolPaths[toolId] || '/fire-ems-dashboard';
            Logger.info(`Navigating to tool: ${toolPath}`);
            
            // Navigate to the tool
            window.location.href = toolPath;
          });
        }
      }
    });
    
    Logger.info(`Enabled ${allButtons.length} buttons for download/send operations`);
  };
  
  // Function to download transformed data in various formats
  window.downloadTransformedData = function(format) {
    const transformedData = window.formatterState?.transformedData || [];
    if (!transformedData || !transformedData.length) {
      Logger.error("No transformed data available to download");
      alert("Error: No data available to download");
      return;
    }
    
    let content = '';
    let filename = `transformed_data_${new Date().toISOString().slice(0,10)}.${format}`;
    let mimeType = 'text/plain';
    
    // Get tool name for filename
    const metadata = window.formatterState?.metadata || {};
    const toolId = metadata.selectedTool || 'data';
    const toolName = window.DataFormatterUI.getToolName(toolId).toLowerCase().replace(/\s+/g, '-');
    filename = `${toolName}_${new Date().toISOString().slice(0,10)}.${format}`;
    
    switch (format.toLowerCase()) {
      case 'csv':
        content = convertToCSV(transformedData);
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(transformedData, null, 2);
        mimeType = 'application/json';
        break;
      case 'txt':
        content = convertToPlainText(transformedData);
        mimeType = 'text/plain';
        break;
      default:
        Logger.error(`Unsupported download format: ${format}`);
        alert(`Error: Unsupported download format: ${format}`);
        return;
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
    
    Logger.info(`Downloaded transformed data in ${format} format`);
  };
  
  // Helper function to convert data to CSV
  function convertToCSV(data) {
    if (!data || !data.length) return '';
    
    const fields = Object.keys(data[0]);
    let csv = fields.join(',') + '\n';
    
    data.forEach(row => {
      const values = fields.map(field => {
        const value = row[field];
        // Handle special characters and quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if the value contains commas, quotes, or newlines
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
      });
      csv += values.join(',') + '\n';
    });
    
    return csv;
  }
  
  // Helper function to convert data to plain text
  function convertToPlainText(data) {
    if (!data || !data.length) return '';
    
    const fields = Object.keys(data[0]);
    const columnWidths = fields.map(field => {
      // Calculate max width based on field name and values
      let maxWidth = field.length;
      data.forEach(row => {
        const value = row[field] !== null && row[field] !== undefined ? String(row[field]) : '';
        maxWidth = Math.max(maxWidth, value.length);
      });
      return Math.min(maxWidth, 30); // Cap at 30 to prevent very wide columns
    });
    
    // Create header row with padded field names
    let text = fields.map((field, i) => field.padEnd(columnWidths[i])).join(' | ') + '\n';
    
    // Add separator line
    text += fields.map((_, i) => '-'.repeat(columnWidths[i])).join('-+-') + '\n';
    
    // Add data rows
    data.forEach(row => {
      const values = fields.map((field, i) => {
        const value = row[field] !== null && row[field] !== undefined ? String(row[field]) : '';
        return value.padEnd(columnWidths[i]).substring(0, columnWidths[i]);
      });
      text += values.join(' | ') + '\n';
    });
    
    return text;
  }
  
  window.handleClearButton = function() {
    Logger.info("handleClearButton called");
    // Reset form elements
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    
    // Clear data previews
    const previews = document.querySelectorAll('.data-preview');
    previews.forEach(preview => {
      if (preview) preview.innerHTML = '';
    });
    
    // Hide results panels
    const resultsPanels = document.querySelectorAll('.results-panel');
    resultsPanels.forEach(panel => {
      if (panel) panel.style.display = 'none';
    });
    
    Logger.info('Form cleared. Ready for new data.');
  };
  
  window.appendLog = function(message) {
    const logContainer = document.querySelector('.log-container');
    if (logContainer) {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  };
  
  // Set up DataFormatterUI for compatibility with improved functionality
  window.DataFormatterUI = {
    mount: function(container, data, callback) {
      Logger.info(`Mounting DataFormatterUI in container with ${data?.sourceColumns?.length || 0} columns`);
      
      if (!container) {
        Logger.error("No container provided for mapping UI");
        return false;
      }
      
      // Store callback for later use
      this.mappingCompleteCallback = callback;
      
      // Get data needed for mapping
      const sourceColumns = data?.sourceColumns || [];
      const sampleData = data?.sampleData || [];
      const selectedTool = data?.selectedTool || 'response-time';
      const fileId = data?.fileId || '';
      
      // Build the field mapping UI
      let html = `
        <div class="mapping-ui">
          <h3>Map Fields for ${this.getToolName(selectedTool)}</h3>
          <p>Match your data columns to the required fields for this tool.</p>
          
          <div class="required-fields-section">
            <h4>Required Fields</h4>
            <div class="mapping-rows">
      `;
      
      // Add required field mappings based on selected tool
      const requiredFields = this.getRequiredFields(selectedTool);
      
      requiredFields.forEach(field => {
        html += this.createMappingRow(field, sourceColumns, sampleData);
      });
      
      html += `
            </div>
          </div>
          
          <div class="action-buttons">
            <button id="apply-mapping-btn" class="primary-btn">Apply Mapping</button>
            <button id="cancel-mapping-btn" class="secondary-btn">Cancel</button>
          </div>
        </div>
      `;
      
      // Insert the HTML into the container
      container.innerHTML = html;
      
      // Add event listeners
      const applyBtn = document.getElementById('apply-mapping-btn');
      const cancelBtn = document.getElementById('cancel-mapping-btn');
      
      if (applyBtn) {
        applyBtn.addEventListener('click', () => this.handleApplyMapping(selectedTool, fileId));
      }
      
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          // Hide mapping container and show formatter panels
          container.style.display = 'none';
          document.querySelectorAll('.formatter-panel').forEach(panel => {
            panel.style.display = 'block';
          });
        });
      }
      
      Logger.info("DataFormatterUI mounted successfully");
      return true;
    },
    
    // Get tool name for display
    getToolName: function(toolId) {
      const toolNames = {
        'response-time': 'Response Time Analyzer',
        'call-density': 'Call Density Heatmap',
        'isochrone': 'Isochrone Map',
        'station-overview': 'Station Overview',
        'incident-logger': 'Incident Logger',
        'coverage-gap': 'Coverage Gap Finder'
      };
      
      return toolNames[toolId] || 'Data Formatter';
    },
    
    // Get required fields for a tool
    getRequiredFields: function(toolId) {
      const fieldSets = {
        'response-time': [
          { id: 'incident_id', name: 'Incident ID', description: 'Unique identifier for each incident', required: true },
          { id: 'incident_date', name: 'Incident Date', description: 'Date of the incident', required: true },
          { id: 'dispatch_time', name: 'Dispatch Time', description: 'Time when the unit was dispatched', required: true },
          { id: 'arrival_time', name: 'Arrival Time', description: 'Time when the unit arrived on scene', required: true },
          { id: 'clear_time', name: 'Clear Time', description: 'Time when the unit cleared from the scene', required: false }
        ],
        'call-density': [
          { id: 'latitude', name: 'Latitude', description: 'Geographic latitude coordinate', required: true },
          { id: 'longitude', name: 'Longitude', description: 'Geographic longitude coordinate', required: true },
          { id: 'incident_type', name: 'Incident Type', description: 'Type or category of incident', required: false },
          { id: 'incident_date', name: 'Incident Date', description: 'Date of the incident', required: false }
        ],
        'isochrone': [
          { id: 'station_id', name: 'Station ID', description: 'Identifier for the station', required: true },
          { id: 'station_name', name: 'Station Name', description: 'Name of the station', required: false },
          { id: 'latitude', name: 'Latitude', description: 'Geographic latitude coordinate of station', required: true },
          { id: 'longitude', name: 'Longitude', description: 'Geographic longitude coordinate of station', required: true }
        ],
        'station-overview': [
          { id: 'station_id', name: 'Station ID', description: 'Identifier for the station', required: true },
          { id: 'station_name', name: 'Station Name', description: 'Name of the station', required: true },
          { id: 'incident_count', name: 'Incident Count', description: 'Number of incidents responded to', required: false },
          { id: 'average_response_time', name: 'Average Response Time', description: 'Average time to respond to incidents', required: false }
        ],
        'incident-logger': [
          { id: 'incident_id', name: 'Incident ID', description: 'Unique identifier for each incident', required: true },
          { id: 'incident_date', name: 'Incident Date', description: 'Date of the incident', required: true },
          { id: 'incident_type', name: 'Incident Type', description: 'Type or category of incident', required: true },
          { id: 'location', name: 'Location', description: 'Location of the incident', required: false },
          { id: 'latitude', name: 'Latitude', description: 'Geographic latitude coordinate', required: false },
          { id: 'longitude', name: 'Longitude', description: 'Geographic longitude coordinate', required: false }
        ],
        'coverage-gap': [
          { id: 'incident_id', name: 'Incident ID', description: 'Unique identifier for each incident', required: true },
          { id: 'latitude', name: 'Latitude', description: 'Geographic latitude coordinate', required: true },
          { id: 'longitude', name: 'Longitude', description: 'Geographic longitude coordinate', required: true },
          { id: 'response_time', name: 'Response Time', description: 'Time to respond to incident (minutes)', required: false }
        ]
      };
      
      return fieldSets[toolId] || fieldSets['response-time'];
    },
    
    // Create a mapping row for a field
    createMappingRow: function(field, sourceColumns, sampleData) {
      const fieldId = field.id;
      const fieldName = field.name;
      const fieldDescription = field.description;
      const isRequired = field.required;
      
      let html = `
        <div class="mapping-row ${isRequired ? 'required' : 'optional'}">
          <div class="target-field">
            <span class="field-name">${fieldName}</span>
            <span class="field-required">${isRequired ? '*' : ''}</span>
            <span class="field-description">${fieldDescription}</span>
          </div>
          <div class="source-field">
            <select id="map-${fieldId}" data-target="${fieldId}" class="mapping-select">
              <option value="">-- Select Source Column --</option>
      `;
      
      // Add source column options
      sourceColumns.forEach((column, index) => {
        // Try to auto-select based on name similarity
        const isAutoSelected = this.shouldAutoSelect(column, fieldId);
        html += `<option value="${column}" ${isAutoSelected ? 'selected' : ''}>${column}</option>`;
      });
      
      html += `
            </select>
          </div>
        </div>
      `;
      
      return html;
    },
    
    // Check if a source column should be auto-selected for a target field
    shouldAutoSelect: function(columnName, fieldId) {
      if (!columnName || !fieldId) return false;
      
      const columnLower = columnName.toLowerCase();
      const fieldLower = fieldId.toLowerCase();
      
      // Direct matches
      if (columnLower === fieldLower) return true;
      
      // Substring matches
      if (columnLower.includes(fieldLower)) return true;
      if (fieldLower.includes(columnLower)) return true;
      
      // Special case matching
      if (fieldLower === 'incident_id' && (
          columnLower.includes('id') || 
          columnLower.includes('number') || 
          columnLower === 'inc_no' || 
          columnLower === 'incno'
      )) return true;
      
      if (fieldLower === 'incident_date' && (
          columnLower.includes('date') || 
          columnLower.includes('time') || 
          columnLower === 'datetime'
      )) return true;
      
      if ((fieldLower === 'latitude' || fieldLower === 'lat') && (
          columnLower.includes('lat') || 
          columnLower === 'y' || 
          columnLower === 'ycoord'
      )) return true;
      
      if ((fieldLower === 'longitude' || fieldLower === 'lon' || fieldLower === 'lng') && (
          columnLower.includes('lon') || 
          columnLower.includes('lng') || 
          columnLower === 'x' || 
          columnLower === 'xcoord'
      )) return true;
      
      return false;
    },
    
    // Handle apply mapping button click
    handleApplyMapping: function(selectedTool, fileId) {
      Logger.info("Applying field mapping");
      
      // Collect all mappings
      const mappings = {};
      const requiredFields = this.getRequiredFields(selectedTool);
      
      requiredFields.forEach(field => {
        const select = document.getElementById(`map-${field.id}`);
        if (select && select.value) {
          mappings[field.id] = select.value;
        }
      });
      
      // Check required fields
      const missingRequiredFields = requiredFields
        .filter(f => f.required)
        .filter(f => !mappings[f.id])
        .map(f => f.name);
      
      if (missingRequiredFields.length > 0) {
        alert(`Please map these required fields: ${missingRequiredFields.join(', ')}`);
        return;
      }
      
      Logger.info(`Field mapping complete. Mapped ${Object.keys(mappings).length} fields.`);
      
      // Create metadata object
      const metadata = {
        selectedTool: selectedTool,
        fileId: fileId,
        timestamp: new Date().toISOString()
      };
      
      // Call the callback if provided
      if (typeof this.mappingCompleteCallback === 'function') {
        this.mappingCompleteCallback(mappings, metadata);
      } else {
        // Fallback to window function if callback not provided
        if (typeof window.handleMappingComplete === 'function') {
          window.handleMappingComplete(mappings, metadata);
        } else {
          Logger.error("No mapping complete callback found");
        }
      }
    }
  };
  
  // Handle mapping completion - process and display transformed data
  window.handleMappingComplete = function(mappings, metadata) {
    Logger.info(`Mapping complete for tool: ${metadata.selectedTool}`);
    Logger.info(`Fields mapped: ${Object.keys(mappings).join(', ')}`);
    
    // Get source data from window state
    const sourceData = window.formatterState?.sampleData || [];
    if (!sourceData.length) {
      Logger.error("No source data available for transformation");
      alert("Error: No source data available to transform");
      return;
    }
    
    // Use transformData to apply mappings
    const transformedData = window.dataFormatter.transformData(sourceData, mappings, metadata.selectedTool);
    
    // Store transformed data in the formatter state
    window.formatterState.transformedData = transformedData;
    window.formatterState.mappings = mappings;
    window.formatterState.metadata = metadata;
    
    // Update output preview with transformed data
    updateOutputPreview(transformedData);
    
    // Switch back to main view
    window.showFormatterPanels();
    
    // Enable download buttons now that we have transformed data
    window.enableDownloadButtons();
    
    Logger.info(`Successfully transformed ${transformedData.length} rows of data`);
  };
  
  // Helper function to hide all loading spinners
  function hideAllSpinners() {
    Logger.info("Hiding all loading spinners");
    const spinners = document.querySelectorAll('.loading-container, .loading-spinner, .processing');
    spinners.forEach(spinner => {
      if (spinner) {
        spinner.style.display = 'none';
      }
    });
  }
  
  // Helper function to update output preview with transformed data
  function updateOutputPreview(data) {
    Logger.info(`updateOutputPreview called with ${data ? data.length : 0} rows`);
    console.log("OUTPUT PREVIEW DATA:", data); // CRITICAL DEBUG - Logs the actual data

    if (!data || !data.length) {
      Logger.error("No data provided to updateOutputPreview");
      return;
    }
    
    // Hide all loading spinners first
    hideAllSpinners();
    
    // Try multiple ways to find the output preview container
    let previewContainer = document.getElementById('output-preview');
    
    if (!previewContainer) {
      Logger.warn("Output preview not found by ID, trying querySelector...");
      previewContainer = document.querySelector('#output-preview');
    }
    
    if (!previewContainer) {
      Logger.warn("Output preview not found by querySelector, trying by class...");
      previewContainer = document.querySelector('.data-preview');
    }
    
    if (!previewContainer) {
      Logger.error("Output preview container not found - critical path issue");
      console.error("OUTPUT PREVIEW ELEMENT MISSING - Cannot display transformed data");
      
      // Find all elements that could contain it
      const allDivs = document.querySelectorAll('div');
      const possibleContainers = Array.from(allDivs).filter(div => 
        div.id?.includes('preview') || 
        div.className?.includes('preview')
      );
      console.log("POSSIBLE PREVIEW CONTAINERS:", possibleContainers);
      
      // Last resort - try to find/recreate the preview container
      const previewSection = document.querySelector('.preview-container');
      if (previewSection) {
        Logger.info("Found preview container parent, recreating output preview");
        previewSection.innerHTML = `
          <h3>Output Preview</h3>
          <div id="output-preview" class="data-preview"></div>
        `;
        previewContainer = document.getElementById('output-preview');
      }
      
      if (!previewContainer) {
        Logger.error("Could not find or recreate output preview container - giving up");
        return;
      }
    }
    
    Logger.info(`Found output preview container: ${previewContainer.id} with class ${previewContainer.className}`);
    
    // Ensure preview container is visible
    previewContainer.style.display = 'block';
    
    // Clear previous content
    previewContainer.innerHTML = '';
    console.log("CLEARED PREVIEW CONTAINER");
    
    // Create table for preview (show up to 50 rows for performance)
    const previewRows = data.slice(0, 50);
    const table = document.createElement('table');
    table.className = 'table table-striped preview-table highlight-preview';
    
    // Create header row with field names
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const fields = Object.keys(previewRows[0] || {});
    
    fields.forEach(field => {
      const th = document.createElement('th');
      th.textContent = field;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body with data rows
    const tbody = document.createElement('tbody');
    
    previewRows.forEach(row => {
      const tr = document.createElement('tr');
      
      fields.forEach(field => {
        const td = document.createElement('td');
        const value = row[field];
        
        // Format the value based on its type
        if (value instanceof Date) {
          td.textContent = value.toLocaleString();
        } else if (value === null || value === undefined) {
          td.textContent = '';
          td.className = 'empty-cell';
        } else {
          td.textContent = String(value);
        }
        
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    previewContainer.appendChild(table);
    
    // Add record count info
    const recordCount = document.createElement('div');
    recordCount.className = 'record-count';
    recordCount.textContent = `Showing ${previewRows.length} of ${data.length} records`;
    previewContainer.appendChild(recordCount);
  }
  
  // Handle file input change - process uploaded file
  function initFileInputHandler() {
    // Check if we already have transformed data and enable buttons if needed
    if (window.formatterState && window.formatterState.transformedData && 
        window.formatterState.transformedData.length > 0) {
      Logger.info("Found existing transformed data during initialization, enabling download buttons");
      setTimeout(window.enableDownloadButtons, 500); // Delay to ensure DOM is ready
    }
    
    const fileInput = document.getElementById('data-file');
    if (!fileInput) {
      Logger.error("File input element not found");
      return;
    }
    
    // Add change event listener
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) {
        Logger.error("No file selected");
        return;
      }
      
      Logger.info(`File selected: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // Determine file type from extension
      let fileType = 'unknown';
      if (file.name.endsWith('.csv')) {
        fileType = 'csv';
      } else if (file.name.endsWith('.json')) {
        fileType = 'json';
      } else {
        Logger.warn(`Unsupported file type detected: ${file.name}. Using fallback CSV parser.`);
        fileType = 'csv'; // Fallback to CSV
      }
      
      // Create file reader
      const reader = new FileReader();
      
      // Set up reader onload handler
      reader.onload = function(event) {
        const fileData = event.target.result;
        
        // Process file data
        const success = window.processFileData(fileData, fileType);
        
        if (success) {
          // Show file info and input preview panel
          const fileInfoPanel = document.getElementById('file-info-panel');
          if (fileInfoPanel) {
            fileInfoPanel.innerHTML = `
              <div class="file-info">
                <h4>File Information</h4>
                <p><strong>Name:</strong> ${file.name}</p>
                <p><strong>Type:</strong> ${fileType.toUpperCase()}</p>
                <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
                <p><strong>Records:</strong> ${window.formatterState.sampleData.length}</p>
                <p><strong>Columns:</strong> ${window.formatterState.sourceColumns.length}</p>
              </div>
            `;
            fileInfoPanel.style.display = 'block';
          }
          
          // Show input preview panel
          const previewPanel = document.getElementById('preview-panel');
          if (previewPanel) {
            previewPanel.style.display = 'block';
          }
          
          // Enable the map fields button
          const mapFieldsBtn = document.getElementById('map-fields-btn');
          if (mapFieldsBtn) {
            mapFieldsBtn.disabled = false;
            mapFieldsBtn.classList.remove('disabled');
          }
          
          Logger.info("File processed successfully");
        } else {
          // Show error message
          Logger.error("Failed to process file data");
          alert("Error: Failed to process file data. Please check the file format.");
        }
      };
      
      // Handle read errors
      reader.onerror = function() {
        Logger.error("Error reading file");
        alert("Error: Failed to read file. Please try again.");
      };
      
      // Read file as text
      reader.readAsText(file);
    });
    
    Logger.info("File input handler initialized");
  }
  
  // Initialize file input handler when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFileInputHandler);
  } else {
    // DOM already loaded, initialize handler now
    initFileInputHandler();
  }
  
  // Set flags to indicate data formatter is loaded (prevents emergency mode)
  window.dataFormatterLoaded = true;
  window.emergencyMode = false; // Explicitly disable emergency mode
  
  // Make sure any emergency banners/buttons are hidden
  setTimeout(function() {
    const emergencyBanners = document.querySelectorAll('.emergency-banner, .emergency-mode-warning');
    const emergencyButtons = document.querySelectorAll('.emergency-btn, .emergency-action');
    
    emergencyBanners.forEach(banner => {
      if (banner) {
        Logger.info("Hiding emergency banner");
        banner.style.display = 'none';
      }
    });
    
    emergencyButtons.forEach(button => {
      if (button) {
        Logger.info("Hiding emergency button");
        button.style.display = 'none';
      }
    });
    
    // Check if we need to re-show the output preview
    const outputPreview = document.getElementById('output-preview');
    if (outputPreview && window.formatterState?.transformedData?.length > 0) {
      Logger.info("Re-showing output preview with existing transformed data");
      updateOutputPreview(window.formatterState.transformedData);
    }
  }, 1000);
  
  Logger.info("Data Formatter Bundle initialization complete");
})();
