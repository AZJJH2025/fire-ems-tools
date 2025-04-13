// Load the emergency mode library
document.addEventListener('DOMContentLoaded', function() {
  console.log("EMERGENCY DOM LOADED: Starting proper initialization");
  
  // Try to load the emergency mode library
  function loadEmergencyLibrary() {
    return new Promise((resolve, reject) => {
      // If already loaded
      if (window.FireEMS && window.FireEMS.EmergencyMode) {
        console.log('Emergency mode library already loaded');
        resolve(window.FireEMS.EmergencyMode);
        return;
      }
      
      // Try to load it with multiple path fallbacks
      function tryLoadFromPath(paths, index = 0) {
        if (index >= paths.length) {
          console.error('Failed to load emergency mode library from all paths');
          reject(new Error('Failed to load emergency mode library from all paths'));
          return;
        }
        
        const script = document.createElement('script');
        script.src = paths[index];
        
        script.onload = function() {
          console.log('Emergency mode library loaded successfully from ' + paths[index]);
          if (window.FireEMS && window.FireEMS.EmergencyMode) {
            resolve(window.FireEMS.EmergencyMode);
          } else {
            console.warn('Library loaded but not initialized, trying next path');
            tryLoadFromPath(paths, index + 1);
          }
        };
        
        script.onerror = function() {
          console.warn('Failed to load emergency mode library from ' + paths[index] + ', trying next path');
          tryLoadFromPath(paths, index + 1);
        };
        
        document.body.appendChild(script);
      }
      
      // Try multiple paths in order
      const paths = [
        '/static/js/emergency-mode.js',
        '/app-static/js/emergency-mode.js',
        '/direct-static/js/emergency-mode.js'
      ];
      
      tryLoadFromPath(paths);
    });
  }
  
  // Get URL parameters immediately
  const urlParams = new URLSearchParams(window.location.search);
  const emergencyData = urlParams.get('emergency_data');
  const fromFormatter = urlParams.get('from_formatter');
  
  // Log the status of parameters to debug data flow paths
  console.log("URL Parameters check in emergency-mode-library.js:", {
    hasEmergencyData: !!emergencyData,
    emergencyData: emergencyData,
    fromFormatter: fromFormatter,
    fullUrl: window.location.href
  });
  
  // IMPORTANT: Skip emergency library initialization if we're explicitly coming from formatter
  // in ANY mode - formatter data should ALWAYS use the normal flow
  if (fromFormatter === 'true') {
    console.log("CRITICAL: Data coming from formatter - COMPLETELY SKIPPING emergency library");
    
    // Set global flags to help other scripts know we're bypassing emergency mode
    window.skipEmergencyMode = true;
    window.isEmergencyMode = false;
    window.dataSource = {
      fromFormatter: true,
      isEmergency: false,
      source: 'formatter'
    };
    
    return; // Exit the library initialization completely
  }
  
  // Process emergency data directly if present (don't wait for library)
  if (emergencyData) {
    console.log("EMERGENCY DIRECT CHECK: Processing directly", emergencyData);
    
    // IMPORTANT: Create a safe copy of the data before processing
    // This prevents other scripts from removing it prematurely
    try {
      const emergencyDataContent = localStorage.getItem(emergencyData);
      if (emergencyDataContent) {
        // Create a backup copy with a different key
        const backupKey = 'backup_' + emergencyData;
        localStorage.setItem(backupKey, emergencyDataContent);
        console.log("Created backup copy of emergency data with key:", backupKey);
      }
    } catch (e) {
      console.error("Error creating backup of emergency data:", e);
    }
    
    processEmergencyDataDirect(emergencyData);
  }
  
  // IMPORTANT: We do NOT process from_formatter data through the emergency path anymore
  // This data should be handled by the normal sessionStorage flow in fire-ems-dashboard.js
  
  // Also try the library approach in parallel
  loadEmergencyLibrary().then(emergencyMode => {
    console.log("EMERGENCY LIBRARY LOADED: Checking via library");
    // Use the library to check for emergency data
    emergencyMode.checkForData({
      onData: processEmergencyData,
      queryParam: 'emergency_data',
      notificationContainer: '.upload-section, .tool-header, main'
    });
  }).catch(error => {
    console.error("Failed to load emergency library:", error);
    
    // Show help button if we came from formatter - only if data not already loaded
    setTimeout(function() {
      const dataLoaded = document.querySelector('.dashboard-grid');
      const resultsVisible = dataLoaded && window.getComputedStyle(dataLoaded).display !== 'none';
      
      // Only show the help if we're from the formatter AND no data is visible yet
      if (fromFormatter === 'true' && !resultsVisible) {
        console.log("No data visible yet from formatter, showing help");
        const storageHelp = document.getElementById('data-transfer-help');
        if (storageHelp) {
          storageHelp.style.display = 'block';
        }
      }
    }, 3000);
  });
  
  // Function to directly process emergency data (fallback)
  function processEmergencyDataDirect(dataId) {
    console.log("Direct emergency data processing with ID: " + dataId);
    
    try {
      // Try to retrieve the data from localStorage - show more debug info
      console.log("Attempting to retrieve data from localStorage with key:", dataId);
      let storedData = localStorage.getItem(dataId);
      
      if (!storedData) {
        console.error("No data found with ID: " + dataId);
        
        // Check for backup copy first
        const backupKey = 'backup_' + dataId;
        const backupData = localStorage.getItem(backupKey);
        if (backupData) {
          console.log("Found backup data with key:", backupKey);
          storedData = backupData;
        } else {
          // DEBUG: List all localStorage keys to see what's available
          console.log("Available localStorage keys:");
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
              console.log(`- ${key} (${localStorage.getItem(key).length} bytes)`);
            } catch (e) {
              console.log(`- ${key} (error reading length)`);
            }
          }
          
          // Try with variations of the key in case there was a formatting issue
          console.log("Trying variations of the key...");
          const possibleVariations = [
            dataId, 
            dataId.replace('emergency_data_', 'emergency_data_test_'),
            dataId.replace('emergency_data_test_', 'emergency_data_'),
            'emergency_data_' + dataId.split('_').pop(),
            'backup_' + dataId
          ];
          
          let foundData = null;
          let foundKey = null;
          
          for (const variant of possibleVariations) {
            const data = localStorage.getItem(variant);
            if (data) {
              console.log("Found data with variation:", variant);
              foundData = data;
              foundKey = variant;
              break;
            }
          }
          
          if (foundData) {
            console.log("Processing with variation key:", foundKey);
            processStoredData(foundData, foundKey);
          } else {
            showEmergencyDataError("Data not found in browser storage. It may have expired or been cleared.");
          }
          
          return;
        }
      }
      
      // Process the data that was found
      processStoredData(storedData, dataId);
      
    } catch (error) {
      console.error("Error processing emergency data directly:", error);
      showEmergencyDataError("Error loading emergency data: " + error.message);
    }
  }
  
  // Helper function to process stored data from localStorage
  function processStoredData(storedData, storageKey) {
    try {
      console.log("Processing stored data, first 100 chars:", storedData.substring(0, 100));
      
      // Parse the JSON data
      const parsedData = JSON.parse(storedData);
      let data = parsedData;
      
      // Check if this is a wrapped data object with metadata (from library)
      if (parsedData.metadata && parsedData.data) {
        data = parsedData.data;
        console.log("Found library-formatted data:", parsedData.metadata);
      }
      
      // DEBUG: Verify the data structure
      if (Array.isArray(data)) {
        console.log("Data is an array with", data.length, "items");
        if (data.length > 0) {
          console.log("Sample first item:", JSON.stringify(data[0]).substring(0, 100) + "...");
        }
      } else {
        console.log("Data is not an array but an object:", typeof data);
        // Try to convert to array if possible
        if (typeof data === 'object' && data !== null) {
          const keys = Object.keys(data);
          if (keys.length > 0 && !isNaN(parseInt(keys[0]))) {
            console.log("Converting object with numeric keys to array");
            data = Object.values(data);
          }
        }
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid data format: expected non-empty array");
      }
      
      console.log("Successfully retrieved emergency data:", data.length, "records");
      
      // Show notification
      const uploadSection = document.querySelector('.upload-section');
      if (uploadSection) {
        const notification = document.createElement('div');
        notification.id = "emergency-data-notification"; // Add ID for easier reference
        notification.className = 'emergency-data-notification';
        notification.innerHTML = `
          <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #0d47a1;">Emergency Data Available</h3>
            <p>Data has been transferred from the Data Formatter in emergency mode.</p>
            <p><strong>${data.length}</strong> records are available.</p>
            <button id="load-emergency-data" style="background-color: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-download"></i> Load Data
            </button>
            <button id="inspect-data" style="background-color: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-left: 10px; cursor: pointer;">
              Inspect Data
            </button>
            <button id="dismiss-emergency-data" style="background-color: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; margin-left: 10px; cursor: pointer;">
              Dismiss
            </button>
          </div>
        `;
        uploadSection.prepend(notification);
        
        // Add event listeners for buttons
        document.getElementById('load-emergency-data').addEventListener('click', function() {
          console.log("Load button clicked, processing emergency data...");
          // Process the data
          const success = processEmergencyData(data);
          
          if (success) {
            // Remove the notification
            notification.remove();
            
            // Clean up localStorage to free space
            localStorage.removeItem(storageKey);
            console.log("Emergency data processed and localStorage cleaned up");
          } else {
            console.error("Failed to process emergency data");
          }
        });
        
        // Add inspect button for debugging
        document.getElementById('inspect-data').addEventListener('click', function() {
          console.log("Full data inspection:", data);
          alert("Data inspection logged to console. Check browser developer tools.");
          
          // Add visual data preview
          const previewDiv = document.createElement('div');
          previewDiv.style.cssText = "max-height: 200px; overflow: auto; background: #f5f5f5; padding: 10px; margin-top: 10px; font-family: monospace; font-size: 12px;";
          previewDiv.innerHTML = `<strong>Data Preview:</strong><br>` + 
              JSON.stringify(data[0], null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
          
          notification.querySelector('div').appendChild(previewDiv);
        });
        
        document.getElementById('dismiss-emergency-data').addEventListener('click', function() {
          notification.remove();
        });
      } else {
        console.error("Could not find upload section to show notification");
        // Try immediate processing if UI elements are not ready
        processEmergencyData(data);
      }
    } catch (error) {
      console.error("Error processing stored data:", error);
      showEmergencyDataError("Error parsing data: " + error.message);
    }
  }
  
  // Process incoming emergency data
  function processEmergencyData(data) {
    console.log("Processing emergency data...");
    
    try {
      // First check if we should actually be in emergency mode
      const shouldUseEmergencyMode = checkShouldUseEmergencyMode();
      if (!shouldUseEmergencyMode) {
        console.log("MapFieldsManager is available! We should not be using emergency mode.");
        
        // Add a visible indicator for debugging
        const debugIndicator = document.createElement('div');
        debugIndicator.style.cssText = "position: fixed; top: 0; right: 0; background: #ff9800; color: white; padding: 4px 8px; font-size: 12px; z-index: 9999;";
        debugIndicator.textContent = "Attempted emergency mode while utilities are available!";
        document.body.appendChild(debugIndicator);
        
        // Auto-remove after 10 seconds
        setTimeout(() => debugIndicator.remove(), 10000);
        
        // Try to find a standard data processor that can use the advanced utilities
        const advancedProcessor = findAdvancedProcessor();
        if (advancedProcessor) {
          console.log("Using advanced data processor instead of emergency mode");
          
          // Use the advanced processor
          try {
            advancedProcessor(data);
            return true;
          } catch (e) {
            console.error("Error in advanced processor, falling back to emergency mode:", e);
            // Fall through to emergency mode as a last resort
          }
        }
      }
      
      // Validate data format
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid data format: expected non-empty array");
      }
      
      // Check required fields
      const requiredFields = ['incident_id', 'incident_date', 'incident_time', 'latitude', 'longitude'];
      const sampleRecord = data[0];
      
      // Log data structure for debugging
      console.log("Data structure check:", Object.keys(sampleRecord));
      
      // Try to determine field mappings or apply transformations if needed
      // Some fields might have variant names (e.g., incident_id vs incidentId)
      const normalizedData = data.map(item => {
        // Create a new normalized record
        const normalized = {};
        
        // Handle common field variations
        normalized.incident_id = item.incident_id || item.incidentId || item.id || '';
        normalized.incident_date = item.incident_date || item.incidentDate || item.date || '';
        normalized.incident_time = item.incident_time || item.incidentTime || item.time || '';
        normalized.latitude = item.latitude || item.lat || 0;
        normalized.longitude = item.longitude || item.lng || item.lon || 0;
        normalized.incident_type = item.incident_type || item.incidentType || item.type || 'Unknown';
        
        // Copy all other fields directly
        for (const [key, value] of Object.entries(item)) {
          if (!normalized[key]) {
            normalized[key] = value;
          }
        }
        
        return normalized;
      });
      
      // Re-check required fields after normalization
      const missingFields = requiredFields.filter(field => 
        !normalizedData[0].hasOwnProperty(field) || !normalizedData[0][field]
      );
      
      if (missingFields.length > 0) {
        console.warn(`Missing required fields after normalization: ${missingFields.join(', ')}`);
        // Continue anyway - the display function will handle missing fields
      }
      
      // Display the data using existing methods if available
      const displayFunctions = [
        'displayResponseTimeData',
        'displayIncidentData',
        'processIncidentData',
        'loadData',
        'processData',
        'displayData'
      ];
      
      let displayMethod = null;
      let displayMethodName = null;
      
      // Try to find a suitable display method
      for (const methodName of displayFunctions) {
        if (typeof window[methodName] === 'function') {
          displayMethod = window[methodName];
          displayMethodName = methodName;
          console.log(`Found display method: ${methodName}`);
          break;
        }
      }
      
      if (displayMethod) {
        console.log(`Using ${displayMethodName} to display data`);
        try {
          displayMethod(normalizedData);
        } catch (displayError) {
          console.error(`Error using ${displayMethodName}:`, displayError);
          displayEmergencyData(normalizedData);
        }
      } else {
        console.log("No standard display method found, using emergency display");
        displayEmergencyData(normalizedData);
      }
      
      // Show success message
      const uploadSection = document.querySelector('.upload-section');
      if (uploadSection) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
          <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #2e7d32;">Data Loaded Successfully</h3>
            <p>${data.length} records have been processed${shouldUseEmergencyMode ? ' in emergency mode' : ''}.</p>
            <p><button id="download-emergency-backup" style="margin-top: 10px; background-color: #2196f3; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-download"></i> Download Backup Copy
            </button></p>
          </div>
        `;
        uploadSection.prepend(successMsg);
        
        // Add event listener for download backup button
        setTimeout(() => {
          const downloadBtn = document.getElementById('download-emergency-backup');
          if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
              console.log("Creating backup download of emergency data");
              downloadEmergencyData(normalizedData);
            });
          }
        }, 100);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
          successMsg.remove();
        }, 8000);
      }
      
      // Mark any debugging indicator as success
      const indicator = document.querySelector('div[style*="position: fixed"][style*="top: 0"][style*="left: 0"]');
      if (indicator) {
        indicator.style.background = "#4caf50";
        indicator.textContent = "Data loaded successfully";
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          indicator.remove();
        }, 5000);
      }
      
      return true;
    } catch (error) {
      console.error("Error processing emergency data:", error);
      showEmergencyDataError("Error processing data: " + error.message);
      
      // Mark any debugging indicator as failed
      const indicator = document.querySelector('div[style*="position: fixed"][style*="top: 0"][style*="left: 0"]');
      if (indicator) {
        indicator.style.background = "#f44336";
        indicator.textContent = "Emergency data processing failed: " + error.message;
      }
      
      return false;
    }
  }
  
  /**
   * Check if we should actually use emergency mode
   * This prevents unnecessary emergency mode activation when utilities are available
   * @returns {boolean} Whether emergency mode should be used
   */
  function checkShouldUseEmergencyMode() {
    // Check for available utilities
    
    // 1. Check for the feature flag (added in MapFieldsManager.js)
    if (window.FireEMS && 
        window.FireEMS.features && 
        window.FireEMS.features.mapFieldsManagerAvailable === true) {
      console.log("MapFieldsManager availability flag is set to true");
      return false; // No emergency mode needed
    }
    
    // 2. Check for the direct utility check function
    if (typeof window.checkMapFieldsManager === 'function') {
      try {
        const status = window.checkMapFieldsManager();
        if (status && status.available === true) {
          console.log("MapFieldsManager check function reports availability");
          return false; // No emergency mode needed
        }
      } catch (e) {
        console.warn("Error checking MapFieldsManager:", e);
      }
    }
    
    // 3. Check for the utility directly
    if (window.FireEMS && 
        window.FireEMS.Utils && 
        window.FireEMS.Utils.MapFieldsManager &&
        typeof window.FireEMS.Utils.MapFieldsManager.applyMappings === 'function') {
      console.log("MapFieldsManager utility is directly available");
      return false; // No emergency mode needed
    }
    
    // 4. Check for older flag
    if (window.FireEMS && 
        window.FireEMS.Utils && 
        window.FireEMS.Utils.mapFieldsAvailable === true) {
      console.log("MapFieldsManager legacy flag is set to true");
      return false; // No emergency mode needed
    }
    
    // Log diagnostics
    console.log("No MapFieldsManager found, emergency mode is appropriate");
    return true; // Use emergency mode
  }
  
  /**
   * Find an advanced data processor that can use the MapFieldsManager
   * @returns {Function|null} Advanced processor function or null if not found
   */
  function findAdvancedProcessor() {
    // Check for the most advanced processor that uses MapFieldsManager
    if (window.FireEMS && 
        window.FireEMS.Utils && 
        window.FireEMS.Utils.MapFieldsManager) {
      
      // Look for different advanced processors
      if (typeof window.processDataWithMapping === 'function') {
        return window.processDataWithMapping;
      }
      
      if (typeof window.processDataAdvanced === 'function') {
        return window.processDataAdvanced;
      }
      
      // If no special processors, but we have the DataFormatterAPI
      if (window.DataFormatterAPI && typeof window.DataFormatterAPI.processData === 'function') {
        return window.DataFormatterAPI.processData;
      }
    }
    
    return null;
  }
  
  // Basic display function for emergency data
  function displayEmergencyData(data) {
    console.log("Using emergency display function for data");
    
    // Hide upload section
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
      uploadSection.style.display = 'none';
    }
    
    // Find main content container
    const mainContent = document.querySelector('.dashboard-grid') || 
                        document.querySelector('#results-container') || 
                        document.querySelector('main');
    
    if (!mainContent) {
      console.error("Could not find a suitable container for displaying results");
      return;
    }
    
    // Clear existing content
    mainContent.innerHTML = '';
    mainContent.style.display = 'block';
    
    // Create a simple data table
    const tableContainer = document.createElement('div');
    tableContainer.className = 'emergency-data-table';
    
    // Generate HTML for the table
    const tableHtml = `
      <h2>Emergency Data View</h2>
      <p>Showing ${data.length} records loaded from Data Formatter in emergency mode.</p>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr>
              ${Object.keys(data[0]).map(key => 
                `<th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">${key}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.slice(0, 50).map(row => `
              <tr>
                ${Object.values(row).map(value => 
                  `<td style="padding: 8px; text-align: left; border-bottom: 1px solid #eee;">${value}</td>`
                ).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${data.length > 50 ? `<p>Showing first 50 of ${data.length} records.</p>` : ''}
      </div>
      
      <div style="margin-top: 20px;">
        <button id="download-emergency-data" style="background-color: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          <i class="fas fa-download"></i> Download as CSV
        </button>
        <button id="clear-emergency-data" style="background-color: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Clear View
        </button>
      </div>
    `;
    
    // Set the HTML
    tableContainer.innerHTML = tableHtml;
    mainContent.appendChild(tableContainer);
    
    // Add event listeners for buttons
    document.getElementById('download-emergency-data').addEventListener('click', function() {
      // Try to use the library for download if available
      if (window.FireEMS && window.FireEMS.EmergencyMode) {
        window.FireEMS.EmergencyMode.downloadData(data, {
          format: 'csv',
          filename: 'emergency-data-export'
        });
      } else {
        // Fallback direct download
        downloadEmergencyData(data);
      }
    });
    
    document.getElementById('clear-emergency-data').addEventListener('click', function() {
      // Show the upload section again
      if (uploadSection) {
        uploadSection.style.display = 'block';
      }
      
      // Clear the data view
      tableContainer.remove();
    });
  }
  
  // Fallback function to download data as CSV
  function downloadEmergencyData(data) {
    try {
      if (!data || data.length === 0) {
        console.error("No data to download");
        return;
      }
      
      // Generate CSV content
      const headers = Object.keys(data[0]);
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          return value.toString().includes(',') ? `"${value}"` : value;
        });
        csvContent += values.join(',') + '\n';
      });
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = 'emergency-data-export.csv';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
    } catch (error) {
      console.error("Error downloading emergency data:", error);
      alert("Error creating download file: " + error.message);
    }
  }
  
  // Function to show error messages
  function showEmergencyDataError(message) {
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'error-message';
      errorMsg.innerHTML = `
        <div style="background-color: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <h3 style="margin-top: 0; color: #c62828;">Error Loading Emergency Data</h3>
          <p>${message}</p>
          <p>Please try uploading your data file directly.</p>
        </div>
      `;
      uploadSection.prepend(errorMsg);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        errorMsg.remove();
      }, 10000);
    }
  }

  // Close button for the help modal
  const closeHelpBtn = document.getElementById('close-help-modal');
  if (closeHelpBtn) {
    closeHelpBtn.addEventListener('click', function() {
      const storageHelp = document.getElementById('data-transfer-help');
      if (storageHelp) {
        storageHelp.style.display = 'none';
      }
    });
  }
  
  // Check storage button - Fixed implementation
  const checkStorageBtn = document.getElementById('check-storage-btn');
  if (checkStorageBtn) {
    checkStorageBtn.addEventListener('click', function() {
      try {
        // Load the debug script dynamically
        const script = document.createElement('script');
        script.src = '/static/debug-session-storage.js';
        script.onload = function() {
          console.log('Storage debugger loaded successfully');
          // Hide the modal after script is loaded
          const storageHelp = document.getElementById('data-transfer-help');
          if (storageHelp) {
            storageHelp.style.display = 'none';
          }
        };
        script.onerror = function() {
          alert('Error: Could not load the storage debugger script.');
        };
        document.body.appendChild(script);
      } catch (e) {
        alert('Error loading debug script: ' + e.message);
      }
    });
  }
});