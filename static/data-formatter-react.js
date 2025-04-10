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
    loadScript('https://unpkg.com/react@17/umd/react.production.min.js', function() {
      // Load ReactDOM
      loadScript('https://unpkg.com/react-dom@17/umd/react-dom.production.min.js', function() {
        // Load Material UI
        loadScript('https://unpkg.com/@material-ui/core@4.12.3/umd/material-ui.production.min.js', function() {
          // Load React Beautiful DnD
          loadScript('https://unpkg.com/react-beautiful-dnd@13.1.0/dist/react-beautiful-dnd.min.js', function() {
            // Load Babel for JSX support
            loadScript('https://unpkg.com/@babel/standalone/babel.min.js', callback);
          });
        });
      });
    });
  }
  
  // Load CSS for Material UI
  function loadStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap';
    document.head.appendChild(link);
    
    const iconLink = document.createElement('link');
    iconLink.rel = 'stylesheet';
    iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(iconLink);
  }
  
  // Initialize the React component
  function initReactComponent() {
    // Get data from the main data formatter script
    const sourceColumns = getSourceColumns();
    const sampleData = getSampleData();
    const fileId = window.uploadedFileId || null;
    
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
    
    // Check if we have an API result
    if (apiResult && apiResult.success && apiResult.transformId) {
      console.log('API Transform successful:', apiResult);
      
      // Store the transform ID for later use
      window.transformId = apiResult.transformId;
      
      // If we have sample data in the API result, use it
      if (apiResult.sampleData && Array.isArray(apiResult.sampleData)) {
        window.transformedData = apiResult.sampleData;
        
        // Show output preview
        if (window.showOutputPreview && typeof window.showOutputPreview === 'function') {
          window.showOutputPreview(apiResult.sampleData);
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
        if (apiResult.logs && apiResult.logs.length > 0) {
          apiResult.logs.forEach(log => {
            window.appendLog(log);
          });
        } else {
          window.appendLog(`Mapping completed successfully. Transform ID: ${apiResult.transformId}`);
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
        
        // Log the completion
        if (window.appendLog && typeof window.appendLog === 'function') {
          window.appendLog(`Mapping completed successfully. ${transformedData.length} records transformed.`);
        }
      } else {
        console.log('Transform function not available in the main script.');
        alert('Data formatted successfully! You can now download or send the transformed data.');
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
    // Create script tag for the component
    const script = document.createElement('script');
    script.src = '/static/js/components/ColumnMappingUI.jsx';
    script.type = 'text/babel';
    script.async = true;
    
    // Handle load event
    script.onload = function() {
      console.log('ColumnMappingUI component loaded');
      
      // Compile JSX with Babel
      try {
        const transformedCode = Babel.transform(script.textContent, {
          presets: ['react'],
          filename: 'ColumnMappingUI.jsx'
        }).code;
        
        // Create a new script element with the transformed code
        const compiledScript = document.createElement('script');
        compiledScript.textContent = transformedCode;
        document.head.appendChild(compiledScript);
        
        // Set a timeout to allow the component to be registered
        setTimeout(function() {
          if (window.ColumnMappingUI) {
            initReactComponent();
          } else {
            console.error('ColumnMappingUI component not found after compilation');
          }
        }, 100);
      } catch (error) {
        console.error('Error compiling JSX:', error);
      }
    };
    
    // Handle error event
    script.onerror = function() {
      console.error('Failed to load ColumnMappingUI component');
      
      // Show error message in the container
      columnMappingContainer.innerHTML = `
        <div class="error-container">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #f44336; margin-bottom: 15px;"></i>
          <p style="margin-bottom: 20px; color: #666; text-align: center;">
            Failed to load the column mapping component. Please refresh the page and try again.
          </p>
          <button onclick="location.reload()" class="primary-btn">
            Refresh Page
          </button>
        </div>
      `;
    };
    
    // Add the script to the document
    document.head.appendChild(script);
  }
  
  // Main initialization function
  function init() {
    loadStyles();
    loadReactDependencies(function() {
      console.log('React dependencies loaded');
      loadComponentScript();
    });
  }
  
  // Start initialization
  init();
});