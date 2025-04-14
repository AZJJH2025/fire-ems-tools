/**
 * Data Formatter Direct
 * 
 * This script provides a direct implementation for emergency mode
 * when the main data formatter bundle fails to load
 */

(function() {
  'use strict';
  
  console.log('[EmergencyMode] Loading data-formatter-direct.js');
  
  // Set up namespaces
  window.FireEMS = window.FireEMS || {};
  window.FireEMS.EmergencyMode = window.FireEMS.EmergencyMode || {};
  
  // Signal emergency mode is active
  window.isEmergencyMode = true;
  
  // Initialize or extend formatterState if it doesn't exist
  if (!window.formatterState) {
    window.formatterState = {
      fileId: null,
      sourceColumns: [],
      sampleData: [],
      selectedTool: null,
      mappings: null,
      transformedData: null,
      originalData: null,
      originalFileName: null,
      initialized: true
    };
  }
  
  // Add the core file detection methods if they don't exist
  if (!window.formatterState.isLargeFile) {
    window.formatterState.isLargeFile = function(filename) {
      // Check if filename is provided directly, otherwise use stored filename
      const fileToCheck = filename || this.originalFileName || '';
      
      // Check if this is Data1G.csv in multiple ways
      const lowerFilename = fileToCheck.toLowerCase();
      const isData1G = lowerFilename.includes('data1g');
      
      // Also consider large by file size if available
      const isLargeBySize = this.fileSize && this.fileSize > 1000000; // 1MB
      
      return isData1G || isLargeBySize;
    };
  }
  
  // Add helper methods for processing limits and preview sizes
  if (!window.formatterState.getProcessingLimit) {
    window.formatterState.getProcessingLimit = function() {
      return this.isLargeFile() ? 1000 : 100;
    };
  }
  
  if (!window.formatterState.getPreviewSize) {
    window.formatterState.getPreviewSize = function() {
      return this.isLargeFile() ? 100 : 25;
    };
  }
  
  // Enhanced file processor that handles all data consistently
  window.FireEMS.EmergencyMode.processFile = function(file) {
    if (!file) {
      console.error('[EmergencyMode] No file provided to process');
      return;
    }
    
    console.log(`[EmergencyMode] Processing file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    // Store file metadata in formatterState
    window.formatterState.fileName = file.name;
    window.formatterState.originalFileName = file.name; // Critical for later detection
    window.formatterState.fileSize = file.size;
    
    // Also store in session for compatibility with other components
    try {
      sessionStorage.setItem('currentFileName', file.name);
      localStorage.setItem('currentFileName', file.name);
    } catch (e) {
      console.warn('[EmergencyMode] Could not store filename in storage:', e);
    }
    
    // Detect file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Process based on type
    if (fileExtension === 'csv') {
      processCSV(file);
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      processExcel(file);
    } else if (fileExtension === 'json') {
      processJSON(file);
    } else {
      // Default to CSV as a fallback
      console.warn(`[EmergencyMode] Unsupported file extension: ${fileExtension}, trying as CSV`);
      processCSV(file);
    }
    
    // Update UI elements
    const fileNameDisplay = document.getElementById('file-name');
    if (fileNameDisplay) {
      fileNameDisplay.textContent = file.name;
    }
    
    // Enable mapping button
    const mapFieldsBtn = document.getElementById('map-fields-btn');
    if (mapFieldsBtn) {
      mapFieldsBtn.disabled = false;
    }
    
    // Log processing
    const logContainer = document.getElementById('log-container');
    if (logContainer) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry log-info';
      logEntry.innerHTML = `
        <span class="log-time">${timestamp}</span> 
        File loaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)
      `;
      
      // Clear placeholder if present
      const placeholder = logContainer.querySelector('.log-placeholder');
      if (placeholder) {
        logContainer.innerHTML = '';
      }
      
      logContainer.appendChild(logEntry);
    }
  };
  
  // CSV Processing Function
  function processCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      const text = e.target.result;
      
      try {
        // Parse CSV text
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        if (headers.length === 0) {
          showErrorMessage("No columns detected in CSV file");
          return;
        }
        
        // Store column names
        window.formatterState.sourceColumns = headers;
        window.formatterState.originalData = true;
        
        // Determine how many rows to process based on file
        const isLargeFile = window.formatterState.isLargeFile(file.name);
        const maxRowsToProcess = window.formatterState.getProcessingLimit();
        
        console.log(`[EmergencyMode] Processing ${maxRowsToProcess} rows from ${file.name} (large file: ${isLargeFile})`);
        
        // Parse rows for sample data
        const sampleData = [];
        
        for (let i = 1; i < Math.min(lines.length, maxRowsToProcess + 1); i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const row = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index] ? values[index].trim() : '';
            });
            
            sampleData.push(row);
          }
        }
        
        window.formatterState.sampleData = sampleData;
        
        // Update preview
        updatePreview(headers, sampleData);
        
        // Log success
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
          const timestamp = new Date().toLocaleTimeString();
          const logEntry = document.createElement('div');
          logEntry.className = 'log-entry log-info';
          logEntry.innerHTML = `
            <span class="log-time">${timestamp}</span> 
            CSV processed with ${headers.length} columns and ${sampleData.length} rows.
            ${isLargeFile ? ' <b>(Enhanced processing for large file)</b>' : ''}
          `;
          logContainer.appendChild(logEntry);
        }
      } catch (error) {
        console.error("[EmergencyMode] CSV processing error:", error);
        showErrorMessage("Error processing CSV: " + error.message);
      }
    };
    
    reader.onerror = function() {
      showErrorMessage("Error reading file");
    };
    
    reader.readAsText(file);
  }
  
  // Excel Processing Function
  function processExcel(file) {
    // Check if XLSX.js is available
    if (!window.XLSX) {
      console.error("[EmergencyMode] XLSX.js library not available");
      showErrorMessage("Excel processing requires XLSX.js library which is not available in emergency mode.");
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          showErrorMessage("No data found in Excel file");
          return;
        }
        
        // Extract headers from first row
        const headers = jsonData[0].map(h => h.toString().trim());
        
        // Store column names
        window.formatterState.sourceColumns = headers;
        window.formatterState.originalData = true;
        
        // Determine how many rows to process
        const isLargeFile = window.formatterState.isLargeFile(file.name);
        const maxRowsToProcess = window.formatterState.getProcessingLimit();
        
        console.log(`[EmergencyMode] Processing ${maxRowsToProcess} rows from Excel ${file.name} (large file: ${isLargeFile})`);
        
        // Parse rows
        const sampleData = [];
        
        for (let i = 1; i < Math.min(jsonData.length, maxRowsToProcess + 1); i++) {
          if (jsonData[i].length > 0) {
            const row = {};
            
            headers.forEach((header, index) => {
              row[header] = index < jsonData[i].length ? jsonData[i][index] : '';
            });
            
            sampleData.push(row);
          }
        }
        
        window.formatterState.sampleData = sampleData;
        
        // Update preview
        updatePreview(headers, sampleData);
        
        // Log success
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
          const timestamp = new Date().toLocaleTimeString();
          const logEntry = document.createElement('div');
          logEntry.className = 'log-entry log-info';
          logEntry.innerHTML = `
            <span class="log-time">${timestamp}</span> 
            Excel file processed with ${headers.length} columns and ${sampleData.length} rows.
            ${isLargeFile ? ' <b>(Enhanced processing for large file)</b>' : ''}
          `;
          logContainer.appendChild(logEntry);
        }
      } catch (error) {
        console.error("[EmergencyMode] Excel processing error:", error);
        showErrorMessage("Error processing Excel file: " + error.message);
      }
    };
    
    reader.onerror = function() {
      showErrorMessage("Error reading Excel file");
    };
    
    reader.readAsArrayBuffer(file);
  }
  
  // JSON Processing Function
  function processJSON(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const jsonText = e.target.result;
        const jsonData = JSON.parse(jsonText);
        
        // Handle array of objects
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Check if first item is an object
          if (typeof jsonData[0] === 'object' && jsonData[0] !== null) {
            // Extract headers from first object
            const headers = Object.keys(jsonData[0]);
            
            // Store column names
            window.formatterState.sourceColumns = headers;
            window.formatterState.originalData = true;
            
            // Determine how many rows to process
            const isLargeFile = window.formatterState.isLargeFile(file.name);
            const maxRowsToProcess = window.formatterState.getProcessingLimit();
            
            console.log(`[EmergencyMode] Processing ${maxRowsToProcess} rows from JSON ${file.name} (large file: ${isLargeFile})`);
            
            // Use data directly, limiting to max rows
            const sampleData = jsonData.slice(0, maxRowsToProcess);
            window.formatterState.sampleData = sampleData;
            
            // Update preview
            updatePreview(headers, sampleData);
            
            // Log success
            const logContainer = document.getElementById('log-container');
            if (logContainer) {
              const timestamp = new Date().toLocaleTimeString();
              const logEntry = document.createElement('div');
              logEntry.className = 'log-entry log-info';
              logEntry.innerHTML = `
                <span class="log-time">${timestamp}</span> 
                JSON file processed with ${headers.length} columns and ${sampleData.length} rows.
                ${isLargeFile ? ' <b>(Enhanced processing for large file)</b>' : ''}
              `;
              logContainer.appendChild(logEntry);
            }
          } else {
            showErrorMessage("JSON data must be an array of objects");
          }
        } else {
          showErrorMessage("JSON data must be an array of objects");
        }
      } catch (error) {
        console.error("[EmergencyMode] JSON processing error:", error);
        showErrorMessage("Error processing JSON: " + error.message);
      }
    };
    
    reader.onerror = function() {
      showErrorMessage("Error reading JSON file");
    };
    
    reader.readAsText(file);
  }
  
  // Update preview display
  function updatePreview(headers, rows) {
    const previewContainer = document.getElementById('input-preview');
    if (!previewContainer) return;
    
    // Determine preview size
    const previewSize = window.formatterState.getPreviewSize();
    const rowsToShow = Math.min(rows.length, previewSize);
    
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
    previewContainer.innerHTML = html;
    
    // If showing fewer rows than actual, add a message
    if (rowsToShow < rows.length) {
      const totalRowsMessage = document.createElement('div');
      totalRowsMessage.className = 'preview-message';
      totalRowsMessage.style.marginTop = '10px';
      totalRowsMessage.style.fontStyle = 'italic';
      totalRowsMessage.textContent = `Showing ${rowsToShow} of ${rows.length} total records. Complete dataset will be processed.`;
      previewContainer.appendChild(totalRowsMessage);
    }
  }
  
  // Show error message
  function showErrorMessage(message) {
    const previewContainer = document.getElementById('input-preview');
    if (previewContainer) {
      previewContainer.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>${message}</p>
        </div>
      `;
    }
    
    // Also log the error
    const logContainer = document.getElementById('log-container');
    if (logContainer) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry log-error';
      logEntry.innerHTML = `
        <span class="log-time">${timestamp}</span> 
        Error: ${message}
      `;
      logContainer.appendChild(logEntry);
    }
  }
  
  // Add event listener to file input
  document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('data-file');
    
    if (fileInput) {
      console.log('[EmergencyMode] Adding file input listener');
      
      fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
          window.FireEMS.EmergencyMode.processFile(file);
        }
      });
    } else {
      console.warn('[EmergencyMode] File input element not found');
    }
  });
  
  // Export core functionality
  window.FireEMS.EmergencyMode.updatePreview = updatePreview;
  window.FireEMS.EmergencyMode.showErrorMessage = showErrorMessage;
  
  console.log('[EmergencyMode] data-formatter-direct.js loaded');
})();