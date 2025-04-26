# Fixes for data-formatter.html

## 1. Add global createEmergencyMappingInterface function

Add this after the main script tag that loads the React application:

```javascript
// Create the emergency mapping interface function in the global scope
window.createEmergencyMappingInterface = function() {
  console.log("Creating emergency mapping interface");
  const container = document.getElementById('column-mapping-container');
  if (!container) {
    console.error("Mapping container not found");
    return;
  }
  
  // Don't recreate if already showing the emergency UI
  if (container.querySelector('.emergency-mapping-ui')) {
    console.log("Emergency mapping UI already exists");
    return;
  }
  
  // Check if we have columns in the formatter state
  if (!window.formatterState || !window.formatterState.sourceColumns || window.formatterState.sourceColumns.length === 0) {
    console.error("No columns available for mapping");
    container.innerHTML = `
      <div class="emergency-mapping-ui">
        <div class="error-message" style="padding: 20px; background-color: #f8d7da; border-radius: 5px; margin: 20px;">
          <h3>Error: No columns available</h3>
          <p>Please upload a valid data file first.</p>
        </div>
      </div>
    `;
    return;
  }
  
  // Create a basic mapping interface
  const selectedTool = document.getElementById('tool-selector').value;
  const sourceColumns = window.formatterState.sourceColumns;
  const sampleData = window.formatterState.sampleData || [];
  
  let mappingHtml = `
    <div class="emergency-mapping-ui" style="padding: 20px;">
      <h2>Field Mapping</h2>
      <p class="note" style="margin-bottom: 20px; color: #666;">Map source fields to target fields for the ${selectedTool} tool.</p>
      <form id="emergency-mapping-form">
        <table class="mapping-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Target Field</th>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Source Field</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  // Add mapping fields based on the selected tool
  const targetFields = getTargetFieldsForTool(selectedTool);
  
  targetFields.forEach(field => {
    mappingHtml += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${field.label || field}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">
          <select name="mapping_${field.id || field}" class="source-field-select" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            <option value="">-- Select Source Field --</option>
            ${sourceColumns.map(col => `<option value="${col}">${col}</option>`).join('')}
          </select>
        </td>
      </tr>
    `;
  });
  
  mappingHtml += `
          </tbody>
        </table>
        <div style="margin-top: 20px;">
          <button type="button" id="emergency-mapping-submit" class="primary-btn" style="padding: 10px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Apply Mappings
          </button>
          <button type="button" id="emergency-mapping-cancel" class="secondary-btn" style="padding: 10px 15px; background-color: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `;
  
  // Update the container
  container.innerHTML = mappingHtml;
  
  // Show the container
  container.style.display = 'block';
  
  // Handle mapping submission
  document.getElementById('emergency-mapping-submit').addEventListener('click', function() {
    const mappings = [];
    const selects = document.querySelectorAll('.source-field-select');
    
    selects.forEach(select => {
      const targetField = select.name.replace('mapping_', '');
      const sourceField = select.value;
      
      if (sourceField) {
        mappings.push({
          targetField: targetField,
          sourceField: sourceField
        });
      }
    });
    
    // Call the mapping complete handler
    if (typeof window.handleMappingComplete === 'function') {
      window.handleMappingComplete(mappings);
    } else {
      // Store mappings in formatterState
      window.formatterState.mappings = mappings;
      
      // Call transformData if available
      if (typeof window.transformData === 'function') {
        window.transformData(mappings);
      }
    }
    
    // Hide the mapping container
    hideFormatterPanels();
    showFormatterPanels('preview-container');
  });
  
  // Handle cancel button
  document.getElementById('emergency-mapping-cancel').addEventListener('click', function() {
    hideFormatterPanels();
    showFormatterPanels('upload-container');
  });
};

// Function to get target fields based on the selected tool
function getTargetFieldsForTool(toolName) {
  const commonFields = [
    { id: 'incident_id', label: 'Incident ID' },
    { id: 'incident_date', label: 'Incident Date' },
    { id: 'incident_time', label: 'Incident Time' }
  ];
  
  switch(toolName) {
    case 'response_time_analyzer':
      return [
        ...commonFields,
        { id: 'dispatch_time', label: 'Dispatch Time' },
        { id: 'arrival_time', label: 'Arrival Time' },
        { id: 'clear_time', label: 'Clear Time' }
      ];
    case 'call_density_heatmap':
      return [
        ...commonFields,
        { id: 'latitude', label: 'Latitude' },
        { id: 'longitude', label: 'Longitude' },
        { id: 'incident_type', label: 'Incident Type' }
      ];
    default:
      return commonFields;
  }
}
```

## 2. Fix the Map Fields Button Click Handler

Replace the existing initialization code for the React UI with this optimized version:

```javascript
// Initialize the React application when map fields button is clicked
document.addEventListener('DOMContentLoaded', function() {
  const mapFieldsBtn = document.getElementById('map-fields-btn');
  
  if (mapFieldsBtn && !mapFieldsBtn.getAttribute('data-react-handler-added')) {
    mapFieldsBtn.setAttribute('data-react-handler-added', 'true');
    
    // Replace all other click listeners with a single robust handler
    mapFieldsBtn.addEventListener('click', function() {
      // Clear previous event handlers for this button
      const clonedBtn = mapFieldsBtn.cloneNode(true);
      mapFieldsBtn.parentNode.replaceChild(clonedBtn, mapFieldsBtn);
      
      // Get reference to the replaced button
      const newMapFieldsBtn = document.getElementById('map-fields-btn');
      newMapFieldsBtn.setAttribute('data-react-handler-added', 'true');
      
      console.log("Map Fields button clicked - starting field mapping process");
      
      // Show the container immediately for better UX
      const container = document.getElementById('column-mapping-container');
      if (!container) {
        console.error("Column mapping container not found");
        return;
      }
      
      // Update UI - show mapping container and hide other panels
      container.style.display = 'block';
      document.querySelectorAll('.formatter-panel').forEach(panel => {
        panel.style.display = 'none';
      });
      
      // Add loading indicator while we check React availability
      container.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading field mapping interface...</p>
        </div>
      `;
      
      // Log the action
      if (window.appendLog && typeof window.appendLog === 'function') {
        window.appendLog('Opening field mapping interface. Map your source columns to target fields.');
      }
      
      // Check if we have the necessary data
      if (!window.formatterState || !window.formatterState.sourceColumns || window.formatterState.sourceColumns.length === 0) {
        console.error("No source columns available for mapping");
        window.createEmergencyMappingInterface();
        return;
      }
      
      console.log("Attempting to initialize React Data Formatter UI");
      
      // Get the selected tool
      const toolSelector = document.getElementById('tool-selector') || document.getElementById('target-tool');
      if (!toolSelector) {
        console.error("Tool selector not found");
        window.createEmergencyMappingInterface();
        return;
      }
      
      const selectedTool = toolSelector.value;
      if (!selectedTool) {
        console.error("No tool selected");
        window.createEmergencyMappingInterface();
        return;
      }
      
      console.log("Selected tool:", selectedTool);
      
      // Use setTimeout to ensure the DOM update happens before the heavy React initialization
      setTimeout(function() {
        try {
          // Check for React component availability
          if (!window.DataFormatterUI || typeof window.DataFormatterUI.mount !== 'function') {
            console.error("React Data Formatter UI component not found in window.DataFormatterUI");
            window.createEmergencyMappingInterface();
            return;
          }
          
          // Prepare data for React component
          const reactData = {
            sourceColumns: window.formatterState.sourceColumns,
            sampleData: window.formatterState.sampleData || [],
            selectedTool: selectedTool,
            fileId: window.formatterState.fileId
          };
          
          console.log("Mounting React Data Formatter UI with data:", reactData);
          
          // Empty the container to remove loading indicator
          container.innerHTML = '';
          
          // Mount the React component with a reference to our globally defined handler
          window.DataFormatterUI.mount(container, reactData, function(mappings, metadata) {
            console.log("Mapping complete callback received with", mappings.length, "mappings");
            
            // Use the global handler function if available
            if (typeof window.handleMappingComplete === 'function') {
              window.handleMappingComplete(mappings, metadata);
            } else {
              // Fallback handling if global function is not defined
              console.log("No global handleMappingComplete function found, using inline handler");
              
              // Store mappings in formatterState
              window.formatterState.mappings = mappings;
              
              // Store metadata if available
              if (metadata) {
                window.formatterState.processingMetadata = metadata;
              }
              
              // Call the transformData function if available
              if (typeof window.transformData === 'function') {
                window.transformData(mappings);
              } else {
                console.error("transformData function not available");
              }
            }
          });
          
          console.log("React Data Formatter UI mounted successfully");
          
          // Update the Map Fields button to allow it to close the mapping interface
          newMapFieldsBtn.addEventListener('click', function() {
            // This handler is for after React is mounted
            console.log("Map Fields button clicked again - closing mapping interface");
            window.DataFormatterUI.unmount(container);
            container.style.display = 'none';
            document.querySelectorAll('.formatter-panel').forEach(panel => {
              if (panel.id === 'upload-container') {
                panel.style.display = 'block';
              }
            });
          });
          
        } catch (error) {
          console.error("Error mounting React Data Formatter UI:", error);
          window.createEmergencyMappingInterface();
        }
      }, 100); // Short timeout to let the DOM update
    });
  }
});
```

## 3. Add Health Check Code

Add this status checking code to help with debugging:

```javascript
// Initialize health checks for the data formatter
window.addEventListener('load', function() {
  console.log("Running data formatter health checks...");
  
  // Check if formatterState is initialized
  if (!window.formatterState) {
    window.formatterState = {
      mappings: [],
      sourceColumns: [],
      targetFields: [],
      sampleData: []
    };
    console.log("Initialized window.formatterState with default values");
  }
  
  // Check for React component
  if (!window.DataFormatterUI) {
    console.warn("React Data Formatter UI not loaded. Emergency fallback will be used.");
  }
});
```

## Implementation Instructions

1. In data-formatter.html, right after the script tag that loads the React component:
   ```html
   <script type="text/javascript" src="{{ url_for('static_handler.serve_static', filename=asset_url('data-formatter.js', 'react-data-formatter')) }}"></script>
   ```

2. Add the global `createEmergencyMappingInterface` function from section 1.

3. Find and replace the existing React initialization code that starts with:
   ```javascript
   // Initialize the React application when map fields button is clicked
   document.addEventListener('DOMContentLoaded', function() {
     const mapFieldsBtn = document.getElementById('map-fields-btn');
   ```

4. If there's an existing "Emergency fallback for column mapping" section with its own script tag, replace that with the health check code from section 3.