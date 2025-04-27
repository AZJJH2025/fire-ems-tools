/**
 * Data Formatter Buttons Fix
 * Fixes the "Send to Tool" and "Download" buttons functionality
 */

(function() {
  // CRITICAL INITIALIZATION GUARD: Prevent multiple initialization
  if (window.dataFormatterButtonsFixInitialized) {
    console.log('[ButtonsFix] Already initialized, skipping duplicate initialization');
    return;
  }
  window.dataFormatterButtonsFixInitialized = true;
  
  console.log("✅ data-formatter-buttons-fix.js loaded successfully");
  
  // Logger function
  function safeLog(message, type) {
    console.log(`[ButtonsFix] ${message}`);
    
    // Use appendLog if available, otherwise just console log
    if (window.appendLog && typeof window.appendLog === 'function') {
      window.appendLog(message, type || 'info');
    }
  }
  
  // Button fix implementation
  const DataFormatterButtonsFix = {
    // Configuration
    config: {
      sendToToolButtonSelector: '#send-to-tool-btn',
      downloadButtonSelector: '#download-btn',
      outputPreviewSelector: '#output-preview'
    },
    
    // State management
    state: {
      initialized: false,
      buttonsEnabled: false
    },
    
    // Initialize the fix
    init: function() {
      safeLog("Initializing buttons fix");
      
      if (this.state.initialized) {
        safeLog("Already initialized, skipping");
        return;
      }
      
      // Set initialization flag
      this.state.initialized = true;
      
      // Replace the enableDownloadButtons function
      this.replaceEnableDownloadButtons();
      
      // Attach event handlers to buttons
      this.attachButtonHandlers();
      
      // Check immediately if we have transformed data
      this.checkAndEnableButtons();
      
      safeLog("Buttons fix initialization complete");
    },
    
    // Replace the enableDownloadButtons function
    replaceEnableDownloadButtons: function() {
      const self = this;
      
      // Store the original function if it exists
      if (window.enableDownloadButtons && typeof window.enableDownloadButtons === 'function') {
        window.originalEnableDownloadButtons = window.enableDownloadButtons;
      }
      
      // Create an improved version of the function
      window.enableDownloadButtons = function() {
        safeLog("Enabling download buttons");
        
        // Get button elements
        const sendToToolBtn = document.querySelector(self.config.sendToToolButtonSelector);
        const downloadBtn = document.querySelector(self.config.downloadButtonSelector);
        
        // Enable buttons if they exist
        if (sendToToolBtn) {
          sendToToolBtn.disabled = false;
          sendToToolBtn.classList.remove('disabled-btn');
          sendToToolBtn.classList.add('active-btn');
        }
        
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.classList.remove('disabled-btn');
          downloadBtn.classList.add('active-btn');
        }
        
        // Update state
        self.state.buttonsEnabled = true;
        
        // Call original function if it exists
        if (window.originalEnableDownloadButtons && typeof window.originalEnableDownloadButtons === 'function') {
          try {
            window.originalEnableDownloadButtons();
          } catch (error) {
            console.error('[ButtonsFix] Error calling original enableDownloadButtons:', error);
          }
        }
      };
    },
    
    // Attach event handlers to buttons
    attachButtonHandlers: function() {
      const self = this;
      
      // Wait for DOM to be ready
      document.addEventListener('DOMContentLoaded', function() {
        // Get button elements
        const sendToToolBtn = document.querySelector(self.config.sendToToolButtonSelector);
        const downloadBtn = document.querySelector(self.config.downloadButtonSelector);
        
        // Attach event handler to Send to Tool button
        if (sendToToolBtn) {
          safeLog("Found Send to Tool button, attaching handler");
          
          // Store original onclick to preserve any existing functionality
          const originalOnClick = sendToToolBtn.onclick;
          
          sendToToolBtn.addEventListener('click', function(event) {
            // Prevent default only if button is disabled
            if (sendToToolBtn.disabled || !self.validateTransformedData()) {
              event.preventDefault();
              event.stopPropagation();
              return false;
            }
            
            safeLog("Send to Tool button clicked");
            
            // Check if we have the necessary data
            if (!window.formatterState || !window.formatterState.transformedData || window.formatterState.transformedData.length === 0) {
              safeLog("No transformed data available. Please map your fields first.", "error");
              return false;
            }
            
            // Check if we have a selected tool
            if (!window.formatterState.selectedTool) {
              safeLog("No tool selected. Please select a target tool first.", "error");
              return false;
            }
            
            // Execute the original onclick if it exists
            if (originalOnClick && typeof originalOnClick === 'function') {
              try {
                originalOnClick.call(sendToToolBtn, event);
              } catch (error) {
                console.error('[ButtonsFix] Error calling original sendToTool onclick:', error);
              }
            }
            
            // Send the data to the selected tool
            self.sendDataToTool();
          });
        } else {
          console.warn('[ButtonsFix] Send to Tool button not found');
        }
        
        // Attach event handler to Download button
        if (downloadBtn) {
          safeLog("Found Download button, attaching handler");
          
          // Store original onclick to preserve any existing functionality
          const originalOnClick = downloadBtn.onclick;
          
          downloadBtn.addEventListener('click', function(event) {
            // Prevent default only if button is disabled
            if (downloadBtn.disabled || !self.validateTransformedData()) {
              event.preventDefault();
              event.stopPropagation();
              return false;
            }
            
            safeLog("Download button clicked");
            
            // Check if we have the necessary data
            if (!window.formatterState || !window.formatterState.transformedData || window.formatterState.transformedData.length === 0) {
              safeLog("No transformed data available. Please map your fields first.", "error");
              return false;
            }
            
            // Execute the original onclick if it exists
            if (originalOnClick && typeof originalOnClick === 'function') {
              try {
                originalOnClick.call(downloadBtn, event);
              } catch (error) {
                console.error('[ButtonsFix] Error calling original download onclick:', error);
              }
            }
            
            // Download the transformed data
            self.downloadTransformedData();
          });
        } else {
          console.warn('[ButtonsFix] Download button not found');
        }
      });
    },
    
    // Check if we have transformed data and enable buttons
    checkAndEnableButtons: function() {
      // Check if formatterState exists and has transformedData
      if (window.formatterState && 
          window.formatterState.transformedData && 
          window.formatterState.transformedData.length > 0) {
        safeLog("Found transformed data, enabling buttons");
        window.enableDownloadButtons();
      } else {
        safeLog("No transformed data found, buttons will remain disabled");
      }
    },
    
    // Validate that we have transformed data
    validateTransformedData: function() {
      const valid = window.formatterState && 
                    window.formatterState.transformedData && 
                    window.formatterState.transformedData.length > 0;
      
      if (!valid) {
        safeLog("No transformed data available. Please map your fields first.", "error");
      }
      
      return valid;
    },
    
    // Send data to the selected tool
    sendDataToTool: function() {
      safeLog(`Sending data to tool: ${window.formatterState.selectedTool}`);
      
      // Get the transformed data
      const transformedData = window.formatterState.transformedData;
      
      // Create a form to submit the data
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/send-to-tool/${window.formatterState.selectedTool}`;
      form.style.display = 'none';
      
      // Create a textarea to hold the data
      const dataInput = document.createElement('textarea');
      dataInput.name = 'data';
      dataInput.value = JSON.stringify(transformedData);
      form.appendChild(dataInput);
      
      // Add metadata if available
      if (window.formatterState.metadata) {
        const metadataInput = document.createElement('textarea');
        metadataInput.name = 'metadata';
        metadataInput.value = JSON.stringify(window.formatterState.metadata);
        form.appendChild(metadataInput);
      }
      
      // Add the form to the document and submit it
      document.body.appendChild(form);
      form.submit();
      
      safeLog(`Data sent to ${window.formatterState.selectedTool}`);
    },
    
    // Download the transformed data
    downloadTransformedData: function() {
      safeLog("Downloading transformed data");
      
      // Get the transformed data
      const transformedData = window.formatterState.transformedData;
      
      // Convert to CSV or JSON depending on the selected tool
      let fileContent = '';
      let fileExtension = 'json';
      
      if (window.formatterState.selectedTool) {
        fileExtension = 'csv';
        // Convert to CSV
        const headers = Object.keys(transformedData[0]).join(',') + '\n';
        const rows = transformedData.map(row => Object.values(row).join(',')).join('\n');
        fileContent = headers + rows;
      } else {
        // Default to JSON
        fileContent = JSON.stringify(transformedData, null, 2);
      }
      
      // Create a download link
      const a = document.createElement('a');
      const blob = new Blob([fileContent], { type: `text/${fileExtension}` });
      a.href = URL.createObjectURL(blob);
      a.download = `transformed-data.${fileExtension}`;
      
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      safeLog(`Downloaded transformed data as ${fileExtension}`);
    }
  };
  
  // Initialize the fix
  DataFormatterButtonsFix.init();
  
  // Expose globally
  window.DataFormatterButtonsFix = DataFormatterButtonsFix;
})();