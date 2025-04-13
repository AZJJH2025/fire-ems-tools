/**
 * FireEMS.ai - Call Density Heatmap Integration with DataStandardizer and DataDisplayComponents
 * 
 * This integration layer connects the Call Density Heatmap tool with the DataStandardizer
 * and DataDisplayComponents to provide better data handling, standardized field names,
 * enhanced filtering, and improved exports.
 * 
 * Key features:
 * - Standardized field names for location data
 * - Enhanced filtering capabilities
 * - Improved data exports with standardized formats
 * - Better handling of different coordinate formats
 * - Integration with the existing emergency mode fallbacks
 */

// Create or use existing namespace
window.FireEMS = window.FireEMS || {};
window.FireEMS.Integration = window.FireEMS.Integration || {};

/**
 * Call Density Heatmap Integration
 */
FireEMS.Integration.CallDensityHeatmap = (function() {
  // Dependencies
  const DataStandardizer = window.FireEMS.Utils && window.FireEMS.Utils.DataStandardizer;
  const DataTable = window.FireEMS.Components && window.FireEMS.Components.DataTable;
  const SearchFilter = window.FireEMS.Components && window.FireEMS.Components.SearchFilter;
  const DataExporter = window.FireEMS.Components && window.FireEMS.Components.DataExporter;
  
  // Check if we need emergency mode
  const componentsAvailable = 
    DataStandardizer && 
    DataTable && 
    SearchFilter && 
    DataExporter;
  
  // Original functions we may need to patch
  let originalProcessLocationData = null;
  let originalDisplayMarkers = null;
  let originalUpdateHotspotAnalysis = null;
  let originalGetCoordinates = null;
  
  // State for data tracking
  const state = {
    originalData: [],
    standardizedData: [],
    dataTable: null,
    searchFilter: null,
    exportButton: null
  };
  
  /**
   * Initialize integration when the page is loaded
   */
  function initialize() {
    console.log("🔄 Call Density Heatmap Integration initializing...");
    
    // Check if components are available
    if (!componentsAvailable) {
      console.warn("🔶 Data Components not available, using fallback mode");
      return false;
    }
    
    // Wait for page load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeIntegration);
    } else {
      initializeIntegration();
    }
    
    return true;
  }
  
  /**
   * Main integration initialization
   */
  function initializeIntegration() {
    try {
      // Add new UI elements
      addDataTableContainer();
      
      // Patch original functions to use standardized data
      patchOriginalFunctions();
      
      // Hook into data loading events
      setupDataLoadingHooks();
      
      // Hook into filter controls
      setupFilterHooks();
      
      // Track when standardizer has been used
      window.FireEMS.standardizerUsed = true;
      
      console.log("✅ Call Density Heatmap Integration initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Call Density Heatmap Integration:", error);
      // Revert any patches if initialization failed
      unpatchFunctions();
    }
  }
  
  /**
   * Add container for DataTable to the page
   */
  function addDataTableContainer() {
    // Create container for data table
    const tableContainer = document.createElement('div');
    tableContainer.id = 'call-data-table-container';
    tableContainer.className = 'data-table-container';
    tableContainer.style.cssText = 'margin-top: 20px; display: none;';
    
    // Create toggle button for the table view
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-data-table';
    toggleButton.className = 'secondary-button';
    toggleButton.innerHTML = '<i class="fas fa-table"></i> Show Data Table';
    toggleButton.style.marginTop = '10px';
    
    // Add click handler
    toggleButton.addEventListener('click', function() {
      const container = document.getElementById('call-data-table-container');
      const isHidden = container.style.display === 'none';
      
      container.style.display = isHidden ? 'block' : 'none';
      this.innerHTML = isHidden ? 
        '<i class="fas fa-map"></i> Show Map View' : 
        '<i class="fas fa-table"></i> Show Data Table';
      
      // Initialize table if first time showing
      if (isHidden && state.originalData.length > 0 && !state.dataTable) {
        createDataTable();
      }
    });
    
    // Find the export section to insert our controls after it
    const exportSection = document.querySelector('.export-section');
    if (exportSection) {
      exportSection.appendChild(toggleButton);
      exportSection.parentNode.insertBefore(tableContainer, exportSection.nextSibling);
    } else {
      // Fallback: add to analysis section
      const analysisSection = document.querySelector('.analysis-section');
      if (analysisSection) {
        analysisSection.appendChild(toggleButton);
        analysisSection.parentNode.insertBefore(tableContainer, analysisSection.nextSibling);
      }
    }
  }
  
  /**
   * Create DataTable for viewing the call data
   */
  function createDataTable() {
    if (!state.standardizedData || state.standardizedData.length === 0) return;
    
    const container = document.getElementById('call-data-table-container');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Add description
    const description = document.createElement('div');
    description.className = 'data-table-description';
    description.innerHTML = `
      <h3>Call Data Table</h3>
      <p>This table shows the standardized call data. You can sort by clicking column headers and filter using the search box.</p>
    `;
    container.appendChild(description);
    
    // Create search filter container
    const filterContainer = document.createElement('div');
    filterContainer.id = 'call-data-filter-container';
    container.appendChild(filterContainer);
    
    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.id = 'call-data-table';
    container.appendChild(tableContainer);
    
    // Create export container
    const exportContainer = document.createElement('div');
    exportContainer.id = 'call-data-export-container';
    exportContainer.style.textAlign = 'right';
    exportContainer.style.marginTop = '10px';
    container.appendChild(exportContainer);
    
    // Initialize search filter
    state.searchFilter = SearchFilter.create('call-data-filter-container', {
      fields: ['Incident Type', 'Latitude', 'Longitude', 'Incident Date', 'Incident Time'],
      onFilterChange: handleFilterChange,
      placeholderText: 'Search call data...'
    });
    
    // Initialize data table
    state.dataTable = DataTable.create('call-data-table', state.standardizedData, {
      pageSize: 25,
      visibleColumns: ['Incident ID', 'Incident Type', 'Latitude', 'Longitude', 'Incident Date', 'Incident Time', 'Address'],
      columnLabels: {
        'Incident ID': 'ID',
        'Incident Type': 'Type',
        'Incident Date': 'Date',
        'Incident Time': 'Time'
      },
      columnTypes: {
        'Latitude': 'coordinate',
        'Longitude': 'coordinate',
        'Incident Date': 'date',
        'Incident Time': 'time'
      },
      initialSortColumn: 'Incident Date',
      initialSortDirection: 'desc',
      showSearch: false,
      exportFilename: 'call-density-data',
      onRowClick: function(row) {
        // Center map on clicked location
        if (window.map && row.Latitude && row.Longitude) {
          window.map.setView([row.Latitude, row.Longitude], 15);
          
          // Create a temporary marker to highlight the location
          const tempMarker = L.marker([row.Latitude, row.Longitude], {
            icon: L.divIcon({
              className: 'call-density-marker highlight-marker',
              html: '<div style="background-color:#ff4081; width:25px; height:25px; border-radius:50%; display:flex; justify-content:center; align-items:center; color:white; font-weight:bold; border: 2px solid white; animation: pulse 1.5s infinite;"></div>',
              iconSize: [25, 25],
              iconAnchor: [12, 12]
            })
          });
          
          // Add marker with popup
          tempMarker.addTo(window.map);
          tempMarker.bindPopup(`
            <div style="min-width: 200px; max-width: 300px;">
              <h4 style="margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                Selected Call Location
              </h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 4px; font-weight: bold; width: 40%;">ID:</td>
                  <td style="padding: 6px 4px;">${row['Incident ID'] || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 4px; font-weight: bold;">Type:</td>
                  <td style="padding: 6px 4px;">${row['Incident Type'] || 'Unknown'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 4px; font-weight: bold;">Location:</td>
                  <td style="padding: 6px 4px;">${row.Latitude.toFixed(6)}, ${row.Longitude.toFixed(6)}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 4px; font-weight: bold;">Date/Time:</td>
                  <td style="padding: 6px 4px;">${row['Incident Date'] || ''} ${row['Incident Time'] || ''}</td>
                </tr>
              </table>
            </div>
          `).openPopup();
          
          // Remove after a delay
          setTimeout(() => {
            window.map.removeLayer(tempMarker);
          }, 5000);
        }
      }
    });
    
    // Initialize export button using DataExporter
    state.exportButton = DataExporter.createExportButton('call-data-export-container', 
      () => state.dataTable.getData().filtered, {
        buttonText: 'Export Filtered Data',
        filename: 'call-density-data',
        exportOptions: {
          columns: ['Incident ID', 'Incident Type', 'Latitude', 'Longitude', 'Incident Date', 'Incident Time', 'Address'],
          columnLabels: {
            'Incident ID': 'ID',
            'Incident Type': 'Type',
            'Incident Date': 'Date',
            'Incident Time': 'Time'
          }
        }
      });
      
    // Also create JSON export button
    const jsonExportButton = document.createElement('button');
    jsonExportButton.className = 'secondary-button';
    jsonExportButton.innerHTML = 'Export as GeoJSON';
    jsonExportButton.style.marginLeft = '10px';
    jsonExportButton.addEventListener('click', exportGeoJSON);
    exportContainer.appendChild(jsonExportButton);
  }
  
  /**
   * Handle filter changes from the search filter
   */
  function handleFilterChange(filterState) {
    if (!state.dataTable) return;
    
    // Apply search term
    state.dataTable.search(filterState.searchTerm);
    
    // Apply filters for specific fields
    // This would be extended with more specific filters if needed
  }
  
  /**
   * Standardize data using DataStandardizer
   * @param {Array} data - Raw data to standardize
   * @returns {Array} - Standardized data
   */
  function standardizeData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    if (!DataStandardizer) return data;
    
    try {
      // Apply DataStandardizer to the input data
      const standardized = DataStandardizer.standardize(data, true);
      
      // Add derivations for any missing fields
      return standardized.map(item => {
        const result = { ...item };
        
        // Make sure Incident Type is set
        if (!result['Incident Type']) {
          result['Incident Type'] = result.type || result.call_type || result.incident_type || 'Unknown';
        }
        
        // Make sure coordinates are standardized
        if (!result['Latitude'] && !result['Longitude']) {
          const coords = getStandardizedCoordinates(item);
          if (coords) {
            result['Latitude'] = coords.lat;
            result['Longitude'] = coords.lng;
          }
        }
        
        // Ensure there's an Incident ID
        if (!result['Incident ID']) {
          result['Incident ID'] = result.id || result.incident_id || result.call_id || 
            `CALL-${Math.floor(Math.random() * 10000)}`;
        }
        
        return result;
      });
    } catch (error) {
      console.error("Error standardizing data:", error);
      return data;
    }
  }
  
  /**
   * Get standardized coordinates from a data item
   * @param {Object} item - Data item
   * @returns {Object|null} - Object with lat and lng or null
   */
  function getStandardizedCoordinates(item) {
    if (!item) return null;
    
    // Try to extract coordinates using DataStandardizer if available
    if (DataStandardizer && typeof DataStandardizer.getCoordinates === 'function') {
      const coords = DataStandardizer.getCoordinates(item);
      if (coords) return coords;
    }
    
    // Our own implementation for coordinates extraction
    let lat = null;
    let lng = null;
    
    // Try standard field names first
    if (item.latitude !== undefined) {
      lat = parseFloat(item.latitude);
    } else if (item.lat !== undefined) {
      lat = parseFloat(item.lat);
    } else if (item.y !== undefined) {
      lat = parseFloat(item.y);
    }
    
    if (item.longitude !== undefined) {
      lng = parseFloat(item.longitude);
    } else if (item.lng !== undefined) {
      lng = parseFloat(item.lng);
    } else if (item.long !== undefined) {
      lng = parseFloat(item.long);
    } else if (item.x !== undefined) {
      lng = parseFloat(item.x);
    }
    
    // If either coordinate is missing, try to extract from a combined field
    if ((lat === null || isNaN(lat) || !isFinite(lat)) || 
        (lng === null || isNaN(lng) || !isFinite(lng))) {
      
      // Try combined coordinates field
      if (typeof item.coordinates === 'string') {
        const coordParts = item.coordinates.split(/[,\s]+/);
        if (coordParts.length === 2) {
          lat = parseFloat(coordParts[0]);
          lng = parseFloat(coordParts[1]);
        }
      }
      
      // Try GeoJSON format
      if (item.geometry && item.geometry.coordinates && Array.isArray(item.geometry.coordinates)) {
        // GeoJSON is [longitude, latitude]
        if (item.geometry.coordinates.length >= 2) {
          lng = parseFloat(item.geometry.coordinates[0]);
          lat = parseFloat(item.geometry.coordinates[1]);
        }
      }
    }
    
    // Return coordinates if they are valid
    if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
    
    return null;
  }
  
  /**
   * Export data as GeoJSON format
   */
  function exportGeoJSON() {
    if (!state.dataTable) return;
    
    const data = state.dataTable.getData().filtered;
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }
    
    try {
      // Create GeoJSON structure
      const geojson = {
        type: 'FeatureCollection',
        features: data.map(item => {
          // Get coordinates
          const lat = parseFloat(item.Latitude || item.latitude || item.lat);
          const lng = parseFloat(item.Longitude || item.longitude || item.lng);
          
          // Skip invalid coordinates
          if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
            return null;
          }
          
          // Create GeoJSON feature
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lng, lat] // GeoJSON uses [longitude, latitude] order
            },
            properties: {
              id: item['Incident ID'] || item.id || '',
              type: item['Incident Type'] || item.type || 'Unknown',
              date: item['Incident Date'] || '',
              time: item['Incident Time'] || '',
              address: item.Address || item.address || ''
            }
          };
        }).filter(Boolean) // Remove any null features
      };
      
      // Create download link
      const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'call-density-data.geojson';
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting GeoJSON:', error);
      alert('Failed to export GeoJSON data');
    }
  }
  
  /**
   * Patch original functions to use standardized data
   */
  function patchOriginalFunctions() {
    try {
      // Store references to original functions
      if (window.processLocationData && typeof window.processLocationData === 'function') {
        originalProcessLocationData = window.processLocationData;
        window.processLocationData = patchedProcessLocationData;
      }
      
      if (window.displayMarkers && typeof window.displayMarkers === 'function') {
        originalDisplayMarkers = window.displayMarkers;
        window.displayMarkers = patchedDisplayMarkers;
      }
      
      if (window.updateHotspotAnalysis && typeof window.updateHotspotAnalysis === 'function') {
        originalUpdateHotspotAnalysis = window.updateHotspotAnalysis;
        window.updateHotspotAnalysis = patchedUpdateHotspotAnalysis;
      }
      
      if (window.getCoordinates && typeof window.getCoordinates === 'function') {
        originalGetCoordinates = window.getCoordinates;
      }
      
      console.log("🔄 Original functions patched successfully");
    } catch (error) {
      console.error("❌ Error patching original functions:", error);
    }
  }
  
  /**
   * Patched version of processLocationData
   */
  function patchedProcessLocationData(data) {
    if (!data || !Array.isArray(data)) {
      return originalProcessLocationData ? originalProcessLocationData(data) : {};
    }
    
    try {
      // Standardize the data first
      state.originalData = data;
      state.standardizedData = standardizeData(data);
      
      // Initialize data table if container is visible
      const container = document.getElementById('call-data-table-container');
      if (container && container.style.display !== 'none' && !state.dataTable) {
        createDataTable();
      }
      
      // Call original function with standardized data
      return originalProcessLocationData ? 
        originalProcessLocationData(state.standardizedData) : 
        fallbackProcessLocationData(state.standardizedData);
    } catch (error) {
      console.error("Error in patched processLocationData:", error);
      return originalProcessLocationData ? originalProcessLocationData(data) : {};
    }
  }
  
  /**
   * Fallback implementation of processLocationData
   */
  function fallbackProcessLocationData(data) {
    const locationCounts = {};
    let validCount = 0;
    let invalidCount = 0;
    
    for (const point of data) {
      // Try to get coordinates
      const coords = getStandardizedCoordinates(point);
      if (!coords) {
        invalidCount++;
        continue;
      }
      
      validCount++;
      
      // Round coordinates to 4 decimal places for grouping nearby points
      const roundedLat = Math.round(coords.lat * 10000) / 10000;
      const roundedLng = Math.round(coords.lng * 10000) / 10000;
      const locationKey = `${roundedLat},${roundedLng}`;
      
      // Count occurrences at this location
      if (locationCounts[locationKey]) {
        locationCounts[locationKey].count++;
        // Track call types if available
        const type = point['Incident Type'] || point.type || '';
        if (type && type !== '') {
          locationCounts[locationKey].types[type] = 
            (locationCounts[locationKey].types[type] || 0) + 1;
        }
        // Track time periods if available
        if (point.hour !== undefined) {
          const hour = parseInt(point.hour);
          if (!isNaN(hour)) {
            locationCounts[locationKey].hours[hour] = 
              (locationCounts[locationKey].hours[hour] || 0) + 1;
          }
        }
      } else {
        locationCounts[locationKey] = {
          lat: coords.lat,
          lng: coords.lng,
          count: 1,
          types: {},
          hours: {}
        };
        // Initialize with first point's data
        const type = point['Incident Type'] || point.type || '';
        if (type && type !== '') {
          locationCounts[locationKey].types[type] = 1;
        }
        if (point.hour !== undefined) {
          const hour = parseInt(point.hour);
          if (!isNaN(hour)) {
            locationCounts[locationKey].hours[hour] = 1;
          }
        }
      }
    }
    
    console.log(`Processed ${data.length} points: ${validCount} valid, ${invalidCount} invalid`);
    
    return locationCounts;
  }
  
  /**
   * Patched version of displayMarkers
   */
  function patchedDisplayMarkers(data) {
    if (!data || !Array.isArray(data)) {
      return originalDisplayMarkers ? originalDisplayMarkers(data) : null;
    }
    
    try {
      // Try to standardize the data if it wasn't already
      if (data !== state.standardizedData) {
        state.standardizedData = standardizeData(data);
      }
      
      // Call original function with standardized data
      return originalDisplayMarkers ? 
        originalDisplayMarkers(state.standardizedData) : 
        null;
    } catch (error) {
      console.error("Error in patched displayMarkers:", error);
      return originalDisplayMarkers ? originalDisplayMarkers(data) : null;
    }
  }
  
  /**
   * Patched version of updateHotspotAnalysis
   */
  function patchedUpdateHotspotAnalysis(data) {
    if (!data || !Array.isArray(data)) {
      return originalUpdateHotspotAnalysis ? originalUpdateHotspotAnalysis(data) : null;
    }
    
    try {
      // Try to standardize the data if it wasn't already
      if (data !== state.standardizedData) {
        state.standardizedData = standardizeData(data);
      }
      
      // Call original function with standardized data
      return originalUpdateHotspotAnalysis ? 
        originalUpdateHotspotAnalysis(state.standardizedData) : 
        null;
    } catch (error) {
      console.error("Error in patched updateHotspotAnalysis:", error);
      return originalUpdateHotspotAnalysis ? originalUpdateHotspotAnalysis(data) : null;
    }
  }
  
  /**
   * Unpatch functions to restore original behavior
   */
  function unpatchFunctions() {
    if (originalProcessLocationData) window.processLocationData = originalProcessLocationData;
    if (originalDisplayMarkers) window.displayMarkers = originalDisplayMarkers;
    if (originalUpdateHotspotAnalysis) window.updateHotspotAnalysis = originalUpdateHotspotAnalysis;
    console.log("🔄 Original functions restored");
  }
  
  /**
   * Setup hooks into data loading events
   */
  function setupDataLoadingHooks() {
    // Hook into the form submission
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
      const originalSubmitHandler = uploadForm.onsubmit;
      uploadForm.addEventListener('submit', function(e) {
        console.log("🔄 Upload form submitted, integration active");
      });
    }
    
    // Hook into session storage check for Data Formatter
    const originalCheckForFormatterData = window.checkForFormatterData;
    if (typeof originalCheckForFormatterData === 'function') {
      window.checkForFormatterData = function() {
        console.log("🔄 Checking for formatter data with integration active");
        const result = originalCheckForFormatterData.apply(this, arguments);
        return result;
      };
    }
  }
  
  /**
   * Setup hooks into filter controls
   */
  function setupFilterHooks() {
    // Hook into Apply Filters button
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
      const originalClickHandler = applyFiltersBtn.onclick;
      applyFiltersBtn.addEventListener('click', function() {
        console.log("🔄 Filters applied, updating standardized data");
        
        // Wait for original handler to process filters
        setTimeout(() => {
          // Update data table if it exists and is visible
          if (state.dataTable && 
              document.getElementById('call-data-table-container').style.display !== 'none') {
            // Get current filter state
            const callTypeFilter = document.getElementById('call-type-filter').value;
            const timeFilter = document.getElementById('time-filter').value;
            
            // Apply corresponding filters to data table
            if (callTypeFilter !== 'all') {
              state.searchFilter.setFilter('Incident Type', callTypeFilter);
            }
            
            // Let the data table know filter state has changed
            state.searchFilter.reset();
          }
        }, 100);
      });
    }
  }
  
  // Public API
  return {
    initialize,
    standardizeData,
    exportGeoJSON,
    state
  };
})();

// Auto-initialize the integration when loaded
FireEMS.Integration.CallDensityHeatmap.initialize();