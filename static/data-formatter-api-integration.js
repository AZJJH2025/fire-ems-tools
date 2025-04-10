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
  const formatSelect = document.getElementById('download-format');
  
  // If the buttons exist, update their click handlers
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function(event) {
      event.preventDefault();
      
      // Get the transform ID from the button's data attribute
      const transformId = downloadBtn.getAttribute('data-transform-id');
      
      // If we have a transform ID, use the API to download
      if (transformId && window.DataFormatterAPI) {
        const format = formatSelect ? formatSelect.value : 'csv';
        
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
      } else {
        // Fallback to the original download functionality
        console.log('No transform ID found, using client-side download');
        if (window.downloadTransformedData && typeof window.downloadTransformedData === 'function') {
          window.downloadTransformedData();
        }
      }
    });
  }
  
  // Update the send to tool button
  if (sendToToolBtn) {
    sendToToolBtn.addEventListener('click', async function(event) {
      event.preventDefault();
      
      // Get the transform ID from the button's data attribute
      const transformId = sendToToolBtn.getAttribute('data-transform-id');
      
      // Get the selected tool
      const toolSelect = document.getElementById('tool-select');
      const selectedTool = toolSelect ? toolSelect.value : null;
      
      if (!selectedTool) {
        alert('Please select a tool to send the data to.');
        return;
      }
      
      // If we have a transform ID, use the API to send to tool
      if (transformId && window.DataFormatterAPI) {
        try {
          // Log the action
          if (window.appendLog && typeof window.appendLog === 'function') {
            window.appendLog(`Sending data to ${selectedTool}...`);
          }
          
          // Call the API to send to tool
          const result = await window.DataFormatterAPI.sendToTool(transformId, selectedTool);
          
          // If successful, redirect to the tool
          if (result.success && result.redirect) {
            window.location.href = result.redirect;
          } else {
            alert('Failed to send data to the selected tool.');
          }
        } catch (error) {
          console.error('Error sending to tool:', error);
          alert(`Error sending data to tool: ${error.message || 'Unknown error'}`);
        }
      } else {
        // Fallback to the original send functionality
        console.log('No transform ID found, using client-side send to tool');
        if (window.sendToTool && typeof window.sendToTool === 'function') {
          window.sendToTool();
        }
      }
    });
  }
});