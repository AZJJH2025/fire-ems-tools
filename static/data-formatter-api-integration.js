/**
 * Data Formatter API Integration
 * 
 * This file integrates the DataFormatterAPI with the buttons and UI elements
 * in the data-formatter.html page.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get the download and send buttons
  const downloadBtn = document.getElementById('download-btn');
  const sendToToolBtn = document.getElementById('send-to-tool-btn');
  const outputFormat = document.getElementById('output-format');
  const targetTool = document.getElementById('target-tool');
  
  // If the buttons exist, update their click handlers
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Get the transform ID from the button's data attribute
      const transformId = downloadBtn.getAttribute('data-transform-id');
      
      // If we have a transform ID, use the API to download
      if (transformId && window.DataFormatterAPI) {
        const format = outputFormat ? outputFormat.value : 'csv';
        
        // Add loading indicator to the button
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
        downloadBtn.disabled = true;
        
        try {
          // Get the download URL from the API
          const downloadUrl = window.DataFormatterAPI.getDownloadUrl(transformId, format);
          
          // Create a temporary link and trigger the download
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.target = '_blank';
          link.download = `transformed_data.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Log the download
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Downloading transformed data in ${format.toUpperCase()} format.`);
          }
          
          // Restore button
          setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
          }, 1000);
        } catch (error) {
          console.error('Error downloading data:', error);
          
          // Restore button
          downloadBtn.innerHTML = originalText;
          downloadBtn.disabled = false;
          
          // Log the error
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Error downloading data: ${error.message}`, 'error');
          }
          
          // Try fallback
          fallbackToClientSideDownload(format);
        }
      } else {
        // Fallback to the original download functionality
        console.log('No transform ID found, using client-side download');
        fallbackToClientSideDownload(outputFormat ? outputFormat.value : 'csv');
      }
    });
  }
  
  // Helper function for client-side download
  function fallbackToClientSideDownload(format) {
    if (window.transformedData && window.transformedData.length > 0) {
      let outputData, fileName, mimeType, blob;
      
      try {
        switch (format) {
          case 'csv':
            // Use the convertToCSV function from main script if available
            if (window.convertToCSV && typeof window.convertToCSV === 'function') {
              outputData = window.convertToCSV(window.transformedData);
            } else {
              // Simple CSV conversion
              const headers = Object.keys(window.transformedData[0]);
              outputData = headers.join(',') + '\n';
              window.transformedData.forEach(row => {
                const values = headers.map(header => {
                  const val = row[header];
                  // Quote values with commas
                  return (val && typeof val === 'string' && val.includes(',')) ? 
                    `"${val}"` : (val !== undefined ? val : '');
                });
                outputData += values.join(',') + '\n';
              });
            }
            fileName = 'transformed_data.csv';
            mimeType = 'text/csv';
            break;
            
          case 'json':
            outputData = JSON.stringify(window.transformedData, null, 2);
            fileName = 'transformed_data.json';
            mimeType = 'application/json';
            break;
            
          case 'excel':
            // This requires XLSX.js to be loaded
            if (window.XLSX) {
              // Create workbook
              const ws = window.XLSX.utils.json_to_sheet(window.transformedData);
              const wb = window.XLSX.utils.book_new();
              window.XLSX.utils.book_append_sheet(wb, ws, 'Transformed Data');
              
              // Generate Excel binary
              const wbout = window.XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
              
              // Convert to ArrayBuffer
              const buf = new ArrayBuffer(wbout.length);
              const view = new Uint8Array(buf);
              for (let i = 0; i < wbout.length; i++) {
                view[i] = wbout.charCodeAt(i) & 0xFF;
              }
              
              blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
              fileName = 'transformed_data.xlsx';
              
              // Log success
              if (window.appendLog && typeof window.appendLog === 'function') {
                window.appendLog('Generated Excel file for download');
              }
              
              // Create download link
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              return; // Exit early after Excel download
            } else {
              // Fallback to CSV if XLSX not available
              if (window.appendLog && typeof window.appendLog === 'function') {
                window.appendLog('Excel export not available, falling back to CSV', 'warning');
              }
              fallbackToClientSideDownload('csv');
              return;
            }
        }
        
        // Create blob and trigger download (for CSV and JSON)
        blob = new Blob([outputData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Log success
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog(`Downloaded ${fileName} with ${window.transformedData.length} records`);
        }
      } catch (error) {
        console.error('Error in client-side download:', error);
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog(`Download error: ${error.message}`, 'error');
        }
      }
    } else {
      alert('No transformed data available for download.');
    }
  }
  
  // Update the send to tool button
  if (sendToToolBtn) {
    sendToToolBtn.addEventListener('click', async function(event) {
      event.preventDefault();
      
      // Get the transform ID from the button's data attribute
      const transformId = sendToToolBtn.getAttribute('data-transform-id');
      
      // Get the selected tool from the target tool select
      const selectedTool = targetTool ? targetTool.value : null;
      
      if (!selectedTool) {
        alert('Please select a target tool to send the data to.');
        return;
      }
      
      // Add loading indicator to the button
      const originalText = sendToToolBtn.innerHTML;
      sendToToolBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      sendToToolBtn.disabled = true;
      
      // If we have a transform ID, use the API to send to tool
      if (transformId && window.DataFormatterAPI) {
        try {
          // Log the action
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Sending data to ${getToolName(selectedTool)}...`);
          }
          
          // Call the API to send to tool
          const result = await window.DataFormatterAPI.sendToTool(transformId, selectedTool);
          
          // If successful, redirect to the tool
          if (result.success && result.redirect) {
            // Log before redirecting
            if (window.appendLog && typeof window.appendLog === 'function') {
              window.appendLog(`Successfully prepared data for ${getToolName(selectedTool)}. Redirecting...`);
            }
            
            // Small delay before redirecting to allow log message to be seen
            setTimeout(() => {
              window.location.href = result.redirect;
            }, 500);
          } else {
            sendToToolBtn.innerHTML = originalText;
            sendToToolBtn.disabled = false;
            
            if (window.appendLog && typeof window.appendLog === 'function') {
              window.appendLog('Failed to send data to the selected tool.', 'error');
            }
            
            alert('Failed to send data to the selected tool.');
          }
        } catch (error) {
          console.error('Error sending to tool:', error);
          sendToToolBtn.innerHTML = originalText;
          sendToToolBtn.disabled = false;
          
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Error sending to tool: ${error.message}`, 'error');
          }
          
          // Try fallback
          fallbackSendToTool(selectedTool);
        }
      } else {
        // Fallback to the original send functionality
        console.log('No transform ID found, using client-side send to tool');
        fallbackSendToTool(selectedTool);
      }
    });
  }
  
  // Helper function for client-side send to tool
  function fallbackSendToTool(selectedTool) {
    console.log("🚨 Using fallbackSendToTool with tool:", selectedTool);
    
    // Try multiple strategies to get the data
    let dataToSend = null;
    
    // Strategy 1: Use transformedData if available
    if (window.transformedData && window.transformedData.length > 0) {
      console.log("Strategy 1: Using window.transformedData");
      dataToSend = window.transformedData;
    }
    // Strategy 2: Try to use emergency transformer if available and we have original data
    else if (window.originalData && window.originalData.length > 0 && 
             window.emergencyTransformData && typeof window.emergencyTransformData === 'function') {
      console.log("Strategy 2: Using emergency transformer with original data");
      dataToSend = window.emergencyTransformData(window.originalData);
    }
    // Strategy 3: Try to get data from sessionStorage
    else {
      try {
        console.log("Strategy 3: Attempting to retrieve from sessionStorage");
        const tempData = sessionStorage.getItem('tempTransformedData');
        if (tempData) {
          dataToSend = JSON.parse(tempData);
          console.log("Retrieved data from tempTransformedData");
        }
      } catch (e) {
        console.error("Error retrieving from sessionStorage:", e);
      }
    }
    
    // Double-check if we have data - if not, create emergency data from original data
    if (!dataToSend && window.originalData && window.originalData.length > 0) {
      console.log("Strategy 4: Creating emergency data directly");
      
      // Create direct mapping for response time analyzer specifically
      if (selectedTool === 'response-time') {
        dataToSend = window.originalData.map(record => ({
          "Incident ID": record.Inc_ID || "",
          "Latitude": parseFloat(record.GPS_Lat) || 0,
          "Longitude": parseFloat(record.GPS_Lon) || 0,
          "Unit": record.Units || "",
          "Unit Dispatched": record.Disp_Time || "",
          "Unit Onscene": record.Arriv_Time || "",
          "Reported": record.Call_Time || "",
          "Incident Date": record.Call_Date || "",
          "Incident Type": record.Call_Type || "",
          "Address": record.Address_Full || "",
          "_source": "emergency_direct"
        }));
      } else {
        dataToSend = window.originalData;
      }
    }
    
    // Now, if we have data, store it properly and redirect
    if (dataToSend && dataToSend.length > 0) {
      try {
        console.log("Preparing to send data:", dataToSend[0]);
        console.log("Data fields:", Object.keys(dataToSend[0]));
        
        // For Response Time Analyzer, ensure numeric coordinates
        if (selectedTool === 'response-time') {
          dataToSend = dataToSend.map(record => {
            const newRecord = {...record};
            
            // Ensure Latitude/Longitude are numbers
            if (newRecord.Latitude && typeof newRecord.Latitude === 'string') {
              newRecord.Latitude = parseFloat(newRecord.Latitude);
            }
            
            if (newRecord.Longitude && typeof newRecord.Longitude === 'string') {
              newRecord.Longitude = parseFloat(newRecord.Longitude);
            }
            
            return newRecord;
          });
        }
        
        // Use the emergency storage method if available
        if (window.storeEmergencyData && typeof window.storeEmergencyData === 'function') {
          window.storeEmergencyData(dataToSend, selectedTool);
        } 
        // Otherwise use direct sessionStorage
        else {
          sessionStorage.setItem('formattedData', JSON.stringify(dataToSend));
          sessionStorage.setItem('dataSource', 'formatter');
          sessionStorage.setItem('formatterToolId', selectedTool);
          sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
        }
        
        // Log the action
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog(`Data prepared for ${getToolName(selectedTool)}. Redirecting...`);
        } else {
          console.log(`Data prepared for ${getToolName(selectedTool)}. Redirecting...`);
        }
        
        // Redirect based on tool
        const toolUrls = {
          'response-time': '/fire-ems-dashboard',
          'isochrone': '/isochrone-map',
          'isochrone-stations': '/isochrone-map?type=stations',
          'isochrone-incidents': '/isochrone-map?type=incidents',
          'call-density': '/call-density-heatmap',
          'incident-logger': '/incident-logger',
          'coverage-gap': '/coverage-gap-finder',
          'station-overview': '/station-overview',
          'fire-map-pro': '/fire-map-pro'
        };
        
        if (toolUrls[selectedTool]) {
          // Add parameter to indicate source
          const url = toolUrls[selectedTool] + (toolUrls[selectedTool].includes('?') ? '&' : '?') + 'from_formatter=true';
          
          // Small delay before redirecting
          setTimeout(() => {
            window.location.href = url;
          }, 500);
        } else {
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Error: No URL defined for ${selectedTool}`, 'error');
          }
          alert(`Error: No URL defined for the selected tool.`);
          
          // Reset button state
          if (sendToToolBtn) {
            sendToToolBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send to Tool';
            sendToToolBtn.disabled = false;
          }
        }
      } catch (error) {
        console.error('Error in client-side send to tool:', error);
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog(`Error sending to tool: ${error.message}`, 'error');
        }
        
        // Reset button state
        if (sendToToolBtn) {
          sendToToolBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send to Tool';
          sendToToolBtn.disabled = false;
        }
      }
    } else {
      // Try to load from tempTransformedData in sessionStorage as fallback
      try {
        const tempData = sessionStorage.getItem('tempTransformedData');
        if (tempData) {
          console.log("Retrieved transformed data from sessionStorage fallback");
          const parsedData = JSON.parse(tempData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log("Using transformed data from sessionStorage:", parsedData[0]);
            sessionStorage.setItem('formattedData', tempData);
            sessionStorage.setItem('dataSource', 'formatter');
            sessionStorage.setItem('formatterToolId', selectedTool);
            sessionStorage.setItem('formatterTimestamp', new Date().toISOString());
            
            // Add diagnostic info
            window.appendLog = window.appendLog || function(msg) { console.log(msg); };
            window.appendLog("Using fallback data from session storage");
            
            // Redirect after a small delay
            setTimeout(() => {
              const toolUrls = {
                'response-time': '/fire-ems-dashboard',
                'isochrone': '/isochrone-map',
                'isochrone-stations': '/isochrone-map?type=stations',
                'isochrone-incidents': '/isochrone-map?type=incidents',
                'call-density': '/call-density-heatmap',
                'incident-logger': '/incident-logger',
                'coverage-gap': '/coverage-gap-finder',
                'station-overview': '/station-overview',
                'fire-map-pro': '/fire-map-pro'
              };
              
              if (toolUrls[selectedTool]) {
                window.location.href = toolUrls[selectedTool] + (toolUrls[selectedTool].includes('?') ? '&' : '?') + 'from_formatter=true';
              }
            }, 500);
            
            return;
          }
        }
      } catch (e) {
        console.error("Error retrieving fallback data:", e);
      }
      
      // If fallback also failed, show alert
      alert('No transformed data available to send.');
      
      // Reset button state
      if (sendToToolBtn) {
        sendToToolBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send to Tool';
        sendToToolBtn.disabled = false;
      }
    }
  }
  
  // Helper function to get human-readable tool name
  function getToolName(toolId) {
    const toolNames = {
      'response-time': 'Response Time Analyzer',
      'isochrone': 'Isochrone Map Generator',
      'isochrone-stations': 'Isochrone Map - Station Locations',
      'isochrone-incidents': 'Isochrone Map - Incident Data',
      'call-density': 'Call Density Heatmap',
      'incident-logger': 'Incident Logger',
      'coverage-gap': 'Coverage Gap Finder',
      'station-overview': 'Station Overview',
      'fire-map-pro': 'FireMapPro'
    };
    
    return toolNames[toolId] || toolId;
  }
});