/**
 * Emergency Mode Integration
 * This file provides integration with other components when in emergency mode
 */

console.log("Emergency data-formatter-integration.js loaded successfully");

// Set up emergency mode library
window.FireEMS = window.FireEMS || {};
window.FireEMS.EmergencyMode = {
  isActive: true,
  version: '1.0.0',
  
  // Function to download data
  downloadData: function(data, options) {
    options = options || {};
    const format = options.format || 'csv';
    const filename = options.filename || 'emergency-data-export';
    
    try {
      // Generate content based on format
      let content = '';
      let mimeType = '';
      let extension = '';
      
      if (format === 'csv' || format === 'CSV') {
        // Get headers from first row
        if (!data || data.length === 0) {
          console.error("No data to download");
          return false;
        }
        
        const headers = Object.keys(data[0]);
        content = headers.join(',') + '\n';
        
        // Add each row
        data.forEach(row => {
          const values = headers.map(header => {
            const value = row[header] !== undefined ? String(row[header]) : '';
            // Quote values with commas
            return value.includes(',') ? `"${value}"` : value;
          });
          content += values.join(',') + '\n';
        });
        
        mimeType = 'text/csv';
        extension = '.csv';
      } else if (format === 'json' || format === 'JSON') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = '.json';
      } else {
        console.error("Unsupported format:", format);
        return false;
      }
      
      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename + extension;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`Downloaded ${data.length} records as ${format}`);
      return true;
    } catch (error) {
      console.error("Download error:", error);
      return false;
    }
  },
  
  // Send data to another tool
  sendToTool: function(data, toolId, options) {
    console.log(`Sending ${data.length} records to ${toolId}`);
    options = options || {};
    
    try {
      // Create a unique key for the data
      const storageKey = 'emergency_data_' + Date.now();
      
      // Store in localStorage (with safety check for large data)
      const serialized = JSON.stringify(data);
      const sizeInMB = serialized.length / (1024*1024);
      
      if (sizeInMB > 5) {
        console.warn(`Data is large (${sizeInMB.toFixed(2)}MB). Using subset of first 500 records.`);
        const subset = data.slice(0, 500);
        localStorage.setItem(storageKey, JSON.stringify(subset));
        console.log(`Stored 500 of ${data.length} records in localStorage with key: ${storageKey}`);
      } else {
        localStorage.setItem(storageKey, serialized);
        console.log(`Stored ${data.length} records in localStorage with key: ${storageKey}`);
      }
      
      // Build URL to the target tool with the storage key
      const toolUrls = {
        'response-time': '/fire-ems-dashboard',
        'fire-ems-dashboard': '/fire-ems-dashboard',
        'isochrone': '/isochrone-map',
        'isochrone-map': '/isochrone-map',
        'call-density': '/call-density-heatmap',
        'call-density-heatmap': '/call-density-heatmap',
        'incident-logger': '/incident-logger',
        'coverage-gap': '/coverage-gap-finder',
        'station-overview': '/station-overview',
        'fire-map-pro': '/fire-map-pro'
      };
      
      const url = (toolUrls[toolId] || `/${toolId}`) + `?emergency_data=${storageKey}`;
      console.log(`Redirecting to: ${url}`);
      
      // Redirect to the target tool
      window.location.href = url;
      return true;
    } catch (error) {
      console.error("Error sending data to tool:", error);
      return false;
    }
  }
};

// Set flag to indicate we're loaded
window.dataFormatterLoaded = true;

console.log("Emergency integration complete - normal mode should resume on page refresh");